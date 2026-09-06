import { CHECKOUT_URL, expect, requireCredentials, test } from "./fixtures";

/**
 * Flow B (§40) and §78 — the ordinary purchase. §78's point is that
 * the subscription-first strategy must never break plain commerce.
 */
test.describe("Flow B — shop to one-time checkout", () => {
  test.beforeEach(() => requireCredentials());

  test("a visitor can buy a coffee once, without meeting a subscription", async ({
    page,
  }) => {
    await page.goto("/shop");

    await expect(page.getByRole("heading", { name: "Coffee" })).toBeVisible();

    await page.getByRole("link", { name: /medium roast/i }).first().click();
    await expect(page).toHaveURL(/\/products\/medium-roast/);

    // `exact` because the sticky buy bar carries the same action with
    // the product name appended, so both are called "Add to cart".
    await page
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();

    // Adding opens the drawer rather than navigating away.
    const drawer = page.getByRole("dialog", { name: "Cart" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/subtotal/i)).toBeVisible();
    await expect(
      drawer.getByRole("link", { name: /^checkout$/i }),
    ).toHaveAttribute("href", CHECKOUT_URL);

    // The full cart page is still reachable and still authoritative.
    await drawer.getByRole("link", { name: /view full cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText(/subtotal/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^checkout$/i }),
    ).toHaveAttribute("href", CHECKOUT_URL);
  });

  test("the quantity stepper works on a variant Shopify oversells", async ({
    page,
  }) => {
    // Yego's catalogue reports negative quantityAvailable on variants
    // that are genuinely for sale (§96.4, §97.3). This is the
    // regression guard for the stepper that clamped to a negative max.
    await page.goto("/products/medium-roast");

    await page.getByRole("button", { name: /increase quantity/i }).click();
    await expect(page.getByLabel("Quantity: 2")).toBeVisible();
  });
});
