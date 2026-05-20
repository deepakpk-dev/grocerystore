# Storefront shell + visual system — design

**Project:** Manokara Stores
**Sub-project:** A (of three) — Storefront shell + visual system
**Version:** v0.5 (this spec) → v0.6 (photo pass, deferred)
**Date:** 2026-04-25
**Status:** Approved by user, ready for implementation plan

---

## Context

Manokara Stores is a brick-and-mortar South-Asian specialty grocer in Stuttgart. The full project (`plan.md`) is a read-only storefront website that pulls live inventory from a Google Sheet and ranks for local/long-tail organic search. The site is **not** e-commerce.

Phase 0 of the project — the current phase, pre-client-commitment — is to build a mock store on a Vercel preview URL to pitch the client. Phase 0 itself is too large for one design spec, so it has been decomposed into three sub-projects:

- **A. Storefront shell + visual system** *(this spec)* — Next.js scaffold, locked visual system, all four page types rendering from a hardcoded mock catalog. No live data, no SEO finalization, no deploy. Goal: a homepage that looks pitchable.
- **B. Live-data pipeline** — Google Sheets API, Zod validation, daily cron, manual refresh endpoint. Plugs into A.
- **C. SEO + launch polish** — JSON-LD, sitemap, robots, per-page metadata, Vercel deploy, Lighthouse pass.

Build A first, plan B once A is done, plan C once B is done.

---

## Decisions log (from brainstorm)

| Decision | Choice | Rationale |
|---|---|---|
| Sub-project order | A → B → C | A carries the highest visual-rework risk; demoable soonest |
| Visual direction | **Editorial produce-magazine** (Direction C in brainstorm) | Photo/typography-led; "Bon Appétit on a grocer" feel; most premium of three options shown |
| Photo strategy | **P4 first, P3 next** — placeholders in v0.5, hybrid Unsplash + AI photo pass in v0.6 | Separates layout decisions from photo-sourcing decisions; reduces concurrent risk |
| Build philosophy | **β — one page end-to-end, then propagate** | Locks visual language by example on the highest-stakes page; rule-of-two extraction avoids speculative components |
| Build philosophy alternatives considered | α (tokens + atoms first, then pages) and γ (storybook-style draft page, then routes) | β was chosen because Direction C is hero-heavy and the homepage is the strongest example to pin down |
| Display typeface | **Fraunces** (Google Fonts, variable, weight 500) | Modern slab-serif with warmth; alternatives Playfair Display and Cormorant felt either over-used or too thin |
| Body typeface | **Inter** (Google Fonts) | Familiar, Latin Extended for German addresses, pairs with Fraunces |
| Primary accent | **Turmeric gold `#e3a728`** | Warmer-classic; mango orange `#c2410c` was the louder alternative |
| Stock chip — out-of-stock | Warm gray, **not red** | Out-of-stock is normal information for a fresh-produce shop, not an error |
| Item card transliteration | **Yes** — Tamil name shown as a label row | e.g. "Tamil · Pavakkai" |
| MOCK ribbon | Visible site-wide; hidden via `NEXT_PUBLIC_HIDE_MOCK_RIBBON=1` | Pitch must be unambiguous about sample data |
| Address strategy | `Mustermannstraße 1, 70173 Stuttgart` (the German "123 Main St") | Plausibly-shaped but obviously placeholder; combined with MOCK ribbon, no confusion possible |
| Filter bar on category pages | **Anchor links**, no client JS | v0.5 stays fully static; client-side filtering can be added in B if needed |
| `<VisitBlock>` placement | **Per-page**, not in root layout | Avoids route-group cleverness; `/visit` simply doesn't render it |
| Schema validation | **TS types only in v0.5** | Hardcoded mock has no untrusted data; Zod arrives with sub-project B |

---

## Scope

### In scope (v0.5)

