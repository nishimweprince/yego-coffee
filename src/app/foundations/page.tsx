import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";

export const metadata: Metadata = {
  title: "Design foundations",
  description: "Colour, type, surface and primitives for the Yego storefront.",
};

type Swatch = { token: string; value: string; role: string };

const brandRamp: Swatch[] = [
  { token: "soil-900", value: "--color-soil-900", role: "Deepest ground" },
  { token: "soil-800", value: "--color-soil-800", role: "Dark surface, body text" },
  { token: "soil-700", value: "--color-soil-700", role: "Raised dark surface" },
  { token: "soil-600", value: "--color-soil-600", role: "Dark border" },
  { token: "terrace-700", value: "--color-terrace-700", role: "Accent, pressed" },
  { token: "terrace-600", value: "--color-terrace-600", role: "Accent on light" },
  { token: "terrace-500", value: "--color-terrace-500", role: "Success on dark" },
  { token: "sage-600", value: "--color-sage-600", role: "Secondary text" },
  { token: "sage-400", value: "--color-sage-400", role: "Rules, secondary on dark" },
  { token: "sage-200", value: "--color-sage-200", role: "Quiet fills" },
  { token: "mist-300", value: "--color-mist-300", role: "Border on light" },
  { token: "mist-200", value: "--color-mist-200", role: "Page ground" },
  { token: "mist-100", value: "--color-mist-100", role: "Raised light surface" },
  { token: "sun-500", value: "--color-sun-500", role: "Accent on dark" },
  { token: "sun-600", value: "--color-sun-600", role: "Warning" },
  { token: "cherry-600", value: "--color-cherry-600", role: "Destructive, limited" },
];

const typeScale: Array<{ name: string; className: string; note: string }> = [
  { name: "Display XL", className: "text-display-xl font-display", note: "Hero only. One per page." },
  { name: "Display L", className: "text-display-l font-display", note: "Section statements." },
  { name: "Heading 1", className: "text-h1 font-display", note: "Page titles." },
  { name: "Heading 2", className: "text-h2 font-display", note: "Section titles." },
  { name: "Heading 3", className: "text-h3 font-display", note: "Card and block titles." },
  { name: "Body L", className: "text-body-l", note: "Editorial lead paragraphs." },
  { name: "Body M", className: "text-body-m", note: "Default reading size." },
  { name: "Body S", className: "text-body-s", note: "Dense UI, captions in flow." },
  { name: "Caption", className: "text-caption text-muted-foreground", note: "Image credits, footnotes." },
];

export default function FoundationsPage() {
  const shopifyReady = hasShopifyCredentials();

  return (
    <main className="px-page-x pb-section-lg">
      {/* The thesis. What a reader should take away before the swatches. */}
      <header className="mx-auto max-w-5xl pt-section-md">
        <p className="label text-muted-foreground">Yego Coffee · Design foundations</p>
        <h1 className="mt-stack-lg text-display-l font-display max-w-[16ch]">
          Designed from the hillside, not the roastery.
        </h1>
        <p className="mt-stack-md max-w-[58ch] text-body-l text-muted-foreground">
          Specialty coffee brands almost all design from the roasted bean —
          cream grounds, brown type, a terracotta accent. Yego&rsquo;s story
          starts at the other end of the chain, on a Rwandan hillside where
          the coffee grows. So the palette comes from there instead: volcanic
          soil, highland mist, terraced green, and the gold of the sun on the
          flag.
        </p>
      </header>

      <section className="mx-auto mt-section-md max-w-5xl">
        <Contour label="Colour" />
        <div className="mt-stack-lg grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
          {brandRamp.map((swatch) => (
            <div key={swatch.token} className="bg-surface-elevated p-4">
              <div
                className="h-16 w-full rounded-sm border border-foreground/10"
                style={{ backgroundColor: `var(${swatch.value})` }}
              />
              <p className="mt-stack-sm font-mono text-caption">{swatch.token}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {swatch.role}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-stack-lg max-w-[58ch] text-body-s text-muted-foreground">
          <strong className="text-foreground">One hard rule:</strong> sun-500
          never carries text on a light ground. It measures 1.85:1 against
          mist-200 — fine as a fill, a rule or a focus ring, unreadable as a
          word. On soil it reaches 7.8:1 and becomes the accent.
        </p>
      </section>

      <section className="mx-auto mt-section-md max-w-5xl">
        <Contour label="Type" />
        <p className="mt-stack-lg max-w-[58ch] text-body-m text-muted-foreground">
          Fraunces sets the editorial voice with its wonk axis on — the display
          face should read made by hand, not machined, for a business four
          decades into one family. Archivo carries everything structural, and
          its width axis gives the label register its condensed, tracked-out
          form.
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

        <div className="mt-stack-lg">
          <p className="label text-muted-foreground">Label register</p>
          <p className="label mt-stack-sm">
            Nyamasheke · Western Province · Washed
          </p>
        </div>
      </section>

      <section className="mx-auto mt-section-md max-w-5xl">
        <Contour label="Surface" />
        <p className="mt-stack-lg max-w-[58ch] text-body-m text-muted-foreground">
          Inversion is a surface context you nest, not a document-level dark
          mode. This storefront needs full-bleed dark sections inside a light
          page far more than it needs a user-facing theme toggle, so semantic
          tokens reassign on <code className="font-mono text-body-s">[data-surface]</code>.
        </p>

        <div className="mt-stack-lg grid gap-px bg-border md:grid-cols-2">
          {(["mist", "soil"] as const).map((surface) => (
            <div key={surface} data-surface={surface} className="p-8">
              <p className="label text-muted-foreground">
                data-surface=&quot;{surface}&quot;
              </p>
              <h2 className="mt-stack-md text-h2 font-display">
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

      <section className="mx-auto mt-section-md max-w-5xl">
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

      <section className="mx-auto mt-section-md max-w-5xl">
        <Contour label="System" />
        <dl className="mt-stack-lg grid gap-px bg-border sm:grid-cols-3">
          <div className="bg-surface-elevated p-5">
            <dt className="label text-muted-foreground">Phase</dt>
            <dd className="mt-stack-sm text-body-m">Foundation · plan.md §75</dd>
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
