import Link from 'next/link';
import type { Klinik } from '@/lib/types';

interface Props {
  klinik: Klinik;
}

function Stars({ rat }: { rat: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className={`fa-${i <= Math.round(rat) ? 'solid' : 'regular'} fa-star`}
          style={{ fontSize: '11px' }}
        />
      ))}
    </span>
  );
}

export default function KlinikCard({ klinik: k }: Props) {
  const profileUrl = k.slug
    ? `/klinikler/${encodeURIComponent(k.il || '')
        .toLowerCase()
        .replace(/%../g, s => s.toLowerCase())}/${encodeURIComponent(k.ilce || '')
        .toLowerCase()
        .replace(/%../g, s => s.toLowerCase())}/${k.slug}`
    : `/klinikler/${k.id}`;

  return (
    <Link href={profileUrl} style={{ textDecoration: 'none' }}>
      <div className="card" style={{
        padding: '20px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        cursor: 'pointer',
      }}>
        {/* İkon */}
        <div style={{
          width: '56px', height: '56px', flexShrink: 0,
          background: k.logo ? 'transparent' : 'linear-gradient(135deg, var(--navy), var(--navy2))',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {k.logo
            ? <img src={k.logo} alt={k.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🦷'
          }
        </div>

        {/* Bilgiler */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{
                fontWeight: 700, fontSize: '15px', color: 'var(--text)',
                marginBottom: '4px', lineHeight: 1.3,
              }}>
                {k.name}
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {k.type && (
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>{k.type}</span>
                )}
                {k.online && (
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>Online Randevu</span>
                )}
                {k.acil && (
                  <span className="badge badge-red" style={{ fontSize: '10px' }}>Acil</span>
                )}
                {k.claimed && (
                  <span className="badge" style={{
                    fontSize: '10px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0'
                  }}>✓ Onaylı</span>
                )}
              </div>
            </div>

            {/* Puan */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '22px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1,
              }}>
                {k.rat.toFixed(1)}
              </div>
              <Stars rat={k.rat} />
              {k.rev > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {k.rev} yorum
                </div>
              )}
            </div>
          </div>

          {/* Adres */}
          {(k.il || k.adres) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'var(--muted)', marginBottom: '8px',
            }}>
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: '11px' }} />
              <span>
                {[k.ilce, k.il].filter(Boolean).join(', ')}
                {k.adres && <span style={{ color: 'var(--border)' }}> · </span>}
                {k.adres && <span style={{ color: 'var(--muted)' }}>{k.adres.slice(0, 60)}{k.adres.length > 60 ? '...' : ''}</span>}
              </span>
            </div>
          )}

          {/* Uzmanlık etiketleri */}
          {k.specs && k.specs.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {k.specs.slice(0, 4).map(s => (
                <span key={s} className="badge badge-navy" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  {s}
                </span>
              ))}
              {k.specs.length > 4 && (
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  +{k.specs.length - 4} daha
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tel — Sağ taraf */}
        {k.tel && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <a
              href={`tel:${k.tel.replace(/\s/g, '')}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 600, color: 'var(--navy)',
                padding: '6px 12px', borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'white',
                transition: '0.15s',
              }}
            >
              <i className="fa-solid fa-phone" style={{ fontSize: '10px' }} />
              {k.tel}
            </a>
          </div>
        )}
      </div>
    </Link>
  );
}
