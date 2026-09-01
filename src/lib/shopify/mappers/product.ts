import type { ApiProduct } from "../types.api";
import type { ProductCardModel } from "../types";

/** Raw API → view model (plan.md §29). */

export function mapProductToCard(
  product: ApiProduct,
): ProductCardModel {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    availableForSale: product.availableForSale,
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
    subscriptionAvailable:
      (product.sellingPlanGroups?.edges.length ?? 0) > 0,
  };
}
