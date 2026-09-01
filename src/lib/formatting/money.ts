import type { Money } from "@/lib/shopify/types";

/**
 * Money formatting (plan.md §54).
 *
 * Always Intl.NumberFormat, always the currency Shopify returned.
 * Never template a currency symbol onto a number — that silently
 * produces "$1,200" for a JPY store and is the kind of bug that
 * survives to production because it looks right in one locale.
 */

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currencyCode: string, locale: string) {
  const key = `${locale}:${currencyCode}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(money: Money, locale = "en-US"): string {
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount)) {
    throw new TypeError(
      `formatMoney received a non-numeric amount: ${JSON.stringify(money.amount)}`,
    );
  }
  return formatterFor(money.currencyCode, locale).format(amount);
}

/**
 * Drops the fractional part when a price is a whole unit, so shelf
 * prices read "$19" rather than "$19.00". Shopify remains the source
 * of the value — this only changes presentation.
 */
export function formatMoneyCompact(money: Money, locale = "en-US"): string {
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount)) {
    throw new TypeError(
      `formatMoneyCompact received a non-numeric amount: ${JSON.stringify(money.amount)}`,
    );
  }
  const isWhole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(amount);
}
