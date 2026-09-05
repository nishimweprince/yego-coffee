import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getPolicies } from "@/lib/shopify/storefront";

export async function generateMetadata({
  params,
}: PageProps<"/policies/[handle]">): Promise<Metadata> {
  if (!hasShopifyCredentials()) return { title: "Policy" };
  const { handle } = await params;
  const policy = (await getPolicies()).find((p) => p.handle === handle);
  return { title: policy?.title ?? "Policy" };
}

/** One Shopify policy, verbatim (plan.md §6). */
export default async function PolicyPage({
  params,
}: PageProps<"/policies/[handle]">) {
  const { handle } = await params;
  if (!hasShopifyCredentials()) notFound();

  const policy = (await getPolicies()).find((p) => p.handle === handle);
  if (!policy) notFound();

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb">
          <Link
            href="/policies"
            className="label text-muted-foreground hover:text-foreground"
          >
            Policies
          </Link>
        </nav>
        <h1 className="mt-stack-sm text-h1">{policy.title}</h1>
        <Contour className="mt-section-sm" />
        {/* Shopify's own policy text, unaltered: this is what the
            customer agrees to at checkout, and paraphrasing it here
            would create two versions of a legal document. */}
        <div
          className="mt-section-sm space-y-stack-md text-body-m [&_a]:underline [&_h2]:text-h3 [&_h2]:mt-stack-lg [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: policy.bodyHtml }}
        />
      </div>
    </main>
  );
}
