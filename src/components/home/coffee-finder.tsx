import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * §90.05 — the coffee finder.
 *
 * No question count. §90.05 and §93.4 both insist on this: the count
 * moved as the quiz was right-sized, and a number here that the quiz
 * does not honour is an immediately visible broken promise. "A few
 * questions. About 30 seconds." is the promise, and it is one the quiz
 * can keep.
 */
export function CoffeeFinder() {
  return (
    <section className="px-page-x py-section-lg">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-display-l">{HOME.finder.heading}</h2>
        <div className="mt-stack-lg space-y-stack-xs text-body-l text-muted-foreground">
          {HOME.finder.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Link
          href={HOME.finder.cta.href}
          className={`${buttonVariants({ size: "lg" })} mt-section-sm`}
        >
          {HOME.finder.cta.label} →
        </Link>
      </div>
    </section>
  );
}
