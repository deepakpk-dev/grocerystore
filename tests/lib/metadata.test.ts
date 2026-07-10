import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  absoluteUrl,
  pageMetadata,
  itemTitle,
  itemDescription,
  categoryTitle,
  categoryDescription,
  groceryStoreJsonLd,
  productJsonLd,
  breadcrumbJsonLd,
  webPageJsonLd,
  CATALOG_UPDATED,
} from '@/lib/metadata';
import type { Item } from '@/lib/schema';

const okra: Item = {
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

describe('absoluteUrl', () => {
  it('returns the bare site URL for /', () => {
    expect(absoluteUrl('/')).toBe(SITE_URL);
  });

  it('appends paths without a double slash', () => {
    expect(absoluteUrl('/item/okra')).toBe(`${SITE_URL}/item/okra`);
  });
});

describe('pageMetadata', () => {
  it('sets title, description, and canonical', () => {
    const meta = pageMetadata({ title: 'T', description: 'D', path: '/visit' });
    expect(meta.title).toBe('T');
    expect(meta.description).toBe('D');
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/visit`);
  });
});

describe('itemTitle / itemDescription', () => {
  it('includes name, tamil, price, and unit in the title', () => {
    expect(itemTitle(okra)).toBe('Okra (Vendakkai) — €2.80 / kg');
  });

  it('omits the tamil parenthetical when absent', () => {
    expect(itemTitle({ ...okra, tamil: undefined })).toBe('Okra — €2.80 / kg');
  });

  it('mentions stock status, price, and origin in the description', () => {
    const desc = itemDescription(okra);
    expect(desc).toContain('in stock today');
    expect(desc).toContain('€2.80 per kg');
    expect(desc).toContain('origin India');
  });

  it('says out of stock for out-of-stock items', () => {
    expect(itemDescription({ ...okra, stock: 'out-of-stock' })).toContain(
      'out of stock today',
    );
  });
});

describe('categoryTitle / categoryDescription', () => {
  const meta = { slug: 'fish', display: 'Fish', blurb: 'Fresh and frozen.' } as const;

  it('builds a unique title from the display name', () => {
    expect(categoryTitle(meta)).toBe("Fish — today's stock");
  });

  it('includes stock counts in the description', () => {
    expect(categoryDescription(meta, { total: 5, inStock: 4 })).toContain(
      '4 of 5 items in stock today',
    );
  });
});

describe('groceryStoreJsonLd', () => {
  it('is a GroceryStore + LocalBusiness with NAP fields', () => {
    const ld = groceryStoreJsonLd();
    expect(ld['@type']).toEqual(['GroceryStore', 'LocalBusiness']);
    expect(ld.name).toBe('Manokara Stores');
    expect(ld.address.addressLocality).toBe('Stuttgart');
    expect(ld.telephone).toBeTruthy();
  });

  it('groups Mon–Sat hours and excludes closed Sunday', () => {
    const specs = groceryStoreJsonLd().openingHoursSpecification;
    expect(specs).toHaveLength(1);
    expect(specs[0].dayOfWeek).toHaveLength(6);
    expect(specs[0].dayOfWeek).not.toContain('Sunday');
    expect(specs[0].opens).toBe('09:00');
    expect(specs[0].closes).toBe('20:00');
  });
});

describe('productJsonLd', () => {
  it('maps in-stock to schema.org InStock', () => {
    expect(productJsonLd(okra).offers.availability).toBe('https://schema.org/InStock');
  });

  it('maps low to LimitedAvailability', () => {
    expect(productJsonLd({ ...okra, stock: 'low' }).offers.availability).toBe(
      'https://schema.org/LimitedAvailability',
    );
  });

  it('maps out-of-stock to OutOfStock', () => {
    expect(productJsonLd({ ...okra, stock: 'out-of-stock' }).offers.availability).toBe(
      'https://schema.org/OutOfStock',
    );
  });

  it('prices the offer in EUR with two decimals', () => {
    const offers = productJsonLd(okra).offers;
    expect(offers.price).toBe('2.80');
    expect(offers.priceCurrency).toBe('EUR');
  });

  it('omits alternateName when there is no tamil name', () => {
    expect(productJsonLd({ ...okra, tamil: undefined })).not.toHaveProperty(
      'alternateName',
    );
  });
});

describe('breadcrumbJsonLd', () => {
  it('numbers positions from 1 and links all but the last crumb', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Vegetables', path: '/vegetables' },
      { name: 'Okra' },
    ]);
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].item).toBe(`${SITE_URL}/vegetables`);
    expect(ld.itemListElement[2]).not.toHaveProperty('item');
  });
});

describe('webPageJsonLd', () => {
  it('carries the catalog dateModified', () => {
    const ld = webPageJsonLd({ path: '/', name: 'Home' });
    expect(ld.dateModified).toBe(CATALOG_UPDATED);
    expect(ld.url).toBe(SITE_URL);
  });
});
