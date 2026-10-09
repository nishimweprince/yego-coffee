import { cva, type VariantProps } from "class-variance-authority";

/**
 * The choice control — one recipe for every chip, square, row and card
 * that a visitor picks from.
 *
 * Roast filters, size and grind pickers, the delivery choice, the
 * quiz's answers and the cups-a-day squares all used to draw their own
 * border, their own hover and their own active state, and drifted:
 * some were square, some rounded, borders ranged from 20% to 40% ink.
 * Every one of them now resolves to this. A selected choice is ink on
 * ink; an unselected one is the standard border that darkens on hover.
 *
 * Focus is shown on the control itself for buttons, and on the label
 * (via `has-[:focus-visible]`) when the real control is a hidden radio.
 */
export const controlVariants = cva(
  [
    "border transition-colors",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
  ],
  {
    variants: {
      shape: {
        /** A short toggle: roast, size, grind, cups. */
        chip: "inline-flex min-h-11 rounded-control items-center px-4 text-body-s",
        /** A single figure. */
        square: "grid h-12 w-12 rounded-control place-items-center text-body-m tabular-nums",
        /** A full-width option with a radio mark and a price. */
        row: "flex min-h-11 rounded-control items-center justify-between gap-4 px-4 py-3",
        /** A tall answer with a headline. Large enough to read as a
            surface, so it takes the surface corner. */
        card: "group flex min-h-32 flex-col justify-between rounded-sm p-stack-md text-left",
      },
      state: {
        idle: "border-border hover:border-foreground",
        active: "border-foreground bg-foreground text-background",
        /** Selected, but stays on the page ground — for rows whose
            content carries its own mark and price. */
        outlined: "border-foreground",
        disabled:
          "cursor-not-allowed border-border text-muted-foreground line-through",
      },
    },
    defaultVariants: {
      shape: "chip",
      state: "idle",
    },
  },
);

export type ControlVariants = VariantProps<typeof controlVariants>;

/** The radio mark inside a row or card control. */
export function controlMark(active: boolean, onInk = false) {
  const idle = onInk ? "border-background" : "border-rule";
  const filled = onInk
    ? "border-background bg-background"
    : "border-foreground bg-foreground";
  return `block h-3 w-3 shrink-0 rounded-full border transition-colors ${
    active ? filled : idle
  }`;
}

/** Text inputs and selects. */
export const inputClassName =
  "min-h-11 rounded-sm border border-border bg-surface-elevated px-3 text-body-m " +
  "transition-colors hover:border-rule focus:border-foreground " +
  "focus:outline-none aria-[invalid=true]:border-destructive";
