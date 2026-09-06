import Image from "next/image";
import { CAFE } from "@/content/cafe";
import { HOME } from "@/content/home";

/**
 * §90.06 — the café block.
 *
 * Address and directions only. §90.06 lists a phone number and opening
 * hours too, but both are unverified placeholders (§91) and this is an
 * outward-facing surface: a wrong number reaches a stranger, wrong
 * hours turn someone away at the door. They render the moment
 * `CAFE.provisional` says they are real.
 *
 * "View Café Menu" is omitted entirely per §91 — there is no menu.
 */
export function CafeBlock() {
  return (
    <section className="px-page-x py-section-sm">
      <div className="mx-auto max-w-6xl">
        <p className="label text-accent">Café</p>
        <div className="mt-stack-md grid items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <Image
              src="/brand/cup.jpg"
              alt="A cup of coffee at the Yego Coffee café"
              width={1000}
              height={1500}
              sizes="(min-width: 1024px) 45vw, 100vw"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-display-l">{HOME.cafe.heading}</h2>
            <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
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
              className="mt-stack-lg inline-block label text-accent underline-offset-4 hover:underline"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
