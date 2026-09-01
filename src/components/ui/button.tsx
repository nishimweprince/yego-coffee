import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button (plan.md §17.6).
 *
 * shadcn's structure — cva variants, asChild-free for now — with the
 * visual language replaced entirely. Corners are near-square: the
 * warmth in this system comes from the typeface, not from radii.
 * Press feedback is a 1px settle rather than a scale, which reads as
 * weight rather than bounce.
 */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-medium select-none",
    "transition-[background-color,color,border-color,translate] duration-150",
    "ease-(--ease-brand)",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        /* Green on every surface. Following --accent would turn this
           gold on dark, where white text measures 1.85:1. */
        primary:
          "bg-primary text-primary-foreground rounded-sm hover:bg-primary-hover",
        secondary:
          "border border-foreground/25 text-foreground rounded-sm hover:border-foreground/60 hover:bg-foreground/[0.04]",
        ghost: "text-foreground rounded-sm hover:bg-foreground/[0.06]",
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
        sm: "h-9 px-4 text-body-s",
        md: "h-11 px-6 text-body-m",
        lg: "h-13 px-8 text-body-l",
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
