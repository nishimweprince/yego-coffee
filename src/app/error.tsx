"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";

/**
 * The error boundary (plan.md §37).
 *
 * §37's distinction matters: a failure to reach Shopify is not the
 * customer's fault and must not read like an empty store — §95.3 made
 * the same call for `StoreUnavailable`, because a store that looks
 * empty is exactly how a misconfigured deploy survives to production.
 *
 * The underlying error is logged, never shown: Shopify's messages can
 * carry query internals (§39).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry or equivalent takes over here (§46); until then the
    // platform's own logs are the destination.
    console.error(error);
  }, [error]);

  return (
    <main className="px-page-x py-section-lg">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-display-l">Something went wrong.</h1>
        <Contour label="Error" className="mt-section-sm" />
        <p className="mt-section-sm max-w-prose text-body-l text-muted-foreground">
          This is on us, not on you. Trying again often works. The
          problem is usually a moment&apos;s trouble reaching our
          catalogue.
        </p>
        {error.digest ? (
          <p className="mt-stack-md text-body-s text-muted-foreground">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-section-sm flex flex-wrap gap-stack-md">
          <button
            type="button"
            onClick={reset}
            className={buttonVariants({ size: "lg" })}
          >
            Try again
          </button>
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
