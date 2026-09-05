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

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-display-l">Journal</h1>
        <Contour label="From the roastery" className="mt-section-sm" />

        {articles.length === 0 ? (
          <p className="mt-section-sm text-body-l text-muted-foreground">
            Nothing published yet.
          </p>
        ) : (
          <div className="mt-section-sm grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <article key={article.id}>
                <Link href={`/journal/${article.handle}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
                    {article.image ? (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText ?? ""}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-(--ease-brand) group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                  <time
                    dateTime={article.publishedAt}
                    className="label mt-stack-md block text-muted-foreground"
                  >
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-stack-sm text-h3">{article.title}</h2>
                  {article.excerpt ? (
                    <p className="mt-stack-sm text-body-m text-muted-foreground">
                      {article.excerpt}
                    </p>
                  ) : null}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
