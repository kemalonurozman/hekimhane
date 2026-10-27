import type { Metadata } from 'next';
import Link from 'next/link';
import FircaOyunu from '@/components/oyun/FircaOyunu';
import GommeKodu from '@/components/oyun/GommeKodu';

const URL = 'https://www.hekimhane.com.tr/cocuk-dis-sagligi/oyunlar/dis-fircalama';

export const metadata: Metadata = {
  title: '2 Dakika Fırçala — Çocuklar İçin Diş Fırçalama Oyunu',
  description: 'Çocuklar için ücretsiz diş fırçalama oyunu: ağzın dört bölgesini 30’ar saniye fırçala, plakları temizle, önerilen 2 dakikalık fırçalama süresini oynayarak öğren. Üyelik yok, veri toplanmaz.',
  alternates: { canonical: URL },
  openGraph: { title: '2 Dakika Fırçala | Hekimhane', url: URL, type: 'website' },
};

const Onay = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E9E8F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

const KURALLAR = [
  'Günde 2 kez, her seferinde 2 dakika fırçalayın: sabah kahvaltıdan sonra ve akşam yatmadan önce.',
  'Florürlü diş macunu kullanın: 3 yaşına kadar pirinç tanesi kadar, 3–6 yaş arasında bezelye tanesi kadar.',
  'Fırçaladıktan sonra macunu tükürün; ağzı bol suyla çalkalamayın, florür dişin üstünde kalsın.',
  'Her seferinde aynı sırayı izleyin (oyundaki gibi), böylece hiçbir bölge atlanmaz. Dişlerin iç yüzünü ve çiğneme yüzeylerini de unutmayın.',
  'Küçük çocukların fırçalamasına bir yetişkin yardım etsin ya da sonunda kontrol etsin.',
  'Yumuşak kıllı, çocuk boyu bir fırça seçin; kıllar açıldığında ya da yaklaşık 3 ayda bir değiştirin.',
];

export default function DisFircalamaOyunuPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
      { '@type': 'ListItem', position: 2, name: 'Çocuk Diş Sağlığı', item: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi' },
      { '@type': 'ListItem', position: 3, name: 'Oyunlar', item: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi/oyunlar' },
      { '@type': 'ListItem', position: 4, name: '2 Dakika Fırçala', item: URL },
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="oy-ust">
        <div className="container" style={{ maxWidth: 960 }}>
          <nav className="oy-yol" aria-label="Sayfa yolu">
            <Link href="/">Ana Sayfa</Link><span>›</span>
            <Link href="/cocuk-dis-sagligi">Çocuk Diş Sağlığı</Link><span>›</span>
            <Link href="/cocuk-dis-sagligi/oyunlar">Oyunlar</Link><span>›</span>
            <span style={{ color: 'var(--navy)' }}>2 Dakika Fırçala</span>
          </nav>
          <span className="oy-etiket">Oyun · 3–9 yaş</span>
          <h1 className="oy-h1">2 Dakika Fırçala</h1>
          <p className="oy-giris">
            Diş hekimlerinin önerdiği fırçalama süresi 2 dakikadır. Bu oyunda ağız dört bölgeye ayrılır ve her bölgeye
            30 saniye düşer. Parlayan bölgedeki dişleri fırçala, sarı plakları temizle.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, padding: '24px 16px 64px' }}>
        <FircaOyunu />

        <section className="oy-kutu" style={{ marginTop: 26, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2>Oyundan sonra: lavabodaki 2 dakika</h2>
          <ul className="oy-liste">
            {KURALLAR.map(k => <li key={k}>{Onay}<span>{k}</span></li>)}
          </ul>
        </section>

        <section id="sitenize-ekleyin" className="oy-kutu" style={{ marginTop: 18, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', scrollMarginTop: 90 }}>
          <h2>Oyunu sitenize ekleyin</h2>
          <p style={{ fontSize: 14.5, color: '#3A3A3C', lineHeight: 1.65, margin: '0 0 14px' }}>
            Klinik, kreş, okul ya da blog sitenize ücretsiz ekleyebilirsiniz. Kodu kopyalayıp sayfanızın HTML bölümüne
            yapıştırın (WordPress’te “Özel HTML” bloğu). Oyun her zaman güncel sürümüyle açılır.
          </p>
          <ul className="oy-liste" style={{ marginBottom: 16 }}>
            <li>{Onay}<span>Oyunun altındaki <strong>hekimhane.com.tr</strong> logosu ve bağlantısı oyunun bir parçasıdır; çerçevenin içinden gelir, kaldırılamaz ya da değiştirilemez.</span></li>
            <li>{Onay}<span>Oyun ziyaretçilerinizden veri toplamaz, çerez kullanmaz, reklam göstermez.</span></li>
            <li>{Onay}<span>Kodu değiştirmeden kullanın. Çerçeve 420 pikselden kısa olursa oyun yerine Hekimhane’ye giden bir bağlantı görünür.</span></li>
          </ul>
          <GommeKodu slug="dis-fircalama" ad="2 Dakika Fırçala" aciklama="çocuklar için diş fırçalama oyunu" />
        </section>

        <p className="oy-not">
          Oyun ücretsizdir; üyelik istenmez, oyun sırasında hiçbir veri kaydedilmez. Bilgiler genel amaçlıdır, tıbbi tanı veya
          tedavi yerine geçmez. Çocuğunuzun dişleriyle ilgili sorularınız için bir{' '}
          <Link href="/klinikler?uzmanlik=Pedodonti%20(%C3%87ocuk%20Di%C5%9F%20Hekimli%C4%9Fi)">çocuk diş hekimine</Link> başvurun.{' '}
          <Link href="/cocuk-dis-sagligi">Çocuk Diş Sağlığı rehberi</Link> ·{' '}
          <Link href="/cocuk-dis-sagligi/oyunlar">Tüm oyunlar</Link>
        </p>
      </div>
    </main>
  );
}
