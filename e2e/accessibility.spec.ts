import { expect, requireCredentials, test } from "./fixtures";

/**
 * Accessibility floor (plan.md §35).
 *
 * Not a substitute for an audit — these pin the structural properties
 * that silently regress: one h1, real landmarks, every control with an
 * accessible name, and a visible focus ring.
 */
const PAGES = [
  "/",
  "/shop",
  "/cafe",
  "/about",
  "/journal",
  "/subscriptions",
  "/policies",
  // Nested <main> elements lived here: the sign-in failure page
  // inherited the account layout's own <main> (§104.5).
  "/account/signin-failed",
];

test.describe("accessibility floor", () => {
  test.beforeEach(() => requireCredentials());

  for (const path of PAGES) {
    test(`${path} has one h1, a main landmark and a skippable header`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });

    test(`${path} names every control`, async ({ page }) => {
      await page.goto(path);

      // An icon-only control with no accessible name is invisible to a
      // screen reader (§18: "icon-only controls only with accessible
      // names").
      const unnamed = await page
        .locator("button, a[href]")
        .evaluateAll((nodes) =>
          nodes
            .filter((node) => {
              const el = node as HTMLElement;
              // Not in the accessibility tree at all, so not a control
              // a screen reader can land on. Product cards deliberately
              // hide the image link that duplicates the title link.
              if (el.closest('[aria-hidden="true"]')) return false;
              const text = (el.textContent ?? "").trim();
              const label = el.getAttribute("aria-label");
              const labelledBy = el.getAttribute("aria-labelledby");
              return !text && !label && !labelledBy;
            })
            .map((node) => (node as HTMLElement).outerHTML.slice(0, 120)),
        );

      expect(unnamed).toEqual([]);
    });
  }

  test("images carry alt text", async ({ page }) => {
    await page.goto("/shop");
    const missing = await page
      .locator("img")
      .evaluateAll((nodes) =>
        nodes
          .filter((n) => !(n as HTMLImageElement).hasAttribute("alt"))
          .map((n) => (n as HTMLImageElement).src),
      );
    expect(missing).toEqual([]);
  });

  test("the hero carousel is keyboard operable", async ({ page }) => {
    await page.goto("/");

    // The controls are real buttons, and the next slide's action
    // becomes reachable once it is shown (§108).
    const next = page.getByRole("button", { name: "Next slide" });
    await next.focus();
    await expect(next).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("link", { name: "Start a subscription" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pause slideshow" }),
    ).toBeVisible();
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/shop");
    const link = page.getByRole("link").first();
    await link.focus();

    const outline = await link.evaluate((el) => {
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(outline.style).not.toBe("none");
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });
});
