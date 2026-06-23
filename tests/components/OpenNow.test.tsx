import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OpenNow } from '@/components/OpenNow';

describe('OpenNow', () => {
  it('renders the open label for a Saturday afternoon', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat 14:00 Berlin (summer)
    render(<OpenNow now={now} />);
    expect(screen.getByText(/open · closes 8pm/i)).toBeInTheDocument();
  });

  it('renders the closed label for a Sunday afternoon', () => {
    const now = new Date('2026-04-26T12:00:00Z'); // Sun 14:00 Berlin
    render(<OpenNow now={now} />);
    expect(screen.getByText(/closed · opens mon 9am/i)).toBeInTheDocument();
  });

  it('uses the deep color when open', () => {
    const now = new Date('2026-04-25T12:00:00Z');
    render(<OpenNow now={now} />);
    expect(screen.getByText(/open ·/i)).toHaveClass('text-deep');
  });
});
