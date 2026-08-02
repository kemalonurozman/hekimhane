import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SahiplenForm from './SahiplenForm';

export const metadata: Metadata = {
  title: 'İşletmeni Sahiplen | Hekimhane',
  description: 'Hekimhane\'deki işletmenizi sahiplenerek profilinizi yönetin, bilgilerinizi güncelleyin.',
};

const TYPE_LABELS: Record<string, string> = {
  klinik:  'Diş Kliniği',
  hastane: 'Hastane',
  eczane:  'Eczane',
  doktor:  'Doktor',
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

  return (
    <div style={{ paddingTop: 66, minHeight: '100vh', background: '#F5F4F0' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 500 }}>Ana Sayfa</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 8, lineHeight: '20px' }} />
          {entityName && (
            <>
              <Link href={backHref} style={{ color: 'var(--navy)', fontWeight: 500 }}>
                {TYPE_LABELS[type] || 'İşletme'}
              </Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 8, lineHeight: '20px' }} />
            </>
          )}
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>İşletmeni Sahiplen</span>
        </div>
      </div>

      {/* Hero — sade, açık, Apple tarzı */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: 'clamp(30px,6vw,52px) 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, margin: '0 auto 18px', background: 'linear-gradient(150deg,#1B3A69,#274d86)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(27,58,105,.22)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M9 10h.01M15 10h.01" />
            </svg>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-light)', color: '#9A7B1F', border: '1px solid rgba(212,168,67,.35)', borderRadius: 20, padding: '4px 12px', fontSize: 11.5, fontWeight: 800, letterSpacing: '.6px', marginBottom: 14 }}>
            <i className="fa-solid fa-tag" style={{ fontSize: 9 }} /> TAMAMEN ÜCRETSİZ
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', margin: '0 0 10px' }}>
            İşletmeni Sahiplen
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
            Profilini talep et, bilgilerini güncelle ve Hekimhane üzerinden hastalara ulaş.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 940, padding: 'clamp(28px,5vw,44px) clamp(16px,4vw,32px)' }}>

        {!isValid ? (
          /* Geçersiz veya eksik parametre */
          <div style={{ background: 'white', borderRadius: 22, border: '1px solid #EAE6DE', boxShadow: '0 1px 2px rgba(20,30,50,.04),0 12px 34px rgba(20,30,50,.05)', padding: 'clamp(32px,6vw,48px) 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FEF3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: 'var(--text)' }}>İşletme Bulunamadı</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 26, lineHeight: 1.65 }}>
              Sahiplenmek istediğiniz işletme bulunamadı veya bağlantı geçersiz.
              Lütfen işletme sayfasındaki &quot;Sahiplenin&quot; butonunu kullanın.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/klinikler" className="btn btn-navy" style={{ display: 'inline-flex' }}><i className="fa-solid fa-tooth" style={{ marginRight: 8 }} />Klinikler</Link>
              <Link href="/hastaneler" className="btn btn-navy" style={{ display: 'inline-flex' }}><i className="fa-solid fa-hospital" style={{ marginRight: 8 }} />Hastaneler</Link>
              <Link href="/eczaneler" className="btn btn-navy" style={{ display: 'inline-flex' }}><i className="fa-solid fa-pills" style={{ marginRight: 8 }} />Eczaneler</Link>
            </div>
          </div>
        ) : (
          <div className="hastalik-content-grid">

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 22, border: '1px solid #EAE6DE', boxShadow: '0 1px 2px rgba(20,30,50,.04),0 12px 34px rgba(20,30,50,.05)', padding: 'clamp(22px,4vw,34px)' }}>
              <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 4, color: 'var(--text)', letterSpacing: '-0.3px' }}>Sahiplenme Talebi</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 22, lineHeight: 1.6 }}>Birkaç bilgiyle işletmeni talep et; ekibimiz doğrulayıp onaylasın.</p>
              <SahiplenForm
                entityId={id}
                entityType={type}
                entityName={entityName ?? ''}
                isClaimed={entityClaimed}
              />
            </div>

            {/* Yan bilgi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Avantajlar */}
              <div style={{ background: 'white', borderRadius: 18, border: '1px solid #EAE6DE', padding: '20px 20px 8px' }}>
                <h3 style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 16, color: 'var(--text)', letterSpacing: '-0.2px' }}>Sahiplenmenin Avantajları</h3>
                {[
                  { icon: 'fa-pen-to-square', text: 'Profil bilgilerini düzenle' },
                  { icon: 'fa-images', text: 'Fotoğraf ve logo ekle' },
                  { icon: 'fa-star', text: 'Yorumlara yanıt ver' },
                  { icon: 'fa-bullhorn', text: 'Kampanya duyur' },
                  { icon: 'fa-chart-line', text: 'Ziyaret istatistiklerini gör' },
                ].map(item => (
                  <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 13.5, color: 'var(--text)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: 'var(--gold)', fontSize: 12.5 }} />
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Süreç — sade nötr */}
              <div style={{ background: 'white', borderRadius: 18, border: '1px solid #EAE6DE', padding: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 14, color: 'var(--text)', letterSpacing: '-0.2px' }}>Nasıl Çalışır?</h3>
                {[
                  'Formu doldurup gönder',
                  'Ekibimiz talebini inceler',
                  'E-posta ile bildirim alırsın',
                  'Profilini yönetmeye başla',
                ].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--navy)', color: 'white', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    {s}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, paddingTop: 13, borderTop: '1px solid #F0ECE4', fontSize: 12, color: 'var(--muted)' }}>
                  <i className="fa-regular fa-clock" style={{ color: 'var(--gold)' }} />
                  Ortalama yanıt süresi: 1–2 iş günü
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
