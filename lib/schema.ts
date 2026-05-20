import { z } from "zod";

export const CATEGORIES = [
  "vegetables",
  "fruits",
  "fish",
  "meat",
  "dry-goods",
] as const;

export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  vegetables: "Vegetables",
  fruits: "Fruits",
  fish: "Fish",
  meat: "Meat",
  "dry-goods": "Dry Goods",
};

export const StockLevelSchema = z.enum(["In Stock", "Low", "Out of Stock"]);
export type StockLevel = z.infer<typeof StockLevelSchema>;

export const ItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: CategorySchema,
  stock: StockLevelSchema,
  price: z.number().nonnegative(),
  unit: z.string().min(1),
  origin: z.string().optional(),
  photoUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
});
export type Item = z.infer<typeof ItemSchema>;

export const CatalogSchema = z.object({
  items: z.array(ItemSchema),
  updatedAt: z.string(),
});
export type Catalog = z.infer<typeof CatalogSchema>;
