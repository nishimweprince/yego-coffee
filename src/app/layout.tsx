import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ChromeScroll } from "@/components/layout/chrome-scroll";
import { AnalyticsRoot } from "@/components/analytics/analytics-root";
import { env, getAnalyticsEnv } from "@/lib/env";

// Font Awesome ships its own <style> injection, which races Next's CSS
// and flashes oversized icons on first paint. We import the stylesheet
// above instead and turn the injection off (§18).
config.autoAddCss = false;

/**
 * One family, DM Sans, in three registers (see globals.css).
 *
 * Variable on optical size and weight, so the display, body and
 * utility registers cost one file between them rather than one per
 * weight. There is no width axis on this face.
 */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
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
      className={`${dmSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* One wrapper so a full-screen hero can float the whole bar
            over its footage — see "chrome over film" in globals.css.
            On every other route this is an inert div. */}
        <div data-chrome>
          <AnnouncementBar />
          <SiteHeader />
        </div>
        <ChromeScroll />
        {children}
        <SiteFooter />
        <AnalyticsRoot
          gaMeasurementId={analytics.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
