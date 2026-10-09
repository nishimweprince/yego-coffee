import Image from "next/image";
import Link from "next/link";
import { HOME } from "@/content/home";
import { IMAGES } from "@/content/images";

/**
 * About Yego Coffee — directly after the hero.
 *
 * Founder photograph beside two concise paragraphs drawn only from
 * confirmed facts (owners, name meaning, roastery, market). The fact
 * rail that followed restated those paragraphs as labels and was cut
 * (§107); /about keeps the facts list.
 */
export function HomeAbout() {
  return (
    <section aria-labelledby="home-about-heading" className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <figure className="overflow-hidden rounded-sm">
          <Image
            {...IMAGES.founders}
            alt={IMAGES.founders.alt}
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover"
          />
          <figcaption className="mt-stack-sm label text-muted-foreground">
            Fatuma and Francois Tuyishime, Somerville, Massachusetts
          </figcaption>
        </figure>

        <div>
          <h2
            id="home-about-heading"
            className="max-w-[18ch] text-display-l"
          >
            {HOME.about.heading}
          </h2>
          <div className="mt-stack-lg max-w-prose space-y-stack-md text-body-l text-muted-foreground">
            {HOME.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={HOME.about.cta.href}
            className="mt-stack-lg inline-block text-body-m font-medium text-accent underline underline-offset-4 hover:text-foreground"
          >
            {HOME.about.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
