# Yego Coffee storefront: handover

This is the custom website for Yego Coffee, a family roaster in
Somerville, MA. It is a Next.js frontend that sits in front of
Shopify, which still owns products, prices, carts, checkout, orders,
customers and subscriptions.

Read this file first. It gets you running and shows how the pieces
fit. Then read [`AGENTS.md`](../AGENTS.md), the short list of rules
the codebase follows. [`plan.md`](../plan.md) is the full
specification and decision log. It is long, so look things up by
section number (`§111`) rather than reading it end to end.

---

## 1. Access you need

| What | Where | Why |
|---|---|---|
| GitHub repo | `github.com/nishimweprince/yego-coffee` | Source |
| Hosting (Vercel) | The project linked to the repo | Deploys and environment variables |
| Shopify admin | `admin.shopify.com/store/yego-coffee-2-0` | Products, the Headless channel, the Seal app, webhooks |
| Seal Subscriptions | Shopify admin → Apps | Owns the subscription plans and their customer screens |
| The owners | francois@yegocoffee.com | Product content, prices, policy wording, photography |

Ask for staff access to the Shopify store, not a shared login.

## 2. Run it locally

You need Node 20.9 or newer (it was built on Node 26) and pnpm. The
pinned pnpm version is in `package.json`; `corepack enable` installs
it.

```bash
pnpm install
cp .env.example .env.local     # then fill it in (see below)
pnpm dev                       # http://localhost:3000
```

### Environment variables

`.env.example` documents every variable. In short:

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Everything | The site's own address. Locally `http://localhost:3000`. |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Catalogue, cart | The `*.myshopify.com` domain, not `yegocoffee.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION` | Catalogue, cart | e.g. `2026-07` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Catalogue, cart | The **public** Storefront token from Headless. Never prefix it `NEXT_PUBLIC_`. |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Sign-in, `/account` | Headless → Customer Account API |
| `SHOPIFY_CUSTOMER_ACCOUNT_URL` | Sign-in, `/account` | `https://shopify.com/55913808064/account`. Every sign-in and API address is derived from the number in it. |
| `SHOPIFY_WEBHOOK_SECRET` | Instant catalogue updates | Verifies Shopify's webhook signature |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_POSTHOG_*` | Analytics | Optional. If absent, that provider is off. |

The site boots without any Shopify values. Pages that need data say
"store unavailable" rather than showing fake products: there is
deliberately no mock fallback in the app.

To work on the UI without the real store, run the dev-only mock:

```bash
NODE_OPTIONS='--import ./test/shopify-mock.mjs' pnpm dev
```

### Commands

| Command | |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests (about 650, a few seconds) |
| `pnpm test:e2e` | Playwright, **against the real store** (see §8) |
| `pnpm verify:shopify` | Checks the live Storefront API with your token |

Run typecheck, lint and test before you push.

## 3. How it fits together

```
Browser ──► Next.js (this repo, on Vercel)
              │  Server Components read data on the server
              ├── Storefront API ───────► products, collections, search, cart
              ├── Customer Account API ─► orders, addresses, subscriptions
              └── hands off to Shopify Checkout for payment
Shopify ──webhook──► /api/shopify/webhook ──► refreshes cached catalogue
```

The split of responsibility is strict:

- **Shopify owns commerce truth.** Never hardcode a price, discount
  or delivery frequency. Every one is read from Shopify.
- **Next.js owns presentation:** layout, copy, photography, navigation
  and SEO.

### Where things live

```
src/app/                  Routes (Next.js App Router)
  page.tsx                Home
  shop/, products/        Listing and product pages
  subscriptions/          The subscriptions landing page
  cart/, actions/         Cart page and cart server actions
  account/                Sign-in routes and the signed-in area
  api/shopify/webhook/    Catalogue cache refresh
  globals.css             Design tokens: colour, type, spacing, motion
src/components/           UI, grouped by area (commerce, account, home, ui…)
src/content/              Copy and photography that are ours, not Shopify's
src/lib/shopify/          Storefront API: client, queries, raw types, mappers
src/lib/customer/         Customer Account API: auth, session, queries, mappers
src/lib/catalog/          Logic on top of products: subscription types,
                          grouping, product photos
src/proxy.ts              The /account sign-in gate (Next 16's "middleware")
e2e/                      Playwright flows
plan.md                   Specification and decision log
```

### The data layer pattern

Each Shopify API follows the same three steps:

1. **Queries** are plain GraphQL strings (`queries/`, `queries.ts`).
   `documents.test.ts` checks that every one parses.
2. **Raw types** (`types.api.ts`) describe exactly what Shopify
   returns. Only the mappers touch them.
