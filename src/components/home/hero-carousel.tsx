"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPause } from "@fortawesome/free-solid-svg-icons/faPause";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { cn } from "@/lib/utils";

/** How long each photograph holds before the next one fades in. */
const INTERVAL_MS = 6500;

/**
 * Which hero slide is showing, and nothing else.
 *
 * The slides themselves are server-rendered children; this island
 * stacks them, crossfades between them, and marks every slide but the
 * current one `inert` so its link cannot be tabbed to while unseen.
 *
 * Autoplay stops for anyone who asked for less motion, and pauses
 * while the pointer or keyboard focus is on the hero, or the tab is
 * hidden — a slide must not change under someone reading or about to
 * press it. A visible pause control satisfies WCAG 2.2.2 for everyone
 * else. Arrows, dots, the arrow keys and a horizontal swipe all move
 * between slides.
 */
export function HeroCarousel({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  // Three separate reasons to hold a slide, so one ending never
  // releases another: leaving the tab must not undo keyboard focus.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swipeStart = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const held = hovered || focused || tabHidden;
  const running = playing && !held && !reducedMotion && count > 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
      onPointerDown={(event) => {
        swipeStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const delta = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(delta) > 48) go(index + (delta < 0 ? 1 : -1));
      }}
    >
      {/* Polite only while a person is driving it; an autoplaying
          carousel that announced every change would talk over them. */}
      <div aria-live={running ? "off" : "polite"} className="absolute inset-0">
        {Children.map(children, (child, i) => (
          <div
            className="hero-slide absolute inset-0"
            data-active={i === index ? "" : undefined}
            aria-hidden={i === index ? undefined : true}
            inert={i !== index}
          >
            {child}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-20 px-page-x pb-stack-lg sm:pb-section-sm">
          <div className="mx-auto flex w-full max-w-page items-center gap-stack-sm">
            <ol className="flex items-center gap-2" aria-label="Choose a slide">
              {Array.from({ length: count }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show slide ${i + 1} of ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    className="group flex h-11 items-center"
                  >
                    {/* The current dot stretches into a bar that fills
                        over the interval — progress, not decoration. */}
                    <span
                      className={cn(
                        "relative block h-1.5 overflow-hidden rounded-pill bg-rule transition-[width] duration-500 ease-(--ease-brand) group-hover:bg-muted-foreground",
                        i === index ? "w-12" : "w-6",
                      )}
                    >
                      {i === index ? (
                        <span
                          key={`${index}-${running}`}
                          className={cn(
                            "hero-progress absolute inset-0 origin-left rounded-pill bg-foreground",
                            !running && "hero-progress--still",
                          )}
                          style={{ animationDuration: `${INTERVAL_MS}ms` }}
                        />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="ml-auto flex items-center gap-2">
              <CarouselButton
                label={playing ? "Pause slideshow" : "Play slideshow"}
                onClick={() => setPlaying((value) => !value)}
                hidden={reducedMotion}
              >
                <FontAwesomeIcon icon={playing ? faPause : faPlay} className="h-3.5 w-3.5" />
              </CarouselButton>
              <CarouselButton label="Previous slide" onClick={() => go(index - 1)}>
                <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
              </CarouselButton>
              <CarouselButton label="Next slide" onClick={() => go(index + 1)}>
                <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
              </CarouselButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  hidden,
  children,
}: {
  label: string;
  onClick: () => void;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-rule text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
    >
      {children}
    </button>
  );
}
