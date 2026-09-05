import { expect, requireCredentials, test } from "./fixtures";

/**
 * Flow E (§40) — mobile navigation and cart, and §42's mobile
 * priorities: the primary CTA above the fold, readable without
 * animation, and controls that are actually tappable.
 */
test.describe("Flow E — mobile", () => {
  test.beforeEach(() => requireCredentials());

  test("the hero CTA is above the fold on a phone", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile project only");

    await page.goto("/");
    const cta = page.getByRole("link", { name: "Find My Coffee" }).first();

    const box = await cta.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("primary controls meet the 44px touch target floor", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "mobile", "mobile project only");

    // §42: button size sm (36px) is for dense UI; primary mobile CTAs
    // use md or lg.
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Find My Coffee" }).first();
    const box = await cta.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("a coffee can be added to the cart on a phone", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile project only");

    await page.goto("/products/dark-roast");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: /view cart/i }).click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText(/subtotal/i)).toBeVisible();
  });
});
