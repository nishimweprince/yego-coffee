import "server-only";

import { storefrontRequest } from "./client";
import { mapProductToCard, mapProductToDetail } from "./mappers/product";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SHOP_QUERY,
} from "./queries/products";
import type {
  ApiProductByHandleQuery,
  ApiProductsQuery,
  ApiShopQuery,
} from "./types.api";
import type { ProductCardModel, ProductDetailModel } from "./types";

/**
 * Typed Storefront reads (plan.md §21.1).
 *
 * This is the surface the rest of the app imports. Nothing above this
 * layer knows that Shopify speaks GraphQL.
 */

export async function getProducts(first = 24): Promise<ProductCardModel[]> {
  const data = await storefrontRequest<ApiProductsQuery>({
    operation: "Products",
    query: PRODUCTS_QUERY,
    variables: { first },
    tags: ["shopify:products"],
  });

  return data.products.edges.map((edge) => mapProductToCard(edge.node));
}

export type ShopIdentity = {
  name: string;
  primaryDomainUrl: string;
};

/** Connectivity probe — the Phase 1 exit criterion (§75). */
export async function getShopIdentity(): Promise<ShopIdentity> {
  const data = await storefrontRequest<ApiShopQuery>({
    operation: "Shop",
    query: SHOP_QUERY,
    tags: ["shopify:shop"],
  });

  return {
    name: data.shop.name,
    primaryDomainUrl: data.shop.primaryDomain.url,
  };
}

export async function getProduct(
  handle: string,
): Promise<ProductDetailModel | null> {
  const data = await storefrontRequest<ApiProductByHandleQuery>({
    operation: "ProductByHandle",
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [`shopify:product:${handle}`, "shopify:products"],
  });

  return data.product ? mapProductToDetail(data.product) : null;
}
