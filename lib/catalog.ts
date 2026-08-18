import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { mockCatalog } from './mock-catalog';
import { fetchCatalogFromSheets, hasSheetConfig } from './sheets';
import type { Item } from './schema';

export const CATALOG_TAG = 'catalog';

export type CatalogSnapshot = {
  items: readonly Item[];
  updatedAt: string;
  source: 'google-sheets' | 'mock';
};

async function loadCatalog(): Promise<CatalogSnapshot> {
  if (!hasSheetConfig()) {
    return { items: mockCatalog, updatedAt: new Date().toISOString(), source: 'mock' };
  }

  return {
    items: await fetchCatalogFromSheets(),
    updatedAt: new Date().toISOString(),
    source: 'google-sheets',
  };
}

const getCachedCatalog = unstable_cache(loadCatalog, ['catalog-v1'], {
  tags: [CATALOG_TAG],
  revalidate: 86_400,
});

export const getCatalog = cache(getCachedCatalog);

export const getCatalogItem = cache(async (slug: string) => {
  const catalog = await getCatalog();
  return catalog.items.find((item) => item.slug === slug);
});
