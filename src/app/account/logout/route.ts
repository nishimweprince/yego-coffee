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
 *
 * The redirects are **303 See Other**, never NextResponse's default
 * 307. A 307 tells the browser to repeat the *same POST* at the new
 * address, so signing out POSTed to Shopify's logout endpoint (which
 * expects a GET navigation) or to `/` (405). 303 turns the follow-up
 * into a GET, which is what a form post that ends in a redirect needs.
 */
const SEE_OTHER = 303;

export async function POST() {
  const tokens = await readTokens();
  await clearSession();

  if (!hasCustomerAccountCredentials() || !tokens?.idToken) {
    return NextResponse.redirect(
      new URL("/", env.NEXT_PUBLIC_SITE_URL),
      SEE_OTHER,
    );
  }

  return NextResponse.redirect(logoutUrl(tokens.idToken), SEE_OTHER);
}

/** A GET lands somewhere sensible rather than 405-ing a real person. */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/account", request.nextUrl.origin));
}
