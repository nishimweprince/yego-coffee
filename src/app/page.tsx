import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";

/**
 * Holding page.
 *
 * Deliberately not the homepage — §90 specifies that build, and it is
 * out of scope for Phase 1. This states where the project actually is
 * rather than standing in a half-built hero.
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center px-page-x py-section-md">
      <div className="mx-auto w-full max-w-3xl">
        <p className="label text-muted-foreground">Yego Coffee</p>
        <h1 className="mt-stack-lg text-display-l font-display max-w-[14ch]">
          Rwandan coffee, roasted in Somerville.
        </h1>
        <p className="mt-stack-md max-w-[52ch] text-body-l text-muted-foreground">
          The headless storefront is in foundation. The design system is
          standing; the catalogue connects once Storefront credentials land.
        </p>

        <Contour label="In progress" className="mt-section-sm" />

        <div className="mt-stack-lg">
          <Link
            href="/foundations"
            className={buttonVariants({ variant: "secondary" })}
          >
            View design foundations
          </Link>
        </div>
      </div>
    </main>
  );
}
