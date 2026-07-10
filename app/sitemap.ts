import type { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { mockCatalog } from '@/lib/mock-catalog';
import { absoluteUrl, CATALOG_UPDATED } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CATALOG_UPDATED);
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/visit'), lastModified, changeFrequency: 'monthly', priority: 0.6 },
    ...categories.map((cat) => ({
      url: absoluteUrl(`/${cat.slug}`),
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...mockCatalog.map((item) => ({
      url: absoluteUrl(`/item/${item.slug}`),
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
