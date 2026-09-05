import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * `.env.local` is loaded into `process.env` for tests.
 *
 * Vite only exposes prefixed vars through `import.meta.env`, so without
 * this the live Storefront harness (§95.7) read empty credentials and
 * skipped itself even when a real token was present — a green run that
 * proved nothing. Loaded here rather than in the test so every suite
 * sees the same environment the app does.
 *
 * `loadEnv` comes from `vite`; `vitest/config` does not re-export it.
 */
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react()],
    resolve: { tsconfigPaths: true },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  };
});
