/**
 * Navigation (plan.md §6), repository-managed per §5.2.
 *
 * A link is added the moment its destination exists — a navigation
 * item that 404s costs more trust than a shorter menu.
 *
 * §6's IA is now complete. `/account` resolves whether or not customer
 * accounts are configured: without credentials it explains that
 * accounts are not switched on yet, which is a true answer rather than
 * a dead link (§104).
 */

export type NavLink = {
  href: string;
  label: string;
};

export const PRIMARY_NAV: NavLink[] = [
  { href: "/shop/coffee", label: "Coffee" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/quiz", label: "Find Your Coffee" },
  { href: "/cafe", label: "Café" },
  { href: "/account", label: "Account" },
];

/** Secondary destinations, footer only — §8.12. */
export const FOOTER_NAV: NavLink[] = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/merch", label: "Merch" },
  { href: "/about", label: "Our Story" },
  { href: "/journal", label: "Journal" },
  { href: "/policies", label: "Policies" },
  { href: "/search", label: "Search" },
];
