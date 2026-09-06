import Link from "next/link";

/**
 * The announcement bar. One line stating the subscription thesis,
 * linking straight at the money path. Static by design: no dismissal
 * state, no JavaScript, nothing to hydrate.
 */
export function AnnouncementBar() {
  return (
    <p
      data-surface="wash"
      className="border-b border-border px-page-x py-stack-sm text-center text-body-s text-muted-foreground"
    >
      Fresh roast on repeat, monthly or every two months.{" "}
      <Link
        href="/collections/subscriptions"
        className="text-accent underline-offset-4 hover:underline"
      >
        Build a subscription
      </Link>
    </p>
  );
}
