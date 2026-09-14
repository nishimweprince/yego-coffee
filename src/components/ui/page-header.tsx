import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { href: string; label: string };

/**
 * A page title — the one heading recipe.
 *
 * `display` is for listing and statement pages (Shop, Subscriptions,
 * Journal, Contact); `h1` is for detail pages whose title is data (a
 * product, an order, a policy). The breadcrumb, when present, is the
 * product page's original markup so every route's trail reads alike.
 */
export function PageHeader({
  title,
  lede,
  breadcrumb,
  size = "display",
  id,
  className,
  children,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  breadcrumb?: Crumb[];
  size?: "display" | "h1";
  id?: string;
  className?: string;
  /** Anything that belongs under the lede — a filter row, a list. */
  children?: React.ReactNode;
}) {
  return (
    <header className={className}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-stack-sm">
          <ol className="flex flex-wrap items-center gap-2">
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
        className={cn(
          size === "display" ? "max-w-[20ch] text-display-l" : "text-h1",
        )}
      >
        {title}
      </h1>

      {lede ? (
        <p className="mt-stack-md max-w-prose text-lede text-muted-foreground">
          {lede}
        </p>
      ) : null}

      {children}
    </header>
  );
}
