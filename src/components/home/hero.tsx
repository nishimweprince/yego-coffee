import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * §90.01 — the cinematic hero.
 *
 * §7 asks for full-viewport cinematic footage. There is none: Yego's
 * usable imagery is packshots and a small gallery (§93.4), and §67
 * forbids leaning on temporary stock. So the hero is typographic, set
 * full-bleed on the soil surface — which is the restraint the primary
 * references were chosen for (§89.1, MAME and Siwa) rather than a
 * compromise dressed as one. The copy carries it, and the composition
 * leaves the top third empty for the footage when it exists.
 *
 * Copy is §90.01 verbatim. The primary CTA leads to the quiz, which is
 * the plan's stated conversion goal (§1) — not to the shop.
 */
export function Hero() {
  return (
    <section
      data-surface="soil"
      className="flex min-h-[82svh] flex-col justify-end px-page-x pb-section-md pt-section-lg"
    >
      <h1 className="max-w-[16ch] text-display-xl">{HOME.hero.headline}</h1>

      <p className="mt-stack-lg max-w-prose text-body-l text-muted-foreground">
        {HOME.hero.body}
      </p>

      {/* Links, not buttons: these navigate. The button styling comes
          from the shared variants so a CTA cannot drift from the system
          (§17.6). Size lg per §42 — primary mobile CTAs are not sm. */}
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
    </section>
  );
}
