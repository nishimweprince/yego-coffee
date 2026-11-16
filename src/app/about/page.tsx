import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/content/brand";
import { ABOUT } from "@/content/about";
import { IMAGES } from "@/content/images";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Yego Coffee is family-owned: Rwandan farms, a Somerville roastery, and four decades in coffee.",
};

/**
 * Our story (plan.md §6, §88).
 *
 * The words are the owners' own, carried over verbatim from the live
 * store's About page (content/about.ts) — §71 forbids inventing brand
 * content, and their account of their own family is not something to
 * improve on. It used to be read from the Shopify `who-are-we` page,
 * but that body is an older draft the live site never shows.
 */
export default function AboutPage() {
  return (
    <main>
      <section className="px-page-x pt-section-xs pb-section-sm">
        <div className="mx-auto grid max-w-page items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
          <figure>
            <Image
              {...IMAGES.founders}
              alt={IMAGES.founders.alt}
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="aspect-[3/2] w-full rounded-card object-cover"
            />
            <figcaption className="mt-stack-sm label text-muted-foreground">
              Fatuma and Francois Tuyishime, Somerville, Massachusetts
            </figcaption>
          </figure>
          <div>
            <h1 className="text-display-l">{ABOUT.heading}</h1>
            <div className="mt-stack-lg max-w-prose space-y-stack-md text-body-l text-muted-foreground">
              {ABOUT.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The roastery, shown rather than described: three photographs,
          unequal on purpose so they read as a set and not a grid of
          cards. One caption, because the machine's name is printed on
          it; the others need none. */}
      <section aria-label="The roastery" className="px-page-x py-section-sm">
        <div className="mx-auto grid max-w-page grid-cols-2 gap-stack-md lg:grid-cols-12 lg:gap-stack-lg">
          <figure className="col-span-2 lg:col-span-5">
            <Image
              {...IMAGES.roasterLoring}
              alt={IMAGES.roasterLoring.alt}
              sizes="(min-width: 1024px) 40vw, 100vw"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-card object-cover"
            />
            <figcaption className="mt-stack-sm label text-muted-foreground">
              The Loring roaster
            </figcaption>
          </figure>
          <Image
            {...IMAGES.roasterBeans}
            alt={IMAGES.roasterBeans.alt}
            sizes="(min-width: 1024px) 32vw, 50vw"
            loading="lazy"
            className="aspect-[3/4] w-full rounded-card object-cover lg:col-span-4 lg:mt-section-xs"
          />
          <Image
            {...IMAGES.basket}
            alt={IMAGES.basket.alt}
            sizes="(min-width: 1024px) 24vw, 50vw"
            loading="lazy"
            className="aspect-[3/4] w-full rounded-card object-cover lg:col-span-3 lg:self-end"
          />
        </div>
      </section>

      <section className="px-page-x py-section-sm">
        <div className="mx-auto max-w-page">
          <p className="label text-muted-foreground">The facts</p>
          <dl className="mt-stack-lg grid gap-x-8 gap-y-stack-lg sm:grid-cols-2">
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
                <Link href="/cafe" className="underline underline-offset-4 hover:text-accent">
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
      <section className="px-page-x pb-section-md">
        <div className="mx-auto max-w-page border-t border-border pt-section-sm">
          <h2 className="max-w-[24ch] text-h1">
            Taste what four decades of it turned into.
          </h2>
          <div className="mt-stack-lg flex flex-wrap items-center gap-stack-sm">
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
