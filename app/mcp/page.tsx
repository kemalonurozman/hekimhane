import type { Metadata } from 'next';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import NoktaGrafik from '@/components/vitrin/NoktaGrafik';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzBalonlar, OzOnayKart, OzBant, OzAdimlar, OzKartlar, OzKapanis, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';
import { ARACLAR, ISTEMCI_BILGI, kurulumKodu, YER_TUTUCU, MCP_URL, type AracGrubu, type Istemci } from '@/lib/mcp/araclar';

// Hekimhane MCP — herkese açık rehber. Araç listesi ve kurulum kodları tek kaynaktan
// (lib/mcp/araclar.ts) okunur; burada yalnız görünüm var. Özellik sayfası dili (components/ozellik).

const URL_ = 'https://www.hekimhane.com.tr/mcp';

export const metadata: Metadata = {
  title: 'Hekimhane MCP — Kliniğinizi Yapay Zeka Asistanınızdan Yönetin',
  description: 'Randevu talepleri, takvim, yorumlar ve hasta e-postaları için Hekimhane MCP bağlantısı. Claude, Claude Code, Cursor ve MCP destekleyen araçlarla doğal dilde yönetim. Hekimhane-Pro\'ya dahil.',
  alternates: { canonical: URL_ },
  openGraph: { title: 'Hekimhane MCP Bağlantısı', description: 'Kliniğinizi yapay zeka asistanınızdan yönetin.', url: URL_, type: 'website' },
};

// ── Araç grupları ──
const GRUP_IKON: Record<AracGrubu, HkIkonAdi> = { Genel: 'clinic', Randevu: 'appointment', Takvim: 'open-now', Yorumlar: 'review', 'İletişim': 'message' };
const GRUP_RENK: Record<AracGrubu, string> = {
  Randevu: 'rgba(26,95,208,.4)', Takvim: 'rgba(13,124,121,.42)', Yorumlar: 'rgba(184,137,47,.48)', 'İletişim': 'rgba(26,95,208,.32)', Genel: 'rgba(13,124,121,.32)',
};
const GRUPLAR: AracGrubu[] = ['Randevu', 'Takvim', 'Yorumlar', 'İletişim', 'Genel'];

// ── Faydalar (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Tıklamak yerine söyleyin',
    metin: 'Menüler arasında gezmeden, tek cümleyle: listele, taşı, kapat, yanıtla. Uzun işlemler ve toplu değişiklikler dakikalar yerine saniyeler sürer.',
    gorsel: <MiniKomut />,
  },
  {
    baslik: 'Panelle aynı kurallar',
    metin: 'Asistan panelinizdeki kuralların dışına çıkamaz: yalnızca onaylı işletmeleriniz, dolu ve kapalı saat kontrolleri, Pro kilitleri, hastaya otomatik bilgilendirmeler aynen geçerlidir.',
    gorsel: <MiniKurallar />,
  },
  {
    baslik: 'Kontrol sizde',
    metin: 'Kişisel anahtarla bağlanırsınız ve istediğiniz an iptal edersiniz. Veri değiştiren her işlemden önce asistan onayınızı ister.',
    gorsel: <MiniAnahtar />,
  },
];

const ADIMLAR = [
  { baslik: 'Pro üyeliğiniz olsun', metin: 'MCP bağlantısı Hekimhane-Pro\'ya dahildir. Hesabınızda en az bir Pro işletme yeterlidir.' },
  { baslik: 'Anahtarınızı oluşturun', metin: 'Panel → Hesap → MCP Bağlantısı. Anahtar yalnızca bir kez gösterilir; en fazla 5 anahtar oluşturabilirsiniz.' },
  { baslik: 'Asistanınıza ekleyin', metin: 'Paneldeki hazır kodu asistanınızın ayarına yapıştırın. Anahtar koda otomatik yerleşir. "İşletmelerimi göster" diyerek deneyin.' },
];

