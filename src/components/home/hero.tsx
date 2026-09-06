import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { buttonVariants } from "@/components/ui/button";
import { HeroVideo } from "@/components/home/hero-video";
import { HOME } from "@/content/home";

/** Where the placeholder footage lives. Swap both files together. */
const FILM = {
  src: "/brand/video/hero-coffee.webm",
  poster: "/brand/video/hero-coffee-poster.jpg",
  /** Describes the poster, which is what a screen reader can perceive. */
  alt: "Freshly picked coffee cherries in a harvest bucket",
};

/**
 * The hero — a full screen of film.
 *
 * The page opens on the crop itself rather than on a photograph boxed
 * beside a paragraph. The chrome floats over it (see the "chrome over
 * film" rules in globals.css), so nothing is stacked on top of the
 * picture and the viewport belongs to one image.
 *
 * `data-surface="soil"` is what makes this work as a system rather than
 * as a special case: every token beneath it inverts, so the buttons,
 * rules and muted text are already correct against a dark frame
 * without a single hard-coded colour.
 *
 * The still is server-rendered and is the LCP element. The film is a
 * client island layered over it, skipped entirely under reduced
 * motion — see HeroVideo. Everything below the video is static.
 */
export function Hero() {
  return (
    <section
      data-surface="soil"
      className="hero-scrim relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <Image
        src={FILM.poster}
        alt={FILM.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <HeroVideo
        src={FILM.src}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      <div className="relative z-10 px-page-x pt-40 pb-section-md">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="rise-in type-display max-w-[13ch] text-display-xl">
            {HOME.hero.headline}
          </h1>

          <p
            className="rise-in mt-stack-lg max-w-prose text-lede"
            style={{ "--rise-delay": "120ms" } as React.CSSProperties}
          >
            {HOME.hero.body}
          </p>

          {/* Links, not buttons: these navigate. The button styling
              comes from the shared variants so a CTA cannot drift from
              the system. Size lg per §42. */}
          <div
            className="rise-in mt-section-sm flex flex-wrap items-center gap-stack-md"
            style={{ "--rise-delay": "240ms" } as React.CSSProperties}
          >
            <Link
              href={HOME.hero.primaryCta.href}
              className={buttonVariants({ size: "lg" })}
            >
              {HOME.hero.primaryCta.label}
            </Link>
            <Link
              href={HOME.hero.secondaryCta.href}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              {HOME.hero.secondaryCta.label}
            </Link>
          </div>

          {/* Verified facts only: ownership, roastery, market. Set as a
              ruled row in the utility face so they read as provenance
              rather than as a feature list with ticks. */}
          <div
            className="rise-in mt-section-sm flex flex-wrap items-end justify-between gap-stack-md border-t border-rule pt-stack-md"
            style={{ "--rise-delay": "340ms" } as React.CSSProperties}
          >
            <ul className="flex flex-wrap gap-x-6 gap-y-stack-sm">
              {HOME.hero.trust.map((item) => (
                <li key={item} className="label text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>

            {/* Says what is below the fold on a screen that is entirely
                picture, and moves the reader there. */}
            <a
              href="#home-about-heading"
              className="link-sweep label inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" aria-hidden />
              Our story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
