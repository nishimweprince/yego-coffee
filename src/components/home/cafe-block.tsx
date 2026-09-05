import { Contour } from "@/components/ui/contour";
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
    <section className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <Contour label="Café" />
        <div className="mt-section-sm grid gap-stack-lg lg:grid-cols-2 lg:gap-16">
          <h2 className="text-display-l">{HOME.cafe.heading}</h2>

          <div className="self-end">
            <address className="text-body-l not-italic">
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
