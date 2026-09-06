import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { hasShopifyCredentials } from "@/lib/env";
import { COLLECTION_HANDLES, SHOP_SECTIONS } from "@/lib/catalog/collections";
import { getArticles, getCollection, getPolicies } from "@/lib/shopify/storefront";

/**
 * Sitemap (plan.md §34).
 *
 * Built from what the store actually publishes, so a coffee added in
 * Shopify appears here without a code change. The duplicate
 * subscription products (§92.1) are listed too — they are real,
 * indexable URLs a customer can buy from today, and omitting them
 * would hide purchasable pages from search.
 *
 * /search and /cart are excluded: one is a query surface with infinite
 * variants, the other is per-visitor.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/shop`, lastModified: now, priority: 0.9 },
    { url: `${base}/quiz`, lastModified: now, priority: 0.9 },
    { url: `${base}/subscriptions`, lastModified: now, priority: 0.8 },
    { url: `${base}/about`, lastModified: now, priority: 0.6 },
    { url: `${base}/cafe`, lastModified: now, priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, priority: 0.5 },
    { url: `${base}/journal`, lastModified: now, priority: 0.5 },
    { url: `${base}/policies`, lastModified: now, priority: 0.3 },
    ...SHOP_SECTIONS.map((section) => ({
      url: `${base}/shop/${section.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];

  if (!hasShopifyCredentials()) return staticRoutes;

  const [coffee, merch, subscriptions, articles, policies] = await Promise.all([
    getCollection(COLLECTION_HANDLES.coffee),
    getCollection(COLLECTION_HANDLES.merch),
    getCollection(COLLECTION_HANDLES.subscriptions),
    getArticles(50),
    getPolicies(),
  ]);

  const productHandles = new Set(
    [coffee, merch, subscriptions]
      .flatMap((c) => c?.products ?? [])
      .map((p) => p.handle),
  );

  return [
    ...staticRoutes,
    ...[...productHandles].map((handle) => ({
      url: `${base}/products/${handle}`,
      lastModified: now,
      priority: 0.8,
    })),
    ...[coffee, merch, subscriptions]
      .filter((c) => c !== null)
      .map((c) => ({
        url: `${base}/collections/${c.handle}`,
        lastModified: now,
        priority: 0.5,
      })),
    ...articles.map((article) => ({
      url: `${base}/journal/${article.handle}`,
      lastModified: new Date(article.publishedAt),
      priority: 0.4,
    })),
    ...policies.map((policy) => ({
      url: `${base}/policies/${policy.handle}`,
      lastModified: now,
      priority: 0.2,
    })),
  ];
}
