import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoursTable } from '@/components/HoursTable';

describe('HoursTable', () => {
  it('renders all 7 days with hours or "Closed"', () => {
    render(<HoursTable />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getAllByText('09:00–20:00').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });

  it('highlights today\'s row', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat
    render(<HoursTable now={now} />);
    const todayCell = screen.getByText('Sat');
    expect(todayCell.closest('[data-today="true"]')).not.toBeNull();
  });
});
