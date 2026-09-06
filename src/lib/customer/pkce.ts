/**
 * PKCE and the OAuth state/nonce values (plan.md §11.1, §39).
 *
 * Shopify's Customer Account API is a **public** OAuth client: there
 * is no client secret to prove who is redeeming an authorization code.
 * PKCE is what stands in for it, so these functions are the security
 * boundary of the whole account area rather than plumbing.
 *
 * Everything here is pure and uses Web Crypto, so it runs identically
 * in a Route Handler, in middleware and under test.
 */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * A high-entropy verifier. RFC 7636 allows 43–128 characters; 64
 * random bytes lands at 86, comfortably inside that and well past the
 * minimum, which exists because a guessable verifier defeats the whole
 * exchange.
 */
export function createCodeVerifier(): string {
  return base64UrlEncode(randomBytes(64));
}

export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64UrlEncode(new Uint8Array(digest));
}

/** CSRF value for the authorization round trip. */
export function createState(): string {
  return base64UrlEncode(randomBytes(32));
}

/** Replay guard, echoed back inside the ID token. */
export function createNonce(): string {
  return base64UrlEncode(randomBytes(32));
}

/**
 * Constant-time-ish comparison for the state check.
 *
 * `===` on a secret leaks its prefix through timing. The difference is
 * small over a network, but the cost of not doing it is also zero.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
