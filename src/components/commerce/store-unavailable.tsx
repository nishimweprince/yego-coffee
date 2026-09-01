import { Contour } from "@/components/ui/contour";

/**
 * Shown when Storefront credentials are absent or Shopify is
 * unreachable (§37). Deliberately reads as broken rather than empty —
 * an "empty store" would be indistinguishable from a working one with
 * no products, which is how a misconfigured deploy goes unnoticed.
 */
export function StoreUnavailable({ detail }: { detail?: string }) {
  return (
    <div className="mx-auto max-w-2xl py-section-md">
      <p className="label text-destructive">Store unavailable</p>
      <h1 className="mt-stack-md text-h1">
        We can&rsquo;t load the shop right now.
      </h1>
      <p className="mt-stack-md text-body-m text-muted-foreground">
        This is a configuration or connection problem on our side, not
        something you did. Please try again shortly.
      </p>
      <Contour label="Status" className="mt-stack-lg" />
      {detail ? (
        <p className="mt-stack-md font-mono text-caption text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </div>
  );
}
