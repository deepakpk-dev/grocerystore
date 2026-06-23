import { notFound } from 'next/navigation';
import { mockCatalog } from '@/lib/mock-catalog';
import { categoryBySlug } from '@/lib/categories';
import { itemBody } from '@/lib/copy';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { StockChip } from '@/components/StockChip';
import { ItemCard } from '@/components/ItemCard';
import { VisitBlock } from '@/components/VisitBlock';

export function generateStaticParams() {
  return mockCatalog.map((i) => ({ slug: i.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function ItemPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = mockCatalog.find((i) => i.slug === slug);
  if (!item) notFound();

  const cat = categoryBySlug[item.category];
  const siblings = mockCatalog
    .filter((i) => i.category === item.category && i.slug !== item.slug)
    .slice(0, 3);
  const body = itemBody({ stock: item.stock, featured: item.featured });

  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <div className="pt-6">
          <Breadcrumb
            crumbs={[
              { href: '/', label: 'Home' },
              { href: `/${cat.slug}`, label: cat.display },
              { label: item.name },
            ]}
          />
        </div>

        <section className="pt-6 pb-10">
          <PhotoPlaceholder seed={item.slug} aspect="hero" />
          <h1 className="font-display text-display-l mt-6">{item.name}</h1>
          <div className="mt-3">
            <StockChip stock={item.stock} />
          </div>
          <p className="text-display-m font-display mt-4">
            €{item.price.toFixed(2)}
            <span className="text-caption text-text-subtle font-body font-normal"> / {item.unit}</span>
          </p>
          {item.origin && (
            <p className="text-label uppercase text-text-subtle mt-3">Origin · {item.origin}</p>
          )}
          {item.tamil && (
            <p className="text-label uppercase text-text-subtle mt-1">Tamil · {item.tamil}</p>
          )}
          <div className="text-body text-text-muted mt-5 space-y-1">
            {body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-4">Also in {cat.display.toLowerCase()}</p>
          <div className="grid grid-cols-3 gap-3">
            {siblings.map((sib) => (
              <ItemCard key={sib.slug} item={sib} compact />
            ))}
          </div>
        </section>

        <VisitBlock />
      </main>
    </>
  );
}
