"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/content/navigation";

/**
 * The desktop primary navigation.
 *
 * A client island solely so the current destination can carry
 * `aria-current="page"`: the underline sweep then rests under the
 * active item instead of appearing only on hover. Everything else
 * about the header stays server-rendered.
 */
export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-7">
        {PRIMARY_NAV.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="link-sweep text-control font-semibold text-foreground transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
