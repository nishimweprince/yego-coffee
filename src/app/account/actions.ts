"use server";

import { revalidatePath } from "next/cache";
import { customerRequest } from "@/lib/customer/client";
import {
  ADDRESS_CREATE_MUTATION,
  ADDRESS_DELETE_MUTATION,
  ADDRESS_UPDATE_MUTATION,
  BILLING_CYCLE_SKIP_MUTATION,
  BILLING_CYCLE_UNSKIP_MUTATION,
  PROFILE_UPDATE_MUTATION,
  SUBSCRIPTION_ACTIVATE_MUTATION,
  SUBSCRIPTION_CANCEL_MUTATION,
  SUBSCRIPTION_PAUSE_MUTATION,
} from "@/lib/customer/queries";
import { readTokens } from "@/lib/customer/session";
import {
  AddressSchema,
  BillingCycleSchema,
  ProfileSchema,
  ShopifyIdSchema,
  SubscriptionContractIdSchema,
} from "@/lib/customer/validation";

/**
 * Account mutations (plan.md §11.7, §24).
 *
 * §11.7's requirements, and where each is met:
 *
 *   authenticated customer   `readTokens()` here, and the API rejects
 *                            an absent or expired token besides
 *   server-side authorization  every action re-checks the session; a
 *                            form post is not evidence of one
 *   validated ownership      no action takes a customer id, and the
 *                            only id accepted — an address — is
 *                            shape-checked and then handed to an API
 *                            scoped to this customer's own addresses
 *   confirmation on destructive actions   the delete form asks first
 *   optimistic UI only when rollback is safe   there is none here; an
 *                            address that appears saved and was not is
 *                            worse than a half-second wait
 *   clear success/error states   returned, not thrown
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const SIGNED_OUT: ActionResult = {
  ok: false,
  message: "Your session has expired. Please sign in again.",
};

async function requireSession(): Promise<boolean> {
  return (await readTokens()) !== null;
}

/** Shopify returns userErrors alongside the payload; surface them. */
function userErrorsOf(payload: unknown, key: string): ActionResult | null {
  const root = (payload as Record<string, unknown> | null)?.[key] as
    | { userErrors?: Array<{ field?: string[] | null; message: string }> }
    | undefined;

  const errors = root?.userErrors ?? [];
  if (errors.length === 0) return null;

  const fieldErrors: Record<string, string> = {};
  for (const error of errors) {
    const field = error.field?.at(-1);
    if (field) fieldErrors[field] = error.message;
  }

  return {
    ok: false,
    message: errors[0].message,
    ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
  };
}

function failed(error: unknown): ActionResult {
  console.error(error);
  return {
    ok: false,
    message: "We couldn't save that. Please try again.",
  };
}

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: "CustomerUpdate",
      query: PROFILE_UPDATE_MUTATION,
      variables: { input: parsed.data },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, "customerUpdate");
    if (userError) return userError;

    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function createAddressAction(
  input: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const parsed = AddressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid address",
    };
  }

  const { setAsDefault, ...address } = parsed.data;

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: "CustomerAddressCreate",
      query: ADDRESS_CREATE_MUTATION,
      variables: { address, defaultAddress: Boolean(setAsDefault) },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, "customerAddressCreate");
    if (userError) return userError;

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function updateAddressAction(
  addressId: unknown,
  input: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const id = ShopifyIdSchema.safeParse(addressId);
  const parsed = AddressSchema.safeParse(input);
  if (!id.success || !parsed.success) {
    return {
      ok: false,
      message: parsed.success
        ? "That address could not be identified."
        : (parsed.error.issues[0]?.message ?? "Invalid address"),
    };
  }

  const { setAsDefault, ...address } = parsed.data;

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: "CustomerAddressUpdate",
      query: ADDRESS_UPDATE_MUTATION,
      variables: {
        addressId: id.data,
        address,
        defaultAddress: Boolean(setAsDefault),
      },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, "customerAddressUpdate");
    if (userError) return userError;

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function deleteAddressAction(
  addressId: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const id = ShopifyIdSchema.safeParse(addressId);
  if (!id.success) {
    return { ok: false, message: "That address could not be identified." };
  }

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: "CustomerAddressDelete",
      query: ADDRESS_DELETE_MUTATION,
      variables: { addressId: id.data },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, "customerAddressDelete");
    if (userError) return userError;

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

