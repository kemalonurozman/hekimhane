import type { Metadata } from 'next';
import Link from 'next/link';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';
import ProCta from './ProCta';

export const metadata: Metadata = {
  title: 'Hekimhane-Pro — İşletmeniz İçin Profesyonel Üyelik',
  description: `Randevu yönetimi, hasta listesi, sitenize rezervasyon modülü, otomatik e-posta bilgilendirme ve profesyonel profil görünümü. Aylık ${PRO_AYLIK_TL} TL, istediğiniz an iptal.`,
  alternates: { canonical: 'https://www.hekimhane.com.tr/pro' },
  openGraph: {
    title: 'Hekimhane-Pro | Hekimhane',
    description: `İşletmeniz için profesyonel üyelik — aylık ${PRO_AYLIK_TL} TL.`,
    url: 'https://www.hekimhane.com.tr/pro',
    type: 'website',
  },
};

const NAVY = '#1B3A69';
const GOLD = '#D4A843';
const MUTED = '#6E6E73';
const BORDER = '#E5E5EA';

function Ikon({ d, size = 22, color = NAVY }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('|').map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const OZELLIKLER = [
  {
    baslik: 'Randevu Yönetimi',
    aciklama: 'Randevu talepleri panelinize düşer; tek tıkla onaylayın, erteleyin veya iptal edin. Hasta her adımda otomatik bilgilendirilir.',
    ikon: 'M8 2v4|M16 2v4|M3 10h18|M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 16l2 2 4-4',
  },
  {
    baslik: 'Hasta Listesi',
    aciklama: 'Hastalarınızı kaydedin; not tutun, dosya ekleyin, geçmiş işlemleri görün ve panelden doğrudan e-posta gönderin.',
    ikon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    baslik: 'Profesyonel Görünüm',
    aciklama: 'Profilinizde altın doğrulama mührü, arama sonuçlarında Pro rozeti, hareketli kapak tasarımı ve WhatsApp ile web sitesi butonları.',
    ikon: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z',
  },
  {
    baslik: 'Sitenize Rezervasyon Modülü',
    aciklama: 'Hekimhane randevu modülünü kendi web sitenize gömün. Sitenizden gelen talepler de aynı panelde toplanır.',
    ikon: 'M16 18l6-6-6-6|M8 6l-6 6 6 6',
  },
  {
    baslik: 'Otomatik E-posta Bilgilendirme',
    aciklama: 'Randevu onayı, randevudan bir gün önce hatırlatma, erteleme ve iptal bildirimleri hastalarınıza otomatik e-posta ile gider.',
    ikon: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|M22 6l-10 7L2 6',
  },
  {
    baslik: 'Öne Çıkarma',
    aciklama: 'Ana sayfadaki "Premium Diş Hekimleri & Klinikler" bölümünde ve sağlık rehberi sayfalarındaki önerilen hekimler alanında yer alın.',
    ikon: 'M12 19V5|M5 12l7-7 7 7',
  },
];

const ADIMLAR = [
  { no: '1', baslik: 'İşletmenizi sahiplenin', aciklama: 'Profiliniz zaten Hekimhane\'de olabilir. Ücretsiz sahiplenme başvurusu 24 saat içinde değerlendirilir.' },
  { no: '2', baslik: 'Pro\'ya geçin', aciklama: `Aylık ${PRO_AYLIK_TL} TL. Ödeme, güvenli Stripe altyapısıyla alınır; kart bilgileriniz Hekimhane'de tutulmaz.` },
  { no: '3', baslik: 'Panelden yönetin', aciklama: 'Randevular, hastalar, profil ve içerikleriniz tek panelde. Aboneliğinizi istediğiniz an iptal edebilirsiniz.' },
];

const SSS = [
  {
    soru: 'Aboneliği nasıl iptal ederim?',
    cevap: 'Panel → "Pro Üyeliği Yönet" ile Stripe müşteri portalına gidersiniz; iptal tek tıktır. Dönem sonuna kadar Pro özellikleri açık kalır, sonrasında ücret alınmaz.',
  },
  {
    soru: 'Ücretsiz hesapla farkı ne?',
    cevap: 'İşletmenizi sahiplenmek ve profilinizi yönetmek ücretsizdir. Pro; profesyonel profil görünümü, öne çıkarma ve Pro rozetiyle işletmenizi görünür kılar, tüm randevu ve hasta yönetimi araçlarını içerir.',
  },
  {
    soru: 'Ödeme güvenli mi?',
    cevap: 'Ödemeler dünyanın en yaygın ödeme altyapılarından Stripe üzerinden alınır. Kart bilgileriniz Hekimhane sunucularına hiçbir zaman ulaşmaz.',
  },
  {
    soru: 'Birden fazla işletmem var, ne yapmalıyım?',
    cevap: 'Pro üyelik işletme başınadır. Her işletmeniz için panelden ayrı ayrı Pro\'ya geçebilirsiniz.',
  },
];

export default function ProPage() {
  return (
    <main style={{ background: 'var(--ivory, #FBF8F2)', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg, #071A2E 0%, #0E2D55 45%, ${NAVY} 100%)`, padding: '120px 24px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.4)', color: GOLD, fontSize: 11.5, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 22 }}>
            <svg width="11" height="11" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Hekimhane-Pro
          </span>
          <h1 style={{ color: 'white', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.15, margin: '0 0 16px' }}>
            İşletmenizi bir adım öne taşıyın
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 17, lineHeight: 1.65, margin: '0 auto 30px', maxWidth: 560 }}>
            Randevularınızı yönetin, hastalarınızı takip edin, profilinizi profesyonelleştirin.
            Tek üyelik, tüm araçlar — aylık {PRO_AYLIK_TL} TL, istediğiniz an iptal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}><ProCta boyut="lg" /></div>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12.5, marginTop: 16 }}>
            Güvenli ödeme — Stripe altyapısı. Taahhüt yok.
          </p>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '72px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.8px', margin: '0 0 10px' }}>
          Pro hesabınıza dahil olanlar
        </h2>
        <p style={{ textAlign: 'center', color: MUTED, fontSize: 15, margin: '0 0 44px' }}>
          İşletmenizi yönetmek için ihtiyacınız olan her şey, tek pakette.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {OZELLIKLER.map(o => (
            <div key={o.baslik} style={{ background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: '26px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: '#EEF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ikon d={o.ikon} />
              </div>
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#1D1D1F', margin: '0 0 8px', letterSpacing: '-0.3px' }}>{o.baslik}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>{o.aciklama}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section style={{ background: 'white', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.7px', margin: '0 0 40px' }}>
            Üç adımda Pro
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 26 }}>
            {ADIMLAR.map(a => (
              <div key={a.no} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: NAVY, color: 'white', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{a.no}</div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1D1D1F', margin: '0 0 8px' }}>{a.baslik}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{a.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FİYAT */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', background: 'white', borderRadius: 22, border: `1.5px solid ${GOLD}`, boxShadow: '0 8px 32px rgba(190,143,44,.15)', overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(135deg, ${GOLD}, #BE8F2C)`, padding: '10px', textAlign: 'center', color: 'white', fontSize: 11.5, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase' }}>
            Tek paket, tüm özellikler
          </div>
          <div style={{ padding: '34px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: MUTED, marginBottom: 6 }}>Hekimhane-Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-1.5px' }}>{PRO_AYLIK_TL} TL</span>
              <span style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}>/ ay</span>
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 24 }}>Taahhüt yok — istediğiniz an iptal edin</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', textAlign: 'left' }}>
              {['Randevu yönetimi ve takvim', 'Hasta listesi, not ve dosyalar', 'Altın mühür + Pro rozeti', 'Ana sayfada ve rehberde öne çıkarma', 'Sitenize gömülebilir randevu modülü', 'Otomatik e-posta bilgilendirmeleri', 'WhatsApp ve web sitesi butonları'].map(m => (
                <li key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="#F0F7EE" /><path d="M8 12l3 3 5-6" stroke="#3E7C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {m}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ProCta /></div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.6px', margin: '0 0 30px' }}>
            Sık sorulan sorular
          </h2>
          {SSS.map(s => (
            <details key={s.soru} style={{ background: 'white', borderRadius: 14, border: `1px solid ${BORDER}`, padding: '16px 20px', marginBottom: 10 }}>
              <summary style={{ fontSize: 14.5, fontWeight: 700, color: '#1D1D1F', cursor: 'pointer' }}>{s.soru}</summary>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, margin: '10px 0 0' }}>{s.cevap}</p>
            </details>
          ))}
          <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, marginTop: 28 }}>
            Henüz işletmenizi sahiplenmediniz mi?{' '}
            <Link href="/sahiplen" style={{ color: NAVY, fontWeight: 700 }}>Ücretsiz sahiplenin</Link>
            {' '}— profiliniz büyük ihtimalle zaten Hekimhane&apos;de.
          </p>
        </div>
      </section>
    </main>
  );
}
