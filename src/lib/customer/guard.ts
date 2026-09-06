import "server-only";

import { redirect } from "next/navigation";
import { readTokens } from "./session";

/**
 * The account auth boundary (plan.md §11.1, §63).
 *
 * Called at the top of every account page. Two things make it a real
 * boundary rather than decoration:
 *
 *   - it runs on the server, before anything renders, so no customer
 *     data is ever sent to an unauthenticated browser;
 *   - it redirects rather than rendering an empty page, so there is no
 *     "logged out" state of an account page that could leak structure.
 *
 * §63 also requires that these pages are never statically cached. The
 * cookie read makes each of them dynamic by construction, and the
 * Customer Account client sends `no-store` on every request.
 */
export async function requireCustomerSession(returnTo: string): Promise<void> {
  const tokens = await readTokens();
  if (!tokens) {
    redirect(`/account/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
}
