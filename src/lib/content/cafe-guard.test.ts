import { afterEach, describe, expect, it, vi } from "vitest";
import { assertCafeDetailsAreReal } from "./cafe-guard";

/**
 * §91's placeholders feed structured data, an "open now" indicator and
 * a tel: link. All three are costly to correct after publication, so
 * the guard exists to make shipping them loud rather than silent.
 */
describe("assertCafeDetailsAreReal", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("says nothing during ordinary local development", () => {
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });

  it("fails a production deploy while the placeholders stand", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).toThrow(/§91/);
  });

  it("names the fields that are still unresolved", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).toThrow(/phone and hours/);
  });

  it("can be forced locally, so the check is testable before a deploy", () => {
    vi.stubEnv("YEGO_ASSERT_LAUNCH_READY", "1");
    expect(() => assertCafeDetailsAreReal()).toThrow(/cannot be published/);
  });

  it("stays quiet on a preview deploy", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });
});
