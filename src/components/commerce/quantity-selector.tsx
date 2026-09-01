"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div
      className={cn(
        "inline-flex items-center border border-foreground/25",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="grid h-11 w-11 place-items-center transition-colors hover:bg-foreground/[0.06] disabled:opacity-30"
      >
        <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
      </button>

      {/* aria-live so the new value is announced without moving focus. */}
      <span
        aria-live="polite"
        aria-label={`${label}: ${value}`}
        className="w-10 text-center text-body-m tabular-nums"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="grid h-11 w-11 place-items-center transition-colors hover:bg-foreground/[0.06] disabled:opacity-30"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
      </button>
    </div>
  );
}
