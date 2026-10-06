'use client';

import SafeLogo from '@/components/SafeLogo';
import { basHarfler } from '@/lib/hk';

/**
 * Avatar — logo/fotoğraf varsa onu, yoksa ismin BAŞ HARFLERİNİ gösterir
 * (açık lacivert daire, lacivert Jakarta). Herkese aynı diş ikonu konmaz.
 * Görsel yüklenemezse (ölü URL) yine baş harflere düşer.
 */
export default function HkAvatar({ src, name, size = 64, kare = false, style }: {
  src?: string | null; name: string; size?: number; kare?: boolean; style?: React.CSSProperties;
}) {
  return (
    <span className="hk-avatar" aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.31), overflow: 'hidden', borderRadius: kare ? 'var(--radius-xl)' : undefined, ...style }}>
      <SafeLogo src={src} alt={name} fallback={basHarfler(name)} />
    </span>
  );
}
