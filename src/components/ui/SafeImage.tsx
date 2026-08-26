'use client';

import { useState } from 'react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}

const categoryPlaceholders: Record<string, string> = {
  Diagnostic: '/placeholder.svg',
  Diagnostics: '/placeholder.svg',
  PPE: '/placeholder.svg',
  Surgical: '/placeholder.svg',
  'Patient Care': '/placeholder.svg',
  Pharmacy: '/placeholder.svg',
};

const defaultPlaceholder = '/placeholder.svg';

export function getValidImageUrl(
  src: string | null | undefined,
  category?: string
): string {
  /*
   * Accept:
   * 1. Local public files:
   *    /images/products/product.jpg
   *
   * 2. Remote URLs:
   *    https://...
   *
   * 3. Data URLs
   */
  if (
    src &&
    (
      src.startsWith('/') ||
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('data:')
    )
  ) {
    return src;
  }

  if (category && categoryPlaceholders[category]) {
    return categoryPlaceholders[category];
  }

  return defaultPlaceholder;
}

export default function SafeImage({
  src,
  alt,
  className = '',
  fallback = defaultPlaceholder,
}: SafeImageProps) {
  const [error, setError] = useState(false);

  const validSrc = error
    ? fallback
    : getValidImageUrl(src);

  return (
    <img
      src={validSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!error) {
          console.warn(`Image failed to load: ${src}`);
          setError(true);
        }
      }}
    />
  );
}