/*
 * Subscription changes (§111).
 *
 * The same rules as above, plus one: nothing is reported as done until
 * Shopify returns the changed record. A pause that appeared to work and
 * did not is the outcome §104.6 was right to fear, so a payload without
 * the contract (or cycle) is treated as a failure, not a success.
 */

const SUBSCRIPTION_FAILED: ActionResult = {
  ok: false,
  message:
    "We couldn't change your subscription just now. Nothing has changed. " +
    "Please try again, or email francois@yegocoffee.com and we'll do it for you.",
};

type ContractMutation = {
  operation: string;
  query: string;
  key: string;
};

const PAUSE: ContractMutation = {
  operation: "SubscriptionContractPause",
  query: SUBSCRIPTION_PAUSE_MUTATION,
  key: "subscriptionContractPause",
};
const RESUME: ContractMutation = {
  operation: "SubscriptionContractActivate",
  query: SUBSCRIPTION_ACTIVATE_MUTATION,
  key: "subscriptionContractActivate",
};
const CANCEL: ContractMutation = {
  operation: "SubscriptionContractCancel",
  query: SUBSCRIPTION_CANCEL_MUTATION,
  key: "subscriptionContractCancel",
};

function refreshAccount() {
  // The overview, the list and the detail page all show contract state.
  revalidatePath("/account", "layout");
}

async function changeContract(
  mutation: ContractMutation,
  contractId: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const id = SubscriptionContractIdSchema.safeParse(contractId);
  if (!id.success) {
    return { ok: false, message: "That subscription could not be identified." };
  }

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: mutation.operation,
      query: mutation.query,
      variables: { subscriptionContractId: id.data },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, mutation.key);
    if (userError) return userError;

    const payload = data[mutation.key] as { contract?: unknown } | undefined;
    if (!payload?.contract) return SUBSCRIPTION_FAILED;

    refreshAccount();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return SUBSCRIPTION_FAILED;
  }
}

export async function pauseSubscriptionAction(
  contractId: unknown,
): Promise<ActionResult> {
  return changeContract(PAUSE, contractId);
}

export async function resumeSubscriptionAction(
  contractId: unknown,
): Promise<ActionResult> {
  return changeContract(RESUME, contractId);
}

/** The page asks for confirmation before calling this (§11.7). */
export async function cancelSubscriptionAction(
  contractId: unknown,
): Promise<ActionResult> {
  return changeContract(CANCEL, contractId);
}

async function changeCycle(
  skip: boolean,
  input: unknown,
): Promise<ActionResult> {
  if (!(await requireSession())) return SIGNED_OUT;

  const parsed = BillingCycleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "That delivery could not be identified." };
  }

  const key = skip ? "subscriptionBillingCycleSkip" : "subscriptionBillingCycleUnskip";

  try {
    const data = await customerRequest<Record<string, unknown>>({
      operation: skip ? "SubscriptionBillingCycleSkip" : "SubscriptionBillingCycleUnskip",
      query: skip ? BILLING_CYCLE_SKIP_MUTATION : BILLING_CYCLE_UNSKIP_MUTATION,
      variables: {
        billingCycleInput: {
          contractId: parsed.data.contractId,
          selector: { index: parsed.data.cycleIndex },
        },
      },
    });
    if (!data) return SIGNED_OUT;

    const userError = userErrorsOf(data, key);
    if (userError) return userError;

    const cycle = (data[key] as { billingCycle?: { skipped?: unknown } } | undefined)
      ?.billingCycle;
    if (!cycle || cycle.skipped !== skip) return SUBSCRIPTION_FAILED;

    refreshAccount();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return SUBSCRIPTION_FAILED;
  }
}

export async function skipDeliveryAction(input: unknown): Promise<ActionResult> {
  return changeCycle(true, input);
}

export async function unskipDeliveryAction(input: unknown): Promise<ActionResult> {
  return changeCycle(false, input);
}