const NEREDE: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'message', baslik: 'Claude (web, masaüstü, mobil)', metin: 'Gün içinde sohbet eder gibi çalışın: "Bugün kaç randevum var, ilk boşluğum ne zaman?" Masaüstü uygulamasına yapılandırma dosyasıyla, web sürümüne özel bağlayıcı adresiyle eklenir.' },
  { ikon: 'settings', baslik: 'Claude Code', metin: 'Tek komutla eklenir. Toplu işler için idealdir: haftalık randevu raporu çıkarmak, geçmiş talepleri tabloya dökmek veya tatil günlerini topluca kapatmak gibi.' },
  { ikon: 'appointment', baslik: 'Cursor ve MCP destekli editörler', metin: 'Kliniğinizin web sitesini geliştirirken takvim ve talep verisini doğrudan editörden görün; sitenize gömdüğünüz rezervasyon modülünü gerçek doluluğa göre test edin.' },
  { ikon: 'notification', baslik: 'Otomasyon araçları', metin: 'MCP istemci düğümü olan otomasyon platformlarında zamanlanmış akışlar kurun: her sabah 08:00\'de günün randevu özetini e-postanıza ya da ekip sohbetinize gönderin.' },
];

const SENARYO = [
  { zaman: 'Sabah', cumle: 'Bugünkü randevularımı saat sırasıyla, telefon numaralarıyla listele. Yeni gelen talep var mı?' },
  { zaman: 'Telefon geldiğinde', cumle: 'Perşembe 15:00 boş mu? Boşsa Selin Kaya için 2 saatlik kanal tedavisi randevusu ekle, telefonu 0532 000 00 00.' },
  { zaman: 'Plan değişince', cumle: 'Cuma 14:00\'teki Ahmet Bey\'in randevusunu pazartesi aynı saate taşı. Hasta bilgilendirilsin.' },
  { zaman: 'İzin / kongre', cumle: '20–22 Ekim arasını online randevuya tamamen kapat.' },
  { zaman: 'Haftada bir', cumle: 'Yanıtlanmamış yorumları getir, her birine kısa ve nazik bir yanıt taslağı yaz. Onayladıklarımı yayınla.' },
  { zaman: 'Hatırlatma', cumle: 'Yarın randevusu olan ve e-posta bırakan hastalara saatlerini hatırlatan kibar bir e-posta gönder.' },
];

const GUVENLIK: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'user-account', baslik: 'Anahtarınız size özeldir', metin: 'Yalnızca oluşturulduğu an bir kez gösterilir. Biz yalnızca şifrelenmiş özetini saklarız, açık halini kimse göremez.' },
  { ikon: 'closed', baslik: 'Anında iptal', metin: 'Panelden iptal ettiğiniz anahtarla gelen istekler hemen reddedilir. Anahtar başına dakikada 120 istek sınırı vardır.' },
  { ikon: 'clinic', baslik: 'Yalnızca onaylı işletmeleriniz', metin: 'Başka işletmelerin verisine, hesap veya ödeme bilgilerinize erişilemez. Çakışma kontrolü, Pro kilitleri ve hastaya giden bilgilendirmeler panelde nasılsa MCP\'de de öyledir.' },
  { ikon: 'health-info', baslik: 'Hasta verisi ve KVKK', metin: 'Asistanınız bir sonucu okuduğunda veri o asistanın sağlayıcısına iletilir. Kurumsal veya veri işleme sözleşmeli plan kullanın, gereksiz hasta verisi sorgulamaktan kaçının.' },
];

