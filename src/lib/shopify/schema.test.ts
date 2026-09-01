import { describe, expect, it } from "vitest";
import { buildClientSchema, parse, validate, type IntrospectionQuery } from "graphql";
import introspection from "@shopify/hydrogen-react/storefront.schema.json";
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

/**
 * Validates every operation against Shopify's real Storefront schema,
 * published in @shopify/hydrogen-react.
 *
 * This is the check that closes the gap the mocked integration tests
 * cannot: those fixtures were written from the same reading of the API
 * that produced the queries, so they agree by construction. The schema
 * is an independent source of truth. It catches fields that do not
 * exist, wrong argument names and types, bad variable types, and
 * fragments on the wrong type — the failures that would otherwise only
 * appear on the first live request.
 *
 * It does not replace §95.5. A schema is not a store: it says nothing
 * about credentials, this shop's catalogue, or what the data looks like.
 */

const schema = buildClientSchema(
  introspection as unknown as IntrospectionQuery,
);

const operations: Array<[string, string]> = [
  ["Shop", SHOP_QUERY],
  ["Products", PRODUCTS_QUERY],
  ["ProductByHandle", PRODUCT_BY_HANDLE_QUERY],
  ["Cart", CART_QUERY],
  ["CartCreate", CART_CREATE_MUTATION],
  ["CartLinesAdd", CART_LINES_ADD_MUTATION],
  ["CartLinesUpdate", CART_LINES_UPDATE_MUTATION],
  ["CartLinesRemove", CART_LINES_REMOVE_MUTATION],
];

describe.each(operations)("%s validates against the Storefront schema", (name, source) => {
  it("has no schema errors", () => {
    const errors = validate(schema, parse(source)).map((e) => e.message);
    // Surfaced in the failure message so the fix is obvious.
    expect({ operation: name, errors }).toEqual({ operation: name, errors: [] });
  });
});
