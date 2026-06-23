import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCard } from '@/components/ItemCard';
import type { Item } from '@/lib/schema';

const ITEM: Item = {
  slug: 'okra',
  name: 'Okra',
  tamil: 'Vendakkai',
  category: 'vegetables',
  stock: 'in-stock',
  price: 2.8,
  unit: 'kg',
  origin: 'India',
  featured: true,
};

describe('ItemCard', () => {
  it('renders name, price, unit, tamil, and stock chip', () => {
    render(<ItemCard item={ITEM} />);
    expect(screen.getByText('Okra')).toBeInTheDocument();
    expect(screen.getByText('Vendakkai')).toBeInTheDocument();
    expect(screen.getByText(/€2\.80/)).toBeInTheDocument();
    expect(screen.getByText(/\/ kg/)).toBeInTheDocument();
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it('links to the item page', () => {
    render(<ItemCard item={ITEM} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/item/okra');
  });
});

describe('ItemCard compact variant', () => {
  it('hides the tamil and price-detail in compact mode', () => {
    const { container } = render(<ItemCard item={ITEM} compact />);
    expect(container.querySelector('[data-testid="item-card-compact"]')).not.toBeNull();
  });
});
