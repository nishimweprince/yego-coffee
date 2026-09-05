import { expect, requireCredentials, test } from "./fixtures";

/** Flow C (§40) — search to product. */
test.describe("Flow C — search", () => {
  test.beforeEach(() => requireCredentials());

  test("predictive search finds a real coffee and leads to it", async ({
    page,
  }) => {
    await page.goto("/shop");

    await page.getByRole("button", { name: "Search" }).click();
    await page.getByLabel(/search coffee and gear/i).fill("gatare");

    // Scoped to the panel: the shop grid behind it also links to
    // Gatare, and an unscoped locator matched the covered one.
    const panel = page.getByRole("dialog", { name: "Search" });
    const result = panel.getByRole("link", { name: /gatare/i }).first();
    await expect(result).toBeVisible({ timeout: 15_000 });
    await result.click();

    await expect(page).toHaveURL(/\/products\//);
  });

  test("full search hides the duplicate subscription products", async ({
    page,
  }) => {
    // §97.2: searching "dark" returned eight results, four of them
    // "Dark Roast - ... Subscription". This is that regression.
    await page.goto("/search?q=dark");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("dark");
    await expect(page.getByText(/- monthly subscription/i)).toHaveCount(0);
    await expect(page.getByText(/- bi-monthly subscription/i)).toHaveCount(0);
  });

  test("a search with no matches says what to do next", async ({ page }) => {
    await page.goto("/search?q=zzzzzzzz");
    await expect(page.getByText(/nothing matched that search/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /see everything/i })).toBeVisible();
  });
});
