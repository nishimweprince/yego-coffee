import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { exchangeCodeForTokens } from "@/lib/customer/auth";
import { safeEqual } from "@/lib/customer/pkce";
import { sanitiseReturnTo } from "@/lib/customer/return-to";
import {
  clearHandshake,
  readHandshake,
  saveTokens,
} from "@/lib/customer/session";

/**
 * Completes sign-in (plan.md §11.1, §39).
 *
 * The order of checks is the security of the flow:
 *
 *   1. Shopify reported an error         → stop, tell nobody why
 *   2. no code                           → stop
 *   3. state missing or mismatched       → stop (CSRF)
 *   4. verifier missing                  → stop (replayed callback)
 *   5. exchange, then clear the handshake so it cannot be reused
 *
 * Every failure lands on the same page with the same message. A
 * callback that explains *which* check failed is a callback that helps
 * someone probe it.
 */
function failed(request: NextRequest) {
  const url = new URL("/account/signin-failed", request.nextUrl.origin);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (params.get("error")) {
    console.error("Customer sign-in returned an error", {
      error: params.get("error"),
      description: params.get("error_description"),
    });
    await clearHandshake();
    return failed(request);
  }

  const code = params.get("code");
  const returnedState = params.get("state");
  const { verifier, state, returnTo } = await readHandshake();

  if (
    !code ||
    !returnedState ||
    !state ||
    !safeEqual(returnedState, state) ||
    !verifier
  ) {
    await clearHandshake();
    return failed(request);
  }

  try {
    const tokens = await exchangeCodeForTokens({ code, codeVerifier: verifier });
    await saveTokens(tokens);
  } catch {
    await clearHandshake();
    return failed(request);
  }

  // Single-use: a replayed callback finds nothing to work with.
  await clearHandshake();

  const destination = sanitiseReturnTo(returnTo);
  return NextResponse.redirect(
    new URL(destination, env.NEXT_PUBLIC_SITE_URL),
  );
}
