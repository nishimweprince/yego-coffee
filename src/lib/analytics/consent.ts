/**
 * Consent (plan.md §33).
 *
 * Analytics does not run until a visitor opts in. That is stricter
 * than US law currently requires for a US-only store, and it is the
 * position §33 points at: "least-data collection", opt-out signals,
 * Global Privacy Control consideration.
 *
 * Global Privacy Control is honoured as a decision, not a preference:
 * a browser sending GPC has already answered, and asking again with a
 * banner would be asking someone to repeat themselves until they say
 * yes.
 */

export const CONSENT_STORAGE_KEY = "yego.consent.analytics";

export type ConsentState = "granted" | "denied" | "unset";

type ConsentWindow = Window & {
  globalPrivacyControl?: boolean;
  navigator: Navigator & { globalPrivacyControl?: boolean };
};

/** True when the browser has signalled Global Privacy Control. */
export function hasGlobalPrivacyControl(win: Window = window): boolean {
  const w = win as ConsentWindow;
  return w.globalPrivacyControl === true ||
    w.navigator?.globalPrivacyControl === true;
}

export function readConsent(win: Window = window): ConsentState {
  // GPC overrides stored state in one direction only: it can deny, it
  // can never grant.
  if (hasGlobalPrivacyControl(win)) return "denied";

  try {
    const stored = win.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") return stored;
  } catch {
    // Storage can throw in private modes. An unreadable preference is
    // not consent.
  }
  return "unset";
}

export function writeConsent(
  state: Exclude<ConsentState, "unset">,
  win: Window = window,
): void {
  try {
    win.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // If it cannot be stored, the visitor will be asked again. That is
    // the correct failure direction.
  }
}
