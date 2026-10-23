import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { PageHeader } from "@/components/ui/page-header";
import { BRAND } from "@/content/brand";
import { CAFE } from "@/content/cafe";
import { assertCafeDetailsAreReal } from "@/lib/content/cafe-guard";
import { IMAGES } from "@/content/images";

export const metadata: Metadata = {
  title: "Café",
  description: `Yego Coffee, ${CAFE.fullAddress}.`,
};

/**
 * The café (plan.md §16, §91).
 *
 * Laid out as a shop lays out a store page (§108): a centred title,
 * one wide photograph, then feature rows — where to find it and what
 * it pours — each a photograph beside the practical answer.
 *
 * Address and email are confirmed. Hours and the drinks list render
 * only once the owners have supplied them (src/content/cafe.ts); until
 * then the rows say how to find out instead of guessing. No "open now"
 * indicator either way, since §55 computes it from hours.
 *
 * The structured data below carries only confirmed fields. §34 would
 * normally want `openingHoursSpecification` and `telephone`, but
 * search engines cache and redistribute this, and publishing an
 * unverified schedule is the most expensive form of the §91 mistake.
 */
export default function CafePage() {
  assertCafeDetailsAreReal();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: BRAND.name,
    email: BRAND.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CAFE.addressLine,
      addressLocality: CAFE.locality,
      addressRegion: CAFE.region,
      postalCode: CAFE.postalCode,
      addressCountry: CAFE.country,
    },
    servesCuisine: "Coffee",
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="px-page-x pt-section-md pb-section-sm">
        <div className="mx-auto max-w-page">
          {/* The same claim the homepage café block already makes, and
              no more: whether the roaster and the counter share a room
              is not a confirmed fact (§71, §91). */}
          <PageHeader
            align="center"
            title="Come have one with us."
            lede="Our roastery and café in Somerville. Come taste the lineup before you subscribe."
          >
            <div className="mt-stack-lg flex flex-wrap justify-center gap-stack-sm">
              <a
                href={CAFE.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "lg" })}
              >
                Get directions
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Email us
              </a>
            </div>
          </PageHeader>

          <Image
            {...IMAGES.cafeCounter}
            alt={IMAGES.cafeCounter.alt}
            sizes="(min-width: 1216px) 1216px, 100vw"
            priority
            className="mt-section-sm aspect-[4/3] w-full rounded-card object-cover sm:aspect-[16/9]"
          />
        </div>
      </section>

      <section aria-labelledby="cafe-visit" className="px-page-x py-section-sm">
        <div className="mx-auto max-w-page">
          <Contour label="Somerville" />

          <div className="mt-section-sm grid items-center gap-stack-lg md:grid-cols-2 md:gap-12 lg:gap-16">
            <Image
              {...IMAGES.basket}
              alt={IMAGES.basket.alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-card object-cover"
            />

            <div>
              <h2 id="cafe-visit" className="text-h2">
                Where we are
              </h2>
              <address className="mt-stack-md text-body-l font-bold not-italic">
                {CAFE.addressLine}
                <br />
                {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
              </address>

              {CAFE.hours.length > 0 ? (
                <dl className="mt-stack-lg max-w-sm divide-y divide-border border-y border-border">
                  {CAFE.hours.map((line) => (
                    <div
                      key={line.days}
                      className="flex justify-between gap-stack-md py-stack-sm text-body-m"
                    >
                      <dt className="text-muted-foreground">{line.days}</dt>
                      <dd className="font-bold">{line.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                // No hours are published, so this is the whole answer
                // rather than a caveat on one (§91).
                <p className="mt-stack-md max-w-prose text-body-m text-muted-foreground">
                  Opening hours are best confirmed by email before you
                  travel.
                </p>
              )}

              <a
                href={CAFE.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "lg", className: "mt-stack-lg" })}
              >
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="cafe-menu" className="px-page-x py-section-sm">
        <div className="mx-auto grid max-w-page items-center gap-stack-lg md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="md:order-1">
            <h2 id="cafe-menu" className="text-h2">
              What we pour
            </h2>

            {CAFE.menu.length > 0 ? (
              <ul className="mt-stack-lg max-w-md divide-y divide-border border-y border-border">
                {CAFE.menu.map((item) => (
                  <li key={item.name} className="py-stack-sm">
                    <p className="text-body-l font-bold">{item.name}</p>
                    {item.note ? (
                      <p className="mt-stack-xs text-body-s text-muted-foreground">
                        {item.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              // No claim about what is on the counter on any given day
              // until the owners publish it (§91). The lineup is the
              // offer.
              <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
                Ask at the counter, or browse the coffee we roast.
              </p>
            )}

            <Link
              href="/shop"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "mt-stack-lg",
              })}
            >
              See what we roast
            </Link>
          </div>

          <Image
            {...IMAGES.roasterLoring}
            alt={IMAGES.roasterLoring.alt}
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-card object-cover md:order-2"
          />
        </div>
      </section>
    </main>
  );
}
