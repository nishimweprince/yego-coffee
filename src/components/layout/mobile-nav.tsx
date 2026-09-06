"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { PRIMARY_NAV } from "@/content/navigation";
import { cn } from "@/lib/utils";

/**
 * The mobile menu. The header shows no navigation below `sm`, so
 * without this phones get a logo and no wayfinding. A toggle panel,
 * closed by default and closed again on navigation.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        <FontAwesomeIcon icon={open ? faXmark : faBars} className="h-4 w-4" />
      </button>

      {open ? (
        <nav
          aria-label="Mobile"
          // An open menu is a panel, not chrome. On the homepage the
          // bar around it is transparent over the film hero, and
          // without a surface of its own this inherited that
          // transparency: the links landed unreadable on the video.
          // Declaring the surface here also states what it is.
          data-surface="mist"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-page-x py-stack-md"
        >
          <ul className="space-y-1">
            {[...PRIMARY_NAV, { href: "/contact", label: "Contact" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "block py-stack-sm text-body-l transition-colors hover:text-accent",
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
