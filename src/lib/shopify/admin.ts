import "server-only";

import { getNewsletterEnv } from "@/lib/env";
import { clearAdminToken, getAdminToken } from "./admin-token";
import { ShopifyGraphQLError, ShopifyRequestError } from "./errors";
import type {
  ApiAdminUserError,
  ApiNewsletterConsentUpdate,
  ApiNewsletterCustomerByEmail,
  ApiNewsletterCustomerCreate,
} from "./types.api";

/**
 * The Shopify Admin API, for one job: newsletter signups.
 *
 * The Storefront API's `customerEmailMarketingSubscribe` exists only in
 * the unstable version, so signups go through the Admin API instead —
 * a customer marked subscribed to email marketing, whom the owners
 * reach with Shopify Messaging (10,000 emails a month free). Server
 * only: the token never reaches the browser.
 */

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function adminRequest<T>(
  operation: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const env = getNewsletterEnv();
  const endpoint = `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/${env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

  const post = async () =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": await getAdminToken(),
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

  let response = await post();
  if (response.status === 401) {
    // Revoked or expired early (an app reinstall does this): exchange
    // the credentials once more and retry once.
    clearAdminToken();
    response = await post();
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ShopifyRequestError(
      operation,
      response.status,
      body.slice(0, 500) || response.statusText,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new ShopifyGraphQLError(operation, payload.errors);
  }
  if (!payload.data) {
    throw new ShopifyGraphQLError(operation, [
      { message: "Response contained no data" },
    ]);
  }
  return payload.data;
}

const CONSENT = {
  marketingState: "SUBSCRIBED",
  // US email law does not require double opt-in. To add it later, use
  // CONFIRMED_OPT_IN with a PENDING state.
  marketingOptInLevel: "SINGLE_OPT_IN",
} as const;

const CUSTOMER_CREATE = /* GraphQL */ `
  mutation NewsletterCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const CUSTOMER_BY_EMAIL = /* GraphQL */ `
  query NewsletterCustomerByEmail($email: String!) {
    customerByIdentifier(identifier: { emailAddress: $email }) {
      id
      emailMarketingConsent { marketingState }
    }
  }
`;

const CONSENT_UPDATE = /* GraphQL */ `
  mutation NewsletterConsentUpdate(
    $input: CustomerEmailMarketingConsentUpdateInput!
  ) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

function isEmailTaken(errors: ApiAdminUserError[]): boolean {
  return errors.some(
    (e) =>
      (e.field ?? []).includes("email") && /taken/i.test(e.message),
  );
}

function fail(operation: string, errors: ApiAdminUserError[]): never {
  throw new ShopifyGraphQLError(
    operation,
    errors.map((e) => ({ message: e.message })),
  );
}

/**
 * Subscribes an email to marketing. A new address becomes a customer;
 * an existing customer has their consent switched on. Both end the same
 * way, so the form never reveals whether an address has an account.
 */
export async function subscribeToEmailMarketing(
  email: string,
): Promise<"subscribed"> {
  const created = await adminRequest<ApiNewsletterCustomerCreate>(
    "NewsletterCustomerCreate",
    CUSTOMER_CREATE,
    { input: { email, emailMarketingConsent: CONSENT } },
  );

  const createErrors = created.customerCreate?.userErrors ?? [];
  if (createErrors.length === 0) return "subscribed";
  if (!isEmailTaken(createErrors)) fail("NewsletterCustomerCreate", createErrors);

  const found = await adminRequest<ApiNewsletterCustomerByEmail>(
    "NewsletterCustomerByEmail",
    CUSTOMER_BY_EMAIL,
    { email },
  );
  const customer = found.customerByIdentifier;
  if (!customer) {
    fail("NewsletterCustomerByEmail", [
      { field: ["email"], message: "Email reported taken but not found" },
    ]);
  }
  if (customer.emailMarketingConsent?.marketingState === "SUBSCRIBED") {
    return "subscribed";
  }

  const updated = await adminRequest<ApiNewsletterConsentUpdate>(
    "NewsletterConsentUpdate",
    CONSENT_UPDATE,
    {
      input: {
        customerId: customer.id,
        emailMarketingConsent: CONSENT,
      },
    },
  );
  const updateErrors =
    updated.customerEmailMarketingConsentUpdate?.userErrors ?? [];
  if (updateErrors.length > 0) fail("NewsletterConsentUpdate", updateErrors);

  return "subscribed";
}
