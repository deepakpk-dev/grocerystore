import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/Breadcrumb';

describe('Breadcrumb', () => {
  it('renders linked crumbs except the last', () => {
    render(
      <Breadcrumb
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/vegetables', label: 'Vegetables' },
          { label: 'Bitter gourd' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Vegetables' })).toHaveAttribute('href', '/vegetables');
    expect(screen.getByText('Bitter gourd')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Bitter gourd' })).toBeNull();
  });
});
