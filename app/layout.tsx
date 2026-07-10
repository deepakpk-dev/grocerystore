import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SITE_URL, groceryStoreJsonLd } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Manokara Stores · Fresh South-Asian groceries · Stuttgart',
    template: '%s · Manokara Stores Stuttgart',
  },
  description:
    'Live stock from a Stuttgart South-Asian specialty grocer — vegetables, fruits, fish, meat, and dry goods. Updated each morning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-bg text-text antialiased">
        <JsonLd data={groceryStoreJsonLd()} />
        {children}
      </body>
    </html>
  );
}
