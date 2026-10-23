import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be taught this design system's token names.
 *
 * Out of the box it only recognises Tailwind's stock scales, so a
 * custom font size (`text-body-m`) and a custom text colour
 * (`text-accent-foreground`) look like the same `text-*` utility and
 * it silently drops one. That produced a primary button with dark
 * green text on a dark green fill — 2.2:1, effectively unreadable —
 * because the size variant overwrote the colour variant.
 *
 * Any new --text-* or semantic colour token must be added here.
 * The regression test in utils.test.ts guards the pairing.
 */
const twMerge = extendTailwindMerge({
  extend: {
    // The radii (--radius-pill, --radius-card, --radius-field) are
    // custom names too; without this, `cn("rounded-card",
    // "rounded-pill")` keeps both.
    theme: {
      radius: ["pill", "card", "tile", "field"],
    },
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-l",
            "h1",
            "h2",
            "h3",
            "h4",
            "lede",
            "body-l",
            "body-m",
            "body-s",
            "caption",
            "label",
            "price",
            "price-s",
            "control",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "background",
            "foreground",
            "surface",
            "surface-elevated",
            "muted",
            "muted-foreground",
            "border",
            "rule",
            "accent",
            "accent-foreground",
            "primary",
            "primary-foreground",
            "primary-hover",
            "ring",
            "success",
            "destructive",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
