import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon from '@/components/HkIcon';
import { kaldirmaIstemcisi, kaldirmaOnayla } from '@/lib/profil-kaldirma';
import { SIRKET } from '@/lib/sirket';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kaldırma Talebi Onayı',
  robots: { index: false, follow: false },
};

/* Onay bağlantısı: e-postadaki tek kullanımlık token burada doğrulanır,
   kayıt silinir ve "kaldırıldı" e-postası gider (lib/profil-kaldirma.ts). */
export default async function KaldirmaOnayPage({ searchParams }: { searchParams: Record<string, string> }) {
  const token = String(searchParams.t || '');
  const s = token ? await kaldirmaOnayla(kaldirmaIstemcisi(), token) : { ok: false as const, neden: 'gecersiz' as const, mesaj: 'Bağlantı eksik.' };

  return (
    <div className="kf-sayfa">
      <div className="kf-ust"><div className="kf-ust__ic">
        <Link href="/" className="kf-geri">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
          Ana sayfa
        </Link>
      </div></div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 16px 72px' }}>
        <div className="kf-grup__kutu" style={{ textAlign: 'center', justifyItems: 'center', padding: '36px 24px' }}>
          <HkIcon name={s.ok ? 'success' : s.neden === 'zaten' ? 'info' : 'warning'} size={56} />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>
            {s.ok ? 'Profiliniz kaldırıldı' : s.neden === 'zaten' ? 'Zaten kaldırılmış' : 'Bağlantı doğrulanamadı'}
          </h1>
          <p className="kf-alt" style={{ margin: 0, fontSize: 15, maxWidth: 440 }}>
            {s.ok
              ? <><strong>{s.profilAdi}</strong> profilinize ait bilgiler Hekimhane&apos;den silindi. Yeniden eklenmemeniz için yalnızca adınız, iliniz ve talep tarihiniz saklanır. Ayrıntılar e-postanıza gönderildi.</>
              : s.mesaj}
          </p>
          <p className="kf-not" style={{ margin: '8px 0 0' }}>
            Sorularınız için <a href={`mailto:${SIRKET.eposta}`} style={{ color: '#12294D', fontWeight: 600 }}>{SIRKET.eposta}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
