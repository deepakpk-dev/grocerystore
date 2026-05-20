export const colors = {
  bg: '#faf9f6',
  surface: '#ffffff',
  text: '#1a1a1a',
  'text-muted': '#6b6b66',
  'text-subtle': '#a8a59f',
  line: '#ebe9e3',
  accent: '#e3a728',
  'accent-deep': '#b87f12',
  deep: '#1f5132',
  warm: '#c2410c',
  'chip-in-bg': '#e7efe9',
  'chip-in-text': '#1f5132',
  'chip-low-bg': '#fbeed0',
  'chip-low-text': '#7a5410',
  'chip-low-dot': '#b87f12',
  'chip-out-bg': '#f1efeb',
  'chip-out-text': '#807a72',
  'chip-out-dot': '#b9b3aa',
} as const;

export const fontFamily = {
  display: ['var(--font-display)', 'Georgia', 'serif'],
  body: ['var(--font-body)', 'system-ui', 'sans-serif'],
} as const;

export const fontSize = {
  'display-xl': ['56px', { lineHeight: '1', letterSpacing: '-0.02em' }],
  'display-l':  ['40px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  'display-m':  ['28px', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
  h2:           ['22px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  h3:           ['17px', { lineHeight: '1.3' }],
  body:         ['16px', { lineHeight: '1.55' }],
  small:        ['14px', { lineHeight: '1.5' }],
  caption:      ['12px', { lineHeight: '1.4' }],
  label:        ['11px', { lineHeight: '1', letterSpacing: '0.12em' }],
} as const;

export const borderRadius = {
  chip: '9999px',
  button: '10px',
  card: '14px',
} as const;

export const spacing = {
  section: '6rem',
} as const;
