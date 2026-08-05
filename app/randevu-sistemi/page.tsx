import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hekim Randevu Sistemi — Online Randevu, Hatırlatma ve Takvim Yönetimi | Hekimhane',
  description: 'Hekimhane Randevu Sistemi nasıl çalışır? Hastalar uygun tarihi sistemden seçer; hem hekime hem hastaya anında onay maili gider, randevudan önce hatırlatma gönderilir. Hekimler takvimlerini kolayca açıp bloke edebilir.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/randevu-sistemi' },
};

const KART: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '28px 30px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' };
const H2: React.CSSProperties = { fontFamily: 'var(--font-playfair,serif)', fontSize: 21, fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px', letterSpacing: '-0.3px' };
const P: React.CSSProperties = { fontSize: 15, color: '#3A3A3C', lineHeight: 1.7, margin: '0 0 12px' };

/* ── İkonlar (inline SVG — emoji yok) ── */
const IcCalendarPick = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /><rect x="7" y="13" width="4" height="4" rx="0.6" fill="currentColor" stroke="none" /></svg>
);
const IcBolt = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>
);
const IcMailDouble = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="16" height="12" rx="2" /><path d="m2 8 8 5 8-5" /><path d="M20 9v9a2 2 0 0 1-2 2H7" opacity="0.4" /></svg>
);
const IcBell = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);

const STEP_COLORS = ['#1B3A69', '#2563EB', '#059669', '#D4A843'];

