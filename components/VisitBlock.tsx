import { business } from '@/lib/business';

export function VisitBlock() {
  return (
    <section className="bg-text text-bg rounded-card p-6 mt-12">
      <p className="font-display text-display-m mb-3">Visit</p>
      <p className="text-body">{business.address.street}</p>
      <p className="text-body text-bg/70">
        {business.address.postal} {business.address.city}
      </p>
      <p className="text-small text-bg/70 mt-3">Mon–Sat 09:00–20:00 · Sun closed</p>
      <div className="flex gap-4 mt-4 text-small">
        <a href={`tel:${business.phone}`} className="underline">Call</a>
        <a
          href={`https://wa.me/${business.whatsapp.replace('+', '')}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          href={`https://instagram.com/${business.instagram}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      </div>
    </section>
  );
}
