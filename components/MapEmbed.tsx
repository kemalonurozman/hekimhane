'use client';

interface Props {
  lat: number;
  lng: number;
  name: string;
  mapsUrl?: string | null;
}

export default function MapEmbed({ lat, lng, name, mapsUrl }: Props) {
  if (!lat || !lng || (lat === 0 && lng === 0)) return null;

  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=tr`;
  const directUrl = mapsUrl || `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(27,58,105,.08)',
      }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="220"
          style={{ border: 'none', display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${name} harita konumu`}
        />
      </div>
      <a
        href={directUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '8px',
          padding: '9px',
          borderRadius: '9px',
          border: '1px solid var(--border)',
          background: 'white',
          fontSize: '12.5px',
          fontWeight: 600,
          color: 'var(--navy)',
          textDecoration: 'none',
        }}
      >
        <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--gold)' }} />
        Google Maps'te Aç
      </a>
    </div>
  );
}