- Next.js 16 + TypeScript + Tailwind project, scaffolded with `pnpm`, runs on `pnpm dev`
- Locked visual system — palette, type scale, spacing, radius, stock-chip variants — defined once in `lib/theme.ts` and consumed via Tailwind config
- `lib/business.ts` with placeholder Stuttgart info (`isMock: true`)
- `lib/mock-catalog.ts` with 35 plausible SKUs across 5 categories; ~6 flagged `featured`
- All four page types rendering: `/`, `/[category]` (×5), `/item/[slug]` (×~35), `/visit`
- Subtle "MOCK · sample data" ribbon, env-flag-controlled
- Clean `pnpm build` with `generateStaticParams` working for both dynamic routes

### Deferred to v0.6

- All photography — placeholder treatment (gradient + turmeric ambient glow) everywhere in v0.5
- Animations, scroll effects, micro-interactions
- Final wordmark/logo design — v0.5 uses a typographic wordmark only

### Deferred to sub-project B

- Google Sheets API integration, service account, Zod validation
- `/api/refresh`, daily Vercel cron, manual token endpoint
- `unstable_cache` and `revalidateTag('catalog')`

### Deferred to sub-project C

- JSON-LD (`LocalBusiness`, `GroceryStore`, `Product`, `BreadcrumbList`)
- Dynamic `app/sitemap.ts`, `app/robots.ts`
- Per-page metadata generation, `dateModified`
- Lighthouse pass, Vercel preview/production deploy
- `vercel.ts` (region, cron, framework config)

---

## Visual system tokens

### Palette

| Token | Hex | Use |
|---|---|---|
| `bg` | `#faf9f6` | Page background — warm off-white |
| `surface` | `#ffffff` | Cards, item-page surface |
| `text` | `#1a1a1a` | Primary text — deep charcoal |
| `text-muted` | `#6b6b66` | Secondary text — warm gray |
| `text-subtle` | `#a8a59f` | Tertiary text — captions, labels |
| `line` | `#ebe9e3` | Dividers, card borders |
| `accent` | `#e3a728` | Turmeric gold — primary accent |
| `accent-deep` | `#b87f12` | Pressed/hover for accent |
| `deep` | `#1f5132` | Curry-leaf green — "open", "in stock", footer |
| `warm` | `#c2410c` | Mango — emergency/highlight only |

Editorial restraint: charcoal text on warm off-white, photos do most color work, accent used sparingly. Curry-leaf reserved for "open" and "in stock" semantics.

### Type

- **Display:** Fraunces (Google Fonts, variable, weight 500). `next/font` with `display: 'swap'`.
- **Body:** Inter (Google Fonts, weights 400/500/600). `next/font` with `display: 'swap'`.

| Scale | Size / line-height / tracking | Use |
|---|---|---|
| Display XL | 56px / 1.0 / -0.02em (mobile: 40px) | Homepage hero |
| Display L | 40px / 1.05 / -0.02em (mobile: 32px) | Category hero, item-page name |
| Display M | 28px / 1.1 / -0.015em | Section titles ("Fresh today") |
| H2 | 22px / 1.2 / -0.01em | — |
| H3 | 17px / 1.3 | — |
| Body | 16px / 1.55 | — |
| Small | 14px / 1.5 | — |
| Caption | 12px / 1.4 | Metadata, prices |
| Label | 11px / 1.0 / 0.12em uppercase | "FRESH TODAY", "OPEN · CLOSES 8PM" |

### Stock chip variants

| Variant | Background | Text | Dot |
|---|---|---|---|
| In stock | `#e7efe9` | `#1f5132` (deep) | `#1f5132` |
| Low | `#fbeed0` | `#7a5410` | `#b87f12` (accent-deep) |
| Out of stock | `#f1efeb` | `#807a72` | `#b9b3aa` |

All three pass WCAG AA on the warm-off-white page background.

### Spacing & radius

- Tailwind default 4-unit spacing scale, plus `section: 6rem` for vertical rhythm between major page sections
- Radii: chip `999px`, button `10px`, card/hero `14px`

---

## Page architecture

### Routing

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Static |
| `/[category]` | `app/[category]/page.tsx` | `generateStaticParams` over 5-category enum |
| `/item/[slug]` | `app/item/[slug]/page.tsx` | `generateStaticParams` over `mock-catalog.ts` rows |
| `/visit` | `app/visit/page.tsx` | Static |

