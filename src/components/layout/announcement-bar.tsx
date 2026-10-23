import Link from "next/link";

/**
 * The announcement bar. One line stating the subscription thesis,
 * linking straight at the money path. Static by design: no dismissal
 * state, no JavaScript, nothing to hydrate.
 */
export function AnnouncementBar() {
  return (
    <p
      data-surface="mist"
      className="border-b border-border px-page-x py-stack-sm text-center text-body-s text-muted-foreground"
    >
      Fresh roast on repeat, once or twice a month.{" "}
      <Link
        href="/subscriptions"
        className="text-accent underline underline-offset-4 hover:text-foreground"
      >
        Build a subscription
      </Link>
    </p>
  );
}
