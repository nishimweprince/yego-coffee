# Headless Shopify Coffee Experience — Product, UX & Technical Implementation Plan

> **Draft v1 — September 2026**  
> A conversion-first, premium editorial coffee storefront built with Next.js and Shopify, centered on subscriptions and personalized coffee discovery.

---

## 1. Executive Summary

This project will replace the existing Shopify theme with a **fully custom headless storefront** built in **Next.js**, while preserving Shopify as the authoritative commerce backend.

The frontend should feel less like a conventional ecommerce template and more like a premium brand experience: editorial, cinematic, spacious, tactile, and interactive. The visual foundation combines:

- **Siwa Capital** — spatial composition, pacing, typography, restraint, motion
- **Onyx Coffee Lab** — coffee storytelling and product merchandising
- **MAME** — premium restraint and European editorial sensibility
- **Ex Animo** — personalized product discovery
- **Verve / Blue Bottle** — conversion mechanics and subscription UX

> **Superseded by §89.** The full benchmark set and the primary/supporting split live there. §89 is the build reference.

The commercial objective is explicit:

> **Subscriptions are the primary conversion goal.**

The homepage hero should lead with emotional brand storytelling, but the primary action should move visitors toward a subscription journey. Users can still shop individual products normally, but subscription discovery, personalization, and recurring-purchase benefits should be woven throughout the entire site.

The proposed experience will include:

- Custom Shopify-powered product catalog
- Existing Shopify subscription plans
- Personalized coffee quiz
- Tailored subscription recommendations
- Custom cart
- Shopify Checkout redirect
- Customer account portal
- Subscription management
- Order history
- Saved addresses/profile management
- Search and predictive search
- One physical café location
- Journal / educational content
- Conversion analytics and experimentation
- Responsive premium motion system
- Accessibility and performance budgets
- AI-assisted implementation using the **frontend design skill**
- Optional accelerated implementation using **Codex's web-app building capability**

---

# 2. Core Product Principles

## 2.1 Shopify owns commerce truth

Shopify remains the system of record for:

- Products
- Variants
- Prices
- Compare-at prices
- Inventory
- Availability
- Product images
- Product descriptions
- Selling plans
- Selling-plan price adjustments
- Subscription frequency
- Discounts
- Cart
- Checkout
- Orders
- Customer identity
- Addresses
- Subscription contracts
- Payment/billing operations supported through Shopify customer APIs

The frontend must **never hardcode authoritative commerce pricing**.

Any UI calculation such as:

- "Save 15%"
- "$18 per delivery"
- "$0.74 per cup"
- "You save $42/year"

must ultimately derive its pricing basis from Shopify data.

## 2.2 Next.js owns experience

Next.js owns:

- Site composition
- Page layouts
- Design system
- Brand storytelling
- Navigation
- Product discovery
- Coffee quiz
- Subscription recommendation logic
- UI state
- Motion
- Content layout
- Search experience
- Cart drawer presentation
- Analytics instrumentation
- A/B test presentation
- SEO output
- Performance strategy

## 2.3 Shopify Checkout owns payment completion

The custom storefront handles:

```text
Discovery
   ↓
Recommendation
   ↓
Product / Subscription configuration
   ↓
Custom cart
   ↓
Shopify cart
   ↓
checkoutUrl
   ↓
Shopify Checkout
   ↓
Order confirmation
```

Payment data should not be handled by the Next.js application.

## 2.4 Subscription-first without becoming aggressive

The site should not resemble a SaaS landing page or discount-heavy DTC storefront.

Subscription should be framed around:

- convenience
- freshness
- personalization
- ritual
- discovery
- consistency

rather than primarily around price reduction.

The brand proposition should feel like:

> **Better coffee, matched to how you actually drink it.**

The economic benefit can reinforce the value proposition without becoming the brand identity.

---

# 3. Confirmed Technology Baseline

The application should begin on the latest supported stable stack at implementation time.

As of this draft:

| Layer | Target |
|---|---|
| Framework | Next.js 16.3.3+ Active LTS |
| React | React 19.2 |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS 4.3+ |
| Component foundation | shadcn/ui, current release |
| shadcn primitive layer | Base UI unless a Radix-specific primitive is required |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table |
| Async client state | TanStack Query where server-first patterns are insufficient |
| Icons | Font Awesome React |
| Commerce | Shopify Storefront API 2026-07+ |
| Customer accounts | Shopify Customer Account API 2026-07+ |
| Deployment | Vercel |
| Package manager | pnpm |
| Testing | Vitest + React Testing Library + Playwright |
| Error monitoring | Sentry or equivalent |
| Product analytics | PostHog |
| Web analytics | GA4 |
| Commerce analytics | Shopify analytics |
| Motion | CSS/View Transitions first; GSAP where choreography warrants it |
| Image optimization | Next.js Image + Shopify CDN |
| Content | Repository-managed content + Shopify object data |

### Version policy

Do not pin the specification permanently to the versions above.

At project initialization:

1. install current stable/LTS releases;
2. avoid canary/beta dependencies in production;
3. lock package versions through `pnpm-lock.yaml`;
4. use Dependabot or Renovate;
5. group dependency upgrades;
6. run visual and E2E regression tests before framework upgrades.

---

# 4. Recommended Architecture

## 4.1 High-level system architecture

```text
                        ┌───────────────────────────┐
                        │         Visitor           │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │        Vercel CDN         │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App                           │
│                                                                 │
│  Server Components  │  Client Islands  │  Route Handlers        │
│  Cache Components   │  Quiz            │  Cart Actions          │
│  SEO                │  Search UI       │  Webhooks              │
│  Product pages      │  Account UI      │  Analytics endpoints   │
│                     │  Motion          │                        │
└───────────┬──────────────────┬───────────────────┬──────────────┘
            │                  │                   │
            ▼                  ▼                   ▼
┌─────────────────┐ ┌────────────────────┐ ┌─────────────────────┐
│ Shopify         │ │ Shopify Customer   │ │ Analytics / Ops      │
│ Storefront API  │ │ Account API        │ │ GA4 / PostHog /      │
│                 │ │                    │ │ Sentry / Meta        │
└────────┬────────┘ └─────────┬──────────┘ └─────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────┐
│ Products        │  │ Orders              │
│ Variants        │  │ Profile             │
│ Prices          │  │ Addresses           │
│ Selling plans   │  │ Subscription        │
│ Cart            │  │ contracts           │
│ Search          │  │                     │
└────────┬────────┘  └─────────────────────┘
         │
         ▼
┌─────────────────┐
│ Shopify Checkout│
└─────────────────┘
```

---

# 5. Content Ownership Strategy

The simplest model for this project is **content-as-code for brand/editorial pages** plus Shopify for commerce data.

## 5.1 Shopify-managed data

Use Shopify for object data that naturally belongs to commerce:

- Product title
- Product handle
- Product description
- Product media
- Product variants
- Price
- Compare-at price
- Inventory
- Selling plans
- SKU
- Product tags/type/vendor
- Coffee-specific product metafields

Recommended coffee metafields:

```text
coffee.origin
coffee.country
coffee.region
coffee.producer
coffee.variety
coffee.process
coffee.altitude
coffee.roast_profile
coffee.flavor_notes
coffee.brew_methods
coffee.body
coffee.acidity
coffee.sweetness
coffee.intensity
coffee.decaf
coffee.featured
coffee.quiz_profile
coffee.story_short
coffee.story_long
coffee.harvest
coffee.score
```

Use structured references where practical rather than freeform strings.

## 5.2 Repository-managed content

Keep non-commerce brand content in the frontend repository.

Suggested structure:

```text
src/content/
  home.ts
  brand.ts
  cafe.ts
  subscription.ts
  navigation.ts
  footer.ts
  faq.ts
  legal/
  journal/
```

This supports:

- version-controlled content
- easy developer/client editing
- no additional CMS
- preview through Git branches
- typed content
- reusable visual sections

Where editorial volume becomes significant later, this architecture can migrate to a CMS without changing Shopify commerce boundaries.

## 5.3 MDX for journal content

Recommended:

```text
content/
  journal/
    dialing-in-espresso.mdx
    pourover-basics.mdx
    coffee-processing-guide.mdx
```

Frontmatter:

```yaml
title:
slug:
excerpt:
publishedAt:
updatedAt:
author:
heroImage:
category:
tags:
seoTitle:
seoDescription:
```

Keep journal implementation compatible with migration to a CMS later.

---

# 6. Information Architecture

## Primary navigation

```text
Shop
Subscriptions
Find Your Coffee
Our Story
Café
Journal
Search
Account
Cart
```

Desktop navigation should remain visually restrained.

Mobile navigation should use a full-screen or large-sheet navigation experience.

## Recommended route map

```text
/
├── /shop
│   ├── /coffee
│   ├── /equipment
│   ├── /merch
│   └── /collections/[handle]
│
├── /products/[handle]
│
├── /subscriptions
│   ├── /build
│   ├── /how-it-works
│   └── /faq
│
├── /quiz
│   ├── /[step]                optional URL-state approach
│   └── /results
│
├── /search
│
├── /cafe
│
├── /about
│   ├── /story
│   ├── /sourcing
│   └── /roasting
│
├── /journal
│   └── /[slug]
│
├── /account
│   ├── /orders
│   ├── /orders/[id]
│   ├── /subscriptions
│   ├── /subscriptions/[id]
│   ├── /addresses
│   └── /profile
│
├── /policies
│   ├── /shipping
│   ├── /returns
│   ├── /privacy
│   └── /terms
│
└── /api
    ├── /search
    ├── /analytics
    └── /webhooks
```

---

# 7. Homepage Conversion Architecture

The homepage should work as a narrative funnel rather than an ecommerce grid.

> **Copy in §7 and §8 is superseded by §90.** These two sections remain authoritative for *structure* — objectives, data requirements, responsive behavior, component boundaries. Every headline, CTA label, and body string in them is placeholder text written before Yego's brand facts were confirmed. Build the copy from §90; build the structure from here.

## Section 1 — Hero

### Objective

Create emotional desire first, then direct it toward subscription.

### Recommended message

```text
Coffee worth looking forward to.

Matched to your taste.
Roasted fresh.
Delivered on your schedule.
```

Primary CTA:

```text
Find My Coffee
```

Secondary CTA:

```text
Shop Coffee
```

Supporting microcopy:

```text
Personalized subscriptions from $X per delivery.
Pause or change anytime.
```

The actual price must come from Shopify where displayed.

### Visual behavior

Desktop:

- full viewport
- cinematic image/video placeholder
- oversized typography
- subtle foreground/background parallax
- navigation initially transparent
- scroll cue
- restrained CTA motion
- subscription benefit visible without overpowering branding

Mobile:

- image crop specifically art-directed
- no autoplay-heavy video if bandwidth/power conditions make it inappropriate
- hero copy must remain readable without relying on animation
- CTA above the fold

---

# 8. Homepage Section Plan

## 8.1 Hero — Subscription emotional proposition

Primary CTA enters quiz.

Secondary CTA enters shop.

## 8.2 "How do you take your coffee?"

A highly interactive flavor/discovery teaser.

Four editorial cards:

```text
Bright & Fruity
Rich & Chocolatey
Clean & Floral
Surprise Me
```

Hover/focus behavior changes:

- image
- descriptor
- tasting-note typography
- subtle background treatment

Selecting one may launch the quiz with that preference prefilled.

This turns a visual section into a conversion input.

## 8.3 Featured coffees

Show only 3–4 products.

Avoid generic Shopify cards.

Each item should contain:

- large art-directed product visual
- product name
- flavor notes
- origin
- price
- subscription price or savings when applicable
- "Subscribe" primary action where relevant
- "Explore" secondary action

Presentation can alternate image/text placement to preserve editorial pacing.

## 8.4 Subscription manifesto

Large text:

```text
Your coffee should fit your ritual.
Not the other way around.
```

Three concise benefits:

```text
01  Matched to your taste
02  Roasted fresh
03  Delivered when you need it
```

