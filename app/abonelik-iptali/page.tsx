import type { Metadata } from 'next';
import Link from 'next/link';
import AbonelikIptalForm from './AbonelikIptalForm';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';

export const metadata: Metadata = {
  title: 'Abonelik İptali | Hekimhane',
  description: 'Hekimhane-Pro aboneliğinizi iptal edin. Panelden tek tıkla iptal edebilir veya iptal talep formunu doldurabilirsiniz.',
};

const ADIMLAR = [
  { n: '1', b: 'Panele giriş yapın', a: 'hekimhane.com.tr/panel adresinden işletme hesabınıza girin.' },
  { n: '2', b: 'Hesabım sekmesini açın', a: 'Sol menüde HESAP başlığı altındaki "Hesabım" sekmesinde Pro üyeliğiniz listelenir.' },
  { n: '3', b: '"Aboneliği Yönet · İptal" butonuna basın', a: 'Stripe güvenli ödeme sayfası açılır; "Aboneliği iptal et" ile üyeliğinizi anında sonlandırırsınız.' },
];

export default function AbonelikIptaliPage() {
  const kart: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 22px' };

  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '48px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.65)' }}>Ana Sayfa</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }} />
            <span style={{ color: 'rgba(255,255,255,.9)' }}>Abonelik İptali</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            Abonelik İptali
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>
            Hekimhane-Pro üyeliğinizi dilediğiniz an, taahhüt ve cayma bedeli olmadan iptal edebilirsiniz.
            İptali kendiniz panelden yapabilir ya da aşağıdaki formu doldurup bize bırakabilirsiniz.
          </p>
        </div>
      </div>

      <div className="container hastalik-content-grid" style={{ padding: '48px 32px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Yol 1 — panelden kendiniz */}
          <div style={{ ...kart, padding: 'clamp(20px, 5vw, 32px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 20, background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 12 }}>
              En hızlı yol
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 21, fontWeight: 800, marginBottom: 6 }}>Panelden anında iptal</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              İptal, panelinizdeki <strong>Hesabım</strong> sekmesinden üç adımda tamamlanır. Onay beklemez, anında geçerli olur.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
              {ADIMLAR.map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.b}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 2 }}>{s.a}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/panel" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--navy)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Panelde Hesabım sekmesini aç
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>

          {/* Yol 2 — form */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 21, fontWeight: 800, marginBottom: 6 }}>Ya da iptali bize bırakın</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>
              Panele erişemiyorsanız veya ödeme sayfası açılmıyorsa formu doldurun; aboneliğinizi biz kapatalım.
            </p>
            <AbonelikIptalForm />
          </div>
        </div>

        {/* Sağ panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {[
            { icon: 'fa-ban', color: '#065F46', bg: '#ECFDF5', label: 'Taahhüt', value: 'Yok — istediğiniz an iptal' },
            { icon: 'fa-clock', color: '#1B3A69', bg: '#EEF2FF', label: 'Form Yanıt Süresi', value: '1 iş günü içinde' },
            { icon: 'fa-credit-card', color: '#92400E', bg: '#FFFBEB', label: 'Üyelik Ücreti', value: `Aylık ${PRO_AYLIK_TL} TL` },
          ].map(item => (
            <div key={item.label} style={{ ...kart, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
              </div>
            </div>
          ))}

          {/* SSS */}
          <div style={kart}>
            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--navy)' }}>İptal Hakkında</h4>
            {[
              { q: 'İptal edince üyeliğim hemen biter mi?', a: 'Hayır. Ödemesini yaptığınız dönemin sonuna kadar Pro özellikleri açık kalır; o tarihten sonra yeni ödeme alınmaz.' },
              { q: 'İşletme profilim silinir mi?', a: 'Silinmez. Profiliniz ücretsiz üyelik olarak yayında kalır; yalnızca Pro özellikleri (web sitesi, sosyal medya, rezervasyon modülü) kapanır.' },
              { q: 'Randevu taleplerim ne olur?', a: 'Randevu Talepleri sekmesi ücretsiz üyelikte de açık kalır. Yalnızca siteye gömülen slot bazlı rezervasyon modülü kapanır.' },
              { q: 'Sonradan tekrar açabilir miyim?', a: 'Evet. Panelden "Pro’ya Yükselt" ile dilediğiniz an yeniden abone olabilirsiniz.' },
              { q: 'Kalan gün için iade yapılıyor mu?', a: 'Dönem ortasında iptal ettiğinizde kalan günler için kısmi iade yapılmaz; üyelik dönem sonuna kadar kullanılabilir.' },
            ].map((faq, i, arr) => (
              <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{faq.q}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>

          {/* Doğrudan iletişim */}
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', border: '1.5px solid #C7D2FE', borderRadius: 18, padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>Başka bir konu mu var?</h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>
              Fatura, ödeme veya hesap sorularınız için doğrudan bize yazın.
            </p>
            <a href="mailto:info@hekimhane.com.tr" style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none', marginBottom: 10 }}>
              info@hekimhane.com.tr
            </a>
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--navy)', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              İletişim formu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
