export type Category = 'vegetables' | 'fruits' | 'fish' | 'meat' | 'dry-goods';

export type StockLevel = 'in-stock' | 'low' | 'out-of-stock';

export type Item = {
  slug: string;
  name: string;
  tamil?: string;
  category: Category;
  stock: StockLevel;
  price: number;
  unit: string;
  origin?: string;
  featured?: boolean;
};

export type CategoryMeta = {
  slug: Category;
  display: string;
  blurb: string;
};
