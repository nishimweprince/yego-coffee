import { cn } from "@/lib/utils";

/**
 * A labelled field (plan.md §24).
 *
 * §24: "no placeholder-only labels". The label is always rendered and
 * always associated, because a placeholder disappears the moment
 * someone starts typing — which is exactly when they need to check
 * what the field was.
 */
export function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-stack-xs", className)}>
      <label htmlFor={id} className="label text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-body-s text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-body-s text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "min-h-11 border border-foreground/25 bg-background px-3 text-body-m " +
  "transition-colors hover:border-foreground/40 focus:border-foreground " +
  "focus:outline-none aria-[invalid=true]:border-destructive";
