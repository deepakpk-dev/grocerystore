# Storefront shell + visual system — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Manokara Stores sub-project A v0.5 — a Next.js 16 app with locked editorial visual system and four page types rendering from a hardcoded mock catalog. No live data, no SEO finalization, no deploy. End state: homepage looks pitchable to a prospective client; `pnpm build` produces 42 static pages with zero errors.

**Architecture:** Next.js 16 App Router + TypeScript + Tailwind. Single source of theme tokens in `lib/theme.ts` consumed by `tailwind.config.ts`. All data hardcoded in `lib/mock-catalog.ts`, `lib/business.ts`, `lib/categories.ts`. Build philosophy is β — homepage assembled inline first, components extracted by rule-of-two as later pages need them. Server components throughout; no client components in v0.5.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, `next/font` (Fraunces + Inter), Vitest + React Testing Library + jsdom for tests. Package manager: pnpm.

**Spec reference:** `docs/superpowers/specs/2026-04-25-storefront-shell-design.md`

---

## File structure

Files are created in this order. Each task lists exactly which files it creates or modifies.

```
manokara-stores/
├── app/
│   ├── layout.tsx              # Task 12
│   ├── globals.css             # Task 12
│   ├── page.tsx                # Task 13 (inline), Task 23 (refactored)
│   ├── [category]/page.tsx     # Task 27
│   ├── item/[slug]/page.tsx    # Task 29
│   └── visit/page.tsx          # Task 33
├── components/
│   ├── MockRibbon.tsx          # Task 14
│   ├── Wordmark.tsx            # Task 15
│   ├── OpenNow.tsx             # Task 16
│   ├── TopBar.tsx              # Task 17
│   ├── StockChip.tsx           # Task 18
│   ├── PhotoPlaceholder.tsx    # Task 19
│   ├── ItemCard.tsx            # Task 20, compact variant Task 28
│   ├── CategoryTile.tsx        # Task 21
│   ├── VisitBlock.tsx          # Task 22
│   ├── CategoryHero.tsx        # Task 24
│   ├── Breadcrumb.tsx          # Task 25
│   ├── FilterBar.tsx           # Task 26
│   ├── HoursTable.tsx          # Task 30
│   ├── ContactRows.tsx         # Task 31
│   └── TransitNotes.tsx        # Task 32
├── lib/
│   ├── schema.ts               # Task 6
│   ├── business.ts             # Task 7
│   ├── categories.ts           # Task 8
│   ├── mock-catalog.ts         # Task 9
│   ├── copy.ts                 # Task 10
│   ├── time.ts                 # Task 11
│   └── theme.ts                # Task 4
├── tailwind.config.ts          # Task 5
├── vitest.config.ts            # Task 2
├── vitest.setup.ts             # Task 2
├── next.config.ts              # Task 1 (auto)
├── postcss.config.js           # Task 1 (auto)
├── tsconfig.json               # Task 1 (auto)
├── package.json                # Task 1 (auto), Task 2 + 3 (modify)
├── pnpm-lock.yaml              # Task 1 (auto)
├── .env.local.example          # Task 14
└── .gitignore                  # Task 1 (auto), Task 2 (modify: add .superpowers/)
```

**Test files** mirror the source path under `tests/`:
- `tests/lib/time.test.ts` (Task 11)
- `tests/lib/copy.test.ts` (Task 10)
- `tests/lib/mock-catalog.test.ts` (Task 9)
- `tests/components/<Component>.test.tsx` for each tested component

---

## Test strategy

**TDD applies to logic, not pure presentation.** Pragmatic split:
- **Full TDD** for `lib/time.ts`, `lib/copy.ts`, `lib/mock-catalog.ts` validation, `<OpenNow>`, `<PhotoPlaceholder>` (deterministic seed), `<MockRibbon>` (env flag).
- **Smoke render test** for purely presentational components (asserts component mounts and renders expected text).
- **Build-as-test** for pages: `pnpm build` succeeding with the expected static-page count is the verification.

**Test runner:** Vitest (fast, ESM-native, jest-compatible API). React Testing Library for component DOM assertions.

**Common test commands** used throughout this plan:
- `pnpm test` — run all tests once
- `pnpm test <file>` — run a single file
- `pnpm test --watch` — watch mode (useful during iteration)
- `pnpm tsc --noEmit` — type-check without emitting
- `pnpm build` — full production build

---

## Task 1: Initialize Next.js project

**Files:**
- Create: full project skeleton via `create-next-app`

- [ ] **Step 1: Run the scaffolder**

From the project root directory (the one containing `CLAUDE.md` and `plan.md`):

```bash
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --turbopack \
  --skip-install
```

When the scaffolder asks whether to continue with non-empty directory: **yes** (it preserves `CLAUDE.md`, `plan.md`, and the `docs/` tree).

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 3: Verify dev server starts**

```bash
pnpm dev
```

Expected: dev server listens on `http://localhost:3000`; opening it shows the default Next.js starter. Stop the server (Ctrl+C) once verified.

- [ ] **Step 4: Verify production build**

```bash
pnpm build
```

Expected: build completes with one route (`/`) reported. No errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with TypeScript and Tailwind"
```

---

## Task 2: Install and configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add scripts and devDependencies)
- Modify: `.gitignore` (append `.superpowers/`)

- [ ] **Step 1: Install test dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `scripts` block of `package.json`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Append `.superpowers/` to `.gitignore`**

Append a single line:

```
.superpowers/
```

- [ ] **Step 6: Verify Vitest runs (with no tests yet)**

```bash
pnpm test
```

Expected: Vitest exits cleanly with "No test files found" — confirms wiring works.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest + React Testing Library + jsdom"
```

---

## Task 3: Wire next/font for Fraunces + Inter

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the default font setup in `app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manokara Stores',
  description: 'Fresh South-Asian groceries · Stuttgart',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server still renders**

```bash
pnpm dev
```

Expected: page renders without errors. Inspect the `<html>` element in DevTools — it should have both `--font-display` and `--font-body` CSS variables set. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "chore: wire Fraunces + Inter via next/font"
```

---

## Task 4: Create theme tokens in lib/theme.ts

**Files:**
- Create: `lib/theme.ts`

- [ ] **Step 1: Write `lib/theme.ts`**

```ts
export const colors = {
  bg: '#faf9f6',
  surface: '#ffffff',
  text: '#1a1a1a',
  'text-muted': '#6b6b66',
  'text-subtle': '#a8a59f',
  line: '#ebe9e3',
  accent: '#e3a728',
  'accent-deep': '#b87f12',
  deep: '#1f5132',
  warm: '#c2410c',
  'chip-in-bg': '#e7efe9',
  'chip-in-text': '#1f5132',
  'chip-low-bg': '#fbeed0',
  'chip-low-text': '#7a5410',
  'chip-low-dot': '#b87f12',
  'chip-out-bg': '#f1efeb',
  'chip-out-text': '#807a72',
  'chip-out-dot': '#b9b3aa',
} as const;

export const fontFamily = {
  display: ['var(--font-display)', 'Georgia', 'serif'],
  body: ['var(--font-body)', 'system-ui', 'sans-serif'],
} as const;

export const fontSize = {
  'display-xl': ['56px', { lineHeight: '1', letterSpacing: '-0.02em' }],
  'display-l':  ['40px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  'display-m':  ['28px', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
  h2:           ['22px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  h3:           ['17px', { lineHeight: '1.3' }],
  body:         ['16px', { lineHeight: '1.55' }],
  small:        ['14px', { lineHeight: '1.5' }],
  caption:      ['12px', { lineHeight: '1.4' }],
  label:        ['11px', { lineHeight: '1', letterSpacing: '0.12em' }],
} as const;

export const borderRadius = {
  chip: '9999px',
  button: '10px',
  card: '14px',
} as const;

export const spacing = {
  section: '6rem',
} as const;
```

- [ ] **Step 2: Type-check passes**

```bash
pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/theme.ts
git commit -m "feat: add theme tokens for palette, typography, radius, spacing"
```

---

## Task 5: Wire Tailwind to consume theme tokens

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';
import { colors, fontFamily, fontSize, borderRadius, spacing } from './lib/theme';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      borderRadius,
      spacing,
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update `app/globals.css`**

Replace the file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  background-color: theme('colors.bg');
  color: theme('colors.text');
  font-family: theme('fontFamily.body');
}

h1, h2, h3 {
  font-family: theme('fontFamily.display');
}
```

- [ ] **Step 3: Smoke test the theme by setting body background**

Open the app on `pnpm dev` — body should be `#faf9f6` (warm off-white), not white. Default text should be in Inter (sans-serif). Stop the server.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: wire tailwind to consume lib/theme tokens"
```

---

## Task 6: Create lib/schema.ts

**Files:**
- Create: `lib/schema.ts`

- [ ] **Step 1: Write the file**

```ts
export type Category = 'vegetables' | 'fruits' | 'fish' | 'meat' | 'dry-goods';