CTA:

```text
Build My Subscription
```

## 8.5 Coffee quiz invitation

Full-width conversion module.

```text
Not sure what to choose?

Tell us how you brew,
what you like,
and how much you drink.

We'll do the rest.
```

CTA:

```text
Take the 30-second quiz
```

## 8.6 Product story / origin moment

Highlight one hero coffee or producer.

Large photography placeholder.

Editorial copy.

This prevents the site from feeling purely transactional.

## 8.7 Subscription plan preview

Show available plan archetypes based on actual Shopify selling plans.

Example presentation:

```text
Every 2 weeks
Best for daily drinkers

Every 4 weeks
Best for occasional drinkers

Custom match
Based on your quiz
```

Do not hardcode plan availability.

## 8.8 Café section

```text
Come have one with us.
```

Include:

- café image
- city/neighborhood
- address
- opening hours
- "Get directions"
- ~~"View café menu"~~ — deferred, no menu content exists (§91)

Optional:

- today's opening state
- transit/parking notes
- event card

## 8.9 Social proof

Potential sources:

- Google reviews
- press mentions
- customer testimonials
- subscriber count
- UGC

Keep it visually sparse.

Avoid generic testimonial carousels unless content quality warrants one.

## 8.10 Education / Journal

3 editorial stories.

Examples:

- How to choose coffee by flavor
- Espresso vs filter roast
- How much coffee should I order?
- Meet a producer
- How freshness changes flavor

## 8.11 Final subscription CTA

Large final screen:

```text
The right coffee.
Right when you need it.
```

Primary:

```text
Find My Coffee
```

Secondary:

```text
See Subscription Options
```

## 8.12 Footer

Include:

- shop
- subscriptions
- café
- journal
- support
- policies
- newsletter
- Instagram / social
- accessibility
- country = United States

---

# 9. Coffee Quiz Specification

The coffee quiz is a major product feature, not a marketing popup.

> **Right-sized by §93.** The eight-step quiz below was specified against a hypothetical large catalog. Yego currently sells four coffees. §93 cuts this to the questions that actually discriminate between real SKUs and removes the ones the catalog cannot answer. Keep §9.3 (UX), §9.4 (engine shape), §9.5 (quantity math) and §9.6 (result page) — replace §9.2's question list with §93.2.

## 9.1 Goal

Recommend:

1. coffee/product
2. variant
3. subscription frequency
4. quantity
5. selling plan
6. optional alternative recommendation

## 9.2 Proposed questions

### Step 1 — Brew method

```text
How do you usually make coffee?
```

Options:

- Espresso machine
- Pour over
- Drip machine
- French press
- AeroPress
- Moka pot
- Cold brew
- I switch it up

Multi-select allowed.

### Step 2 — Flavor preference

```text
Which sounds best?
```

Options should be sensory rather than technical.

```text
Chocolate & caramel
Sweet & nutty
Bright & fruity
Floral & tea-like
Bold & roasty
Surprise me
```

### Step 3 — Adventure level

```text
How adventurous do you want your coffee?
```

Range:

```text
Classic ───────────────── Experimental
```

### Step 4 — Roast preference

```text
What roast profile do you usually enjoy?
```

- Light
- Medium
- Dark
- I don't know

"I don't know" must be treated as a valid answer.

### Step 5 — Consumption

```text
How many cups do you make on a typical day?
```

Use stepper.

### Step 6 — Number of drinkers

```text
How many people are drinking from the bag?
```

### Step 7 — Delivery preference

Could be inferred rather than forcing user input.

Show calculated recommendation:

```text
Based on ~2 cups/day,
we recommend 2 bags every 4 weeks.
```

Allow modification.

### Step 8 — Decaf

- Regular
- Decaf
- Mix of both

## 9.3 Quiz UX

Requirements:

- progress indicator
- keyboard accessible
- back navigation
- state persisted during session
- no mandatory email gate before results
- no full reload between steps
- motion respects `prefers-reduced-motion`
- answers encoded in a typed schema
- analytics event per step
- abandonment measurable
- URL/session restoration where useful

## 9.4 Recommendation engine

Do not use opaque AI for v1.

Use deterministic weighted matching.

Example normalized product profile:

```ts
type CoffeeProfile = {
  productId: string
  roast: "light" | "medium" | "dark"
  flavorFamilies: Array<
    "chocolate" |
    "nutty" |
    "fruit" |
    "floral" |
    "roasty"
  >
  brewMethods: string[]
  adventure: number
  decaf: boolean
  intensity: number
}
```

Example score:

```text
Total Score =
  Flavor Match       × 0.35
+ Brew Compatibility × 0.20
+ Roast Match        × 0.15
+ Adventure Match    × 0.15
+ Availability       × 0.10
+ Merchandising Bias × 0.05
```

Weights should be configurable.

## 9.5 Quantity calculation

Keep consumption logic transparent.

Example assumptions:

```text
coffeePerCupGrams = 18
cupsPerDay = answer
daysPerCycle = selling plan interval
```

Estimate:

```text
gramsNeeded =
coffeePerCupGrams × cupsPerDay × daysPerCycle × drinkerFactor
```

Then map to available variants.

Do not promise exact consumption.

Use copy such as:

```text
Based on your routine, this should keep you stocked without
leaving coffee sitting around too long.
```

## 9.6 Quiz result page

Structure:

```text
Your match

[large coffee image]

COFFEE NAME
Chocolate · Cherry · Caramel

Why we picked it
- works beautifully for espresso
- balanced sweetness
- matches your preference for familiar flavors

Your recommended plan
2 × 12 oz bags
Every 4 weeks
$XX / delivery
Save XX%

[Start my subscription]

Adjust:
Quantity
Frequency
Grind / whole bean

Alternative:
Want something brighter?
[View second match]
```

Every displayed price should come from the relevant Shopify variant / selling-plan allocation.

---

# 10. Subscription Architecture

## 10.1 Shopify subscriptions

Use native Shopify-compatible selling plans.

Required Storefront access:

```text
unauthenticated_read_selling_plans
```

A subscription cart line should include the selected variant and selling plan.

Conceptually:

```ts
{
  merchandiseId: variantId,
  quantity: 2,
  sellingPlanId: sellingPlanId
}
```

## 10.2 Subscription pricing

Read:

- selling plan
- allocation
- allocation price adjustments
- compare-at
- per-delivery price
- effective price

Never calculate the authoritative subscription price from a hardcoded percentage.

A Shopify plan may use:

- percentage adjustment
- fixed amount adjustment
- fixed price

The frontend abstraction must support all three.

## 10.3 Product purchase modes

PDP should support:

```text
( ) One-time purchase      $24
(●) Subscribe & save       $20.40
```

Then frequency:

```text
Every 2 weeks
Every 3 weeks
Every 4 weeks
```

Only options available for the selected variant should appear.

## 10.4 Subscription CTA hierarchy

For subscription-compatible coffee:

Primary:

```text
Subscribe
```

Secondary:

```text
Buy once
```

This can be tested.

Do not make one-time purchase difficult or deceptive.

## 10.5 Subscription messaging

Reusable benefit component:

```text
Why subscribe?

✓ Freshly roasted coffee on your schedule
✓ Save on every delivery
✓ Skip or adjust when needed
✓ Cancel according to subscription terms
```

Wording must reflect actual Shopify subscription capabilities and store policies.

---

# 11. Customer Account Experience

Use Shopify Customer Account API.

## 11.1 Authentication

Implement Shopify-supported customer authentication.

Avoid implementing a separate password system.

Account routes should be protected server-side.

## 11.2 Account overview

Dashboard:

```text
Welcome back, First Name.

Next coffee delivery
[date]

[Manage subscription]

Recent order
#1234
[View]

Saved address
[Edit]
```

## 11.3 Orders

Desktop:

Use **TanStack Table** where a table improves scanability.

Columns:

```text
Order
Date
Status
Total
Items
Action
```

Mobile:

Convert rows into stacked cards.

Do not force desktop tables horizontally on narrow screens.

## 11.4 Order detail

Include:

- order number
- date
- fulfillment status
- line items
- quantities
- pricing
- discounts
- shipping
- address
- tracking link where available

## 11.5 Subscription list

```text
Active
Paused
Cancelled
```

Each card:

```text
COFFEE
2 × 12 oz
Every 4 weeks

Next billing:
Oct 14

[Manage]
```

## 11.6 Subscription detail

Where Shopify APIs allow, support:

- cancel
- pause
- resume
- change frequency
- change quantity
- change product/variant where supported
- update delivery address
- skip next order
- view upcoming billing
- review previous orders
- payment-method management handoff

Any operation unavailable in the current Customer Account API should link into Shopify's supported customer-account flow rather than being reimplemented insecurely.

## 11.7 Subscription mutation safety

All subscription modifications require:

- authenticated customer
- server-side authorization
- validated ownership
- confirmation UI for destructive actions
- optimistic UI only when rollback is safe
- clear success/error states

---

# 12. Product Catalog

## 12.1 Shop page

Initial emphasis should be product discovery rather than showing dozens of filters.

Recommended top controls:

```text
All
Coffee
Equipment
Merch
```

Coffee filters:

- roast
- flavor
- brew method
- origin
- process
- decaf
- availability
- subscription-compatible

> **Right-sized by §93.3.** Most of these filters resolve to one bucket or zero results against Yego's real catalog (single-origin Rwanda, no decaf SKU). Ship the reduced set in §93.3 and reintroduce filters as the catalog earns them.

## 12.2 Filter UX

Desktop:

- horizontal controls for top filters
- sheet/popover for advanced filters

Mobile:

- bottom sheet

State should sync to query string.

Example:

```text
/shop/coffee?roast=light&flavor=fruit&brew=filter
```

Benefits:

- shareable
- back-button friendly
- crawlable where appropriate
- persistent after navigation

## 12.3 Product card

Card data:

```text
image
title
origin
flavor notes
price
subscription price / savings
availability
badges
```

Avoid excessive badges.

Use tags such as:

```text
New
Limited
Decaf
Subscriber Favorite
```

only when meaningful.

---

# 13. Product Detail Page

## Above the fold

Desktop split layout:

```text
┌──────────────────────────┬─────────────────────────┐
│                          │ Product name            │
│ Large product media      │ Origin / notes          │
│                          │                         │
│                          │ Purchase mode           │
│                          │ Frequency               │
│                          │ Variant / grind         │
│                          │ Quantity                │
│                          │ Price                   │
│                          │                         │
│                          │ [Subscribe]             │
│                          │ [Buy once]              │
└──────────────────────────┴─────────────────────────┘
```

Mobile:

- swipeable media
- sticky purchase CTA after initial product context
- bottom-sheet configuration where appropriate

## Product storytelling

Sections:

```text
Flavor profile
Origin
Producer
Process
Variety
Altitude
Roasting intent
Brew guidance
Subscription options
Related coffees
```

## Flavor visualization

Avoid radar charts unless genuinely useful.

A tactile scale can communicate:

```text
Body       Light ───────── Full
Acidity    Soft  ───────── Bright
Sweetness  Dry   ───────── Sweet
```

This is more understandable than analytics-style charts.

---

# 14. Search

Use Shopify Storefront API search.

## 14.1 Predictive search

Open via:

- search icon
- `/`
- `Cmd/Ctrl + K`

Search panel:

```text
Search coffee, gear, stories...

Suggested:
espresso
chocolate
Ethiopia

Products
[3 quick results]

Collections
[results]

Journal
[results]

[See all results]
```

Shopify predictive search can return:

- products
- collections
- pages
- articles
- query suggestions

## 14.2 Full search

Route:

```text
/search?q=...
```

Support:

- relevance
- product filters
- result count
- pagination / load more
- empty state

## 14.3 Search analytics

Track:

- search_opened
- search_query_submitted
- predictive_result_clicked
- search_no_results
- search_filter_applied

Use no-results data to improve merchandising and content.

---

# 15. Cart Experience

