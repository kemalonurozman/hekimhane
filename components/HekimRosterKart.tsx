'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Doktor } from '@/lib/types';
import CompareButton from '@/components/CompareButton';

function Stars({ rat }: { rat: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`fa-${i <= Math.round(rat) ? 'solid' : 'regular'} fa-star`}
          style={{ fontSize: 11, color: i <= Math.round(rat) ? '#D4A843' : '#D8D8DE' }} />
      ))}
    </span>
  );
}

/**
 * Hastane roster'ı (Hekimler sekmesi) için sade, profesyonel hekim kartı.
 * Doktorlar zaten bölüme göre gruplandığından uzmanlık rozeti/etiket tekrarlanmaz.
 */
export default function HekimRosterKart({ doktor: d }: { doktor: Doktor }) {
  const router = useRouter();
  const fullName    = `${d.ad} ${d.soyad}`.trim();
  const displayName = d.unvan ? `${d.unvan} ${fullName}` : fullName;
  const url         = d.slug ? `/doktorlar/${d.slug}` : `/doktorlar/${d.id}`;
  const hasRating   = (d.rev || 0) > 0;

  return (
    <div
      onClick={() => router.push(url)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 13,
        background: 'white', border: '1px solid var(--border)', borderRadius: 14,
        padding: '13px 15px', cursor: 'pointer', minWidth: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'box-shadow .16s, transform .16s, border-color .16s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#D8DEE9'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <CompareButton item={{
        type: 'doktor', id: d.id, name: displayName, url,
        rat: d.rat, rev: d.rev, il: d.il, ilce: d.ilce, tel: d.tel, image: d.photo,
        premium: d.premium, online: d.online, verified: d.verified,
        spec: d.spec, fee: d.fee, exp: d.exp, clinic_name: d.clinic_name,
      }} />

      {/* Avatar — onaylı hekimde dönen halka */}
      <div className={d.verified ? 'hk-ring' : undefined} style={{ flexShrink: 0 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
          border: '2px solid var(--border)', position: 'relative',
          background: d.photo ? 'transparent' : 'linear-gradient(135deg, var(--navy), var(--navy2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {d.photo
            ? <Image src={d.photo} alt={displayName} fill sizes="52px" style={{ objectFit: 'cover' }} />
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        </div>
      </div>

      {/* Bilgi */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, minWidth: 0 }}>
          {hasRating ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{(d.rat || 0).toFixed(1)}</span>
              <Stars rat={d.rat || 0} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>({d.rev})</span>
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {d.verified && <span style={{ color: '#166534', fontWeight: 600 }}>✓ Onaylı</span>}
              Profili görüntüle
            </span>
          )}
        </div>
      </div>

      {/* Sağ ok — detay */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  );
}