export type StockLevel = 'in-stock' | 'low' | 'out-of-stock';

export type Item = {
  slug: string;
  name: string;
  tamil?: string;
  category: Category;
  stock: StockLevel;
  price: number;
  unit: string;
  origin?: string;
  featured?: boolean;
};

export type CategoryMeta = {
  slug: Category;
  display: string;
  blurb: string;
};
```

- [ ] **Step 2: Type-check passes**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/schema.ts
git commit -m "feat: add Item, Category, StockLevel, CategoryMeta types"
```

---

## Task 7: Create lib/business.ts

**Files:**
- Create: `lib/business.ts`

- [ ] **Step 1: Write the file**

```ts
export type Hours = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  { open: string; close: string } | null
>;

export const business = {
  name: 'Manokara Stores',
  isMock: true,
  address: {
    street: 'Mustermannstraße 1',
    postal: '70173',
    city: 'Stuttgart',
    country: 'DE',
  },
  geo: { lat: 48.7758, lng: 9.1829 },
  hours: {
    mon: { open: '09:00', close: '20:00' },
    tue: { open: '09:00', close: '20:00' },
    wed: { open: '09:00', close: '20:00' },
    thu: { open: '09:00', close: '20:00' },
    fri: { open: '09:00', close: '20:00' },
    sat: { open: '09:00', close: '20:00' },
    sun: null,
  } satisfies Hours,
  phone: '+49 711 000 000',
  whatsapp: '+4971100000',
  instagram: 'manokara.stores',
  transit: [
    'S-Bahn Hauptbahnhof — 6 min walk',
    'U-Bahn Charlottenplatz — 4 min walk',
    'Free 30-min street parking on Marienstraße',
  ],
} as const;
```

- [ ] **Step 2: Type-check passes**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/business.ts
git commit -m "feat: add placeholder Stuttgart business info (isMock=true)"
```

---

## Task 8: Create lib/categories.ts

**Files:**
- Create: `lib/categories.ts`

- [ ] **Step 1: Write the file**

```ts
import type { CategoryMeta } from './schema';

export const categories: readonly CategoryMeta[] = [
  {
    slug: 'vegetables',
    display: 'Vegetables',
    blurb: 'South Indian gourds, leafy greens, and roots — restocked weekly.',
  },
  {
    slug: 'fruits',
    display: 'Fruits',
    blurb: 'Seasonal mangoes, tropical fruits, and household staples.',
  },
  {
    slug: 'fish',
    display: 'Fish',
    blurb: 'Fresh and frozen — ask the counter for today’s catch.',
  },
  {
    slug: 'meat',
    display: 'Meat',
    blurb: 'Halal goat, mutton, and chicken cut to order for curry and biryani.',
  },
  {
    slug: 'dry-goods',
    display: 'Dry goods',
    blurb: 'Rice, dals, spices, and pantry essentials for South Asian cooking.',
  },
] as const;

export const categoryBySlug = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<CategoryMeta['slug'], CategoryMeta>;
```

- [ ] **Step 2: Type-check passes**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/categories.ts
git commit -m "feat: add categories meta with display names and blurbs"
```

---

## Task 9: Create lib/mock-catalog.ts with validation tests

**Files:**
- Create: `lib/mock-catalog.ts`
- Create: `tests/lib/mock-catalog.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/mock-catalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mockCatalog } from '@/lib/mock-catalog';
import { categories } from '@/lib/categories';

describe('mockCatalog', () => {
  it('contains 35 items', () => {
    expect(mockCatalog).toHaveLength(35);
  });

  it('has unique slugs', () => {
    const slugs = mockCatalog.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses only known category slugs', () => {
    const known = new Set(categories.map((c) => c.slug));
    for (const item of mockCatalog) {
      expect(known.has(item.category)).toBe(true);
    }
  });

  it('has at least 6 featured items', () => {
    const featured = mockCatalog.filter((i) => i.featured);
    expect(featured.length).toBeGreaterThanOrEqual(6);
  });

  it('has the expected category counts', () => {
    const counts = mockCatalog.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      vegetables: 10,
      fruits: 6,
      fish: 5,
      meat: 3,
      'dry-goods': 11,
    });
  });

  it('has prices > 0 for every item', () => {
    for (const item of mockCatalog) {
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it('has stock distribution roughly 70/20/10', () => {
    const counts = mockCatalog.reduce<Record<string, number>>((acc, i) => {
      acc[i.stock] = (acc[i.stock] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts['in-stock']).toBeGreaterThanOrEqual(20);
    expect(counts['out-of-stock']).toBeGreaterThanOrEqual(2);
    expect(counts['low']).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/lib/mock-catalog.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/mock-catalog'`.

- [ ] **Step 3: Write `lib/mock-catalog.ts`**

```ts
import type { Item } from './schema';

export const mockCatalog: readonly Item[] = [
  // === Vegetables (10) ===
  { slug: 'okra', name: 'Okra', tamil: 'Vendakkai', category: 'vegetables', stock: 'in-stock', price: 2.80, unit: 'kg', origin: 'India', featured: true },
  { slug: 'bitter-gourd', name: 'Bitter gourd', tamil: 'Pavakkai', category: 'vegetables', stock: 'in-stock', price: 3.20, unit: 'kg', origin: 'India', featured: true },
  { slug: 'drumstick', name: 'Drumstick', tamil: 'Murungakkai', category: 'vegetables', stock: 'low', price: 4.10, unit: 'bunch', origin: 'India' },
  { slug: 'ridge-gourd', name: 'Ridge gourd', tamil: 'Peerkangai', category: 'vegetables', stock: 'in-stock', price: 2.40, unit: 'kg', origin: 'India' },
  { slug: 'snake-gourd', name: 'Snake gourd', tamil: 'Pudalangai', category: 'vegetables', stock: 'in-stock', price: 3.00, unit: 'kg', origin: 'India' },
  { slug: 'curry-leaves', name: 'Curry leaves', tamil: 'Karuvepilai', category: 'vegetables', stock: 'in-stock', price: 1.40, unit: 'bunch', origin: 'Sri Lanka', featured: true },
  { slug: 'banana-flower', name: 'Banana flower', tamil: 'Vazhaipoo', category: 'vegetables', stock: 'low', price: 3.80, unit: 'piece', origin: 'India' },
  { slug: 'plantain', name: 'Plantain', tamil: 'Vazhaikkai', category: 'vegetables', stock: 'in-stock', price: 2.20, unit: 'kg', origin: 'India' },
  { slug: 'ash-gourd', name: 'Ash gourd', tamil: 'Pusinikkai', category: 'vegetables', stock: 'out-of-stock', price: 2.60, unit: 'kg', origin: 'India' },
  { slug: 'taro-root', name: 'Taro root', tamil: 'Cheppankizhangu', category: 'vegetables', stock: 'in-stock', price: 3.50, unit: 'kg', origin: 'India' },

  // === Fruits (6) ===
  { slug: 'alphonso-mango', name: 'Alphonso mango', category: 'fruits', stock: 'in-stock', price: 4.90, unit: 'kg', origin: 'India · Alphonso', featured: true },
  { slug: 'guava', name: 'Guava', tamil: 'Koyya', category: 'fruits', stock: 'in-stock', price: 3.40, unit: 'kg', origin: 'Thailand' },
  { slug: 'custard-apple', name: 'Custard apple', tamil: 'Seethaaphalam', category: 'fruits', stock: 'low', price: 5.20, unit: 'kg', origin: 'India' },
  { slug: 'papaya', name: 'Papaya', category: 'fruits', stock: 'in-stock', price: 2.10, unit: 'kg', origin: 'Brazil' },
  { slug: 'jackfruit', name: 'Jackfruit', tamil: 'Palapazham', category: 'fruits', stock: 'out-of-stock', price: 6.80, unit: 'kg', origin: 'Sri Lanka' },
  { slug: 'lime', name: 'Lime', tamil: 'Elumichai', category: 'fruits', stock: 'in-stock', price: 0.80, unit: 'piece', origin: 'India' },

  // === Fish (5) ===
  { slug: 'tilapia', name: 'Tilapia', category: 'fish', stock: 'in-stock', price: 8.20, unit: 'kg', origin: 'frozen', featured: true },
  { slug: 'king-fish', name: 'King fish', tamil: 'Vanjaram', category: 'fish', stock: 'in-stock', price: 14.50, unit: 'kg', origin: 'frozen' },
  { slug: 'seer', name: 'Seer fish', category: 'fish', stock: 'low', price: 12.90, unit: 'kg', origin: 'frozen' },
  { slug: 'sardine', name: 'Sardine', tamil: 'Mathi', category: 'fish', stock: 'in-stock', price: 5.40, unit: 'kg', origin: 'frozen' },
  { slug: 'prawn', name: 'Prawn', tamil: 'Eral', category: 'fish', stock: 'in-stock', price: 16.80, unit: 'kg', origin: 'frozen' },

  // === Meat (3) ===
  { slug: 'goat-curry-cut', name: 'Goat curry cut', category: 'meat', stock: 'in-stock', price: 18.90, unit: 'kg', origin: 'halal' },
  { slug: 'chicken-curry-cut', name: 'Chicken curry cut', category: 'meat', stock: 'in-stock', price: 9.80, unit: 'kg', origin: 'halal' },
  { slug: 'mutton-chops', name: 'Mutton chops', category: 'meat', stock: 'low', price: 22.40, unit: 'kg', origin: 'halal' },

  // === Dry goods (11) ===
  { slug: 'basmati-rice', name: 'Basmati rice', category: 'dry-goods', stock: 'in-stock', price: 4.20, unit: '1kg', origin: 'India', featured: true },
  { slug: 'idly-rice', name: 'Idly rice', category: 'dry-goods', stock: 'in-stock', price: 3.80, unit: '1kg', origin: 'India' },
  { slug: 'urad-dal', name: 'Urad dal', tamil: 'Ulundu', category: 'dry-goods', stock: 'in-stock', price: 3.20, unit: '500g', origin: 'India' },
  { slug: 'toor-dal', name: 'Toor dal', tamil: 'Thuvaram paruppu', category: 'dry-goods', stock: 'in-stock', price: 2.90, unit: '500g', origin: 'India' },
  { slug: 'mustard-seeds', name: 'Mustard seeds', tamil: 'Kadugu', category: 'dry-goods', stock: 'in-stock', price: 1.80, unit: '200g', origin: 'India' },
  { slug: 'fenugreek', name: 'Fenugreek seeds', tamil: 'Vendhayam', category: 'dry-goods', stock: 'in-stock', price: 1.60, unit: '200g', origin: 'India' },
  { slug: 'asafoetida', name: 'Asafoetida', tamil: 'Perungayam', category: 'dry-goods', stock: 'low', price: 4.50, unit: '50g', origin: 'India' },
  { slug: 'tamarind', name: 'Tamarind', tamil: 'Puli', category: 'dry-goods', stock: 'in-stock', price: 2.40, unit: '500g', origin: 'India' },
  { slug: 'jaggery-block', name: 'Jaggery block', tamil: 'Vellam', category: 'dry-goods', stock: 'in-stock', price: 3.10, unit: '500g', origin: 'India' },
  { slug: 'coconut', name: 'Coconut', tamil: 'Thengai', category: 'dry-goods', stock: 'in-stock', price: 2.20, unit: 'piece', origin: 'Sri Lanka' },
  { slug: 'mtr-rasam-powder', name: 'MTR rasam powder', category: 'dry-goods', stock: 'in-stock', price: 3.60, unit: '200g', origin: 'India' },
];
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/lib/mock-catalog.test.ts
```