## 15.1 Cart UI

Use an animated side drawer on desktop and sheet/full-height drawer on mobile.

Each line:

```text
Product image
Name
Variant
Subscription frequency if applicable
Quantity
Price
Remove
```

For subscriptions:

```text
Delivers every 4 weeks
```

## 15.2 Cart summary

```text
Subtotal
Subscription savings
Estimated total
```

Do not present tax/shipping as final until Shopify confirms them.

CTA:

```text
Checkout
```

uses Shopify cart `checkoutUrl`.

## 15.3 Cart persistence

Store Shopify cart ID in a secure cookie or appropriate first-party persistence.

Rules:

- validate expired carts
- recover gracefully
- do not duplicate carts unnecessarily
- merge authenticated state where supported
- cart UI must use server-confirmed Shopify totals

## 15.4 Optimistic updates

Allow optimistic UI for:

- quantity change
- remove line
- add item

But reconcile with Shopify response immediately.

On mismatch:

- Shopify response wins
- UI visibly corrects
- error message explains unavailable inventory/pricing where relevant

---

# 16. One-Café Experience

Route:

```text
/cafe
```

Include:

- hero photography placeholder
- location
- address
- phone
- operating hours
- directions
- ~~café menu~~ — deferred (§91); omit the section entirely rather than stubbing it
- accessibility details
- Wi-Fi/policy if relevant
- parking/transit
- events
- selected photos
- FAQ

Optional homepage "Open now" status should be calculated from structured hours and user-local/café-local time.

Do not make Google Maps a blocking dependency for primary information.

---

# 17. Design System

## 17.1 Visual principles

```text
Quiet confidence
Large typography
Strong photography
Editorial rhythm
Asymmetric composition
High whitespace
Minimal chrome
Tactile microinteraction
Controlled motion
Conversion clarity
```

## 17.2 Layout grid

Desktop:

```text
max-width: 1440–1600px depending on section
12-column grid
responsive gutters
```

Editorial full-bleed sections may intentionally break the grid.

Tablet:

8 columns.

Mobile:

4 columns.

## 17.3 Spacing

Use semantic spacing tokens rather than arbitrary values.

Examples:

```css
--space-section-sm
--space-section-md
--space-section-lg
--space-page-x
--space-stack-xs
--space-stack-sm
--space-stack-md
--space-stack-lg
```

Tailwind theme variables should map to the design tokens.

## 17.4 Typography

Use one expressive display family + one utilitarian text family unless brand assets dictate otherwise.

Recommended roles:

```text
Display XL
Display L
Heading 1
Heading 2
Heading 3
Body L
Body M
Body S
Caption
Label
Price
```

Use `next/font` for locally hosted or supported fonts.

Avoid layout shift.

## 17.5 Color

Define tokens semantically:

```css
--background
--foreground
--surface
--surface-elevated
--muted
--muted-foreground
--border
--accent
--accent-foreground
--success
--warning
--destructive
```

Do not encode brand colors directly throughout JSX.

## 17.6 shadcn/ui strategy

Use shadcn as a primitive source, not as the visible brand.

Likely components:

- Button
- Dialog
- Sheet
- Drawer
- Popover
- Tooltip
- Accordion
- Select
- Radio Group
- Checkbox
- Input
- Textarea
- Form
- Tabs
- Command
- Skeleton
- Alert Dialog
- Breadcrumb
- Pagination
- Sonner
- Carousel only if needed

Every imported component should be visually adapted to the brand system.

## 17.7 Base UI vs Radix

Current shadcn defaults to Base UI.

Use Base UI for new components unless:

- a specific Radix primitive has required behavior
- existing implementation constraints justify it
- accessibility regression appears

Do not mix primitive ecosystems unnecessarily.

---

# 18. Icons

Use **Font Awesome** consistently.

Packages:

```text
@fortawesome/fontawesome-svg-core
@fortawesome/react-fontawesome
@fortawesome/free-solid-svg-icons
@fortawesome/free-regular-svg-icons
@fortawesome/free-brands-svg-icons
```

Import individual icons to preserve tree-shaking.

Do not import full packs.

Examples:

```ts
import { faBagShopping } from "@fortawesome/free-solid-svg-icons"
import { faUser } from "@fortawesome/free-regular-svg-icons"
```

If shadcn-generated components include another icon library, replace the icons with Font Awesome during component integration.

Use icon-only controls only with accessible names.

---

# 19. Motion System

## 19.1 Principle

Motion should communicate hierarchy and physicality.

It should not become decoration.

## 19.2 Motion hierarchy

### Level 1 — CSS

Use for:

- hover
- focus
- button feedback
- simple reveal
- opacity
- scale
- menu transitions

### Level 2 — React / View Transition

Use for:

- product transitions
- route continuity
- filter updates
- image transitions
- quiz steps

### Level 3 — GSAP

Use selectively for:

- homepage editorial choreography
- pinned storytelling
- sophisticated scrubbed sequences
- hero-to-content transitions

Do not use GSAP globally by default.

## 19.3 Reduced motion

For:

```css
@media (prefers-reduced-motion: reduce)
```

remove:

- parallax
- scrub effects
- large transforms
- animated page choreography

Retain immediate state communication.

---

# 20. Server vs Client Component Strategy

Default:

> **Server Component unless interaction requires the client.**

## Server Components

Use for:

- layouts
- navigation shell
- homepage content
- collection initial render
- product initial render
- journal
- SEO
- café page
- account page server shell
- static/semistatic content

## Client Components

Use only for interactive islands:

- cart drawer
- quantity controls
- product configurator
- subscription selector
- quiz
- predictive search
- mobile navigation
- carousel
- complex motion
- account mutations
- filter controls
- analytics hooks where needed

## Benefits

- lower JavaScript
- faster hydration
- better Core Web Vitals
- simpler data ownership
- stronger caching

---

# 21. Data Fetching

## 21.1 Shopify client

Create one strongly typed Storefront client abstraction.

```text
src/lib/shopify/
  client.ts
  storefront.ts
  customer.ts
  types.ts
  errors.ts
  queries/
  mutations/
  fragments/
  mappers/
```

Do not scatter raw `fetch()` calls through components.

## 21.2 GraphQL fragments

Recommended fragments:

```text
MoneyFragment
ImageFragment
ProductCardFragment
ProductVariantFragment
SellingPlanFragment
SellingPlanAllocationFragment
ProductDetailFragment
CartLineFragment
CartFragment
SearchResultFragment
OrderFragment
SubscriptionContractFragment
```

## 21.3 Generated types

Use GraphQL code generation where the workflow remains reliable with Shopify schemas.

Benefits:

- fragment safety
- mutation safety
- less manual casting
- schema changes caught earlier

Never represent GraphQL API responses as `any`.

---

# 22. Caching Strategy

Catalog data and editorial content can be aggressively cached.

Cart/account data cannot.

## Suggested caching matrix

| Data | Strategy |
|---|---|
| Homepage content | long cache |
| Product catalog | cached + tag revalidation |
| Product detail | cached + tag revalidation |
| Collections | cached + tag revalidation |
| Search | dynamic / short-lived |
| Predictive search | short-lived |
| Cart | no shared cache |
| Customer | private, no shared cache |
| Orders | private |
| Subscription contracts | private |
| Journal | static/cache |
| Café content | static/cache |

Use Next.js cache tags.

Example concepts:

```text
shopify:product:{handle}
shopify:product:{id}
shopify:collection:{handle}
shopify:products
content:home
content:journal
```

Shopify webhook events may trigger revalidation.

---

# 23. Shopify Webhooks

Use secure webhook route handlers.

Potential events:

- products/create
- products/update
- products/delete
- inventory changes where relevant
- collections update
- app/uninstalled if custom app infrastructure applies

Webhook handler responsibilities:

1. verify HMAC/signature
2. parse minimal payload
3. revalidate appropriate tags
4. log failures
5. respond quickly
6. avoid expensive synchronous work

---

# 24. Forms

Use:

- React Hook Form
- Zod
- shadcn form primitives

Applicable forms:

- newsletter
- contact/support
- account profile
- addresses
- quiz
- café inquiry/event form if added

Form principles:

- validation on server too
- inline errors
- summary where appropriate
- no placeholder-only labels
- preserve user input after validation error
- loading state
- success state
- duplicate-submit protection

---

# 25. TanStack Usage

TanStack should be used where it adds actual value rather than as a blanket requirement.

## TanStack Table

Recommended for:

- account order history
- potentially subscription history
- internal/debug tooling if created

Do not use tables for normal product cards.

## TanStack Query

Use for client-side interactive data that benefits from:

- mutation state
- cache invalidation
- optimistic updates
- background refetch

Likely candidates:

- customer account mutations
- subscription mutations
- complex account panels

Do **not** replace Next.js server fetching with TanStack Query for ordinary catalog pages.

## Charts

No customer-facing analytics chart is currently required.

Avoid adding charts simply because a chart library exists.

If a future account feature such as "coffee usage over time" is introduced, select a chart solution then.

---

# 26. Proposed Source Structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── cafe/
│   │   └── journal/
│   │
│   ├── (commerce)/
│   │   ├── shop/
│   │   ├── products/
│   │   │   └── [handle]/
│   │   ├── search/
│   │   ├── subscriptions/
│   │   └── quiz/
│   │
│   ├── account/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/
│   │   ├── subscriptions/
│   │   ├── addresses/
│   │   └── profile/
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   └── analytics/
│   │
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── commerce/
│   ├── product/
│   ├── subscription/
│   ├── quiz/
│   ├── search/
│   ├── account/
│   ├── cafe/
│   ├── editorial/
│   ├── motion/
│   └── analytics/
│
├── content/
│   ├── home.ts
│   ├── brand.ts
│   ├── cafe.ts
│   ├── subscription.ts
│   ├── faq.ts
│   └── journal/
│
├── lib/
│   ├── shopify/
│   ├── analytics/
│   ├── quiz/
│   ├── validation/
│   ├── seo/
│   ├── formatting/
│   ├── motion/
│   └── env/
│
├── hooks/
├── types/
├── styles/
└── test/
```

---

# 27. Component Architecture

## Commerce

```text
ProductCard
ProductGrid
ProductPrice
Money
ProductMedia
VariantSelector
QuantitySelector
PurchaseModeSelector
SellingPlanSelector
SubscriptionPrice
SubscriptionBenefits
AddToCartButton
CartDrawer
CartLine
CartSummary
CheckoutButton
```

## Quiz

```text
QuizShell
QuizProgress
QuizQuestion
ChoiceCard
ChoiceGrid
ScaleInput
ConsumptionStepper
QuizNavigation
QuizResult
RecommendationCard
PlanRecommendation
```

## Editorial

```text
Hero
EditorialSplit
StatementSection
FullBleedMedia
Marquee
Quote
SectionHeading
StoryCard
JournalCard
```

## Café

```text
CafeHero
CafeHours
CafeLocation
CafeMenu
CafeGallery
DirectionsLink
```

## Account

```text
AccountSidebar
AccountMobileNav
AccountOverview
OrderTable
OrderCard
SubscriptionCard
SubscriptionManager
AddressCard
ProfileForm
```

---

# 28. Component API Example

## ProductCard

```ts
type ProductCardProps = {
  product: ProductCardModel
  priority?: boolean
  variant?: "editorial" | "grid" | "compact"
  showSubscription?: boolean
}
```

## ProductPrice

```ts
type ProductPriceProps = {
  oneTime?: Money
  subscription?: Money
  compareAt?: Money
  displayMode?: "one-time" | "subscription" | "both"
}
```

## SellingPlanSelector

```ts
type SellingPlanSelectorProps = {
  allocations: SellingPlanAllocationModel[]
  value?: string
  onChange: (sellingPlanId: string) => void
}
```

Components should consume normalized view models, not raw GraphQL objects.

---

# 29. Shopify View Models

Create mapping functions:

```text
mapShopifyProductToProductCard()
mapShopifyProductToProductDetail()
mapSellingPlans()
mapCart()
mapOrder()
mapSubscriptionContract()
```

This isolates UI code from API schema churn.

Example:

```ts
type Money = {
  amount: string
  currencyCode: "USD"
}

