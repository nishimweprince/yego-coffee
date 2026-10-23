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
 * §108 adds two slots the owners will fill — opening hours and the
 * drinks the café pours. Both start empty, and /cafe renders each row
 * only once it has entries. Fill them only with values the owners have
 * confirmed. While a value is still unverified, add a matching
 * `provisional` entry set to `true`: the guard will stop a production
 * deploy until it is resolved.
 */

/** One line of the opening hours, written the way the door sign is:
 * `{ days: "Monday to Friday", hours: "7am to 4pm" }`. */
export type OpeningHours = { days: string; hours: string };

/** One drink, with an optional short line under it. */
export type MenuItem = { name: string; note?: string };

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

  /** Owners to supply (§108). Empty renders nothing. */
  hours: [] as readonly OpeningHours[],

  /** Owners to supply (§108). Empty renders nothing. */
  menu: [] as readonly MenuItem[],

  /**
   * Fields whose values exist but are not yet confirmed by the owners.
   * `true` blocks a production deploy (see cafe-guard.ts). Empty is the
   * correct state: nothing unverified is carried here.
   */
  provisional: {} as Record<string, boolean>,
} as const;
