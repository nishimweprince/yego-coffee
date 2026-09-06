import { z } from "zod";

/**
 * Input schemas for customer mutations (plan.md §24, §11.7).
 *
 * §24 requires validation on the server as well as the client, and
 * §11.7 requires every subscription or account mutation to be
 * validated and authorised server-side. These schemas are the shared
 * definition: the form validates with them in the browser for a fast
 * error, and the Server Action validates with them again because the
 * browser's validation is a courtesy, not a control.
 */

const optionalText = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((v) => (v ? v : undefined));

export const ProfileSchema = z.object({
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
});

/** What the form holds. */
export type ProfileFormValues = z.input<typeof ProfileSchema>;
/** What the action receives, after trimming and defaults. */
export type ProfileInput = z.output<typeof ProfileSchema>;

export const AddressSchema = z.object({
  firstName: optionalText,
  lastName: optionalText,
  company: optionalText,
  address1: z.string().trim().min(1, "Street address is required").max(255),
  address2: optionalText,
  city: z.string().trim().min(1, "City is required").max(120),
  /** Two-letter state code, e.g. MA. Yego ships within the US (§88). */
  zoneCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use a two-letter state code, e.g. MA")
    .transform((v) => v.toUpperCase()),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Use a ZIP code, e.g. 02144"),
  territoryCode: z
    .string()
    .trim()
    .length(2)
    .default("US")
    .transform((v) => v.toUpperCase()),
  phoneNumber: optionalText,
  setAsDefault: z.boolean().optional(),
});

/**
 * The schema trims, upper-cases and defaults, so its input and output
 * types differ. The form holds the input shape; the action receives
 * the output. Conflating them is how a required field with a default
 * ends up marked required in a form that never asks for it.
 */
export type AddressFormValues = z.input<typeof AddressSchema>;
export type AddressInput = z.output<typeof AddressSchema>;

/**
 * Shopify ids are opaque `gid://` strings. Accepting anything else
 * from a form and forwarding it to the API is how an id from
 * somewhere else gets tried; the API would reject it, but the check
 * belongs here too (§11.7: validated ownership).
 */
export const ShopifyIdSchema = z
  .string()
  .trim()
  .regex(/^gid:\/\/shopify\/[A-Za-z]+\/[A-Za-z0-9_-]+$/, "Invalid id");
