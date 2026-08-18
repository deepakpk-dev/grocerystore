import Link from 'next/link';
import type { Item } from '@/lib/schema';
import { CatalogImage } from './CatalogImage';
import { StockChip } from './StockChip';

export function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  if (compact) {
    return (
      <Link
        data-testid="item-card-compact"
        href={`/item/${item.slug}`}
        className="block bg-surface border border-line rounded-card overflow-hidden hover:border-accent transition-colors"
      >
        <CatalogImage src={item.photoUrl} alt={item.name} seed={item.slug} aspect="square" />
        <div className="p-3">
          <div className="font-display text-h3 leading-tight">{item.name}</div>
          <StockChip stock={item.stock} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/item/${item.slug}`}
      className="block bg-surface border border-line rounded-card overflow-hidden hover:border-accent transition-colors"
    >
      <CatalogImage src={item.photoUrl} alt={item.name} seed={item.slug} aspect="card" />
      <div className="p-4">
        <div className="font-display text-h2">{item.name}</div>
        <div className="mt-2">
          <span className="text-small font-semibold">
            €{item.price.toFixed(2)}
            <span className="text-caption text-text-subtle font-normal"> / {item.unit}</span>
          </span>
        </div>
        <div className="mt-3">
          <StockChip stock={item.stock} />
        </div>
      </div>
    </Link>
  );
}
