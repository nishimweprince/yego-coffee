import { describe, expect, it } from "vitest";
import {
  createCodeChallenge,
  createCodeVerifier,
  createNonce,
  createState,
  safeEqual,
} from "./pkce";

/**
 * Shopify's Customer Account API is a public OAuth client — no client
 * secret. PKCE is the only thing preventing a stolen authorization
 * code from being redeemed by someone else, so these are not plumbing
 * tests.
 */
describe("PKCE", () => {
  it("produces a verifier within RFC 7636's length bounds", () => {
    const verifier = createCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
  });

  it("produces URL-safe verifiers with no padding", () => {
    for (let i = 0; i < 20; i++) {
      expect(createCodeVerifier()).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  });

  it("never repeats a verifier", () => {
    const seen = new Set(Array.from({ length: 200 }, createCodeVerifier));
    expect(seen.size).toBe(200);
  });

  it("derives a stable S256 challenge from a verifier", async () => {
    const verifier = "test-verifier-value";
    const a = await createCodeChallenge(verifier);
    const b = await createCodeChallenge(verifier);
    expect(a).toBe(b);
  });

  it("matches the S256 challenge from RFC 7636's worked example", async () => {
    // The specification's own vector, so this checks the algorithm
    // rather than checking our implementation against itself.
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    expect(await createCodeChallenge(verifier)).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("gives different challenges for different verifiers", async () => {
    const a = await createCodeChallenge(createCodeVerifier());
    const b = await createCodeChallenge(createCodeVerifier());
    expect(a).not.toBe(b);
  });

  it("produces URL-safe state and nonce values", () => {
    expect(createState()).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(createNonce()).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it("never repeats a state value", () => {
    const seen = new Set(Array.from({ length: 200 }, createState));
    expect(seen.size).toBe(200);
  });
});

describe("safeEqual", () => {
  it("accepts identical values", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });

  it("rejects different values of the same length", () => {
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });

  it("rejects values of different lengths", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("rejects an empty value against a real one", () => {
    expect(safeEqual("", "abc")).toBe(false);
  });

  it("rejects a prefix, which is the case === leaks through timing", () => {
    expect(safeEqual("secret", "sec")).toBe(false);
  });
});