Expected: PASS — all 7 assertions green.

- [ ] **Step 5: Commit**

```bash
git add lib/mock-catalog.ts tests/lib/mock-catalog.test.ts
git commit -m "feat: add 35-SKU mock catalog with validation tests"
```

---

## Task 10: Create lib/copy.ts with templated body strings

**Files:**
- Create: `lib/copy.ts`
- Create: `tests/lib/copy.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { itemBody } from '@/lib/copy';

describe('itemBody', () => {
  it('renders an in-stock item without featured flag', () => {
    const lines = itemBody({ stock: 'in-stock', featured: false });
    expect(lines).toEqual(['Restocked this morning.']);
  });

  it('renders a low-stock item', () => {
    const lines = itemBody({ stock: 'low', featured: false });
    expect(lines).toEqual(['Limited stock today.']);
  });

  it('renders an out-of-stock item', () => {
    const lines = itemBody({ stock: 'out-of-stock', featured: false });
    expect(lines).toEqual(['Out of stock — check back tomorrow.']);
  });

  it('appends "Featured this week." for featured items', () => {
    const lines = itemBody({ stock: 'in-stock', featured: true });
    expect(lines).toEqual(['Restocked this morning.', 'Featured this week.']);
  });

  it('does not append featured line for out-of-stock items', () => {
    const lines = itemBody({ stock: 'out-of-stock', featured: true });
    expect(lines).toEqual(['Out of stock — check back tomorrow.']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/lib/copy.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/copy'`.

- [ ] **Step 3: Implement `lib/copy.ts`**

```ts
import type { StockLevel } from './schema';

const STOCK_LINES: Record<StockLevel, string> = {
  'in-stock': 'Restocked this morning.',
  low: 'Limited stock today.',
  'out-of-stock': 'Out of stock — check back tomorrow.',
};

export function itemBody(input: { stock: StockLevel; featured?: boolean }): string[] {
  const lines = [STOCK_LINES[input.stock]];
  if (input.featured && input.stock !== 'out-of-stock') {
    lines.push('Featured this week.');
  }
  return lines;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/lib/copy.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/copy.ts tests/lib/copy.test.ts
git commit -m "feat: add itemBody copy helper with stock and featured logic"
```

---

## Task 11: Create lib/time.ts with isOpenNow

**Files:**
- Create: `lib/time.ts`
- Create: `tests/lib/time.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isOpenNow, nextOpenLabel } from '@/lib/time';
import type { Hours } from '@/lib/business';

const STANDARD_HOURS: Hours = {
  mon: { open: '09:00', close: '20:00' },
  tue: { open: '09:00', close: '20:00' },
  wed: { open: '09:00', close: '20:00' },
  thu: { open: '09:00', close: '20:00' },
  fri: { open: '09:00', close: '20:00' },
  sat: { open: '09:00', close: '20:00' },
  sun: null,
};

// Berlin is UTC+1 in winter, UTC+2 in summer.
// 2026-04-25 (Saturday) is in summer time → Berlin = UTC+2.
// 2026-01-10 (Saturday) is in winter time → Berlin = UTC+1.

describe('isOpenNow', () => {
  it('returns true on Saturday at 14:00 Berlin time (summer DST)', () => {
    // 14:00 Berlin = 12:00 UTC on 2026-04-25
    const now = new Date('2026-04-25T12:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(true);
  });

  it('returns false on Sunday afternoon', () => {
    // 14:00 Berlin = 12:00 UTC on 2026-04-26 (Sun)
    const now = new Date('2026-04-26T12:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('returns false at 08:00 Berlin time (before open)', () => {
    // 08:00 Berlin = 06:00 UTC on 2026-04-25 (Sat, summer)
    const now = new Date('2026-04-25T06:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('returns false at 20:30 Berlin time (after close)', () => {
    // 20:30 Berlin = 18:30 UTC on 2026-04-25
    const now = new Date('2026-04-25T18:30:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('handles winter time correctly (UTC+1)', () => {
    // Saturday 2026-01-10 at 14:00 Berlin = 13:00 UTC
    const now = new Date('2026-01-10T13:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(true);
  });
});

describe('nextOpenLabel', () => {
  it('returns "Closes 8pm" when open', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat 14:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Open · closes 8pm');
  });

  it('returns "Opens Monday 9am" on Sunday afternoon', () => {
    const now = new Date('2026-04-26T12:00:00Z'); // Sun 14:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Closed · opens Mon 9am');
  });

  it('returns "Opens 9am" on Saturday before open', () => {
    const now = new Date('2026-04-25T05:00:00Z'); // Sat 07:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Closed · opens 9am');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/lib/time.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/time'`.

- [ ] **Step 3: Implement `lib/time.ts`**

```ts
import type { Hours } from './business';

type DayKey = keyof Hours;

const DAY_ORDER: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function getBerlinParts(now: Date): { day: DayKey; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minuteStr = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const day = weekday.toLowerCase().slice(0, 3) as DayKey;
  const minutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
  return { day, minutes };
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function formatHourLabel(hhmm: string): string {
  const [h] = hhmm.split(':').map((n) => parseInt(n, 10));
  const period = h >= 12 ? 'pm' : 'am';
  const display = h % 12 || 12;
  return `${display}${period}`;
}

export function isOpenNow(hours: Hours, now: Date = new Date()): boolean {
  const { day, minutes } = getBerlinParts(now);
  const today = hours[day];
  if (!today) return false;
  return minutes >= hhmmToMinutes(today.open) && minutes < hhmmToMinutes(today.close);
}

export function nextOpenLabel(hours: Hours, now: Date = new Date()): string {
  const { day, minutes } = getBerlinParts(now);
  const today = hours[day];

  if (today && minutes >= hhmmToMinutes(today.open) && minutes < hhmmToMinutes(today.close)) {
    return `Open · closes ${formatHourLabel(today.close)}`;
  }

  // If still before today's open, that's our next opening.
  if (today && minutes < hhmmToMinutes(today.open)) {
    return `Closed · opens ${formatHourLabel(today.open)}`;
  }

  // Otherwise scan forward for the next open day.
  const startIdx = DAY_ORDER.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = DAY_ORDER[(startIdx + i) % 7];
    const slot = hours[next];
    if (slot) {
      return `Closed · opens ${DAY_LABELS[next]} ${formatHourLabel(slot.open)}`;
    }
  }
  return 'Closed';
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test tests/lib/time.test.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/time.ts tests/lib/time.test.ts
git commit -m "feat: add isOpenNow and nextOpenLabel with Europe/Berlin DST handling"
```

