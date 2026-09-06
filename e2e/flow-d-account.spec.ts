import { expect, requireCredentials, test } from "./fixtures";

/**
 * Flow D (plan.md §40) — the account area.
 *
 * §40's Flow D is "login → orders → subscription → update a supported
 * property". **That flow cannot run**: it needs Customer Account API
 * credentials, which do not exist (§100.5, §103.2). Signing in is not
 * something a test can fake past.
 *
 * What is tested here is everything on this side of the sign-in: the
 * auth boundary, which is the part that must not be wrong. A page that
 * renders account structure to a signed-out visitor, or a callback
 * that accepts a forged state, are failures that no amount of correct
 * post-login behaviour would excuse.
 */
test.describe("Flow D — the account boundary", () => {
  test.beforeEach(() => requireCredentials());

  const PROTECTED = [
    "/account",
    "/account/orders",
    "/account/subscriptions",
    "/account/addresses",
    "/account/profile",
  ];

  for (const path of PROTECTED) {
    test(`${path} is not served to a signed-out visitor`, async ({ page }) => {
      const response = await page.goto(path);

      // Either it redirects away, or — when customer accounts are not
      // configured at all — it says so. What it must never do is
      // render an account page with no session behind it.
      const url = page.url();
      const redirected = url.includes("/account/login") || !url.includes(path);

      if (!redirected) {
        await expect(
          page.getByText(/aren't available yet/i),
        ).toBeVisible();
      }

      expect(response?.status()).toBeLessThan(400);
    });
  }

  test("the sign-in callback refuses a forged state", async ({ page }) => {
    // No handshake cookies exist, so this is the shape of a stolen or
    // replayed authorization code arriving from somewhere else.
    await page.goto("/account/callback?code=stolen&state=forged");

    // It must not sign anyone in...
    await expect(page).toHaveURL(/\/account\/signin-failed/);
    await expect(
      page.getByRole("heading", { name: /sign-in didn't complete/i }),
    ).toBeVisible();

    // ...and must not say which check rejected it, which would tell
    // someone probing the flow what to fix (§39). Checked against the
    // page's own copy rather than the whole document: the footer says
    // "United States", and a naive /state/ match found that instead.
    const main = await page.getByRole("main").innerText();
    expect(main).not.toMatch(/\bstate\b|nonce|verifier|code_/i);
  });

  test("signing out is not a GET, so an image tag cannot trigger it", async ({
    request,
  }) => {
    // A GET logout lands somewhere sensible rather than performing one.
    const response = await request.get("/account/logout", {
      maxRedirects: 0,
    });
    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.headers()["location"]).toContain("/account");
  });
});
