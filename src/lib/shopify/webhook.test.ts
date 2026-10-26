// @vitest-environment node
import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { tagsForWebhook, verifyShopifyHmac } = await import("./webhook");

const secret = "shpss_test";
const body = JSON.stringify({ handle: "dark-roast" });
const sign = (raw: string, key = secret) =>
  createHmac("sha256", key).update(raw, "utf8").digest("base64");

describe("verifyShopifyHmac", () => {
  it("accepts Shopify's signature of the exact body", () => {
    expect(verifyShopifyHmac(body, sign(body), secret)).toBe(true);
  });

  it("rejects a body that was altered after signing", () => {
    expect(verifyShopifyHmac(`${body} `, sign(body), secret)).toBe(false);
  });

  it("rejects a signature made with another secret", () => {
    expect(verifyShopifyHmac(body, sign(body, "other"), secret)).toBe(false);
  });

  it("rejects a missing header or an unset secret", () => {
    expect(verifyShopifyHmac(body, null, secret)).toBe(false);
    expect(verifyShopifyHmac(body, sign(body), "")).toBe(false);
  });
});

describe("tagsForWebhook", () => {
  it("invalidates the catalogue and the product's own reads", () => {
    expect(tagsForWebhook("products/update", { handle: "dark-roast" })).toEqual(
      ["shopify:products", "shopify:product:dark-roast"],
    );
  });

  it("invalidates collections by handle", () => {
    expect(
      tagsForWebhook("collections/update", { handle: "subscriptions" }),
    ).toEqual([
      "shopify:products",
      "shopify:collection:subscriptions",
      "shopify:collections",
    ]);
  });

  it("still invalidates the catalogue when the payload has no handle", () => {
    expect(tagsForWebhook("products/delete", { id: 1 })).toEqual([
      "shopify:products",
    ]);
  });

  it("ignores topics it does not handle", () => {
    expect(tagsForWebhook("orders/create", {})).toEqual([]);
    expect(tagsForWebhook(null, {})).toEqual([]);
  });
});
