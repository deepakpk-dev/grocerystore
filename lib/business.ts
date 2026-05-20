// Single source of truth for shop NAP + contact info.
// PHASE 0 PLACEHOLDERS — replace with verified data in Phase 1.

export const business = {
  name: "Manokara Stores",
  tagline: "South-Asian groceries in Stuttgart",
  address: {
    street: "Placeholder Straße 0",
    postalCode: "70000",
    city: "Stuttgart",
    country: "Germany",
    countryCode: "DE",
  },
  geo: {
    latitude: 48.7758,
    longitude: 9.1829,
  },
  phone: "+49 000 0000000",
  whatsapp: "+49 000 0000000",
  instagram: "https://instagram.com/manokarastores",
  email: "hello@manokarastores.example",
  hours: [
    { day: "Mon", open: "09:00", close: "19:00" },
    { day: "Tue", open: "09:00", close: "19:00" },
    { day: "Wed", open: "09:00", close: "19:00" },
    { day: "Thu", open: "09:00", close: "19:00" },
    { day: "Fri", open: "09:00", close: "19:00" },
    { day: "Sat", open: "09:00", close: "19:00" },
    { day: "Sun", open: null, close: null },
  ],
  transit: "PLACEHOLDER — nearest U-Bahn / S-Bahn stop and walking time",
  timezone: "Europe/Berlin",
} as const;

export type BusinessHoursEntry = (typeof business.hours)[number];
