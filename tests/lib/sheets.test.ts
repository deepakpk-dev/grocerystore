import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasSheetConfig, parseCatalogRows } from '@/lib/sheets';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('parseCatalogRows', () => {
  it('normalizes valid sheet rows by header name', () => {
    const result = parseCatalogRows([
      ['featured', 'name', 'unit', 'stock', 'price', 'category', 'origin', 'photo_url'],
      ['TRUE', 'Fresh Okra', 'kg', 'In Stock', '2,80', 'Vegetables', 'India', 'https://store.public.blob.vercel-storage.com/okra.jpg'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      {
        slug: 'fresh-okra',
        name: 'Fresh Okra',
        unit: 'kg',
        stock: 'in-stock',
        price: 2.8,
        category: 'vegetables',
        origin: 'India',
        photoUrl: 'https://store.public.blob.vercel-storage.com/okra.jpg',
        featured: true,
      },
    ]);
  });

  it('skips invalid and duplicate rows while retaining valid items', () => {
    const result = parseCatalogRows([
      ['name', 'category', 'stock', 'price', 'unit'],
      ['Okra', 'Vegetables', 'In Stock', 2.8, 'kg'],
      ['Okra', 'Vegetables', 'Low', 3, 'kg'],
      ['Mystery', 'Unknown', 'In Stock', 1, 'piece'],
    ]);

    expect(result.items).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toMatch(/duplicate/i);
    expect(result.errors[1]).toMatch(/row 4/i);
  });

  it('rejects a sheet without required columns', () => {
    expect(() => parseCatalogRows([['name', 'category']])).toThrow(/missing required columns/i);
  });

  it('rejects partially configured Google credentials instead of silently using mock data', () => {
    vi.stubEnv('GOOGLE_SHEETS_ID', 'sheet-id');
    vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', '');
    vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_KEY', '');
    expect(() => hasSheetConfig()).toThrow(/credentials are incomplete/i);
  });
});
