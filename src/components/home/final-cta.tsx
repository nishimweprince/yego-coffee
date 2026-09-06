import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/** §90.10 — the closing screen. */
export function FinalCta() {
  return (
    <section className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[14ch] text-display-l">
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
      </div>
    </section>
  );
}
