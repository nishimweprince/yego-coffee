import { mapProductToCard } from "./product";
import type {
  ApiCollection,
  ApiPredictiveSearchQuery,
  ApiProduct,
  ApiSearchQuery,
} from "../types.api";
import type {
  CollectionModel,
  PredictiveSearchModel,
  SearchResultsModel,
} from "../types";

/** Raw API → view model (plan.md §29). */

export function mapCollection(
  collection: ApiCollection & {
    products: { edges: Array<{ node: ApiProduct }> };
  },
): CollectionModel {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    image: collection.image,
    products: collection.products.edges.map((e) => mapProductToCard(e.node)),
  };
}

export function mapPredictiveSearch(
  data: ApiPredictiveSearchQuery,
): PredictiveSearchModel {
  return {
    products: (data.predictiveSearch?.products ?? []).map(mapProductToCard),
    suggestions: (data.predictiveSearch?.queries ?? []).map((q) => ({
      text: q.text,
    })),
  };
}

export function mapSearchResults(data: ApiSearchQuery): SearchResultsModel {
  return {
    // The search connection is a union; non-product nodes come back as
    // empty objects because the query only spreads the product fragment.
    products: data.search.edges
      .map((e) => e.node)
      .filter((node): node is ApiProduct => "handle" in node)
      .map(mapProductToCard),
    totalCount: data.search.totalCount,
    hasNextPage: data.search.pageInfo.hasNextPage,
    endCursor: data.search.pageInfo.endCursor,
  };
}
