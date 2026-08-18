# Manokara Stores — Live Stock Storefront

A read-only storefront website for **Manokara Stores**, a South-Asian specialty grocer in Stuttgart, Germany, serving primarily the Tamil diaspora community.

This is explicitly **not e-commerce**. There is no cart, no checkout, and no accounts. The site does two things:

1. **Shows today's stock** — live inventory (~100 SKUs across vegetables, fruits, fish, meat, and dry goods) pulled from the shop's morning-updated Google Sheet.
2. **Ranks for organic local search** — static HTML, structured data, and per-item pages so new customers discover the shop through Google.

The only daily operation the shop performs is what its staff already do: updating a Google Sheet each morning.

## Current status

**Phase 0 — mock store.** The client has not committed yet, so the site falls back to a hardcoded 35-SKU catalog with placeholder photos, placeholder business details, and an amber "MOCK · sample data" ribbon. When Google credentials are present, the same build reads and validates the live sheet. The remaining goal is a deployed pitch URL demonstrating the full edit sheet → refresh → update flow.

| Milestone | Status |
|---|---|
| A — Storefront shell (pages, components, visual system, mock data) | ✅ Done (`v0.5-shell`) |
| C — SEO layer (metadata, JSON-LD, sitemap, robots) | ✅ Done |
| B — Live data pipeline (Google Sheets, `/api/refresh`, cron) | ✅ Done |
| Vercel preview deploy | ⏳ Not started |

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack), TypeScript, server-first React with one client-side opening-hours clock
- **[Tailwind CSS 4](https://tailwindcss.com)** with design tokens defined in `lib/theme.ts` and mirrored in the `@theme` block of `app/globals.css`
- **`next/font`** — [Fraunces](https://fonts.google.com/specimen/Fraunces) (display) + [Inter](https://fonts.google.com/specimen/Inter) (body)
- **[Vitest](https://vitest.dev)** + React Testing Library + jsdom
- **pnpm** as package manager
- Deployment target: **Vercel** (Fluid Compute, `fra1` Frankfurt region for GDPR, Node 24), configured via `vercel.ts` (not `vercel.json`)
- **Google Sheets API** (service account, read-only) with mock fallback; photos in **Vercel Blob**; **Vercel Analytics** (cookieless)

## Getting started

```bash
pnpm install
pnpm dev        # dev server on http://localhost:3000
```

Other commands:

```bash
pnpm build      # production build (all pages prerendered statically)
pnpm start      # serve the production build
pnpm test       # run all Vitest tests once
pnpm test:watch # watch mode
pnpm lint       # ESLint
pnpm tsc --noEmit  # type-check
```

No environment variables are required for a mock build. Live-sheet and deployment settings are documented in `.env.example`:

- `NEXT_PUBLIC_HIDE_MOCK_RIBBON=1` — hides the "MOCK · sample data" ribbon
- `NEXT_PUBLIC_SITE_URL` — canonical origin used in metadata, JSON-LD, and `sitemap.xml` (defaults to `https://manokara-stores.vercel.app`)

## Site structure

| Route | Purpose |
|---|---|
| `/` | Homepage — hero with "Open now" indicator, "Fresh today" featured items, category tiles, visit block |
| `/[category]` | One page per category (`/vegetables`, `/fruits`, `/fish`, `/meat`, `/dry-goods`) with anchor-link filter sections (all / in stock / featured) |
| `/item/[slug]` | One page per SKU — price, unit, origin, stock chip, templated freshness copy, sibling items |
| `/visit` | Address, hours table (today highlighted), phone / WhatsApp / Instagram, transit notes |
| `/sitemap.xml` | All 42 URLs with `lastModified`, via `app/sitemap.ts` |
| `/robots.txt` | Blocks mock data from indexing; allows launch data and points at the sitemap |
| `/api/refresh` | Cron bearer-auth + token-protected manual refresh handler |

Every public page is **fully static** (SSG). `pnpm build` prerenders 42 content pages: 1 homepage + 5 categories + 35 items + 1 visit page.

## Architecture

### Data flow (target state)

```
Google Sheet (source of truth — staff edit each morning)
        │
        │  Google Sheets API (service account, read-only)
        ▼
  lib/catalog.ts  ──►  Zod validation  ──►  normalized Catalog
        │
        │  unstable_cache, tag 'catalog'
        ▼
Static pages  ──►  Vercel Edge CDN
        ▲
        │  revalidateTag('catalog')
        │
  ┌─────┴──────────────────────────┐
  │                                │
Daily Vercel Cron            Manual refresh
(08:30 Europe/Berlin)        GET /api/refresh?t=<token>
                             (bookmarked on shopkeeper's phone)
```

**There is no database.** The Google Sheet *is* the database; normalized data lives only in the tagged Next.js data cache. `getCatalog()` fetches the live sheet when all credentials are configured and otherwise uses `lib/mock-catalog.ts` for the pitch build.

### Sheet schema

| Column | Required | Notes |
|---|---|---|
| `name` | yes | unique, used for the slug |
| `category` | yes | Vegetables / Fruits / Fish / Meat / Dry Goods (validated dropdown) |
| `stock` | yes | `In Stock` / `Low` / `Out of Stock` (validated dropdown) |
| `price` | yes | EUR |
| `unit` | yes | `kg`, `500g`, `piece`, `bunch`, … |
| `origin` | no | e.g. "India", "Sri Lanka", "Alphonso" |
| `photo_url` | no | Vercel Blob URL; only category heroes + featured items get photos |
| `featured` | no | checkbox; drives the homepage "Fresh today" section |

## Project layout

```
app/
  layout.tsx            # fonts, metadataBase + title template, site-wide GroceryStore JSON-LD
  page.tsx              # homepage
  [category]/page.tsx   # category pages (generateStaticParams + generateMetadata)
  item/[slug]/page.tsx  # item pages (Product + BreadcrumbList JSON-LD)
  visit/page.tsx        # visit page
  sitemap.ts            # /sitemap.xml
  robots.ts             # /robots.txt
  globals.css           # Tailwind 4 @theme tokens (mirrors lib/theme.ts)
components/             # one focused component per file
  JsonLd.tsx            # JSON-LD <script> renderer
  TopBar / Wordmark / OpenNow
  ItemCard / StockChip / PhotoPlaceholder / CategoryTile / CategoryHero
  Breadcrumb / FilterBar / MockRibbon / VisitBlock
  HoursTable / ContactRows / TransitNotes
lib/
  schema.ts             # Item, Category, StockLevel, CategoryMeta types
  business.ts           # single source of truth for NAP, hours, contact, transit
  categories.ts         # category metadata (display names, blurbs)
  sheets.ts             # Sheets API client, row normalization, Zod validation
  catalog.ts            # tagged daily cache with credential-free mock fallback
  mock-catalog.ts       # 35-SKU Phase-0 fallback catalog
  copy.ts               # templated item body copy from stock + featured state
  time.ts               # isOpenNow / nextOpenLabel with Europe/Berlin DST handling
  metadata.ts           # metadata + JSON-LD helpers (titles, descriptions, schema.org builders)
  theme.ts              # design tokens: palette, type scale, radii, spacing
tests/                  # mirrors source paths: tests/lib/*, tests/components/*
docs/superpowers/       # design spec + task-by-task implementation plan
plan.md                 # full project design document
CLAUDE.md               # working reference / non-negotiables for AI-assisted development
```

Conventions worth knowing:

- **`lib/business.ts` is the single source of truth** for name, address, phone, hours, WhatsApp, Instagram, and transit notes. It feeds both the UI and the JSON-LD — never duplicate these strings. They must eventually match the Google Business Profile exactly (NAP consistency).
- **No hex colors outside the token files.** All colors come from `lib/theme.ts` / the `@theme` block in `globals.css` via Tailwind classes.
- **Keep files small** — components are one per file; anything growing past ~200 lines gets split.

## SEO

SEO is a primary product goal, not an afterthought:

- **Static HTML everywhere** — Google crawls fully-rendered pages, never a JS shell.
- **Unique `<title>` and meta description per page**, generated from item/category fields (e.g. `Okra (Vendakkai) — €2.80 / kg · Manokara Stores Stuttgart`).
- **JSON-LD on every page**, built by `lib/metadata.ts` and rendered by `components/JsonLd.tsx`:
  - `GroceryStore` + `LocalBusiness` site-wide (address, geo, phone, opening hours)
  - `Product` on item pages with `availability` mapped from stock level (`InStock` / `LimitedAvailability` / `OutOfStock`)
  - `BreadcrumbList` on category and item pages
  - `WebPage` with `dateModified` everywhere (freshness signal)
- **Canonical URLs** and OpenGraph tags on every page.
- **`sitemap.xml`** enumerating every URL with `lastModified`; **`robots.txt`** pointing at it.
- **Lighthouse targets (mobile):** SEO 100, Accessibility 100, Performance ≥ 95.

## Visual system

Hybrid direction: modern editorial layout with warm South-Asian accents.

- **Palette:** turmeric gold accent (`#e3a728`), curry-leaf deep green (`#1f5132`), warm off-white background, deep charcoal text
- **Type:** Fraunces for the wordmark, headlines, and prices; Inter for body copy
- **Stock chips:** green (In stock) / amber (Low) / muted grey (Out) with accessible contrast
- **Photos:** deterministic seeded-gradient placeholders (`PhotoPlaceholder`) until real photography lands in Phase 1

All tokens live in `lib/theme.ts`.

## Testing

```bash
pnpm test
```

The suite (22 files, 60 tests) covers:

- **Logic with full TDD:** `lib/time.ts` (Europe/Berlin open-hours math incl. DST), `lib/copy.ts`, `lib/metadata.ts` (title/description generation, schema.org availability mapping, breadcrumb structure), mock-catalog validation (unique slugs, category counts, stock distribution)
- **Component behavior:** `OpenNow` against fixed dates, `MockRibbon` env-flag toggle, `PhotoPlaceholder` seed determinism, `JsonLd` serialization
- **Smoke renders** for the presentational components
- **Build-as-test:** `pnpm build` succeeding with 42 static pages is itself a verification step

## Roadmap

- **Phase 0 (now):** storefront, live-data pipeline, and SEO foundation are implemented. Remaining: real credentials/content, preview deployment, and deployed refresh/Lighthouse/Rich Results verification.
- **Phase 1 — client onboarding:** real sheet + staff migration, real photos, real business details in `lib/business.ts`, Google Business Profile verification starts, domain purchased.
- **Phase 2 — launch:** custom domain, sitemap submitted to Google Search Console, GBP linked, analytics enabled.
- **Phase 3 — post-launch (explicitly not in v1):** reviews import, newsletter signup, about-the-shop page, further programmatic SEO.

### Environment variables

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEETS_ID` | ID of the inventory sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | service account email |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | service account private key (base64-encoded in Vercel) |
| `REFRESH_TOKEN` | shared secret for the manual refresh URL |
| `CRON_SECRET` | bearer secret automatically sent by Vercel Cron |
| `NEXT_PUBLIC_SITE_URL` | canonical production origin |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (set automatically by the integration) |

## Out of scope for v1

- E-commerce of any kind (cart, checkout, payments, accounts)
- Real-time stock sync — daily refresh + manual button is the requirement
- Multi-language support (English only)
- Per-item photos for all ~100 SKUs (category heroes + ~15–20 featured only)
- Reviews import, newsletter, blog, about page (Phase 3)
- Apps Script webhook push on sheet edits (explicitly rejected)

## GDPR

Hosted in Vercel's `fra1` (Frankfurt) region. Analytics are cookieless (Vercel Analytics), so no consent banner is required for analytics alone. The site sets no third-party cookies.
