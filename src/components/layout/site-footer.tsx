import Link from "next/link";
import { BRAND } from "@/content/brand";
import { FOOTER_NAV } from "@/content/navigation";
import { Contour } from "@/components/ui/contour";

/**
 * Footer (plan.md §8.12), carrying only confirmed facts (§88).
 *
 * §8.12 also lists newsletter, social, policies and accessibility. Each
 * arrives with the phase that gives it real content — an unlinked
 * "Privacy" or a newsletter form that posts nowhere is worse than its
 * absence.
 */
export function SiteFooter() {
  return (
    <footer
      data-surface="soil"
      className="mt-auto px-page-x py-section-sm"
    >
      <Contour label="Somerville, Massachusetts" />

      <div className="mt-stack-lg flex flex-col justify-between gap-stack-lg sm:flex-row">
        <div>
          <p className="font-display text-h2">{BRAND.name}</p>
          <p className="mt-stack-xs text-body-s text-muted-foreground">
            {BRAND.shopAddress}
          </p>
          <a
            href={`mailto:${BRAND.email}`}
            className="mt-stack-xs inline-block text-body-s text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {BRAND.email}
          </a>
        </div>

        <nav aria-label="Footer">
          <ul className="grid gap-stack-sm sm:grid-cols-2 sm:gap-x-12">
            {FOOTER_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-body-s text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-section-sm text-caption text-muted-foreground">
        © {new Date().getFullYear()} {BRAND.name}. Ships within the{" "}
        {BRAND.market}.
      </p>
    </footer>
  );
}
