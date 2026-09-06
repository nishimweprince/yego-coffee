import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME } from "@/content/home";

/**
 * The coffee finder, on the wash band.
 *
 * No question count. The count moved as the quiz was right-sized, and
 * a number here that the quiz does not honour is an immediately
 * visible broken promise. "A few questions. About 30 seconds." is a
 * promise the quiz can keep.
 *
 * Left-aligned beside real photography, not centered on an empty
 * field: centered eyebrow-headline-CTA stacks are the template this
 * page is moving away from.
 */
export function CoffeeFinder() {
  return (
    <section data-surface="wash" className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl items-center gap-stack-lg lg:grid-cols-2 lg:gap-16">
        <div className="order-2">
          <Image
            src="/brand/brew.jpg"
            alt="A cup of Yego coffee being brewed"
            width={1000}
            height={1500}
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading="lazy"
            className="aspect-[16/10] w-full rounded-sm object-cover"
          />
        </div>

        <div className="order-1">
          <h2 className="type-display text-display-l">{HOME.finder.heading}</h2>
          <div className="mt-stack-lg space-y-stack-xs text-lede text-muted-foreground">
            {HOME.finder.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <Link
            href={HOME.finder.cta.href}
            className={`${buttonVariants({ size: "lg" })} mt-section-sm`}
          >
            {HOME.finder.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
