"use client";

import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { AddressForm } from "./address-form";
import { deleteAddressAction } from "@/app/account/actions";
import type { CustomerAddress } from "@/lib/customer/types";
import { useRouter } from "next/navigation";

/**
 * The address book (plan.md §11, §11.7).
 *
 * Deleting asks first. §11.7 requires a confirmation step for
 * destructive actions, and this is the only irreversible thing a
 * customer can do in this account area.
 *
 * There is no optimistic removal. §11.7 permits optimism "only when
 * rollback is safe", and an address that vanishes and then returns
 * because the server refused is worse than a moment's wait — the
 * customer has already moved on believing it gone.
 */
export function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function done() {
    setEditing(null);
    setCreating(false);
    router.refresh();
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteAddressAction(id);
      if (result.ok) {
        setConfirming(null);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div>
      {addresses.length === 0 && !creating ? (
        <p className="text-body-l text-muted-foreground">
          No saved addresses yet.
        </p>
      ) : null}

      <ul className="space-y-stack-lg">
        {addresses.map((address) => (
          <li key={address.id} className="border border-border p-stack-lg">
            {editing === address.id ? (
              <AddressForm address={address} onDone={done} />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-stack-sm">
                  <address className="text-body-m not-italic">
                    {address.formatted.length > 0
                      ? address.formatted.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))
                      : [address.address1, address.city, address.zoneCode, address.zip]
                          .filter(Boolean)
                          .join(", ")}
                  </address>
                  {address.isDefault ? (
                    <span className="label text-accent">Default</span>
                  ) : null}
                </div>

                <div className="mt-stack-md flex flex-wrap items-center gap-stack-md">
                  <button
                    type="button"
                    onClick={() => setEditing(address.id)}
                    className="label text-accent underline-offset-4 hover:underline"
                  >
                    Edit
                  </button>

                  {confirming === address.id ? (
                    <span className="flex flex-wrap items-center gap-stack-sm">
                      <span className="text-body-s">Delete this address?</span>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => remove(address.id)}
                        className="label text-destructive underline-offset-4 hover:underline"
                      >
                        {pending ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="label text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Keep it
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(address.id)}
                      className="label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="mt-stack-md text-body-s text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-section-sm">
        {creating ? (
          <div className="border border-border p-stack-lg">
            <AddressForm onDone={done} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            Add an address
          </button>
        )}
      </div>
    </div>
  );
}
