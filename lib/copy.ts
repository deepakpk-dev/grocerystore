import type { StockLevel } from './schema';

const STOCK_LINES: Record<StockLevel, string> = {
  'in-stock': 'Restocked this morning.',
  low: 'Limited stock today.',
  'out-of-stock': 'Out of stock — check back tomorrow.',
};

export function itemBody(input: { stock: StockLevel; featured?: boolean }): string[] {
  const lines = [STOCK_LINES[input.stock]];
  if (input.featured && input.stock !== 'out-of-stock') {
    lines.push('Featured this week.');
  }
  return lines;
}
