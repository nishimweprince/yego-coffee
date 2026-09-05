import "server-only";

import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { excludeDuplicates } from "@/lib/catalog/duplicates";
import { storefrontRequest } from "./client";
import {
  mapCollection,
  mapPredictiveSearch,
  mapSearchResults,
} from "./mappers/collection";
import { mapProductToCard, mapProductToDetail } from "./mappers/product";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
} from "./queries/collections";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SHOP_QUERY,
} from "./queries/products";
import { PREDICTIVE_SEARCH_QUERY, SEARCH_QUERY } from "./queries/search";
import type {
  ApiCollectionByHandleQuery,
  ApiCollectionsQuery,
  ApiPredictiveSearchQuery,
  ApiProductByHandleQuery,
  ApiProductsQuery,
  ApiSearchQuery,
  ApiShopQuery,
} from "./types.api";
import type {
  CollectionModel,
  PredictiveSearchModel,
  ProductCardModel,
  ProductDetailModel,
  SearchResultsModel,
} from "./types";

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
    revalidate: CATALOGUE_REVALIDATE_SECONDS,
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
    revalidate: CATALOGUE_REVALIDATE_SECONDS,
  });

  return data.product ? mapProductToDetail(data.product) : null;
}

/**
 * Catalogue is cached and revalidated by tag (§22). Shopify webhooks
 * (§23) will invalidate these; the ceiling keeps a missed webhook from
 * serving a stale price indefinitely.
 */
const CATALOGUE_REVALIDATE_SECONDS = 60 * 15;

export async function getCollection(
  handle: string,
  first = 60,
): Promise<CollectionModel | null> {
  const data = await storefrontRequest<ApiCollectionByHandleQuery>({
    operation: "CollectionByHandle",
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, first },
    tags: [`shopify:collection:${handle}`, "shopify:products"],
    revalidate: CATALOGUE_REVALIDATE_SECONDS,
  });

  return data.collection ? mapCollection(data.collection) : null;
}

export async function getCollections(first = 20): Promise<CollectionModel[]> {
  const data = await storefrontRequest<ApiCollectionsQuery>({
    operation: "Collections",
    query: COLLECTIONS_QUERY,
    variables: { first },
    tags: ["shopify:collections"],
    revalidate: CATALOGUE_REVALIDATE_SECONDS,
  });

  return data.collections.edges.map((e) => ({
    ...mapCollection({ ...e.node, products: { edges: [] } }),
  }));
}

/**
 * Handles Shopify returns that a customer should not meet in a listing:
 * the duplicate subscription products of §92.1. Read from the store's
 * own collections and cached with the catalogue, so it self-corrects
 * when the consolidation happens.
 */
async function duplicateFilterSets(): Promise<{
  subscriptions: Set<string>;
  canonical: Set<string>;
}> {
  const [subscriptions, coffee, merch] = await Promise.all([
    getCollection(COLLECTION_HANDLES.subscriptions),
    getCollection(COLLECTION_HANDLES.coffee),
    getCollection(COLLECTION_HANDLES.merch),
  ]);

  return {
    subscriptions: new Set(
      (subscriptions?.products ?? []).map((p) => p.handle),
    ),
    canonical: new Set(
      [...(coffee?.products ?? []), ...(merch?.products ?? [])].map(
        (p) => p.handle,
      ),
    ),
  };
}

/**
 * Predictive search (§14.1). Short-lived cache per §22 — the query
 * string is the cache key, and stale suggestions are worse than a
 * request.
 */
export async function getPredictiveSearch(
  query: string,
  limit = 5,
): Promise<PredictiveSearchModel> {
  if (!query.trim()) return { products: [], suggestions: [] };

  const [data, sets] = await Promise.all([
    storefrontRequest<ApiPredictiveSearchQuery>({
      operation: "PredictiveSearch",
      query: PREDICTIVE_SEARCH_QUERY,
      variables: { query, limit },
      revalidate: 30,
    }),
    duplicateFilterSets(),
  ]);

  const results = mapPredictiveSearch(data);
  return {
    ...results,
    products: excludeDuplicates(
      results.products,
      sets.subscriptions,
      sets.canonical,
    ),
  };
}

export async function getSearchResults(
  query: string,
  first = 24,
  after?: string,
): Promise<SearchResultsModel> {
  if (!query.trim()) {
    return { products: [], totalCount: 0, hasNextPage: false, endCursor: null };
  }

  const [data, sets] = await Promise.all([
    storefrontRequest<ApiSearchQuery>({
      operation: "Search",
      query: SEARCH_QUERY,
      variables: { query, first, after: after ?? null },
      revalidate: 60,
    }),
    duplicateFilterSets(),
  ]);

  const results = mapSearchResults(data);
  const products = excludeDuplicates(
    results.products,
    sets.subscriptions,
    sets.canonical,
  );

  return {
    ...results,
    products,
    // Shopify counted what it matched, including the duplicates this
    // listing hides. Reporting its number next to a shorter list would
    // read as a bug (§48).
    totalCount: products.length,
  };
}
