import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopBar } from '@/components/TopBar';

describe('TopBar', () => {
  it('renders the wordmark and an open-now indicator', () => {
    render(<TopBar />);
    expect(screen.getByText('Manokara')).toBeInTheDocument();
    expect(screen.getByText(/open · |closed · /i)).toBeInTheDocument();
  });
});
