"use client";

import { AnalyticsProvider } from "./analytics-provider";
import { ConsentBanner } from "./consent-banner";
import { useConsent } from "@/lib/analytics/use-consent";

/**
 * One client island holding the consent decision and the providers it
 * gates (plan.md §31, §33). Mounted in the root layout; renders
 * nothing at all when no provider is configured.
 */
export function AnalyticsRoot({
  gaMeasurementId,
}: {
  gaMeasurementId?: string;
}) {
  const consent = useConsent();
  const hasProviders = Boolean(gaMeasurementId);

  if (!hasProviders) return null;

  return (
    <>
      <AnalyticsProvider
        gaMeasurementId={gaMeasurementId}
        consented={consent === "granted"}
      />
      <ConsentBanner hasProviders={hasProviders} />
    </>
  );
}
