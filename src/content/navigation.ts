/**
 * Navigation (plan.md §6), repository-managed per §5.2.
 *
 * A link is added the moment its destination exists — a navigation
 * item that 404s costs more trust than a shorter menu. Account is the
 * one item of §6's IA still missing, and it stays out until Phase 6
 * has real Customer Account credentials to build against.
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
