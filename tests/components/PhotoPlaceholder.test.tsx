import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

describe('PhotoPlaceholder', () => {
  it('produces a stable gradient for the same seed', () => {
    const { container: a } = render(<PhotoPlaceholder seed="okra" />);
    const { container: b } = render(<PhotoPlaceholder seed="okra" />);
    const styleA = (a.firstChild as HTMLElement).getAttribute('style');
    const styleB = (b.firstChild as HTMLElement).getAttribute('style');
    expect(styleA).toBe(styleB);
  });

  it('produces a different gradient for different seeds', () => {
    const { container: a } = render(<PhotoPlaceholder seed="okra" />);
    const { container: b } = render(<PhotoPlaceholder seed="mango" />);
    const styleA = (a.firstChild as HTMLElement).getAttribute('style');
    const styleB = (b.firstChild as HTMLElement).getAttribute('style');
    expect(styleA).not.toBe(styleB);
  });

  it('applies a default aspect class', () => {
    const { container } = render(<PhotoPlaceholder seed="x" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/aspect-\[/);
  });
});
