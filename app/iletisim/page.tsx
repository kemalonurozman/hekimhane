import type { Metadata } from 'next';
import Link from 'next/link';
import IletisimForm from './IletisimForm';

export const metadata: Metadata = {
  title: 'İletişim | Hekimhane',
  description: 'Hekimhane ekibiyle iletişime geçin. Soru, öneri ve işletme ekleme talepleriniz için buradayız.',
};

export default function IletisimPage() {
  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '48px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.65)' }}>Ana Sayfa</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }} />
            <span style={{ color: 'rgba(255,255,255,.9)' }}>İletişim</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            Bize Ulaşın
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 520 }}>
            Soru, öneri veya işletme ekleme talepleriniz için ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>

      <div className="container hastalik-content-grid" style={{ padding: '48px 32px' }}>

        {/* Form — client bileşen, /api/iletisim'e gönderir */}
        <IletisimForm />

        {/* Sağ panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* İletişim kartları */}
          {[
            { icon: 'fa-envelope', color: '#1B3A69', bg: '#EEF2FF', label: 'E-posta', value: 'iletisim@hekimhane.com.tr', href: 'mailto:iletisim@hekimhane.com.tr' },
            { icon: 'fa-building', color: '#065F46', bg: '#ECFDF5', label: 'Şirket', value: 'Hekimhane Sağlık Rehberi A.Ş.', href: undefined },
          ].map(item => (
            <div key={item.label} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 3 }}>{item.label}</div>
                {item.href
                  ? <a href={item.href} style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>{item.value}</a>
                  : <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>}
              </div>
            </div>
          ))}

          {/* İşletme ekleme CTA */}
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', border: '1.5px solid #C7D2FE', borderRadius: 18, padding: '24px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🏥</div>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>İşletmenizi listeleyin</h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>
              Kliniğinizi, hastanenizi veya eczanenizi Hekimhane'ye ücretsiz ekleyin, daha fazla hastaya ulaşın.
            </p>
            <Link href="/katil" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--navy)', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <i className="fa-solid fa-plus" />Ücretsiz Ekle
            </Link>
          </div>

          {/* SSS */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 22px' }}>
            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--navy)' }}>Sık Sorulan Sorular</h4>
            {[
              { q: 'İşletmemi nasıl eklerim?', a: 'İşletmenizi Ekleyin butonuna tıklayarak ücretsiz olarak listeleyebilirsiniz.' },
              { q: 'Yanlış bilgiyi nasıl düzeltirim?', a: 'İlgili işletme sayfasındaki "Sahiplen" butonu ile talep oluşturabilirsiniz.' },
              { q: 'Yorumum silinebilir mi?', a: 'Uygunsuz içerik barındıran yorumlar moderasyon ekibimiz tarafından kaldırılabilir.' },
            ].map((faq, i) => (
              <div key={i} style={{ paddingBottom: i < 2 ? 12 : 0, marginBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{faq.q}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
