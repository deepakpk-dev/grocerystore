import type { Metadata } from 'next';
import type { CategoryMeta, Item, StockLevel } from './schema';
import { business, type Hours } from './business';
import { categoryBySlug } from './categories';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://manokara-stores.vercel.app';

// Mock freshness timestamp; the live-data pipeline replaces this with the
// actual sheet-fetch time.
export const CATALOG_UPDATED = '2026-07-10T08:32:00+02:00';

export function absoluteUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      siteName: business.name,
      locale: 'en_DE',
      type: 'website',
    },
  };
}

const STOCK_PHRASE: Record<StockLevel, string> = {
  'in-stock': 'in stock today',
  low: 'low stock today',
  'out-of-stock': 'out of stock today',
};

export function itemTitle(item: Item): string {
  const tamil = item.tamil ? ` (${item.tamil})` : '';
  return `${item.name}${tamil} — €${item.price.toFixed(2)} / ${item.unit}`;
}

export function itemDescription(item: Item): string {
  const origin = item.origin ? `, origin ${item.origin}` : '';
  return (
    `${item.name} ${STOCK_PHRASE[item.stock]} at ${business.name}, Stuttgart — ` +
    `€${item.price.toFixed(2)} per ${item.unit}${origin}. Stock updated each morning.`
  );
}

export function categoryTitle(meta: CategoryMeta): string {
  return `${meta.display} — today's stock`;
}

export function categoryDescription(
  meta: CategoryMeta,
  counts: { total: number; inStock: number },
): string {
  return (
    `${meta.blurb} ${counts.inStock} of ${counts.total} items in stock today ` +
    `at ${business.name}, Stuttgart.`
  );
}

const DAY_NAMES: Record<keyof Hours, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function openingHoursSpecification() {
  const groups = new Map<string, { days: string[]; opens: string; closes: string }>();
  for (const [day, slot] of Object.entries(business.hours) as [
    keyof Hours,
    { open: string; close: string } | null,
  ][]) {
    if (!slot) continue;
    const key = `${slot.open}-${slot.close}`;
    const group = groups.get(key) ?? { days: [], opens: slot.open, closes: slot.close };
    group.days.push(DAY_NAMES[day]);
    groups.set(key, group);
  }
  return [...groups.values()].map((g) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: g.days,
    opens: g.opens,
    closes: g.closes,
  }));
}

export function groceryStoreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['GroceryStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#store`,
    name: business.name,
    url: SITE_URL,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      postalCode: business.address.postal,
      addressLocality: business.address.city,
      addressCountry: business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    openingHoursSpecification: openingHoursSpecification(),
    sameAs: [`https://instagram.com/${business.instagram}`],
  };
}

const AVAILABILITY: Record<StockLevel, string> = {
  'in-stock': 'https://schema.org/InStock',
  low: 'https://schema.org/LimitedAvailability',
  'out-of-stock': 'https://schema.org/OutOfStock',
};

export function productJsonLd(item: Item) {
  const url = absoluteUrl(`/item/${item.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    ...(item.tamil ? { alternateName: item.tamil } : {}),
    url,
    category: categoryBySlug[item.category].display,
    offers: {
      '@type': 'Offer',
      url,
      price: item.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: AVAILABILITY[item.stock],
      seller: { '@id': `${SITE_URL}/#store` },
    },
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

export function webPageJsonLd(input: { path: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: absoluteUrl(input.path),
    name: input.name,
    dateModified: CATALOG_UPDATED,
  };
}
