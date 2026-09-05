import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Robots (plan.md §34).
 *
 * Preview deployments are excluded outright. A staging copy of a
 * storefront competing with the real one in search results is a
 * migration hazard §43 would otherwise inherit.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction && process.env.NODE_ENV === "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Not secrets — just pages with nothing to index.
      disallow: ["/api/", "/cart", "/search"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
