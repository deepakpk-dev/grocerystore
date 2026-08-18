import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { JsonLd } from '@/components/JsonLd';
import { getCatalog } from '@/lib/catalog';
import { businessJsonLd, siteUrl } from '@/lib/metadata';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Manokara Stores · Fresh South-Asian groceries · Stuttgart',
    template: '%s · Manokara Stores',
  },
  description:
    'Live stock from a Stuttgart South-Asian specialty grocer — vegetables, fruits, fish, meat, and dry goods. Updated each morning.',
  alternates: { canonical: '/' },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await getCatalog();
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-bg text-text antialiased">
        <JsonLd data={businessJsonLd(catalog.updatedAt)} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
