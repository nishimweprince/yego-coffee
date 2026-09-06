import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Contour } from "@/components/ui/contour";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { hasShopifyCredentials } from "@/lib/env";
import { getArticles } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes from the roastery.",
};

/**
 * The journal (plan.md §5.3, §6).
 *
 * §5.3 recommends repository-managed MDX. Yego's writing already
 * exists in Shopify's blog, so that is what this reads. An MDX
 * pipeline with no articles in it would be untested code standing in
 * front of real content, and §5.3's actual requirement — that the
 * journal stays portable — is met by the mapper boundary: moving to
 * MDX or a CMS later changes `getArticles`, not these pages.
 *
 * §90.09 names three entries that do not exist. They are the owners'
 * to write; nothing is invented to fill the page (§71).
 */
export default async function JournalPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const articles = await getArticles();

  // The blog currently holds a single post, and a three-column grid
  // rendered it as one card beside two empty cells. One entry is a
  // feature; a handful is a grid. The layout follows the writing
  // rather than the writing having to fill the layout.
  const [lead, ...rest] = articles;

  const date = (published: string) =>
    new Date(published).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-5xl">
        <h1 className="type-display text-display-l">Journal</h1>

        {articles.length === 0 ? (
          <p className="mt-section-sm text-lede text-muted-foreground">
            Nothing published yet. The roastery notes will land here.
          </p>
        ) : (
          <>
            <Link
              href={`/journal/${lead.handle}`}
              className="group mt-section-sm block"
            >
              <div className="grid items-center gap-stack-lg sm:grid-cols-2 sm:gap-12">
                {lead.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-elevated">
                    <Image
                      src={lead.image.url}
                      alt={lead.image.altText ?? ""}
                      fill
                      priority
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <time
                    dateTime={lead.publishedAt}
                    className="label block text-muted-foreground"
                  >
                    {date(lead.publishedAt)}
                  </time>
                  <h2 className="mt-stack-md text-h1">{lead.title}</h2>
                  {lead.excerpt ? (
                    <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
                      {lead.excerpt}
                    </p>
                  ) : null}
                  <span className="link-sweep mt-stack-lg inline-block label text-accent">
                    Read it
                  </span>
                </div>
              </div>
            </Link>

            {rest.length > 0 ? (
              <>
                <Contour label="Earlier" className="mt-section-lg" />
                <div className="mt-section-sm grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <article key={article.id}>
                      <Link
                        href={`/journal/${article.handle}`}
                        className="group block"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-elevated">
                          {article.image ? (
                            <Image
                              src={article.image.url}
                              alt={article.image.altText ?? ""}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <time
                          dateTime={article.publishedAt}
                          className="label mt-stack-md block text-muted-foreground"
                        >
                          {date(article.publishedAt)}
                        </time>
                        <h3 className="mt-stack-sm text-h3">{article.title}</h3>
                      </Link>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
