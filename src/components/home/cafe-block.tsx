import Image from "next/image";
import { Contour } from "@/components/ui/contour";
import { CAFE } from "@/content/cafe";
import { HOME } from "@/content/home";

/**
 * The café — the last thing on the page, and the one place on it.
 *
 * Photograph beside the address, on the same ground as everything
 * above. This section's job is to put a real street address in front
 * of someone who might walk there, and the contour rule carries that
 * place name: the second and last time it appears on the page.
 *
 * Address and directions only. A phone number and opening hours belong
 * here too, but neither has been confirmed by the owners, and this is
 * an outward-facing surface: a wrong number reaches a stranger, wrong
 * hours turn someone away at the door. They are not carried in the
 * repository at all (§91) — see src/content/cafe.ts.
 *
 * "View Café Menu" is omitted entirely per §91 — there is no menu.
 */
export function CafeBlock() {
  return (
    <section aria-labelledby="cafe-heading" className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <Contour label={`${CAFE.locality}, ${CAFE.region}`} />

        <div className="mt-section-sm grid items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="cafe-heading" className="max-w-[16ch] text-display-l">
              {HOME.cafe.heading}
            </h2>
            <p className="mt-stack-md max-w-prose text-lede text-muted-foreground">
              Our roastery and café in Somerville. Come taste the lineup
              before you subscribe.
            </p>

            <address className="mt-stack-lg text-body-l not-italic">
              {CAFE.addressLine}
              <br />
              {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
            </address>

            <a
              href={CAFE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-stack-md inline-block text-body-m font-medium text-accent underline underline-offset-4 hover:text-foreground"
            >
              Get directions
            </a>
          </div>

          <Image
            src="/brand/cup.jpg"
            alt="A cup of coffee at the Yego Coffee café"
            width={1000}
            height={1500}
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
      </div>
    </section>
  );
}
