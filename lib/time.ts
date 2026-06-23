import type { Hours } from './business';

type DayKey = keyof Hours;

const DAY_ORDER: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function getBerlinParts(now: Date): { day: DayKey; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minuteStr = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const day = weekday.toLowerCase().slice(0, 3) as DayKey;
  const minutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
  return { day, minutes };
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function formatHourLabel(hhmm: string): string {
  const [h] = hhmm.split(':').map((n) => parseInt(n, 10));
  const period = h >= 12 ? 'pm' : 'am';
  const display = h % 12 || 12;
  return `${display}${period}`;
}

export function isOpenNow(hours: Hours, now: Date = new Date()): boolean {
  const { day, minutes } = getBerlinParts(now);
  const today = hours[day];
  if (!today) return false;
  return minutes >= hhmmToMinutes(today.open) && minutes < hhmmToMinutes(today.close);
}

export function nextOpenLabel(hours: Hours, now: Date = new Date()): string {
  const { day, minutes } = getBerlinParts(now);
  const today = hours[day];

  if (today && minutes >= hhmmToMinutes(today.open) && minutes < hhmmToMinutes(today.close)) {
    return `Open · closes ${formatHourLabel(today.close)}`;
  }

  // If still before today's open, that's our next opening.
  if (today && minutes < hhmmToMinutes(today.open)) {
    return `Closed · opens ${formatHourLabel(today.open)}`;
  }

  // Otherwise scan forward for the next open day.
  const startIdx = DAY_ORDER.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = DAY_ORDER[(startIdx + i) % 7];
    const slot = hours[next];
    if (slot) {
      return `Closed · opens ${DAY_LABELS[next]} ${formatHourLabel(slot.open)}`;
    }
  }
  return 'Closed';
}
