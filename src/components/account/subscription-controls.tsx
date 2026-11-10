"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  cancelSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction,
  skipDeliveryAction,
  unskipDeliveryAction,
  type ActionResult,
} from "@/app/account/actions";
import { formatShortDate } from "@/lib/customer/format";
import type { SubscriptionContract } from "@/lib/customer/types";

/**
 * The changes a customer can make to a subscription (plan.md §11.6,
 * §111).
 *
 * The rules are §11.7's:
 *
 *   - Cancelling asks first. It is the one change here that cannot be
 *     undone from this page.
 *   - Nothing is optimistic. The page shows what Shopify confirmed, by
 *     refreshing after the action returns. A delivery that showed as
 *     skipped and then was not is a missed order the customer stopped
 *     expecting.
 *   - Every outcome is announced, success and failure alike, in a live
 *     region.
 *
 * Only the controls Shopify will accept for this contract's status are
 * shown (`contract.can`, derived in the mapper).
 */
export function SubscriptionControls({
  contract,
}: {
  contract: SubscriptionContract;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  function run(
    label: string,
    success: string,
    action: () => Promise<ActionResult>,
  ) {
    setResult(null);
    setBusy(label);
    startTransition(async () => {
      const outcome = await action();
      setBusy(null);
      if (outcome.ok) {
        setConfirmingCancel(false);
        setResult({ ok: true, message: success });
        router.refresh();
      } else {
        setResult({ ok: false, message: outcome.message });
      }
    });
  }

  const { can } = contract;
  const nothingToDo = !can.pause && !can.resume && !can.cancel && !can.skip;

  return (
    <div>
      {can.skip && contract.upcoming.length > 0 ? (
        <section aria-labelledby="deliveries-heading">
          <h2 id="deliveries-heading" className="text-h4">
            Upcoming deliveries
          </h2>
          <p className="mt-stack-xs text-body-s text-muted-foreground">
            Skip one and nothing is charged or sent that time. Your
            subscription carries on after it.
          </p>
          <ul className="mt-stack-md divide-y divide-border border-y border-border">
            {contract.upcoming.map((cycle) => {
              const date = formatShortDate(cycle.date) ?? "Date to be confirmed";
              const key = `cycle-${cycle.cycleIndex}`;
              const input = {
                contractId: contract.id,
                cycleIndex: cycle.cycleIndex,
              };

              return (
                <li
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-stack-sm py-stack-sm"
                >
                  <span className="text-body-m">
                    <span className={cycle.skipped ? "text-muted-foreground line-through" : undefined}>
                      {date}
                    </span>
                    {cycle.skipped ? (
                      <span className="ml-stack-sm text-body-s text-muted-foreground">
                        Skipped
                      </span>
                    ) : null}
                  </span>
                  {cycle.skipped ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(key, `The delivery on ${date} is back on.`, () =>
                          unskipDeliveryAction(input),
                        )
                      }
                    >
                      {busy === key ? "Restoring…" : "Restore"}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(key, `Skipped. Nothing will be sent or charged on ${date}.`, () =>
                          skipDeliveryAction(input),
                        )
                      }
                    >
                      {busy === key ? "Skipping…" : "Skip"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {!nothingToDo ? (
        <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
          {can.pause ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(
                  "pause",
                  "Paused. Nothing will be sent or charged until you resume.",
                  () => pauseSubscriptionAction(contract.id),
                )
              }
            >
              <FontAwesomeIcon icon={faPause} className="mr-2 size-3.5" aria-hidden />
              {busy === "pause" ? "Pausing…" : "Pause subscription"}
            </Button>
          ) : null}

          {can.resume ? (
            <Button
              disabled={pending}
              onClick={() =>
                run("resume", "Resumed. Your deliveries are back on.", () =>
                  resumeSubscriptionAction(contract.id),
                )
              }
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2 size-3.5" aria-hidden />
              {busy === "resume" ? "Resuming…" : "Resume subscription"}
            </Button>
          ) : null}

          {can.cancel ? (
            confirmingCancel ? (
              <div
                role="group"
                aria-labelledby="cancel-confirm"
                className="flex w-full flex-wrap items-center gap-stack-sm rounded-tile border border-border p-stack-md"
              >
                <p id="cancel-confirm" className="w-full text-body-m sm:w-auto sm:flex-1">
                  Cancel this subscription? No further deliveries will be
                  sent or charged.
                  {can.pause ? " You could pause it instead." : ""}
                </p>
                <Button
                  size="sm"
                  disabled={pending}
                  className="bg-destructive text-background hover:bg-destructive/90"
                  onClick={() =>
                    run("cancel", "Cancelled. No further deliveries will be sent.", () =>
                      cancelSubscriptionAction(contract.id),
                    )
                  }
                >
                  {busy === "cancel" ? "Cancelling…" : "Yes, cancel"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => setConfirmingCancel(false)}
                >
                  Keep it
                </Button>
              </div>
            ) : (
              <Button
                variant="link"
                className="text-muted-foreground hover:text-foreground"
                disabled={pending}
                onClick={() => {
                  setResult(null);
                  setConfirmingCancel(true);
                }}
              >
                Cancel subscription
              </Button>
            )
          ) : null}
        </div>
      ) : null}

      <p
        role={result && !result.ok ? "alert" : "status"}
        aria-live="polite"
        className={
          result
            ? `mt-stack-md text-body-s ${result.ok ? "text-foreground" : "text-destructive"}`
            : "sr-only"
        }
      >
        {result?.message ?? ""}
      </p>
    </div>
  );
}
