import { CHECKOUT_URL, expect, requireCredentials, test } from "./fixtures";

/**
 * Flow A (plan.md §40) and §77's acceptance criteria — "the most
 * important E2E test in the system".
 *
 * It asserts the things §77 actually promises: that a visitor can
 * reach a recommendation without giving an email, see why it was
 * chosen, see a Shopify-derived price, and carry a subscription
 * through to Shopify's checkout.
 */
test.describe("Flow A — home to subscription checkout", () => {
  test.beforeEach(() => requireCredentials());

  test("a visitor can go from the homepage to a subscription checkout", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /coffee worth slowing down for/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Find My Coffee" }).first().click();
    await expect(page).toHaveURL(/\/quiz/);

    // §77: no email may be required before the result.
    await expect(page.locator('input[type="email"]')).toHaveCount(0);

    await page.getByRole("radio", { name: /rich & chocolatey/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: /^ground$/i }).click();

    // §9.6: the result explains itself from the answers given.
    await expect(page.getByText(/why we picked it/i)).toBeVisible();
    await expect(page.getByText(/you said rich and chocolatey/i)).toBeVisible();

    // §2.1: a real price, from Shopify.
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();

    const subscribe = page.getByRole("button", {
      name: /start my subscription|add to cart/i,
    });
    await expect(subscribe).toBeEnabled();
    await subscribe.click();

    await page.getByRole("link", { name: /view cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);

    // §15.1: a subscription line states its cadence, and that cadence
    // comes from the delivery policy (§96.3) — never "Bi-Monthly",
    // which means two different things in English.
    const cadence = page.getByText(/every \d+ (day|week|month)s?|every (day|week|month)/i);
    await expect(cadence.first()).toBeVisible();

    const checkout = page.getByRole("link", { name: /^checkout$/i });
    await expect(checkout).toHaveAttribute("href", CHECKOUT_URL);
  });
});
