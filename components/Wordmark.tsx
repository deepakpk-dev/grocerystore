import Link from 'next/link';

const SIZE_CLS = {
  sm: 'text-h2',
  md: 'text-display-m',
  lg: 'text-display-l',
} as const;

export function Wordmark({ size = 'sm' }: { size?: keyof typeof SIZE_CLS }) {
  return (
    <Link href="/" className={`font-display ${SIZE_CLS[size]} text-text`}>
      Manokara
    </Link>
  );
}
