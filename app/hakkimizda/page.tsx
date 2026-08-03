import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hakkımızda | Hekimhane',
  description: 'Hekimhane hakkında bilgi edinin. Türkiye\'nin sağlık rehberinde misyonumuz, vizyonumuz ve ekibimiz.',
};

const ICONS: Record<string, React.ReactNode> = {
  target:    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  unlock:    <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
  handshake: <path d="m11 17 2 2a1 1 0 1 0 3-3 M12 12l3.3 3.3a1 1 0 0 0 3-3l-3.6-3.6a2 2 0 0 0-1.5-.6H8.4a2 2 0 0 0-1.4.6L3 12 M9 11l1 1 M2 12l3-3 M17 11l4-4" />,
  lock:      <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  user:      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  code:      <path d="M16 18l6-6-6-6 M8 6l-6 6 6 6" />,
  pen:       <path d="M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />,
};
function IcH({ name, size = 26, color = 'var(--navy)' }: { name: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export default function HakkimizdaPage() {
  const STATS = [
    { n: '12.000+', label: 'Kayıtlı Doktor' },
    { n: '3.500+', label: 'Klinik & Hastane' },
    { n: '2.000+', label: 'Eczane' },
    { n: '81', label: 'İl Kapsamı' },
  ];

  const DEGERLER = [
    { icon: 'target', title: 'Doğruluk', desc: 'Her listeleme manuel inceleme ve kullanıcı geri bildirimleriyle sürekli güncellenir.' },
    { icon: 'unlock', title: 'Şeffaflık', desc: 'Hiçbir sağlık kuruluşundan ücret almadan tarafsız bilgi sunarız.' },
    { icon: 'handshake', title: 'Erişilebilirlik', desc: 'Doğru sağlık bilgisine ulaşmak herkesin hakkı; hizmetimiz ücretsizdir.' },
    { icon: 'lock', title: 'Gizlilik', desc: 'Kullanıcı verilerini asla üçüncü taraflarla paylaşmıyoruz.' },
  ];

  const EKIP = [
    { ad: 'Kemal', unvan: 'Kurucu & CEO', icon: 'user' },
    { ad: 'Yazılım Ekibi', unvan: 'Geliştirme & Tasarım', icon: 'code' },
    { ad: 'İçerik Ekibi', unvan: 'Veri & Editöryal', icon: 'pen' },
  ];

  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '64px 0 56px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', left: '50%', top: -120, transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -80, bottom: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(212,168,67,.06)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 15px', borderRadius: 20, background: 'rgba(212,168,67,.2)', border: '1px solid rgba(212,168,67,.35)', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', color: '#F0C060', marginBottom: 18 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18 M5 21V7l7-4 7 4v14 M12 9v6 M9 12h6" /></svg>
            TÜRKİYE&apos;NİN SAĞLIK REHBERİ
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 42, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Hekimhane Hakkında
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
            2024 yılında kurulan Hekimhane, Türkiye genelinde hastalara doğru sağlık hizmetini bulmalarında yardımcı olmak amacıyla hayata geçirilmiştir.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container" style={{ padding: '0 32px' }}>
        <div className="hakk-grid-4" style={{ gap: 16, marginTop: -28, marginBottom: 56 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 18, border: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 24px rgba(27,58,105,.07)' }}>
              <div style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 34, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2, paddingTop: 2 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Misyon */}
        <div className="hakk-grid-2" style={{ marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--gold)', marginBottom: 10 }}>MİSYONUMUZ</div>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, color: 'var(--navy)', marginBottom: 16, lineHeight: 1.3 }}>
              Doğru sağlık hizmetine ulaşmayı kolaylaştırıyoruz
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
              Türkiye'de sağlık hizmeti arayanların doğru kliniği, doktoru ya da eczaneyi bulmakta güçlük çektiğini gözlemledik. Dağınık, güncel olmayan bilgiler ve güvenilir yorum eksikliği karar vermeyi zorlaştırıyor.
            </p>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8 }}>
              Hekimhane; klinikler, hastaneler, doktorlar ve eczaneler hakkında doğrulanmış, güncel ve kapsamlı bilgiler sunarak bu boşluğu doldurmayı hedefliyor.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border)', padding: '36px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--gold)', marginBottom: 10 }}>VİZYONUMUZ</div>
            <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 14 }}>
              Sağlıkta dijital dönüşümün öncüsü olmak
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 20 }}>
              Hasta-doktor arasındaki bilgi uçurumunu kapatmak, online randevu ve dijital sağlık yönetimini Türkiye'nin her köşesine yaygınlaştırmak istiyoruz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['81 ilde aktif listeleme', 'Doğrulanmış kullanıcı yorumları', 'Online randevu altyapısı', 'Sağlık içerikleri ve blog'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#059669', fontSize: 14 }} />
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Değerler */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Değerlerimiz</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Her kararımızı yönlendiren ilkeler</p>
          </div>
          <div className="hakk-grid-4" style={{ gap: 20 }}>
            {DEGERLER.map(d => (
              <div key={d.title} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '28px 22px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#EEF3FB,#E3ECF9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <IcH name={d.icon} size={24} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)', marginBottom: 8 }}>{d.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ekip */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Ekibimiz</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Hekimhane'yi hayata geçirenler</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {EKIP.map(e => (
              <div key={e.ad} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '28px 32px', textAlign: 'center', minWidth: 180 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><IcH name={e.icon} size={30} color="#fff" /></div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>{e.ad}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.unvan}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12 }}>İşletmenizi Listelemek İster misiniz?</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Kliniğinizi, hastanenizi veya eczanenizi Hekimhane'ye ücretsiz ekleyin, binlerce hastaya ulaşın.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/katil" style={{ padding: '13px 28px', background: 'var(--gold)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <i className="fa-solid fa-plus" />Ücretsiz Ekle
            </Link>
            <Link href="/iletisim" style={{ padding: '13px 24px', background: 'rgba(255,255,255,.12)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
