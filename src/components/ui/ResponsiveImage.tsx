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

function buildSrcSet(entry: GeneratedVariant, format: 'avif' | 'webp' | 'jpg') {
  const variantWidths = Object.keys(entry.variants).map(Number).sort((a, b) => a - b);
  const targets = preferredWidths
    .map((width) => variantWidths.find((w) => w >= width) ?? variantWidths[variantWidths.length - 1])
    .filter((v, i, arr) => v != null && arr.indexOf(v) === i);
  return targets
    .map((w) => {
      const url = entry.variants[String(w)]?.[format];
      return url ? `${url} ${w}w` : null;
    })
    .filter(Boolean)
    .join(', ');
}

function pickFallback(entry: GeneratedVariant): string {
  // Prefer the largest jpg variant over the original (which can be many MB).
  const variantWidths = Object.keys(entry.variants).map(Number).sort((a, b) => b - a);
  for (const w of variantWidths) {
    const jpg = entry.variants[String(w)]?.jpg;
    if (jpg) return jpg;
  }
  return entry.fallback;
}

export default function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  loading,
  priority,
  width,
  height,
  className,
  style,
  ...rest
}: ResponsiveImageProps) {
  const entry = generated[src];

  // No optimized variants → defer to next/image as-is.
  if (!entry) {
    return (
      <Image
        src={src}
        alt={alt as string}
        sizes={sizes}
        loading={loading}
        priority={priority}
        width={width as number}
        height={height as number}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  const avif = buildSrcSet(entry, 'avif');
  const webp = buildSrcSet(entry, 'webp');
  const jpgSrcSet = buildSrcSet(entry, 'jpg');
  const fallbackSrc = pickFallback(entry);

  // Use a plain <picture>/<img> pipeline so the browser only fetches one
  // resource. Wrapping next/image inside <picture> caused double-fetches
  // (next/image emits its own srcSet alongside the <source> elements).
  // We still preserve LQIP via a CSS background blur using the placeholder.
  const placeholderStyle = entry.placeholder
    ? {
        backgroundImage: `url(${entry.placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }
    : style;

  // Filter out next/image-only props that <img> doesn't understand.
  const {
    quality: _q,
    fill,
    placeholder: _p,
    blurDataURL: _b,
    onLoadingComplete: _olc,
    unoptimized: _u,
    ...imgProps
  } = rest as Record<string, unknown>;

  // When fill is used, the image must absolutely cover the parent container.
  const fillStyle = fill
    ? { position: 'absolute' as const, width: '100%', height: '100%' }
    : {};
  const combinedStyle = fill
    ? { ...fillStyle, ...(placeholderStyle as Record<string, unknown>) }
    : placeholderStyle;
  const fillClass = fill ? 'absolute inset-0 w-full h-full' : '';
  const resolvedClassName = [className, fillClass].filter(Boolean).join(' ');

  return (
    <picture className={fill ? 'absolute inset-0' : undefined}>
      {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        srcSet={jpgSrcSet || undefined}
        sizes={sizes}
        alt={alt as string}
        width={width as number | undefined}
        height={height as number | undefined}
        loading={priority ? 'eager' : (loading ?? 'lazy')}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={resolvedClassName}
        style={combinedStyle}
        {...(imgProps as Record<string, unknown>)}
      />
    </picture>
  );
}
