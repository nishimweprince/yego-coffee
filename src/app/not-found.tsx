import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";

/**
 * 404 (plan.md §48).
 *
 * §48's rule for every empty state applies here: say what to do next,
 * not merely that there is nothing. With a four-product catalogue the
 * most useful next step is the shop itself.
 */
export default function NotFound() {
  return (
    <main className="px-page-x py-section-lg">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-display-l">This page doesn&apos;t exist.</h1>
        <Contour label="404" className="mt-section-sm" />
        <p className="mt-section-sm max-w-prose text-body-l text-muted-foreground">
          It may have moved, or the link may be old. Yego roasts a small
          lineup — everything we sell is a click away.
        </p>
        <div className="mt-section-sm flex flex-wrap gap-stack-md">
          <Link href="/shop" className={buttonVariants({ size: "lg" })}>
            See the coffee
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