type SubscriptionOption = {
  sellingPlanId: string
  label: string
  description?: string
  frequencyLabel: string
  price: Money
  compareAtPrice?: Money
  perDeliveryPrice: Money
  savingsPercentage?: number
}
```

---

# 30. Environment Variables

Example:

```text
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION=2026-07

SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_WEBHOOK_SECRET=

SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_URL=

NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

SENTRY_AUTH_TOKEN=
SENTRY_DSN=

NEXT_PUBLIC_META_PIXEL_ID=
```

Rules:

- secrets must not use `NEXT_PUBLIC_`
- validate environment variables at boot with Zod
- fail fast on missing production configuration
- use Vercel project environments
- never commit production secrets

---

# 31. Analytics Architecture

## 31.1 Event taxonomy

### Navigation

```text
navigation_clicked
search_opened
account_opened
cart_opened
```

### Product

```text
product_viewed
product_variant_changed
product_gallery_interacted
product_recommendation_clicked
```

### Subscription

```text
subscription_cta_clicked
purchase_mode_selected
selling_plan_selected
subscription_benefits_viewed
subscription_added_to_cart
```

### Quiz

```text
quiz_started
quiz_step_viewed
quiz_answered
quiz_back_clicked
quiz_completed
quiz_result_viewed
quiz_recommendation_changed
quiz_subscription_started
```

### Cart

```text
cart_item_added
cart_item_removed
cart_quantity_changed
checkout_started
```

### Café

```text
cafe_directions_clicked
cafe_menu_viewed
```

## 31.2 Core funnel

Primary funnel:

```text
Homepage visit
   ↓
Subscription CTA
   ↓
Quiz start
   ↓
Quiz complete
   ↓
Recommendation
   ↓
Subscription configured
   ↓
Added to cart
   ↓
Checkout started
   ↓
Purchase
```

Secondary funnel:

```text
PDP
   ↓
Subscribe selected
   ↓
Plan selected
   ↓
Add to cart
   ↓
Checkout
```

## 31.3 KPIs

Track:

- subscription CTA click-through rate
- quiz start rate
- quiz completion rate
- recommendation acceptance rate
- subscription add-to-cart rate
- subscription checkout rate
- one-time vs subscription mix
- subscription AOV
- checkout conversion
- search conversion
- returning subscriber account usage
- subscription cancellation actions
- Core Web Vitals by page type

---

# 32. A/B Testing

Start with clear hypotheses.

## Potential experiments

### Hero CTA

A:

```text
Find My Coffee
```

B:

```text
Build My Subscription
```

### Hero benefit line

A: taste-led

B: convenience-led

### PDP purchase mode

A: subscription selected by default

B: last user preference / one-time default

Carefully review compliance and UX expectations before defaulting recurring purchases.

### Quiz location

A: hero CTA to quiz

B: hero CTA to subscription landing page

### Subscription savings

A: percentage

```text
Save 15%
```

B: concrete per-delivery comparison

```text
$4.20 less per delivery
```

Avoid simultaneous multi-variable testing in early traffic unless volume supports it.

---

# 33. Consent & Privacy

US-only launch simplifies localization but not privacy obligations.

Implement:

- cookie/analytics consent where legally applicable
- opt-out signals where required
- privacy policy
- analytics categorization
- Meta/advertising controls
- Global Privacy Control consideration
- least-data collection

Do not place sensitive customer data into analytics events.

Never send:

- full address
- payment data
- auth tokens
- protected customer identifiers unnecessarily

---

# 34. SEO

## Technical SEO

Implement:

- canonical URLs
- metadata
- Open Graph
- Twitter cards
- robots
- sitemap
- JSON-LD
- breadcrumb schema
- product structured data
- article structured data
- local business structured data for café

## Product SEO

Use Shopify content as source for:

- title
- description
- availability
- price

Add custom SEO fields if needed.

## Café SEO

Include LocalBusiness/CafeOrCoffeeShop schema with:

- address
- coordinates
- opening hours
- telephone
- URL

## Journal SEO

Build internal linking between:

```text
article → coffee
coffee → brew guide
brew guide → subscription quiz
```

---

# 35. Accessibility

Target **WCAG 2.2 AA**.

## Requirements

- semantic landmarks
- logical heading hierarchy
- visible focus
- keyboard navigation
- accessible dialogs/sheets
- screen-reader labels
- alt text strategy
- minimum contrast
- motion reduction
- touch target sizing
- no color-only state communication
- accessible errors
- skip-to-content
- focus restoration
- focus trapping where appropriate
- meaningful link text

## Quiz accessibility

- each step gets a heading
- progress announced appropriately
- focus moves predictably after navigation
- choice cards remain semantic radio/checkbox inputs
- keyboard operation
- errors announced
- no animation required to understand state

---

# 36. Performance Budgets

Performance is a conversion feature.

## Initial budgets

Target mobile p75:

```text
LCP < 2.5 s
INP < 200 ms
CLS < 0.1
```

Prefer stronger internal targets where practical.

## JavaScript

Minimize client bundle.

Do not hydrate:

- static editorial content
- static product information
- layout copy

Lazy-load:

- complex motion
- below-fold galleries
- maps
- third-party widgets
- analytics where appropriate

## Images

Use:

- `next/image`
- Shopify CDN transforms
- `sizes`
- responsive source sizes
- priority only for actual LCP image
- AVIF/WebP where pipeline supports
- meaningful placeholders

Do not ship desktop-sized imagery to mobile.

## Video

Hero video rules:

- muted
- inline
- short
- compressed
- poster image
- no blocking autoplay dependency
- disable/reduce when appropriate
- provide static fallback

---

# 37. Error Handling

## Product errors

Examples:

```text
Product unavailable
Variant sold out
Selling plan unavailable
Price changed
```

Do not silently fail.

## Cart errors

If inventory changes:

```text
That quantity is no longer available.
We've updated your cart.
```

If subscription plan disappears:

```text
That delivery plan is no longer available.
Choose another frequency to continue.
```

## Shopify outage

Provide graceful states:

```text
We're having trouble loading the shop right now.
Please try again.
```

Brand/editorial pages can remain available from cache where possible.

---

# 38. Loading States

Use skeletons selectively.

Do not skeleton static content already available to the server.

Examples:

- predictive search results
- cart mutation
- account data
- subscription mutation
- search filters

Buttons should show explicit pending state.

---

# 39. Security

## Principles

- no Admin API token exposed client-side
- no Customer Account token leaked client-side beyond required supported flows
- sanitize user-generated content
- validate all inputs
- server-side authorization for account actions
- HMAC verify Shopify webhooks
- strict CSP
- secure headers
- rate limit abuse-prone endpoints
- CSRF protections where applicable
- dependency scanning
- secret scanning
- protected preview deployments

## Headers

Consider:

```text
Content-Security-Policy
Strict-Transport-Security
Referrer-Policy
Permissions-Policy
X-Content-Type-Options
```

Frame policies must account for Shopify/customer flows actually used.

---

# 40. Testing Strategy

## Unit tests

Test:

- money formatting
- selling-plan normalization
- savings calculations
- quiz scoring
- consumption estimate
- URL filter serialization
- cart mappers
- validation schemas

## Component tests

Test:

- variant selector
- selling plan selector
- quiz question
- product card
- cart line
- account forms

## Integration

Mock Shopify GraphQL responses.

Test:

```text
product → variant → plan → cart
quiz → recommendation → cart
```

## E2E — Playwright

Critical flows:

### Flow A

```text
Home
→ Find My Coffee
→ Complete quiz
→ Accept recommendation
→ Add subscription to cart
→ Checkout redirect
```

### Flow B

```text
Shop
→ Product
→ Buy once
→ Cart
→ Checkout
```

### Flow C

```text
Search
→ Product
→ Subscribe
→ Cart
```

### Flow D

```text
Login
→ Orders
→ Subscription
→ Update supported subscription property
```

### Flow E

Mobile navigation and cart.

## Visual regression

Critical pages:

- homepage
- shop
- PDP
- quiz
- quiz result
- cart
- account
- café

Test representative breakpoints.

---

# 41. Browser Support

At minimum, align with the supported browsers of the selected Next.js version and business requirements.

Test:

- current Chrome
- current Safari
- current Firefox
- current Edge
- iOS Safari
- Android Chrome

Pay special attention to:

- sticky positioning
- View Transitions
- scroll choreography
- dialogs
- mobile viewport units
- autofill
- form controls

---

# 42. Responsive Strategy

Do not treat mobile as compressed desktop.

## Mobile priorities

1. subscription CTA
2. product clarity
3. fast cart
4. easy quiz
5. accessible account management
6. café information

## Desktop priorities

1. editorial immersion
2. visual storytelling
3. progressive product discovery
4. cinematic motion
5. efficient scanning

---

# 43. Migration From Existing Shopify Theme

This is a storefront replacement, not a commerce replatform.

## Phase 1 — Inventory

Document:

- current theme URLs
- top landing pages
- current navigation
- collections
- products
- subscriptions
- metafields
- redirects
- SEO metadata
- analytics tags
- customer account setup
- policies
- apps
- scripts
- existing subscription configuration

## Phase 2 — URL mapping

Preserve URLs where reasonable.

Create redirect sheet:

```text
Old URL
New URL
Status
Reason
```

## Phase 3 — Shopify cleanup

Before frontend implementation:

- normalize product handles
- normalize metafields
- identify inactive products
- validate selling plans
- validate product imagery
- validate subscription eligibility

## Phase 4 — Parallel build

Existing theme remains production storefront while headless app is built.

Use preview/staging domain.

## Phase 5 — Data parity testing

For representative products, verify:

```text
title
price
variant
inventory
selling plans
subscription pricing
images
cart total
checkout total
```

## Phase 6 — SEO migration

- sitemap parity
- canonicals
- redirects
- metadata
- structured data
- Search Console
- analytics

## Phase 7 — cutover

Switch storefront domain only after:

- E2E pass
- performance pass
- checkout validation
- analytics validation
- subscription purchase validation
- account validation
- rollback procedure defined

---

# 44. Deployment

## Vercel environments

```text
Development
Preview
Production
```

## Branch workflow

```text
main          → production
pull request  → preview
local         → development Shopify store/token
```

## Vercel features

Use:

- preview deployments
- environment variables
- Web Analytics if desired
- Speed Insights if desired
- CDN / edge delivery
- logs
- observability integrations

Avoid platform-specific complexity unless it materially improves the app.

---

# 45. CI/CD

On pull request:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Optional/selected PRs:

```text
pnpm test:e2e
```

Before production:

- critical E2E
- visual regression
- Lighthouse/Pagespeed threshold check

Protect `main`.

Require review for:

- Shopify query changes
- auth changes
- analytics changes
- subscription mutations
- checkout/cart changes

---

# 46. Observability

Track:

- frontend exceptions
- server exceptions
- Shopify GraphQL errors
- checkout redirect failures
- subscription mutation failures
- customer auth failures
- Core Web Vitals
- webhook failures

Add correlation/request IDs where practical.

Do not log secrets or protected customer data.

---

# 47. Logging

Structured log example:

```json
{
  "event": "shopify_request_failed",
  "operation": "ProductDetail",
  "status": 500,
  "requestId": "...",
  "route": "/products/example"
}
```

Do not log full GraphQL payloads if they contain customer data.

---

# 48. Empty States

Design these intentionally.

## Search

```text
Nothing matched "..."
Try a flavor, origin, or brew method.
```

## Orders

```text
No orders yet.
Your first great coffee is a few clicks away.
```

## Subscriptions

```text
No active subscription.

Take the quiz and we'll match you with one.
[Find My Coffee]
```

## Cart

```text
Your cart is empty.

