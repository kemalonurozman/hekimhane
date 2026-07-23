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

/** Marka işareti — gradyanlı yuvarlak kare zemin + iki tonlu diş + ışıltı. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="hh-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A4E88" />
          <stop offset="1" stopColor="#152F58" />
        </linearGradient>
        <linearGradient id="hh-tooth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2D07A" />
          <stop offset="1" stopColor="#D4A843" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#hh-bg)" />
      <rect x="0.8" y="0.8" width="38.4" height="38.4" rx="10.2" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1.4" />
      <path d={TOOTH} fill="url(#hh-tooth)" />
      {/* Işıltı — sol üst tümsekte hafif parlaklık */}
      <ellipse cx="15.3" cy="12.6" rx="2" ry="2.9" fill="rgba(255,255,255,.30)" transform="rotate(-20 15.3 12.6)" />
    </svg>
  );
}

/** İşaret + kelime — navbar & footer için hazır kombinasyon. */
export function Logo({ size = 34, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 1,
        fontSize: size * 0.6, fontWeight: 800,
        letterSpacing: '-0.6px',
        color: dark ? '#FFFFFF' : '#16305A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}>
        Hekim<span style={{ color: '#D4A843' }}>hane</span>
      </span>
    </span>
  );
}
