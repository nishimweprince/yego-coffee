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
   * ## The CSP decision, and why it is not nonce-based
   *
   * §39 asks for a strict CSP. A strict (nonce-based) CSP was built,
   * measured, and removed, because it does not work with this app's
   * rendering strategy — and it fails in the worst way, silently at
   * build time and loudly in the browser:
   *
   *   A nonce is per-request. Statically prerendered HTML is written
   *   once at build time. So every script on `/`, `/about`, `/cafe`,
   *   `/journal`, `/policies` and `/subscriptions` carried no matching
   *   nonce and the browser blocked all of them. The homepage was a
   *   blank page with 26 CSP violations in the console.
   *
   * The only way to have both is to render every page per request,
   * which trades §22's explicit "homepage: long cache" and §36's
   * "performance is a conversion feature" for script protection on a
   * storefront that handles no payment data itself (§2.3) and renders
   * HTML only from its own Shopify admin.
   *
   * So this policy is strict in every dimension that does not require
   * a nonce — where data may be sent, where forms may post, what may
   * be embedded, what may embed us — and permits inline scripts,
   * which Next's own bootstrap requires. It does not claim to stop
   * script injection, and the comment says so rather than leaving a
   * reviewer to assume it.
   *
   * **The lever, if that trade is ever wrong:** add back a middleware
   * that sets a per-request nonce and mark the static routes
   * `export const dynamic = "force-dynamic"`. Both halves are needed;
   * either alone produces the blank page above.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is required by Next's inline bootstrap and by
      // the prerendered pages above. See the note on this block.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://cdn.shopify.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      // Where the browser may send data. This is the directive that
      // limits exfiltration, and it needs no nonce to be strict.
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
      // Checkout is a top-level navigation to Shopify (§2.3).
      "form-action 'self' https://yegocoffee.com https://*.myshopify.com",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      /*
       * Only where there is something to upgrade.
       *
       * WebKit applies `upgrade-insecure-requests` to `localhost`;
       * Chrome exempts it. So on a production build served over plain
       * HTTP — which is what `next start` and the E2E suite do —
       * Safari upgraded every stylesheet and font request to https,
       * they failed, and the page rendered completely unstyled. Eight
       * mobile tests failed on layout while every Chromium test
       * passed, which is the second time in this phase that a
       * WebKit-only difference hid behind a green Chromium run
       * (§102.3).
       *
       * On a real HTTPS deployment the directive is emitted and does
       * its job; on http it would be meaningless anyway.
       */
      ...(process.env.VERCEL_ENV === "production"
        ? ["upgrade-insecure-requests"]
        : []),
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
