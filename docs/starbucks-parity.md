# Starbucks parity: measured gaps and the plan to close them

Measured on 2026-10-23 from the live pages at 1440×900 and 375×812, using computed styles:
- `shop.starbucks.com/collections/all-coffee`
- the Rancho Pink Bourbon product page
- our local `/shop` and `/products/dark-roast`

Starbucks sets `html { font-size: 10px }`, so their `rem` values are converted to px below. The palette is not part of this comparison.

**Status:** built on 2026-10-23. The results, re-measured against these numbers, are recorded in `plan.md` §108.5.

Already done in this pass: **linen is gone**. Every page, the announcement bar and every panel now sit on paper (#fbfaf8), and product tiles are white (§108.4).

---

## 1. Animations

| What | Starbucks | Ours | Gap |
|---|---|---|---|
| Scroll reveal | `slideIn`: `translateY(20px)` and `opacity .01` → none / 1. **600ms `cubic-bezier(0,0,.3,1)`**, fill forwards. It applies to the page title, the intro, every section heading and **every grid card**. It fires as each element enters the viewport. | None. Only the hero animates on load. | **Missing entirely.** |
| Stagger | Each item waits `75ms × its order in the row`, so a row of four cards arrives at 75, 150, 225 and 300ms. | None | Missing |
| Card hover: image | `transform: scale(1.2)`, **500ms** (the image's own `transition: opacity .25s, transform .5s`). It is clipped by the 8px tile. | `scale(1.04)` over 500ms on our brand ease | Ours is too timid. Starbucks zooms hard. |
| Card hover: title | Title colour shifts to their dark accent green | Underline on the title | Different gesture |
| Page change | Plain navigation, nothing animates | 120ms fade-out, then a 360ms rise (View Transition) | We add motion Starbucks doesn't have |
| Buttons | Colour change only (`hover-default` theme) | Colour change | Match |

## 2. Type

| Role | Starbucks | Ours | Gap |
|---|---|---|---|
| Body | 16px / 24px, 400, −0.01em; text colour `rgba(18,18,18,.75)` | 16px / 25.6px, 400, −0.01em; solid ink | Line height 1.6 → 1.5. Body copy should be softer than headings. |
| Collection title (h1) | **48px / 57.6**, 700, −0.02em, centred, 16px below | 45px / 54, 700, −0.02em | The clamp doesn't reach 48px at 1440 |
| Collection intro | **18px / 27, weight 400**, #767676 | 23px / 32.5, **weight 700**, muted | **Too big and too bold.** This was my misread in the first pass. |
| Section heading ("Coffee", "Starbucks Reserve") | **24px / 28.8**, 700, −0.02em | 40px (`text-h1`) | Far too large |
| Feature-row heading (home) | 32px / 38.4, 700 | 40px (`text-h1`) | One step too large |
| Product title (PDP) | **40px / 52**, 700, −0.02em | 45px (display-l) | Slightly too large |
| PDP intro line | 18px / 27, 400 | Roast note as a bold 23px lede | Wrong weight and size |
| Card title | **20px / 24, weight 600**, −0.02em, #212121 | 18px / 28.8, 700 | Size, weight and leading all off |
| Card notes | 14px / 21, 400, #767676 | 13px, 500 (`.label`) | Close. Use 14/400. |
| Card price | **14px, weight 700**, #767676 | 16px, 500 | Size and weight |
| PDP price | 18px, 700 | 16px, 500 | Size and weight |
| Buttons | **15px**, 600, −0.01em | 16px, 600 | 1px smaller |
| Header nav | 13px, 400, uppercase (their display face) | 16px, 700, sentence case | Sentence case stays (our rule, already decided). Go to **15px / 600**: our face at their size reads lighter and smaller. |
| Footer heading | 16px, 700, uppercase, +0.08em tracking | 16px, 700, sentence case | Keep ours. Uppercase is banned. |
| Mobile title / intro / section heading | 32px / 16px regular / 24px | 32px / 18px bold / 32px | Intro and section heading off |

## 3. Element sizes and layout

| Element | Starbucks | Ours | Gap |
|---|---|---|---|
| Content width at 1440 | **1360px**: full width less a 40px gutter (page width 1400px) | 1216px (`max-w-page` 76rem) | 144px narrower |
| Gutter | 40px desktop, **20px** mobile | 40px desktop, 16px mobile | Mobile gutter |
| Header height | **95px**, with a 2px #fafafa bottom border | 89px, 1px border | +6px |
| Logo | 50px tall | 48px | Close enough |
| Announcement bar | about 43px, 14px text | 46px, 14px | Match |
| Collection header | Title 76px below the header. Title, then 16px, then intro. About 76px down to the first section heading. | `py-section-md` (about 104px) and `mt-stack-md` | Tighten to 76/16/76 |
| Section heading → grid | **40px** | 24px (`mt-stack-lg`) | +16px |
| Between collection groups | about 110px | `section-md` | Close |
| Grid columns | **4 at desktop, 1 on a phone** | 4 at desktop, 2 on a phone | Phone layout |
| Grid gap | **32px × 32px** (16px horizontally on a phone) | 24px × 56px | Equal 32px |
| Card width at 1440 | **316px** | 286px | Follows from the content width |
| Card image | **316 × 373** (ratio 0.847, about 5:6 portrait), cover, **8px** radius | 286 × 286 square, 16px radius | **Portrait ratio and 8px corners** |
| Image → title | 16px | 16px | Match |
| Title → notes → price | 0px, then about 8px | 4px, then 4px | Small |
| Badge on card | White, 11px / 600, 4px radius, 24px tall, inset 20px top-left | None | We have no badge data. Don't add one (§71). |
| PDP columns | Media **780px**, gap 88px, info **436px** (about 60/40) | 50/50, gap 64px | Media should dominate |
| PDP main image | 664 × 700 | Square at column width | Taller frame |
| PDP quantity + add to cart | **One row**: quantity pill 100 × 48 beside a 316 × 48 pill | Stacked; quantity 44px tall; button 56px | Side by side, both 48px |
| PDP below the fold | Story heading, specs grid (11px labels, 15px / 600 values), article link, "You might also like" (24px heading, 4-up) | Details contour, description, related (40px heading) | Related heading size. No spec data exists in the store, so no grid. |
| Buttons | 48px tall, padding 20 × 27.5, pill | `md` 48px / `lg` 56px | Drop `lg` to 48px. Starbucks has no 56px button. |

---

## 4. Plan

Each step is small and can be checked against the numbers above.

**Step 1. Tokens** (`globals.css`, `utils.ts`, `utils.test.ts`)
- **Width and gutter:** `--container-page: 85rem` (1360px). `--spacing-page-x: clamp(1.25rem, 3vw, 2.5rem)` (20px → 40px).
- **Type scale:**
  - `display-l`: `clamp(2rem, 1.25rem + 2.2vw, 3rem)`, line height 1.2. That is 32px on a phone and 48px at 1440.
  - `h1`: `clamp(2rem, 1.6rem + 1vw, 2.5rem)`, line height 1.3. This is the PDP title at 40px.
  - `h2`: `2rem` / 1.2. Feature rows at 32px.
  - `h3`: `1.5rem` / 1.2. Section headings and "You might also like" at 24px.
  - New `h4`: `1.25rem` / 1.2. Card titles at 20px. Register it in tailwind-merge.
  - `lede`: `1.125rem` / 1.5, **weight 400**.
  - `body-m` line height 1.5.
  - `price` stays at 16px, plus a new `price-s` at 14px for cards. Register it.
- **Radius:** new `--radius-tile: 0.5rem` for product tiles and the PDP gallery. `rounded-card` (16px) stays for editorial photographs. Register `tile`.
- **Muted text:** body copy colour goes to ink at 80% (the Starbucks equivalent). Headings stay solid ink.

**Step 2. Primitives**
- Button: text 15px; `lg` becomes 48px.
- `PageHeader`:
  - The lede loses `font-bold` and goes to 18px regular.
  - Centred variant: title 76px below the header, then 16px, then the lede, then 76px.
  - A new `size="product"` for the PDP's 40px title.
- Header: `h-24` (96px) on desktop; nav text 15px / 600; a 2px border in `border-border`.

**Step 3. Product grid and card** (`product-grid.tsx`, `product-card.tsx`, `product-media.tsx`)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, with a 32px gap both ways (16px horizontally on a phone).
- Card:
  - Tile at `aspect-[5/6]`, `rounded-tile`, `overflow-hidden`, white.
  - Hover scales the image `1.2` over 500ms and turns the title to the roast accent. One gesture, two properties, as Starbucks does.
  - Title `text-h4 font-semibold`.
  - Note 14px / 400, muted.
  - Price `text-price-s font-bold`, muted, with 8px above it.
- Section heading → grid: 40px. Shop section headings use `text-h3`.

**Step 4. Scroll reveal** (new `src/components/ui/reveal.tsx`, plus CSS in `globals.css`)
- One client island. A single `IntersectionObserver` marks children `[data-revealed]` as they enter the viewport.
- CSS: `translateY(20px)` / opacity 0 → none, **600ms `cubic-bezier(0,0,.3,1)`**, delay `calc(var(--reveal-order) * 75ms)`.
- Where it applies: collection titles and ledes, section headings and grid cards (order = position in the row), matching where Starbucks uses it.
- Under reduced motion there is no transform and no delay. Without JavaScript everything is visible: the hidden start state is only applied once the observer has attached, so server-rendered content never sits invisible.
- **Remove the route View Transition** (`template.tsx` and the `::view-transition` rules). Starbucks doesn't animate page changes, and stacking a page rise on a scroll reveal is double motion.

**Step 5. Product page** (`products/[handle]/page.tsx`, `product-purchase-form.tsx`, `product-gallery.tsx`, `quantity-selector.tsx`)
- Columns `lg:grid-cols-[1fr_436px]`, gap 88px.
- Gallery main image at `aspect-[19/20]` with `rounded-tile`.
- Title at 40px (`size="product"`). The roast note becomes the 18px regular intro line under the title. Price 18px / 700.
- Quantity (a 100 × 48 pill with a border) and Add to cart (48px, filling the rest of the row) sit on one line.
- "You might also like" goes to `text-h3` (24px) on the same 4-up grid.

**Step 6. Homepage and other pages**
- Feature-row headings go to `text-h2` (32px). The statement title stays `display-l` (48px).
- The ledes on `/shop`, `/subscriptions`, `/cafe` and the cart drop bold.
- Mobile: one column of cards, 20px gutter.

**Step 7. Records, tests and verification**
- Update `plan.md` §108.5, `AGENTS.md` (radius roles, motion rule now "scroll reveal only"), and the token-registration and screens tests:
  - a single-column grid on mobile
  - `reveal.tsx` exists and respects reduced motion
  - no View Transition rules
- Run typecheck, lint, unit tests and the build.
- Re-run the measurement script on `/shop` and the PDP at 1440 and 375, and diff the numbers against the Starbucks columns above. The target is within 2px on every row in §2 and §3.

### Deliberately not matched
- **Uppercase** nav, labels and footer headings. Our rule stands: sentence case.
- **Badges** ("Online Exclusive", "New") and **tasting-note pairs**. Yego's store has no such data, and inventing it breaks §71.
- **Spec grid** (origin, altitude, varietal, process). The store has no metafields (§96.4). It can be added once that data exists in Shopify.
- **Palette.** It stays ours, minus linen.
