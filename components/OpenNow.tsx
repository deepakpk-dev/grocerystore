'use client';

import { useEffect, useState } from 'react';
import { business } from '@/lib/business';
import { isOpenNow, nextOpenLabel } from '@/lib/time';

export function OpenNow({ now }: { now?: Date }) {
  const [currentTime, setCurrentTime] = useState(() => now ?? new Date());

  useEffect(() => {
    if (now) return;
    const update = () => setCurrentTime(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [now]);

  const label = nextOpenLabel(business.hours, currentTime);
  const isOpen = isOpenNow(business.hours, currentTime);
  const cls = isOpen ? 'text-deep' : 'text-text-muted';
  return (
    <span
      className={`text-label uppercase font-semibold ${cls}`}
      aria-live="polite"
      suppressHydrationWarning
    >
      ● {label}
    </span>
  );
}
