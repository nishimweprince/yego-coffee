import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PrimaryNav } from "@/components/layout/primary-nav";
import { SearchTrigger } from "@/components/search/search-trigger";

/**
 * The navigation shell — a Server Component (§20). Search, the mobile
 * menu and the cart are the only interactive islands.
 *
 * Sticky, so wayfinding survives the now-denser page. The cart reads
 * through `/api/cart` on the client: reading the cart cookie here would
 * make every page dynamic (§22).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="relative flex h-[72px] items-center justify-between gap-6 px-page-x">
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

        <PrimaryNav />

        <div className="flex items-center gap-1">
          <SearchTrigger />
          <Link
            href="/account"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
            aria-label="Account"
          >
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          </Link>
          <CartDrawer />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