Not sure where to start?
[Find My Coffee]
```

Empty states should guide conversion without being aggressive.

---

# 49. Email / CRM Integration

Not required for initial architecture, but reserve event hooks for:

- quiz completion
- quiz recommendation
- abandoned checkout
- first purchase
- subscriber onboarding
- renewal education
- churn win-back

Do not block launch on a complex CRM layer.

Shopify should continue to own core order transactional email unless intentionally replaced by supported tooling.

---

# 50. Newsletter

Keep lightweight.

Homepage/footer:

```text
Coffee notes, new releases, no noise.
```

React Hook Form + Zod.

Track:

```text
newsletter_subscribed
```

Use a proper email provider/CRM endpoint rather than storing addresses in frontend infrastructure.

---

# 51. Recommended Commerce Data Queries

## Homepage

Fetch:

```text
featured collection
selected product fields
selling-plan preview fields
```

Avoid fetching complete PDP payloads.

## Product Card

Fetch only:

```text
id
handle
title
featuredImage
priceRange
selected coffee metafields
subscription availability
```

## Product Detail

Fetch:

```text
product
media
options
variants
selling plan groups
selling plan allocations
metafields
SEO
recommendations
```

## Cart

Fetch:

```text
cart id
lines
merchandise
selling plan allocation
cost
discounts
checkoutUrl
```

---

# 52. GraphQL Operation Conventions

Every operation gets a name:

```graphql
query ProductByHandle
mutation CartCreate
mutation CartLinesAdd
mutation CartLinesUpdate
mutation CartLinesRemove
```

Keep queries close to Shopify data layer, not page components.

Do not concatenate GraphQL strings dynamically.

---

# 53. Cart Actions

Prefer server-side action boundaries for cart mutations.

Conceptual API:

```ts
createCart()
getCart()
addCartLines()
updateCartLines()
removeCartLines()
applyDiscountCode()
```

UI should not need to know Shopify request details.

---

# 54. Pricing Formatting

Use `Intl.NumberFormat`.

US launch:

```text
locale: en-US
currency: USD
```

Still preserve currency from Shopify response.

Do not:

```ts
`$${price}`
```

---

# 55. Local Time / Café Hours

Store café schedule as structured content.

Example:

```ts
type CafeHours = {
  monday: TimeRange[]
  tuesday: TimeRange[]
  ...
}
```

Account for timezone explicitly.

Do not compute "Open now" using server timezone accidentally.

---

# 56. Product Recommendations

Three recommendation sources:

## A. Quiz recommendation

Primary personalized mechanism.

## B. Shopify related products

Use Shopify recommendations for:

```text
You may also like
```

## C. Editorial merchandising

Explicit curated groups:

```text
Staff Favorites
For Espresso
Bright & Fruity
Subscriber Favorites
```

Keep these layers separate in code.

---

# 57. Homepage Data Contract

A typed content object can define homepage sequence.

Example:

```ts
export const homePage = {
  hero: {...},
  discovery: {...},
  subscriptionManifesto: {...},
  quiz: {...},
  cafe: {...},
  journal: {...},
}
```

Product IDs/handles referenced in content should resolve through Shopify.

Do not duplicate product price/image/title into local content.

---

# 58. Design Tokens

Suggested Tailwind CSS token model:

```css
@theme {
  --font-display: ...;
  --font-sans: ...;

  --color-background: ...;
  --color-foreground: ...;
  --color-surface: ...;
  --color-muted: ...;
  --color-accent: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;

  --ease-brand: cubic-bezier(...);
}
```

Create component tokens only when the semantic design system requires them.

---

# 59. CSS Rules

Avoid:

- arbitrary `z-index` escalation
- inline styles for ordinary layout
- hardcoded one-off colors
- excessive arbitrary Tailwind values
- deeply nested selectors
- broad global component styling

Allow:

- CSS variables
- Tailwind utilities
- component-level CSS for complex motion
- `data-*` state styling

---

# 60. State Management

Do not add Redux by default.

State categories:

## URL state

Use URL params for:

- catalog filters
- sort
- search query

## Server state

Shopify data.

Use:

- Server Components
- Next caching
- TanStack Query only for suitable client state

## Local UI state

React:

- open/closed
- selection before mutation
- carousel state
- quiz step

## Persistent state

- Shopify cart ID
- quiz state if restoration desired
- non-sensitive user preferences

Use cookies/local storage intentionally, not indiscriminately.

---

# 61. Quiz State Schema

Example:

```ts
const QuizAnswersSchema = z.object({
  brewMethods: z.array(z.string()).min(1),
  flavors: z.array(z.string()).min(1),
  adventure: z.number().min(0).max(100),
  roast: z.enum(["light", "medium", "dark", "unknown"]),
  cupsPerDay: z.number().min(1).max(20),
  drinkers: z.number().min(1).max(10),
  caffeine: z.enum(["regular", "decaf", "mixed"]),
})
```

Result model:

```ts
type QuizResult = {
  primaryProductId: string
  alternateProductIds: string[]
  recommendedVariantId: string
  recommendedSellingPlanId: string
  recommendedQuantity: number
  explanation: string[]
}
```

---

# 62. Quiz Recommendation Availability

Before showing final recommendation:

1. score products;
2. remove unavailable products;
3. confirm requested variant availability;
4. confirm selling-plan allocation;
5. choose best valid plan;
6. calculate presentation data from Shopify;
7. generate result.

If top match is unavailable, transparently use the next eligible match.

---

# 63. Account Auth Boundary

Account pages must not be statically cached with customer data.

Use:

```text
private request
authenticated Customer Account API
no shared cache
```

Logout must clear local application auth state appropriately.

---

# 64. Customer Account Mobile UX

Avoid desktop-dashboard conventions on mobile.

Use:

```text
Account
Orders
Subscriptions
Addresses
Profile
Sign out
```

as cards or a compact navigation sheet.

Subscription management should prioritize the next delivery.

---

# 65. Subscription Retention UX

Account page can improve retention ethically.

Show:

```text
Next delivery
Product
Quantity
Frequency
Address
```

Primary management actions:

```text
Change frequency
Change quantity
Skip
```

Cancellation remains easy to find.

Do not use dark patterns to conceal cancellation.

---

# 66. Café Menu

If the café menu changes infrequently, keep it in repository content.

If frequent staff editing becomes necessary later:

- use Shopify metaobjects
- or introduce CMS

Do not overengineer v1.

---

# 67. Placeholder Asset Strategy

Existing photography will be added later.

During implementation use explicit aspect-ratio placeholders.

Examples:

```text
[HERO 16:9 / desktop]
[HERO 4:5 / mobile]