3. **Mappers** turn raw responses into the view models in `types.ts`.
   Components only ever see view models.

When Shopify changes a field, the fix goes in the query and the
mapper. Components should not need to change.

Components never call `fetch()` themselves. Storefront reads go
through `src/lib/shopify/storefront.ts`, and account reads through
`src/lib/customer/account.ts`.

## 4. The main features

### Catalogue and caching

- **What is sold:** three coffees (Medium Roast, Dark Roast, and Gatare
  Anaerobic Process, whose handle is `light-roast`), the 5 lb Bag, and
  merch.
- **Caching:** catalogue reads are cached for 15 minutes and tagged.
  Shopify's product and collection webhooks hit
  `/api/shopify/webhook`, which checks the signature and refreshes the
  matching tags, so admin edits appear quickly.
- **Webhook setup:** the webhook has to be registered in Shopify admin
  (Settings → Notifications → Webhooks), pointing at
  `<site>/api/shopify/webhook`. Its secret must match
  `SHOPIFY_WEBHOOK_SECRET`.

### Product photography

The owners' studio photos lead each coffee's tiles and gallery, and
Shopify's own photos follow. The files are in
`public/brand/products/`, the mapping is in
`src/content/product-photos.ts`, and `withBrandPhotos` applies it in
`storefront.ts` (plan §111). To change a coffee's photos, edit that
content file; never hard-code a `/brand/...` path in a component.

Editorial photos (founders, café, roaster) are in
`src/content/images.ts`. Alt text names the product as the store
sells it, never the label printed on the bag.

### Cart and checkout

The cart is a Shopify cart whose id is kept in an httpOnly cookie
(`src/lib/shopify/cart.ts`). Checkout is Shopify's own page: this app
hands the customer over and never sees payment details.

### Subscriptions

- **The app:** subscriptions are run by the **Seal Subscriptions** app
  using native Shopify selling plans.
- **Two types, decided in this app** (`src/lib/catalog/subscription-type.ts`,
  plan §110):
  - **Regular:** the customer chooses one coffee. Each coffee is two
    Shopify products, monthly and bi-monthly, shown as one tile.
  - **Roaster's Choice:** the roasters choose. This includes the
    "Drop" products.
- **Never change handles or plans to fix a grouping.** The type comes
  from a "Subscription type:" paragraph the owners wrote in each
  product description, with the handle as a fallback. Change the
  grouping logic in that file instead.

### Customer accounts

- **Sign-in** uses Shopify's Customer Account API with OAuth and PKCE:
  `src/lib/customer/auth.ts` and the routes in `src/app/account/`.
  Tokens live in httpOnly cookies (`session.ts`) and never reach
  browser JavaScript.
- **`src/proxy.ts`** sends anyone without a session cookie to sign-in.
  Each page and server action re-checks the session.
- **Signed-in pages:** overview, orders (paginated, with detail),
  subscriptions (pause, resume, skip or restore a delivery, cancel
  with confirmation), addresses and profile.
- **Changes and errors:** changes go through server actions in
  `src/app/account/actions.ts`. They only report success once Shopify
  returns the changed record.
- **Not editable here:** changing a subscription's coffee, frequency
  or address is not possible through this API. Those links go to
  Shopify's hosted account, where Seal's own screens are.

**Shopify setup for sign-in.** In Admin → Sales channels → Headless →
the storefront → Customer Account API → Application setup:

| Field | Value |
|---|---|
| Callback URI | `<site>/account/callback` |
| JavaScript origin | `<site>` |
| Logout URI | `<site>/` (with the trailing slash) |

Also enable read and write for orders and subscription contracts.
Shopify matches all three URLs **exactly** against what the app sends,
and the app builds them from `NEXT_PUBLIC_SITE_URL`.

## 5. Design system

The rules are in `AGENTS.md`. The ones people most often trip on:

- **Colours:** use the tokens in `globals.css`, never a hex value in
  JSX. There is one accent colour, `roast`. Primary buttons are ink.
- **New tokens:** adding a `--text-*` or colour token means adding it
  to the tailwind-merge config in `src/lib/utils.ts` too. Otherwise
  classes silently cancel each other out (`utils.test.ts` catches
  this).
- **Type sizes:** all type comes from the 15 `--text-*` tokens. The
  scale was reduced by 0.9 in November 2026 at the owners' request.
  Change all fifteen together to retune it.
- **Icons:** Font Awesome only, imported icon by icon.
- **Components:** Server Components by default. Use a client component
  only for something interactive.
