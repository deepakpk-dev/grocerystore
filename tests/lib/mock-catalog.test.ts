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
