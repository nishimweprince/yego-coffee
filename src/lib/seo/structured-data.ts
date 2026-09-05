import { BRAND } from "@/content/brand";
import type { ArticleModel, ProductDetailModel } from "@/lib/shopify/types";

/**
 * JSON-LD builders (plan.md §34).
 *
 * Every value comes from Shopify or from §88's confirmed facts.
 * Structured data is redistributed and cached by search engines, so
 * anything speculative here is far more expensive than the same
 * mistake in page copy — which is why the café's unverified hours and
 * phone are absent from its schema (§91, §100.3).
 */

export function productJsonLd(
  product: ProductDetailModel,
  url: string,
): Record<string, unknown> {
  const sellable = product.variants.filter((v) => v.availableForSale);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.media.map((m) => m.url).slice(0, 5),
    brand: { "@type": "Brand", name: BRAND.name },
    url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.minPrice.currencyCode,
      lowPrice: product.minPrice.amount,
      highPrice: product.maxPrice.amount,
      offerCount: product.variants.length,
      availability: sellable.length
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function articleJsonLd(
  article: ArticleModel,
  url: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.image ? [article.image.url] : undefined,
    datePublished: article.publishedAt,
    url,
    publisher: { "@type": "Organization", name: BRAND.name },
  };
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
