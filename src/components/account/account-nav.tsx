"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Contour } from "@/components/ui/contour";
import { cn } from "@/lib/utils";

/**
 * Account navigation (plan.md §11, §64).
 *
 * A horizontally scrolling row rather than a sidebar. §64 is explicit
 * that desktop-dashboard conventions do not belong on a phone, and a
 * five-item sidebar on a 375px screen is either a hamburger inside a
 * hamburger or a column that pushes the content off-screen.
 *
 * Sign out is a form, not a link: a GET logout can be fired by any
 * image tag on any page (§39).
 */
const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/subscriptions", label: "Subscriptions" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account">
      <div className="flex items-center justify-between gap-stack-md">
        <ul className="flex gap-6 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              link.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "label whitespace-nowrap transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form action="/account/logout" method="post">
          <button
            type="submit"
            className="label whitespace-nowrap text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
      <Contour className="mt-stack-md" />
    </nav>
  );
}
