import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HOME } from "@/content/home";

/**
 * The hero — a full screen of the owners' photographs (§108).
 *
 * The page opens on the coffee's own journey rather than on a
 * paragraph: green sacks, the roaster's drop, the check under the
 * lamp. The chrome floats over it (see the "chrome over the hero"
 * rules in globals.css), so the viewport belongs to the picture.
 *
 * `data-surface="soil"` because the type sits on dark photographs:
 * every token beneath it follows, so the buttons, rules and muted text
 * are correct against the frame without a hard-coded colour.
 *
 * Every slide is server-rendered. The first photograph is the LCP
 * element and its headline is the page's only <h1>; the others are
 * <h2>s on slides that stay in the document, inert until shown.
 * HeroCarousel is the one client island — it only decides which slide
 * is showing.
 */
export function Hero() {
  const slides = HOME.hero.slides;

  return (
    <section
      data-surface="soil"
      aria-roledescription="carousel"
      aria-label="Yego Coffee, from Rwanda to Somerville"
      className="relative isolate min-h-svh overflow-hidden"
    >
      <HeroCarousel count={slides.length}>
        {slides.map((slide, index) => {
          const Heading = index === 0 ? "h1" : "h2";
          return (
            <div
              key={slide.image.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              data-hero-slide
              className="hero-scrim absolute inset-0 isolate flex flex-col justify-end"
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="hero-slide__image -z-10 object-cover"
                style={{ objectPosition: slide.image.focus }}
              />

              <div className="hero-slide__copy relative z-10 px-page-x pt-40 pb-28 sm:pb-32">
                <div className="mx-auto w-full max-w-page">
                  <Heading className="max-w-[15ch] text-display-xl">
                    {slide.headline}
                  </Heading>

                  <p className="mt-stack-md max-w-[40ch] text-lede font-bold">
                    {slide.body}
                  </p>

                  {/* A link, not a button: it navigates. Size lg per
                      §42. On soil the primary pill is paper with ink
                      type, so it holds on any frame. */}
                  <Link
                    href={slide.cta.href}
                    className={buttonVariants({
                      size: "lg",
                      className: "mt-stack-lg",
                    })}
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </HeroCarousel>
    </section>
  );
}
