import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons/faBagShopping";
import { CartCount } from "@/components/commerce/cart-count";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchTrigger } from "@/components/search/search-trigger";
import { PRIMARY_NAV } from "@/content/navigation";

/**
 * The navigation shell — a Server Component (§20). Search, the mobile
 * menu and the cart badge are the only interactive islands.
 *
 * Sticky, so wayfinding survives the now-denser page. The badge reads
 * through `/api/cart/count` on the client: reading the cart cookie
 * here would make every page dynamic (§22).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="relative flex items-center justify-between gap-6 px-page-x py-stack-md">
        <Link
          href="/"
          className="transition-opacity hover:opacity-80"
          aria-label="Yego Coffee home"
        >
          <Image
            src="/brand/logo.png"
            alt="Yego Coffee"
            width={240}
            height={125}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-sweep label text-muted-foreground transition-colors hover:text-foreground"
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
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
            aria-label="Cart"
          >
            <FontAwesomeIcon icon={faBagShopping} className="h-4 w-4" />
            <CartCount />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
