# Yego Coffee — Headless Storefront

A custom headless storefront for [Yego Coffee](https://yegocoffee.com), replacing the current Shopify theme with a Next.js frontend while keeping Shopify as the commerce backend.

**Status: Phase 2 (Commerce primitives) — built, unverified.** The design
system, product and cart layers, and the shop/PDP/cart routes are in place.
**No Storefront API request has ever executed** — the whole data layer awaits
credentials. Specification in [plan.md](plan.md); build records in
[§94](plan.md) and [§95](plan.md).

---

## About the brand

Yego Coffee is a family-owned roaster in Somerville, Massachusetts, run by Fatuma and Francois Tuyishime. *Yego* is Kinyarwanda for *yes* — a word of affirmation that carried the family's community through rebuilding after the 1994 genocide against the Tutsi. The Tuyishime family has been in coffee for over four decades, beginning on Rwandan farms.

That story is the emotional core of the site, not decoration around it. Product pages and brand copy should treat it as the reason the coffee exists.

## What we're building

A premium, editorial storefront where **subscriptions are the primary conversion goal**, fronted by a guided coffee quiz that matches a visitor to a roast and a delivery rhythm.

The division of responsibility is strict:

| Concern | Owner |
|---|---|
| Products, prices, inventory, selling plans, cart, checkout, orders, customers | **Shopify** |
| Design, storytelling, navigation, quiz, recommendation logic, motion, SEO | **Next.js** |
| Payment completion | **Shopify Checkout** |

The frontend never hardcodes commerce truth. Every price, discount and delivery cadence shown to a customer resolves from Shopify data at request time.

## Planned stack

Next.js · React · TypeScript (strict) · Tailwind CSS · shadcn/ui · React Hook Form + Zod · TanStack Table · Font Awesome · Shopify Storefront API + Customer Account API · Vercel · pnpm · Vitest + Playwright

Versions are deliberately unpinned in the plan — install current stable releases at project initialization rather than the versions named in [plan.md §3](plan.md), then lock via `pnpm-lock.yaml`.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in when Shopify credentials arrive
pnpm dev
```

Then open `/foundations` for the design system — colour, type, surfaces and
primitives, with the reasoning attached.

| Command | |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm verify:shopify` | Live Storefront check (skips without credentials) |

The app boots and renders without Shopify credentials. Anything that touches
the Storefront API throws with an actionable message rather than falling back
to mock data.

The remaining build sequence is specified in [plan.md §83](plan.md). The
critical checkpoint is step 7:

> Do not continue into elaborate visual implementation until a real Shopify subscription can travel correctly from a custom product UI, through the custom cart, into Shopify Checkout.

This validates the hardest commerce boundary before design complexity accumulates.

## Repository layout

```text
plan.md                    Full specification (§1–95)
AGENTS.md                  Working rules for anyone (human or agent) here
src/app/globals.css        Design tokens — colour, type, spacing, motion
src/app/foundations/       Design system reference page
src/app/shop/              Product listing
src/app/products/[handle]/ Product detail
src/app/cart/              Cart
src/app/actions/           Cart server actions
src/components/ui/         Primitives (Button, Contour)
src/components/commerce/   Product and cart components
src/lib/env/               Zod environment validation
src/lib/shopify/           Storefront client, cart, queries, mappers, types
src/lib/formatting/        Money (Intl.NumberFormat)
```

Full planned structure is in [plan.md §26](plan.md).

## Working on this project

The working set lives in [AGENTS.md](AGENTS.md); the full specification is in [plan.md §71–74](plan.md). The rules that matter most:

- **Shopify is authoritative for prices.** Never hardcode a selling-plan discount or compute one from a fixed percentage.
- **Server Components by default.** Client components only for genuine interactive islands.
- **Never fabricate product content.** No invented tasting notes, no fictional processing detail, no generated testimonials. With a four-coffee catalog the temptation is real and is called out explicitly in [§93.5](plan.md).
- **Font Awesome for icons**, not Lucide — replace icons in any generated shadcn component.
- **No `any`** on Shopify API responses.
- **Adding a `--text-*` or semantic colour token means updating the tailwind-merge
  config in `src/lib/utils.ts`** — it cannot classify custom names and will
  silently drop one of two `text-*` classes. This already caused one unreadable
  button; see [§94.4](plan.md).
- Run typecheck and tests before calling work complete.

## Known gaps

Tracked in [plan.md §92.2](plan.md). None were resolved by the Phase 1 build —
all need the owners rather than the code. The two that block real work:

1. **"Bi-Monthly" cadence is ambiguous** — every two weeks, or every two months? This sets a real billing interval. Getting it wrong charges customers four times more often than they expect. Confirm before creating any Shopify selling plan.
2. **Subscriptions are currently modeled as duplicate standalone products** (e.g. `dark-roast-monthly-subscription`) rather than native selling plans on a single product. This must be consolidated in Shopify before PDP work begins — see [§92.1](plan.md).

Also outstanding: **no Storefront API request has ever been executed.** The
client, queries, cart mutations and the entire commerce UI are written and
typed, but nothing has touched a live store.

What *is* verified without credentials: all eight GraphQL operations validate
against Shopify's real published Storefront schema ([§95.10](plan.md)), and the
whole PDP → cart → checkout chain is covered by integration tests against mocked
Shopify responses ([§95.9](plan.md)) — including cart persistence across a
reload.

What still needs a token: that the credentials work, what Yego's catalogue
actually contains, and whether checkout totals match. Run `pnpm verify:shopify`
the moment credentials land — it executes the whole sequence and skips cleanly
until then. See [§95.5](plan.md).

## Placeholder data

Some values in the plan are placeholders standing in for details not yet supplied. They are safe in development and **must not reach production**:

| Value | Status |
|---|---|
| Café phone `+1 816 352 9842` | Carried-over number, not the café line |
| Café hours 8:00–18:00 daily | Assumed, not verified |
| Café menu | Deliberately out of scope for now |

These feed structured data, "Open now" state and `tel:` links — all outward-facing and awkward to correct once published. Keep them in a single content module so the swap is one edit, and consider failing production builds while placeholders are still present.
