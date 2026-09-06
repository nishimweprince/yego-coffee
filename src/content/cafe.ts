/**
 * The café (plan.md §91).
 *
 * Address and email are confirmed from the live site (§88).
 *
 * **Phone and opening hours are deliberately absent.** They were held
 * here as carried-over placeholders behind a `provisional` flag — a
 * number with a Missouri area code for a café in Somerville,
 * Massachusetts, and an invented 08:00–18:00 all week. Nothing
 * rendered them, but §91's launch guard reads these flags, so their
 * presence failed every production deploy: the site could not ship at
 * all until someone produced the real values.
 *
 * Unverified data that nothing displays is not worth the risk of one
 * day being displayed. Deleting it satisfies §91 outright rather than
 * gating it, and the guard stays armed for anything added later.
 *
 * To publish them: add `phone` / `hours` back with values confirmed by
 * the owners, and add the matching `provisional` entries set to
 * `false`. Set an entry to `true` only while a value is still
 * unverified — that is what the guard is for, and it will stop the
 * deploy until it is resolved.
 */

export type OpeningHours = { open: string; close: string };

export const CAFE = {
  addressLine: "1212 Broadway",
  locality: "Somerville",
  region: "MA",
  postalCode: "02144",
  country: "US",
  get fullAddress() {
    return `${this.addressLine}, ${this.locality}, ${this.region} ${this.postalCode}`;
  },
  /** Google Maps needs no API key for a directions link (§16). */
  get directionsUrl() {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `Yego Coffee, ${this.addressLine}, ${this.locality}, ${this.region} ${this.postalCode}`,
    )}`;
  },

  /**
   * Fields whose values exist but are not yet confirmed by the owners.
   * `true` blocks a production deploy (see cafe-guard.ts). Empty is the
   * correct state: nothing unverified is carried here.
   */
  provisional: {} as Record<string, boolean>,
} as const;
