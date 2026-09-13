'use client';

import { useState, type ReactNode } from 'react';

/**
 * Bozuk/erişilemez görsellerde (ör. süresi dolmuş Google Places foto URL'leri →
 * 403/502) otomatik olarak markalı yedek içeriğe (baş harf / diş / bina ikonu)
 * düşen logo bileşeni. next/image optimizer'ı bilerek atlar: ölü upstream'de
 * optimizer 502 verip kırık ikon gösteriyordu; düz <img> onError ile güvenilir
 * biçimde yakalanır. Logolar küçük (52–116px) olduğundan optimizasyon kaybı ihmal
 * edilebilir.
 */
export default function SafeLogo({
  src,
  alt,
  fallback,
  loading = 'lazy',
}: {
  src?: string | null;
  alt: string;
  fallback: ReactNode;
  loading?: 'lazy' | 'eager';
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setBroken(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
