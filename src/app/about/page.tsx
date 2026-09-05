import type { Metadata } from "next";
import Link from "next/link";
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
      <section data-surface="soil" className="px-page-x py-section-lg">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-display-l">{HOME.statement.headline}</h1>
          <div className="mt-stack-lg max-w-prose space-y-stack-xs text-body-l text-muted-foreground">
            {HOME.statement.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-4xl">
          {story?.bodyHtml ? (
            <>
              <Contour label={story.title} />
              {/* Written by the owners in the Shopify admin (§39). */}
              <div
                className="mt-section-sm max-w-prose space-y-stack-md text-body-l [&_a]:underline [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
              />
            </>
          ) : null}

          <Contour label="The facts" className="mt-section-md" />
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
    </main>
  );
}
