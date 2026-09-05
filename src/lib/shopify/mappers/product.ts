import { formatCadence } from "../cadence";
import type {
  ApiProduct,
  ApiProductDetail,
  ApiSellingPlanAllocation,
  ApiVariant,
} from "../types.api";
import type {
  ProductCardModel,
  ProductDetailModel,
  SubscriptionOptionModel,
} from "../types";

/** Raw API → view model (plan.md §29). */

export function mapProductToCard(product: ApiProduct): ProductCardModel {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    availableForSale: product.availableForSale,
    tags: product.tags ?? [],
    productType: product.productType ?? "",
    options: (product.options ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      values: o.values,
    })),
    featuredImage: product.featuredImage
      ? {
          url: product.featuredImage.url,
          altText: product.featuredImage.altText,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
        }
      : null,
    minPrice: product.priceRange.minVariantPrice,
    maxPrice: product.priceRange.maxVariantPrice,
    hasSellingPlanGroup: (product.sellingPlanGroups?.edges.length ?? 0) > 0,
  };
}

/**
 * A percentage is only reported when Shopify's own allocation price is
 * below the variant's one-time price. It is never derived from a plan
 * name, a group name, or a percentage written into our code (§2.1,
 * §10.2). Every plan in Yego's store currently adjusts by 0%, so this
 * returns null throughout and no savings claim can be rendered (§96.5).
 */
function savingsPercentage(
  oneTimeAmount: string,
  planAmount: string,
): number | null {
  const oneTime = Number(oneTimeAmount);
  const onPlan = Number(planAmount);
  if (!Number.isFinite(oneTime) || !Number.isFinite(onPlan)) return null;
  if (oneTime <= 0 || onPlan >= oneTime) return null;

  return Math.round(((oneTime - onPlan) / oneTime) * 100);
}

function mapAllocation(
  allocation: ApiSellingPlanAllocation,
  variantPrice: { amount: string; currencyCode: string },
): SubscriptionOptionModel {
  const adjustment = allocation.priceAdjustments[0];
  const price = adjustment?.price ?? variantPrice;
  const policy = allocation.sellingPlan.deliveryPolicy;
  const interval = policy?.interval ?? null;
  const intervalCount = policy?.intervalCount ?? null;

  return {
    sellingPlanId: allocation.sellingPlan.id,
    name: allocation.sellingPlan.name,
    description: allocation.sellingPlan.description || null,
    // Generated from the policy. Never the plan's name — see cadence.ts.
    frequencyLabel: formatCadence(interval, intervalCount) ?? "",
    interval,
    intervalCount,
    price,
    compareAtPrice: adjustment?.compareAtPrice ?? null,
    savingsPercentage: savingsPercentage(variantPrice.amount, price.amount),
  };
}

function mapVariant(variant: ApiVariant) {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    selectedOptions: variant.selectedOptions,
    image: variant.image,
    subscriptionOptions: (variant.sellingPlanAllocations?.nodes ?? [])
      .map((a) => mapAllocation(a, variant.price))
      // A plan that states no cadence cannot be described to a customer
      // honestly, so it is not offered at all (§96.3).
      .filter((option) => option.frequencyLabel !== ""),
  };
}

export function mapProductToDetail(
  product: ApiProductDetail,
): ProductDetailModel {
  const card = mapProductToCard(product);

  return {
    ...card,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    media: product.images.edges.map((e) => ({
      url: e.node.url,
      altText: e.node.altText,
      width: e.node.width,
      height: e.node.height,
    })),
    variants: product.variants.edges.map((e) => mapVariant(e.node)),
    seoTitle: product.seo?.title ?? null,
    seoDescription: product.seo?.description ?? null,
  };
}
