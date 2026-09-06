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

/**
 * Primary destinations, header and mobile menu.
 *
 * Mirrors the live site's coverage — roasted coffee, merch and
 * subscriptions under shop, our story, contact — plus the headless
 * storefront's own discovery paths (quiz, café, account).
 */
export const PRIMARY_NAV: NavLink[] = [
  { href: "/shop/coffee", label: "Coffee" },
  { href: "/shop/merch", label: "Merch" },
  { href: "/quiz", label: "Find Your Coffee" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/about", label: "Our Story" },
  { href: "/cafe", label: "Café" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
];

export type NavGroup = {
  label: string;
  links: NavLink[];
};

/**
 * Footer groups (§8.12). Every destination exists — a footer link
 * that 404s costs more trust than a shorter column.
 */
export const FOOTER_GROUPS: NavGroup[] = [
  {
    label: "Shop",
    links: [
      { href: "/shop/coffee", label: "Coffee" },
      { href: "/shop/merch", label: "Merch" },
      { href: "/subscriptions", label: "Subscriptions" },
      { href: "/quiz", label: "Find Your Coffee" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/cafe", label: "Café" },
      { href: "/contact", label: "Contact" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/account", label: "Account" },
      { href: "/cart", label: "Cart" },
      { href: "/policies", label: "Policies" },
      { href: "/search", label: "Search" },
    ],
  },
];
