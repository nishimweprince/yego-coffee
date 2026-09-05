/**
 * The redirect sheet (plan.md §43 Phase 2, §92).
 *
 * The current Shopify theme's URLs must keep working after cutover.
 * §43 asks for a sheet of old URL → new URL → status → reason; this is
 * that sheet, as code, so it is reviewable and testable rather than
 * living in a spreadsheet nobody runs.
 *
 * Two categories:
 *
 *   Permanent (308) — the IA moved. `/collections/roasted-coffee` is
 *     now `/shop/coffee`; the old URL should stop being indexed.
 *
 *   Preserved — `/products/*` and `/collections/*` already resolve in
 *     this app, so they are deliberately *not* redirected. Preserving a
 *     URL is better than redirecting it (§43: "preserve URLs where
 *     reasonable").
 *
 * The `*-subscription` and `*-drop` products are **not** redirected to
 * their parent coffee, even though §92.1 proposes exactly that. They
 * are still separately purchasable products with their own prices, and
 * redirecting a live product URL to a different product would lose the
 * sale and the customer's place. That redirect belongs with §92.1's
 * consolidation, not before it — at which point the query-param form
 * §92.1 describes (`/products/dark-roast?plan=monthly`) becomes
 * meaningful.
 */

export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
  /** Why, for the §43 sheet. */
  reason: string;
};

export const REDIRECTS: RedirectRule[] = [
  {
    source: "/collections/all",
    destination: "/shop",
    permanent: true,
    reason: "§92: no `all` collection exists; /shop is the full catalogue",
  },
  {
    source: "/collections/frontpage",
    destination: "/shop",
    permanent: true,
    reason: "§92: the theme's home collection is not an IA concept here",
  },
  {
    source: "/pages/about-us",
    destination: "/about",
    permanent: true,
    reason: "§88.1: the about page moves into the new IA",
  },
  {
    source: "/pages/who-are-we",
    destination: "/about",
    permanent: true,
    reason: "§100.1: its content is now the body of /about",
  },
  {
    source: "/pages/contact",
    destination: "/cafe",
    permanent: true,
    reason: "§91: contact details live on the café page",
  },
  {
    source: "/blogs/news",
    destination: "/journal",
    permanent: true,
    reason: "§6: the blog becomes the journal",
  },
  {
    source: "/blogs/news/:slug",
    destination: "/journal/:slug",
    permanent: true,
    reason: "§43 Phase 2: preserve article URLs through the rename",
  },
  {
    source: "/policies/:handle",
    destination: "/policies/:handle",
    permanent: false,
    reason:
      "already resolves — listed so the sheet is complete and the path is not accidentally reused",
  },
];

/** The rules Next.js should apply; self-redirects are dropped. */
export function activeRedirects(): RedirectRule[] {
  return REDIRECTS.filter((rule) => rule.source !== rule.destination);
}
