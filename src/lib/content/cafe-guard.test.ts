import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assertCafeDetailsAreReal } from "./cafe-guard";

/**
 * §91's placeholders would feed structured data, an "open now"
 * indicator and a tel: link. All three are costly to correct after
 * publication, so the guard exists to make shipping them loud rather
 * than silent.
 *
 * The café content no longer carries any unverified value — the
 * placeholder phone and hours were deleted rather than flagged, which
 * is why production builds pass again. So the mechanism is exercised
 * against a stubbed content module: these tests must keep failing the
 * build for the next person who adds an unconfirmed value, and they
 * cannot rely on the real data being broken to prove it.
 */
const content = vi.hoisted(() => ({
  provisional: {} as Record<string, boolean>,
}));

vi.mock("@/content/cafe", () => ({
  CAFE: { provisional: content.provisional },
}));

beforeEach(() => {
  for (const field of Object.keys(content.provisional)) {
    delete content.provisional[field];
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assertCafeDetailsAreReal", () => {
  it("says nothing during ordinary local development", () => {
    content.provisional.phone = true;
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });

  it("fails a production deploy while a placeholder stands", () => {
    content.provisional.phone = true;
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).toThrow(/§91/);
  });

  it("names the fields that are still unresolved", () => {
    content.provisional.phone = true;
    content.provisional.hours = true;
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).toThrow(/phone and hours/);
  });

  it("can be forced locally, so the check is testable before a deploy", () => {
    content.provisional.hours = true;
    vi.stubEnv("YEGO_ASSERT_LAUNCH_READY", "1");
    expect(() => assertCafeDetailsAreReal()).toThrow(/cannot be published/);
  });

  it("stays quiet on a preview deploy", () => {
    content.provisional.phone = true;
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });

  it("passes a production deploy once nothing is provisional", () => {
    // The state the repository is actually in, and the reason the
    // build is green.
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });

  it("passes when a value is present but confirmed", () => {
    content.provisional.phone = false;
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertCafeDetailsAreReal()).not.toThrow();
  });
});
