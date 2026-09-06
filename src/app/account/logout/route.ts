import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { logoutUrl } from "@/lib/customer/auth";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { clearSession, readTokens } from "@/lib/customer/session";

/**
 * Signs out (plan.md §11.1: "logout must clear local application auth
 * state appropriately").
 *
 * Local cookies are cleared *and* Shopify's session is ended. Clearing
 * only ours would leave the customer signed in at Shopify, so the next
 * "sign in" would silently return them to the same account without a
 * password — which is not what anyone means by logging out, and is
 * actively wrong on a shared computer.
 *
 * POST only: a GET logout can be triggered by any image tag on any
 * page (§39, CSRF).
 */
export async function POST() {
  const tokens = await readTokens();
  await clearSession();

  if (!hasCustomerAccountCredentials() || !tokens?.idToken) {
    return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_SITE_URL));
  }

  return NextResponse.redirect(logoutUrl(tokens.idToken));
}

/** A GET lands somewhere sensible rather than 405-ing a real person. */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/account", request.nextUrl.origin));
}
