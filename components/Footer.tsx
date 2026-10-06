import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { toSlug } from '@/lib/helpers';

export default function Footer() {
  const PLATFORM = [
    ['Diş Klinikleri',       '/klinikler'],
    ['Diş Hekimleri',        '/dis-hekimleri'],
    ['Ağız & Diş Sağlığı',   '/hastaliklar/dis-sagligi'],
    ['Çocuk Diş Sağlığı',    '/cocuk-dis-sagligi'],
    ['2026 Tedavi Ücretleri', '/tedavi-ucretleri'],
    ['HekimKart',            '/hekimkart'],
    ['Randevu Modülü',       '/randevu-modulu'],
    ['Karşılaştır',          '/karsilastir'],
    ['Blog',                 '/blog'],
    ['Kliniğinizi Ekleyin',  '/katil'],
  ];

  // Diş dışı sağlık hizmetleri — ikincil, yalnızca footer'da
  const DIGER_SAGLIK = [
    ['Devlet Diş Hastaneleri', '/devlet-dis-hastaneleri'],
    ['Bobath Terapistleri', '/bobath-terapistleri'],
    ['Fizik Tedavi & Rehabilitasyon', '/doktorlar?spec=Fiziksel%20T%C4%B1p%20ve%20Rehabilitasyon'],
    ['Psikiyatri & Psikoloji', '/doktorlar?spec=Psikiyatri'],
    ['Diğer Doktorlar', '/doktorlar'],
    ['Hastaneler',      '/hastaneler'],
    ['Eczaneler',       '/eczaneler'],
    ['Yakın Eczane',    '/yakin-eczane'],
  ];

  const SIRKET = [
    ['Hakkımızda',   '/hakkimizda'],
    ['Blog',         '/blog'],
    ['Makale Yayınla', '/makale-yayinla'],
    ['Randevu Sistemi', '/randevu-sistemi'],
    ['MCP Bağlantısı', '/mcp'],
    ['Değerlendirme Sistemi', '/degerlendirme-sistemi'],
    ['İletişim',     '/iletisim'],
    ['Abonelik İptali', '/abonelik-iptali'],
  ];

  const YASAL = [
    ['Gizlilik Politikası', '/gizlilik'],
    ['Kullanım Şartları',   '/kullanim'],
    ['KVKK',                '/kvkk'],
    ['Çerez Politikası',    '/cerez'],
    ['Abonelik İptali',     '/abonelik-iptali'],
  ];

  // SEO iç-linkleme: popüler şehirler + diş tedavileri
  const POPULER_SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Muğla', 'Bursa', 'Adana', 'Konya', 'Zonguldak', 'Trabzon', 'Eskişehir', 'Kayseri', 'Bartın', 'Karabük'];
  const POPULER_TEDAVILER: [string, string][] = [
    ['İmplant Tedavisi', 'İmplantoloji (İmplant)'],
    ['Ortodonti (Diş Teli)', 'Ortodonti (Diş Teli)'],
    ['Çocuk Diş Hekimliği', 'Pedodonti (Çocuk Diş Hekimliği)'],
    ['Ağız Diş ve Çene Cerrahisi', 'Ağız Diş ve Çene Cerrahisi'],
    ['Estetik Diş Hekimliği', 'Estetik Diş Hekimliği'],
    ['Kanal Tedavisi', 'Endodonti (Kanal Tedavisi)'],
    ['Diş Dolgusu', 'Restoratif Diş Tedavisi (Dolgu)'],
    ['Genel Diş Hekimliği', 'Genel Diş Hekimliği'],
  ];
  // Diş dışı iki alan — footer'da SEO iç-linkleme. Hedefler mevcut sayfalar:
  // /doktorlar?spec=…&il=… (FTR uzmanı, psikiyatri, psikolog) ve /bobath-terapistleri[/il]
  // (379 fizyoterapistin tamamı bobath etiketli; standart /doktorlar aramasında görünmezler).
  // Şehir listeleri canlı veriye göre (2026-09): kayıt olmayan şehre link verilmez.
  const spec = (s: string) => `/doktorlar?spec=${encodeURIComponent(s)}`;
  const FTR = 'Fiziksel Tıp ve Rehabilitasyon';
  const FIZIK_TEDAVI: [string, string][] = [
    ['Fizyoterapistler (Bobath)', '/bobath-terapistleri'],
    ['Fizik Tedavi Uzmanları', spec(FTR)],
    ...['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana'].map((il): [string, string] => [`${il} Fizyoterapist`, `/bobath-terapistleri/${toSlug(il)}`]),
    ...['Ankara', 'İzmir', 'İstanbul', 'Adana', 'Balıkesir'].map((il): [string, string] => [`${il} Fizik Tedavi`, `${spec(FTR)}&il=${encodeURIComponent(il)}`]),
  ];
  const PSIKOLOJI: [string, string][] = [
    ['Psikiyatri Uzmanları', spec('Psikiyatri')],
    ['Psikologlar', spec('Psikoloji')],
    ...['İstanbul', 'Ankara', 'İzmir', 'Adana', 'Balıkesir', 'Muğla'].map((il): [string, string] => [`${il} Psikiyatri`, `${spec('Psikiyatri')}&il=${encodeURIComponent(il)}`]),
  ];
  // Tasarım sistemi F1: link bulutları düz metin sütunları, grup başına en fazla 12 + "Tümü →"
  const SEO_GRUPLARI: { baslik: string; linkler: [string, string][]; tumu: string }[] = [
    { baslik: 'ŞEHRE GÖRE DİŞ KLİNİKLERİ', tumu: '/klinikler',
      linkler: POPULER_SEHIRLER.map((c): [string, string] => [`${c} diş klinikleri`, `/klinikler?il=${encodeURIComponent(c)}`]) },
    { baslik: 'DİŞ TEDAVİLERİ', tumu: '/klinikler',
      linkler: POPULER_TEDAVILER.map(([label, sp]): [string, string] => [label, `/klinikler?uzmanlik=${encodeURIComponent(sp)}`]) },
    { baslik: 'FİZİK TEDAVİ VE REHABİLİTASYON', tumu: '/bobath-terapistleri', linkler: FIZIK_TEDAVI },
    { baslik: 'PSİKİYATRİ VE PSİKOLOJİ', tumu: spec('Psikiyatri'), linkler: PSIKOLOJI },
  ];
  const SUTUNLAR: { baslik: string; linkler: string[][] }[] = [
    { baslik: 'PLATFORM', linkler: PLATFORM },
    { baslik: 'DİĞER SAĞLIK', linkler: DIGER_SAGLIK },
    { baslik: 'ŞİRKET', linkler: [...SIRKET, ['Site Haritası', '/site-haritasi'], ['RSS', '/rss.xml']] },
    { baslik: 'YASAL', linkler: YASAL },
  ];

  // Sosyal hesaplar — href boşken ilgili ikon gizlenir. Hesap açıldıkça doldurun.
  const SOCIAL = [
    { icon: 'fa-instagram',   href: '', label: 'Instagram' },
    { icon: 'fa-x-twitter',   href: '', label: 'X (Twitter)' },
    { icon: 'fa-linkedin-in', href: '', label: 'LinkedIn' },
    { icon: 'fa-youtube',     href: '', label: 'YouTube' },
  ];

  return (
    <footer className="site-footer hk-footer" style={{ marginTop: 80 }}>
      <style>{`
        .hk-footer__seo { display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--space-6); padding-bottom:var(--space-7); margin-bottom:var(--space-7); border-bottom:1px solid rgba(255,255,255,.12); }
        .hk-footer__grid--site { grid-template-columns:1.3fr repeat(4, 1fr); }
        .hk-footer__bulten { display:flex; gap:8px; margin-top:var(--space-4); max-width:340px; }
        .hk-footer__bulten input { flex:1; min-width:0; height:44px; padding:0 12px; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,.2); background:rgba(255,255,255,.08); color:var(--on-deep); font:inherit; font-size:15px; }
        .hk-footer__bulten input::placeholder { color:var(--on-deep-muted); }
        .hk-footer__bulten button { height:44px; padding:0 16px; border:0; border-radius:var(--radius-md); background:var(--gold-fill); color:var(--on-gold); font:inherit; font-size:14px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .hk-footer__iletisim { display:flex; flex-direction:column; gap:10px; margin-top:var(--space-5); }
        .hk-footer a.hk-footer__tumu { color:var(--on-deep); font-weight:600; }
        @media (max-width: 1080px) { .hk-footer__seo { grid-template-columns:1fr 1fr; } .hk-footer__grid--site { grid-template-columns:1fr 1fr 1fr; } .hk-footer__grid--site .hk-footer__brand { grid-column:1 / -1; } }
        @media (max-width: 520px) { .hk-footer__seo, .hk-footer__grid--site { grid-template-columns:1fr 1fr; gap:var(--space-5); } }
      `}</style>
      <div className="hk-footer__in">

        {/* SEO iç-linkleme: düz metin link sütunları */}
        <div className="hk-footer__seo">
          {SEO_GRUPLARI.map(g => (
            <div key={g.baslik} className="hk-footer__col">
              <h4>{g.baslik}</h4>
              <ul>
                {g.linkler.slice(0, 12).map(([label, href]) => (
                  <li key={href}><Link href={href}>{label}</Link></li>
                ))}
                <li><Link href={g.tumu} className="hk-footer__tumu">Tümü →</Link></li>
              </ul>
            </div>
          ))}
        </div>

        <div className="hk-footer__grid hk-footer__grid--site">

          {/* Marka + tanıtım + bülten + iletişim */}
          <div className="hk-footer__brand">
            <Logo size={38} dark />
            <p>Türkiye'nin diş sağlığı rehberi. Size en yakın diş kliniğini ve uzman diş hekimini tek platformda bulun.</p>
            <div className="hk-footer__bulten">
              <input type="email" placeholder="E-posta adresiniz" aria-label="E-posta adresiniz" />
              <button type="button">Abone ol</button>
            </div>
            {/* İletişim — ödeme alan site için iletişim ve iptal yolu görünür olmalı */}
            <div className="hk-footer__iletisim">
              <a href="mailto:info@hekimhane.com.tr" style={{ color: 'var(--on-deep)', fontWeight: 600 }}>info@hekimhane.com.tr</a>
              <Link href="/iletisim">İletişim formu · 24 saat içinde yanıt</Link>
              <Link href="/abonelik-iptali">Pro abonelik iptali</Link>
            </div>
            {/* Sosyal medya — yalnızca gerçek hesap linki girildiğinde görünür */}
            {SOCIAL.some(s => s.href) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {SOCIAL.filter(s => s.href).map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fab ${s.icon}`} style={{ fontSize: 16 }} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {SUTUNLAR.map(col => (
            <div key={col.baslik} className="hk-footer__col">
              <h4>{col.baslik}</h4>
              <ul>
                {col.linkler.map(([label, href]) => (
                  <li key={href}>
                    {href.endsWith('.xml') ? <a href={href}>{label}</a> : <Link href={href}>{label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Acil durum bandı */}
        <div className="hk-footer__sos" style={{ marginTop: 'var(--space-7)' }}>
          <span>Hayati tehlike durumunda</span>
          <a href="tel:112" className="hk-footer__num">112</a>
          <span>numaralı acil çağrı hattını arayın.</span>
        </div>

        <div className="hk-footer__legal" style={{ marginTop: 'var(--space-5)' }}>
          <p>© {new Date().getFullYear()} Hekimhane — hekimhane.com.tr — Tüm hakları saklıdır.</p>
          <p>Türkiye · Diş sağlığında güvenilir rehber</p>
        </div>
      </div>
    </footer>
  );
}
