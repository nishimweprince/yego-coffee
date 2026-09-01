import type { ApiProduct, ApiProductDetail } from "../types.api";
import type { ProductCardModel, ProductDetailModel } from "../types";

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
    options: product.options.map((o) => ({
      id: o.id,
      name: o.name,
      values: o.values,
    })),
    variants: product.variants.edges.map((e) => ({
      id: e.node.id,
      title: e.node.title,
      availableForSale: e.node.availableForSale,
      quantityAvailable: e.node.quantityAvailable,
      price: e.node.price,
      compareAtPrice: e.node.compareAtPrice,
      selectedOptions: e.node.selectedOptions,
      image: e.node.image,
    })),
    seoTitle: product.seo?.title ?? null,
    seoDescription: product.seo?.description ?? null,
  };
}
