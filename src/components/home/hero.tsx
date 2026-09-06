import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { buttonVariants } from "@/components/ui/button";
import { HeroSlides } from "@/components/home/hero-slides";
import { HOME } from "@/content/home";

/**
 * §90.01 — the hero, subscription-led and full-height.
 *
 * The frame is `min-h-svh`: the first screen is the whole pitch, not
 * its opening line. Photography rotates through the live site's real
 * gallery while the copy stands still — the promise and the CTAs never
 * move under the visitor. Copy is plain customer language, no em
 * dashes, no manifestos.
 */
export function Hero() {
  return (
    <section
      data-surface="soil"
      className="flex min-h-svh items-center px-page-x py-section-md"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-stack-lg lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="label text-accent">{HOME.hero.eyebrow}</p>
          <h1 className="mt-stack-md max-w-[14ch] text-display-xl">
            {HOME.hero.headline}
          </h1>

          <p className="mt-stack-lg max-w-prose text-body-l text-muted-foreground">
            {HOME.hero.body}
          </p>

          {/* Links, not buttons: these navigate. The button styling
              comes from the shared variants so a CTA cannot drift from
              the system (§17.6). Size lg per §42. */}
          <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
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

          <ul className="mt-section-sm flex flex-wrap gap-x-6 gap-y-stack-xs">
            {HOME.hero.trust.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-body-s text-muted-foreground"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className="h-3 w-3 text-accent"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroSlides />
      </div>
    </section>
  );
}
