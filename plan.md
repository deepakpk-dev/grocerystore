# Manokara Stores — Live Stock Storefront

## Context

**Client:** Manokara Stores — a brick-and-mortar specialty grocer in Stuttgart, Germany, serving primarily the South-Asian / Tamil diaspora community (~100 SKUs across vegetables, fruits, fish, meat, dry goods).

**Problem:** The shop has no digital presence. Customers (some traveling from far away in the Stuttgart/Baden-Württemberg region) have no way to know what's in stock today, and new customers can't find the shop organically via Google.

**Goal:** A read-only storefront website (explicitly **not** e-commerce) that (a) displays live, up-to-date stock pulled from the shop's inventory, and (b) ranks well for local and long-tail grocery searches so new customers discover the shop organically.

**Pitch strategy:** The client has not committed yet. We will first build and host a **mock store** populated with plausible sample data, show them the working experience (edit sheet → tap refresh → site updates), then transition to real data, real photos, a real domain, and a verified Google Business Profile.

**Outcome:** A fast, SEO-strong, nearly-zero-maintenance storefront where the only daily operation is the shop staff updating the existing morning Google Sheet as usual.

---

## Decisions locked in (from brainstorm)

| Decision | Choice |
|---|---|
| Data source | **Google Sheets** (single sheet, morning updates) |
| Update frequency | **Once per morning**, occasional same-day edits |
| Schema | Standard grocery: name, category, stock level, price, unit, origin/variety, photo URL, featured flag |
| Site language | **English only** (diaspora audience) |
| Multilingual product names | **No** (single name per item) |
| Site structure | **Hybrid SEO**: homepage + category pages + per-item pages |
| Google Business Profile | Set up as separate client task from Day 1 (~1–2 weeks postcard verification) |
| "Fresh today" section | **Yes** — driven by `Featured` checkbox in sheet |
| Photos | **Category heroes (~6–10) + featured items (~15–20)**; rest are text-only |
| Stack | **Next.js 16 App Router + Vercel** |
| Region | Pinned to **`fra1` (Frankfurt)** for GDPR |
| Domain | Client will purchase later; use `*.vercel.app` preview for mock phase |
| Visual direction | **Hybrid** — modern layout, warm South-Asian color accents |
| Non-catalog info (v1) | Address + map, hours + "open now", phone + WhatsApp, transit info, Instagram link |
| Refresh mechanism | **Daily Vercel Cron (08:30 Europe/Berlin) + manual token-protected button** on shopkeeper's phone |
| Sheet editor | A staff member on a shop PC |
| Timeline | Soft — mock first, demo to client, iterate |

---

## Architecture

**Runtime:** Next.js 16 App Router, TypeScript, Tailwind CSS, deployed to Vercel (Fluid Compute, Node 24, `fra1` region).

**Data flow:**

```
Google Sheet (source of truth)
        │
        │  Google Sheets API (service account, read-only)
        ▼
  lib/catalog.ts  ──►  Zod validation ──►  normalized Catalog type
        │
        │  cached via unstable_cache with revalidateTag('catalog')
        ▼
Static pages (homepage, /vegetables, /fish, /item/okra, …)  ──►  Vercel Edge CDN
        ▲
        │  revalidateTag('catalog') triggers
        │
  ┌─────┴──────────────────────┐
  │                            │
Daily Cron               Manual /api/refresh
(08:30 Europe/Berlin)    (token-protected, bookmarked on phone)
```

**No database.** The Google Sheet *is* the database. Normalized catalog data lives only in the Next.js data cache (regenerated on refresh). Images live in **Vercel Blob** (public read) — referenced by URL from the sheet.

**Config via `vercel.ts`** (not `vercel.json`) — crons, region, framework.

---

## Data schema (Google Sheet columns)

| Column | Required | Type | Notes |
|---|---|---|---|
| `name` | Yes | text | Unique, used for slug |
| `category` | Yes | enum | Vegetables / Fruits / Fish / Meat / Dry Goods (dropdown via data validation) |
| `stock` | Yes | enum | `In Stock` / `Low` / `Out of Stock` (dropdown) |
| `price` | Yes | number | In EUR |
| `unit` | Yes | text | `kg`, `500g`, `piece`, `bunch` |
| `origin` | No | text | e.g. "India", "Sri Lanka", "Alphonso" |
| `photo_url` | No | URL | Vercel Blob URL; only for featured items + category heros |
| `featured` | No | checkbox | Drives homepage "Fresh today" section |

