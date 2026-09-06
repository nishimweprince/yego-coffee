import Link from "next/link";
import { BRAND } from "@/content/brand";
import { FOOTER_GROUPS } from "@/content/navigation";
import { Contour } from "@/components/ui/contour";

/**
 * Footer (plan.md §8.12), carrying only confirmed facts (§88).
 *
 * Three grouped columns — shop, company, support — so a visitor can
 * scan by intent instead of reading one flat list. The contour rule
 * survives here as the brand's single signature line.
 *
 * §8.12 also lists newsletter and social. Each arrives with the phase
 * that gives it real content — an unlinked "Privacy" or a newsletter
 * form that posts nowhere is worse than its absence.
 */
export function SiteFooter() {
  return (
    <footer data-surface="soil" className="mt-auto px-page-x py-section-sm">
      {/* A sign-off, not a heading: it trails. */}
      <Contour label="Somerville, Massachusetts" align="end" />

      <div className="mt-stack-lg grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-h2">{BRAND.name}</p>
          <p className="mt-stack-xs text-body-s text-muted-foreground">
            {BRAND.shopAddress}
          </p>
          <a
            href={`mailto:${BRAND.email}`}
            className="link-sweep mt-stack-xs inline-block text-body-s text-muted-foreground hover:text-foreground"
          >
            {BRAND.email}
          </a>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.label} aria-label={`Footer — ${group.label}`}>
            <h2 className="label text-muted-foreground">{group.label}</h2>
            <ul className="mt-stack-md space-y-stack-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-sweep inline-block text-body-m text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mt-section-sm text-caption text-muted-foreground">
        © {new Date().getFullYear()} {BRAND.name}. Ships within the{" "}
        {BRAND.market}.
      </p>
    </footer>
  );
}