const SSS = [
  { s: 'Ücretli mi?', c: 'MCP bağlantısı Hekimhane-Pro üyeliğine dahildir, ek ücret yoktur. Asistanınızın kendi aboneliği (ör. Claude) ayrıca kendi sağlayıcısına tabidir.' },
  { s: 'Asistan benden habersiz randevu iptal eder mi?', c: 'Veri değiştiren veya e-posta gönderen araçlar "işlem" olarak işaretlidir. Sunucumuz asistana bunlardan önce onayınızı almasını söyler. Claude gibi istemciler bu araçları çalıştırmadan önce size sorar. Otomatik onay ayarlarını açmamanızı öneririz.' },
  { s: 'Anahtarım başkasının eline geçerse?', c: 'Panel → MCP Bağlantısı\'ndan anahtarı hemen iptal edin; o anahtarla gelen istekler anında reddedilir. Anahtar yalnızca sizin onaylı işletmelerinize erişir, hesap veya ödeme bilgilerinize erişmez.' },
  { s: 'Kapalı veya dolu saate randevu ekletebilir miyim?', c: 'Hayır. Panelle aynı kurallar geçerlidir: çalışma saati dışı, kapatılmış veya dolu saatler reddedilir ve asistan uygun saatleri görür.' },
  { s: 'Ücretsiz işletmelerim de görünür mü?', c: 'Hesabınızda en az bir Pro işletme varsa tüm onaylı işletmelerinizin talep ve yorumlarını yönetebilirsiniz. Gün veya saat kapatma yalnızca Pro işletmelerde çalışır, panelde olduğu gibi.' },
  { s: 'Hasta verileri nereye gidiyor?', c: 'Asistanınız bir aracı çalıştırdığında sonuç (ör. hasta adı ve telefonu) o asistanın sağlayıcısına iletilir. Kişisel sağlık verisi işlediğiniz için kurumsal veya veri işleme sözleşmeli bir plan kullanmanızı ve yalnızca gerekli sorguları yapmanızı öneririz.' },
];

const KOD_SATIR: React.CSSProperties = { background: '#EEF3FA', padding: '2px 8px', borderRadius: 6, color: '#12294D', fontSize: '.88em', wordBreak: 'break-all' };

