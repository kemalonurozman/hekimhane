import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Hekimhane',
  description: 'Hekimhane kullanım şartları ve koşulları. Platformumuzu kullanmadan önce lütfen okuyun.',
};

export default function KullanimPage() {
  const SECTIONS = [
    {
      title: '1. Hizmetin Kapsamı',
      content: `Hekimhane, Türkiye'deki sağlık kuruluşları (klinik, hastane, eczane) ve sağlık profesyonelleri hakkında bilgi, yorum ve listeleme hizmetleri sunan bir rehber platformudur.

Platform; tıbbi tavsiye, teşhis veya tedavi hizmeti sunmaz. Sağlık kararlarınız için her zaman yetkili bir sağlık profesyoneline danışmanız önerilir.`,
    },
    {
      title: '2. Kullanım Koşulları',
      content: `Platformu kullanan tüm ziyaretçiler aşağıdaki koşulları kabul etmiş sayılır:

• Platforma yalnızca yasal amaçlarla erişilecektir
• Diğer kullanıcıların gizliliği ihlal edilmeyecektir
• Sisteme zarar verecek içerik, yazılım veya işlem gerçekleştirilmeyecektir
• Otomatik sistemler (bot, scraper) ile veri çekimi yapılmayacaktır
• Sahte veya yanıltıcı bilgi paylaşılmayacaktır`,
    },
    {
      title: '3. Yorum ve Değerlendirmeler',
      content: `Kullanıcıların bıraktığı yorumlar için geçerli kurallar:

• Yorumlar gerçek deneyime dayanmalıdır
• Hakaret, nefret söylemi veya kişisel saldırı içeren yorumlar kaldırılır
• Reklamsal veya spam niteliğindeki içerikler yasaktır
• İşletme sahipleri kendi işletmelerine olumlu yorum bırakamaz
• Hekimhane, kurallara aykırı yorumları bildiri yapılmaksızın kaldırma hakkını saklı tutar
• Yorum bırakan kullanıcı, içeriğin doğruluğundan sorumludur`,
    },
    {
      title: '4. İşletme Listeleme',
      content: `Hekimhane'ye işletme ekleyen kullanıcılar şunları kabul eder:

• Sunulan bilgilerin doğru ve güncel olduğunu
• Yetkisiz kişilerin başkasına ait işletmeyi sahiplenmeyeceğini
• İşletme bilgilerinin Hekimhane tarafından kamuya açık olarak yayımlanabileceğini
• Talep halinde doğrulama belgesi sunulabileceğini

Hekimhane, eksik, yanlış veya yanıltıcı bulunan listeleme bilgilerini düzenleme ya da kaldırma hakkını saklı tutar.`,
    },
    {
      title: '5. Fikri Mülkiyet',
      content: `Hekimhane platformundaki tüm içerik, tasarım, logo ve yazılım Hekimhane'ye aittir ve telif hukuku kapsamında korunmaktadır.

Kullanıcılar yalnızca kişisel, ticari olmayan amaçlarla içeriği görüntüleyebilir. İzinsiz:
• Kopyalama, çoğaltma veya dağıtma yasaktır
• Sistemin kaynak koduna erişme veya tersine mühendislik yasaktır
• Logo ve marka unsurlarının kullanımı yasaktır`,
    },
    {
      title: '6. Sorumluluk Sınırlaması',
      content: `Hekimhane aşağıdaki konularda sorumluluk kabul etmez:

• Listelemelerdeki bilgilerin eksiksizliği veya güncelliği
• Üçüncü taraf sağlık kuruluşlarının sunduğu hizmetlerin kalitesi
• Kullanıcı yorumlarının doğruluğu
• Platforma erişilememesi veya teknik kesintiler
• Dolaylı veya sonuçsal zararlar

Sağlık bilgisi niteliğindeki içerikler yalnızca genel bilgi amaçlıdır; tıbbi tavsiye yerine geçmez.`,
    },
    {
      title: '7. Hesap ve Güvenlik',
      content: `Hesap oluşturan kullanıcılar:

• Güçlü ve benzersiz bir şifre kullanmakla yükümlüdür
• Hesap güvenliğinden kendi sorumludur
• Hesabın yetkisiz kullanımını derhal bildirmelidir
• Başkası adına hesap açamaz

Şüpheli faaliyetlerde Hekimhane, hesabı geçici veya kalıcı olarak askıya alma hakkına sahiptir.`,
    },
    {
      title: '8. Değişiklikler',
      content: `Bu kullanım şartları önceden bildirim yapılmaksızın güncellenebilir. Önemli değişiklikler platforma giriş sırasında bildirilir.

Güncelleme tarihinden sonra platformu kullanmaya devam etmek yeni şartları kabul ettiğiniz anlamına gelir. Şartları kabul etmiyorsanız platformu kullanmayı bırakabilirsiniz.`,
    },
    {
      title: '9. Uygulanacak Hukuk',
      content: `Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlıklarda İstanbul Mahkemeleri yetkilidir.

Hekimhane; 6698 sayılı KVKK, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu ve yürürlükteki diğer mevzuata uygun hareket etmeyi taahhüt eder.`,
    },
  ];

  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '48px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.65)' }}>Ana Sayfa</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }} />
            <span style={{ color: 'rgba(255,255,255,.9)' }}>Kullanım Şartları</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            📋 Kullanım Şartları
          </h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14 }}>
            Son güncelleme: Ocak 2025
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 32px 56px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>

        {/* Ana içerik */}
        <div>
          {/* Giriş */}
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
            <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.7, margin: 0 }}>
              <strong>Önemli:</strong> Hekimhane'yi kullanmadan önce lütfen bu kullanım şartlarını dikkatlice okuyun. Platformu kullanmaya devam etmek bu şartları kabul ettiğiniz anlamına gelir.
            </p>
          </div>

          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '28px 32px', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 14 }}>{s.title}</h2>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.9 }}>
                {s.content.split('\n').map((line, j) => {
                  if (line.startsWith('• ')) {
                    return (
                      <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>•</span>
                        <span>{line.slice(2)}</span>
                      </div>
                    );
                  }
                  return line ? <p key={j} style={{ marginBottom: 10 }}>{line}</p> : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sağ panel */}
        <div style={{ position: 'sticky', top: 84 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '22px', marginBottom: 16 }}>
            <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', marginBottom: 14 }}>İçindekiler</h4>
            {SECTIONS.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--muted)', paddingBottom: 8, marginBottom: 8, borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {s.title}
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 22px', marginBottom: 16 }}>
            <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', marginBottom: 12 }}>İlgili Sayfalar</h4>
            {[
              { label: 'Gizlilik Politikası', href: '/gizlilik', icon: 'fa-shield-halved' },
              { label: 'İletişim', href: '/iletisim', icon: 'fa-envelope' },
              { label: 'İşletme Ekle', href: '/katil', icon: 'fa-plus' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--navy)', fontSize: 13, fontWeight: 600 }}>
                <i className={`fa-solid ${item.icon}`} style={{ width: 16, color: 'var(--gold)' }} />
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A20)', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>⚖️</div>
            <h4 style={{ fontWeight: 800, fontSize: 14, color: '#92400E', marginBottom: 6 }}>Hukuki Sorular</h4>
            <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6, marginBottom: 14 }}>
              Şartlarla ilgili sorularınız için ekibimizle iletişime geçebilirsiniz.
            </p>
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#92400E', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
