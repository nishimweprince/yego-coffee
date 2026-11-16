import { afterEach, describe, expect, it, vi } from "vitest";

const subscribe = vi.fn();
vi.mock("@/lib/shopify/admin", () => ({
  subscribeToEmailMarketing: (email: string) => subscribe(email),
}));

import { subscribeToNewsletterAction } from "./newsletter";

afterEach(() => {
  subscribe.mockReset();
  vi.restoreAllMocks();
});

describe("subscribeToNewsletterAction", () => {
  it("normalises the address before it reaches Shopify", async () => {
    subscribe.mockResolvedValue("subscribed");
    await expect(
      subscribeToNewsletterAction({ email: "  Someone@Example.COM " }),
    ).resolves.toEqual({ ok: true });
    expect(subscribe).toHaveBeenCalledWith("someone@example.com");
  });

  it("rejects an invalid address without calling Shopify", async () => {
    const result = await subscribeToNewsletterAction({ email: "not-an-email" });
    expect(result).toEqual({ ok: false, message: "Enter a valid email address" });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("answers a filled honeypot with a quiet success", async () => {
    const result = await subscribeToNewsletterAction({
      email: "bot@example.com",
      website: "http://spam.example",
    });
    expect(result).toEqual({ ok: true });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("keeps Shopify's error in the log and gives the visitor one plain sentence", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    subscribe.mockRejectedValue(new Error("Shopify GraphQL errors: Access denied"));
    const result = await subscribeToNewsletterAction({ email: "a@b.co" });
    expect(result).toEqual({
      ok: false,
      message: "Something went wrong. Try again in a moment.",
    });
    expect(log).toHaveBeenCalled();
  });
});
