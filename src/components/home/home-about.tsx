import Image from "next/image";
import Link from "next/link";
import { Contour } from "@/components/ui/contour";
import { HOME } from "@/content/home";

/**
 * About Yego Coffee — directly after the hero.
 *
 * Founder photograph beside two concise paragraphs drawn only from
 * confirmed facts (owners, name meaning, roastery, market). A compact
 * Rwanda-to-Somerville fact rail carries the verified journey instead
 * of a numbered principle grid; the contour rule marks that factual
 * transition.
 */
export function HomeAbout() {
  return (
    <section aria-labelledby="home-about-heading" className="px-page-x py-section-sm">
      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <figure className="overflow-hidden rounded-sm">
          <Image
            src="/brand/founders.jpg"
            alt="Fatuma and Francois Tuyishime, the family behind Yego Coffee"
            width={1500}
            height={1000}
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover"
          />
          <figcaption className="mt-stack-sm text-body-s text-muted-foreground">
            Fatuma and Francois Tuyishime, Somerville, Massachusetts.
          </figcaption>
        </figure>

        <div>
          <p className="label text-accent">{HOME.about.eyebrow}</p>
          <h2
            id="home-about-heading"
            className="mt-stack-md max-w-[20ch] text-display-l"
          >
            {HOME.about.heading}
          </h2>
          <div className="mt-stack-lg max-w-prose space-y-stack-sm text-body-l text-muted-foreground">
            {HOME.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={HOME.about.cta.href}
            className="link-sweep mt-stack-lg inline-block label text-accent"
          >
            {HOME.about.cta.label}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <Contour label="Rwanda / Somerville" className="mt-section-sm" />
        <dl className="mt-stack-md grid gap-x-8 gap-y-stack-md sm:grid-cols-3">
          <div>
            <dt className="label text-muted-foreground">Origin</dt>
            <dd className="mt-stack-xs text-body-m">Rwandan coffee</dd>
          </div>
          <div>
            <dt className="label text-muted-foreground">Roastery</dt>
            <dd className="mt-stack-xs text-body-m">Somerville, Massachusetts</dd>
          </div>
          <div>
            <dt className="label text-muted-foreground">Ownership</dt>
            <dd className="mt-stack-xs text-body-m">Family-owned</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
