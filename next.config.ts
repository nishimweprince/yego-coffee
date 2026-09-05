import type { NextConfig } from "next";
import { activeRedirects } from "./src/lib/seo/redirects";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
  },

  /**
   * Security headers (plan.md §39).
   *
   * No Content-Security-Policy yet: this app inlines JSON-LD and the
   * GA4 bootstrap, so a real CSP needs nonces threaded through those,
   * and a policy loose enough to permit `unsafe-inline` would announce
   * protection it does not provide. Phase 9 owns it.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  /** The §43 Phase 2 redirect sheet. */
  async redirects() {
    return activeRedirects().map(({ source, destination, permanent }) => ({
      source,
      destination,
      permanent,
    }));
  },
};

export default nextConfig;
