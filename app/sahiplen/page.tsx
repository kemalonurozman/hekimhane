import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import SahiplenForm from './SahiplenForm';
import GeriDugme from './GeriDugme';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.hekimhane.com.tr/sahiplen' },
  title: 'İşletmenizi Sahiplenin',
  description: 'Hekimhane\'deki işletmenizi sahiplenerek profilinizi yönetin, bilgilerinizi güncelleyin.',
};

const TYPE_LABELS: Record<string, string> = {
  klinik:  'Diş Kliniği',
  hastane: 'Hastane',
  eczane:  'Eczane',
  doktor:  'Doktor',
};

const TYPE_ICONS: Record<string, HkIkonAdi> = {
  klinik:  'dentistry',
  hastane: 'hospital',
  eczane:  'pharmacy',
  doktor:  'doctor-profile',
};

const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  eczane:  'eczaneler',
  doktor:  'doktorlar',
};

async function getEntityInfo(type: string, id: string): Promise<{ name: string; claimed: boolean } | null> {
  const table = TABLE_MAP[type];
  if (!table) return null;

  if (type === 'doktor') {
    const { data } = await supabase.from('doktorlar').select('ad, soyad, verified').eq('id', id).single();
    if (!data) return null;
    const d = data as any;
    return {
      name:    `${d.ad || ''} ${d.soyad || ''}`.trim() || '',
      claimed: !!d.verified,
    };
  }

  if (type === 'eczane') {
    // eczaneler tablosunda claimed kolonu henüz eklenmemiş olabilir — yalnızca name sorgula
    const { data } = await supabase.from('eczaneler').select('name, claimed').eq('id', id).single();
    if (!data) {
      // claimed kolonu yoksa sadece name ile tekrar dene
      const { data: d2 } = await supabase.from('eczaneler').select('name').eq('id', id).single();
      if (!d2) return null;
      const d = d2 as any;
      return { name: d.name ?? '', claimed: false };
    }
    const d = data as any;
    return { name: d.name ?? '', claimed: !!d.claimed };
  }

  const { data } = await supabase.from(table as 'klinikler' | 'hastaneler')
    .select('name, claimed')
    .eq('id', id)
    .single();

  if (!data) return null;
  const d = data as any;
  return { name: d.name ?? '', claimed: !!d.claimed };
}

export default async function SahiplenPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const id   = searchParams.id   || '';
  const type = searchParams.type || '';

  let entityName: string | null = null;
  let entityClaimed = false;
  if (id && type && TABLE_MAP[type]) {
    const info = await getEntityInfo(type, id);
    entityName    = info?.name    ?? null;
    entityClaimed = info?.claimed ?? false;
  }

  const isValid = !!id && !!type && !!entityName;

  const backHref = type === 'klinik'  ? '/klinikler'
    : type === 'hastane' ? '/hastaneler'
    : type === 'eczane'  ? '/eczaneler'
    : type === 'doktor'  ? '/doktorlar'
    : '/';

  const Tik = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
  );

  /* Geçersiz veya eksik parametre */
  if (!isValid) {
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
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>İşletme bulunamadı</h1>
            <p className="kf-alt" style={{ margin: 0, fontSize: 15 }}>
              Sahiplenmek istediğiniz işletme bulunamadı veya bağlantı geçersiz.
              Lütfen işletme sayfasındaki &quot;Sahiplenin&quot; butonunu kullanın.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
              <Link href="/klinikler" className="kf-geri" style={{ padding: '10px 18px' }}>Klinikler</Link>
              <Link href="/hastaneler" className="kf-geri" style={{ padding: '10px 18px' }}>Hastaneler</Link>
              <Link href="/eczaneler" className="kf-geri" style={{ padding: '10px 18px' }}>Eczaneler</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kf-sayfa">

      {/* Kompakt üst bar */}
      <div className="kf-ust">
        <div className="kf-ust__ic">
          <GeriDugme fallbackHref={backHref} />
          <div className="kf-ust__tur">
            <span className="kf-ust__ikon"><HkIcon name={TYPE_ICONS[type] || 'clinic'} size={20} color="#fff" accent="#EBCF8D" /></span>
            <span className="kf-ust__ad">
              {entityName}
              <small>{TYPE_LABELS[type] || 'İşletme'}</small>
            </span>
          </div>
          <span className="vt-ucretsiz">Ücretsiz</span>
        </div>
      </div>

      <div className="kf-izgara">

        {/* Form (başlık formun içinde — başarı ekranında gizlenir) */}
        <div style={{ minWidth: 0 }}>
          <SahiplenForm
            entityId={id}
            entityType={type}
            entityName={entityName ?? ''}
            isClaimed={entityClaimed}
          />
        </div>

        {/* Yan bilgi */}
        <aside className="kf-yan" aria-label="Sahiplenme hakkında">
          <div className="kf-yan__kart">
            <h3>Nasıl çalışır?</h3>
            {[
              'Formu doldurup gönderin',
              'Ekibimiz talebinizi inceler',
              'E-posta ile bildirim alırsınız',
              'Profilinizi yönetmeye başlarsınız',
            ].map((s, i) => (
              <div key={s} className="kf-adim"><b>{i + 1}</b><span>{s}</span></div>
            ))}
          </div>

          <div className="kf-yan__kart">
            <h3>Sahiplenince</h3>
            <ul className="kf-sonra">
              {[
                'Profil bilgilerinizi düzenleyin',
                'Fotoğraf ve logo ekleyin',
                'Yorumlara yanıt verin',
                'Randevu taleplerini yönetin',
              ].map(t => (
                <li key={t}><Tik />{t}</li>
              ))}
            </ul>
          </div>

          <p className="kf-pro" style={{ margin: '0 6px' }}>
            Çoğu başvuru birkaç saat içinde, en geç 24 saatte yanıtlanır.
          </p>
        </aside>
      </div>
    </div>
  );
}
