import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockChip } from '@/components/StockChip';

describe('StockChip', () => {
  it('renders "In stock" with deep color for in-stock', () => {
    render(<StockChip stock="in-stock" />);
    const chip = screen.getByText(/in stock/i);
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-chip-in-text');
  });

  it('renders "Low" for low', () => {
    render(<StockChip stock="low" />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('renders "Out" for out-of-stock', () => {
    render(<StockChip stock="out-of-stock" />);
    expect(screen.getByText(/out/i)).toBeInTheDocument();
  });
});
