import { NextResponse, type NextRequest } from "next/server";
import { authorizationUrl } from "@/lib/customer/auth";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import {
  createCodeChallenge,
  createCodeVerifier,
  createNonce,
  createState,
} from "@/lib/customer/pkce";
import { sanitiseReturnTo } from "@/lib/customer/return-to";
import { saveHandshake } from "@/lib/customer/session";

/**
 * Begins sign-in (plan.md §11.1).
 *
 * The verifier, state and nonce are generated here and stored in
 * short-lived httpOnly cookies; only the derived challenge travels to
 * Shopify. That is the whole point of PKCE for a public client — the
 * secret never leaves this server.
 */
export async function GET(request: NextRequest) {
  if (!hasCustomerAccountCredentials()) {
    // A clear 503 rather than a redirect into a broken flow.
    return NextResponse.json(
      { error: "Customer accounts are not configured. See plan.md §100.5." },
      { status: 503 },
    );
  }

  const returnTo = sanitiseReturnTo(
    request.nextUrl.searchParams.get("returnTo"),
  );

  const verifier = createCodeVerifier();
  const state = createState();
  const nonce = createNonce();

  await saveHandshake({ verifier, state, nonce, returnTo });

  return NextResponse.redirect(
    authorizationUrl({
      state,
      nonce,
      codeChallenge: await createCodeChallenge(verifier),
    }),
  );
}
