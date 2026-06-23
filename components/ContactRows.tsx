import { business } from '@/lib/business';

const ROW_CLS = 'flex justify-between items-baseline py-3 border-b border-line text-body';

export function ContactRows() {
  return (
    <div>
      <a className={ROW_CLS} href={`tel:${business.phone}`} aria-label="Phone">
        <span className="text-text-muted">Phone</span>
        <span className="text-text">{business.phone}</span>
      </a>
      <a
        className={ROW_CLS}
        href={`https://wa.me/${business.whatsapp.replace('+', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <span className="text-text-muted">WhatsApp</span>
        <span className="text-text">{business.whatsapp}</span>
      </a>
      <a
        className={ROW_CLS}
        href={`https://instagram.com/${business.instagram}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <span className="text-text-muted">Instagram</span>
        <span className="text-text">@{business.instagram}</span>
      </a>
    </div>
  );
}
