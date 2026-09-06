import type { Metadata } from "next";
import Image from "next/image";
import { Contour } from "@/components/ui/contour";
import { BRAND } from "@/content/brand";
import { CAFE } from "@/content/cafe";
import { assertCafeDetailsAreReal } from "@/lib/content/cafe-guard";

export const metadata: Metadata = {
  title: "Café",
  description: `Yego Coffee, ${CAFE.fullAddress}.`,
};

/**
 * The café (plan.md §16, §91).
 *
 * Address and email are confirmed. Phone and hours are carried-over
 * placeholders and do not render (§91) — which also means no "open
 * now" indicator, since §55 computes it from hours nobody has
 * verified.
 *
 * No menu section at all, per §91: not a stub, not a "coming soon".
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
    <main className="px-page-x py-section-md">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <figure className="overflow-hidden rounded-sm">
          <Image
            src="/brand/cup.jpg"
            alt="A cup of coffee at the Yego Coffee café"
            width={1000}
            height={1500}
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="aspect-[4/5] w-full object-cover"
          />
        </figure>

        <div>
          <p className="label text-accent">Café</p>
          <h1 className="mt-stack-md text-display-l">Come have one with us.</h1>

          <Contour label="Somerville" className="mt-section-sm" />

        <div className="mt-section-sm grid gap-stack-lg sm:grid-cols-2">
          <div>
            <h2 className="label text-muted-foreground">Where</h2>
            <address className="mt-stack-sm text-body-l not-italic">
              {CAFE.addressLine}
              <br />
              {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
            </address>
            <a
              href={CAFE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-stack-md inline-block label text-accent underline-offset-4 hover:underline"
            >
              Get Directions
            </a>
          </div>

          <div>
            <h2 className="label text-muted-foreground">Get in touch</h2>
            <a
              href={`mailto:${BRAND.email}`}
              className="mt-stack-sm inline-block text-body-l underline-offset-4 hover:underline"
            >
              {BRAND.email}
            </a>
            {CAFE.provisional.hours ? (
              /* Saying "call ahead" is honest; printing hours nobody
                 has confirmed is not (§91). */
              <p className="mt-stack-md max-w-prose text-body-s text-muted-foreground">
                Opening hours are best confirmed by email before you
                travel.
              </p>
            ) : null}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