Sheet hardening: locked header row, data-validation dropdowns on `category` and `stock`, protected ranges so staff cannot accidentally delete columns.

---

## Site structure

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Homepage: hero with "Open now" badge + today's date, "Fresh today" (featured items), category tiles, visit info footer | Static, revalidated on `catalog` tag |
| `/[category]` | One page per category (vegetables, fruits, fish, meat, dry-goods): hero image + all items with stock chips | Static, `generateStaticParams` from category enum |
| `/item/[slug]` | Per-item page: name, stock chip, price/unit, origin, photo if available, "Also in this category" | Static, `generateStaticParams` from sheet rows |
| `/visit` | Address, embedded map, hours, transit directions, phone, WhatsApp, Instagram | Static |
| `/api/refresh` | Token-protected POST/GET endpoint: revalidates `catalog` tag + regenerates sitemap | Serverless function |
| `/sitemap.xml` | Dynamic sitemap enumerating all static URLs | Generated via `app/sitemap.ts` |
| `/robots.txt` | Via `app/robots.ts` | Generated |

---

## SEO strategy (the second main goal)

1. **Static HTML everywhere** — SSG so Google crawls fully-rendered pages, not JS shells.
2. **Structured data (JSON-LD)** on every page:
   - `LocalBusiness` + `GroceryStore` on all pages (address, hours, geo, phone).
   - `Product` on item pages with `availability` (`InStock` / `OutOfStock`) — drives Google rich results.
   - `BreadcrumbList` on category and item pages.
3. **Metadata per page** — unique `<title>` and `<meta description>` generated from item fields.
4. **Dynamic `sitemap.xml`** regenerated on every refresh; resubmitted to Google Search Console after launch.
5. **Freshness signal** — `dateModified` on every page, visible "last updated HH:MM" indicator on homepage.
6. **Internal linking** — category ↔ item ↔ siblings; homepage links to all categories.
7. **Core Web Vitals** — Lighthouse targets: 100 SEO, 100 Accessibility, >95 Performance on homepage + representative item page.
8. **Google Business Profile** — separate client task tracked in this plan; the site links to it and reuses the same `LocalBusiness` schema attributes (NAP consistency).

---

## Refresh pipeline

**Daily cron (primary):**
- `vercel.ts` declares a cron: `{ path: '/api/refresh', schedule: '30 7 * * *' }` (07:30 UTC = 08:30 Europe/Berlin in winter; cron runs in UTC — we adjust at DST boundaries or set schedule to fire twice an hour apart if drift is unacceptable).
- The cron handler calls the same logic as the manual endpoint.

**Manual refresh (safety net):**
- `GET /api/refresh?t=<token>` — token stored in `REFRESH_TOKEN` env var.
- Shopkeeper bookmarks this URL on the shop PC and on a phone.
- Returns a minimal HTML page: "Refreshing… ✓ Updated HH:MM".
- Typical runtime: <3 seconds (fetch sheet + revalidate tag).

Both paths do the same three things:
1. Fetch sheet via Google Sheets API.
2. Validate & normalize rows (skip invalid rows, log to Vercel logs).
3. `revalidateTag('catalog')` — Next.js regenerates affected pages on next request.

---

## Visual design (Hybrid direction)

- **Layout:** Modern structure — generous spacing, strong typographic hierarchy, mobile-first (most customers check on phones).
- **Palette:**
  - Primary accent: **turmeric gold** (`#E3A728`-ish) or **mango orange** — pick during design pass.
  - Secondary: **curry-leaf deep green** for "In Stock" chips and category treatments.
  - Neutrals: warm off-white background, deep charcoal text.
- **Type:** Clean sans (Inter or Geist) for body; a characterful serif or handwritten-feel display face for the brand wordmark and category titles.
- **Stock chips:** Green (In Stock) / Amber (Low) / Grey-red (Out of Stock) — accessible contrast.
- **Photography:** Real produce photos for category heros + 15–20 featured items; no stock photography in final build (flag stock photos as placeholders during mock phase).

---

## Files to be created (critical list)

