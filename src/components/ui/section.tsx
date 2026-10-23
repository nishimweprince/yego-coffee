import { cn } from "@/lib/utils";

/**
 * A page section — the one container recipe.
 *
 * Every route used to write its own `px-page-x py-section-md` and
 * `mx-auto max-w-*` pair, and the widths drifted between 3xl and 6xl
 * with no rule. Two widths exist now: `page` (76rem, a shop's catalogue
 * width) for anything laid out in columns, `prose` for a single
 * reading column.
 *
 * A Server Component; it renders a `<section>` (or another element via
 * `as`) so headings and `aria-labelledby` work as they always did.
 */
export function Section({
  as: Tag = "section",
  width = "page",
  space = "md",
  className,
  innerClassName,
  children,
  ...rest
}: Omit<React.HTMLAttributes<HTMLElement>, "ref"> & {
  as?: "section" | "div" | "header" | "article";
  width?: "page" | "prose";
  space?: "sm" | "md" | "lg" | "none";
  innerClassName?: string;
}) {
  return (
    <Tag
      className={cn(
        "px-page-x",
        space === "sm" && "py-section-sm",
        space === "md" && "py-section-md",
        space === "lg" && "py-section-lg",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "mx-auto",
          width === "page" ? "max-w-page" : "max-w-prose",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