---

## Task 12: Root layout with theme + globals already wired

**Files:**
- Modify: `app/layout.tsx` (already mostly done in Task 3)

- [ ] **Step 1: Adjust `app/layout.tsx`**

Replace with:

```tsx
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manokara Stores · Fresh South-Asian groceries · Stuttgart',
  description:
    'Live stock from a Stuttgart South-Asian specialty grocer — vegetables, fruits, fish, meat, and dry goods. Updated each morning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server**

```bash
pnpm dev
```

Open `http://localhost:3000` — page renders with warm off-white body. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: tighten root layout with metadata and theme classes"
```

---

## Task 13: Homepage assembled inline

**Files:**
- Replace: `app/page.tsx`

This task assembles the entire homepage in one file with no component extraction. **This is intentional** — the build philosophy is β (one page end-to-end, then propagate). Components are extracted in tasks 14–22 once we have a real page to extract from.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from 'next/link';
import { business } from '@/lib/business';
import { categories } from '@/lib/categories';
import { mockCatalog } from '@/lib/mock-catalog';
import { nextOpenLabel } from '@/lib/time';

const STOCK_VARIANTS = {
  'in-stock': { label: 'In stock', cls: 'bg-chip-in-bg text-chip-in-text', dot: 'bg-chip-in-text' },
  low: { label: 'Low', cls: 'bg-chip-low-bg text-chip-low-text', dot: 'bg-chip-low-dot' },
  'out-of-stock': { label: 'Out', cls: 'bg-chip-out-bg text-chip-out-text', dot: 'bg-chip-out-dot' },
} as const;

function placeholderGradient(seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const angle = h % 360;
  return `linear-gradient(${angle}deg, #2d4a2d 0%, #4a7c4a 80%)`;
}

