"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The rotating hero photography. Copy stays fixed in the parent —
 * only the image turns — so the subscription promise and CTAs never
 * jump under a thumb. Auto-advance stops for reduced-motion users and
 * the moment a visitor takes over with the dots.
 */
const SLIDES = [
  { src: "/brand/brew.jpg", alt: "A cup of Yego coffee being brewed" },
  { src: "/brand/roast.jpg", alt: "Freshly roasted Yego coffee" },
  { src: "/brand/cup.jpg", alt: "A cup of coffee at the Yego Coffee café" },
] as const;

export function HeroSlides() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="relative aspect-[3/4] max-h-[62svh] w-full overflow-hidden rounded-md lg:aspect-auto lg:h-full lg:max-h-none lg:min-h-[72svh]">
      {SLIDES.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-(--ease-brand)",
            index === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => {
              setActive(index);
              setPaused(true);
            }}
            aria-label={`Show photo ${index + 1} of ${SLIDES.length}`}
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
    </div>
  );
}
