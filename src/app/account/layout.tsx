import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  // Account pages must never be indexed (§34, §63).
  robots: { index: false, follow: false },
};

/**
 * §63: account routes must never be statically cached with customer
 * data, and this is not left to inference.
 *
 * Without it these routes prerendered at build time — because when
 * customer accounts are unconfigured the pages return before ever
 * reading a cookie, so Next saw nothing dynamic and baked them. That
 * is §95.6's trap in a worse place: add credentials later without a
 * rebuild and every customer is served a cached "accounts aren't
 * available" page.
 *
 * This layout deliberately renders no chrome of its own. The nav and
 * the `<main>` belong to the `(signed-in)` group, because the sign-in
 * failure page is not part of the account area: inheriting them gave
 * it nested `<main>` elements and an account nav shown to someone who
 * is, by definition, not signed in.
 */
export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return children;
}
