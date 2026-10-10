// Hekimhane ikon bileşeni — tasarım kılavuzundaki set (lib/hk-icons.ts).
// Hook kullanmaz: Server ve Client Component'lerde aynen çalışır.
// Renk: `color` (taban, varsayılan currentColor) + `accent` (altın detay).
// `active` → dolgulu (seçili) varyant; iç detaylar `bg` rengine döner.
import { HK_IKONLAR, HK_TONLAR, type HkIkon, type HkIkonAdi, type HkIkonParca } from '@/lib/hk-icons';

export type { HkIkonAdi };

interface Props {
  name: HkIkonAdi;
  size?: number;
  color?: string;
  /** Altın detay rengi. `false` → tek renk (taban rengiyle çizilir). */
  accent?: string | false;
  /** Dolgulu varyantta iç detayların rengi (ikonun durduğu zemin). */
  bg?: string;
  active?: boolean;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

export default function HkIcon({
  name, size = 24, color = 'currentColor', accent = '#C9A04A', bg = '#FFFFFF',
  active = false, strokeWidth = 1.5, className, title,
}: Props) {
  const ic: HkIkon | undefined = HK_IKONLAR[name];
  if (!ic) return <span style={{ display: 'inline-block', width: size, height: size }} />;
  const taban = ic.tone ? HK_TONLAR[ic.tone] : color;
  const altin = ic.tone || accent === false ? taban : accent;

  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={taban} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className ? `hk-icon ${className}` : 'hk-icon'}
      style={{ overflow: 'visible' }}
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
    >
      {ic.parts.map((p: HkIkonParca, i: number) => {
        const c = p.acc ? altin : taban;
        let stroke: string = c;
        let fill = 'none';
        if (p.dot) { fill = c; stroke = 'none'; }
        if (p.bgfill) fill = bg;
        if (active && p.body) { fill = p.fillAcc ? altin : c; if (p.fillAcc) stroke = altin; }
        if (active && p.on && !p.acc) { if (p.dot) fill = bg; else stroke = bg; }
        if (p.tag === 'morph' && !active) return null;
        if (p.tag === 'hideOnActive' && active) return null;
        const Tag = p.t;
        return <Tag key={i} {...(p.a as Record<string, string | number>)} fill={fill} stroke={stroke} />;
      })}
    </svg>
  );
}
