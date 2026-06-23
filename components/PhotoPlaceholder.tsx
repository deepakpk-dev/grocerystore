function seedAngle(seed: string): number {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

const ASPECT_CLS = {
  hero: 'aspect-[16/9] md:aspect-[2/1]',
  card: 'aspect-[4/3]',
  square: 'aspect-square',
  tall: 'aspect-[3/4]',
} as const;

export function PhotoPlaceholder({
  seed,
  aspect = 'card',
  className = '',
  children,
}: {
  seed: string;
  aspect?: keyof typeof ASPECT_CLS;
  className?: string;
  children?: React.ReactNode;
}) {
  const angle = seedAngle(seed);
  const style = {
    background: `linear-gradient(${angle}deg, #2d4a2d 0%, #4a7c4a 80%)`,
  };
  return (
    <div
      className={`rounded-card relative overflow-hidden ${ASPECT_CLS[aspect]} ${className}`}
      style={style}
    >
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(227,167,40,0.45), transparent 70%)',
        }}
      />
      {children && <div className="absolute inset-0 p-3 flex items-end">{children}</div>}
    </div>
  );
}
