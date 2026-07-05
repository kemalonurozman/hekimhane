import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hekimhane — Türkiye Sağlık Rehberi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #071A2E 0%, #0E2D55 45%, #163D6E 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#D4A843',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1B3A69',
              fontSize: 52,
              fontWeight: 800,
            }}
          >
            +
          </div>
          <div style={{ color: 'white', fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
            Hekimhane
          </div>
        </div>

        <div
          style={{
            color: 'white',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          Türkiye Sağlık Rehberi
        </div>
        <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 26 }}>
          1.000+ klinik · 1.800+ hastane · 1.500+ doktor · 8.700+ eczane
        </div>

        <div
          style={{
            marginTop: 44,
            padding: '14px 36px',
            borderRadius: 14,
            background: '#D4A843',
            color: 'white',
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          hekimhane.com.tr
        </div>
      </div>
    ),
    { ...size }
  );
}
