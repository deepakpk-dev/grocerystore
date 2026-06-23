import Link from 'next/link';
import type { Category } from '@/lib/schema';

export function CategoryTile({
  slug,
  display,
  count,
}: {
  slug: Category;
  display: string;
  count: number;
}) {
  return (
    <Link
      href={`/${slug}`}
      className="flex justify-between items-baseline bg-surface border border-line rounded-card p-4 hover:border-accent transition-colors"
    >
      <span className="font-display text-h2">{display}</span>
      <span className="text-caption text-text-subtle">{count} items</span>
    </Link>
  );
}
