"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { setAnalyticsEnabled } from "@/lib/analytics/analytics";
import { setConsent, useConsent } from "@/lib/analytics/use-consent";

/**
 * Consent (plan.md §33).
 *
 * Shown only when a decision has not already been made, and never to a
 * browser sending Global Privacy Control — that browser has answered.
 *
 * Both choices are real buttons of equal weight. A "Decline" styled as
 * a faint link beside a prominent "Accept" is a dark pattern, and
 * §33's "least-data collection" is not served by making refusal harder
 * than agreement.
 */
export function ConsentBanner({ hasProviders }: { hasProviders: boolean }) {
  const consent = useConsent();

  // Not setState: this pushes the decision into the analytics façade,
  // which is module state outside React.
  useEffect(() => {
    setAnalyticsEnabled(consent === "granted");
  }, [consent]);

  // Asking for consent to collect nothing is theatre.
  if (!hasProviders || consent !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-elevated px-page-x py-stack-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-stack-md">
        <p className="max-w-prose text-body-s">
          We&apos;d like to measure how this site is used, so we can make
          it better. No personal details, and nothing at all unless you
          say yes.{" "}
          <Link href="/policies" className="underline underline-offset-4">
            Our policies
          </Link>
        </p>
        <div className="flex gap-stack-sm">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className={buttonVariants({ size: "md" })}
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
