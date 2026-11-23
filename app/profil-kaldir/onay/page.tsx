import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon from '@/components/HkIcon';
import { kaldirmaIstemcisi, kaldirmaEpostaDogrula } from '@/lib/profil-kaldirma';
import { UYUM_SURE } from '@/lib/uyum';
import { SIRKET } from '@/lib/sirket';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kaldırma Talebi — E-posta Doğrulama',
  robots: { index: false, follow: false },
};

/* E-posta doğrulama: bağlantı yalnız talep sahibinin adresini doğrular.
   Hiçbir şey silinmez ya da gizlenmez — karar yöneticide (lib/profil-kaldirma.ts). */
export default async function KaldirmaOnayPage({ searchParams }: { searchParams: Record<string, string> }) {
  const token = String(searchParams.t || '');
  const s = token ? await kaldirmaEpostaDogrula(kaldirmaIstemcisi(), token) : { ok: false as const, neden: 'gecersiz' as const, mesaj: 'Bağlantı eksik.' };

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
          <HkIcon name={s.ok ? 'success' : s.neden === 'kapandi' ? 'info' : 'warning'} size={56} />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-.015em', color: '#0E1A2C' }}>
            {s.ok ? 'E-posta adresiniz doğrulandı' : s.neden === 'kapandi' ? 'Talep sonuçlandı' : 'Bağlantı doğrulanamadı'}
          </h1>
          <p className="kf-alt" style={{ margin: 0, fontSize: 15, maxWidth: 440 }}>
            {s.ok
              ? <><strong>{s.profilAdi}</strong> profili için kaldırma talebiniz yönetici incelemesinde. Karar en geç {UYUM_SURE.kaldirma_duraklatma_saat} saat içinde verilir; verilmezse profil geçici olarak yayından alınır. Sonuç e-postanıza gönderilecek.</>
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
