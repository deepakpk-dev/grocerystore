import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisitBlock } from '@/components/VisitBlock';

describe('VisitBlock', () => {
  it('renders address, hours summary, and contact links', () => {
    render(<VisitBlock />);
    expect(screen.getByText('Visit')).toBeInTheDocument();
    expect(screen.getByText(/mustermannstraße/i)).toBeInTheDocument();
    expect(screen.getByText(/mon–sat 09:00–20:00/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
  });

  it('uses tel: scheme for the call link', () => {
    render(<VisitBlock />);
    const link = screen.getByRole('link', { name: /call/i });
    expect(link.getAttribute('href')).toMatch(/^tel:/);
  });
});
