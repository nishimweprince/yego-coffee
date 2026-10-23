import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * The line under the hero (§108).
 *
 * A shop opens its catalogue with one centred sentence and one button,
 * and so does this: the brand's name answered in a line, then the way
 * in. The words come from §90's statement, which the about copy
 * already stands behind.
 */
export function HomeStatement() {
  return (
    <section
      aria-labelledby="home-statement-heading"
      className="px-page-x pt-section-md pb-section-sm text-center"
    >
      <div className="mx-auto max-w-3xl">
        <h2 id="home-statement-heading" data-reveal className="text-display-l">
          {HOME.statement.headline}
        </h2>
        <p
          data-reveal
          style={{ "--reveal-order": 1 } as React.CSSProperties}
          className="mx-auto mt-4 max-w-[36ch] text-lede text-muted-foreground"
        >
          {HOME.statement.lede}
        </p>
        <Link
          href={HOME.statement.cta.href}
          className={buttonVariants({ size: "lg", className: "mt-stack-lg" })}
        >
          {HOME.statement.cta.label}
        </Link>
      </div>
    </section>
  );
}
