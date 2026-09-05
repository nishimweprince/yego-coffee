"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { SearchPanel } from "./search-panel";

/**
 * Opens the predictive search panel (plan.md §14.1) from the icon,
 * `/`, or Cmd/Ctrl+K.
 *
 * The `/` shortcut is ignored while the caret is in a field, or the
 * first thing a customer types into any input on the site is swallowed
 * by a search panel they did not ask for.
 */
export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
        aria-label="Search"
        aria-haspopup="dialog"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
      </button>
      {open ? <SearchPanel onClose={() => setOpen(false)} /> : null}
    </>
  );
}
