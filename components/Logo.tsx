// Hekimhane marka bileşenleri — tek kaynak.
// İşaret: "Akışkan H" (marka kimliği v1) — 48 birimlik ızgarada iki yaprak
// sütun + aralarından akan altın dalga. Boşluk dalganın yalnız bir kenarında
// (sol üst, sağ alt); gerçek şeffaf boşluk için SVG mask kullanılır, böylece
// işaret her zeminde (cam navbar, lacivert footer) doğru görünür.
import { useId } from 'react';

export const HK_LOGO = {
  left:  'M8 15C8 10.5 11.6 7 16.1 7H18.3V33C18.3 37.5 14.7 41 10.2 41H8Z',
  right: 'M29.7 15C29.7 10.5 33.3 7 37.8 7H40V33C40 37.5 36.4 41 31.9 41H29.7Z',
  band:  'M8 31.6C10.6 25.8 15 20.2 24 20.2C31 20.4 37.2 22.2 40 14L40 19C38 28.5 26 28.6 19 27.35C13 27.35 9.4 31.5 8 36.2Z',
  gap:   'M7.4 33.03L8 31.6C10.6 25.8 15 20.2 24 20.2M19 27.35C26 28.6 38 28.5 40 19L40.2 18',
} as const;

export const HK_RENK = { navy: '#12294D', gold: '#C9A04A', gold300: '#DEC283' } as const;

// Dental placeholder glifi (viewBox 40) — kart/blog yer tutucularında kullanılır.
const TOOTH =
  'M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z';

/** Yalnızca diş glifi — kart placeholder'ları vb. için. Tek renk. */
export function ToothGlyph({ size = 24, fill = 'currentColor' }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d={TOOTH} fill={fill} />
    </svg>
  );
}

/** Marka işareti (sembol) — şeffaf zemin.
 *  `dark`: lacivert zemin üstü → beyaz sütun + Altın 300 dalga. */
export function LogoMark({ size = 34, dark = false, ink, gold }: { size?: number; dark?: boolean; ink?: string; gold?: string }) {
  const id = useId().replace(/:/g, '');
  const murekkep = ink || (dark ? '#FFFFFF' : HK_RENK.navy);
  const dalga = gold || (dark ? HK_RENK.gold300 : HK_RENK.gold);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={{ display: 'block', flex: 'none' }}>
      <defs>
        <mask id={`hkgap${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <rect width="48" height="48" fill="#fff" />
          <path d={HK_LOGO.gap} stroke="#000" strokeWidth="1.6" fill="none" />
        </mask>
      </defs>
      <g mask={`url(#hkgap${id})`}>
        <path d={HK_LOGO.left} fill={murekkep} />
        <path d={HK_LOGO.right} fill={murekkep} />
      </g>
      <path d={HK_LOGO.band} fill={dalga} />
    </svg>
  );
}

/** Yatay ana logo: sembol + "hekimhane" yazı işareti (Manrope Bold, −%3,5).
 *  `tld`: altında aralıklı "hekimhane.com.tr" satırı (kılavuzdaki yatay ana düzen). */
export function Logo({ size = 34, dark = false, tld = false }: { size?: number; dark?: boolean; tld?: boolean }) {
  const ink = dark ? '#FFFFFF' : HK_RENK.navy;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.26 }}>
      <LogoMark size={size} dark={dark} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: size * 0.08 }}>
        <span style={{
          fontFamily: 'var(--font-manrope), Manrope, "SF Pro Display", system-ui, sans-serif',
          fontWeight: 700, fontSize: size * 0.66, letterSpacing: '-0.035em', lineHeight: 1, color: ink,
        }}>
          hekimhane
        </span>
        {tld && (
          <span style={{
            fontFamily: 'var(--font-manrope), Manrope, system-ui, sans-serif',
            fontWeight: 500, fontSize: size * 0.15, letterSpacing: '0.32em', paddingLeft: '0.1em',
            color: dark ? '#C1CEE2' : '#586273',
          }}>
            hekimhane.com.tr
          </span>
        )}
      </span>
    </span>
  );
}
