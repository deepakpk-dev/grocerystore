import type { Category } from '@/lib/schema';
import { PhotoPlaceholder } from './PhotoPlaceholder';

export function CategoryHero({
  slug,
  display,
  blurb,
  total,
  inStock,
}: {
  slug: Category;
  display: string;
  blurb: string;
  total: number;
  inStock: number;
}) {
  return (
    <section className="pt-8 pb-10">
      <h1 className="font-display text-display-l">{display}.</h1>
      <p className="text-body text-text-muted mt-2 max-w-md">{blurb}</p>
      <p className="text-caption text-text-subtle mt-2">
        {total} items · {inStock} in stock today
      </p>
      <div className="mt-6">
        <PhotoPlaceholder seed={`category-${slug}`} aspect="hero" />
      </div>
    </section>
  );
}
