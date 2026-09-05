import { HOME } from "@/content/home";

/**
 * §90.04 — the brand statement.
 *
 * This replaces §8.4's placeholder manifesto with Yego's actual
 * founding story (§88): a Kinyarwanda word for yes, a family
 * rebuilding, four decades in coffee. §90 is explicit that this is
 * stronger and more specific than generic "slow down for coffee" copy,
 * and it is the emotional core the editorial direction is built on.
 *
 * Set on the soil surface, where the gold accent reaches 7.83:1 and
 * becomes usable (§94.3).
 */
export function BrandStatement() {
  return (
    <section data-surface="soil" className="px-page-x py-section-lg">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-display-l">{HOME.statement.headline}</h2>

        <div className="mt-stack-lg max-w-prose space-y-stack-xs text-body-l text-muted-foreground">
          {HOME.statement.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <ol className="mt-section-md grid gap-x-8 gap-y-stack-lg sm:grid-cols-2 lg:grid-cols-4">
          {HOME.statement.principles.map((principle, index) => (
            <li key={principle}>
              {/* A real ordinal, not an invented sequence number on a
                  contour rule (§93.5) — these are a numbered list. */}
              <span className="label text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-stack-sm text-body-l">{principle}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
