import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";

/**
 * The closing screen.
 *
 * The shipping answer sits directly above the last ask, because
 * "what will delivery cost me" is the question that stops a first
 * order, and until now the answer lived only on /policies. It is the
 * store's own sentence, linked to the full document.
 */
export function FinalCta({ shipping }: { shipping: Reassurance | null }) {
  return (
    <section className="px-page-x py-section-lg">
      <div className="mx-auto max-w-6xl">
        <h2 className="type-display max-w-[14ch] text-display-l">
          {HOME.finalCta.headline}
        </h2>
        <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
          <Link
            href={HOME.finalCta.primaryCta.href}
            className={buttonVariants({ size: "lg" })}
          >
            {HOME.finalCta.primaryCta.label}
          </Link>
          <Link
            href={HOME.finalCta.secondaryCta.href}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            {HOME.finalCta.secondaryCta.label}
          </Link>
        </div>

        <YegoLine reassurance={shipping} className="mt-section-md" />
      </div>
    </section>
  );
}