[PRODUCT PACKSHOT 1:1]
[ORIGIN STORY 3:2]
[CAFÉ LANDSCAPE 16:10]
[JOURNAL COVER 4:3]
```

Each placeholder should specify:

- intended crop
- minimum resolution
- focal point expectation
- video/image
- desktop/mobile variant requirement

This prevents the implementation from becoming dependent on temporary stock imagery.

---

# 68. Visual QA

Every major page must be reviewed at:

```text
375
390
430
768
1024
1280
1440
1728
```

Check:

- line breaks
- image crops
- menu
- sticky content
- horizontal overflow
- typography scale
- touch targets
- motion
- reduced motion

---

# 69. Frontend Design Skill Usage

The implementation should explicitly use the **frontend design skill** during major UI construction.

## Use it for

- translating the design direction into production layout
- generating initial visual compositions
- avoiding generic SaaS/ecommerce patterns
- typography hierarchy
- asymmetric sections
- product storytelling modules
- responsive behavior
- visual refinement
- interaction polish

## Workflow

For each key page:

```text
1. Establish UX goal
2. Establish data contract
3. Use frontend design skill for composition
4. Implement production component
5. Connect Shopify data
6. Test responsive behavior
7. Run visual review
8. Refine motion
9. Run accessibility review
10. Measure performance
```

## Pages requiring design-skill review

- homepage
- PDP
- subscription landing page
- quiz
- quiz result
- shop
- cart
- café
- account overview

Avoid using the skill merely to produce decorative mocks. It should inform the actual production implementation.

---

# 70. Codex Web-App Building Workflow

The project can use **Codex's web-app building capability** as an implementation accelerator.

This should operate within clear architectural constraints.

## Codex should be given

- this implementation plan
- project conventions
- Shopify data contracts
- design token definitions
- component architecture
- testing expectations
- screenshots/references where permitted
- acceptance criteria

## Good Codex tasks

```text
Build the responsive ProductCard using the existing design tokens.
Do not hardcode Shopify data.
Use the ProductCardModel interface.
Use Font Awesome icons.
Add tests.
```

```text
Implement the subscription selling-plan selector.
Use the normalized SubscriptionOption model.
Preserve keyboard accessibility.
Add Playwright coverage for plan switching.
```

```text
Build the quiz step shell from the design spec.
Use React Hook Form and Zod.
Respect reduced motion.
Do not add dependencies.
```

## Avoid prompts like

```text
Build the entire ecommerce site.
```

Large unbounded generation increases:

- design inconsistency
- architecture drift
- duplicated abstractions
- accessibility regressions
- unnecessary dependencies

## Recommended agent loop

```text
Plan
→ Implement one bounded feature
→ Run typecheck
→ Run tests
→ Inspect browser
→ Compare against design
→ Fix
→ Commit
```

Next.js agent tooling/DevTools should be used where useful for runtime inspection.

---

# 71. AI Implementation Guardrails

AI-generated code must follow the same bar as manually written code.

Required review:

- no invented Shopify fields
- no hardcoded prices
- no leaked secrets
- no unnecessary client components
- no `any`
- no unexplained dependencies
- no duplicated design primitives
- no inaccessible custom controls
- no generated fake testimonials
- no fabricated product content

---

# 72. AGENTS.md

Create repository-level `AGENTS.md`.

Recommended content:

```text
Project purpose
Architecture
Data ownership rules
Shopify boundaries
Code style
Component rules
Server/client rules
Design rules
Icon policy
Form policy
Testing requirements
Commands
Forbidden patterns
```

Example non-negotiables:

```text
- Shopify is authoritative for prices.
- Never hardcode a selling-plan discount.
- Use Server Components by default.
- Use Font Awesome, not Lucide.
- Use shadcn primitives but visually adapt them.
- Use React Hook Form + Zod for non-trivial forms.
- Do not introduce Redux.
- Use TanStack Table for account tabular data.
- Run typecheck and tests before completion.
```

---

# 73. Definition of Done — Component

A component is done when:

- typed
- responsive
- keyboard accessible
- design tokens used
- states implemented
- loading state considered
- error state considered
- reduced motion considered
- tests added where logic exists
- no hardcoded commerce truth
- no console errors
- no unnecessary dependency

---

# 74. Definition of Done — Page

A page is done when:

- desktop composition approved
- mobile composition approved
- actual Shopify data connected
- loading/error/empty states implemented
- metadata implemented
- analytics implemented
- accessibility reviewed
- performance reviewed
- visual regression baseline created
- key E2E path passes

---

# 75. Implementation Phases

## Phase 0 — Discovery & audit

Deliverables:

- current Shopify theme audit
- URL inventory
- product/metafield audit
- selling-plan audit
- app/script audit
- analytics audit
- customer-account audit
- SEO baseline
- performance baseline

## Phase 1 — Foundation

Build:

- Next.js project
- TypeScript strict config
- Tailwind
- shadcn
- Font Awesome
- design tokens
- fonts
- lint/typecheck/test
- Vercel environments
- Shopify clients
- typed GraphQL structure
- error monitoring

Exit criteria:

- product query succeeds
- preview deployment works
- design primitives render
- environment validation works

## Phase 2 — Commerce primitives

Build:

- Money
- ProductCard
- ProductPrice
- ProductMedia
- VariantSelector
- SellingPlanSelector
- QuantitySelector
- cart
- checkout redirect

Exit criteria:

- one-time product can checkout
- subscription product can checkout
- Shopify cart totals match checkout

## Phase 3 — Core shop

Build:

- shop page
- collection
- filtering
- PDP
- recommendations
- predictive search
- full search

Exit criteria:

- complete catalog journey works

## Phase 4 — Homepage

Build:

- cinematic hero
- discovery interaction
- featured products
- subscription manifesto
- quiz CTA
- origin story
- café
- journal
- final CTA

Exit criteria:

- subscription path visually dominant
- Core Web Vitals within budget

## Phase 5 — Quiz

Build:

- schema
- quiz UI
- scoring engine
- quantity estimator
- selling-plan matcher
- result page
- analytics

Exit criteria:

- recommendation only returns purchasable Shopify configuration
- full quiz → subscription checkout E2E passes

## Phase 6 — Customer account

Build:

- authentication
- overview
- orders
- order detail
- subscriptions
- subscription detail
- address management
- profile
- supported subscription mutations

Exit criteria:

- customer can securely access only own data
- all supported mutations tested

## Phase 7 — Café + editorial

Build:

- café
- menu
- hours
- journal
- article pages
- about/story
- subscription FAQ

## Phase 8 — Analytics / SEO / experimentation

Build:

- event schema
- GA4
- PostHog
- Shopify analytics validation
- Meta Pixel if required
- consent
- structured data
- sitemap
- redirects
- experiment framework

## Phase 9 — Optimization

- performance
- accessibility
- device QA
- visual regression
- image art direction
- motion refinement
- conversion copy refinement

## Phase 10 — Migration

- final URL redirects
- final product parity
- purchase tests
- subscription tests
- account tests
- analytics tests
- domain cutover
- rollback readiness

---

# 76. Suggested Milestone Acceptance Criteria

## Milestone 1 — Architecture ready

- production-grade repository
- Shopify communication
- design system
- preview deployments

## Milestone 2 — Commerce ready

- browse
- PDP
- subscription
- cart
- checkout

## Milestone 3 — Conversion experience ready

- homepage
- quiz
- subscription funnel
- analytics

## Milestone 4 — Retention ready

- account
- orders
- subscription management

## Milestone 5 — launch ready

- migration
- performance
- SEO
- QA
- monitoring

---

# 77. Primary Conversion Funnel Acceptance Criteria

A new visitor must be able to:

```text
Open homepage
→ understand the subscription value proposition
→ start quiz
→ complete quiz without giving an email
→ see a clear recommended coffee
→ understand why it was recommended
→ see recommended quantity/frequency
→ see Shopify-derived subscription price
→ adjust configuration
→ add it to Shopify cart
→ see subscription information in cart
→ proceed using Shopify checkoutUrl
```

This is the most important E2E test in the system.

---

# 78. Secondary Conversion Funnel Acceptance Criteria

A visitor must also be able to:

```text
Shop
→ select coffee
→ choose one-time purchase
→ choose variant
→ add to cart
→ checkout
```

The subscription-first strategy must never break ordinary commerce.

---

# 79. Suggested Initial Backlog

## P0

- repository
- design tokens
- Shopify Storefront client
- GraphQL fragments
- product model
- subscription model
- cart
- checkout
- homepage
- PDP
- shop
- quiz
- account auth
- subscription account management
- search
- analytics
- SEO
- migration redirects

## P1

- journal
- product recommendations
- café page
- advanced motion
- richer account dashboard
- experiment tooling
- content refinement

## P2

- loyalty
- referrals
- gifting
- subscription gifts
- advanced personalization
- AI-assisted recommendations
- reviews platform
- café ordering
- advanced CRM personalization

---

# 80. Explicit Non-Goals for V1

Unless scope changes, do not build:

- custom payment checkout
- custom payment vault
- custom subscription billing engine
- custom inventory system
- custom customer password database
- custom CMS
- native mobile app
- complex loyalty platform
- AI-based quiz model
- custom search engine
- dashboard charts without a defined customer need
- excessive WebGL experience

This protects launch quality.

---

# 81. Future-Proofing

The architecture should allow future addition of:

- multiple cafés
- international Shopify Markets
- multi-currency
- loyalty
- gift subscriptions
- corporate subscriptions
- wholesale portal
- richer editorial CMS
- personalized landing pages
- member-only drops

But no v1 code should become complicated solely to anticipate them.

---

# 82. Key Architectural Decisions Summary

| Decision | Choice |
|---|---|
| Storefront | Headless |
| Framework | Next.js |
| Commerce backend | Shopify |
| Subscription backend | Shopify |
| Checkout | Shopify Checkout |
| Subscription discovery | Custom quiz |
| Customer account | Custom headless UI + Shopify Customer Account API |
| Product data | Shopify |
| Editorial content | Repository |
| CMS | None initially |
| Search | Shopify Storefront search/predictive search |
| Country | United States |
| Currency | USD |
| Café count | One |
| Hosting | Vercel |
| UI primitives | shadcn/ui |
| Styling | Tailwind CSS |
| Icons | Font Awesome |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Primary conversion | Subscription |
| Motion | Premium / restrained |
| AI build support | Frontend design skill + Codex web-app building |
| Migration model | Replace existing Shopify theme |

---

# 83. Recommended First Build Sequence

The most efficient implementation sequence is:

```text
1. Bootstrap Next.js + design system
2. Connect Shopify
3. Build normalized commerce models
4. Build ProductCard / PDP
5. Build selling-plan selector
6. Build Shopify cart
7. Validate subscription checkout
8. Build homepage shell
9. Build quiz engine
10. Connect quiz → subscription configuration
11. Build search
12. Build customer authentication
13. Build account + subscriptions
14. Build café/editorial pages
15. Complete analytics
16. Complete SEO/migration
17. Performance + accessibility + visual QA
18. Production cutover
```

The critical architectural checkpoint occurs at step 7.

**Do not continue into elaborate visual implementation until a real Shopify subscription can travel correctly from a custom product UI through the custom cart and into Shopify Checkout.**

This validates the hardest commerce boundary before design complexity accumulates.

---

# 84. Recommended Design/Engineering Workflow Per Page

For every major page:

```text
Business objective
      ↓
User intent
      ↓
Conversion action
      ↓
Data requirements
      ↓
Server/client boundary
      ↓
Wire composition
      ↓
Frontend design skill
      ↓
Production implementation
      ↓
Shopify integration
      ↓
Responsive refinement
      ↓
Accessibility
      ↓
Motion
      ↓
Analytics
      ↓
Performance
      ↓
E2E + visual QA
```

This order prevents the common failure mode where a visually impressive headless site has weak commerce mechanics.

---

# 85. Final Product Position

The finished experience should not communicate:

> "This is a Shopify store with a custom theme."

It should communicate:

> "This is a premium coffee brand with a deeply considered digital experience."

Shopify should largely disappear from the customer's perception until checkout and account infrastructure need to surface its capabilities.

The strongest overall direction remains:

```text
Siwa
    ↓
editorial pacing + typography + restraint

Onyx
    ↓
coffee storytelling + product expression

MAME
    ↓
luxury restraint

Ex Animo
    ↓
guided discovery

Verve / Blue Bottle
    ↓
conversion mechanics

Custom Next.js layer
    ↓
personalization + motion + customer experience

Shopify
    ↓
commerce truth + subscriptions + checkout + customer data
```

The defining experience should be the subscription journey:

> **Emotional brand introduction → guided taste discovery → personalized coffee → recommended cadence → Shopify-backed subscription → frictionless recurring relationship.**

---

# 86. Reference Notes / Current Platform Facts

This implementation plan is based on current platform capabilities as of September 2026:

- Next.js 16.3 is the current Active LTS line; 16.3.3 is the August 2026 security-patched release.
- React documentation currently identifies React 19.2 as the latest major/minor line.
- Tailwind CSS 4.3 is the current documented release line.
- shadcn/ui supports Tailwind 4 and React 19; current new projects default to Base UI while Radix remains supported.
- Shopify Storefront API `2026-07` is the current documented latest version.
- Shopify selling plans expose billing/delivery policies and price adjustments.
- Selling-plan allocations expose effective subscription pricing including price, compare-at price and per-delivery price.
- Shopify cart exposes `checkoutUrl` for redirecting to Shopify Checkout.
- Shopify Storefront predictive search supports products, collections, pages, articles and query suggestions.
- Shopify Customer Account API `2026-07` supports authenticated customer experiences.
- Shopify Customer Account API exposes subscription contracts through customer-authorized subscription scopes.

Official documentation:

- https://nextjs.org/blog
- https://nextjs.org/docs
- https://react.dev/versions
- https://tailwindcss.com/blog
- https://ui.shadcn.com/docs
- https://shopify.dev/docs/api/storefront/latest
- https://shopify.dev/docs/api/customer/latest

---

# 87. Next Recommended Artifact

After this plan is accepted, the next useful implementation artifact should be a **Technical Foundation Specification** containing:

1. exact `package.json` dependency set;
2. initialization commands;
3. complete folder tree;
4. environment schema;
5. Shopify Storefront client;
6. Shopify Customer Account client;
7. GraphQL fragments;
8. normalized TypeScript models;
9. cart architecture;
10. selling-plan architecture;
11. quiz schema;
12. analytics event types;
13. initial Tailwind tokens;
14. shadcn setup;
15. Font Awesome setup;
16. `AGENTS.md`;
17. first implementation tickets.

That artifact can then be handed directly to Codex as the practical implementation contract.

---

# 88. Confirmed Brand Facts (Yego Coffee)

Sourced directly from the live site (`yegocoffee.com`) on 2026-09-01. These replace placeholder brand assumptions used earlier in this document.

| Fact | Value |
|---|---|
| Brand | Yego Coffee |
| Ownership | Family-owned — Fatuma and Francois Tuyishime |
| Name meaning | "Yego" is Kinyarwanda for "Yes" — a symbol of positivity and affirmation |
| Heritage | Tuyishime family has been in the coffee business for 40+ years, rooted in Rwandan coffee farming; the brand explicitly connects sourcing to family history and post-1994 community rebuilding |
| HQ / roastery | Somerville, Massachusetts |
| Physical shop | 1212 Broadway, Somerville, MA 02144 |
| Contact | francois@yegocoffee.com |
| Market | United States only — consistent with §33 and §82 |
| Current storefront | Shopify (default/OS 2.0-style theme, non-headless) |

This story — Rwanda-to-Somerville, family affirmation, community rebuilding — is the actual emotional core the "editorial/premium" direction in §1 and §85 should be built around. It is stronger and more specific than generic "slow down for coffee" copy, and should replace placeholder hero/brand copy wherever this plan currently uses generic examples.

## 88.1 Current site structure (as-is, for Phase 0 audit)

```text
/                              home
/collections/all
/collections/roasted-coffee
/collections/merch
/collections/subscriptions
/pages/about-us                founder story (usable source for "Our Story")
/pages/contact                 address + email + form
/products/medium-roast
/products/dark-roast
/products/light-roast
/products/5-lb-bag
/products/[gatare-anaerobic-handle]   "Gatare Anaerobic Process."
/products/bi-monthly-drop
/products/monthly-drop
/products/5-lb-bag-monthly-subscription
/products/dark-roast-monthly-subscription
/products/5-lb-bag-bi-monthly-subscription
/products/medium-roast-bi-monthly-subscription
/products/dark-roast-bi-monthly-subscription
```

Gap identified for Phase 0 (§43 Phase 1 — Inventory): café hours and phone are not published on the live site. §91 stubs both with **placeholder values** so `/cafe` is unblocked for development — real values are still outstanding and must land before cutover. Café **menu remains deliberately out of scope** — ship §16/§91 without it.

---

# 89. Design Reference Benchmark — Final Set

Expands §1 and §85 with the full comparative benchmark, including sites not previously catalogued in this document.

| Site | Siwa-like aesthetic | Conversion | Interactivity | What to steal |
|---|---:|---:|---:|---|
| Onyx Coffee Lab | ★★★★★ | ★★★★★ | ★★★★★ | Overall benchmark — storytelling + subscription UX + Webby-winning commerce architecture |
| Ex Animo Coffee | ★★★★★ | ★★★★★ | ★★★★★ | Full-screen coffee quiz as the primary discovery/conversion mechanism |
| Verve Coffee Roasters | ★★★★½ | ★★★★★ | ★★★★★ | Guided selling, consumption-based personalization ("Consumptionator") |
| MAME Coffee | ★★★★★ | ★★★★ | ★★★★ | Premium editorial restraint — closest visual match to Siwa's negative space |
| Coffee Collective | ★★★★★ | ★★★★½ | ★★★★ | Minimal hierarchy: story → coffee → product → purchase |
| Dayglow Coffee | ★★★★½ | ★★★★½ | ★★★★ | Sensory product taxonomy (e.g. "Vibrant") over technical jargon, notes shown first |
| DAK Coffee Roasters | ★★★★½ | ★★★★ | ★★★½ | Product card composition, photography direction, minimal category friction |
| Blue Bottle Coffee | ★★★★ | ★★★★★ | ★★★★ | Commercial/ecommerce architecture study only — not the aesthetic target |
| Proud Mary Coffee | ★★★½ | ★★★★★ | ★★★★ | Subscription persona naming (identity-based picks vs. spec-based picks) |
| Dark Matter Coffee | ★★★★ | ★★★★ | ★★★★ | Brand-world lesson only — Yego's direction is the opposite (restraint, not maximalism); included for contrast |

## 89.1 Decision

Primary system (drives visual and interaction direction):

```text
Siwa Capital        → editorial composition, pacing, restraint, motion
Onyx Coffee Lab      → coffee storytelling + subscription commerce benchmark
Ex Animo Coffee      → quiz-first guided discovery
Verve Coffee         → personalization / consumption-based recommendation
MAME Coffee          → European restraint, negative space discipline
```

Supporting references (borrow specific mechanics only, not overall identity):

```text
Coffee Collective    → keep the story→coffee→product→purchase hierarchy honest and short
Dayglow Coffee       → sensory-first product naming pattern for Yego's roast lineup
DAK Coffee Roasters  → product card / photography art direction reference
Blue Bottle          → subscription proposition clarity, account/commerce architecture
Proud Mary           → subscription plan naming pattern (used in §90.7)
Dark Matter          → explicitly not followed — noted so it isn't accidentally reintroduced later
```

This supersedes the shorter reference list in §1 and confirms the synthesis already stated in §85.

---

# 90. Final Homepage Script (Decisive Version)

This section is the actual build target for the homepage. §7 and §8 remain the fuller structural spec (data requirements, responsive behavior, component notes); this section finalizes the copy and sequencing using real Yego content so there is no ambiguity left for implementation.

## 01 — Cinematic hero

```text
Coffee worth slowing down for.

