import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { href: string; label: string };

/**
 * A page title — the one heading recipe.
 *
 * `display` is for listing and statement pages (Shop, Subscriptions,
 * Journal, Contact); `h1` is for detail pages whose title is data (a
 * product, an order, a policy); `product` is the 40px title on a
 * product page. `align="center"` is the catalogue opening (§108): a
 * centred 48px title, 16px, then an 18px grey lede. The breadcrumb, when present, is the
 * product page's original markup so every route's trail reads alike.
 */
export function PageHeader({
  title,
  lede,
  breadcrumb,
  size = "display",
  align = "start",
  id,
  className,
  children,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  breadcrumb?: Crumb[];
  size?: "display" | "h1" | "product";
  align?: "start" | "center";
  id?: string;
  className?: string;
  /** Anything that belongs under the lede — a filter row, a list. */
  children?: React.ReactNode;
}) {
  return (
    <header
      className={cn(align === "center" && "mx-auto text-center", className)}
    >
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-stack-sm">
          <ol
            className={cn(
              "flex flex-wrap items-center gap-2",
              align === "center" && "justify-center",
            )}
          >
            {breadcrumb.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link
                  href={crumb.href}
                  className="label text-muted-foreground hover:text-foreground"
                >
                  {crumb.label}
                </Link>
                <span aria-hidden className="label text-muted-foreground">
                  /
                </span>
              </li>
            ))}
            <li>
              <span aria-current="page" className="label text-foreground">
                {title}
              </span>
            </li>
          </ol>
        </nav>
      ) : null}

      <h1
        id={id}
        data-reveal
        style={{ "--reveal-order": 1 } as React.CSSProperties}
        className={cn(
          size === "display" && "max-w-[20ch] text-display-l",
          size === "h1" && "text-h1",
          size === "product" && "text-h1",
          align === "center" && "mx-auto",
        )}
      >
        {title}
      </h1>

      {lede ? (
        <p
          data-reveal
          style={{ "--reveal-order": 2 } as React.CSSProperties}
          className={cn(
            "mt-4 max-w-[60ch] text-lede text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}

      {children}
    </header>
  );
}
