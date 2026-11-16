import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * The line under the hero (§108): what the shop sells, and the way in.
 *
 * On a desktop the words hold the left of the column and the button
 * the right, the way a shop's banner reads. On a phone they stack.
 */
export function HomeStatement() {
  return (
    <section
      aria-labelledby="home-statement-heading"
      className="px-page-x py-section-sm"
    >
      <div className="mx-auto flex max-w-page flex-col gap-stack-lg md:flex-row md:items-center md:justify-between md:gap-12">
        <div>
          <h2 id="home-statement-heading" data-reveal className="text-h2">
            {HOME.statement.headline}
          </h2>
          <p
            data-reveal
            style={{ "--reveal-order": 1 } as React.CSSProperties}
            className="mt-stack-sm max-w-[48ch] text-lede text-muted-foreground"
          >
            {HOME.statement.lede}
          </p>
        </div>
        <Link
          href={HOME.statement.cta.href}
          className={buttonVariants({ size: "lg", className: "self-start md:shrink-0 md:self-center" })}
        >
          {HOME.statement.cta.label}
        </Link>
      </div>
    </section>
  );
}
