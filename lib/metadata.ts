import type { Metadata } from 'next';
import { business } from './business';
import type { Item, StockLevel } from './schema';

function deploymentHost(): string | undefined {
  return process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
}

export function siteUrl(path = '/'): string {
  const host = deploymentHost() ?? 'http://localhost:3000';
  const base = host.startsWith('http') ? host : `https://${host}`;
  return new URL(path, base.endsWith('/') ? base : `${base}/`).toString();
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      type: 'website',
      url: siteUrl(input.path),
      siteName: business.name,
      locale: 'en_GB',
    },
  };
}

export function businessJsonLd(dateModified: string) {
  const schemaDays = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  } as const;
  const openingHoursSpecification = Object.entries(business.hours)
    .filter(
      (entry): entry is [keyof typeof schemaDays, { open: string; close: string }] =>
        entry[1] !== null,
    )
    .map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${schemaDays[day]}`,
      opens: hours.open,
      closes: hours.close,
    }));

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'GroceryStore'],
    '@id': `${siteUrl()}#business`,
    name: business.name,
    url: siteUrl(),
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
    openingHoursSpecification,
    sameAs: [`https://instagram.com/${business.instagram}`],
    dateModified,
  };
}

export function breadcrumbJsonLd(
  crumbs: ReadonlyArray<{ name: string; path: string }>,
  dateModified: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: siteUrl(crumb.path),
    })),
    dateModified,
  };
}

const AVAILABILITY: Record<StockLevel, string> = {
  'in-stock': 'https://schema.org/InStock',
  low: 'https://schema.org/LimitedAvailability',
  'out-of-stock': 'https://schema.org/OutOfStock',
};

export function productJsonLd(item: Item, dateModified: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    url: siteUrl(`/item/${item.slug}`),
    ...(item.photoUrl ? { image: item.photoUrl } : {}),
    ...(item.origin ? { description: `${item.name} from ${item.origin}.` } : {}),
    category: item.category,
    offers: {
      '@type': 'Offer',
      price: item.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: AVAILABILITY[item.stock],
      url: siteUrl(`/item/${item.slug}`),
    },
    dateModified,
  };
}

export function formatUpdatedAt(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}
