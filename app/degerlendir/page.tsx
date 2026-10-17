import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { yorumTokeniCoz, talepYorumDurumu } from '@/lib/onayli-yorum';
import { isletmeBilgisi } from '@/lib/entity-link';
import OnayliYorumFormu from './OnayliYorumFormu';
import HkIcon from '@/components/HkIcon';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Deneyiminizi Değerlendirin',
  robots: { index: false, follow: false },   // kişiye özel bağlantı — dizine girmez
};

function Kutu({ children }: { children: React.ReactNode }) {
  return (
    <div className="vt-zemin" style={{ paddingTop: 66, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 620, paddingTop: 48, paddingBottom: 72 }}>{children}</div>
    </div>
  );
}

export default async function DegerlendirPage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t || '';
  const talepId = yorumTokeniCoz(token);
  const bilgi = (baslik: string, metin: string) => (
    <Kutu>
      <div style={{ background: '#fff', borderRadius: 24, padding: '36px 30px', textAlign: 'center', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><HkIcon name="info" size={40} /></div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: '#0E1A2C' }}>{baslik}</h1>
        <p style={{ margin: '10px auto 22px', maxWidth: 420, fontSize: 15, lineHeight: 1.6, color: '#586273' }}>{metin}</p>
        <Link href="/" className="vt-dugme vt-dugme--koyu">Ana sayfaya dön</Link>
      </div>
    </Kutu>
  );
  if (!talepId) return bilgi('Bağlantı geçersiz', 'Bu değerlendirme bağlantısı geçersiz ya da süresi dolmuş. Randevu aldığınız işletmeden yeni bir bağlantı isteyebilirsiniz.');

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const d = await talepYorumDurumu(db, talepId);
  if (d.durum === 'yok') return bilgi('Randevu bulunamadı', 'Bu bağlantıya ait randevu kaydı artık bulunmuyor.');
  if (d.durum === 'tamamlanmadi') return bilgi('Randevunuz henüz tamamlanmadı', 'Değerlendirme, işletme randevuyu tamamlandı olarak işaretledikten sonra açılır.');
  if (d.durum === 'yazildi') return bilgi('Teşekkürler', 'Bu randevu için değerlendirmeniz zaten alındı.');

  const t = d.talep;
  const isletme = await isletmeBilgisi(db as any, String(t.entity_type), String(t.entity_id));
  const profil = isletme.url ? isletme.url.replace(/^https?:\/\/[^/]+/, '') : null;
  return (
    <Kutu>
      <p className="vt-ustyazi">Onaylı hasta değerlendirmesi</p>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 38px)', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.035em', color: '#0E1A2C' }}>
        {t.entity_name || isletme.ad || 'İşletme'}
      </h1>
      {isletme.konum && <p style={{ margin: '8px 0 0', fontSize: 15, color: '#586273' }}>{isletme.konum}</p>}
      <p style={{ margin: '16px 0 24px', fontSize: 15, lineHeight: 1.6, color: '#3C4A61' }}>
        Hekimhane üzerinden aldığınız randevu tamamlandı. Yorumunuz profilde <strong>Onaylı hasta</strong> işaretiyle yayımlanır;
        olumlu ya da olumsuz her değerlendirme aynı şekilde görünür.
      </p>
      <OnayliYorumFormu token={token} varsayilanAd={t.ad_soyad || ''} profil={profil} />
    </Kutu>
  );
}
