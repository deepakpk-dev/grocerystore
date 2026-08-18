import type { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { getCatalog } from '@/lib/catalog';
import { siteUrl } from '@/lib/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const lastModified = new Date(catalog.updatedAt);
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl('/'), lastModified, changeFrequency: 'daily', priority: 1 },
    { url: siteUrl('/visit'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: siteUrl(`/${category.slug}`),
    lastModified,
    changeFrequency: 'daily',
    priority: 0.9,
  }));
  const itemPages: MetadataRoute.Sitemap = catalog.items.map((item) => ({
    url: siteUrl(`/item/${item.slug}`),
    lastModified,
    changeFrequency: 'daily',
    priority: 0.7,
  }));
  return [...staticPages, ...categoryPages, ...itemPages];
}
