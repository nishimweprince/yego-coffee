import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

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

export const metadata: Metadata = {
  title: {
    default: "Yego Coffee",
    template: "%s · Yego Coffee",
  },
  description:
    "Family-owned Rwandan coffee, roasted in Somerville, Massachusetts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
      </body>
    </html>
  );
}
