import { describe, expect, it } from "vitest";
import { sanitiseReturnTo } from "./return-to";

/**
 * An open redirect on a login route is a phishing primitive: it sends
 * someone away from a genuine sign-in with the trust of having just
 * authenticated.
 */
describe("sanitiseReturnTo", () => {
  it("keeps an ordinary same-site path", () => {
    expect(sanitiseReturnTo("/account/orders")).toBe("/account/orders");
  });

  it("keeps a path with a query string", () => {
    expect(sanitiseReturnTo("/shop?roast=light")).toBe("/shop?roast=light");
  });

  it("falls back when nothing was requested", () => {
    expect(sanitiseReturnTo(null)).toBe("/account");
    expect(sanitiseReturnTo(undefined)).toBe("/account");
    expect(sanitiseReturnTo("")).toBe("/account");
  });

  it("refuses an absolute URL", () => {
    expect(sanitiseReturnTo("https://evil.example/login")).toBe("/account");
    expect(sanitiseReturnTo("http://evil.example")).toBe("/account");
  });

  it("refuses a protocol-relative URL, which browsers treat as absolute", () => {
    expect(sanitiseReturnTo("//evil.example")).toBe("/account");
  });

  it("refuses a backslash path, which some browsers normalise to //", () => {
    expect(sanitiseReturnTo("/\\evil.example")).toBe("/account");
    expect(sanitiseReturnTo("\\\\evil.example")).toBe("/account");
  });

  it("refuses a scheme without a host", () => {
    expect(sanitiseReturnTo("javascript:alert(1)")).toBe("/account");
  });
});
