import Image from "next/image";
import Link from "next/link";
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
 * `data-surface="soil"` because the type sits on dark footage: this is
 * a photograph, not a coloured band, and it is one of only two places
 * the site inverts (the other is the footer). Every token beneath it
 * follows, so the buttons, rules and muted text are already correct
 * against the frame without a single hard-coded colour.
 *
 * The still is server-rendered and is the LCP element. The film is a
 * client island layered over it, skipped entirely under reduced
 * motion — see HeroVideo. Everything below the video is static.
 *
 * A headline, one sentence and two actions — nothing else. The trust
 * row and scroll cue that sat under the buttons repeated what the
 * about section says one scroll later (§107).
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
          <h1 className="rise-in max-w-[16ch] text-display-xl">
            {HOME.hero.headline}
          </h1>

          <p className="rise-in mt-stack-md max-w-prose text-lede">
            {HOME.hero.body}
          </p>

          {/* Links, not buttons: these navigate. The button styling
              comes from the shared variants so a CTA cannot drift from
              the system. Size lg per §42. The actions arrive a beat
              after the words — the page's one animated moment. */}
          <div
            className="rise-in mt-stack-lg flex flex-wrap items-center gap-stack-sm"
            style={{ "--rise-delay": "160ms" } as React.CSSProperties}
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
        </div>
      </div>
    </section>
  );
}
