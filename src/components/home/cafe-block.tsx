import Image from "next/image";
import { CAFE } from "@/content/cafe";
import { HOME } from "@/content/home";

/**
 * The café — a full-bleed band.
 *
 * The photograph runs the width of the viewport and the address is set
 * over it, because this section's job is to put a real street address
 * in front of someone who might walk there. Boxed at 45vw beside a
 * paragraph, it read as decoration.
 *
 * Address and directions only. A phone number and opening hours belong
 * here too, but both are unverified placeholders (§91) and this is an
 * outward-facing surface: a wrong number reaches a stranger, wrong
 * hours turn someone away at the door. They render the moment
 * `CAFE.provisional` says they are real.
 *
 * "View Café Menu" is omitted entirely per §91 — there is no menu.
 */
export function CafeBlock() {
  return (
    <section
      aria-labelledby="cafe-heading"
      data-surface="soil"
      className="band-scrim relative isolate overflow-hidden"
    >
      {/* Stacked on a phone, where the photograph needs its own space
          to be seen at all; behind the type from lg up, where the frame
          is wide enough for the words to sit in one half of it. */}
      <Image
        src="/brand/cup.jpg"
        alt="A cup of coffee at the Yego Coffee café"
        width={1000}
        height={1500}
        sizes="100vw"
        loading="lazy"
        className="h-64 w-full object-cover sm:h-80 lg:absolute lg:inset-0 lg:-z-10 lg:h-full"
      />

      <div className="relative z-10 px-page-x py-section-md lg:py-section-lg">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-[34rem]">
            <h2 id="cafe-heading" className="type-display text-display-l">
              {HOME.cafe.heading}
            </h2>
            <p className="mt-stack-md text-lede">
              Our roastery and café in Somerville. Come taste the lineup
              before you subscribe.
            </p>

            <address className="mt-stack-lg text-body-l not-italic">
              {CAFE.addressLine}
              <br />
              {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
            </address>

            {!CAFE.provisional.phone ? (
              <a
                href={`tel:${CAFE.phone.replace(/\s/g, "")}`}
                className="mt-stack-sm inline-block text-body-m text-muted-foreground hover:text-foreground"
              >
                {CAFE.phone}
              </a>
            ) : null}

            <a
              href={CAFE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="link-sweep mt-stack-lg inline-block label"
            >
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
