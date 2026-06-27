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
    <div style={{ paddingTop: '66px', minHeight: '100vh', background: '#F9FAFB' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 500 }}>Ana Sayfa</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '8px', lineHeight: '20px' }} />
          {entityName && (
            <>
              <Link href={backHref} style={{ color: 'var(--navy)', fontWeight: 500 }}>
                {TYPE_LABELS[type] || 'İşletme'}
              </Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '8px', lineHeight: '20px' }} />
            </>
          )}
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>İşletmeni Sahiplen</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '40px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏥</div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '30px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
            <span style={{ color: '#D4A843' }}>ÜCRETSİZ</span> İşletmeni Sahiplen
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', maxWidth: '520px', margin: '0 auto' }}>
            Profilinizi talep edin, bilgilerinizi güncelleyin ve Hekimhane üzerinden hastalara ulaşın. Tamamen ücretsiz.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '960px', padding: '48px 32px' }}>

        {!isValid ? (
          /* Geçersiz veya eksik parametre */
          <div style={{
            background: 'white', borderRadius: '20px', border: '1px solid var(--border)',
            padding: '48px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontWeight: 700, marginBottom: '10px' }}>İşletme Bulunamadı</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Sahiplenmek istediğiniz işletme bulunamadı veya bağlantı geçersiz.
              Lütfen işletme sayfasındaki "Sahiplen" butonunu kullanın.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/klinikler" className="btn btn-navy" style={{ display: 'inline-flex' }}>
                <i className="fa-solid fa-tooth" style={{ marginRight: '8px' }} />Klinikler
              </Link>
              <Link href="/hastaneler" className="btn btn-navy" style={{ display: 'inline-flex' }}>
                <i className="fa-solid fa-hospital" style={{ marginRight: '8px' }} />Hastaneler
              </Link>
              <Link href="/eczaneler" className="btn btn-navy" style={{ display: 'inline-flex' }}>
                <i className="fa-solid fa-pills" style={{ marginRight: '8px' }} />Eczaneler
              </Link>
            </div>
          </div>
        ) : (
          <div className="hastalik-content-grid">

            {/* Form */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', padding: '40px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '24px', color: 'var(--text)' }}>
                Sahiplenme Talebi
              </h2>
              <SahiplenForm
                entityId={id}
                entityType={type}
                entityName={entityName ?? ''}
                isClaimed={entityClaimed}
              />
            </div>

            {/* Yan bilgi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Avantajlar */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', color: 'var(--text)' }}>
                  Sahiplenmenin Avantajları
                </h3>
                {[
                  { icon: 'fa-pen-to-square', text: 'Profil bilgilerini düzenle' },
                  { icon: 'fa-images', text: 'Fotoğraf ve logo ekle' },
                  { icon: 'fa-star', text: 'Yorumlara yanıt ver' },
                  { icon: 'fa-bullhorn', text: 'Kampanya duyur' },
                  { icon: 'fa-chart-line', text: 'Ziyaret istatistiklerini gör' },
                ].map(item => (
                  <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'var(--text)' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ width: '20px', color: 'var(--navy)', fontSize: '14px' }} />
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Süreç */}
              <div style={{ background: '#FFFBEB', borderRadius: '16px', border: '1px solid #FDE68A', padding: '20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#92400E' }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '8px' }} />
                  Nasıl Çalışır?
                </h3>
                {[
                  '1. Formu doldurup gönderin',
                  '2. Ekibimiz talebinizi inceler',
                  '3. E-posta ile bildirim alırsınız',
                  '4. Profilinizi yönetmeye başlayın',
                ].map(s => (
                  <p key={s} style={{ fontSize: '12px', color: '#92400E', marginBottom: '6px', lineHeight: '1.5' }}>{s}</p>
                ))}
                <p style={{ fontSize: '11px', color: '#B45309', marginTop: '8px' }}>
                  Ortalama yanıt süresi: 1-2 iş günü
                </p>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
