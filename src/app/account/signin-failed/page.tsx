import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";

export const metadata: Metadata = {
  title: "Sign-in didn't complete",
  robots: { index: false, follow: false },
};

/**
 * Every sign-in failure lands here with the same message (§39).
 *
 * Distinguishing "your state was wrong" from "your code expired" would
 * tell someone probing the flow which check they had beaten. The
 * customer only needs to know it did not work and that trying again is
 * safe.
 */
export default function SignInFailedPage() {
  return (
    <main className="px-page-x py-section-lg">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-display-l">Sign-in didn&apos;t complete.</h1>
        <Contour className="mt-section-sm" />
        <p className="mt-section-sm max-w-prose text-body-l text-muted-foreground">
          The link may have expired, or the sign-in may have been
          interrupted. Starting again usually works.
        </p>
        <div className="mt-section-sm flex flex-wrap gap-stack-md">
          <Link href="/account/login" className={buttonVariants({ size: "lg" })}>
            Try again
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
