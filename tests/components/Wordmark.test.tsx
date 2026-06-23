import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wordmark } from '@/components/Wordmark';

describe('Wordmark', () => {
  it('renders the brand name', () => {
    render(<Wordmark />);
    expect(screen.getByText('Manokara')).toBeInTheDocument();
  });

  it('links to the homepage', () => {
    render(<Wordmark />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses display size class when size="lg"', () => {
    render(<Wordmark size="lg" />);
    expect(screen.getByText('Manokara')).toHaveClass('text-display-l');
  });
});
