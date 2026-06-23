import { business } from '@/lib/business';

export function TransitNotes() {
  return (
    <ul className="space-y-2 text-body text-text-muted list-disc list-inside">
      {business.transit.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}
