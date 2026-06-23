import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  it('renders three anchor links with counts', () => {
    render(<FilterBar all={24} inStock={18} featured={4} />);
    expect(screen.getByRole('link', { name: /all · 24/i })).toHaveAttribute('href', '#all');
    expect(screen.getByRole('link', { name: /in stock · 18/i })).toHaveAttribute('href', '#in-stock');
    expect(screen.getByRole('link', { name: /featured · 4/i })).toHaveAttribute('href', '#featured');
  });
});
