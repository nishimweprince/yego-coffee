import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { splitPolicySections } from "@/lib/shopify/policies";
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
            would create two versions of a legal document. Bodies that
            carry <strong> section runs get real headings; flat bodies
            render exactly as before. */}
        {splitPolicySections(policy.bodyHtml).map((section, index) => (
          <section key={section.heading ?? "intro"}>
            {section.heading ? (
              <h2
                className={
                  index === 0 ? "mt-section-sm text-h3" : "mt-stack-lg text-h3"
                }
              >
                {section.heading}
              </h2>
            ) : null}
            <div
              className="mt-stack-md space-y-stack-md text-body-m [&_a]:underline [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
