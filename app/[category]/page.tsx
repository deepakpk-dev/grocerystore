import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, categoryBySlug } from '@/lib/categories';
import { getCatalog } from '@/lib/catalog';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/metadata';
import type { Category } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryHero } from '@/components/CategoryHero';
import { FilterBar } from '@/components/FilterBar';
import { ItemCard } from '@/components/ItemCard';
import { VisitBlock } from '@/components/VisitBlock';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryBySlug[category as Category];
  if (!meta) return {};
  return pageMetadata({
    title: `${meta.display} in stock today`,
    description: `${meta.blurb} See current availability and prices at Manokara Stores in Stuttgart.`,
    path: `/${meta.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const meta = categoryBySlug[category as Category];
  if (!meta) notFound();

  const catalog = await getCatalog();
  const items = catalog.items.filter((item) => item.category === meta.slug);
  const inStock = items.filter((i) => i.stock === 'in-stock');
  const featured = items.filter((i) => i.featured);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: meta.display, path: `/${meta.slug}` },
          ],
          catalog.updatedAt,
        )}
      />
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <div className="pt-6">
          <Breadcrumb crumbs={[{ href: '/', label: 'Home' }, { label: meta.display }]} />
        </div>

        <CategoryHero
          slug={meta.slug}
          display={meta.display}
          blurb={meta.blurb}
          total={items.length}
          inStock={inStock.length}
        />

        <FilterBar all={items.length} inStock={inStock.length} featured={featured.length} />

        <section id="all" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">All · {items.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section id="in-stock" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">In stock · {inStock.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inStock.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section id="featured" className="pb-10 scroll-mt-24">
          <p className="text-label uppercase text-text-subtle mb-4">Featured · {featured.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
