// Profil kutusundan açılan formların (düzelt / kaldır / hatalı bilgi) ortak
// iskeleti — /sahiplen ile aynı "kf-" dili: kompakt üst bar, form + yan kart.
// Server Component. Form içeriği `children` ile gelir.
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import GeriDugme from '@/app/sahiplen/GeriDugme';
import { TUR_ETIKETI, type ProfilOzeti } from '@/lib/profil-ozet';

const TUR_IKON: Record<ProfilOzeti['tur'], HkIkonAdi> = {
  klinik: 'dentistry', hastane: 'hospital', eczane: 'pharmacy', doktor: 'doctor-profile',
};

export function ProfilBulunamadi({ metin }: { metin: string }) {
  return (
    <div className="kf-sayfa">
      <div className="kf-ust">
        <div className="kf-ust__ic">
          <Link href="/" className="kf-geri">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            Ana sayfa
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px 72px' }}>
        <div className="kf-grup__kutu" style={{ textAlign: 'center', justifyItems: 'center', padding: '36px 24px' }}>
          <HkIcon name="warning" size={48} />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>Profil bulunamadı</h1>
          <p className="kf-alt" style={{ margin: 0, fontSize: 15 }}>{metin}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilFormSayfasi({ profil, rozet, yan, children }: {
  profil: ProfilOzeti;
  /** Üst bardaki küçük etiket (ör. "Ücretsiz", "Kaldırma") */
  rozet?: string;
  /** Sağ sütun — kartlar */
  yan: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="kf-sayfa">
      <div className="kf-ust">
        <div className="kf-ust__ic">
          <GeriDugme fallbackHref={profil.href || '/'} />
          <div className="kf-ust__tur">
            <span className="kf-ust__ikon"><HkIcon name={TUR_IKON[profil.tur]} size={20} color="#fff" accent="#EBCF8D" /></span>
            <span className="kf-ust__ad">
              {profil.ad}
              <small>{TUR_ETIKETI[profil.tur]}{profil.il ? ` · ${profil.il}` : ''}</small>
            </span>
          </div>
          {rozet && <span className="vt-ucretsiz">{rozet}</span>}
        </div>
      </div>
      <div className="kf-izgara">
        <div style={{ minWidth: 0 }}>{children}</div>
        <aside className="kf-yan" aria-label="Bilgi">{yan}</aside>
      </div>
    </div>
  );
}

/** Yan sütun kartı — başlık + adımlar ya da serbest içerik. */
export function YanKart({ baslik, adimlar, children }: { baslik: string; adimlar?: string[]; children?: React.ReactNode }) {
  return (
    <div className="kf-yan__kart">
      <h3>{baslik}</h3>
      {adimlar?.map((s, i) => <div key={s} className="kf-adim"><b>{i + 1}</b><span>{s}</span></div>)}
      {children}
    </div>
  );
}
