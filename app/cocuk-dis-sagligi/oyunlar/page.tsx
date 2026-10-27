import type { Metadata } from 'next';
import Link from 'next/link';
import { COCUK_OYUNLAR } from '@/lib/cocuk-oyunlar';

const URL = 'https://www.hekimhane.com.tr/cocuk-dis-sagligi/oyunlar';

export const metadata: Metadata = {
  title: 'Çocuklar İçin Diş Fırçalama Oyunları',
  description: 'Çocuğunuzla birlikte oynayabileceğiniz ücretsiz diş sağlığı oyunları. 2 Dakika Fırçala ile doğru fırçalama süresini ve sırasını oynayarak öğrenin. Üyelik yok, veri toplanmaz.',
  alternates: { canonical: URL },
  openGraph: { title: 'Çocuklar İçin Diş Fırçalama Oyunları | Hekimhane', url: URL, type: 'website' },
};

const Onay = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E9E8F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Kart görseli: oyundaki ağız şemasının küçük, statik hâli */
function MiniAgiz() {
  const dis = (cx: number, cy: number, temiz: boolean, k: number) => (
    <rect key={k} x={cx - 8} y={cy - 8} width={16} height={16} rx={5}
      fill="#fff" stroke={temiz ? '#2E9E8F' : '#A9B8CC'} strokeWidth="1.6" />
  );
  const ust = Array.from({ length: 10 }, (_, k) => {
    const t = ((195 + (150 * k) / 9) * Math.PI) / 180;
    return [Math.round(110 + 80 * Math.cos(t)), Math.round(92 + 64 * Math.sin(t))];
  });
  const alt = Array.from({ length: 10 }, (_, k) => {
    const t = ((15 + (150 * k) / 9) * Math.PI) / 180;
    return [Math.round(110 + 80 * Math.cos(t)), Math.round(92 + 64 * Math.sin(t))];
  });
  return (
    <svg width="220" height="184" viewBox="0 0 220 184" aria-hidden="true">
      <path d="M31 81 A80 64 0 0 1 110 28" fill="none" stroke="#F6DC8E" strokeWidth="30" strokeLinecap="round" opacity=".8" />
      {ust.map(([x, y], k) => dis(x, y, k < 5, k))}
      {alt.map(([x, y], k) => dis(x, y, false, k + 10))}
      {alt.slice(0, 5).map(([x, y], k) => (
        <g key={`p${k}`} fill="#D6AE45" opacity=".8"><circle cx={x - 3} cy={y - 2} r={3} /><circle cx={x + 3} cy={y + 3} r={2.4} /></g>
      ))}
      <circle cx="110" cy="92" r="26" fill="#fff" stroke="#EEF1F5" strokeWidth="5" />
      <circle cx="110" cy="92" r="26" fill="none" stroke="#1B3A69" strokeWidth="5" strokeLinecap="round" strokeDasharray="163" strokeDashoffset="70" transform="rotate(-90 110 92)" />
      <text x="110" y="98" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1B3A69">1:42</text>
    </svg>
  );
}

export default function CocukOyunlarPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Çocuk Diş Sağlığı', item: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi' },
        { '@type': 'ListItem', position: 3, name: 'Oyunlar', item: URL },
      ] },
      { '@type': 'ItemList', name: 'Çocuklar için diş sağlığı oyunları', numberOfItems: COCUK_OYUNLAR.length,
        itemListElement: COCUK_OYUNLAR.map((o, i) => ({ '@type': 'ListItem', position: i + 1, name: o.ad, url: `${URL}/${o.slug}` })) },
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
            <span style={{ color: 'var(--navy)' }}>Oyunlar</span>
          </nav>
          <span className="oy-etiket">Çocuklar için</span>
          <h1 className="oy-h1">Diş fırçalama oyunları</h1>
          <p className="oy-giris">
            Fırçalamayı bir oyuna çevirin. Çocuğunuzla birlikte oynayın; doğru süreyi ve sırayı ekranda öğrensin,
            sonra lavaboda aynısını yapsın.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, padding: '28px 16px 64px' }}>
        <div className="oy-izgara">
          {COCUK_OYUNLAR.map(o => (
            <Link key={o.slug} href={`/cocuk-dis-sagligi/oyunlar/${o.slug}`} className="oy-kart">
              <div className="oy-kart__gorsel"><MiniAgiz /></div>
              <div className="oy-kart__govde">
                <div className="oy-kart__meta"><span>{o.yas}</span><span>{o.sure}</span><span>Ücretsiz</span></div>
                <h2>{o.ad}</h2>
                <p>{o.kisa}</p>
                <span className="oy-kart__git">
                  Oyna
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <section className="oy-kutu" style={{ marginTop: 22 }}>
          <h2>Ebeveynler için</h2>
          <ul className="oy-liste">
            <li>{Onay}<span>Oyunlar ücretsizdir; üyelik, e-posta ya da kişisel bilgi istenmez. Oyun sırasında hiçbir veri kaydedilmez.</span></li>
            <li>{Onay}<span>Ses yoktur; telefonda parmakla, bilgisayarda fare ya da klavyeyle oynanır.</span></li>
            <li>{Onay}<span>Klinik, kreş ya da okul sitenize ücretsiz ekleyebilirsiniz: oyun sayfasındaki <Link href="/cocuk-dis-sagligi/oyunlar/dis-fircalama#sitenize-ekleyin" style={{ color: 'var(--navy)', fontWeight: 600 }}>“Oyunu sitenize ekleyin”</Link> bölümünden HTML kodunu kopyalayın.</span></li>
            <li>{Onay}<span>Oyun, gerçek fırçalamanın yerine geçmez. En iyisi oyunu bir kez oynayıp hemen ardından birlikte fırçalamaktır.</span></li>
          </ul>
        </section>

        <p className="oy-not">
          Bu oyunlar bilgilendirme amaçlıdır; tıbbi tanı veya tedavi yerine geçmez. Çocuğunuzun diş sağlığıyla ilgili konular için{' '}
          <Link href="/cocuk-dis-sagligi">Çocuk Diş Sağlığı rehberine</Link> göz atabilir ya da bir{' '}
          <Link href="/klinikler?uzmanlik=Pedodonti%20(%C3%87ocuk%20Di%C5%9F%20Hekimli%C4%9Fi)">çocuk diş hekimine</Link> başvurabilirsiniz.
        </p>
      </div>
    </main>
  );
}
