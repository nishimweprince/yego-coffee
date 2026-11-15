# Yego Coffee — Headless Storefront

A custom headless storefront for [Yego Coffee](https://yegocoffee.com): a
Next.js frontend in front of Shopify, which still owns products, prices,
carts, checkout, orders, customers and subscriptions.

> **Taking over this project? Start with the handover:
> [docs/handover.md](docs/handover.md)**
> ([view on GitHub](https://github.com/nishimweprince/yego-coffee/blob/main/docs/handover.md)).
> It covers access, local setup, environment variables, architecture,
> deployment, testing, gotchas and the items still open.

**Status: handed over (November 2026).** The storefront, cart, Shopify
Checkout hand-off, subscriptions and the signed-in customer account area
are built and running against the live store on staging
(`https://yegocoffee.nishimweprince.dev`). Launch on `yegocoffee.com` is
pending. See [handover §10](docs/handover.md#10-open-items) for what is
left.

---

## Read in this order

| Document | What it is |
|---|---|
| [docs/handover.md](docs/handover.md) | Start here. Gets you running and explains how the pieces fit. |
| [AGENTS.md](AGENTS.md) | The short list of rules the codebase follows (humans and agents). |
| [plan.md](plan.md) | Full specification and decision log. Look things up by section (`§111`); don't read it end to end. |

## About the brand

Yego Coffee is a family-owned roaster in Somerville, Massachusetts, run by
Fatuma and Francois Tuyishime. *Yego* is Kinyarwanda for *yes* — a word of
affirmation that carried the family's community through rebuilding after
the 1994 genocide against the Tutsi. The Tuyishime family has been in coffee
for over four decades, beginning on Rwandan farms.

That story is the emotional core of the site, not decoration around it.

## Division of responsibility

| Concern | Owner |
|---|---|
| Products, prices, inventory, selling plans, cart, checkout, orders, customers | **Shopify** |
| Subscriptions (plans and contracts) | **Shopify + Seal Subscriptions** |
| Design, storytelling, navigation, SEO | **Next.js** |
| Payment completion | **Shopify Checkout** |

The frontend never hardcodes commerce truth. Every price, discount and
delivery frequency resolves from Shopify.

## Stack

Next.js 16 (App Router) · React · TypeScript (strict) · Tailwind CSS ·
shadcn/ui · React Hook Form + Zod · Font Awesome · Shopify Storefront API +
Customer Account API · Vercel · pnpm · Vitest + Playwright

## Quick start

```bash
corepack enable                # installs the pinned pnpm
pnpm install
cp .env.example .env.local     # fill in — see handover §2
pnpm dev                       # http://localhost:3000
```

The app boots without Shopify credentials; data pages say "store
unavailable" rather than showing fake products. To work on the UI without
the real store:

```bash
NODE_OPTIONS='--import ./test/shopify-mock.mjs' pnpm dev
```

| Command | |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright, **against the real store** (stops at checkout) |
| `pnpm verify:shopify` | Checks the live Storefront API with your token |

Run typecheck, lint and test before you push. Pushing to `main` deploys
through Vercel.

`/foundations` renders the design system with its reasoning.

## Repository layout

```text
docs/handover.md          Handover — start here
AGENTS.md                 Working rules
plan.md                   Specification and decision log
src/app/                  Routes (shop, products, subscriptions, cart, account, …)
src/components/           UI, grouped by area
src/content/              Copy and photography that are ours, not Shopify's
src/lib/shopify/          Storefront API: client, queries, raw types, mappers
src/lib/customer/         Customer Account API: auth, session, queries, mappers
src/lib/catalog/          Subscription types, grouping, product photos
src/proxy.ts              /account sign-in gate (Next 16's "middleware")
e2e/                      Playwright flows
```

More detail in [handover §3](docs/handover.md#3-how-it-fits-together).

## Rules that matter most

The full set is in [AGENTS.md](AGENTS.md).

- **Shopify is authoritative for prices.** Never hardcode a price or
  compute a selling-plan discount.
- **Never invent product content:** no fabricated tasting notes,
  testimonials, or coffees the store does not sell.
- **Server Components by default**; client components only for
  interactive islands.
- **No `any` on Shopify responses.** Components see view models only.
- **Font Awesome only**, never Lucide.
- **Adding a `--text-*` or colour token means updating the
  tailwind-merge config in `src/lib/utils.ts`**, or classes silently
  cancel each other out.
- **Never edit handles or selling plans to fix subscription grouping**;
  change `src/lib/catalog/subscription-type.ts` instead.

## Open items at handover

Summarised from [handover §10](docs/handover.md#10-open-items):

1. Live walkthrough of subscription controls (plan §111.6).
2. Confirm the product webhook is registered in Shopify.
3. Give `custom.bags_per_delivery` Storefront API access.
4. Owner copy questions from plan §110.
5. Return requests: not built; confirm the policy first.
6. Launch on `yegocoffee.com` (handover §7).

One known failing test: `src/content/screens.test.ts` (see
[handover §8](docs/handover.md#8-testing)).
