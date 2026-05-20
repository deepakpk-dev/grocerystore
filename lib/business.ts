export type Hours = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  { open: string; close: string } | null
>;

export const business = {
  name: 'Manokara Stores',
  isMock: true,
  address: {
    street: 'Mustermannstraße 1',
    postal: '70173',
    city: 'Stuttgart',
    country: 'DE',
  },
  geo: { lat: 48.7758, lng: 9.1829 },
  hours: {
    mon: { open: '09:00', close: '20:00' },
    tue: { open: '09:00', close: '20:00' },
    wed: { open: '09:00', close: '20:00' },
    thu: { open: '09:00', close: '20:00' },
    fri: { open: '09:00', close: '20:00' },
    sat: { open: '09:00', close: '20:00' },
    sun: null,
  } satisfies Hours,
  phone: '+49 711 000 000',
  whatsapp: '+4971100000',
  instagram: 'manokara.stores',
  transit: [
    'S-Bahn Hauptbahnhof — 6 min walk',
    'U-Bahn Charlottenplatz — 4 min walk',
    'Free 30-min street parking on Marienstraße',
  ],
} as const;