| Path | Purpose |
|---|---|
| `package.json` | Next.js 16, TypeScript, Tailwind, `googleapis`, `zod` |
| `vercel.ts` | Region `fra1`, cron declaration, framework `nextjs` |
| `app/layout.tsx` | Root layout, fonts, metadata defaults, Vercel Analytics |
| `app/page.tsx` | Homepage |
| `app/[category]/page.tsx` | Category pages (dynamic route) |
| `app/item/[slug]/page.tsx` | Item pages (dynamic, `generateStaticParams` from sheet) |
| `app/visit/page.tsx` | Visit info page |
| `app/api/refresh/route.ts` | Cron + manual refresh handler |
| `app/sitemap.ts` | Dynamic sitemap |
| `app/robots.ts` | robots.txt |
| `lib/sheets.ts` | Google Sheets API client (service account auth) |
| `lib/catalog.ts` | Fetch + normalize + cache catalog (`unstable_cache`, tag `'catalog'`) |
| `lib/schema.ts` | Zod types for `Item`, `Category`, `StockLevel` |
| `lib/business.ts` | Constants: shop name, address, geo, hours, phone, WhatsApp, Instagram, transit notes |
| `lib/metadata.ts` | Shared metadata + JSON-LD helpers (`LocalBusiness`, `Product`, `Breadcrumb`) |
| `components/StockChip.tsx` | Reusable stock status chip |
| `components/ItemCard.tsx` | Reusable item tile (used on homepage + category pages) |
| `components/CategoryHero.tsx` | Category page hero with image + copy |
| `components/OpenNow.tsx` | "Open now / Closed" indicator, computed from `business.hours` |
| `components/VisitBlock.tsx` | Shared footer/visit block (address, hours, phone, WhatsApp, Instagram, map) |

---

## Implementation phases

**Phase 0 — Mock store (us, before client commits):**
1. Register Google Cloud project + service account, enable Sheets API.
2. Create mock sheet with 30–40 plausible SKUs (Tamil/South-Asian produce + fish varieties).
3. Gather 6–10 category hero photos + 15 featured item photos (clearly-flagged stock photography is acceptable for the mock, to be replaced later).
4. Build the site per files-to-create list above.
5. Deploy to Vercel with a preview URL (`manokara-stores.vercel.app` or similar).
6. Demo flow to client: edit sheet → tap refresh → site updates live.

**Phase 1 — Client onboarding (after client says yes):**
1. Start Google Business Profile verification (postcard, ~1–2 weeks).
2. Replace mock sheet with client's real sheet; migrate staff onto the sheet template.
3. Replace mock photos with real shop photography.
4. Fill in real address, hours, phone, WhatsApp, Instagram in `lib/business.ts`.
5. Short training (Loom video) on the morning workflow + refresh button.
6. Client purchases domain.

**Phase 2 — Launch:**
1. Wire custom domain to Vercel.
2. Submit sitemap to Google Search Console.
3. Verify GBP; link from site; ensure NAP consistency with JSON-LD.
4. Enable Vercel Analytics.

**Phase 3 — Post-launch (explicit future work, not in v1):**
- Pull reviews from Google Business Profile.
- "Notify me when fresh fish arrives" newsletter (single-button signup).
- About-the-shop story page.
- More programmatic SEO pages if traffic warrants.

---

## Verification

End-to-end verification to run before declaring each phase done:

1. **Local dev:** `pnpm dev`, load homepage → "Fresh today" section renders items flagged in the mock sheet.
2. **Refresh loop:** Edit the mock sheet (change one item's stock to "Out of Stock") → hit `/api/refresh?t=<token>` → reload homepage and the item's page within 30 seconds → verify chip updates.
3. **Static rendering check:** `curl` the homepage and an item page → response body must contain product name, price, stock status in raw HTML (not hidden behind JS).
4. **Structured data:** Paste homepage + one item URL into [Google Rich Results Test](https://search.google.com/test/rich-results) → `LocalBusiness` and `Product` validate with no errors.
5. **Sitemap:** `curl /sitemap.xml` → enumerates `/`, `/visit`, all categories, all items from the sheet.
6. **Lighthouse (mobile):** Homepage and an item page → Performance ≥95, SEO = 100, Accessibility = 100.
7. **Cron:** Manually trigger the cron in Vercel dashboard → verify it runs and revalidates.
8. **Mobile device check:** Open the preview URL on a real phone → OpenNow indicator, WhatsApp click-to-chat, and Instagram link all work.
9. **GDPR smoke check:** No third-party cookies beyond Vercel Analytics (which is cookieless) → confirm via browser devtools.

---

## Out of scope (explicit)

- E-commerce: no cart, no checkout, no payments, no accounts.
- Real-time sync (daily refresh is the requirement).
- Multi-language (English only).
- Per-item photos for all 100 SKUs (only category heros + ~15–20 featured).
- Customer reviews import, newsletter, blog, "About the shop" page (all Phase 3).
- Automatic sheet-edit webhook via Apps Script (explicitly skipped — daily cron + manual button is enough).
