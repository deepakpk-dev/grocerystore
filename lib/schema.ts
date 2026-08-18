import { z } from 'zod';

export const categorySchema = z.enum(['vegetables', 'fruits', 'fish', 'meat', 'dry-goods']);
export const stockLevelSchema = z.enum(['in-stock', 'low', 'out-of-stock']);

export const itemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: categorySchema,
  stock: stockLevelSchema,
  price: z.number().positive(),
  unit: z.string().min(1),
  origin: z.string().min(1).optional(),
  photoUrl: z
    .string()
    .url()
    .refine(
      (value) => new URL(value).hostname.endsWith('.public.blob.vercel-storage.com'),
      'Photo URL must point to Vercel Blob.',
    )
    .optional(),
  featured: z.boolean().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type StockLevel = z.infer<typeof stockLevelSchema>;
export type Item = z.infer<typeof itemSchema>;

export type CategoryMeta = {
  slug: Category;
  display: string;
  blurb: string;
};
