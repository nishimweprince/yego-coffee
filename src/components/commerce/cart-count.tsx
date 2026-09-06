"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The header badge. The header itself stays a static Server Component;
 * this island fetches the count on mount and after every client-side
 * navigation, so adding a bag then moving on updates the badge without
 * making any page dynamic.
 */
export function CartCount() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart/count", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ count: number }>)
      .then((data) => {
        if (!cancelled && Number.isFinite(data.count)) setCount(data.count);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (count === null || count <= 0) return null;

  return (
    <span
      aria-hidden
      className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none font-semibold text-accent-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
