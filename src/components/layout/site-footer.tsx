import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { BRAND } from "@/content/brand";
import { FOOTER_GROUPS } from "@/content/navigation";
import { hasNewsletter } from "@/lib/env";

/**
 * Footer (plan.md §8.12), carrying only confirmed facts (§88).
 *
 * Three grouped columns — shop, company, support — so a visitor can
 * scan by intent instead of reading one flat list.
 *
 * The newsletter row (§50) leads the footer, but only when the Shopify
 * Admin token is set: a form that posts nowhere is worse than its
 * absence. Signups become customers subscribed to email marketing in
 * Shopify. Social links still wait for real accounts to point at.
 */
export function SiteFooter() {
  return (
    <footer data-surface="soil" className="mt-auto px-page-x py-section-sm">
      {/* No contour sign-off: its label repeated the address printed
          directly beneath it (§107). */}
      <div className="mx-auto max-w-page">
        {hasNewsletter() ? (
          <section
            aria-labelledby="newsletter-heading"
            className="mb-stack-lg grid gap-stack-md border-b border-border pb-stack-lg md:grid-cols-2 md:items-end md:gap-12"
          >
            <div>
              <h2 id="newsletter-heading" className="text-h3 font-bold">
                Coffee notes, new releases, no noise.
              </h2>
              <p className="mt-stack-xs text-body-s text-muted-foreground">
                Unsubscribe any time.{" "}
                <Link
                  href="/policies"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Privacy
                </Link>
              </p>
            </div>
            <NewsletterForm />
          </section>
        ) : null}

        <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-h3 font-bold">{BRAND.name}</p>
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
              <h2 className="text-body-m font-bold">{group.label}</h2>
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
      </div>
    </footer>
  );
}
