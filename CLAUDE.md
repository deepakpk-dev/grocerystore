# Manokara Stores — CLAUDE.md

> Always read `plan.md` alongside this file. Plan is the full design doc; this is the working reference.

## Project snapshot

Read-only storefront website for **Manokara Stores**, a South-Asian specialty grocer in **Stuttgart, Germany**. Not e-commerce — the site displays **live inventory** pulled from a Google Sheet. Primary goals: (1) show today's stock, (2) rank for organic local / long-tail search so new customers discover the shop.

Current status: **Phase 0** — building a mock store on a Vercel preview URL to pitch the client. The client has not committed yet.

## Stack

- Next.js 16 (App Router), TypeScript
- Tailwind CSS
- Vercel (Fluid Compute, `fra1` region, Node 24)
- Google Sheets API (service account, read-only) as the data source
- Vercel Blob for photos
- Vercel Analytics (cookieless)
- Project config via **`vercel.ts`** (not `vercel.json`)

## Non-negotiables

- **English only.** Do not add multi-language support without approval.
- **No cart, no checkout, no accounts.** It is a storefront, not a shop.
- **No database.** The Google Sheet IS the database.
- **GDPR:** `fra1` region, cookieless analytics, no consent banner needed for analytics alone.
- **Data freshness:** once per morning is the requirement. Daily cron + manual refresh button is sufficient.
- **Do not add Apps Script webhook sync** — explicitly out of scope.

## Data source

Single Google Sheet with these columns:
`name`, `category`, `stock` (In Stock / Low / Out of Stock), `price`, `unit`, `origin`, `photo_url`, `featured`.

Staff edit on a shop PC. Header row locked; data-validation dropdowns on `category` and `stock`.

## Refresh pipeline

1. **Daily Vercel Cron** (`30 7 * * *` UTC ≈ 08:30 Europe/Berlin) hits `/api/refresh`.
2. **Manual refresh:** shopkeeper taps a bookmarked URL `/api/refresh?t=<REFRESH_TOKEN>`.
3. Both paths fetch the sheet → Zod validate → `revalidateTag('catalog')`.

## Site structure

- `/` — homepage (hero, "Fresh today", category tiles, visit block)
- `/[category]` — one per category (vegetables, fruits, fish, meat, dry-goods)
- `/item/[slug]` — one per SKU (~100)
- `/visit` — address, map, hours, phone, WhatsApp, transit, Instagram
- `/api/refresh` — cron + manual refresh handler
- `/sitemap.xml` via `app/sitemap.ts`
- `/robots.txt` via `app/robots.ts`

## SEO rules

- **Static HTML (SSG)** for all public pages — Google must crawl fully-rendered HTML.
- **JSON-LD** on every page: `LocalBusiness` + `GroceryStore` site-wide; `Product` on item pages with `availability`; `BreadcrumbList` on category/item.
- **Unique `<title>`** and `<meta description>` per page — generate from item fields.
- **`dateModified`** set on every page; visible "last updated" timestamp on homepage.
- **Lighthouse targets:** SEO 100, Accessibility 100, Performance ≥95 (mobile).
- **NAP consistency:** Name/Address/Phone in `lib/business.ts` must match Google Business Profile exactly.

## Visual direction

**Hybrid** — modern layout structure (generous spacing, strong hierarchy, mobile-first) with warm South-Asian color accents.

- Primary accent: turmeric gold or mango orange (finalize in design pass)
- Secondary: curry-leaf deep green (used for "In Stock" chip and category treatments)
- Neutrals: warm off-white background, deep charcoal text
- Body: clean sans (Inter or Geist)
- Display: characterful serif or handwritten-feel face for brand wordmark and category titles
- Stock chips: green (In Stock) / amber (Low) / grey-red (Out of Stock), accessible contrast

## File conventions

- **`lib/business.ts`** — single source of truth for address, hours, phone, WhatsApp, Instagram, transit notes. Reused in JSON-LD and UI. Never duplicate these strings.
- **`lib/schema.ts`** — Zod types for `Item`, `Category`, `StockLevel`.
- **`lib/sheets.ts`** — Google Sheets API client (service account auth).
- **`lib/catalog.ts`** — fetch + normalize + cache catalog using `unstable_cache` with tag `'catalog'`.
- **`lib/metadata.ts`** — shared metadata + JSON-LD helpers.
- **`components/`** — one component per file, focused.
- **Keep files small.** If a file grows beyond ~200 lines, split it.

## Phases

- **Phase 0 (now):** Mock store with sample data, placeholder photos, preview URL. For client pitch.
- **Phase 1:** Client onboarding — real sheet, real photos, real hours, GBP verification starts, domain purchased.
- **Phase 2:** Launch on custom domain; submit sitemap to Google Search Console.
- **Phase 3 (later, not in v1):** Reviews import, newsletter, about-the-shop page, more programmatic SEO.

## Out of scope (don't build these in v1)

- E-commerce functionality of any kind.
- Customer accounts, login, favorites.
- Real-time stock sync.
- Per-item photos for all 100 SKUs (only category heros + ~15–20 featured).
- Multi-language.
- Customer reviews import, newsletter, blog, "About" story page.
- Apps Script webhook for sheet-edit push.

## Environment variables

- `GOOGLE_SHEETS_ID` — the sheet ID.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — service account email.
- `GOOGLE_SERVICE_ACCOUNT_KEY` — service account private key (base64-encoded in Vercel env).
- `REFRESH_TOKEN` — shared secret for the manual refresh URL.
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob, set automatically when integration is linked.

## Commands (once scaffolded)

- `pnpm dev` — local dev
- `pnpm build` — production build
- `pnpm lint` — lint
- `vercel deploy` — preview deploy
- `vercel deploy --prod` — production deploy
- `vercel env pull` — sync env vars to `.env.local`

## Verification checklist before declaring a phase done

1. `pnpm dev` renders homepage with "Fresh today" section from sheet.
2. Edit sheet → hit `/api/refresh?t=<token>` → affected pages update within 30s.
3. `curl` homepage + item page — product info must be in raw HTML.
4. Google Rich Results Test passes for `LocalBusiness` and `Product`.
5. `/sitemap.xml` enumerates all categories and items.
6. Lighthouse (mobile) — SEO 100, Accessibility 100, Performance ≥95.
7. Test on real phone — WhatsApp link, Instagram link, Open Now indicator all work.
8. No third-party cookies in browser devtools.
