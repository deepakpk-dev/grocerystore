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
