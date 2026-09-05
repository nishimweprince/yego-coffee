"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatMoney } from "@/lib/formatting/money";
import { track } from "@/lib/analytics/analytics";
import type { PredictiveSearchModel } from "@/lib/shopify/types";

const EMPTY: PredictiveSearchModel = { products: [], suggestions: [] };

/**
 * The predictive search panel (plan.md §14.1).
 *
 * Focus is moved to the field on open and returned to the trigger on
 * close, Escape closes, and the backdrop is inert to pointer events on
 * its children — the accessibility floor for a dialog (§35). It is
 * hand-built rather than pulled from shadcn's Dialog because it is the
 * only modal surface in Phase 3 and the brand treatment is most of its
 * substance (§17.6).
 */
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PredictiveSearchModel>(EMPTY);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    track({ name: "search_opened" });
    inputRef.current?.focus();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus?.();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Debounced so a fast typist does not generate a request per
  // keystroke. Nothing sets state in the effect body — an empty query
  // is derived at render time rather than written back into state, and
  // the pending flag moves inside the timer, which the
  // react-hooks/set-state-in-effect rule correctly insists on.
  const term = query.trim();

  useEffect(() => {
    if (!term) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPending(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        const next = (await response.json()) as PredictiveSearchModel;
        setResults(next);
        if (next.products.length === 0) {
          track({ name: "search_no_results", query: term });
        }
      } catch {
        // Aborted or failed: keep whatever is on screen rather than
        // flashing an empty state mid-typing.
      } finally {
        setPending(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Results belong to the term that fetched them. With no term there is
  // nothing to show, whatever the last response contained.
  const shown = term ? results : EMPTY;

  const submit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      track({ name: "search_query_submitted", query: trimmed });
      onClose();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [onClose, router],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-soil-900/40 px-page-x pt-[10vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="h-fit w-full max-w-2xl border border-border bg-surface-elevated"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(query);
          }}
          className="border-b border-border"
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search coffee and gear"
            aria-label="Search coffee and gear"
            className="w-full bg-transparent px-stack-md py-stack-md text-body-l outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="max-h-[55vh] overflow-y-auto">
          {shown.products.length > 0 ? (
            <ul>
              {shown.products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.handle}`}
                    onClick={() => {
                      track({
                        name: "predictive_result_clicked",
                        handle: product.handle,
                      });
                      onClose();
                    }}
                    className="flex items-center gap-stack-md px-stack-md py-stack-sm transition-colors hover:bg-muted"
                  >
                    <span className="relative block h-12 w-12 shrink-0 overflow-hidden bg-muted">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText ?? ""}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-m">
                      {product.title}
                    </span>
                    <span className="text-price tabular-nums">
                      {formatMoney(product.minPrice)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {shown.suggestions.length > 0 ? (
            <div className="border-t border-border px-stack-md py-stack-sm">
              <p className="label text-muted-foreground">Suggestions</p>
              <ul className="mt-stack-sm flex flex-wrap gap-2">
                {shown.suggestions.map((suggestion) => (
                  <li key={suggestion.text}>
                    <button
                      type="button"
                      onClick={() => submit(suggestion.text)}
                      className="border border-border px-3 py-1.5 text-body-s transition-colors hover:border-foreground"
                    >
                      {suggestion.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {term && !pending && shown.products.length === 0 ? (
            <p className="px-stack-md py-stack-lg text-body-m text-muted-foreground">
              Nothing matched “{term}”.
            </p>
          ) : null}
        </div>

        {term ? (
          <button
            type="button"
            onClick={() => submit(query)}
            className="w-full border-t border-border px-stack-md py-stack-sm text-left label text-accent"
          >
            See all results
          </button>
        ) : null}
      </div>
    </div>
  );
}
