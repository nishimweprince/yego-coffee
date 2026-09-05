import { stripSensitive, type AnalyticsEvent } from "./events";

/**
 * The analytics façade (plan.md §31).
 *
 * Components call `track()` and know nothing about GA4, PostHog or
 * anything else. Three consequences worth having:
 *
 *   - the whole thing no-ops when no provider is configured, so the
 *     event layer ships and is testable before any key exists (§94.2's
 *     split-validation principle, applied to analytics);
 *   - consent is enforced in one place rather than at every call site;
 *   - §33's forbidden fields are stripped on the way out, once.
 *
 * Providers are registered at runtime by the client provider
 * component. Nothing here imports a vendor SDK.
 */

export type AnalyticsSink = (
  name: string,
  payload: Record<string, unknown>,
) => void;

const sinks = new Set<AnalyticsSink>();
let enabled = false;
/** Events fired before consent settles, replayed if it is granted. */
const buffer: AnalyticsEvent[] = [];
const BUFFER_LIMIT = 50;

export function registerSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

export function setAnalyticsEnabled(next: boolean): void {
  enabled = next;
  if (!enabled) {
    buffer.length = 0;
    return;
  }
  const pending = buffer.splice(0, buffer.length);
  for (const event of pending) emit(event);
}

export function isAnalyticsEnabled(): boolean {
  return enabled;
}

function emit(event: AnalyticsEvent): void {
  const { name, ...rest } = event;
  const payload = stripSensitive(rest as Record<string, unknown>);
  for (const sink of sinks) {
    try {
      sink(name, payload);
    } catch {
      // A failing analytics provider must never break the page it is
      // measuring.
    }
  }
}

export function track(event: AnalyticsEvent): void {
  if (!enabled) {
    // Buffered rather than dropped: a visitor who accepts after the
    // page loads should not lose the events that brought them there.
    // Bounded, so a visitor who never accepts costs nothing.
    if (buffer.length < BUFFER_LIMIT) buffer.push(event);
    return;
  }
  emit(event);
}

/** Test seam. */
export function resetAnalytics(): void {
  sinks.clear();
  enabled = false;
  buffer.length = 0;
}
