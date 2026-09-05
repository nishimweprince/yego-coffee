import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsRoot } from "@/components/analytics/analytics-root";
import { env, getAnalyticsEnv } from "@/lib/env";

// Font Awesome ships its own <style> injection, which races Next's CSS
// and flashes oversized icons on first paint. We import the stylesheet
// above instead and turn the injection off (§18).
config.autoAddCss = false;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

/**
 * `metadataBase` makes every relative canonical and Open Graph URL in
 * the app absolute (§34). Without it Next emits relative OG URLs,
 * which most crawlers discard silently.
 */
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Yego Coffee",
    template: "%s · Yego Coffee",
  },
  description:
    "Family-owned Rwandan coffee, roasted in Somerville, Massachusetts.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Yego Coffee",
    locale: "en_US",
    title: "Yego Coffee",
    description:
      "Family-owned Rwandan coffee, roasted in Somerville, Massachusetts.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const analytics = getAnalyticsEnv();

  return (
    <html
      lang="en"
      data-surface="mist"
      className={`${fraunces.variable} ${archivo.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
        <AnalyticsRoot
          gaMeasurementId={analytics.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
