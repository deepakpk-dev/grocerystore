export function MockRibbon() {
  if (process.env.NEXT_PUBLIC_HIDE_MOCK_RIBBON === '1') return null;
  return (
    <div className="bg-chip-low-bg text-chip-low-text text-[10px] tracking-[0.14em] uppercase font-semibold text-center py-1">
      Mock · sample data
    </div>
  );
}