export default function McpPage() {
  const istemciler = Object.keys(ISTEMCI_BILGI) as Istemci[];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Hekimhane MCP — Kliniğinizi Yapay Zeka Asistanınızdan Yönetin',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Pro"
        urun="Hekimhane | MCP · Yapay zekâ ile yönetim"
        baslik={['Kliniğinizi', 'yapay zekâ asistanınızdan yönetin']}
        govde="Randevu talepleri, takvim, hasta yorumları ve hasta e-postaları artık konuşarak yönetilebilir. Hekimhane'nin MCP bağlantısını Claude gibi bir asistana ekleyin, panelde tıklayarak yaptığınız işleri tek cümleyle yaptırın."
        birincil={{ ad: 'Panelde anahtar oluştur', href: '/panel' }}
        ikincil={{ ad: 'Hekimhane-Pro', href: '/pro' }}
        sahne={<Sahne />}
      />

      <OzBant
        baslik="MCP nedir, size ne kazandırır?"
        alt="MCP (Model Context Protocol), yapay zeka asistanlarının uygulamalara güvenli ve kontrollü şekilde bağlanması için geliştirilmiş açık bir standarttır. Hekimhane bu standardı destekler: asistanınız paneldeki verilerinizi okuyabilir ve sizin onayınızla işlem yapabilir."
        kartlar={FAYDALAR}
        cta={{ ad: 'Panelde anahtar oluştur', href: '/panel' }}
      />

      <OzAdimlar id="nasil" baslik="Üç adımda bağlanın" adimlar={ADIMLAR} />

      {/* ── ARAÇLAR (tek kaynak: lib/mcp/araclar.ts) ── */}
      <section className="vt-zemin vt-bolum">
        <div className="container">
          <p className="vt-ustyazi">Araçlar</p>
          <h2 className="vt-h2">Asistanınızın yapabildikleri</h2>
          <p className="vt-govde">
            {ARACLAR.length} araç. <strong style={{ color: '#8A6A1F' }}>İşlem</strong> etiketli araçlar veri değiştirir veya e-posta gönderir, bu yüzden onayınız istenir.
          </p>
          <div className="vt-izgara oz-kanal-izgara">
            {GRUPLAR.map(g => {
              const liste = ARACLAR.filter(a => a.grup === g);
              return (
                <article key={g} className="vt-oz">
                  <NoktaGrafik ikon={GRUP_IKON[g]} size={200} renk={GRUP_RENK[g]} />
                  <span className="vt-oz__etiket">{liste.length} araç</span>
                  <h3 className="vt-oz__ad">{g}</h3>
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {liste.map((a, i) => (
                      <div key={a.name} style={{ padding: '14px 0', borderTop: i === 0 ? 0 : '1px solid #EDEFF2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 15.5, color: '#0E1A2C', letterSpacing: '-.01em' }}>{a.title}</strong>
                          {a.yazma
                            ? <span className="vt-pro">İşlem</span>
                            : <span className="vt-pro" style={{ background: '#EEF3FA', boxShadow: 'inset 0 0 0 1px #DCE3EE', color: '#12294D' }}>Okuma</span>}
                        </div>
                        <p style={{ margin: '6px 0 6px', fontSize: 14, lineHeight: 1.5, color: '#3C4A61' }}>{a.description.split('. ')[0]}.</p>
                        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#586273', fontStyle: 'italic' }}>&quot;{a.ornek}&quot;</p>
                        <code style={{ display: 'inline-block', marginTop: 6, fontSize: 11.5, color: '#8A93A3' }}>{a.name}</code>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <OzKartlar
        zemin="beyaz"
        ustyazi="Desteklenen asistanlar"
        baslik="Nerelerde kullanabilirsiniz?"
        govde="MCP açık bir standart olduğu için aynı bağlantı birçok asistanda ve araçta çalışır."
        ogeler={NEREDE}
      />

      {/* ── GÜNLÜK KULLANIM ── */}
      <section className="vt-zemin vt-bolum">
        <div className="container">
          <p className="vt-ustyazi">Örnek cümleler</p>
          <h2 className="vt-h2">Günlük kullanımdan örnekler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, marginTop: 44 }}>
            {SENARYO.map(x => (
              <div key={x.cumle} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: '22px 22px 24px', borderRadius: 22, background: '#fff', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
                <span className="oz-etiket">{x.zaman}</span>
                <p style={{ margin: 0, padding: '12px 15px', borderRadius: '16px 16px 4px 16px', background: '#DEC283', color: '#12294D', fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>
                  {x.cumle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KURULUM ── */}
      <section id="kurulum" className="vt-bolum" style={{ background: '#fff', scrollMarginTop: 64 }}>
        <div className="container">
          <p className="vt-ustyazi">Kurulum</p>
          <h2 className="vt-h2">Asistanınıza ekleyin</h2>
          <p className="vt-govde" style={{ maxWidth: 780 }}>
            Sunucu adresi: <code style={KOD_SATIR}>{MCP_URL}</code>. Kimlik doğrulama için{' '}
            <code style={KOD_SATIR}>Authorization: Bearer</code> başlığı kullanılır.
            Paneldeki MCP Bağlantısı sekmesi bu kodları anahtarınız yerleşik olarak hazırlar. Aşağıda{' '}
            <code style={KOD_SATIR}>{YER_TUTUCU}</code> yazan yere anahtarınızı koyun.
          </p>
          <div className="oz-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            {istemciler.map((k, i) => (
              <div key={k} style={{ minWidth: 0, paddingTop: i === 0 ? 0 : 26, paddingBottom: i === istemciler.length - 1 ? 0 : 26, borderTop: i === 0 ? 0 : '1px solid #EDEFF2' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', color: '#0E1A2C' }}>{ISTEMCI_BILGI[k].ad}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.55, color: '#3C4A61' }}>{ISTEMCI_BILGI[k].nereye}</p>
                <pre style={{ margin: 0, maxWidth: '100%', padding: '14px 16px', borderRadius: 14, background: '#0E1A2C', color: '#E2E8F0', fontSize: 12.5, lineHeight: 1.6, overflowX: 'auto' }}>{kurulumKodu(k, YER_TUTUCU)}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OzKartlar
        ustyazi="Güvenlik ve gizlilik"
        baslik="Anahtar sizde, kurallar panelde"
        govde="MCP bağlantısı panelinizin yetki kurallarıyla çalışır; erişimi siz verir, siz kaldırırsınız."
        ogeler={GUVENLIK}
      />

      <OzKapanis
        baslik="Panele gidin ve bağlanın"
        metin="Anahtarınızı Panel → Hesap → MCP Bağlantısı'ndan oluşturun; asistanınıza özel hazır kod orada sizi bekliyor."
        birincil={{ ad: 'Panele git ve bağlan', href: '/panel' }}
        ikincil={{ ad: 'Kurulum adımları', href: '#kurulum' }}
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara yok ═══════════════════ */

function Sahne() {
  return (
    <OzSahne ikon="message">
      <OzSahneBaslik ikon="message" baslik="Yapay zekâ asistanı" alt="Hekimhane MCP bağlı" durum="Bağlı" />
      <OzBalonlar balonlar={[
        { kim: 'kisi', metin: 'Perşembe öğleden sonra boşluğum var mı? Varsa 15:00’e Selin K. için 2 saatlik randevu ekle.' },
        { kim: 'asistan', metin: 'Perşembe 14:00–17:00 arası boş. Selin K. için 15:00–17:00 randevusunu ekleyeyim mi?' },
        { kim: 'kisi', metin: 'Evet, ekle.' },
      ]} />
      <div className="vt-h-belir" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 6, animationDelay: '2.8s' }}>
        {['takvim_durumu · Perşembe', 'randevu_ekle · 15:00–17:00'].map(t => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: '#F7F0DE', boxShadow: 'inset 0 0 0 1px #EAD9AE', color: '#8A6A1F', fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <svg width="11" height="11" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke="#8A6A1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t}
          </span>
        ))}
      </div>
      <OzOnayKart ust="Randevu eklendi" baslik="Perşembe · 15:00–17:00" alt="Selin K. · 2 slot, takvimde dolu" gecikme={3.6} />
    </OzSahne>
  );
}

function MiniKomut() {
  return (
    <div className="oz-mb">
      <span className="oz-mb__hasta">Bugün kaç randevum var, ilk boşluğum ne zaman?</span>
      <span className="oz-mb__asistan">Bugün 6 randevunuz var. İlk boşluk 11:30.</span>
    </div>
  );
}

function MiniKurallar() {
  // a = dolu, k = kapalı (taralı), s = asistanın bulduğu uygun saat
  const s = ['a', '', 'k', 'a', '', 'a', 's', 'k', 'a', '', 'k', 'a'];
  return (
    <div className="oz-mt">
      {s.map((x, i) => (
        <span
          key={i}
          className={x === 'a' ? 'is-dolu' : x === 's' ? 'is-yeni' : ''}
          style={x === 'k' ? { background: 'repeating-linear-gradient(135deg, #F1F3F7 0 5px, #E2E6EE 5px 10px)', boxShadow: 'none' } : undefined}
        >
          {x === 's' ? '15:00' : ''}
        </span>
      ))}
    </div>
  );
}

function MiniAnahtar() {
  const satirlar = [{ ad: 'Claude Masaüstü', k: 'hkm_••••3f2a' }, { ad: 'Claude Code', k: 'hkm_••••91c7' }];
  return (
    <div className="oz-mo" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: '#0E1A2C' }}>
        <HkIcon name="user-account" size={16} color="#12294D" />MCP anahtarları
      </div>
      {satirlar.map(r => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 9, background: '#F5F7FA' }}>
          <span style={{ minWidth: 0, flex: 1 }}>
            <b style={{ display: 'block', fontSize: 11.5, color: '#0E1A2C' }}>{r.ad}</b>
            <code style={{ fontSize: 10.5, color: '#586273' }}>{r.k}</code>
          </span>
          <span style={{ padding: '3px 8px', borderRadius: 999, background: '#FDECEA', color: '#B42318', fontSize: 10.5, fontWeight: 800 }}>İptal et</span>
        </div>
      ))}
    </div>
  );
}
