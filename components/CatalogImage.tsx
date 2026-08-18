import Image from 'next/image';
import { PhotoPlaceholder } from './PhotoPlaceholder';

const ASPECT_CLS = {
  hero: 'aspect-[16/9] md:aspect-[2/1]',
  card: 'aspect-[4/3]',
  square: 'aspect-square',
} as const;

export function CatalogImage({
  src,
  alt,
  seed,
  aspect = 'card',
  priority = false,
}: {
  src?: string;
  alt: string;
  seed: string;
  aspect?: keyof typeof ASPECT_CLS;
  priority?: boolean;
}) {
  if (!src) return <PhotoPlaceholder seed={seed} aspect={aspect} />;

  return (
    <div className={`relative overflow-hidden rounded-card ${ASPECT_CLS[aspect]}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={aspect === 'hero' ? '(max-width: 768px) 100vw, 768px' : '(max-width: 768px) 50vw, 256px'}
        className="object-cover"
      />
    </div>
  );
}