- **Forms:** React Hook Form with Zod.
- **Reference page:** `/foundations` renders the design system with
  its reasoning.

## 6. Content changes the owners ask for

| Request | Where |
|---|---|
| Price, product name, description, stock | Shopify admin, not code |
| Homepage hero slides, section copy | `src/content/home.ts` |
| Café hours and copy | `src/content/cafe.ts` |
| Navigation and footer links | `src/content/navigation.ts` |
| Product or editorial photos | `src/content/product-photos.ts`, `src/content/images.ts` |
| Shipping and cancellation answers | Shopify policies. The site quotes them rather than restating them. |

Never invent product content: tasting notes, testimonials, or coffees
the store does not sell.

## 7. Deploying

Pushing to `main` deploys through Vercel. Environment variables are
set in the Vercel project.

- **`NEXT_PUBLIC_*` values are baked in at build time.** After you
  change one in Vercel you must **redeploy**; restarting is not
  enough.
- **The site address appears in several places.** Today
  `NEXT_PUBLIC_SITE_URL` should be the staging address
  `https://yegocoffee.nishimweprince.dev`. At launch on
  `yegocoffee.com`, update three things together:
  1. `NEXT_PUBLIC_SITE_URL` in Vercel, then redeploy
  2. the three Headless URLs in Shopify (§4)
  3. the webhook address
- **What a wrong site address breaks:** sign-in ("redirect_uri
  mismatch"), plus canonical links, the sitemap and share previews.

## 8. Testing

- **Unit tests** (Vitest, `*.test.ts` next to the code) cover mappers,
  validation, GraphQL documents, auth helpers and some page source
  checks. They need no credentials.
- **E2E tests** (Playwright, `e2e/`) run against the **real store**:
  - They need the Storefront variables in `.env.local`.
  - They create real carts but always stop at checkout; nothing is
    ever bought.
  - They run on desktop Chrome and an iPhone profile.
  - Run `npx playwright install` once first.
- **The signed-in account area** cannot be tested automatically,
  because Shopify signs customers in with an emailed code. Test it by
  hand on a deployed address. Sign-in does not work on
  `http://localhost`: Shopify only accepts HTTPS callbacks, so use the
  staging site or a tunnel such as `cloudflared`. The step-by-step
  checklist is plan §111.6.
- **Known failing test:** `src/content/screens.test.ts` expects a
  product-page layout class that the page no longer uses. The test
  predates the November 2026 work. Either restore the class or update
  the test, after checking which one the owners want.

## 9. Gotchas

- **This is Next.js 16.** `middleware.ts` is now `proxy.ts`, and some
  APIs differ from older docs. Read the docs bundled in
  `node_modules/next/dist/docs/` before relying on memory.
- **Route types:** after adding a route, run `npx next typegen` if
  TypeScript says the route does not exist.
- **Generated block in `AGENTS.md`:** `next dev` re-adds its block to
  the top of `AGENTS.md`. Commit it rather than fighting it.
- **Redirects after a form POST must be 303.** NextResponse's default
  307 makes the browser repeat the POST at the new address. That is
  what broke sign-out (fixed in `account/logout/route.ts`, guarded by
  its test).
- **Shopify images are often HEIC,** which most browsers cannot
  display. Request JPEG renditions from Shopify, or use the studio
  photos.
- **Customer Account API quirks:** there is no published schema to
  validate queries against, so `documents.test.ts` only checks syntax.
  `intervalCount` on a delivery policy is an object (`{ count }`),
  not a number.
- **Two API addresses:** sign-in is under
  `shopify.com/authentication/{id}`, and the API is under
  `shopify.com/{id}/account/customer/api`. `src/lib/customer/env.ts`
  derives both, so do not join them by hand.

## 10. Open items

These were open at handover:

1. **Live check of subscription controls.** Walk through plan §111.6
   on a test subscription: skip, restore, pause, resume, cancel.
   Confirm each in Seal's admin.
2. **Product webhook.** Confirm it is registered in Shopify, so
   catalogue edits appear without waiting 15 minutes.
3. **Bags-per-delivery metafield.** `custom.bags_per_delivery` is not
   readable through the Storefront API, so the site falls back to the
   product handle. Give the metafield Storefront access in Shopify.
4. **Owner copy questions (§110).**
   - Shopify copy says "twice a month", but the plans bill every two
     weeks.
   - Roaster's Choice One Bag costs more per bag than a Regular bag,
     although its description promises a better price.
5. **Return requests.** Shopify's API supports them
   (`orderRequestReturn`), but they were not built. Confirm the return
   policy with the owners first.
6. **Launch.** Move to `yegocoffee.com` as described in §7.