### Root layout

`app/layout.tsx` renders `<MockRibbon/>` + `<TopBar/>` + `{children}`. Footer (`<VisitBlock/>`) is rendered per-page, not in the layout.

### Page anatomies

**Homepage (`/`)** — top to bottom:
1. `<MockRibbon/>` (above TopBar)
2. `<TopBar/>` — wordmark left, `<OpenNow/>` right
3. Hero — Display XL headline ("Fresh / this morning."), short body sub, "updated HH:MM" timestamp, large `<PhotoPlaceholder/>`
4. "Fresh today" section — Display M label + 2-column grid of `<ItemCard/>` for the 6 featured items
5. "Browse" section — small label + 5 `<CategoryTile/>` rows
6. `<VisitBlock/>` — dark surface, address + hours summary + contact links

**Category page (`/[category]`)**:
1. `<MockRibbon/>` + `<TopBar/>`
2. `<Breadcrumb/>` — `Home / Vegetables`
3. `<CategoryHero/>` — Display L name + count + one-line blurb + `<PhotoPlaceholder/>`
4. `<FilterBar/>` — anchor links: `All · 24` / `In stock · 18` / `Featured · 4`
5. 2-column `<ItemCard/>` grid, sectioned by anchor with `scroll-margin-top`
6. `<VisitBlock/>`

**Item page (`/item/[slug]`)**:
1. `<MockRibbon/>` + `<TopBar/>`
2. `<Breadcrumb/>` — `Home / Vegetables / Bitter gourd`
3. Large `<PhotoPlaceholder/>` with `<StockChip/>` overlaid
4. Display L name, then price+unit, then origin label, then Tamil name label
5. Short body — templated from item fields: one stock-line ("Restocked this morning." for in-stock, "Limited stock today." for low, "Out of stock — check back tomorrow." for out) plus a "Featured this week." line when `featured` is true. Strings live in `lib/copy.ts` so a Phase-1 reviewer can reword without hunting through components.
6. "Also in vegetables" — 3-card grid using `<ItemCard compact />`
7. `<VisitBlock/>`

**Visit page (`/visit`)**:
1. `<MockRibbon/>` + `<TopBar/>`
2. Display L "Visit." + address as Display M sub
3. Static map image placeholder (real map in sub-project C)
4. `<HoursTable/>` — today's row highlighted via warm-amber background
5. `<ContactRows/>` — phone, WhatsApp, Instagram
6. `<TransitNotes/>` — bulleted list from `business.transit`
7. **No** `<VisitBlock/>` (this page is the visit info)

---

## Components

### Tier 1 — extracted while building the homepage

| Component | Where used | Notes |
|---|---|---|
| `<TopBar>` | every page | wordmark left, `<OpenNow/>` right; sticky? — no in v0.5 |
| `<Wordmark>` | TopBar; possibly large standalone later | typographic only in v0.5; size variant prop |
| `<OpenNow>` | TopBar | server component; computes against `business.hours` and current `Europe/Berlin` time |
| `<StockChip>` | item cards, item page, category filter | 3 variants × 2 sizes |
| `<PhotoPlaceholder>` | every photo slot | gradient + turmeric glow; deterministic seed from slug for varied-but-stable look |
| `<ItemCard>` | homepage Fresh today, category grid, item-page siblings | `compact` variant for siblings |
| `<CategoryTile>` | homepage Browse | category name + count |
| `<VisitBlock>` | every page footer except `/visit` | dark surface; links open Maps / WhatsApp / Instagram in new tabs |
| `<MockRibbon>` | site-wide above TopBar | hidden when `NEXT_PUBLIC_HIDE_MOCK_RIBBON=1` |

### Tier 2 — extracted during pages 2–4

| Component | First needed by |
|---|---|
| `<CategoryHero>` | `/[category]` |
| `<Breadcrumb>` | `/[category]`, `/item/[slug]` |
| `<FilterBar>` | `/[category]` |
| `<HoursTable>` | `/visit` |
| `<ContactRows>` | `/visit` |
| `<TransitNotes>` | `/visit` |

