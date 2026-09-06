/**
 * Where to send a customer after login (plan.md §11.1).
 *
 * An open redirect is the classic way a login flow becomes a phishing
 * tool: `?returnTo=https://evil.example` sends someone from a genuine
 * login straight to an attacker's page, with the trust of having just
 * authenticated. Only same-site paths are ever honoured.
 */

const DEFAULT_RETURN_TO = "/account";

export function sanitiseReturnTo(candidate: string | null | undefined): string {
  if (!candidate) return DEFAULT_RETURN_TO;

  // Must be a path on this site: one leading slash, and not the
  // protocol-relative "//host" form, which browsers treat as absolute.
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }
  // A backslash is normalised to a slash by some browsers, so "/\evil"
  // can escape the origin.
  if (candidate.includes("\\")) return DEFAULT_RETURN_TO;

  return candidate;
}
