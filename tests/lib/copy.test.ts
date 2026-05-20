import { describe, it, expect } from 'vitest';
import { itemBody } from '@/lib/copy';

describe('itemBody', () => {
  it('renders an in-stock item without featured flag', () => {
    const lines = itemBody({ stock: 'in-stock', featured: false });
    expect(lines).toEqual(['Restocked this morning.']);
  });

  it('renders a low-stock item', () => {
    const lines = itemBody({ stock: 'low', featured: false });
    expect(lines).toEqual(['Limited stock today.']);
  });

  it('renders an out-of-stock item', () => {
    const lines = itemBody({ stock: 'out-of-stock', featured: false });
    expect(lines).toEqual(['Out of stock — check back tomorrow.']);
  });

  it('appends "Featured this week." for featured items', () => {
    const lines = itemBody({ stock: 'in-stock', featured: true });
    expect(lines).toEqual(['Restocked this morning.', 'Featured this week.']);
  });

  it('does not append featured line for out-of-stock items', () => {
    const lines = itemBody({ stock: 'out-of-stock', featured: true });
    expect(lines).toEqual(['Out of stock — check back tomorrow.']);
  });
});
