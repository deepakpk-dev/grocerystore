import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog, getCatalogItem } from '@/lib/catalog';
import { categoryBySlug } from '@/lib/categories';
import { itemBody } from '@/lib/copy';
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CatalogImage } from '@/components/CatalogImage';
import { StockChip } from '@/components/StockChip';
import { ItemCard } from '@/components/ItemCard';
import { VisitBlock } from '@/components/VisitBlock';

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.items.map((item) => ({ slug: item.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCatalogItem(slug);
  if (!item) return {};
  const stock = item.stock === 'out-of-stock' ? 'currently out of stock' : 'available today';
  return pageMetadata({
    title: `${item.name} in Stuttgart`,
    description: `${item.name} is ${stock} at Manokara Stores. €${item.price.toFixed(2)} per ${item.unit}.`,
    path: `/item/${item.slug}`,
  });
}

export default async function ItemPage({ params }: { params: Params }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const item = catalog.items.find((catalogItem) => catalogItem.slug === slug);
  if (!item) notFound();

  const cat = categoryBySlug[item.category];
  const siblings = catalog.items
    .filter((i) => i.category === item.category && i.slug !== item.slug)
    .slice(0, 3);
  const body = itemBody({ stock: item.stock, featured: item.featured });

  return (
    <>
      <JsonLd data={productJsonLd(item, catalog.updatedAt)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: cat.display, path: `/${cat.slug}` },
            { name: item.name, path: `/item/${item.slug}` },
          ],
          catalog.updatedAt,
        )}
      />
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
          <CatalogImage
            src={item.photoUrl}
            alt={item.name}
            seed={item.slug}
            aspect="hero"
            priority
          />
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
