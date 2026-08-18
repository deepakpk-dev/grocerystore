import { describe, expect, it } from 'vitest';
import { breadcrumbJsonLd, businessJsonLd, productJsonLd } from '@/lib/metadata';
import type { Item } from '@/lib/schema';

const ITEM: Item = {
  slug: 'okra',
  name: 'Okra',
  category: 'vegetables',
  stock: 'low',
  price: 2.8,
  unit: 'kg',
  origin: 'India',
};

describe('structured data', () => {
  it('describes the business and uses valid schema day names', () => {
    const data = businessJsonLd('2026-08-18T08:00:00.000Z');
    expect(data['@type']).toEqual(['LocalBusiness', 'GroceryStore']);
    expect(data.openingHoursSpecification[1].dayOfWeek).toBe('https://schema.org/Tuesday');
    expect(data.dateModified).toBe('2026-08-18T08:00:00.000Z');
  });

  it('maps low stock to LimitedAvailability', () => {
    const data = productJsonLd(ITEM, '2026-08-18T08:00:00.000Z');
    expect(data.offers.availability).toBe('https://schema.org/LimitedAvailability');
    expect(data.offers.priceCurrency).toBe('EUR');
  });

  it('numbers breadcrumb items from one', () => {
    const data = breadcrumbJsonLd(
      [
        { name: 'Home', path: '/' },
        { name: 'Okra', path: '/item/okra' },
      ],
      '2026-08-18T08:00:00.000Z',
    );
    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});
