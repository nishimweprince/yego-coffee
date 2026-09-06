import type { Metadata } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsRoot } from "@/components/analytics/analytics-root";
import { env, getAnalyticsEnv } from "@/lib/env";

// Font Awesome ships its own <style> injection, which races Next's CSS
// and flashes oversized icons on first paint. We import the stylesheet
// above instead and turn the injection off (§18).
config.autoAddCss = false;

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
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
    images: ["/brand/brew.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/brew.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const analytics = getAnalyticsEnv();

  return (
    <html
      lang="en"
      data-surface="mist"
      className={`${archivo.variable} ${sourceSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AnnouncementBar />
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
