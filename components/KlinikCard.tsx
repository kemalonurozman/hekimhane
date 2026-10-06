'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Klinik } from '@/lib/types';
import PremiumBadge from '@/components/PremiumBadge';
import CompareButton from '@/components/CompareButton';
import HkAvatar from '@/components/HkAvatar';
import { puanYaz, AZ_DEGERLENDIRME_SINIRI } from '@/lib/hk';

/**
 * Klinik liste satırı — tasarım sistemi `DoctorRow`:
 * baş harfli avatar (veya logo) · ad · branş etiketleri (tek stil) · meta satırı
 * (konum, kurum türü, puan + değerlendirme sayısı) · "Profili gör" + "Ara".
 */
export default function KlinikCard({ klinik: k }: { klinik: Klinik }) {
  const router = useRouter();

  const profileUrl = k.slug
    ? `/klinikler/${encodeURIComponent(k.il || '').toLowerCase().replace(/%../g, s => s.toLowerCase())}/${encodeURIComponent(k.ilce || '').toLowerCase().replace(/%../g, s => s.toLowerCase())}/${k.slug}`
    : `/klinikler/${k.id}`;

  const specs = (k.specs || []).filter(Boolean);
  const konum = [k.ilce, k.il].filter(Boolean).join(', ');
  const adres = k.adres ? `${k.adres.slice(0, 60)}${k.adres.length > 60 ? '…' : ''}` : '';

  return (
    <article className={`hk-doctor hk-satir${k.premium ? ' hk-doctor--featured' : ''}`} onClick={() => router.push(profileUrl)}>
      <CompareButton item={{
        type: 'klinik', id: k.id, name: k.name, url: profileUrl,
        rat: k.rat, rev: k.rev, il: k.il, ilce: k.ilce, tel: k.tel, image: k.logo,
        premium: k.premium, online: k.online, acil: k.acil, claimed: k.claimed,
        typeLabel: k.type, specs: k.specs,
      }} />

      {/* Logo veya baş harfler — onaylı klinikte dönen halka */}
      <div className={k.claimed ? 'hk-ring' : undefined} style={{ position: 'relative', flexShrink: 0, borderRadius: '50%' }}>
        <HkAvatar src={k.logo} name={k.name} />
        {k.premium && <PremiumBadge />}
      </div>

      <div className="hk-doctor__body">
        <div className="hk-doctor__head hk-satir__head">
          <h3 className="hk-doctor__name">
            <Link href={profileUrl} onClick={e => e.stopPropagation()} style={{ color: 'inherit' }}>{k.name}</Link>
          </h3>
          {k.premium && <span className="hk-badge hk-badge--premium">PREMIUM</span>}
        </div>

        {specs.length > 0 && (
          <div className="hk-doctor__tags">
            {specs.slice(0, 3).map(s => <span key={s} className="hk-tag">{s}</span>)}
            {specs.length > 3 && <span className="hk-tag hk-tag--muted">+{specs.length - 3}</span>}
          </div>
        )}

        <div className="hk-doctor__meta">
          {(konum || adres) && (
            <span className="hk-doctor__loc">
              <i className="fa-solid fa-location-dot hk-icon" style={{ fontSize: 14 }} />
              {[konum, adres].filter(Boolean).join(' · ')}
            </span>
          )}
          {/* Kurum türü etiket değil, meta satırında */}
          {k.type && <span>{k.type}</span>}
          {k.rev > 0 && (
            <span className="hk-doctor__rating">
              <i className="fa-solid fa-star hk-icon" style={{ fontSize: 14 }} />
              <b>{puanYaz(k.rat)}</b> ({k.rev} değerlendirme)
            </span>
          )}
          {k.rev > 0 && k.rev < AZ_DEGERLENDIRME_SINIRI && <span className="hk-doctor__few">Az değerlendirme</span>}
          {k.claimed && <span style={{ color: 'var(--success)', fontWeight: 600 }}><i className="fa-solid fa-circle-check" style={{ fontSize: 13 }} /> Onaylı</span>}
          {k.online && <span style={{ color: 'var(--success)', fontWeight: 600 }}><i className="fa-solid fa-calendar-check" style={{ fontSize: 13 }} /> Online randevu</span>}
          {k.acil && <span style={{ color: 'var(--danger)', fontWeight: 600 }}><i className="fa-solid fa-truck-medical" style={{ fontSize: 13 }} /> Acil</span>}
        </div>

        <div className="hk-doctor__act">
          <Link href={profileUrl} onClick={e => e.stopPropagation()} className="hk-btn hk-btn--sm hk-btn--primary">Profili gör</Link>
          {k.tel && (
            <a href={`tel:${k.tel.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()} className="hk-btn hk-btn--sm hk-btn--secondary" aria-label={`${k.name} — telefonla ara`}>
              <i className="fa-solid fa-phone" style={{ fontSize: 12 }} /> Ara
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
