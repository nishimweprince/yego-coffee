"use client";

import { useEffect } from "react";
import Script from "next/script";
import { registerSink } from "@/lib/analytics/analytics";

/**
 * Wires configured providers into the analytics façade (plan.md §31).
 *
 * Scripts are only rendered once consent has been granted — `strategy`
 * alone would still load them — so a visitor who declines never
 * downloads a vendor SDK, which is the difference between honouring
 * §33 and merely claiming to.
 *
 * GA4 is loaded through `next/script`; PostHog is left to a follow-up
 * because its SDK is a dependency this project does not yet have and
 * no key exists to test it against. The sink interface is the seam.
 */

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function AnalyticsProvider({
  gaMeasurementId,
  consented,
}: {
  gaMeasurementId?: string;
  consented: boolean;
}) {
  useEffect(() => {
    if (!consented || !gaMeasurementId) return;

    return registerSink((name, payload) => {
      const w = window as GtagWindow;
      w.gtag?.("event", name, payload);
    });
  }, [consented, gaMeasurementId]);

  if (!consented || !gaMeasurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { send_page_view: true });`}
      </Script>
    </>
  );
}
