import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Shopify webhooks (plan.md §23).
 *
 * The catalogue is cached for fifteen minutes (§22). When the owners
 * edit a product in Shopify admin, a webhook marks its cached reads
 * stale so the next visit fetches the new copy, rather than leaving
 * the old description up until the ceiling runs out — which is how
 * the "Subscription type" paragraphs went unseen (§110).
 */

/** True when `hmacHeader` is Shopify's signature of `rawBody`. */
export function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): boolean {
  if (!hmacHeader || !secret) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest();
  const received = Buffer.from(hmacHeader, "base64");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

/**
 * The cache tags a webhook invalidates. Every catalogue read carries
 * `shopify:products`, collections included, so that one tag covers a
 * product changing its title, price or collection; the handle tag is
 * named too so a single product's page is never left behind.
 */
export function tagsForWebhook(topic: string | null, payload: unknown): string[] {
  if (!topic) return [];
  const [resource] = topic.split("/");
  if (resource !== "products" && resource !== "collections") return [];

  const tags = ["shopify:products"];
  const handle =
    typeof payload === "object" &&
    payload !== null &&
    "handle" in payload &&
    typeof payload.handle === "string"
      ? payload.handle
      : null;

  if (handle) {
    tags.push(
      resource === "products"
        ? `shopify:product:${handle}`
        : `shopify:collection:${handle}`,
    );
  }
  if (resource === "collections") tags.push("shopify:collections");
  return tags;
}