### Conventions

- One component per file; PascalCase filename matches export
- Server components by default; **no client components in v0.5** (every page fully static)
- Components live in `components/`
- Each component takes only the props it needs — no spread-of-everything `item: Item` if only `slug + name + price + stock` is used

---

## Mock data

### `lib/schema.ts` — TypeScript types only

```ts
export type Category = 'vegetables' | 'fruits' | 'fish' | 'meat' | 'dry-goods';
export type StockLevel = 'in-stock' | 'low' | 'out-of-stock';

export type Item = {
  slug: string;        // URL-safe, derived from name
  name: string;        // English display name
  tamil?: string;      // transliteration, e.g. 'Pavakkai'
  category: Category;
  stock: StockLevel;
  price: number;       // EUR
  unit: string;        // 'kg' | '500g' | 'bunch' | 'piece' | ...
  origin?: string;
  featured?: boolean;
};

export type CategoryMeta = {
  slug: Category;
  display: string;     // 'Vegetables'
  blurb: string;       // one-line, used on category hero
};
```

### `lib/business.ts` — placeholder Stuttgart info

```ts
export const business = {
  name: 'Manokara Stores',
  isMock: true,
  address: { street: 'Mustermannstraße 1', postal: '70173', city: 'Stuttgart', country: 'DE' },
  geo: { lat: 48.7758, lng: 9.1829 },
  hours: {
    mon: { open: '09:00', close: '20:00' },
    tue: { open: '09:00', close: '20:00' },
    wed: { open: '09:00', close: '20:00' },
    thu: { open: '09:00', close: '20:00' },
    fri: { open: '09:00', close: '20:00' },
    sat: { open: '09:00', close: '20:00' },
    sun: null,
  },
  phone: '+49 711 000 000',
  whatsapp: '+4971100000',
  instagram: 'manokara.stores',
  transit: [
    'S-Bahn Hauptbahnhof — 6 min walk',
    'U-Bahn Charlottenplatz — 4 min walk',
    'Free 30-min street parking on Marienstraße',
  ],
};
```

### `lib/mock-catalog.ts` — 35 SKUs

| Category | Count | Items |
|---|---|---|
| Vegetables | 10 | Okra (Vendakkai), Bitter gourd (Pavakkai), Drumstick (Murungakkai), Ridge gourd (Peerkangai), Snake gourd (Pudalangai), Curry leaves (Karuvepilai), Banana flower (Vazhaipoo), Plantain (Vazhaikkai), Ash gourd (Pusinikkai), Taro root (Cheppankizhangu) |
| Fruits | 6 | Alphonso mango, Guava (Koyya), Custard apple, Papaya, Jackfruit, Lime |
| Fish | 5 | Tilapia, King fish (Vanjaram), Seer, Sardine, Prawn |
| Meat | 3 | Goat curry cut, Chicken curry cut, Mutton chops |
| Dry goods | 11 | Basmati rice, Idly rice, Urad dal, Toor dal, Mustard seeds, Fenugreek, Asafoetida, Tamarind, Jaggery block, Coconut, MTR rasam powder |
| **Total** | **35** | |

**Stock distribution (target):** ~70% in-stock, ~20% low, ~10% out-of-stock — gives the chips real signal-to-noise on the demo.
**Featured flag:** 6 items, mixed across categories, drives homepage "Fresh today".

---

## File structure

