import type { StockLevel } from '@/lib/schema';

const VARIANTS: Record<StockLevel, { label: string; cls: string; dot: string }> = {
  'in-stock':     { label: 'In stock', cls: 'bg-chip-in-bg text-chip-in-text', dot: 'bg-chip-in-text' },
  low:            { label: 'Low',      cls: 'bg-chip-low-bg text-chip-low-text', dot: 'bg-chip-low-dot' },
  'out-of-stock': { label: 'Out',      cls: 'bg-chip-out-bg text-chip-out-text', dot: 'bg-chip-out-dot' },
};

const SIZE_CLS = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-caption px-2.5 py-1 gap-1.5',
} as const;

export function StockChip({
  stock,
  size = 'md',
}: {
  stock: StockLevel;
  size?: keyof typeof SIZE_CLS;
}) {
  const v = VARIANTS[stock];
  return (
    <span className={`inline-flex items-center rounded-chip font-semibold ${v.cls} ${SIZE_CLS[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  );
}
