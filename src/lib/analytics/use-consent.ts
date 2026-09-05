"use client";

import { useSyncExternalStore } from "react";
import { readConsent, writeConsent, type ConsentState } from "./consent";

/**
 * Consent as external state (plan.md §33).
 *
 * It genuinely is external: it lives in `localStorage` and in the
 * browser's Global Privacy Control signal, is shared by every
 * component that cares, and can change in another tab. Reading it into
 * component state inside an effect is the pattern
 * `react-hooks/set-state-in-effect` exists to prevent, and
 * `useSyncExternalStore` is what it points at — it also gives correct
 * SSR behaviour for free, since the server cannot know the answer and
 * must assume "unset".
 */

const CONSENT_CHANGED = "yego:consent-changed";

function subscribe(onChange: () => void): () => void {
  // `storage` covers other tabs; the custom event covers this one,
  // where `storage` does not fire for the writer.
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_CHANGED, onChange);
  };
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(
    subscribe,
    () => readConsent(),
    () => "unset" as const,
  );
}

export function setConsent(next: Exclude<ConsentState, "unset">): void {
  writeConsent(next);
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}
