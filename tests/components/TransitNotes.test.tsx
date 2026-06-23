import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransitNotes } from '@/components/TransitNotes';

describe('TransitNotes', () => {
  it('renders all transit lines from business config', () => {
    render(<TransitNotes />);
    expect(screen.getByText(/s-bahn hauptbahnhof/i)).toBeInTheDocument();
    expect(screen.getByText(/u-bahn charlottenplatz/i)).toBeInTheDocument();
    expect(screen.getByText(/marienstraße/i)).toBeInTheDocument();
  });
});
