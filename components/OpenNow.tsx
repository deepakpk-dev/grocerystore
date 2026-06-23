import { business } from '@/lib/business';
import { isOpenNow, nextOpenLabel } from '@/lib/time';

export function OpenNow({ now }: { now?: Date }) {
  const label = nextOpenLabel(business.hours, now);
  const isOpen = isOpenNow(business.hours, now);
  const cls = isOpen ? 'text-deep' : 'text-text-muted';
  return (
    <span className={`text-label uppercase font-semibold ${cls}`}>
      ● {label}
    </span>
  );
}
