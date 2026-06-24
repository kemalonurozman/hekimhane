import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Hekimhane',
  description: 'Hekimhane gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi edinin.',
};

export default function GizlilikPage() {
  const SECTIONS = [
    {
      title: '1. Toplanan Veriler',
      content: `Hekimhane olarak aşağıdaki kişisel verileri toplayabiliriz:

• **Kimlik bilgileri:** Ad, soyad (yorum yaparken isteğe bağlı)
• **İletişim bilgileri:** E-posta adresi (iletişim formu, bülten aboneliği)
• **Kullanım verileri:** Ziyaret edilen sayfalar, arama sorguları, tıklama verileri (anonim)
• **Konum verileri:** Şehir/ilçe bazlı arama tercihleriniz (tarayıcı izni gerektiren hassas konum toplanmaz)

İşletme sahipleri için ayrıca: İşletme adı, adres, telefon, e-posta, yetkili kişi bilgileri.`,
    },
    {
      title: '2. Verilerin Kullanım Amacı',
      content: `Topladığımız veriler şu amaçlarla kullanılır:

• Arama sonuçlarını kişiselleştirmek ve size en uygun sağlık hizmetini sunmak
• Yorum ve değerlendirmelerinizi yayımlamak
• İletişim taleplerinizi yanıtlamak
• Platformun güvenliğini sağlamak ve hizmet kalitesini iyileştirmek
• Yasal yükümlülükleri yerine getirmek`,
    },
    {
      title: '3. Çerezler (Cookies)',
      content: `Hekimhane, aşağıdaki çerez türlerini kullanır:

• **Zorunlu çerezler:** Sitenin çalışması için gerekli teknik çerezler. Devre dışı bırakılamaz.
• **Analitik çerezler:** Ziyaretçi sayısı, sayfa görüntülenmeleri gibi anonim istatistikler (Google Analytics).
• **Tercih çerezleri:** Dil ve görüntüleme tercihlerinizi hatırlamak için.

Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Zorunlu olmayan çerezleri reddetme hakkına sahipsiniz.`,
    },
    {
      title: '4. Veri Paylaşımı',
      content: `Kişisel verileriniz hiçbir koşulda üçüncü şahıslara satılmaz. Veriler yalnızca şu durumlarda paylaşılır:

• **Hizmet sağlayıcılar:** Hosting, analitik ve e-posta gibi teknik hizmet sağlayıcılarımız (gizlilik anlaşması kapsamında)
• **Yasal zorunluluk:** Mahkeme kararı veya yetkili mercilerin yasal talebi halinde
• **İşletme devri:** Şirket birleşmesi ya da devri halinde, kullanıcılar önceden bilgilendirilir

Sağlık kuruluşlarının listeleme bilgileri kamuya açık olup gizlilik kapsamında değildir.`,
    },
    {
      title: '5. Veri Güvenliği',
      content: `Verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız:

• Tüm veri aktarımları SSL/TLS şifrelemesi ile korunur
• Supabase altyapısı üzerinde depolanan veriler şifrelenir
• Erişim yetkileri minimum düzeyde tutulur ve düzenli olarak gözden geçirilir
• Güvenlik açıkları için düzenli testler yapılır`,
    },
    {
      title: '6. Haklarınız (KVKK)',
      content: `6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme
• Silinmesini veya yok edilmesini isteme
• Otomatik sistemler vasıtasıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme
• Kanuna aykırı işleme nedeniyle zararınızın giderilmesini talep etme

Bu haklarınızı kullanmak için **iletisim@hekimhane.com.tr** adresine başvurabilirsiniz.`,
    },
    {
      title: '7. Çocukların Gizliliği',
      content: `Hekimhane, 18 yaşın altındaki kişilerden bilerek kişisel veri toplamaz. Platformumuzun çocuklara yönelik bölümleri yoktur. 18 yaş altı bir kişinin verilerinin işlendiğini fark ederseniz lütfen bize bildirin; derhal silme işlemini gerçekleştireceğiz.`,
    },
    {
      title: '8. Politika Güncellemeleri',
      content: `Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler e-posta veya site bildirimi yoluyla duyurulur. Güncelleme tarihini sayfanın altında bulabilirsiniz. Platformu kullanmaya devam etmek güncel politikayı kabul ettiğiniz anlamına gelir.`,
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
            <span style={{ color: 'rgba(255,255,255,.9)' }}>Gizlilik Politikası</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            🔒 Gizlilik Politikası
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
          <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
            <p style={{ fontSize: 14, color: '#3730A3', lineHeight: 1.7, margin: 0 }}>
              <strong>Hekimhane</strong> olarak gizliliğinize önem veriyoruz. Bu politika; platformumuzu kullandığınızda hangi verileri topladığımızı, bunları nasıl kullandığımızı ve koruduğumuzu açıklar. Lütfen dikkatlice okuyun.
            </p>
          </div>

          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '28px 32px', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 14 }}>{s.title}</h2>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {s.content.split('\n').map((line, j) => {
                  if (line.startsWith('• **')) {
                    const parts = line.replace('• **', '').split(':**');
                    return (
                      <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>•</span>
                        <span><strong style={{ color: 'var(--navy)' }}>{parts[0]}:</strong>{parts[1]}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('• ')) {
                    return (
                      <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>•</span>
                        <span>{line.slice(2)}</span>
                      </div>
                    );
                  }
                  return line ? <p key={j} style={{ marginBottom: 8 }}>{line}</p> : <br key={j} />;
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
              <div key={i} style={{ fontSize: 13, color: 'var(--muted)', paddingBottom: 8, marginBottom: 8, borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {s.title}
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', border: '1.5px solid #C7D2FE', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>✉️</div>
            <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', marginBottom: 6 }}>Sorunuz mu var?</h4>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 14 }}>
              Gizlilik konularında ekibimizle iletişime geçebilirsiniz.
            </p>
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--navy)', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
