import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactRows } from '@/components/ContactRows';

describe('ContactRows', () => {
  it('renders phone, whatsapp, and instagram links', () => {
    render(<ContactRows />);
    expect(screen.getByRole('link', { name: /phone/i }).getAttribute('href')).toMatch(/^tel:/);
    expect(screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toMatch(/wa\.me/);
    expect(screen.getByRole('link', { name: /instagram/i }).getAttribute('href')).toMatch(/instagram\.com/);
  });
});
