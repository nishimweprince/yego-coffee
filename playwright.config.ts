import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * `.env.local` into `process.env`, before anything reads it.
 *
 * This is §96.1 repeating itself. There, the Vitest harness built to
 * "run automatically the moment a token exists" skipped itself
 * forever, because Vitest does not load dotenv files and the skip
 * guard therefore saw empty strings. Playwright does not load them
 * either, and the first run of this suite skipped all 24 tests while
 * reporting success.
 *
 * The lesson generalises past both tools: **a suite that skips itself
 * when unconfigured must be checked against a run where it is
 * configured.** A skipped suite and a passing suite are the same
 * colour in a summary line.
 *
 * Parsed by hand rather than adding a dotenv dependency for four
 * lines; the web server loads the same file itself.
 */
function loadEnvLocal(): void {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq);
      if (process.env[key] === undefined) {
        process.env[key] = trimmed.slice(eq + 1);
      }
    }
  } catch {
    // Absent in CI, where real environment variables are set instead.
  }
}

loadEnvLocal();

/**
 * E2E configuration (plan.md §40).
 *
 * These run against the **real Shopify store**. That is deliberate:
 * §95 is a long record of how much can be green while nothing has
 * touched the real catalogue, and §77's funnel is only meaningful if
 * the prices, selling plans and checkout URL are Shopify's.
 *
 * Consequences worth stating:
 *   - the suite needs credentials, and skips loudly without them;
 *   - it creates real carts. It never completes a purchase — every
 *     flow stops at the checkout page, which is also exactly where
 *     §2.3 says this application's responsibility ends.
 */
const PORT = Number(process.env.E2E_PORT ?? 3210);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],

  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
