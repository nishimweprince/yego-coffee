import { NextResponse, type NextRequest } from "next/server";

/**
 * The account auth boundary, at the HTTP level (plan.md §11.1, §63).
 *
 * `requireCustomerSession()` in each page is the real check, but it
 * runs *during* rendering: by the time it calls `redirect()`, the
 * account layout has already streamed, so the response is a 200 with
 * a client-side redirect rather than an HTTP one. No customer data
 * leaks — the page body never renders — but an auth boundary should
 * not depend on the order in which a tree happens to stream.
 *
 * This decides before anything renders. It is a *presence* check on
 * the session cookie, deliberately: middleware cannot validate a token
 * without a network call, and pretending otherwise would put a
 * security decision somewhere it cannot be made. Authorisation stays
 * where it belongs — Shopify scopes every response to the token, and
 * the page guard and Server Actions re-check the session (§11.7).
 *
 * So: middleware turns away visitors with no session at all; the
 * server turns away everyone else who should not be there.
 */
const REFRESH_COOKIE = "yego_customer_rt";

/** Routes under /account that must stay reachable signed out. */
const PUBLIC_ACCOUNT_PATHS = [
  "/account/login",
  "/account/callback",
  "/account/logout",
  "/account/signin-failed",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ACCOUNT_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  /*
   * With customer accounts unconfigured there is nothing to sign in
   * to, and sending someone to a login route that answers "not
   * configured" turns a nav click into a raw error. The page explains
   * it properly instead (§104) — so this boundary only guards a
   * feature that exists.
   */
  if (!process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
    return NextResponse.next();
  }

  if (request.cookies.has(REFRESH_COOKIE)) {
    return NextResponse.next();
  }

  const login = new URL("/account/login", request.url);
  login.searchParams.set("returnTo", pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/account/:path*"],
};
