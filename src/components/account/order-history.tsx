"use client";

import Link from "next/link";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { formatMoney } from "@/lib/formatting/money";
import type { OrderSummary } from "@/lib/customer/types";

/**
 * Order history (plan.md §11.3, §25).
 *
 * §11.3 asks for a table where a table improves scanability, and
 * stacked cards on mobile — explicitly *not* a desktop table forced
 * sideways onto a phone. Both are rendered from the same data and one
 * is hidden per breakpoint, so there is no layout in which a customer
 * gets a horizontally scrolling grid.
 *
 * §25 warns against using TanStack Table for anything that is not
 * really a table. Orders are: a fixed set of columns, uniform rows,
 * scanned by date and total. Product cards are not, and do not use it.
 */

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, OrderSummary>();

function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

/**
 * Shopify's statuses are SCREAMING_SNAKE enums. They are shown to
 * customers, so they are humanised — but never renamed: "PARTIALLY_
 * FULFILLED" becomes "Partially fulfilled", not "On its way", which
 * would be an invented promise about where a parcel is.
 */
function humanise(status: string | null): string {
  if (!status) return "—";
  const lower = status.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const columns = helper.columns([
  helper.accessor("name", { header: "Order" }),
  helper.accessor("processedAt", { header: "Date" }),
  helper.accessor("fulfillmentStatus", { header: "Status" }),
  helper.accessor("itemCount", { header: "Items" }),
  helper.accessor("total", { header: "Total" }),
]);

export function OrderHistory({ orders }: { orders: OrderSummary[] }) {
  const table = useTable({ features, columns, data: orders });

  if (orders.length === 0) {
    // §48: say what to do next, not merely that there is nothing.
    return (
      <div>
        <p className="text-body-l">No orders yet.</p>
        <Link
          href="/shop"
          className="mt-stack-md inline-block text-body-m text-accent underline-offset-4 hover:underline"
        >
          See the coffee
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: a real table, with real table semantics. */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">Your orders</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-border">
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="label py-stack-sm text-muted-foreground"
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
              <th scope="col" className="label py-stack-sm text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const order = row.original;
            return (
              <tr key={row.id} className="border-b border-border">
                <td className="py-stack-md text-body-m">{order.name}</td>
                <td className="py-stack-md text-body-m text-muted-foreground">
                  {formatDate(order.processedAt)}
                </td>
                <td className="py-stack-md text-body-m">
                  {humanise(order.fulfillmentStatus)}
                </td>
                <td className="py-stack-md text-body-m tabular-nums">
                  {order.itemCount}
                </td>
                <td className="py-stack-md text-price tabular-nums">
                  {formatMoney(order.total)}
                </td>
                <td className="py-stack-md text-right">
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.id)}`}
                    className="label text-accent underline-offset-4 hover:underline"
                  >
                    View
                    <span className="sr-only"> order {order.name}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile: stacked cards (§11.3). */}
      <ul className="space-y-px md:hidden">
        {orders.map((order) => (
          <li key={order.id} className="border-b border-border">
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}`}
              className="block py-stack-md transition-colors hover:text-accent"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-body-l">{order.name}</span>
                <span className="text-price tabular-nums">
                  {formatMoney(order.total)}
                </span>
              </div>
              <p className="mt-stack-xs text-body-s text-muted-foreground">
                {formatDate(order.processedAt)} ·{" "}
                {humanise(order.fulfillmentStatus)} · {order.itemCount}{" "}
                {order.itemCount === 1 ? "item" : "items"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
