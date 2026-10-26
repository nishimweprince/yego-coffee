import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { tagsForWebhook, verifyShopifyHmac } from "@/lib/shopify/webhook";

/**
 * Shopify webhook receiver (plan.md §23).
 *
 * Register in Shopify admin → Settings → Notifications → Webhooks for
 * products/create, products/update, products/delete and
 * collections/update, pointing at <site>/api/shopify/webhook, and put
 * the signing secret in SHOPIFY_WEBHOOK_SECRET.
 *
 * It only marks cached catalogue reads stale; it never writes to
 * Shopify. Revalidation uses the "max" profile, so visitors keep the
 * cached page while the fresh one is fetched.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
  const rawBody = await request.text();

  if (
    !verifyShopifyHmac(
      rawBody,
      request.headers.get("x-shopify-hmac-sha256"),
      secret,
    )
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // A signed body that is not JSON still invalidates by topic.
  }

  const tags = tagsForWebhook(
    request.headers.get("x-shopify-topic"),
    payload,
  );
  for (const tag of tags) revalidateTag(tag, "max");

  return NextResponse.json({ ok: true, revalidated: tags });
}
