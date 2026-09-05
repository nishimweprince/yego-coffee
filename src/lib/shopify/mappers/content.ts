import type {
  ApiArticle,
  ApiPage,
  ApiPoliciesQuery,
  ApiPolicy,
} from "../types.api";
import type { ArticleModel, PageModel, PolicyModel } from "../types";

/** Raw API → view model (plan.md §29). */

export function mapPage(page: ApiPage): PageModel {
  return {
    handle: page.handle,
    title: page.title,
    bodyHtml: page.body,
    summary: page.bodySummary,
    seoTitle: page.seo?.title ?? null,
    seoDescription: page.seo?.description ?? null,
  };
}

function mapPolicy(policy: ApiPolicy | null): PolicyModel | null {
  // A policy the store never wrote comes back null, and must stay
  // absent rather than becoming an empty page (§48).
  if (!policy?.body?.trim()) return null;
  return {
    handle: policy.handle,
    title: policy.title,
    bodyHtml: policy.body,
  };
}

export function mapPolicies(data: ApiPoliciesQuery): PolicyModel[] {
  return [
    data.shop.shippingPolicy,
    data.shop.refundPolicy,
    data.shop.privacyPolicy,
    data.shop.termsOfService,
    data.shop.subscriptionPolicy,
  ]
    .map(mapPolicy)
    .filter((policy): policy is PolicyModel => policy !== null);
}

export function mapArticle(article: ApiArticle): ArticleModel {
  return {
    id: article.id,
    handle: article.handle,
    title: article.title,
    excerpt: article.excerpt?.trim() || null,
    contentHtml: article.contentHtml ?? null,
    publishedAt: article.publishedAt,
    image: article.image,
    seoTitle: article.seo?.title ?? null,
    seoDescription: article.seo?.description ?? null,
  };
}
