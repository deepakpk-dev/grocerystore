import { describe, it, expect } from 'vitest';
import { isOpenNow, nextOpenLabel } from '@/lib/time';
import type { Hours } from '@/lib/business';

const STANDARD_HOURS: Hours = {
  mon: { open: '09:00', close: '20:00' },
  tue: { open: '09:00', close: '20:00' },
  wed: { open: '09:00', close: '20:00' },
  thu: { open: '09:00', close: '20:00' },
  fri: { open: '09:00', close: '20:00' },
  sat: { open: '09:00', close: '20:00' },
  sun: null,
};

// Berlin is UTC+1 in winter, UTC+2 in summer.
// 2026-04-25 (Saturday) is in summer time → Berlin = UTC+2.
// 2026-01-10 (Saturday) is in winter time → Berlin = UTC+1.

describe('isOpenNow', () => {
  it('returns true on Saturday at 14:00 Berlin time (summer DST)', () => {
    // 14:00 Berlin = 12:00 UTC on 2026-04-25
    const now = new Date('2026-04-25T12:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(true);
  });

  it('returns false on Sunday afternoon', () => {
    // 14:00 Berlin = 12:00 UTC on 2026-04-26 (Sun)
    const now = new Date('2026-04-26T12:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('returns false at 08:00 Berlin time (before open)', () => {
    // 08:00 Berlin = 06:00 UTC on 2026-04-25 (Sat, summer)
    const now = new Date('2026-04-25T06:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('returns false at 20:30 Berlin time (after close)', () => {
    // 20:30 Berlin = 18:30 UTC on 2026-04-25
    const now = new Date('2026-04-25T18:30:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(false);
  });

  it('handles winter time correctly (UTC+1)', () => {
    // Saturday 2026-01-10 at 14:00 Berlin = 13:00 UTC
    const now = new Date('2026-01-10T13:00:00Z');
    expect(isOpenNow(STANDARD_HOURS, now)).toBe(true);
  });
});

describe('nextOpenLabel', () => {
  it('returns "Closes 8pm" when open', () => {
    const now = new Date('2026-04-25T12:00:00Z'); // Sat 14:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Open · closes 8pm');
  });

  it('returns "Opens Monday 9am" on Sunday afternoon', () => {
    const now = new Date('2026-04-26T12:00:00Z'); // Sun 14:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Closed · opens Mon 9am');
  });

  it('returns "Opens 9am" on Saturday before open', () => {
    const now = new Date('2026-04-25T05:00:00Z'); // Sat 07:00 Berlin
    expect(nextOpenLabel(STANDARD_HOURS, now)).toBe('Closed · opens 9am');
  });
});
