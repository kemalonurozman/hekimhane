// Deneme hesabı giriş sayfası — yalnız admin panelinden alınan bağlantıyla (?k=…) çalışır.
// Bağlantıyı bilmeyen kimse panele giremez; sayfa aranmaz (noindex).
import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { DEMO_AD, DEMO_PROFIL_YOLU } from '@/lib/demo';
import { demoIstemcisi, demoAnahtarGecerli } from '@/lib/demo-sunucu';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Deneme Hesabı',
  robots: { index: false, follow: false },
};

const DURUM: Record<string, string> = {
  gecersiz: 'Bu bağlantı geçersiz ya da yenilenmiş. Güncel bağlantı için bizimle iletişime geçin.',
  hata: 'Deneme paneli şu an açılamadı. Lütfen biraz sonra tekrar deneyin.',
  cok: 'Kısa sürede çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.',
};

const DENENEBILIR = [
  'Randevu taleplerini görmek, aramak, ertelemek ve tamamlamak',
  'Haftalık randevu takvimi ve elle randevu ekleme',
  'Hasta kartları ve notlar',
  'Yorumlara yanıt verme',
  'Profil bilgilerini düzenleme (tanıtım, uzmanlık, çalışma saatleri)',
];
const KAPALI = ['E-posta gönderme', 'Ödeme ve abonelik', 'Ekip daveti', 'Fotoğraf ve dosya yükleme', 'Ad, iletişim ve bağlantıları değiştirme'];

function Liste({ baslik, maddeler, renk }: { baslik: string; maddeler: string[]; renk: string }) {
  return (
    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>{baslik}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 7 }}>
        {maddeler.map(m => (
          <li key={m} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.45, color: '#1D1D1F' }}>
            <span aria-hidden style={{ flex: '0 0 auto', width: 6, height: 6, borderRadius: 3, background: renk, marginTop: 7 }} />{m}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DenemeHesabiPage({ searchParams }: { searchParams: { k?: string; durum?: string } }) {
  noStore();
  const k = typeof searchParams.k === 'string' ? searchParams.k : '';
  let gecerli = false;
  try { gecerli = !!k && (await demoAnahtarGecerli(demoIstemcisi(), k)); } catch { gecerli = false; }
  const mesaj = searchParams.durum ? DURUM[searchParams.durum] : (!gecerli ? DURUM.gecersiz : null);

  return (
    <div style={{ background: '#FBFBFD', minHeight: '70vh', padding: '112px 16px 72px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#1B3A69', marginBottom: 10 }}>Hekimhane · Deneme hesabı</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.6px', color: '#1D1D1F', margin: '0 0 12px', lineHeight: 1.1 }}>
          Hekimhane panelini bir diş kliniği gibi deneyin
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#424245', margin: '0 0 24px' }}>
          <strong>{DEMO_AD}</strong> gerçek bir klinik değildir. Bu hesap, Hekimhane&apos;nin işletme panelini ve profil sayfasını
          kendi gözünüzle görebilmeniz için hazırlandı. İçindeki hastalar, randevular ve yorumlar örnektir; yaptığınız değişiklikler her gece sıfırlanır.
        </p>

        {mesaj && (
          <div role="alert" style={{ background: '#FFF4F2', border: '1px solid #F5C9C2', color: '#8A2A1C', borderRadius: 14, padding: '12px 14px', fontSize: 14, marginBottom: 20 }}>{mesaj}</div>
        )}

        <div style={{ background: '#fff', border: '1px solid #E5E5EA', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,.05)', padding: 'clamp(18px, 4vw, 28px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
            <Liste baslik="Deneyebilecekleriniz" maddeler={DENENEBILIR} renk="#1F8A5B" />
            <Liste baslik="Deneme hesabında kapalı" maddeler={KAPALI} renk="#AEAEB2" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {gecerli && (
              <form method="post" action="/api/deneme-hesabi/giris" style={{ margin: 0 }}>
                <input type="hidden" name="k" value={k} />
                <button type="submit" className="vt-dugme oz-dugme--altin hk-cta-isik" style={{ border: 0, cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '13px 22px', borderRadius: 12 }}>
                  Deneme paneline gir
                </button>
              </form>
            )}
            <Link href={DEMO_PROFIL_YOLU} style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, padding: '12px 20px', borderRadius: 12, border: '1px solid #D2D2D7', color: '#1B3A69', textDecoration: 'none', background: '#fff' }}>
              Deneme profilini görün
            </Link>
          </div>
          {gecerli && (
            <p style={{ margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.5, color: '#6E6E73' }}>
              Şifre gerekmez. Bu tarayıcıda açık bir Hekimhane oturumunuz varsa kapanır; işiniz bitince panelden çıkış yapabilirsiniz.
            </p>
          )}
        </div>

        <p style={{ fontSize: 14, color: '#6E6E73', marginTop: 22 }}>
          Kendi muayenehaneniz için hazır mısınız? <Link href="/katil" style={{ color: '#1B3A69', fontWeight: 600 }}>İşletmenizi ücretsiz ekleyin</Link> ya da
          {' '}<Link href="/klinikler" style={{ color: '#1B3A69', fontWeight: 600 }}>listede bulup sahiplenin</Link>.
        </p>
      </div>
    </div>
  );
}
