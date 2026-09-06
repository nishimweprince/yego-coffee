"use server";

import { revalidatePath } from "next/cache";
import { customerRequest } from "@/lib/customer/client";
import {
  ADDRESS_CREATE_MUTATION,
  ADDRESS_DELETE_MUTATION,
  ADDRESS_UPDATE_MUTATION,
  PROFILE_UPDATE_MUTATION,
} from "@/lib/customer/queries";
import { readTokens } from "@/lib/customer/session";
import {
  AddressSchema,
  ProfileSchema,
  ShopifyIdSchema,
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
