<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Yego Coffee — project rules

Full specification: `plan.md`. Where sections conflict, the later one
wins — §89 supersedes §1, §90 supersedes copy in §7–8, §93 supersedes
§9.2 and §12.1.

## Non-negotiables

- **Shopify is authoritative for prices.** Never hardcode a price or
  compute a selling-plan discount from a fixed percentage (§2.1, §10.2).
- **Server Components by default.** Client components only for genuine
  interactive islands (§20).
- **No `any` on Shopify responses** (§21.3). Raw API shapes live only in
  `src/lib/shopify/types.api.ts`; everything above the mapper layer uses
  the view models in `types.ts`.
- **No raw `fetch()` in components.** All Storefront reads go through
  `src/lib/shopify/storefront.ts` (§21.1).
- **Font Awesome only**, never Lucide. Import individual icons (§18).
- **Never invent product content** — no fabricated tasting notes,
  testimonials, processing detail, or a decaf SKU that does not exist
  (§71, §93.5). Yego sells four coffees; do not pad the catalogue to
  make a feature look better.
- **React Hook Form + Zod** for non-trivial forms (§24). No Redux (§60).

## Design system

- Tokens live in `src/app/globals.css`. Never hardcode a colour in JSX;
  use semantic tokens (`bg-background`, `text-muted-foreground`).
- **Adding a `--text-*` or semantic colour token means updating the
  tailwind-merge config in `src/lib/utils.ts`.** It cannot classify
  custom names on its own and will silently drop one of two `text-*`
  classes. `utils.test.ts` guards this.
- **`sun-500` never carries text on a light ground** — 1.85:1 against
  mist-200. Fill, rule and focus ring only. On soil it is the accent.
- Dark sections use `data-surface="soil"`, not a global dark mode.
- The contour rule (`<Contour />`) is the signature device. Its label
  carries something true — a section name, a real altitude. Never
  invented sequence numbers.
- Button size `sm` (36px) is for dense UI. Primary mobile CTAs use `md`
  or `lg` (§42).

## Commands

```
pnpm dev         pnpm typecheck
pnpm build       pnpm lint
pnpm test        pnpm test:watch
```

Run typecheck, lint and test before calling work complete.