```
manokara-stores/
├── app/
│   ├── layout.tsx              # <MockRibbon/> + <TopBar/> + {children}
│   ├── globals.css             # Tailwind directives + base styles
│   ├── page.tsx                # /
│   ├── [category]/page.tsx
│   ├── item/[slug]/page.tsx
│   └── visit/page.tsx
├── components/
│   ├── TopBar.tsx
│   ├── Wordmark.tsx
│   ├── OpenNow.tsx
│   ├── MockRibbon.tsx
│   ├── StockChip.tsx
│   ├── PhotoPlaceholder.tsx
│   ├── ItemCard.tsx
│   ├── CategoryTile.tsx
│   └── VisitBlock.tsx
│   # Tier-2 added during pages 2–4:
│   # CategoryHero.tsx, Breadcrumb.tsx, FilterBar.tsx, HoursTable.tsx, ContactRows.tsx, TransitNotes.tsx
├── lib/
│   ├── schema.ts
│   ├── business.ts
│   ├── mock-catalog.ts
│   ├── categories.ts
│   ├── theme.ts
│   ├── time.ts                 # Europe/Berlin "is open now" helpers
│   └── copy.ts                 # templated body strings, easy to reword
├── public/                     # favicons + og come in sub-project C
├── tailwind.config.ts          # consumes lib/theme.ts; declares Fraunces + Inter
├── postcss.config.js
├── tsconfig.json
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── .env.local.example          # NEXT_PUBLIC_HIDE_MOCK_RIBBON=
├── .gitignore                  # ignores .superpowers/ and .vercel/
├── CLAUDE.md                   # already exists
└── plan.md                     # already exists
```

---

## Build sequence (β — eight steps)

1. **Scaffold.** `pnpm create next-app@latest` (TypeScript, Tailwind, ESLint, App Router, no `src/`). Wire Fraunces + Inter via `next/font`. `tailwind.config.ts` reads from `lib/theme.ts`.
   *Gate:* `pnpm dev` shows the starter on `localhost:3000`.

2. **Tokens + types + mock data.** Write `lib/theme.ts`, `lib/schema.ts`, `lib/business.ts`, `lib/categories.ts`, `lib/mock-catalog.ts` (35 items), `lib/time.ts`, `lib/copy.ts`.
   *Gate:* `pnpm tsc --noEmit` passes.

3. **Homepage end-to-end (inline).** Write `app/layout.tsx` and `app/page.tsx` with everything inline — no extraction yet. Includes hero, "Fresh today" grid, category tiles, visit block.
   *Gate:* eyeball at 375px and 1280px; adjust tokens if anything feels off.

4. **Extract tier-1 components.** Pull out `<TopBar>`, `<Wordmark>`, `<OpenNow>`, `<MockRibbon>`, `<StockChip>`, `<PhotoPlaceholder>`, `<ItemCard>`, `<CategoryTile>`, `<VisitBlock>`. Homepage stays visually identical.

5. **Category pages.** `app/[category]/page.tsx` with `generateStaticParams`. Extract tier-2 components `<CategoryHero>`, `<Breadcrumb>`, `<FilterBar>` here.
   *Gate:* `pnpm build` reports 5 category routes pre-rendered.

6. **Item pages.** `app/item/[slug]/page.tsx` with `generateStaticParams`. Reuses `<ItemCard compact />` for siblings.
   *Gate:* `pnpm build` reports 35 item routes pre-rendered.

7. **Visit page.** `app/visit/page.tsx`. Extract `<HoursTable>`, `<ContactRows>`, `<TransitNotes>`.

8. **Polish pass.** Walk all 4 page types side-by-side at mobile + desktop. Fix any visual drift. Run full `pnpm build`.

---

## Verification — v0.5 is done when

1. `pnpm dev` runs; all 4 page types load without console errors at 375px and 1280px
2. `pnpm build` reports **`1 + 5 + 35 + 1 = 42` static pages** with zero errors
3. `pnpm tsc --noEmit` and `pnpm lint` both clean
4. No hex literals in `app/` or `components/` — only `lib/theme.ts` and `tailwind.config.ts` contain colors
5. `<OpenNow>` correct against `Europe/Berlin` for a Sunday afternoon (renders "Closed · opens Monday 9am")
6. `<MockRibbon>` shows by default; hidden when `NEXT_PUBLIC_HIDE_MOCK_RIBBON=1`
7. Editing one row of `mock-catalog.ts` is reflected on next dev reload
8. Eyeball check at mobile width on a real device or DevTools emulation — homepage looks pitchable to a prospective client

Vercel deployment and Lighthouse scoring are part of sub-project C, not v0.5.
