import { CHECKOUT_URL, expect, requireCredentials, test } from "./fixtures";

/**
 * Flow A (plan.md §40) — "the most important E2E test in the system".
 *
 * The quiz that used to sit in the middle of this flow was removed at
 * the client's request (§108). The promise is unchanged: a visitor can
 * go from the homepage, through the plans, to a Shopify-priced
 * subscription carried into Shopify's checkout.
 */
test.describe("Flow A — home to subscription checkout", () => {
  test.beforeEach(() => requireCredentials());

  test("a visitor can go from the homepage to a subscription checkout", async ({
    page,
  }) => {
    await page.goto("/");

    // The first slide's headline is the page's one h1.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // The subscription slide is the second; hidden slides are inert,
    // so the visitor moves to it first, as a person would.
    await page.getByRole("button", { name: "Next slide" }).click();
    await page.getByRole("link", { name: "Start a subscription" }).click();
    await expect(page).toHaveURL(/\/subscriptions/);

    // §2.1: a real price, from Shopify.
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();

    await page.locator('main a[href^="/products/"]').first().click();
    await expect(page).toHaveURL(/\/products\//);

    // §108: the two cadences are named once and twice a month.
    await page
      .getByRole("radio", { name: /once a month|twice a month/i })
      .first()
      .check();

    await page
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();

    const drawer = page.getByRole("dialog", { name: "Cart" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: /view full cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);

    // §15.1: a subscription line states its cadence, and that cadence
    // comes from the delivery policy (§96.3) — never the plan's name.
    const cadence = page.getByText(
      /once a month|twice a month|every \d+ (day|week|month)s?|every (day|week|month)/i,
    );
    await expect(cadence.first()).toBeVisible();

    const checkout = page.getByRole("link", { name: /^checkout$/i });
    await expect(checkout).toHaveAttribute("href", CHECKOUT_URL);
  });

  test("the retired quiz URL lands on the shop", async ({ page }) => {
    await page.goto("/quiz");
    await expect(page).toHaveURL(/\/shop$/);
  });
});
