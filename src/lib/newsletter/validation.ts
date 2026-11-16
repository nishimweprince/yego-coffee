import { z } from "zod";

/**
 * The newsletter form's schema — shared by the browser (a courtesy)
 * and the Server Action (the control), so they cannot disagree.
 *
 * `website` is a honeypot: hidden from people, filled by bots. It is
 * accepted here and checked in the action, which answers a filled one
 * with a quiet success and never calls Shopify.
 */
export const NewsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address")
    .max(254, "That email address is too long")
    .email("Enter a valid email address"),
  website: z.string().max(200).optional(),
});

export type NewsletterFormValues = z.input<typeof NewsletterSchema>;
export type NewsletterInput = z.output<typeof NewsletterSchema>;
