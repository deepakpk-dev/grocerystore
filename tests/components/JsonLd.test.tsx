import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from '@/components/JsonLd';

describe('JsonLd', () => {
  it('renders a script tag with serialized JSON-LD', () => {
    const { container } = render(<JsonLd data={{ '@type': 'WebPage', name: 'Home' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ '@type': 'WebPage', name: 'Home' });
  });
});
