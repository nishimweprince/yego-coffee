import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";
import { IMAGES } from "@/content/images";

/**
 * About Yego Coffee, as a feature row (§108): the founders' photograph
 * on one side, two paragraphs of confirmed fact and one action on the
 * other. The café row below mirrors it, so the two read as a pair.
 */
export function HomeAbout() {
  return (
    <section aria-labelledby="home-about-heading" className="px-page-x py-section-sm">
      <div className="mx-auto grid max-w-page items-center gap-stack-lg md:grid-cols-2 md:gap-12 lg:gap-16">
        <Image
          {...IMAGES.founders}
          alt={IMAGES.founders.alt}
          sizes="(min-width: 768px) 50vw, 100vw"
          loading="lazy"
          data-reveal
          className="aspect-[4/3] w-full rounded-card object-cover"
        />

        <div data-reveal style={{ "--reveal-order": 1 } as React.CSSProperties}>
          <h2 id="home-about-heading" className="max-w-[18ch] text-h2">
            {HOME.about.heading}
          </h2>
          <div className="mt-stack-md max-w-prose space-y-stack-md text-body-l text-muted-foreground">
            {HOME.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={HOME.about.cta.href}
            className={buttonVariants({ size: "lg", className: "mt-stack-lg" })}
          >
            {HOME.about.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
