<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Yego Coffee — project rules

Full specification: `plan.md`. Where sections conflict, the later one
wins — §89 supersedes §1, §90 supersedes copy in §7–8, §93 supersedes
§9.2 and §12.1, §106 supersedes parts of §105, §108 (the Starbucks
direction) supersedes §106's shapes and weights and §105/§107 on the
hero.

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
- **`roast` is the only chromatic accent; `cherry` is destructive
  only.** Five palette values, no more (§105, linen retired in §108.4). Primary buttons are
  ink, not roast — roast is kept for links, "Yego." and focus (§106).
- Two surfaces, no global dark mode. `mist` is the page — near-white
  paper (#fbfaf8) everywhere, announcement bar and panels included.
  `soil` appears on the footer and the hero carousel only. No tinted
  bands: linen read as template beige and was removed (§108.4).
- The contour rule (`<Contour />`) is the signature device, at most
  twice per page. Its label carries something true — a section name, a
  real place. Never invented sequence numbers. The Yego line
  (`<YegoLine />`) answers a question a customer actually asks —
  shipping, cancellation — one line per question, never as decoration.
- The `.label` register is sentence case. No uppercase, no tracking.
- Brand photography lives in `src/content/images.ts`; never hard-code a
  `/brand/` path. Bag photos are editorial only, and alt text never
  names a coffee the store does not sell (§106).
- Four radii, by role (§108): `rounded-pill` for buttons and chips,
  `rounded-card` (16px) for editorial photographs, `rounded-tile`
  (8px) for product tiles and the PDP gallery, `rounded-field` (8px)
  for text inputs. Headings are weight 700. Type, sizes and spacing
  are measured against shop.starbucks.com — see
  `docs/starbucks-parity.md` before changing a token. Ledes are
  regular weight, never bold.
  Borders use `border-border`, never `border-foreground/NN`. Page
  wrappers are `<Section>` (width `max-w-page` = 85% of the screen,
  max 1360px, §108.8); page titles are
  `<PageHeader>` (`align="center"` on listing pages); choice chips use
  `controlVariants`.
- Button size `sm` (36px) is for dense UI. Everything else is 48px:
  `md`, or `lg` for wider padding (§42).
- Motion (§108.5–108.6):
  - The hero carousel.
  - The scroll reveal: mark an element `data-reveal` (stagger with `--reveal-order`) and `RevealObserver` plays it with the Web Animations API. Never set attributes on server-rendered elements from the client.
  - Momentum scrolling through Lenis (`SmoothScroll`, `lerp` 0.18 — keep it responsive, §108.7). Wheel input only, off under reduced motion, paused while a dialog locks `<body>`. Mark an inner scroller `data-lenis-prevent` if it must scroll natively.
  - Pages crossfade, opacity only (`template.tsx`).
  - Panels open with `motion-fade-in`, `motion-slide-in-right` or `motion-drop-in`.
  - Controls ease 200ms between states by default (base layer).
- The hero is the only carousel. Its slides live in `HOME.hero.slides`;
  the first headline is the page's one `<h1>`.

## Commands

```
pnpm dev         pnpm typecheck
pnpm build       pnpm lint
pnpm test        pnpm test:watch
```

Run typecheck, lint and test before calling work complete.
