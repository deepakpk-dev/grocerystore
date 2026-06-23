import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryHero } from '@/components/CategoryHero';

describe('CategoryHero', () => {
  it('renders the display name, blurb, and counts', () => {
    render(
      <CategoryHero
        slug="vegetables"
        display="Vegetables"
        blurb="South Indian gourds and greens."
        total={10}
        inStock={7}
      />,
    );
    expect(screen.getByText('Vegetables.')).toBeInTheDocument();
    expect(screen.getByText('South Indian gourds and greens.')).toBeInTheDocument();
    expect(screen.getByText(/10 items · 7 in stock today/i)).toBeInTheDocument();
  });
});
