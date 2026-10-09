import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { IMAGES } from "./images";

/**
 * The bags in the photography carry coffee names the store does not
 * sell. Naming one in alt text would describe a product that cannot be
 * bought (§93.5).
 */
const UNSOLD_NAMES = /isuku|malayika|ukuri|zuba|hobe|heritage/i;

describe("brand photography", () => {
  const entries = Object.entries(IMAGES);

  it.each(entries)("%s exists in public/", (_, image) => {
    expect(existsSync(join(process.cwd(), "public", image.src))).toBe(true);
  });

  it.each(entries)("%s describes the scene without naming a coffee", (_, image) => {
    expect(image.alt.trim()).not.toBe("");
    expect(image.alt).not.toMatch(UNSOLD_NAMES);
  });
});
