"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { roastParamValue, type Roast } from "@/lib/catalog/facets";
import { track } from "@/lib/analytics/analytics";

/**
 * Roast filter (plan.md §12.2, §93.3).
 *
 * State lives in the query string, not in this component: the URL is
 * shareable, survives the back button, and is what the server renders
 * from. The control is a set of toggle buttons with `aria-pressed`
 * rather than checkboxes, because they act immediately.
 */
export function RoastFilter({
  options,
  selected,
}: {
  options: Array<{ value: Roast; label: string; count: number }>;
  selected: Roast[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // One roast is not a choice, it is a label. §93.3: a filter that
  // matches everything makes a small catalogue feel emptier.
  if (options.length < 2) return null;

  function toggle(value: Roast) {
    track({ name: "search_filter_applied", filter: "roast", value });
    const next = selected.includes(value)
      ? selected.filter((r) => r !== value)
      : [...selected, value];

    const params = new URLSearchParams(searchParams);
    const serialised = roastParamValue(next);
    if (serialised) params.set("roast", serialised);
    else params.delete("roast");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label mr-2 text-muted-foreground">Roast</span>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "min-h-11 border px-4 text-body-s transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/25 hover:border-foreground/60",
            )}
          >
            {option.label}
          </button>
        );
      })}
      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("roast");
            const queryString = params.toString();
            router.replace(
              queryString ? `${pathname}?${queryString}` : pathname,
              { scroll: false },
            );
          }}
          className="min-h-11 px-2 text-body-s text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
