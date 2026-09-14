"use client";

import { isOptionValueAvailable } from "@/lib/shopify/variants";
import { cn } from "@/lib/utils";
import { controlVariants } from "@/components/ui/control";
import type { ProductOptionModel, ProductVariantModel } from "@/lib/shopify/types";

/**
 * Real radio inputs under the styling. Custom-looking option chips that
 * are actually divs are the usual way this control loses keyboard and
 * screen-reader support (§35), so the input stays and only its
 * presentation is replaced.
 *
 * Values that lead nowhere sellable are disabled rather than hidden —
 * seeing that a size exists but is out of stock is information.
 */
export function VariantSelector({
  options,
  variants,
  selection,
  onSelect,
  className,
}: {
  options: ProductOptionModel[];
  variants: ProductVariantModel[];
  selection: Record<string, string>;
  onSelect: (optionName: string, value: string) => void;
  className?: string;
}) {
  // A single option with a single value carries no choice — Shopify's
  // default "Title / Default Title" variant. Rendering it as a control
  // would be noise.
  const meaningful = options.filter(
    (o) => o.values.length > 1 || options.length > 1,
  );
  if (meaningful.length === 0) return null;

  return (
    <div className={cn("space-y-stack-lg", className)}>
      {meaningful.map((option) => (
        <fieldset key={option.id}>
          <legend className="label text-muted-foreground">{option.name}</legend>
          <div className="mt-stack-sm flex flex-wrap gap-2">
            {option.values.map((value) => {
              const checked = selection[option.name] === value;
              const available = isOptionValueAvailable(
                variants,
                selection,
                option.name,
                value,
              );

              return (
                <label
                  key={value}
                  className={cn(
                    "relative cursor-pointer",
                    controlVariants({
                      state: !available
                        ? "disabled"
                        : checked
                          ? "active"
                          : "idle",
                    }),
                  )}
                >
                  <input
                    type="radio"
                    name={option.name}
                    value={value}
                    checked={checked}
                    disabled={!available}
                    onChange={() => onSelect(option.name, value)}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
