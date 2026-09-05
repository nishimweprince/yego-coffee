/**
 * Navigation (plan.md §6), repository-managed per §5.2.
 *
 * §6's full IA also lists Subscriptions, Find Your Coffee, Our Story,
 * Café and Journal. Those routes arrive in Phases 4–7; a link is added
 * here the moment its destination exists, because a navigation item
 * that 404s costs more trust than a shorter menu.
 */

export type NavLink = {
  href: string;
  label: string;
};

export const PRIMARY_NAV: NavLink[] = [
  { href: "/shop/coffee", label: "Coffee" },
  { href: "/shop/merch", label: "Merch" },
  { href: "/quiz", label: "Find Your Coffee" },
];
