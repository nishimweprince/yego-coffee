import Link from "next/link";

/**
 * The announcement bar. One line naming the two ways to subscribe
 * (§110), linking straight to the choice between them. Static by design: no dismissal
 * state, no JavaScript, nothing to hydrate.
 */
export function AnnouncementBar() {
  return (
    <p
      data-surface="mist"
      className="border-b border-border px-page-x py-stack-sm text-center text-body-s text-muted-foreground"
    >
      Choose your coffee, or let our roasters choose.{" "}
      <Link
        href="/subscriptions#choose"
        className="text-accent underline underline-offset-4 hover:text-foreground"
      >
        Start a subscription
      </Link>
    </p>
  );
}
