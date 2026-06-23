import { categories } from '@/lib/categories';
import { mockCatalog } from '@/lib/mock-catalog';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { ItemCard } from '@/components/ItemCard';
import { CategoryTile } from '@/components/CategoryTile';
import { VisitBlock } from '@/components/VisitBlock';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

export default function Home() {
  const featured = mockCatalog.filter((i) => i.featured).slice(0, 6);
  const inStockCount = mockCatalog.filter((i) => i.stock === 'in-stock').length;
  const updated = '08:32';

  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <section className="pt-12 md:pt-20 pb-12">
          <h1 className="font-display text-display-l md:text-display-xl">
            Fresh<br />this morning.
          </h1>
          <p className="text-body text-text-muted mt-4 max-w-md">
            South-Asian groceries restocked at {updated} · {inStockCount} items in stock today.
          </p>
          <div className="mt-8">
            <PhotoPlaceholder seed="home-hero" aspect="hero" />
          </div>
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">
            Fresh today · {featured.length}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section className="pb-12">
          <p className="text-label uppercase text-text-subtle mb-4">Browse</p>
          <div className="grid gap-2">
            {categories.map((cat) => (
              <CategoryTile
                key={cat.slug}
                slug={cat.slug}
                display={cat.display}
                count={mockCatalog.filter((i) => i.category === cat.slug).length}
              />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