From Rwandan farms to Somerville roasting —
a family's coffee, matched to how you drink it.
```

Primary CTA: `Find My Coffee` → quiz (§9)
Secondary CTA: `Shop Coffee` → `/shop`

Visual: roasting/pour footage or portrait imagery of Fatuma and Francois (existing gallery assets on current site) rather than generic stock coffee footage.

## 02 — Interactive discovery

```text
How do you take your coffee?
```

Cards map directly to existing/expandable roast line:

```text
Bright & Complex     → Gatare Anaerobic Process (limited)
Rich & Chocolatey    → Dark Roast
Smooth & Balanced    → Medium Roast
Surprise Me          → quiz entry
```

Selecting a card can prefill the quiz's flavor-preference step (§9.2).

## 03 — Signature coffees

Show the current core lineup, art-directed (not a grid):

```text
Medium Roast     — everyday, balanced
Dark Roast       — bold, roasty
Light Roast      — bright, delicate
Gatare Anaerobic Process — limited, single-origin story coffee
```

Each: large product image, roast descriptor, price (from Shopify), `Subscribe` primary / `Explore` secondary.

## 04 — Brand statement

```text
YEGO MEANS YES.

A word of affirmation.
A family's answer to rebuilding after loss.
Now, a promise in every bag.
```

Four principles:

```text
01  Grown with purpose, in Rwanda
02  Roasted with care, in Somerville
03  Family-owned, four decades in coffee
04  Community before commodity
```

This replaces generic "sourced/roasted/brewed/served" placeholder copy from §8.4 with Yego's actual founding story.

## 05 — Coffee finder

```text
Not sure where to start?

A few questions. About 30 seconds.
We'll match you to a roast — and a rhythm.
```

Do not state a question count until §93.2 is final and §92.2 #2/#4 are answered — the count moves between three and five depending on those answers, and a wrong number on the homepage is an immediately visible broken promise.

CTA: `Start the quiz →`

## 06 — Café experience

```text
Come have one with us.
```

```text
1212 Broadway, Somerville, MA 02144
+1 816 352 9842               [placeholder — §91]
Open daily, 8:00 AM – 6:00 PM  [placeholder — §91]
```

CTA: `Get Directions` only — omit "View Café Menu" until menu content exists (§91).

## 07 — Subscription

```text
Never run out of good coffee.
```

Mechanics, visualized:

```text
1. Choose your roast
2. Tell us how often you brew
3. We roast, pack, and send it
```

Plan naming borrows Proud Mary's identity-based pattern (§89.1) mapped to Yego's real subscription products:

```text
Monthly Drop        — one bag, once a month        $17/mo (from Shopify)
Bi-Monthly Drop      — one bag, every [cadence TBD]  $17/delivery
5 lb Monthly         — for the heavy drinker         $85/mo
5 lb Bi-Monthly       — for the household             $85/delivery
```

Prices above are the current live Shopify prices, shown for reference only — the storefront must always read them live per §2.1/§10.2, not hardcode them.

"Bi-Monthly" cadence is **unresolved** — see §92.2 #1. Do not write customer-facing frequency copy until it is confirmed; describe cadence with the Shopify selling plan's own delivery interval rather than a hand-written label.

CTA: `Build My Subscription →`

## 08 — Social proof

Keep sparse per §8.9. Use verifiable sources only — Google reviews, press, real customer quotes. Do not fabricate testimonials (§71).

## 09 — Journal

Three editorial entries, prioritizing Yego's real story over generic education content:

```text
The Tuyishime family's coffee story
Why "Yego" means yes — and what it means to us
How to brew Gatare Anaerobic at home
```

## 10 — Final CTA

```text
Your next coffee is waiting.
```

Primary: `Find My Coffee`
Secondary: `See Subscription Options`

---

# 91. Café Page — Confirmed Content

Updates §16 with real data. Route remains `/cafe`.

Confirmed (from the live site):

```text
Address: 1212 Broadway, Somerville, MA 02144
Contact: francois@yegocoffee.com
```

**Provisional — placeholder values, replace before launch:**

```text
Phone: +1 816 352 9842        ← carried-over number, not the café line
Hours: 8:00 AM – 6:00 PM      ← assumed standard hours, not verified
```

These two are safe to build against and safe to render in development. They are **not** safe to publish. Both feed outward-facing surfaces that are costly to correct after the fact:

- `LocalBusiness` / `CafeOrCoffeeShop` structured data (§34) — search engines cache and redistribute this
- the "Open now" indicator (§16, §55) — a wrong schedule turns people away at the door
- `tel:` links on mobile (§91) — a wrong number routes real customers to a stranger

Treat replacing them as a launch checklist item in §43 Phase 7 (cutover), alongside the other outward-facing verifications. Keep them in one place in content (`src/content/cafe.ts`) so the swap is a single edit, and consider a build-time assertion that fails production builds while the placeholder values are still present.

Structured hours for §55 (`CafeHours` type):

```ts
const cafeHours: CafeHours = {
  monday:    [{ open: "08:00", close: "18:00" }],
  tuesday:   [{ open: "08:00", close: "18:00" }],
  wednesday: [{ open: "08:00", close: "18:00" }],
  thursday:  [{ open: "08:00", close: "18:00" }],
  friday:    [{ open: "08:00", close: "18:00" }],
  saturday:  [{ open: "08:00", close: "18:00" }],
  sunday:    [{ open: "08:00", close: "18:00" }],
}
```

This schedule is a **placeholder**, not verified café hours. Confirm the real schedule with the owners before launch, including any day that deviates (weekend hours, Sunday closure, holidays). The structure above is correct — the values are not yet.

Deferred, not a blocker:

```text
Café menu — explicitly out of scope for now; ship /cafe without a "View Café Menu" CTA/section until content exists
```

Still missing, lower priority (nice-to-have, not required to ship):

```text
Parking / transit notes
Wi-Fi or seating policy, if any
Photography (current site has limited gallery assets — audit before relying on them for hero-quality imagery)
```

`/cafe` can now ship with hours/phone/address — the "Open now" feature in §16/§55 is unblocked. Omit the menu section/CTA entirely rather than stubbing it.

---

# 92. Current Shopify Catalog Snapshot & Migration Mapping

Concrete starting point for §43 (Migration From Existing Shopify Theme), Phase 1–3.

| Current handle | Price | New IA target | Notes |
|---|---|---|---|
| `medium-roast` | $19.00 | `/products/medium-roast` | core lineup |
| `dark-roast` | $19.00 | `/products/dark-roast` | core lineup |
| `light-roast` | unconfirmed | `/products/light-roast` | confirm price/availability in Phase 0 |
| `5-lb-bag` | $95.00 | `/products/5-lb-bag` | bulk format |
| Gatare Anaerobic Process | $25.00 | `/products/[handle]` | featured/limited — candidate for §90 §03 story slot |
| `bi-monthly-drop` | $17.00 | selling-plan on relevant coffee product | currently a standalone product |
| `monthly-drop` | $17.00 | selling-plan on relevant coffee product | currently a standalone product |
| `5-lb-bag-monthly-subscription` | $85.00 | selling-plan on `5-lb-bag` | currently a standalone product |
| `5-lb-bag-bi-monthly-subscription` | $85.00 | selling-plan on `5-lb-bag` | currently a standalone product |
| `dark-roast-monthly-subscription` | $17.00 | selling-plan on `dark-roast` | currently a standalone product |
| `dark-roast-bi-monthly-subscription` | $17.00 | selling-plan on `dark-roast` | currently a standalone product |
| `medium-roast-bi-monthly-subscription` | $17.00 | selling-plan on `medium-roast` | currently a standalone product |

## 92.1 Critical Phase 3 finding

The current store models subscriptions as **duplicate standalone products** rather than Shopify native selling plans attached to a single product. This directly conflicts with the architecture in §10 (one product, `Subscribe` vs `Buy once` toggle, §10.3) and must be resolved during §43 Phase 3 (Shopify cleanup) **before** frontend PDP work begins:

1. Consolidate each roast into one product with variants (grind, size).
2. Create Shopify selling plans (monthly, bi-monthly) on each subscribable product per §10.1.
3. Retire the duplicate `*-subscription` and `*-drop` products, redirecting their URLs (§43 Phase 2) to the consolidated product with the matching selling plan preselected via query param, e.g. `/products/dark-roast?plan=monthly`.
4. Re-validate pricing parity (§43 Phase 5) after consolidation — the $17/$19/$85/$95 price points above are the values to reconcile against post-migration selling-plan allocations.

Collections to preserve or remap: `roasted-coffee` → `/shop/coffee`, `merch` → `/shop/merch`, `subscriptions` → superseded by native selling plans on coffee products (§10), `all` → `/shop`.

## 92.2 Open questions blocking Phase 3

These cannot be resolved from the live site and must be answered by the owners:

| # | Question | Blocks |
|---|---|---|
| 1 | Does "Bi-Monthly" mean **every two weeks** or **every two months**? The term is ambiguous and both readings are in common use. §90.07 currently assumes every two weeks — unverified. | §10.1 selling-plan delivery policy, §90.07 copy, quantity math in §9.5 |
| 2 | Are grind options offered at all (whole bean / drip / espresso / French press)? No grind variants exist in the current catalog. | §13 variant selector, §9.6 result page, §93.2 |
| 3 | Is Light Roast currently active, and at what price? It links from the homepage but did not surface a price in the catalog scrape. | §90.03, §92 table |
| 4 | Is a decaf product planned within the launch window? | §93.2 (quiz), §93.3 (filters) |
| 5 | Is the 5 lb Bag aimed at wholesale/office buyers or heavy household drinkers? This changes how §9.5's consumption math routes to it. | §93.2, §12.1 merchandising |

Assumption #1 is the highest-risk item on this list: it sets a real billing cadence, and getting it wrong means customers are charged four times more often than they expect. Confirm before any selling plan is created in Shopify.

---

# 93. Catalog Reality Check — Right-Sizing the Spec

The single largest risk in this plan is a mismatch of scale. Sections 9, 12 and 13 were written against a hypothetical roaster with dozens of rotating single-origin lots. Yego sells **four coffees**:

```text
Light Roast
Medium Roast
Dark Roast
Gatare Anaerobic Process   (limited)
```

Plus one format variant (5 lb Bag). Building an eight-step weighted-scoring recommendation engine over four products produces a quiz that is visibly theatre — customers answer questions about brew method and adventure level, and the engine returns Medium Roast because it was always going to return Medium Roast. That erodes exactly the trust the quiz exists to build.

The fix is not to delete the quiz. The quiz remains the primary conversion mechanism (§77). The fix is to make it ask fewer, better questions and be honest about what it is doing.

## 93.1 Principle

> **Ask only what changes the answer.**

A question earns its place in the quiz if at least two real SKUs score differently on it. Everything else is either a consumption input (which drives quantity and cadence, not product choice) or should be cut.

Against the current catalog:

| §9.2 question | Discriminates? | Verdict |
|---|---|---|
| Step 1 — Brew method (8 options) | No — no SKU is brew-specific today | Cut as a *product* input; keep one simplified version as a **grind** input if #2 in §92.2 resolves yes |
| Step 2 — Flavor preference | Yes — maps cleanly onto light/medium/dark/anaerobic | **Keep** — this is the core question |
| Step 3 — Adventure level | Yes — but only isolates Gatare vs. everything else | **Merge** into Step 2 as a single "Surprise me / something unusual" option |
| Step 4 — Roast preference | Yes, but redundant with Step 2 | **Keep as a fallback only** — shown when flavor answer is ambiguous, or offered as "I already know my roast" skip-ahead |
| Step 5 — Cups per day | No (not a product input) | **Keep** — drives quantity (§9.5) |
| Step 6 — Number of drinkers | No (not a product input) | **Keep** — drives quantity and routes to 5 lb Bag |
| Step 7 — Delivery preference | No | **Keep as a confirmation**, inferred not asked (§9.2 already says this) |
| Step 8 — Decaf | No — **no decaf SKU exists** | **Cut.** Asking a question the catalog cannot fulfil is worse than not asking |

## 93.2 The quiz, as it should ship

Four questions. This also makes §90.05's promise ("Six questions. About 30 seconds.") wrong — **update that copy to match**, or the site over-promises its own quiz.

```text
01  What sounds good to you?
    Rich & chocolatey        → Dark Roast
    Smooth & balanced        → Medium Roast
    Bright & delicate        → Light Roast
    Something unusual        → Gatare Anaerobic Process
    I'm not sure             → falls through to Q1b

