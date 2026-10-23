import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";

export const metadata: Metadata = {
  title: "Design foundations",
  description: "Colour, type, surface and primitives for the Yego storefront.",
};

type Swatch = { token: string; value: string; role: string };

/** The whole palette. Five values; every semantic token resolves to one. */
const palette: Swatch[] = [
  { token: "paper", value: "--color-paper", role: "Page ground" },
  { token: "white", value: "--color-white", role: "Cards, panels, inputs, image backdrops" },
  { token: "ink", value: "--color-ink", role: "Text, primary buttons; the footer ground" },
  { token: "roast", value: "--color-roast", role: "The accent: links, \"Yego.\", the focus ring" },
  { token: "cherry", value: "--color-cherry", role: "Destructive only" },
];

const typeScale: Array<{ name: string; className: string; note: string }> = [
  { name: "Display XL", className: "text-display-xl font-display", note: "The film hero. Once per site." },
  { name: "Display L", className: "text-display-l font-display", note: "Page titles and homepage section headings." },
  { name: "Heading 1", className: "text-h1 font-display", note: "Detail titles: product, order, policy." },
  { name: "Heading 2", className: "text-h2 font-display", note: "Section titles inside a page." },
  { name: "Heading 3", className: "text-h3 font-display", note: "Section headings over a grid." },
  { name: "Heading 4", className: "text-h4 font-display font-semibold", note: "Card titles." },
  { name: "Lede", className: "text-lede text-muted-foreground", note: "The opening paragraph under a title." },
  { name: "Body L", className: "text-body-l", note: "Editorial paragraphs." },
  { name: "Body M", className: "text-body-m", note: "Default reading size." },
  { name: "Body S", className: "text-body-s", note: "Dense UI, nav, captions in flow." },
  { name: "Label", className: "label text-muted-foreground", note: "Meta, roast names, data. Sentence case." },
  { name: "Caption", className: "text-caption text-muted-foreground", note: "Image credits, footnotes." },
];

export default function FoundationsPage() {
  const shopifyReady = hasShopifyCredentials();

  return (
    <main className="px-page-x pb-section-lg">
      {/* The thesis. What a reader should take away before the swatches. */}
      <header className="mx-auto max-w-page pt-section-md">
        <p className="label text-muted-foreground">Yego Coffee · Design foundations</p>
        <h1 className="mt-stack-lg max-w-[18ch] text-display-l">
          One ground, one accent, one typeface.
        </h1>
        <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
          The page is paper from top to bottom. The only dark surfaces are
          the footer and the film hero, which is a photograph rather than a
          coloured band. The accent is the brown of the roasted bean in
          Yego&rsquo;s own photographs, and it is the only colour the
          interface adds. Everything else is whitespace, one small register
          for meta, and — at most twice per page — the contour rule.
        </p>
      </header>

      <section className="mx-auto mt-section-md max-w-page">
        <Contour label="Colour" />
        <div className="mt-stack-lg grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
          {palette.map((swatch) => (
            <div key={swatch.token} className="bg-surface-elevated p-4">
              <div
                className="h-16 w-full rounded-card border border-border"
                style={{ backgroundColor: `var(${swatch.value})` }}
              />
              <p className="mt-stack-sm font-mono text-caption">{swatch.token}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {swatch.role}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-stack-lg max-w-prose text-body-s text-muted-foreground">
          <strong className="text-foreground">Two hard rules:</strong> roast
          is the only chromatic accent, and cherry is for errors, never for
          brand. Buttons are ink, so the accent is kept for the few things
          that should catch the eye. Roast on paper measures about 7.5:1, so
          it carries link text and the focus ring alike.
        </p>
      </section>

      <section className="mx-auto mt-section-md max-w-page">
        <Contour label="Type" />
        <p className="mt-stack-lg max-w-prose text-body-m text-muted-foreground">
          DM Sans throughout. Headings sit at weight 500 and are capped at
          4.5rem; the small register is sentence case at weight 500. The
          registers are told apart by size, weight and colour, never by
          case or tracking.
        </p>

        <div className="mt-stack-lg divide-y divide-border border-y border-border">
          {typeScale.map((role) => (
            <div
              key={role.name}
              className="grid gap-stack-sm py-6 md:grid-cols-[10rem_1fr] md:gap-8"
            >
              <div>
                <p className="label text-muted-foreground">{role.name}</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {role.note}
                </p>
              </div>
              <p className={role.className}>
                Yego means yes
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-section-md max-w-page">
        <Contour label="Surface" />
        <p className="mt-stack-lg max-w-prose text-body-m text-muted-foreground">
          Inversion is a surface context you nest, not a document-level dark
          mode. Semantic tokens reassign on{" "}
          <code className="font-mono text-body-s">[data-surface]</code>.
          Two exist: mist is the page, soil is the footer and the hero.
          No page section uses soil.
        </p>

        <div className="mt-stack-lg grid gap-px bg-border md:grid-cols-2">
          {(["mist", "soil"] as const).map((surface) => (
            <div key={surface} data-surface={surface} className="p-8">
              <p className="label text-muted-foreground">
                data-surface=&quot;{surface}&quot;
              </p>
              <h2 className="mt-stack-md text-h2">
                Coffee worth slowing down for.
              </h2>
              <p className="mt-stack-sm text-body-m text-muted-foreground">
                The same markup, the same tokens. Only the surface changed.
              </p>
              <div className="mt-stack-lg flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Find my coffee
                </Button>
                <Button variant="secondary" size="sm">
                  Shop coffee
                </Button>
              </div>
              <Contour label="Contour" className="mt-stack-lg" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-section-md max-w-page">
        <Contour label="Primitives" />

        <div className="mt-stack-lg space-y-8">
          <div>
            <p className="label text-muted-foreground">Button · variants</p>
            <div className="mt-stack-md flex flex-wrap items-center gap-4">
              <Button variant="primary">Build my subscription</Button>
              <Button variant="secondary">Shop coffee</Button>
              <Button variant="ghost">Skip</Button>
              <Button variant="link">Read the story</Button>
            </div>
          </div>

          <div>
            <p className="label text-muted-foreground">Button · sizes</p>
            <div className="mt-stack-md flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <p className="label text-muted-foreground">Button · disabled</p>
            <div className="mt-stack-md flex flex-wrap items-center gap-4">
              <Button disabled>Unavailable</Button>
              <Button variant="secondary" disabled>
                Unavailable
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-section-md max-w-page">
        <Contour label="System" />
        <dl className="mt-stack-lg grid gap-px bg-border sm:grid-cols-3">
          <div className="bg-surface-elevated p-5">
            <dt className="label text-muted-foreground">Direction</dt>
            <dd className="mt-stack-sm text-body-m">Roastery · plan.md §105</dd>
          </div>
          <div className="bg-surface-elevated p-5">
            <dt className="label text-muted-foreground">Shopify Storefront</dt>
            <dd className="mt-stack-sm text-body-m">
              {shopifyReady ? "Configured" : "Not configured"}
            </dd>
          </div>
          <div className="bg-surface-elevated p-5">
            <dt className="label text-muted-foreground">Catalogue</dt>
            <dd className="mt-stack-sm text-body-m">
              {shopifyReady ? "Ready to query" : "Awaiting credentials"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