export default function Home() {
  const featured = mockCatalog.filter((i) => i.featured).slice(0, 6);
  const inStockCount = mockCatalog.filter((i) => i.stock === 'in-stock').length;
  const updated = '08:32';
  const showRibbon = process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON !== '1';

  return (
    <>
      {showRibbon && (
        <div className="bg-chip-low-bg text-chip-low-text text-[10px] tracking-[0.14em] uppercase font-semibold text-center py-1">
          Mock · sample data
        </div>
      )}

      <header className="flex justify-between items-center px-5 md:px-8 py-4 border-b border-line">
        <Link href="/" className="font-display text-h2">{business.name.split(' ')[0]}</Link>
        <span className="text-label uppercase text-deep font-semibold">
          ● {nextOpenLabel(business.hours)}
        </span>
      </header>

      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <section className="pt-12 md:pt-20 pb-12">
          <h1 className="font-display text-display-l md:text-display-xl">
            Fresh<br/>this morning.
          </h1>
          <p className="text-body text-text-muted mt-4 max-w-md">
            South-Asian groceries restocked at {updated} · {inStockCount} items in stock today.
          </p>
          <div
            className="mt-8 rounded-card aspect-[16/9] md:aspect-[2/1]"
            style={{ background: placeholderGradient('home-hero') }}
          />
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">Fresh today · {featured.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((item) => {
              const variant = STOCK_VARIANTS[item.stock];
              return (
                <Link
                  key={item.slug}
                  href={`/item/${item.slug}`}
                  className="block bg-surface border border-line rounded-card overflow-hidden"
                >
                  <div
                    className="aspect-[4/3]"
                    style={{ background: placeholderGradient(item.slug) }}
                  />
                  <div className="p-4">
                    <div className="font-display text-h2">{item.name}</div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-caption text-text-muted">{item.tamil ?? ' '}</span>
                      <span className="text-small font-semibold">
                        €{item.price.toFixed(2)}
                        <span className="text-caption text-text-subtle font-normal"> / {item.unit}</span>
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-chip text-caption font-semibold ${variant.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`}/>
                      {variant.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">Browse</p>
          <div className="grid gap-2">
            {categories.map((cat) => {
              const count = mockCatalog.filter((i) => i.category === cat.slug).length;
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="flex justify-between items-baseline bg-surface border border-line rounded-card p-4 hover:border-accent transition-colors"
                >
                  <span className="font-display text-h2">{cat.display}</span>
                  <span className="text-caption text-text-subtle">{count} items</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-text text-bg rounded-card p-6 mt-12">
          <p className="font-display text-display-m mb-3">Visit</p>
          <p className="text-body">{business.address.street}</p>
          <p className="text-body text-bg/70">{business.address.postal} {business.address.city}</p>
          <p className="text-small text-bg/70 mt-3">Mon–Sat 09:00–20:00 · Sun closed</p>
          <div className="flex gap-4 mt-4 text-small">
            <a href={`tel:${business.phone}`} className="underline">Call</a>
            <a href={`https://wa.me/${business.whatsapp.replace('+', '')}`} className="underline">WhatsApp</a>
            <a href={`https://instagram.com/${business.instagram}`} className="underline">Instagram</a>
          </div>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Run dev server, eyeball at mobile + desktop**

```bash
pnpm dev
```

Open `http://localhost:3000` at viewport widths 375px and 1280px. Expected:
- Mock ribbon visible at top in amber
- Wordmark left, "Open · closes 8pm" right
- Display-XL "Fresh this morning." headline
- Gradient hero
- 6 featured cards in a 2-col (mobile) / 3-col (desktop) grid with stock chips
- 5 category tiles
- Dark visit block at the bottom

Stop the server.

- [ ] **Step 3: Run a build to make sure nothing regressed**

```bash
pnpm build
```

Expected: build completes, reports `/` as static.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble homepage end-to-end (inline, pre-extraction)"
```

---

## Task 14: Extract MockRibbon

**Files:**
- Create: `components/MockRibbon.tsx`
- Create: `tests/components/MockRibbon.test.tsx`
- Create: `.env.local.example`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockRibbon } from '@/components/MockRibbon';

describe('MockRibbon', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON;
  });

  it('renders the ribbon by default', () => {
    render(<MockRibbon />);
    expect(screen.getByText(/mock · sample data/i)).toBeInTheDocument();
  });

  it('renders nothing when hidden flag is set', () => {
    process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON = '1';
    const { container } = render(<MockRibbon />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/MockRibbon.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/MockRibbon'`.

- [ ] **Step 3: Implement `components/MockRibbon.tsx`**

```tsx
export function MockRibbon() {
  if (process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON === '1') return null;
  return (
    <div className="bg-chip-low-bg text-chip-low-text text-[10px] tracking-[0.14em] uppercase font-semibold text-center py-1">
      Mock · sample data
    </div>
  );
}
```

- [ ] **Step 4: Create `.env.local.example`**

```
# Set to "1" in production to hide the "MOCK · sample data" ribbon
NEXT_PUBLIC_HIDE_MOCK_RIBBON=
```

- [ ] **Step 5: Use the component in `app/page.tsx`**

Replace the inlined ribbon block with the import and component:

```tsx
import { MockRibbon } from '@/components/MockRibbon';
// ... at the top of the JSX:
<MockRibbon />
```

Remove the inlined `{showRibbon && ...}` block and the `showRibbon` variable.

- [ ] **Step 6: Run tests**

```bash
pnpm test
pnpm build
```

Expected: tests PASS, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/MockRibbon.tsx tests/components/MockRibbon.test.tsx .env.local.example app/page.tsx
git commit -m "feat: extract MockRibbon component with env-flag toggle"
```

---

## Task 15: Extract Wordmark

**Files:**
- Create: `components/Wordmark.tsx`
- Create: `tests/components/Wordmark.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wordmark } from '@/components/Wordmark';

describe('Wordmark', () => {
  it('renders the brand name', () => {
    render(<Wordmark />);
    expect(screen.getByText('Manokara')).toBeInTheDocument();
  });

  it('links to the homepage', () => {
    render(<Wordmark />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses display size class when size="lg"', () => {
    render(<Wordmark size="lg" />);
    expect(screen.getByText('Manokara')).toHaveClass('text-display-l');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/Wordmark.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/Wordmark.tsx`**

```tsx
import Link from 'next/link';

const SIZE_CLS = {
  sm: 'text-h2',
  md: 'text-display-m',
  lg: 'text-display-l',
} as const;

export function Wordmark({ size = 'sm' }: { size?: keyof typeof SIZE_CLS }) {
  return (
    <Link href="/" className={`font-display ${SIZE_CLS[size]} text-text`}>
      Manokara
    </Link>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline `<Link href="/">` wordmark with `<Wordmark />`.

- [ ] **Step 5: Run tests + build**

```bash
pnpm test
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add components/Wordmark.tsx tests/components/Wordmark.test.tsx app/page.tsx
git commit -m "feat: extract Wordmark component with size variants"
```

---

## Task 16: Extract OpenNow

**Files:**
- Create: `components/OpenNow.tsx`
- Create: `tests/components/OpenNow.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OpenNow } from '@/components/OpenNow';

describe('OpenNow', () => {
  it('renders the open label for a Saturday afternoon', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat 14:00 Berlin (summer)
    render(<OpenNow now={now} />);
    expect(screen.getByText(/open · closes 8pm/i)).toBeInTheDocument();
  });

  it('renders the closed label for a Sunday afternoon', () => {
    const now = new Date('2026-04-26T12:00:00Z'); // Sun 14:00 Berlin
    render(<OpenNow now={now} />);
    expect(screen.getByText(/closed · opens mon 9am/i)).toBeInTheDocument();
  });

  it('uses the deep color when open', () => {
    const now = new Date('2026-04-25T12:00:00Z');
    render(<OpenNow now={now} />);
    expect(screen.getByText(/open ·/i)).toHaveClass('text-deep');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/OpenNow.test.tsx
```

- [ ] **Step 3: Implement `components/OpenNow.tsx`**

```tsx
import { business } from '@/lib/business';
import { isOpenNow, nextOpenLabel } from '@/lib/time';

export function OpenNow({ now }: { now?: Date }) {
  const label = nextOpenLabel(business.hours, now);
  const isOpen = isOpenNow(business.hours, now);
  const cls = isOpen ? 'text-deep' : 'text-text-muted';
  return (
    <span className={`text-label uppercase font-semibold ${cls}`}>
      ● {label}
    </span>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline `<span>● {nextOpenLabel(...)}</span>` with `<OpenNow />`.

- [ ] **Step 5: Run tests + build**

```bash
pnpm test
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add components/OpenNow.tsx tests/components/OpenNow.test.tsx app/page.tsx
git commit -m "feat: extract OpenNow component with optional now prop"
```

---

## Task 17: Extract TopBar

**Files:**
- Create: `components/TopBar.tsx`
- Create: `tests/components/TopBar.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopBar } from '@/components/TopBar';

describe('TopBar', () => {
  it('renders the wordmark and an open-now indicator', () => {
    render(<TopBar />);
    expect(screen.getByText('Manokara')).toBeInTheDocument();
    expect(screen.getByText(/open · |closed · /i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/TopBar.tsx`**

```tsx
import { Wordmark } from './Wordmark';
import { OpenNow } from './OpenNow';

export function TopBar() {
  return (
    <header className="flex justify-between items-center px-5 md:px-8 py-4 border-b border-line">
      <Wordmark />
      <OpenNow />
    </header>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline `<header>...</header>` with `<TopBar />`.

- [ ] **Step 5: Run tests + build**

```bash
pnpm test
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add components/TopBar.tsx tests/components/TopBar.test.tsx app/page.tsx
git commit -m "feat: extract TopBar composing Wordmark + OpenNow"
```

---

## Task 18: Extract StockChip

**Files:**
- Create: `components/StockChip.tsx`
- Create: `tests/components/StockChip.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockChip } from '@/components/StockChip';

describe('StockChip', () => {
  it('renders "In stock" with deep color for in-stock', () => {
    render(<StockChip stock="in-stock" />);
    const chip = screen.getByText(/in stock/i);
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-chip-in-text');
  });

  it('renders "Low" for low', () => {
    render(<StockChip stock="low" />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('renders "Out" for out-of-stock', () => {
    render(<StockChip stock="out-of-stock" />);
    expect(screen.getByText(/out/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/StockChip.tsx`**

```tsx
import type { StockLevel } from '@/lib/schema';

const VARIANTS: Record<StockLevel, { label: string; cls: string; dot: string }> = {
  'in-stock':     { label: 'In stock', cls: 'bg-chip-in-bg text-chip-in-text', dot: 'bg-chip-in-text' },
  low:            { label: 'Low',      cls: 'bg-chip-low-bg text-chip-low-text', dot: 'bg-chip-low-dot' },
  'out-of-stock': { label: 'Out',      cls: 'bg-chip-out-bg text-chip-out-text', dot: 'bg-chip-out-dot' },
};

const SIZE_CLS = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-caption px-2.5 py-1 gap-1.5',
} as const;

export function StockChip({
  stock,
  size = 'md',
}: {
  stock: StockLevel;
  size?: keyof typeof SIZE_CLS;
}) {
  const v = VARIANTS[stock];
  return (
    <span className={`inline-flex items-center rounded-chip font-semibold ${v.cls} ${SIZE_CLS[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Remove the inline `STOCK_VARIANTS` constant and the inline chip JSX. Replace each chip with `<StockChip stock={item.stock} />`.

- [ ] **Step 5: Run tests + build**

- [ ] **Step 6: Commit**

```bash
git add components/StockChip.tsx tests/components/StockChip.test.tsx app/page.tsx
git commit -m "feat: extract StockChip with three variants and two sizes"
```

---

## Task 19: Extract PhotoPlaceholder

**Files:**
- Create: `components/PhotoPlaceholder.tsx`
- Create: `tests/components/PhotoPlaceholder.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

describe('PhotoPlaceholder', () => {
  it('produces a stable gradient for the same seed', () => {
    const { container: a } = render(<PhotoPlaceholder seed="okra" />);
    const { container: b } = render(<PhotoPlaceholder seed="okra" />);
    const styleA = (a.firstChild as HTMLElement).getAttribute('style');
    const styleB = (b.firstChild as HTMLElement).getAttribute('style');
    expect(styleA).toBe(styleB);
  });

  it('produces a different gradient for different seeds', () => {
    const { container: a } = render(<PhotoPlaceholder seed="okra" />);
    const { container: b } = render(<PhotoPlaceholder seed="mango" />);
    const styleA = (a.firstChild as HTMLElement).getAttribute('style');
    const styleB = (b.firstChild as HTMLElement).getAttribute('style');
    expect(styleA).not.toBe(styleB);
  });

  it('applies a default aspect class', () => {
    const { container } = render(<PhotoPlaceholder seed="x" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/aspect-\[/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/PhotoPlaceholder.tsx`**

```tsx
function seedAngle(seed: string): number {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

const ASPECT_CLS = {
  hero: 'aspect-[16/9] md:aspect-[2/1]',
  card: 'aspect-[4/3]',
  square: 'aspect-square',
  tall: 'aspect-[3/4]',
} as const;

export function PhotoPlaceholder({
  seed,
  aspect = 'card',
  className = '',
  children,
}: {
  seed: string;
  aspect?: keyof typeof ASPECT_CLS;
  className?: string;
  children?: React.ReactNode;
}) {
  const angle = seedAngle(seed);
  const style = {
    background: `linear-gradient(${angle}deg, #2d4a2d 0%, #4a7c4a 80%)`,
  };
  return (
    <div
      className={`rounded-card relative overflow-hidden ${ASPECT_CLS[aspect]} ${className}`}
      style={style}
    >
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(227,167,40,0.45), transparent 70%)',
        }}
      />
      {children && <div className="absolute inset-0 p-3 flex items-end">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Remove the `placeholderGradient` helper. Replace the inline hero `<div style={{ background: ... }}>` with `<PhotoPlaceholder seed="home-hero" aspect="hero" />`. Replace each card's gradient div with `<PhotoPlaceholder seed={item.slug} aspect="card" />`.

- [ ] **Step 5: Run tests + build**

- [ ] **Step 6: Commit**

```bash
git add components/PhotoPlaceholder.tsx tests/components/PhotoPlaceholder.test.tsx app/page.tsx
git commit -m "feat: extract PhotoPlaceholder with deterministic seeded gradient"
```

---

## Task 20: Extract ItemCard

**Files:**
- Create: `components/ItemCard.tsx`
- Create: `tests/components/ItemCard.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCard } from '@/components/ItemCard';
import type { Item } from '@/lib/schema';

const ITEM: Item = {
  slug: 'okra',
  name: 'Okra',
  tamil: 'Vendakkai',
  category: 'vegetables',
  stock: 'in-stock',
  price: 2.8,
  unit: 'kg',
  origin: 'India',
  featured: true,
};

describe('ItemCard', () => {
  it('renders name, price, unit, tamil, and stock chip', () => {
    render(<ItemCard item={ITEM} />);
    expect(screen.getByText('Okra')).toBeInTheDocument();
    expect(screen.getByText('Vendakkai')).toBeInTheDocument();
    expect(screen.getByText(/€2\.80/)).toBeInTheDocument();
    expect(screen.getByText(/\/ kg/)).toBeInTheDocument();
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it('links to the item page', () => {
    render(<ItemCard item={ITEM} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/item/okra');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/ItemCard.tsx`**

```tsx
import Link from 'next/link';
import type { Item } from '@/lib/schema';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { StockChip } from './StockChip';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/item/${item.slug}`}
      className="block bg-surface border border-line rounded-card overflow-hidden hover:border-accent transition-colors"
    >
      <PhotoPlaceholder seed={item.slug} aspect="card" />
      <div className="p-4">
        <div className="font-display text-h2">{item.name}</div>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-caption text-text-muted">{item.tamil ?? ' '}</span>
          <span className="text-small font-semibold">
            €{item.price.toFixed(2)}
            <span className="text-caption text-text-subtle font-normal"> / {item.unit}</span>
          </span>
        </div>
        <div className="mt-3">
          <StockChip stock={item.stock} />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline card mapping with `<ItemCard key={item.slug} item={item} />`.

- [ ] **Step 5: Run tests + build**

- [ ] **Step 6: Commit**

```bash
git add components/ItemCard.tsx tests/components/ItemCard.test.tsx app/page.tsx
git commit -m "feat: extract ItemCard composing PhotoPlaceholder + StockChip"
```

---

## Task 21: Extract CategoryTile

**Files:**
- Create: `components/CategoryTile.tsx`
- Create: `tests/components/CategoryTile.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryTile } from '@/components/CategoryTile';

describe('CategoryTile', () => {
  it('renders the display name and item count', () => {
    render(<CategoryTile slug="vegetables" display="Vegetables" count={10} />);
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('10 items')).toBeInTheDocument();
  });

  it('links to the category page', () => {
    render(<CategoryTile slug="fish" display="Fish" count={5} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/fish');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/CategoryTile.tsx`**

```tsx
import Link from 'next/link';
import type { Category } from '@/lib/schema';

export function CategoryTile({
  slug,
  display,
  count,
}: {
  slug: Category;
  display: string;
  count: number;
}) {
  return (
    <Link
      href={`/${slug}`}
      className="flex justify-between items-baseline bg-surface border border-line rounded-card p-4 hover:border-accent transition-colors"
    >
      <span className="font-display text-h2">{display}</span>
      <span className="text-caption text-text-subtle">{count} items</span>
    </Link>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline tile mapping with `<CategoryTile key={cat.slug} slug={cat.slug} display={cat.display} count={count} />`.

- [ ] **Step 5: Run tests + build**

- [ ] **Step 6: Commit**

```bash
git add components/CategoryTile.tsx tests/components/CategoryTile.test.tsx app/page.tsx
git commit -m "feat: extract CategoryTile component"
```

---

## Task 22: Extract VisitBlock

**Files:**
- Create: `components/VisitBlock.tsx`
- Create: `tests/components/VisitBlock.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisitBlock } from '@/components/VisitBlock';

describe('VisitBlock', () => {
  it('renders address, hours summary, and contact links', () => {
    render(<VisitBlock />);
    expect(screen.getByText('Visit')).toBeInTheDocument();
    expect(screen.getByText(/mustermannstraße/i)).toBeInTheDocument();
    expect(screen.getByText(/mon–sat 09:00–20:00/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
  });

  it('uses tel: scheme for the call link', () => {
    render(<VisitBlock />);
    const link = screen.getByRole('link', { name: /call/i });
    expect(link.getAttribute('href')).toMatch(/^tel:/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/VisitBlock.tsx`**

```tsx
import { business } from '@/lib/business';

export function VisitBlock() {
  return (
    <section className="bg-text text-bg rounded-card p-6 mt-12">
      <p className="font-display text-display-m mb-3">Visit</p>
      <p className="text-body">{business.address.street}</p>
      <p className="text-body text-bg/70">
        {business.address.postal} {business.address.city}
      </p>
      <p className="text-small text-bg/70 mt-3">Mon–Sat 09:00–20:00 · Sun closed</p>
      <div className="flex gap-4 mt-4 text-small">
        <a href={`tel:${business.phone}`} className="underline">Call</a>
        <a
          href={`https://wa.me/${business.whatsapp.replace('+', '')}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          href={`https://instagram.com/${business.instagram}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Use it in `app/page.tsx`**

Replace the inline visit `<section>` with `<VisitBlock />`.

- [ ] **Step 5: Run tests + build**

- [ ] **Step 6: Commit**

```bash
git add components/VisitBlock.tsx tests/components/VisitBlock.test.tsx app/page.tsx
git commit -m "feat: extract VisitBlock component"
```

---

## Task 23: Final cleanup of homepage

**Files:**
- Modify: `app/page.tsx`

After all extractions, the homepage should be small and import-driven. Verify:

- [ ] **Step 1: Open `app/page.tsx` and confirm it looks like this**

```tsx
import { categories } from '@/lib/categories';
import { mockCatalog } from '@/lib/mock-catalog';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { ItemCard } from '@/components/ItemCard';
import { CategoryTile } from '@/components/CategoryTile';
import { VisitBlock } from '@/components/VisitBlock';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

export default function Home() {
  const featured = mockCatalog.filter((i) => i.featured).slice(0, 6);
  const inStockCount = mockCatalog.filter((i) => i.stock === 'in-stock').length;
  const updated = '08:32';

  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <section className="pt-12 md:pt-20 pb-12">
          <h1 className="font-display text-display-l md:text-display-xl">
            Fresh<br />this morning.
          </h1>
          <p className="text-body text-text-muted mt-4 max-w-md">
            South-Asian groceries restocked at {updated} · {inStockCount} items in stock today.
          </p>
          <div className="mt-8">
            <PhotoPlaceholder seed="home-hero" aspect="hero" />
          </div>
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">
            Fresh today · {featured.length}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">Browse</p>
          <div className="grid gap-2">
            {categories.map((cat) => (
              <CategoryTile
                key={cat.slug}
                slug={cat.slug}
                display={cat.display}
                count={mockCatalog.filter((i) => i.category === cat.slug).length}
              />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
```

If your file looks roughly like this, no edit needed. If not, refactor to match.

- [ ] **Step 2: Run all tests + build**

```bash
pnpm test
pnpm build
```

Expected: all tests PASS; build reports `/` as static, page count `1`.

- [ ] **Step 3: Commit (if any changes made)**

```bash
git add app/page.tsx
git commit -m "refactor: ensure homepage uses extracted components consistently"
```

---

## Task 24: Add CategoryHero component

**Files:**
- Create: `components/CategoryHero.tsx`
- Create: `tests/components/CategoryHero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryHero } from '@/components/CategoryHero';

describe('CategoryHero', () => {
  it('renders the display name, blurb, and counts', () => {
    render(
      <CategoryHero
        slug="vegetables"
        display="Vegetables"
        blurb="South Indian gourds and greens."
        total={10}
        inStock={7}
      />,
    );
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('South Indian gourds and greens.')).toBeInTheDocument();
    expect(screen.getByText(/10 items · 7 in stock today/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/CategoryHero.tsx`**

```tsx
import type { Category } from '@/lib/schema';
import { PhotoPlaceholder } from './PhotoPlaceholder';

export function CategoryHero({
  slug,
  display,
  blurb,
  total,
  inStock,
}: {
  slug: Category;
  display: string;
  blurb: string;
  total: number;
  inStock: number;
}) {
  return (
    <section className="pt-8 pb-10">
      <h1 className="font-display text-display-l">{display}.</h1>
      <p className="text-body text-text-muted mt-2 max-w-md">{blurb}</p>
      <p className="text-caption text-text-subtle mt-2">
        {total} items · {inStock} in stock today
      </p>
      <div className="mt-6">
        <PhotoPlaceholder seed={`category-${slug}`} aspect="hero" />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/CategoryHero.tsx tests/components/CategoryHero.test.tsx
git commit -m "feat: add CategoryHero component"
```

---

## Task 25: Add Breadcrumb component

**Files:**
- Create: `components/Breadcrumb.tsx`
- Create: `tests/components/Breadcrumb.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/Breadcrumb';

describe('Breadcrumb', () => {
  it('renders linked crumbs except the last', () => {
    render(
      <Breadcrumb
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/vegetables', label: 'Vegetables' },
          { label: 'Bitter gourd' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Vegetables' })).toHaveAttribute('href', '/vegetables');
    expect(screen.getByText('Bitter gourd')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Bitter gourd' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/Breadcrumb.tsx`**

```tsx
import Link from 'next/link';
import { Fragment } from 'react';

type Crumb = { href?: string; label: string };

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-caption text-text-muted">
      {crumbs.map((c, i) => (
        <Fragment key={`${c.label}-${i}`}>
          {i > 0 && <span className="mx-1.5 text-text-subtle">/</span>}
          {c.href ? (
            <Link href={c.href} className="text-text hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-text-muted">{c.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/Breadcrumb.tsx tests/components/Breadcrumb.test.tsx
git commit -m "feat: add Breadcrumb component"
```

---

## Task 26: Add FilterBar component

**Files:**
- Create: `components/FilterBar.tsx`
- Create: `tests/components/FilterBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  it('renders three anchor links with counts', () => {
    render(<FilterBar all={24} inStock={18} featured={4} />);
    expect(screen.getByRole('link', { name: /all · 24/i })).toHaveAttribute('href', '#all');
    expect(screen.getByRole('link', { name: /in stock · 18/i })).toHaveAttribute('href', '#in-stock');
    expect(screen.getByRole('link', { name: /featured · 4/i })).toHaveAttribute('href', '#featured');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/FilterBar.tsx`**

```tsx
export function FilterBar({
  all,
  inStock,
  featured,
}: {
  all: number;
  inStock: number;
  featured: number;
}) {
  return (
    <div className="flex gap-5 text-caption border-b border-line pb-3 mb-6">
      <a href="#all" className="text-text font-semibold">All · {all}</a>
      <a href="#in-stock" className="text-text-muted hover:text-text">In stock · {inStock}</a>
      <a href="#featured" className="text-text-muted hover:text-text">Featured · {featured}</a>
    </div>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/FilterBar.tsx tests/components/FilterBar.test.tsx
git commit -m "feat: add FilterBar with anchor links"
```

---

## Task 27: Add the category page

**Files:**
- Create: `app/[category]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { notFound } from 'next/navigation';
import { categories, categoryBySlug } from '@/lib/categories';
import { mockCatalog } from '@/lib/mock-catalog';
import type { Category } from '@/lib/schema';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryHero } from '@/components/CategoryHero';
import { FilterBar } from '@/components/FilterBar';
import { ItemCard } from '@/components/ItemCard';
import { VisitBlock } from '@/components/VisitBlock';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

type Params = Promise<{ category: string }>;

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const meta = categoryBySlug[category as Category];
  if (!meta) notFound();

  const items = mockCatalog.filter((i) => i.category === meta.slug);
  const inStock = items.filter((i) => i.stock === 'in-stock');
  const featured = items.filter((i) => i.featured);

  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <div className="pt-6">
          <Breadcrumb crumbs={[{ href: '/', label: 'Home' }, { label: meta.display }]} />
        </div>

        <CategoryHero
          slug={meta.slug}
          display={meta.display}
          blurb={meta.blurb}
          total={items.length}
          inStock={inStock.length}
        />

        <FilterBar all={items.length} inStock={inStock.length} featured={featured.length} />

        <section id="all" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">All · {items.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section id="in-stock" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">In stock · {inStock.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inStock.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section id="featured" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">Featured · {featured.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify build produces 5 category routes**

```bash
pnpm build
```

Expected output includes lines for `/vegetables`, `/fruits`, `/fish`, `/meat`, `/dry-goods` — all marked as static (`○`).

- [ ] **Step 3: Eyeball each category page**

```bash
pnpm dev
```

Visit `http://localhost:3000/vegetables`, `/fruits`, `/fish`, `/meat`, `/dry-goods`. Each should render with the breadcrumb, hero, filter bar, and three sections of cards. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add app/\[category\]/page.tsx
git commit -m "feat: add /[category] page with anchor-link filter sections"
```

---

## Task 28: Add ItemCard compact variant

**Files:**
- Modify: `components/ItemCard.tsx`
- Modify: `tests/components/ItemCard.test.tsx`

- [ ] **Step 1: Add a failing test for the compact variant**

Append to `tests/components/ItemCard.test.tsx`:

```tsx
import { describe as describeCompact, it as itCompact, expect as expectCompact } from 'vitest';

describeCompact('ItemCard compact variant', () => {
  itCompact('hides the tamil and price-detail in compact mode', () => {
    const { container } = render(<ItemCard item={ITEM} compact />);
    expect(container.querySelector('[data-testid="item-card-compact"]')).not.toBeNull();
  });
});
```

(The above uses imports from the existing test setup — use the existing `describe/it/expect` and `ITEM` already in the file. Append a new `describe('ItemCard compact variant', ...)` block at the bottom of the existing file.)

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/ItemCard.test.tsx
```

Expected: FAIL — `compact` prop / `data-testid` not present.

- [ ] **Step 3: Add the compact variant to `components/ItemCard.tsx`**

```tsx
import Link from 'next/link';
import type { Item } from '@/lib/schema';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { StockChip } from './StockChip';

export function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  if (compact) {
    return (
      <Link
        data-testid="item-card-compact"
        href={`/item/${item.slug}`}
        className="block bg-surface border border-line rounded-card overflow-hidden hover:border-accent transition-colors"
      >
        <PhotoPlaceholder seed={item.slug} aspect="square" />
        <div className="p-3">
          <div className="font-display text-h3 leading-tight">{item.name}</div>
          <StockChip stock={item.stock} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/item/${item.slug}`}
      className="block bg-surface border border-line rounded-card overflow-hidden hover:border-accent transition-colors"
    >
      <PhotoPlaceholder seed={item.slug} aspect="card" />
      <div className="p-4">
        <div className="font-display text-h2">{item.name}</div>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-caption text-text-muted">{item.tamil ?? ' '}</span>
          <span className="text-small font-semibold">
            €{item.price.toFixed(2)}
            <span className="text-caption text-text-subtle font-normal"> / {item.unit}</span>
          </span>
        </div>
        <div className="mt-3">
          <StockChip stock={item.stock} />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests + build**

```bash
pnpm test
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add components/ItemCard.tsx tests/components/ItemCard.test.tsx
git commit -m "feat: add compact variant to ItemCard for sibling lists"
```

---

## Task 29: Add the item page

**Files:**
- Create: `app/item/[slug]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { notFound } from 'next/navigation';
import { mockCatalog } from '@/lib/mock-catalog';
import { categoryBySlug } from '@/lib/categories';
import { itemBody } from '@/lib/copy';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { StockChip } from '@/components/StockChip';
import { ItemCard } from '@/components/ItemCard';
import { VisitBlock } from '@/components/VisitBlock';

export function generateStaticParams() {
  return mockCatalog.map((i) => ({ slug: i.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function ItemPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = mockCatalog.find((i) => i.slug === slug);
  if (!item) notFound();

  const cat = categoryBySlug[item.category];
  const siblings = mockCatalog
    .filter((i) => i.category === item.category && i.slug !== item.slug)
    .slice(0, 3);
  const body = itemBody({ stock: item.stock, featured: item.featured });

  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <div className="pt-6">
          <Breadcrumb
            crumbs={[
              { href: '/', label: 'Home' },
              { href: `/${cat.slug}`, label: cat.display },
              { label: item.name },
            ]}
          />
        </div>

        <section className="pt-6 pb-10">
          <PhotoPlaceholder seed={item.slug} aspect="hero" />
          <h1 className="font-display text-display-l mt-6">{item.name}</h1>
          <div className="mt-3">
            <StockChip stock={item.stock} />
          </div>
          <p className="text-display-m font-display mt-4">
            €{item.price.toFixed(2)}
            <span className="text-caption text-text-subtle font-body font-normal"> / {item.unit}</span>
          </p>
          {item.origin && (
            <p className="text-label uppercase text-text-subtle mt-3">Origin · {item.origin}</p>
          )}
          {item.tamil && (
            <p className="text-label uppercase text-text-subtle mt-1">Tamil · {item.tamil}</p>
          )}
          <div className="text-body text-text-muted mt-5 space-y-1">
            {body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-4">Also in {cat.display.toLowerCase()}</p>
          <div className="grid grid-cols-3 gap-3">
            {siblings.map((sib) => (
              <ItemCard key={sib.slug} item={sib} compact />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify build produces 35 item routes**

```bash
pnpm build
```

Expected: build output reports 35 `/item/...` static routes (alongside 5 category and 1 home), totaling 41 so far.

- [ ] **Step 3: Eyeball at least 3 item pages — one per stock variant**

```bash
pnpm dev
```

Visit:
- `http://localhost:3000/item/okra` (in-stock, featured)
- `http://localhost:3000/item/drumstick` (low)
- `http://localhost:3000/item/ash-gourd` (out-of-stock)

Each should render with breadcrumb, hero, name, chip, price, origin/tamil labels, body lines, and 3 sibling cards. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add app/item
git commit -m "feat: add /item/[slug] page with siblings and templated body"
```

---

## Task 30: Add HoursTable component

**Files:**
- Create: `components/HoursTable.tsx`
- Create: `tests/components/HoursTable.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoursTable } from '@/components/HoursTable';

describe('HoursTable', () => {
  it('renders all 7 days with hours or "Closed"', () => {
    render(<HoursTable />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getAllByText('09:00–20:00').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });

  it('highlights today\'s row', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat
    render(<HoursTable now={now} />);
    const todayCell = screen.getByText('Sat');
    expect(todayCell.closest('[data-today="true"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/HoursTable.tsx`**

```tsx
import { business } from '@/lib/business';
import type { Hours } from '@/lib/business';

const DAY_KEYS: ReadonlyArray<keyof Hours> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' } as const;

function todayKey(now: Date): keyof Hours {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
  });
  const wd = fmt.format(now).toLowerCase().slice(0, 3);
  return wd as keyof Hours;
}

export function HoursTable({ now }: { now?: Date }) {
  const today = todayKey(now ?? new Date());
  return (
    <div className="grid gap-1 max-w-sm text-small">
      {DAY_KEYS.map((d) => {
        const slot = business.hours[d];
        const isToday = d === today;
        return (
          <div
            key={d}
            data-today={isToday}
            className={`flex justify-between py-1 px-2 rounded ${isToday ? 'bg-chip-low-bg text-chip-low-text font-semibold' : ''}`}
          >
            <span>{DAY_LABELS[d]}</span>
            <span>{slot ? `${slot.open}–${slot.close}` : 'Closed'}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/HoursTable.tsx tests/components/HoursTable.test.tsx
git commit -m "feat: add HoursTable with today-row highlight"
```

---

## Task 31: Add ContactRows component

**Files:**
- Create: `components/ContactRows.tsx`
- Create: `tests/components/ContactRows.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactRows } from '@/components/ContactRows';

describe('ContactRows', () => {
  it('renders phone, whatsapp, and instagram links', () => {
    render(<ContactRows />);
    expect(screen.getByRole('link', { name: /phone/i }).getAttribute('href')).toMatch(/^tel:/);
    expect(screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toMatch(/wa\.me/);
    expect(screen.getByRole('link', { name: /instagram/i }).getAttribute('href')).toMatch(/instagram\.com/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/ContactRows.tsx`**

```tsx
import { business } from '@/lib/business';

const ROW_CLS = 'flex justify-between items-baseline py-3 border-b border-line text-body';

export function ContactRows() {
  return (
    <div>
      <a className={ROW_CLS} href={`tel:${business.phone}`} aria-label="Phone">
        <span className="text-text-muted">Phone</span>
        <span className="text-text">{business.phone}</span>
      </a>
      <a
        className={ROW_CLS}
        href={`https://wa.me/${business.whatsapp.replace('+', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <span className="text-text-muted">WhatsApp</span>
        <span className="text-text">{business.whatsapp}</span>
      </a>
      <a
        className={ROW_CLS}
        href={`https://instagram.com/${business.instagram}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <span className="text-text-muted">Instagram</span>
        <span className="text-text">@{business.instagram}</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/ContactRows.tsx tests/components/ContactRows.test.tsx
git commit -m "feat: add ContactRows component"
```

---

## Task 32: Add TransitNotes component

**Files:**
- Create: `components/TransitNotes.tsx`
- Create: `tests/components/TransitNotes.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransitNotes } from '@/components/TransitNotes';

describe('TransitNotes', () => {
  it('renders all transit lines from business config', () => {
    render(<TransitNotes />);
    expect(screen.getByText(/s-bahn hauptbahnhof/i)).toBeInTheDocument();
    expect(screen.getByText(/u-bahn charlottenplatz/i)).toBeInTheDocument();
    expect(screen.getByText(/marienstraße/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement `components/TransitNotes.tsx`**

```tsx
import { business } from '@/lib/business';

export function TransitNotes() {
  return (
    <ul className="space-y-2 text-body text-text-muted list-disc list-inside">
      {business.transit.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run tests + build**

- [ ] **Step 5: Commit**

```bash
git add components/TransitNotes.tsx tests/components/TransitNotes.test.tsx
git commit -m "feat: add TransitNotes component"
```

---

## Task 33: Add the visit page

**Files:**
- Create: `app/visit/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { business } from '@/lib/business';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { HoursTable } from '@/components/HoursTable';
import { ContactRows } from '@/components/ContactRows';
import { TransitNotes } from '@/components/TransitNotes';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

export default function VisitPage() {
  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <section className="pt-12 pb-10">
          <h1 className="font-display text-display-l">Visit.</h1>
          <p className="font-display text-display-m mt-4">{business.address.street}</p>
          <p className="text-body text-text-muted">
            {business.address.postal} {business.address.city}
          </p>
        </section>

        <section className="pb-10">
          <PhotoPlaceholder seed="visit-map" aspect="hero" />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Hours</p>
          <HoursTable />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Contact</p>
          <ContactRows />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Transit</p>
          <TransitNotes />
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify the build produces all 42 routes**

```bash
pnpm build
```

Expected: build output shows:
- `/` (1)
- `/[category]` × 5 (vegetables, fruits, fish, meat, dry-goods)
- `/item/[slug]` × 35
- `/visit` (1)

**Total: 42 static pages.**

- [ ] **Step 3: Eyeball /visit**

```bash
pnpm dev
```

Visit `http://localhost:3000/visit`. Expected:
- TopBar at top, no `<VisitBlock>` at the bottom
- "Visit." display headline + address
- Map placeholder
- Hours table with today highlighted
- Contact rows (Phone, WhatsApp, Instagram)
- Transit bullet list

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add app/visit
git commit -m "feat: add /visit page with hours, contact, and transit"
```

---

## Task 34: Final verification pass

**Files:** none (verification only)

This task runs every exit criterion from the spec. If anything fails, fix it (likely small CSS adjustments or test stabilization), commit the fix, and re-run.

- [ ] **Step 1: Type-check and lint**

```bash
pnpm tsc --noEmit
pnpm lint
```

Expected: both clean. If `pnpm lint` complains about anything, fix and commit.

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

Expected: all tests across `tests/` pass.

- [ ] **Step 3: Production build with route count**

```bash
pnpm build
```

Expected: build succeeds. Output shows exactly **42 static pages** (1 + 5 + 35 + 1).

- [ ] **Step 4: Confirm no hex literals leak outside `lib/theme.ts` and `tailwind.config.ts`**

Use Grep on the project:

Run a search across `app/` and `components/` for hex literals (`#` followed by 3–8 hex digits). Expected: zero matches.

If any matches turn up, replace them with Tailwind classes that consume `lib/theme.ts` tokens, then commit.

- [ ] **Step 5: Confirm OpenNow renders correctly on a Sunday**

In `pnpm dev`, on the homepage, OpenNow uses the live time. To test the Sunday-closed branch without changing the system clock, temporarily edit `components/OpenNow.tsx` to default `now` to `new Date('2026-04-26T12:00:00Z')` and verify the header shows "Closed · opens Mon 9am". **Revert the edit before committing.**

A non-temporary check: the unit tests for `nextOpenLabel` already cover this — confirm `pnpm test tests/lib/time.test.ts` passes.

- [ ] **Step 6: Confirm the MockRibbon hides under the env flag**

```bash
NEXT_PUBLIC_HIDE_MOCK_RIBBON=1 pnpm dev
```

Visit `http://localhost:3000`. Expected: no amber ribbon at top. Stop server. Restart `pnpm dev` without the flag — ribbon returns.

- [ ] **Step 7: Confirm hot reload of mock data**

With `pnpm dev` running, edit `lib/mock-catalog.ts`: change Okra's name to "Okra (test)". Reload the homepage. Expected: card name updates immediately. Revert the edit.

- [ ] **Step 8: Mobile eyeball pass**

Open DevTools, switch to a mobile profile (iPhone 14 Pro / Pixel 7). Walk through:
- `/` — all sections legible, hero feels editorial, cards readable
- `/vegetables` — filter bar readable, 2-column grid
- `/item/okra` — name readable, breadcrumb fits, sibling cards 3-up
- `/visit` — hours table readable, contact rows tappable

If anything looks off, fix and commit.

- [ ] **Step 9: Final commit if any tweaks**

```bash
git status
# if any working changes:
git add -A
git commit -m "chore: final v0.5 verification fixes"
```

- [ ] **Step 10: Tag the milestone**

```bash
git tag v0.5-shell
```

---

## Done

Sub-project A v0.5 is complete when Task 34 finishes cleanly. Hand-off to **sub-project B** (live-data pipeline) replaces `mockCatalog` reads with a `getCatalog()` that pulls from Google Sheets via `unstable_cache`. Hand-off to **sub-project C** (SEO + launch) adds `vercel.ts`, JSON-LD, sitemap, and the production deploy.
