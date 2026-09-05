import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAnalyticsEnabled,
  registerSink,
  resetAnalytics,
  setAnalyticsEnabled,
  track,
} from "./analytics";
import { stripSensitive } from "./events";
import {
  CONSENT_STORAGE_KEY,
  hasGlobalPrivacyControl,
  readConsent,
  writeConsent,
} from "./consent";

afterEach(() => {
  resetAnalytics();
});

/**
 * Storage is faked rather than taken from the environment. jsdom does
 * not expose `localStorage` under this Node version, and the consent
 * module accepts an injected window precisely so its behaviour can be
 * pinned without one — including the case where storage throws, which
 * no real browser will reproduce on demand.
 */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  };
}

describe("the analytics façade", () => {
  it("sends nothing before consent", () => {
    const sink = vi.fn();
    registerSink(sink);
    track({ name: "cart_opened" });
    expect(sink).not.toHaveBeenCalled();
  });

  it("replays what happened before consent, once granted", () => {
    const sink = vi.fn();
    registerSink(sink);
    track({ name: "product_viewed", handle: "dark-roast" });
    setAnalyticsEnabled(true);
    expect(sink).toHaveBeenCalledWith("product_viewed", {
      handle: "dark-roast",
    });
  });

  it("discards the buffer when consent is refused", () => {
    const sink = vi.fn();
    registerSink(sink);
    track({ name: "cart_opened" });
    setAnalyticsEnabled(false);
    setAnalyticsEnabled(true);
    expect(sink).not.toHaveBeenCalled();
  });

  it("bounds the buffer so a visitor who never consents costs nothing", () => {
    const sink = vi.fn();
    registerSink(sink);
    for (let i = 0; i < 200; i++) track({ name: "cart_opened" });
    setAnalyticsEnabled(true);
    expect(sink.mock.calls.length).toBeLessThanOrEqual(50);
  });

  it("no-ops entirely when no provider is registered", () => {
    setAnalyticsEnabled(true);
    expect(() => track({ name: "cart_opened" })).not.toThrow();
  });

  // A failing analytics provider must never break the page.
  it("survives a sink that throws", () => {
    const good = vi.fn();
    registerSink(() => {
      throw new Error("provider down");
    });
    registerSink(good);
    setAnalyticsEnabled(true);
    expect(() => track({ name: "cart_opened" })).not.toThrow();
    expect(good).toHaveBeenCalled();
  });

  it("stops sending after a sink unregisters", () => {
    const sink = vi.fn();
    const off = registerSink(sink);
    setAnalyticsEnabled(true);
    off();
    track({ name: "cart_opened" });
    expect(sink).not.toHaveBeenCalled();
  });

  it("reports whether it is enabled", () => {
    expect(isAnalyticsEnabled()).toBe(false);
    setAnalyticsEnabled(true);
    expect(isAnalyticsEnabled()).toBe(true);
  });
});

/**
 * §33 forbids sending addresses, payment data, auth tokens and
 * unnecessary customer identifiers to analytics. The event types
 * already exclude them; this is the backstop for the day a payload is
 * widened.
 */
describe("stripSensitive", () => {
  it("drops anything that looks like personal or credential data", () => {
    expect(
      stripSensitive({
        handle: "dark-roast",
        email: "someone@example.com",
        address1: "1212 Broadway",
        accessToken: "shpat_x",
        cardNumber: "4111111111111111",
        customerId: "gid://shopify/Customer/1",
      }),
    ).toEqual({ handle: "dark-roast" });
  });

  it("matches case-insensitively and inside longer names", () => {
    expect(stripSensitive({ customerEmail: "x", shippingAddress: "y" })).toEqual(
      {},
    );
  });

  it("leaves ordinary commerce fields alone", () => {
    const payload = { handle: "medium-roast", quantity: 2, cadence: "Every month" };
    expect(stripSensitive(payload)).toEqual(payload);
  });
});

describe("consent", () => {
  function fakeWindow(overrides: Record<string, unknown> = {}): Window {
    return {
      localStorage: memoryStorage(),
      navigator: {},
      ...overrides,
    } as unknown as Window;
  }

  it("treats an unset preference as not consented", () => {
    expect(readConsent(fakeWindow())).toBe("unset");
  });

  it("remembers a granted preference", () => {
    const storage = memoryStorage();
    const win = fakeWindow({ localStorage: storage });
    writeConsent("granted", win);
    expect(readConsent(win)).toBe("granted");
    expect(storage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
  });

  it("remembers a refusal", () => {
    const win = fakeWindow();
    writeConsent("denied", win);
    expect(readConsent(win)).toBe("denied");
  });

  // GPC has already answered the question; asking again would be
  // asking someone to repeat themselves until they say yes.
  it("honours Global Privacy Control as a refusal", () => {
    expect(hasGlobalPrivacyControl(fakeWindow({ globalPrivacyControl: true })))
      .toBe(true);
    expect(readConsent(fakeWindow({ globalPrivacyControl: true }))).toBe("denied");
  });

  it("reads Global Privacy Control from navigator too", () => {
    const win = fakeWindow({ navigator: { globalPrivacyControl: true } });
    expect(readConsent(win)).toBe("denied");
  });

  it("lets GPC override a stored grant, never the reverse", () => {
    const storage = memoryStorage();
    const win = fakeWindow({ localStorage: storage, globalPrivacyControl: true });
    writeConsent("granted", win);
    expect(readConsent(win)).toBe("denied");
  });

  it("treats unreadable storage as no consent", () => {
    const win = fakeWindow({
      localStorage: {
        getItem() {
          throw new Error("blocked");
        },
        setItem() {
          throw new Error("blocked");
        },
      },
    });
    expect(readConsent(win)).toBe("unset");
    expect(() => writeConsent("granted", win)).not.toThrow();
  });
});
