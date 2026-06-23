export function FilterBar({
  all,
  inStock,
  featured,
}: {
  all: number;
  inStock: number;
  featured: number;
}) {
  return (
    <div className="flex gap-5 text-caption border-b border-line pb-3 mb-6">
      <a href="#all" className="text-text font-semibold">All · {all}</a>
      <a href="#in-stock" className="text-text-muted hover:text-text">In stock · {inStock}</a>
      <a href="#featured" className="text-text-muted hover:text-text">Featured · {featured}</a>
    </div>
  );
}
