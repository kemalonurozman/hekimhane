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
          <svg width="84" height="84" viewBox="0 0 48 48" fill="none">
            <path d="M8 15C8 10.5 11.6 7 16.1 7H18.3V33C18.3 37.5 14.7 41 10.2 41H8Z" fill="#FFFFFF" />
            <path d="M29.7 15C29.7 10.5 33.3 7 37.8 7H40V33C40 37.5 36.4 41 31.9 41H29.7Z" fill="#FFFFFF" />
            <path d="M7.4 33.03L8 31.6C10.6 25.8 15 20.2 24 20.2M19 27.35C26 28.6 38 28.5 40 19L40.2 18" fill="none" stroke="#0E2D55" strokeWidth="1.6" />
            <path d="M8 31.6C10.6 25.8 15 20.2 24 20.2C31 20.4 37.2 22.2 40 14L40 19C38 28.5 26 28.6 19 27.35C13 27.35 9.4 31.5 8 36.2Z" fill="#DEC283" />
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: -2 }}>
            <span style={{ color: 'white', fontSize: 58, fontWeight: 700 }}>hekimhane</span>
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
            background: '#B8892F',
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
