import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons/faBagShopping";
import { SearchTrigger } from "@/components/search/search-trigger";
import { PRIMARY_NAV } from "@/content/navigation";

/**
 * The navigation shell — a Server Component (§20). Only the search
 * panel below it is interactive.
 *
 * No cart count is shown. Reading the cart cookie here would make every
 * page in the app dynamic, including the statically cached catalogue
 * (§22), to render one number. The count belongs to the cart drawer
 * (§15.1), which is Phase 4 work.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between gap-6 px-page-x py-stack-md">
        <Link
          href="/"
          className="font-display text-h3 tracking-tight"
          aria-label="Yego Coffee — home"
        >
          Yego
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-8">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="label text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <SearchTrigger />
          <Link
            href="/cart"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
            aria-label="Cart"
          >
            <FontAwesomeIcon icon={faBagShopping} className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
