import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { CAFE } from "@/content/cafe";
import { HOME } from "@/content/home";
import { IMAGES } from "@/content/images";

/**
 * The café, as the mirror of the about row (§108).
 *
 * This section's job is to put a real street address in front of
 * someone who might walk there, and the contour rule carries that
 * place name — the one time it appears on the page.
 *
 * Address and directions only. Hours and a menu appear on /cafe once
 * the owners confirm them (§91, src/content/cafe.ts); an outward-facing
 * guess reaches a stranger at the door.
 */
export function CafeBlock() {
  return (
    <section aria-labelledby="cafe-heading" className="px-page-x py-section-sm">
      <div className="mx-auto max-w-page">
        <Contour label={`${CAFE.locality}, ${CAFE.region}`} />

        <div className="mt-section-sm grid items-center gap-stack-lg md:grid-cols-2 md:gap-12 lg:gap-16">
          <div data-reveal className="md:order-1">
            <h2 id="cafe-heading" className="max-w-[16ch] text-h2">
              {HOME.cafe.heading}
            </h2>
            <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
              Our roastery and café in Somerville. Come taste the lineup
              before you subscribe.
            </p>

            <address className="mt-stack-md text-body-l font-bold not-italic">
              {CAFE.addressLine}
              <br />
              {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
            </address>

            <div className="mt-stack-lg flex flex-wrap gap-stack-sm">
              <Link href="/cafe" className={buttonVariants({ size: "lg" })}>
                Visit the café
              </Link>
              <a
                href={CAFE.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Get directions
              </a>
            </div>
          </div>

          <Image
            {...IMAGES.cafeCounter}
            alt={IMAGES.cafeCounter.alt}
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="lazy"
            data-reveal
            style={{ "--reveal-order": 1 } as React.CSSProperties}
            className="aspect-[4/3] w-full rounded-card object-cover md:order-2"
          />
        </div>
      </div>
    </section>
  );
}
