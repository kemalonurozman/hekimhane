import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Değerlendirme ve Yorum Sistemi — Hekimhane',
  description: 'Hekimhane\'de puanlar ve yorumlar nasıl çalışır? Değerlendirmelerin kaynağı, doğrulama, gizlilik ve "Yeni" profillerin ne anlama geldiğini şeffaf biçimde açıklıyoruz.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/degerlendirme-sistemi' },
};

const KART: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '26px 28px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' };
const H2: React.CSSProperties = { fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 12px' };
const P: React.CSSProperties = { fontSize: 15, color: '#3A3A3C', lineHeight: 1.7, margin: '0 0 12px' };

export default function DegerlendirmeSistemiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Bir profilde neden "Yeni" yazıyor veya puan görünmüyor?', acceptedAnswer: { '@type': 'Answer', text: 'Henüz doğrulanmış hasta değerlendirmesi olmayan profiller "Yeni" olarak gösterilir. Gerçek bir yorum yokken puan gösterilmez; ilk değerlendirmeyle birlikte puan oluşur.' } },
      { '@type': 'Question', name: 'Yorumlar gerçek hastalardan mı geliyor?', acceptedAnswer: { '@type': 'Answer', text: 'Evet. Değerlendirmeler ziyaretçiler ve hastalar tarafından bırakılır. Yorum bırakırken ad-soyad istenir; bu bilgi sayfada gizlenir, yalnızca değerlendirilen hekim/işletme doğrulama için tam adı görebilir.' } },
      { '@type': 'Question', name: 'Yorumumdaki adım herkese görünür mü?', acceptedAnswer: { '@type': 'Answer', text: 'Hayır. Adınız sayfada tam ve açık gösterilmez (ör. "Elif K."). Tam adınızı yalnızca değerlendirdiğiniz hekim görür; bu, yorumun gerçek bir hastadan geldiğinin doğrulanması içindir.' } },
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '48px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span><span style={{ color: 'white' }}>Değerlendirme Sistemi</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 12px' }}>
            Puanlar ve Yorumlar Nasıl Çalışır?
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            Hekimhane&apos;de güven her şeyin önünde gelir. Değerlendirmelerin kaynağını, nasıl hesaplandığını ve
            gizliliği burada şeffaf biçimde açıklıyoruz.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 820, padding: '36px 16px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* "Yeni" açıklaması — en sık soru */}
        <section style={{ ...KART, borderLeft: '4px solid var(--gold)' }}>
          <h2 style={H2}>Bir profilde neden “Yeni” yazıyor ya da puan görünmüyor?</h2>
          <p style={P}>
            Henüz <strong>doğrulanmış hasta değerlendirmesi olmayan</strong> profiller <strong>“Yeni”</strong> olarak
            gösterilir. Gerçek bir yorum yokken profilde puan (ör. 4,2) <strong>gösterilmez</strong> — çünkü ortada
            değerlendiren kimse yoktur. İlk gerçek yorumla birlikte puan oluşmaya başlar.
          </p>
          <p style={{ ...P, margin: 0 }}>
            Bu, yeni eklenen bir kliniğin yapay bir puanla öne çıkmasını engeller; gördüğünüz her yıldız, gerçek bir
            hasta deneyimine dayanır.
          </p>
        </section>

        {/* Kaynak */}
        <section style={KART}>
          <h2 style={H2}>Değerlendirmeler nereden gelir?</h2>
          <p style={P}>
            Puanlar ve yorumlar; kliniği, hekimi veya eczaneyi ziyaret eden <strong>gerçek kişiler</strong> tarafından
            bırakılır. Herkes bir işletme sayfasından yıldız verip deneyimini yazabilir.
          </p>
          <p style={{ ...P, margin: 0 }}>
            Yorum bırakırken <strong>ad-soyad</strong> istenir. Bu, değerlendirmenin gerçek bir hastadan geldiğinin
            doğrulanabilmesi içindir — aşağıda gizlilik kısmında ayrıntısı var.
          </p>
        </section>

        {/* Gizlilik */}
        <section style={KART}>
          <h2 style={H2}>Yorumumdaki adım herkese görünür mü?</h2>
          <p style={P}>
            <strong>Hayır.</strong> Adınız sayfada <strong>tam ve açık gösterilmez</strong> — yalnızca baş harflerle
            (ör. <em>“Elif K.”</em>) yer alır.
          </p>
          <p style={{ ...P, margin: 0 }}>
            Tam adınızı <strong>yalnızca değerlendirdiğiniz hekim/işletme</strong> görebilir; bu da yorumun gerçek bir
            hastadan geldiğinin doğrulanması içindir. Gizliliğiniz her zaman korunur.
          </p>
        </section>

        {/* Doğrulama & moderasyon */}
        <section style={KART}>
          <h2 style={H2}>Doğrulama ve moderasyon</h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ fontSize: 15, color: '#3A3A3C', lineHeight: 1.65 }}><strong>✓ Onaylı</strong> rozeti, sahipliği doğrulanmış hekim ve işletmeleri gösterir.</li>
            <li style={{ fontSize: 15, color: '#3A3A3C', lineHeight: 1.65 }}>İşletme sahibi, uygunsuz bulduğu bir yorumu <strong>şikâyet edebilir</strong>; son kararı yalnızca Hekimhane moderasyon ekibi verir (gizle / kaldır / reddet).</li>
            <li style={{ fontSize: 15, color: '#3A3A3C', lineHeight: 1.65 }}>İşletme sahibi kendi yorumunu <strong>silemez veya değiştiremez</strong>; yalnızca yanıt verebilir. Böylece değerlendirmeler tarafsız kalır.</li>
          </ul>
        </section>

        {/* Puan nasıl hesaplanır */}
        <section style={KART}>
          <h2 style={H2}>Puan nasıl hesaplanır?</h2>
          <p style={P}>
            Profildeki puan, o işletmeye bırakılan tüm yıldızların ortalamasıdır. Listelerdeki sıralamada,
            <strong> tek bir yorumun</strong> bir işletmeyi haksız yere en üste taşımaması için dengeli bir
            ortalama kullanılır — yani 1 tane 5 yıldız, 200 yorumlu bir kliniğin önüne geçmez.
          </p>
          <p style={{ ...P, margin: 0 }}>
            Yorum sayısı arttıkça puan, gerçek ortalamayı daha net yansıtır.
          </p>
        </section>

        {/* Nasıl yorum bırakılır */}
        <section style={{ ...KART, background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid #BBF7D0' }}>
          <h2 style={{ ...H2, color: '#065F46' }}>Nasıl değerlendirme bırakırım?</h2>
          <p style={{ ...P, color: '#065F46' }}>
            Ziyaret ettiğiniz kliniğin, hekimin veya eczanenin Hekimhane profiline gidin; <strong>“Deneyiminizi
            paylaşın”</strong> bölümünden yıldız verip yorumunuzu yazın. Deneyiminiz, sizden sonra gelen hastalara yol gösterir.
          </p>
          <Link href="/klinikler" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6, background: '#059669', color: 'white', fontSize: 14, fontWeight: 700, borderRadius: 11, padding: '11px 20px', textDecoration: 'none' }}>
            Diş kliniklerini keşfet →
          </Link>
        </section>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
          Sorularınız için <Link href="/iletisim" style={{ color: 'var(--navy)', fontWeight: 600 }}>iletişim</Link> sayfasından bize ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
