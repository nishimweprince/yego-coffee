"use server";

import { subscribeToEmailMarketing } from "@/lib/shopify/admin";
import { NewsletterSchema } from "@/lib/newsletter/validation";

export type NewsletterResult = { ok: true } | { ok: false; message: string };

const GENERIC = "Something went wrong. Try again in a moment.";

/**
 * Footer newsletter signup (plan.md §50).
 *
 * Validates again on the server, drops honeypot submissions with a
 * success the bot cannot tell apart from a real one, and writes the
 * consent to Shopify. Shopify's error stays in the server log; the
 * visitor gets one plain sentence.
 */
export async function subscribeToNewsletterAction(
  input: unknown,
): Promise<NewsletterResult> {
  const parsed = NewsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address",
    };
  }

  if (parsed.data.website) return { ok: true };

  try {
    await subscribeToEmailMarketing(parsed.data.email);
    return { ok: true };
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return { ok: false, message: GENERIC };
  }
}
