import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockRibbon } from '@/components/MockRibbon';

describe('MockRibbon', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON;
  });

  it('renders the ribbon by default', () => {
    render(<MockRibbon />);
    expect(screen.getByText(/mock · sample data/i)).toBeInTheDocument();
  });

  it('renders nothing when hidden flag is set', () => {
    process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON = '1';
    const { container } = render(<MockRibbon />);
    expect(container.firstChild).toBeNull();
  });
});
