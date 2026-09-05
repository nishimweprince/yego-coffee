import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getArticle } from "@/lib/shopify/storefront";

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  if (!hasShopifyCredentials()) return { title: "Journal" };
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found" };

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  if (!hasShopifyCredentials()) notFound();

  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <main className="px-page-x py-section-md">
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb">
          <Link
            href="/journal"
            className="label text-muted-foreground hover:text-foreground"
          >
            Journal
          </Link>
        </nav>

        <h1 className="mt-stack-sm text-display-l">{article.title}</h1>
        <time
          dateTime={article.publishedAt}
          className="label mt-stack-lg block text-muted-foreground"
        >
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        {article.image ? (
          <div className="relative mt-section-sm aspect-[3/2] overflow-hidden bg-surface-elevated">
            <Image
              src={article.image.url}
              alt={article.image.altText ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <Contour className="mt-section-sm" />

        {/* Authored by the owners in the Shopify admin (§39). */}
        <div
          className="mt-section-sm space-y-stack-md text-body-l [&_a]:underline [&_h2]:mt-section-sm [&_h2]:text-h2 [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
        />
      </article>
    </main>
  );
}