export default function RandevuSistemiPage() {
  const adimlar = [
    { ic: IcCalendarPick, baslik: 'Uygun zamanı seçin', metin: 'Hasta, hekimin sayfasından “Randevu Al” butonuna basar; açık tarih ve saat dilimini sistemden seçer.' },
    { ic: IcBolt, baslik: 'Talep anında iletilir', metin: 'Randevu talebi hekime ve Hekimhane’ye saniyeler içinde ulaşır — telefon beklemeye, mesai saatine gerek yok.' },
    { ic: IcMailDouble, baslik: 'Çift taraflı onay maili', metin: 'Hem hekime hem randevuyu oluşturan hastaya otomatik onay e-postası gider. İki taraf da aynı bilgiye sahiptir.' },
    { ic: IcBell, baslik: 'Randevudan önce hatırlatma', metin: 'Randevu tarihinden önce hatırlatma maili gönderilir: “Gelemeyecekseniz lütfen bilgi verin.”' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Hekimhane üzerinden randevu nasıl alınır?', acceptedAnswer: { '@type': 'Answer', text: 'Hekimin veya kliniğin Hekimhane profiline gidip “Randevu Al” butonuna basın, açık tarih ve saat dilimini seçin, ad-soyad ve iletişim bilginizi bırakın. Talebiniz anında hekime iletilir ve size onay e-postası gönderilir.' } },
      { '@type': 'Question', name: 'Randevu aldığımda bana e-posta gelir mi?', acceptedAnswer: { '@type': 'Answer', text: 'Evet. Randevu oluşturulduğunda hem hekime hem de randevuyu oluşturan kişiye otomatik onay e-postası gönderilir. Ayrıca randevu tarihinden önce hatırlatma e-postası iletilir.' } },
      { '@type': 'Question', name: 'Randevuya gelemeyeceğim, ne yapmalıyım?', acceptedAnswer: { '@type': 'Answer', text: 'Hatırlatma e-postasındaki bilgilerle hekime en kısa sürede haber vermeniz yeterlidir. Erken bilgi vermeniz, o saatin başka bir hastaya açılmasını sağlar.' } },
      { '@type': 'Question', name: 'Hekimler randevu takvimini nasıl yönetir?', acceptedAnswer: { '@type': 'Answer', text: 'Hekimler panelden istedikleri gün ve saat dilimlerini tek dokunuşla randevuya kapatabilir (bloke) veya yeniden açabilir. Bloke edilen saatler hastalara gösterilmez.' } },
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '52px 0 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -70, top: -70, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'absolute', left: -50, bottom: -90, width: 240, height: 240, borderRadius: '50%', background: 'rgba(212,168,67,.06)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span><span style={{ color: 'white' }}>Randevu Sistemi</span>
          </nav>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '5px 13px', marginBottom: 16 }}>
            Doktor Randevu Sistemi
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(28px,4.4vw,42px)', fontWeight: 800, color: 'white', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: '-0.6px' }}>
            Hekim Randevu Sistemi
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.65, maxWidth: 660, margin: 0 }}>
            Randevular telefonla değil, doğrudan sistemden seçilir. Hem hekime hem hastaya anında e-posta gider,
            randevudan önce hatırlatma gönderilir; hekimler takvimlerini istedikleri gibi açıp kapatır.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, padding: '38px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Nasıl çalışır — 4 adımlı akış ── */}
        <section style={KART}>
          <h2 style={H2}>Nasıl çalışır?</h2>
          <p style={{ ...P, marginBottom: 24 }}>Randevu, ilk tıklamadan hatırlatmaya kadar dört adımda ilerler:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, position: 'relative' }}>
            {adimlar.map((a, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 16, background: `${STEP_COLORS[i]}12`, color: STEP_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {a.ic}
                  <span style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: STEP_COLORS[i], color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.2px' }}>{a.baslik}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{a.metin}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Çift taraflı e-posta bildirimi (grafik) ── */}
        <section style={KART}>
          <h2 style={H2}>Çift taraflı e-posta bildirimi</h2>
          <p style={P}>
            Bir randevu oluştuğunda kimse bilgi eksiği yaşamaz: <strong>aynı anda hem hekime hem de hastaya</strong> e-posta gider.
            Hekim gelen hastayı, hasta ise randevu detaylarını yazılı olarak elinde bulundurur.
          </p>
          {/* Grafik: Hasta ↔ Hekimhane ↔ Hekim */}
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 0, flexWrap: 'wrap', marginTop: 20 }}>
            {/* Hasta */}
            <div style={{ flex: '1 1 130px', minWidth: 130, textAlign: 'center', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 14, padding: '18px 12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Hasta</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Randevu onayı + hatırlatma</div>
            </div>
            {/* Bağlantı */}
            <div style={{ flex: '0 0 64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <svg width="56" height="24" viewBox="0 0 56 24" fill="none"><path d="M2 12h48" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 4" /><path d="m44 6 8 6-8 6" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="m12 6-8 6 8 6" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
            </div>
            {/* Hekimhane */}
            <div style={{ flex: '1 1 130px', minWidth: 130, textAlign: 'center', background: 'var(--navy)', borderRadius: 14, padding: '18px 12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Hekimhane</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 3 }}>Randevuyu iletir & maili gönderir</div>
            </div>
            {/* Bağlantı */}
            <div style={{ flex: '0 0 64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <svg width="56" height="24" viewBox="0 0 56 24" fill="none"><path d="M2 12h48" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 4" /><path d="m44 6 8 6-8 6" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="m12 6-8 6 8 6" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
            </div>
            {/* Hekim */}
            <div style={{ flex: '1 1 130px', minWidth: 130, textAlign: 'center', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 14, padding: '18px 12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}><path d="M12 2a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v3a7 7 0 0 0 14 0V8a2 2 0 0 0-2-2h-2V5a3 3 0 0 0-3-3Z" /><circle cx="12" cy="19" r="2" /></svg>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Hekim</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Yeni randevu bildirimi</div>
            </div>
          </div>
        </section>

        {/* ── Hatırlatma & iptal (zaman çizelgesi grafiği) ── */}
        <section style={KART}>
          <h2 style={H2}>Hatırlatma & “gelemeyecekseniz haber verin”</h2>
          <p style={P}>
            Unutulan randevular hem hekimin saatini boşa harcar hem başka bir hastanın sırasını kapatır. Bu yüzden randevu
            tarihinden <strong>önce otomatik hatırlatma e-postası</strong> gönderilir ve hastadan, gelemeyecekse haber vermesi rica edilir.
          </p>
          {/* Zaman çizelgesi */}
          <div style={{ position: 'relative', margin: '22px 0 4px', padding: '0 8px' }}>
            <div style={{ position: 'absolute', left: 20, right: 20, top: 15, height: 3, background: 'linear-gradient(90deg,#2563EB,#059669,#D4A843)', borderRadius: 3 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {[
                { t: 'Randevu oluşturuldu', d: 'Anında onay maili', c: '#2563EB' },
                { t: 'Randevudan önce', d: 'Hatırlatma maili', c: '#059669' },
                { t: 'Randevu günü', d: 'Hasta hekimde', c: '#D4A843' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.c, border: '3px solid white', boxShadow: '0 0 0 1px ' + s.c, margin: '9px auto 10px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hekim takvim kontrolü (takvim grafiği) ── */}
        <section style={KART}>
          <h2 style={H2}>Hekim, takvimini istediği gibi yönetir</h2>
          <p style={P}>
            Hekimler kendi panellerinden istedikleri <strong>gün ve saat dilimini tek dokunuşla randevuya kapatabilir</strong>
            {' '}(bloke) veya yeniden açabilir. İzin, ameliyat, dolu bir gün — bloke edilen saatler hastalara hiç gösterilmez.
          </p>
          {/* Takvim grafiği: açık / bloke / dolu saat dilimleri */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))', gap: 10, marginTop: 18 }}>
            {[
              { s: '09:00', st: 'acik' }, { s: '10:00', st: 'bloke' }, { s: '11:00', st: 'acik' },
              { s: '13:00', st: 'bloke' }, { s: '14:00', st: 'acik' }, { s: '15:00', st: 'acik' },
              { s: '16:00', st: 'acik' }, { s: '17:00', st: 'bloke' },
            ].map((slot, i) => {
              const map: Record<string, { bg: string; bd: string; fg: string; label: string }> = {
                acik: { bg: '#ECFDF5', bd: '#A7F3D0', fg: '#059669', label: 'Açık' },
                bloke: { bg: '#F3F4F6', bd: '#E5E7EB', fg: '#9CA3AF', label: 'Bloke' },
              };
              const m = map[slot.st];
              return (
                <div key={i} style={{ background: m.bg, border: `1px solid ${m.bd}`, borderRadius: 11, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', textDecoration: slot.st === 'bloke' ? 'line-through' : 'none', opacity: slot.st === 'bloke' ? 0.55 : 1 }}>{slot.s}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.3px', textTransform: 'uppercase', color: m.fg, marginTop: 3 }}>{m.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 16 }}>
            {[['#059669', 'Açık — randevuya uygun'], ['#9CA3AF', 'Bloke — hastalara gösterilmez']].map(([c, t], i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted)' }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: c as string }} />{t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Avantajlar ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ ...KART, background: 'linear-gradient(135deg,#EEF2FF,#F5F8FF)', border: '1px solid #C7D2FE' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', margin: '0 0 12px' }}>Hastalar için</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Telefonda beklemeden, 7/24 randevu', 'Yazılı onay ve hatırlatma e-postası', 'Uygun saatleri anında görme'].map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#3A3A3C', lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>{t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ ...KART, background: 'linear-gradient(135deg,#ECFDF5,#F0FDF4)', border: '1px solid #A7F3D0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#065F46', margin: '0 0 12px' }}>Hekimler için</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Takvimi tek dokunuşla aç/bloke et', 'Her randevu için anında bildirim', 'Daha az unutulan randevu, dolu program'].map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#065F46', lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>{t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ ...KART, background: 'var(--navy)', textAlign: 'center', padding: '34px 30px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>Randevu sistemini hemen kullanın</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', lineHeight: 1.6, margin: '0 0 22px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Bir hekim veya klinik arıyorsanız profilinden dakikalar içinde randevu alın. İşletme sahibiyseniz Hekimhane’ye
            ücretsiz katılıp randevu sistemini kullanmaya başlayın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/doktorlar" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: 'var(--navy)', fontSize: 14.5, fontWeight: 700, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}>
              Hekimlerden randevu al →
            </Link>
            <Link href="/katil" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', color: 'white', fontSize: 14.5, fontWeight: 700, borderRadius: 12, padding: '13px 24px', textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
              İşletmemi ekle
            </Link>
          </div>
        </section>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
          Sorularınız için <Link href="/iletisim" style={{ color: 'var(--navy)', fontWeight: 600 }}>iletişim</Link> sayfasından bize ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
