/**
 * The café (plan.md §91).
 *
 * Address and email are confirmed from the live site (§88). Phone and
 * hours are **carried-over placeholders**, not verified café details,
 * and §91 is explicit that they are safe to develop against and unsafe
 * to publish: a wrong number routes a real customer to a stranger, and
 * wrong hours turn someone away at the door.
 *
 * They are therefore held behind `provisional`, and nothing renders a
 * provisional value. Replacing them is a single edit here, and Phase 7
 * adds the build-time assertion §91 asks for so a production build
 * cannot ship while these are still true.
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

  /** UNVERIFIED — §91. Nothing may render these while true. */
  provisional: {
    phone: true,
    hours: true,
  },
  phone: "+1 816 352 9842",
  hours: {
    monday: [{ open: "08:00", close: "18:00" }],
    tuesday: [{ open: "08:00", close: "18:00" }],
    wednesday: [{ open: "08:00", close: "18:00" }],
    thursday: [{ open: "08:00", close: "18:00" }],
    friday: [{ open: "08:00", close: "18:00" }],
    saturday: [{ open: "08:00", close: "18:00" }],
    sunday: [{ open: "08:00", close: "18:00" }],
  } satisfies Record<string, OpeningHours[]>,
} as const;
