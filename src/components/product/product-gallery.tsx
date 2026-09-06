"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { ProductMedia } from "@/components/commerce/product-media";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/lib/shopify/types";

/**
 * The product gallery, Amazon-style.
 *
 * The photo carries a zoom cursor and a click opens the fullscreen
 * viewer: large image, previous/next through the gallery, thumbnail
 * strip, Escape or backdrop click to leave. Focus moves into the
 * dialog on open and returns to the photo on close; the page behind
 * stops scrolling while the viewer is up.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const current = images[Math.min(active, images.length - 1)] ?? null;

  const step = useCallback(
    (direction: 1 | -1) => {
      setActive(
        (index) => (index + direction + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    if (!viewerOpen) return;
    closeButtonRef.current?.focus();
    const opener = openButtonRef.current;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [viewerOpen, step]);

  if (!current) return null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label={`Open fullscreen image viewer for ${title}`}
          className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ProductMedia
            image={current}
            title={title}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="bg-surface-elevated"
            zoomOnHover
          />
        </button>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-soil-900/70 text-mist-100"
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="h-4 w-4" />
        </span>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1} of ${Math.min(images.length, 5)}`}
              aria-current={index === active}
              className={cn(
                "cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2",
                index === active && "outline-2 outline-offset-2 outline-accent",
              )}
            >
              <ProductMedia
                image={image}
                title={title}
                sizes="120px"
                className="bg-surface-elevated"
              />
            </button>
          ))}
        </div>
      ) : null}

      {viewerOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-soil-900/90 px-page-x py-stack-lg"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewerOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — image viewer`}
            className="mx-auto flex h-full w-full max-w-6xl flex-col"
          >
            <div className="flex items-center justify-between">
              <p className="label text-mist-100/70">
                {active + 1} of {images.length}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setViewerOpen(false)}
                aria-label="Close image viewer"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-mist-100 transition-colors hover:text-sun-500"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                src={current.url}
                alt={current.altText ?? title}
                fill
                sizes="90vw"
                className="object-contain"
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-0 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-soil-900/70 text-mist-100 transition-colors hover:text-sun-500"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="h-4 w-4"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute top-1/2 right-0 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-soil-900/70 text-mist-100 transition-colors hover:text-sun-500"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="h-4 w-4"
                    />
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="mt-stack-md flex justify-center gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Show photo ${index + 1} of ${images.length}`}
                    aria-current={index === active}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 ease-(--ease-brand)",
                      index === active
                        ? "w-6 bg-mist-100"
                        : "w-2 bg-mist-100/50 hover:bg-mist-100/80",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
