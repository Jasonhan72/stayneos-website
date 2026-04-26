'use client';

import Image, { type ImageProps } from 'next/image';
import manifest from '@/lib/generated-image-manifest.json';

type GeneratedVariant = {
  fallback: string;
  width: number;
  height: number;
  placeholder: string | null;
  variants: Record<string, Record<string, string>>;
};

type ResponsiveImageProps = Omit<ImageProps, 'src' | 'placeholder' | 'blurDataURL'> & {
  src: string;
  sizes?: string;
};

const generated = manifest as Record<string, GeneratedVariant>;
const preferredWidths = [640, 1080, 1920];

function buildSrcSet(entry: GeneratedVariant | undefined, format: 'avif' | 'webp' | 'jpg') {
  if (!entry) return '';
  return preferredWidths
    .map((width) => {
      const actual = entry.variants[String(width)] ? width : Object.keys(entry.variants).map(Number).sort((a,b)=>a-b).find((w) => w >= width) ?? Number(Object.keys(entry.variants)[0]);
      const src = entry.variants[String(actual)]?.[format];
      return src ? `${src} ${actual}w` : null;
    })
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(', ');
}

export default function ResponsiveImage({ src, alt, sizes = '100vw', loading, priority, ...props }: ResponsiveImageProps) {
  const entry = generated[src];

  if (!entry) {
    return <Image src={src} alt={alt} sizes={sizes} loading={loading} priority={priority} {...props} />;
  }

  const avif = buildSrcSet(entry, 'avif');
  const webp = buildSrcSet(entry, 'webp');
  return (
    <picture>
      {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      <Image
        {...props}
        src={entry.fallback}
        alt={alt}
        sizes={sizes}
        loading={loading}
        priority={priority}
        placeholder={entry.placeholder ? 'blur' : 'empty'}
        blurDataURL={entry.placeholder ?? undefined}
      />
    </picture>
  );
}
