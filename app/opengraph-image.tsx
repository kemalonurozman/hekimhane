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
          <svg width="76" height="76" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="11" fill="#1B3A69" />
            <path
              d="M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z"
              fill="#FFFFFF"
            />
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: -2 }}>
            <span style={{ color: 'white', fontSize: 56, fontWeight: 700 }}>hekimhane</span>
            <span style={{ color: '#D4A843', fontSize: 34, fontWeight: 600, marginLeft: 3 }}>.com.tr</span>
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
          Türkiye Diş Hekimi & Klinik Rehberi
        </div>
        <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 26 }}>
          Size en yakın diş kliniğini ve uzman diş hekimini bulun
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
