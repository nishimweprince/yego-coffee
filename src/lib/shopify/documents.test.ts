import { describe, expect, it } from "vitest";
import { parse, type DefinitionNode, type DocumentNode } from "graphql";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SHOP_QUERY,
} from "./queries/products";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./queries/cart";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
} from "./queries/collections";
import { PREDICTIVE_SEARCH_QUERY, SEARCH_QUERY } from "./queries/search";
import {
  ARTICLES_QUERY,
  ARTICLE_BY_HANDLE_QUERY,
  PAGE_BY_HANDLE_QUERY,
  POLICIES_QUERY,
} from "./queries/content";
import {
  ADDRESSES_QUERY,
  ADDRESS_CREATE_MUTATION,
  ADDRESS_DELETE_MUTATION,
  ADDRESS_UPDATE_MUTATION,
  CUSTOMER_QUERY,
  ORDERS_QUERY,
  ORDER_QUERY,
  PROFILE_UPDATE_MUTATION,
  SUBSCRIPTIONS_QUERY,
} from "@/lib/customer/queries";

/**
 * These documents are assembled by interpolating fragment strings, which
 * makes three failure modes easy to introduce and impossible to see by
 * reading: a fragment spread with no definition, the same fragment
 * appended twice, and more than one operation in a document. Shopify
 * rejects all three at request time — this catches them at test time,
 * without needing credentials.
 */

const documents: Array<[string, string]> = [
  ["Shop", SHOP_QUERY],
  ["Products", PRODUCTS_QUERY],
  ["ProductByHandle", PRODUCT_BY_HANDLE_QUERY],
  ["Cart", CART_QUERY],
  ["CartCreate", CART_CREATE_MUTATION],
  ["CartLinesAdd", CART_LINES_ADD_MUTATION],
  ["CartLinesUpdate", CART_LINES_UPDATE_MUTATION],
  ["CartLinesRemove", CART_LINES_REMOVE_MUTATION],
  ["CollectionByHandle", COLLECTION_BY_HANDLE_QUERY],
  ["Collections", COLLECTIONS_QUERY],
  ["PredictiveSearch", PREDICTIVE_SEARCH_QUERY],
  ["Search", SEARCH_QUERY],
  ["PageByHandle", PAGE_BY_HANDLE_QUERY],
  ["Policies", POLICIES_QUERY],
  ["Articles", ARTICLES_QUERY],
  ["ArticleByHandle", ARTICLE_BY_HANDLE_QUERY],
  /*
   * The Customer Account API documents (§11).
   *
   * These matter more here than the Storefront ones, not less. The
   * Storefront documents have three independent checks behind them —
   * this one, validation against Shopify's published schema (§95.10),
   * and execution against a live API (§95.13, §96.2). No published
   * schema exists for the Customer Account API, so composition and
   * syntax are the *only* automated checks these get before a real
   * token exists (§103.2).
   */
  ["CustomerOverview", CUSTOMER_QUERY],
  ["CustomerOrders", ORDERS_QUERY],
  ["CustomerOrder", ORDER_QUERY],
  ["CustomerAddresses", ADDRESSES_QUERY],
  ["CustomerSubscriptions", SUBSCRIPTIONS_QUERY],
  ["CustomerUpdate", PROFILE_UPDATE_MUTATION],
  ["CustomerAddressCreate", ADDRESS_CREATE_MUTATION],
  ["CustomerAddressUpdate", ADDRESS_UPDATE_MUTATION],
  ["CustomerAddressDelete", ADDRESS_DELETE_MUTATION],
];

function fragmentNames(defs: readonly DefinitionNode[]): string[] {
  return defs
    .filter((d) => d.kind === "FragmentDefinition")
    .map((d) => d.name.value);
}

function spreadNames(doc: DocumentNode): Set<string> {
  const found = new Set<string>();
  JSON.stringify(doc, (key, value) => {
    if (
      value &&
      typeof value === "object" &&
      "kind" in value &&
      value.kind === "FragmentSpread"
    ) {
      found.add(value.name.value);
    }
    return value;
  });
  return found;
}

describe.each(documents)("%s document", (name, source) => {
  it("is syntactically valid GraphQL", () => {
    expect(() => parse(source)).not.toThrow();
  });

  it("declares exactly one operation", () => {
    const ops = parse(source).definitions.filter(
      (d) => d.kind === "OperationDefinition",
    );
    expect(ops).toHaveLength(1);
  });

  it("names its operation to match its export", () => {
    const op = parse(source).definitions.find(
      (d) => d.kind === "OperationDefinition",
    );
    expect(op?.kind === "OperationDefinition" && op.name?.value).toBe(name);
  });

  it("defines every fragment it spreads", () => {
    const doc = parse(source);
    const defined = new Set(fragmentNames(doc.definitions));
    const missing = [...spreadNames(doc)].filter((n) => !defined.has(n));
    expect(missing).toEqual([]);
  });

  it("defines no fragment twice", () => {
    const names = fragmentNames(parse(source).definitions);
    expect(names).toEqual([...new Set(names)]);
  });

  it("spreads every fragment it defines", () => {
    const doc = parse(source);
    const spread = spreadNames(doc);
    const unused = fragmentNames(doc.definitions).filter(
      (n) => !spread.has(n),
    );
    expect(unused).toEqual([]);
  });
});
