import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { BRAND } from "@/content/brand";
import { HOME } from "@/content/home";
import { hasShopifyCredentials } from "@/lib/env";
import { getPage } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Yego Coffee is family-owned: Rwandan farms, a Somerville roastery, and four decades in coffee.",
};

/**
 * Our story (plan.md §6, §88).
 *
 * The narrative is Francois's own, read from the store's `who-are-we`
 * page rather than rewritten here. §71 forbids inventing brand
 * content, and the owners' account of their own family is not
 * something to improve on. §88's confirmed facts frame it; nothing
 * else is added.
 *
 * If the page is ever deleted in the admin, the confirmed facts still
 * stand on their own.
 */
export default async function AboutPage() {
  const story = hasShopifyCredentials() ? await getPage("who-are-we") : null;

  return (
    <main>
      <section className="px-page-x py-section-md">
        <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
          <figure>
            <Image
              src="/brand/founders.jpg"
              alt="Fatuma and Francois Tuyishime, the family behind Yego Coffee"
              width={1500}
              height={1000}
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="aspect-[3/2] w-full rounded-sm object-cover"
            />
            <figcaption className="mt-stack-sm label text-muted-foreground">
              Fatuma and Francois Tuyishime, Somerville, Massachusetts
            </figcaption>
          </figure>
          <div>
            <h1 className="type-display text-display-l">
              {HOME.statement.headline}
            </h1>
            <div className="mt-stack-lg max-w-prose space-y-stack-xs text-lede text-muted-foreground">
              {HOME.statement.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The owners' own account, on its own ground and at a reading
          measure. It ran the full container before, at line lengths
          well past what anyone reads comfortably, under a rule
          labelled with the Shopify page's title — which is a decorative
          eyebrow, not a transition. The words are the section; they do
          not need announcing. */}
      {story?.bodyHtml ? (
        <section
          aria-label="Our story"
          data-surface="wash"
          className="px-page-x py-section-md"
        >
          <div
            className="mx-auto max-w-[54ch] space-y-stack-md text-body-l [&_a]:underline [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
          />
        </section>
      ) : null}

      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-4xl">
          <Contour label="The facts" />
          <dl className="mt-section-sm grid gap-x-8 gap-y-stack-lg sm:grid-cols-2">
            <div>
              <dt className="label text-muted-foreground">Owners</dt>
              <dd className="mt-stack-xs text-body-l">{BRAND.owners}</dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">Roastery</dt>
              <dd className="mt-stack-xs text-body-l">{BRAND.roastery}</dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">
                What Yego means
              </dt>
              <dd className="mt-stack-xs text-body-l">
                {BRAND.nameMeaning}
              </dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">Where to find us</dt>
              <dd className="mt-stack-xs text-body-l">
                <Link href="/cafe" className="underline-offset-4 hover:underline">
                  {BRAND.shopAddress}
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* The story ended on a definition list and stopped. Someone who
          reads to the bottom of this page is the most persuaded
          visitor on the site and had nowhere to go. */}
      <section data-surface="soil" className="px-page-x py-section-md">
        <div className="mx-auto max-w-4xl">
          <h2 className="type-display max-w-[16ch] text-display-l">
            Taste what four decades of it turned into.
          </h2>
          <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              See the coffee
            </Link>
            <Link
              href="/cafe"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Visit the café
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
