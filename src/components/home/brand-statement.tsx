import Image from "next/image";
import { HOME } from "@/content/home";

/**
 * §90.04 — the brand statement.
 *
 * Yego's actual founding story (§88): a Kinyarwanda word for yes, a
 * family rebuilding, four decades in coffee. The live site's founder
 * portrait now stands beside the words, so the story arrives with
 * faces instead of floating type on an empty field.
 *
 * Set on the soil surface, where the gold accent reaches 7.83:1 and
 * becomes usable (§94.3).
 */
export function BrandStatement() {
  return (
    <section data-surface="soil" className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-display-l">{HOME.statement.headline}</h2>

          <div className="mt-stack-lg max-w-prose space-y-stack-xs text-body-l text-muted-foreground">
            {HOME.statement.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <ol className="mt-section-md grid gap-x-8 gap-y-stack-lg sm:grid-cols-2">
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

        <figure>
          <Image
            src="/brand/founders.jpg"
            alt="Fatuma and Francois Tuyishime, the family behind Yego Coffee"
            width={1500}
            height={1000}
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="lazy"
            className="aspect-[3/2] w-full rounded-sm object-cover"
          />
          <figcaption className="mt-stack-sm text-body-s text-muted-foreground">
            Fatuma and Francois Tuyishime, Somerville, Massachusetts.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
