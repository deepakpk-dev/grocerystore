import { business } from '@/lib/business';
import { MockRibbon } from '@/components/MockRibbon';
import { TopBar } from '@/components/TopBar';
import { HoursTable } from '@/components/HoursTable';
import { ContactRows } from '@/components/ContactRows';
import { TransitNotes } from '@/components/TransitNotes';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

export default function VisitPage() {
  return (
    <>
      <MockRibbon />
      <TopBar />
      <main className="px-5 md:px-8 max-w-3xl mx-auto pb-section">
        <section className="pt-12 pb-10">
          <h1 className="font-display text-display-l">Visit.</h1>
          <p className="font-display text-display-m mt-4">{business.address.street}</p>
          <p className="text-body text-text-muted">
            {business.address.postal} {business.address.city}
          </p>
        </section>

        <section className="pb-10">
          <PhotoPlaceholder seed="visit-map" aspect="hero" />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Hours</p>
          <HoursTable />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Contact</p>
          <ContactRows />
        </section>

        <section className="pb-10">
          <p className="text-label uppercase text-text-subtle mb-3">Transit</p>
          <TransitNotes />
        </section>
      </main>
    </>
  );
}
