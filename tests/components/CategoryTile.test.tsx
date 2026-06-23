import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryTile } from '@/components/CategoryTile';

describe('CategoryTile', () => {
  it('renders the display name and item count', () => {
    render(<CategoryTile slug="vegetables" display="Vegetables" count={10} />);
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('10 items')).toBeInTheDocument();
  });

  it('links to the category page', () => {
    render(<CategoryTile slug="fish" display="Fish" count={5} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/fish');
  });
});