01b (conditional) How do you usually take it?
    Black                    → bias light/medium
    With milk                → bias medium/dark
    Iced or cold brew        → bias dark
    Shown only when "I'm not sure" is chosen; keeps the quiz honest
    instead of guessing silently.

02  How many cups a day, across everyone drinking it?
    Stepper, 1–12. Drives quantity + routes ≥6 toward the 5 lb Bag.

03  How often should we send it?
    We recommend [computed] based on your answer above.
    [Monthly]  [Bi-Monthly]  — labels per §92.2 #1
    Pre-selected, adjustable. Never a blind choice.

04  (conditional, only if grind variants exist — §92.2 #2)
    Whole bean or ground?
```

Result page stays exactly as §9.6 specifies. The "Why we picked it" block matters *more* at this catalog size, not less — it is what distinguishes a real recommendation from a coin flip. Draw its reasons from the actual answers given.

## 93.3 Shop filters, right-sized

Replace §12.1's filter list with:

```text
Roast:          Light · Medium · Dark
Format:         12 oz · 5 lb
Type:           Single-origin · Limited release
Subscription:   Available
```

Cut for now — reintroduce when the catalog supports them:

```text
Origin      — every coffee is Rwandan; a filter with one option is noise
Process     — only Gatare differs; surface it as a badge, not a filter
Brew method — no SKU is brew-specific
Decaf       — no SKU exists
```

With four products, the shop page should lead with **presentation over filtering**. Four coffees fit on one screen as full editorial cards (§89.1, DAK reference). Filters that return "4 of 4 results" make a small catalog feel emptier, not larger.

## 93.4 What this changes elsewhere

| Section | Change |
|---|---|
| §9.2 | Question list replaced by §93.2 |
| §9.4 | Scoring engine architecture stays — weights still configurable, so it scales when the catalog grows. Flavor weight rises; brew and decaf weights drop to zero |
| §12.1 | Filter list replaced by §93.3 |
| §13 | Grind selector conditional on §92.2 #2 |
| §90.05 | "Six questions" → "A few questions" until the count is final |
| §67 | Placeholder strategy still applies, but audit the real site's existing assets first (founder portrait, Rwanda farm photography) — some are usable and are more authentic than any stock substitute |

## 93.5 The trap to avoid

Do not pad the catalog to justify the architecture. The temptation with a four-SKU roaster is to invent product differentiation — fictional flavor notes, invented processing detail, a decaf that doesn't exist — so the quiz has more to work with. §71 already forbids fabricated product content; this is the specific form that violation would take on this project.

Yego's advantage is not catalog breadth. It is a single-family, single-origin story with four decades behind it. The site should feel like a **small, deliberate lineup presented beautifully**, not a large catalog presented thinly. Four coffees, each given a full screen, reads as confidence. Four coffees behind six filters reads as an empty store.


---

# 94. Phase 1 Build Record — Foundation

Implemented 2026-09-01. Records what was decided at the keyboard, where
reality diverged from the spec, and what Phase 1 deliberately left open.

## 94.1 Versions actually installed

§3's predicted versions were close. Installed current stable per the
version policy:

| Layer | §3 predicted | Installed |
|---|---|---|
| Next.js | 16.3.3+ | 16.3.4 |
| React | 19.2 | 19.2.8 |
| Tailwind | 4.3+ | 4.3.3 |
| TypeScript | strict | 5.9.3 |
| pnpm | — | 11.25.0 (via corepack) |
| Zod | — | 4.5.4 |
| Vitest | — | 4.1.11 |
| Font Awesome | — | 7.3.1 |

Node 26.5.1. Turbopack is the default builder in this Next line.

## 94.2 Decisions that extend or amend the plan

**Environment validation is split, not monolithic (amends §30).**
A single strict schema parsed at boot would have made Phase 1
impossible to finish before Storefront credentials existed. The schema
is now two: `core` (parsed at module load, fails fast) and `shopify`
(parsed lazily on first API use). The app boots, renders and tests
without credentials; the moment anything touches Shopify it throws with
an actionable message. It never falls back to mock data — a green build
against stubbed responses would defeat the §75 exit criterion.

**`Money.currencyCode` widened from the literal `"USD"` (amends §29).**
Pinning the type to one currency member would make the multi-currency
path in §81 a type-level rewrite rather than a config change. Formatting
always uses whatever Shopify returned (§54).

**Raw API types live in `types.api.ts`, not a namespace (amends §29).**
`@typescript-eslint/no-namespace` rejects the namespace form. Same
boundary, plain module.

**Dark is a surface context, not a document mode (amends §17.5).**
Semantic tokens reassign on `[data-surface="soil"]` rather than a global
`prefers-color-scheme` swap. This storefront needs full-bleed dark
*sections* inside a light page (§90.01 hero, §90.04 brand statement) far
more than it needs a user-facing theme toggle, and a global dark mode
would double the §68 visual-QA matrix for no stated requirement.

**shadcn CLI was not run.** Its `init` overwrites `globals.css` with a
neutral palette, which would have destroyed the token layer. Primitives
are hand-written to shadcn's conventions (cva + `cn`), which §17.6
requires anyway — "shadcn as a primitive source, not the visible brand."
`components.json` can be added later if CLI-added components are wanted.

## 94.3 Design direction (implements §17, §89)

Recorded so it is not re-litigated each session.

**Palette — "Highland."** Specialty coffee brands design from the
roasted bean: cream grounds, brown type, terracotta accent. Yego's story
starts at the other end of the chain, on a Rwandan hillside. The palette
comes from there instead — volcanic soil, highland mist, terraced green,
and the gold of the sun on the flag. This is the deliberate risk: a cool,
green-led palette for a product universally marketed warm. It is
defensible because Yego's differentiator is origin and family, not
roast craft, and because it will not be mistaken for any competitor.

```text
soil     #131C17   near-black, green cast    ground, body text
terrace  #2C5A43   hillside green            accent on light
sage     #5A6B5F   muted                     secondary text
mist     #E8EBE4   highland fog              page ground
sun      #E0A32E   flag gold                 accent on dark, rare
cherry   #B23A26   coffee cherry             destructive, limited
```

**Type.** Fraunces for the editorial voice, wonk axis on — the display
face should read made by hand, not machined, for a business four decades
into one family. Archivo for everything structural; its width axis gives
the label register its condensed, tracked-out form.

**Signature — the contour rule.** Section boundaries are drawn as
topographic contours rather than a single hairline, because Rwanda is
the land of a thousand hills and Yego's coffee grows on terraces where
altitude is a real quality signal. The label slot carries something
true: a section name, or a real altitude on product pages. It is
explicitly not a slot for invented sequence numbers (§93.5).

**Contrast, measured in-browser, all AA or better:**

```text
soil on mist            14.45:1
terrace on mist          6.58:1
sage on mist             4.71:1
cherry on mist           4.94:1
primary button (light)   7.15:1
primary button (soil)     8.4:1
sun on mist              1.85:1   ← fails by design; see rule below
```

`sun-500` never carries text on a light ground. Fill, rule and focus
ring only. On soil it reaches 7.83:1 and becomes the accent.

## 94.4 A bug worth remembering

tailwind-merge silently dropped `text-accent-foreground` from every
sized button, because it classified the custom font size `text-body-m`
and the custom colour `text-accent-foreground` into the same `text-*`
group and kept only the last. The result rendered dark green text on a
dark green fill at 2.2:1 — effectively unreadable, and invisible in code
review since both classes were present in the source.

Fixed by teaching tailwind-merge the token names in `src/lib/utils.ts`.
**Any new `--text-*` or semantic colour token must be added there.**
`src/lib/utils.test.ts` guards the pairing.

This generalises: custom Tailwind tokens and tailwind-merge do not
discover each other. Assume the same trap for any future custom scale.

## 94.5 Phase 1 exit criteria — status

| §75 criterion | Status |
|---|---|
| Environment validation works | Done — fails fast, 8 tests |
| Design primitives render | Done — `/foundations` |
| `pnpm build` passes | Done — typecheck, lint, 21 tests, build all green |
| Product query succeeds | **Blocked** — no Storefront credentials yet |
| Preview deployment works | **Not started** — needs Vercel account access |

The client and query layer are written and typed against the Storefront
schema, but **no request has ever been executed**. Treat
`getProducts()` / `getShopIdentity()` as unverified until a real token
exists. The first task of Phase 2 is to run them and fix whatever the
real schema disagrees with.

## 94.6 Still open

None of §92.2's five questions were resolved by this pass — all five
need the owners, not the code. The bi-monthly cadence (§92.2 #1) remains
the highest-risk item and still blocks any selling-plan work.

Café phone and hours in §91 remain placeholders and must not ship.
