import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * The hero — subscription-led, static, a Server Component.
 *
 * One roasting photograph beside the subscription message. No
 * carousel, no autoplay, nothing to hydrate: the promise and the CTAs
 * never move under the visitor. Copy is plain customer language.
 */
export function Hero() {
  return (
    <section className="px-page-x py-section-md">
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
              the system (§17.6). Size lg per §42; min-h-11 keeps the
              44px target on mobile. */}
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

        <div className="overflow-hidden rounded-sm">
          <Image
            src="/brand/roast.jpg"
            alt="Coffee roasting at the Yego Coffee roastery"
            width={1200}
            height={1500}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
