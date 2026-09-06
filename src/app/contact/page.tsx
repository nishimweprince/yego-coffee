import type { Metadata } from "next";
import Image from "next/image";
import { BRAND } from "@/content/brand";
import { CAFE } from "@/content/cafe";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Yego Coffee in Somerville or email us. Address, directions and email.",
};

/**
 * Contact. The live site's contact page is address, email and a form;
 * the form has nowhere to post here, and a form that posts nowhere is
 * worse than its absence — so this is every verified way to reach a
 * human (§88): the shop address with directions, and the email.
 */
export default function ContactPage() {
  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <figure className="overflow-hidden rounded-sm">
          <Image
            src="/brand/cup.jpg"
            alt="A cup of coffee at the Yego Coffee café"
            width={1000}
            height={1500}
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="aspect-[4/5] w-full object-cover"
          />
        </figure>
        <div>
          <p className="label text-accent">Contact</p>
          <h1 className="mt-stack-md text-display-l">Talk to a human.</h1>
          <p className="mt-stack-lg max-w-prose text-body-l text-muted-foreground">
            Questions about an order or a subscription: write to us,
            or come have one with us in Somerville.
          </p>
          <a
            href={`mailto:${BRAND.email}`}
            className="link-sweep mt-section-sm inline-block text-body-l text-foreground"
          >
            {BRAND.email}
          </a>

          <div className="mt-section-sm border-t border-rule pt-stack-lg">
            <h2 className="label text-muted-foreground">Visit</h2>
            <address className="mt-stack-md text-body-l not-italic">
              {CAFE.addressLine}
              <br />
              {CAFE.locality}, {CAFE.region} {CAFE.postalCode}
            </address>
            <a
              href={CAFE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="link-sweep mt-stack-lg inline-block label text-accent"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
