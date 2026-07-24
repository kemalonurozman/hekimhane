// Hekimhane marka bileşenleri — tek kaynak.
// TOOTH: dengeli molar diş silüeti (viewBox 40). Küçük boyutlarda net okunur.

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

/** Marka işareti — sade: düz lacivert yuvarlak kare + beyaz diş. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect width="40" height="40" rx="11" fill="#1B3A69" />
      <path d={TOOTH} fill="#FFFFFF" />
    </svg>
  );
}

/** İşaret + kelime — navbar & footer için hazır kombinasyon.
 *  Modern, birleşik wordmark: "hekimhane" tek renk (hekim/hane ayrımı yok) +
 *  altın ".com.tr" vurgusu. Küçük harf → domain ile uyumlu, yumuşak, güncel. */
export function Logo({ size = 34, dark = false, tld = true }: { size?: number; dark?: boolean; tld?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <LogoMark size={size} />
      <span style={{
        display: 'inline-flex', alignItems: 'baseline',
        letterSpacing: '-0.9px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}>
        <span style={{
          fontSize: size * 0.56, fontWeight: 700,
          color: dark ? '#FFFFFF' : '#1B3A69',
        }}>
          hekimhane
        </span>
        {tld && (
          <span style={{
            fontSize: size * 0.36, fontWeight: 600,
            letterSpacing: '-0.2px', marginLeft: 1,
            color: '#D4A843',
          }}>
            .com.tr
          </span>
        )}
      </span>
    </span>
  );
}
