import { business } from '@/lib/business';
import type { Hours } from '@/lib/business';

const DAY_KEYS: ReadonlyArray<keyof Hours> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' } as const;

function todayKey(now: Date): keyof Hours {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
  });
  const wd = fmt.format(now).toLowerCase().slice(0, 3);
  return wd as keyof Hours;
}

export function HoursTable({ now }: { now?: Date }) {
  const today = todayKey(now ?? new Date());
  return (
    <div className="grid gap-1 max-w-sm text-small">
      {DAY_KEYS.map((d) => {
        const slot = business.hours[d];
        const isToday = d === today;
        return (
          <div
            key={d}
            data-today={isToday}
            className={`flex justify-between py-1 px-2 rounded ${isToday ? 'bg-chip-low-bg text-chip-low-text font-semibold' : ''}`}
          >
            <span>{DAY_LABELS[d]}</span>
            <span>{slot ? `${slot.open}–${slot.close}` : 'Closed'}</span>
          </div>
        );
      })}
    </div>
  );
}
