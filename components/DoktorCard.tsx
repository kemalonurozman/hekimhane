'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Doktor } from '@/lib/types';
import PremiumBadge from '@/components/PremiumBadge';
import CompareButton from '@/components/CompareButton';
import HkAvatar from '@/components/HkAvatar';
import { puanYaz, AZ_DEGERLENDIRME_SINIRI } from '@/lib/hk';

// İç etiketler (devlet-dis-hastanesi vb.) ziyaretçiye gösterilmez
const IC_ETIKET = new Set(['devlet-dis-hastanesi', 'universite-dis-hastanesi', 'bobath-terapisti']);

/**
 * Hekim liste satırı — tasarım sistemi `DoctorRow`:
 * fotoğraf veya baş harfler · unvanlı ad · branş etiketleri · meta (konum, kurum,
 * deneyim, ücret, puan + değerlendirme sayısı) · "Profili gör" + "Ara".
 */
export default function DoktorCard({ doktor: d }: { doktor: Doktor }) {
  const router = useRouter();

  const fullName    = `${d.ad} ${d.soyad}`.trim();
  const displayName = d.unvan ? `${d.unvan} ${fullName}` : fullName;
  const profileUrl  = d.slug ? `/doktorlar/${d.slug}` : `/doktorlar/${d.id}`;

  // Branş + görünür etiketler tek stil; branş ilk sırada, tekrar yok
  const etiketler = [d.spec, ...(d.tags || [])].filter((t): t is string => !!t && !IC_ETIKET.has(t))
    .filter((t, i, a) => a.findIndex(x => x.toLocaleLowerCase('tr') === t.toLocaleLowerCase('tr')) === i);

  return (
    <article className={`hk-doctor hk-satir${d.premium ? ' hk-doctor--featured' : ''}`} onClick={() => router.push(profileUrl)}>
      <CompareButton item={{
        type: 'doktor', id: d.id, name: displayName, url: profileUrl,
        rat: d.rat, rev: d.rev, il: d.il, ilce: d.ilce, tel: d.tel, image: d.photo,
        premium: d.premium, online: d.online, verified: d.verified,
        spec: d.spec, fee: d.fee, exp: d.exp, clinic_name: d.clinic_name,
      }} />

      {/* Fotoğraf veya baş harfler — onaylı hekimde dönen halka */}
      <div className={d.verified ? 'hk-ring' : undefined} style={{ position: 'relative', flexShrink: 0, borderRadius: '50%' }}>
        <HkAvatar src={d.photo} name={displayName} />
        {d.premium && <PremiumBadge />}
      </div>

      <div className="hk-doctor__body">
        <div className="hk-doctor__head hk-satir__head">
          <h3 className="hk-doctor__name">
            <Link href={profileUrl} onClick={e => e.stopPropagation()} style={{ color: 'inherit' }}>{displayName}</Link>
          </h3>
          {d.premium && <span className="hk-badge hk-badge--premium">PREMIUM</span>}
        </div>

        {etiketler.length > 0 && (
          <div className="hk-doctor__tags">
            {etiketler.slice(0, 3).map(t => <span key={t} className="hk-tag">{t}</span>)}
            {etiketler.length > 3 && <span className="hk-tag hk-tag--muted">+{etiketler.length - 3}</span>}
          </div>
        )}

        <div className="hk-doctor__meta">
          {(d.il || d.ilce || d.clinic_name) && (
            <span className="hk-doctor__loc">
              <i className="fa-solid fa-location-dot hk-icon" style={{ fontSize: 14 }} />
              {[d.clinic_name, [d.ilce, d.il].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
            </span>
          )}
          {d.exp > 0 && <span>{d.exp} yıl deneyim</span>}
          {d.fee > 0 && <span>Muayene {d.fee.toLocaleString('tr-TR')} ₺</span>}
          {d.rev > 0 && (
            <span className="hk-doctor__rating">
              <i className="fa-solid fa-star hk-icon" style={{ fontSize: 14 }} />
              <b>{puanYaz(d.rat)}</b> ({d.rev} değerlendirme)
            </span>
          )}
          {d.rev > 0 && d.rev < AZ_DEGERLENDIRME_SINIRI && <span className="hk-doctor__few">Az değerlendirme</span>}
          {d.verified && <span style={{ color: 'var(--success)', fontWeight: 600 }}><i className="fa-solid fa-circle-check" style={{ fontSize: 13 }} /> Onaylı</span>}
          {d.online && <span style={{ color: 'var(--success)', fontWeight: 600 }}><i className="fa-solid fa-calendar-check" style={{ fontSize: 13 }} /> Online randevu</span>}
        </div>

        <div className="hk-doctor__act">
          <Link href={profileUrl} onClick={e => e.stopPropagation()} className="hk-btn hk-btn--sm hk-btn--primary">Profili gör</Link>
          {d.tel && (
            <a href={`tel:${d.tel.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()} className="hk-btn hk-btn--sm hk-btn--secondary" aria-label={`${displayName} — telefonla ara`}>
              <i className="fa-solid fa-phone" style={{ fontSize: 12 }} /> Ara
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
