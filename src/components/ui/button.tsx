import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button (plan.md §17.6, §108).
 *
 * shadcn's structure — cva variants, asChild-free for now — with the
 * visual language replaced entirely. Every button is a pill
 * (--radius-pill) in a 600 weight, the way a shop's actions read at a
 * glance against rounded photographs. Interaction is communicated by
 * colour and rule changes, not floating shadows or movement.
 */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-semibold select-none rounded-pill",
    "transition-[background-color,color,border-color] duration-200",
    "ease-(--ease-brand)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
  ],
  {
    variants: {
      variant: {
        /* Ink on paper, paper on the dark surfaces. Kept off --accent
           so roast stays rare enough to mean something (§106). */
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "border border-foreground text-foreground hover:bg-foreground hover:text-background",
        ghost: "text-foreground hover:bg-muted",
        /* Editorial link: the rule grows from the leading edge, the
           way a pen underlines — not a fade-in. */
        link: [
          "relative px-0 text-foreground",
          "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px",
          "after:origin-left after:scale-x-0 after:bg-current",
          "after:transition-transform after:duration-300 after:ease-(--ease-brand)",
          "hover:after:scale-x-100",
        ],
      },
      size: {
        /* 48px, 15px/600 — the shop's one button height. `lg` is
           the same height with more room either side. */
        sm: "h-9 px-4 text-body-s",
        md: "h-12 px-7 text-control",
        lg: "h-12 px-9 text-control",
      },
    },
    compoundVariants: [
      { variant: "link", size: "sm", class: "h-auto px-0" },
      { variant: "link", size: "md", class: "h-auto px-0" },
      { variant: "link", size: "lg", class: "h-auto px-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
