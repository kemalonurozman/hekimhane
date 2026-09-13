import type { Metadata } from 'next';
import Link from 'next/link';
import { ARACLAR, ISTEMCI_BILGI, kurulumKodu, YER_TUTUCU, MCP_URL, type AracGrubu, type Istemci } from '@/lib/mcp/araclar';

export const metadata: Metadata = {
  title: 'Hekimhane MCP — Kliniğinizi Yapay Zeka Asistanınızdan Yönetin',
  description: 'Randevu talepleri, takvim, yorumlar ve hasta e-postaları için Hekimhane MCP bağlantısı. Claude, Claude Code, Cursor ve MCP destekleyen araçlarla doğal dilde yönetim. Hekimhane-Pro\'ya dahil.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/mcp' },
  openGraph: { title: 'Hekimhane MCP Bağlantısı', description: 'Kliniğinizi yapay zeka asistanınızdan yönetin.', url: 'https://www.hekimhane.com.tr/mcp', type: 'website' },
};

const NAVY = '#1B3A69', GOLD = '#D4A843', MUTED = '#6E6E73', BORDER = '#E5E5EA', TEXT = '#1D1D1F';

function Ikon({ d, size = 22, color = NAVY }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('|').map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const IKON = {
  sohbet: 'M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.4 8.4 0 0 1 8.5 8.5z',
  anahtar: 'M21 2l-2 2|M15.5 7.5l3 3L22 7l-3-3|M7.5 21a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z|M10.7 13.3L19 5',
  kalkan: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  takvim: 'M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  yildiz: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z',
  mektup: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|M22 6l-10 7L2 6',
  liste: 'M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01',
  kod: 'M16 18l6-6-6-6|M8 6l-6 6 6 6',
  terminal: 'M4 17l6-6-6-6|M12 19h8',
  bilgisayar: 'M3 4h18v12H3z|M8 20h8|M12 16v4',
  simsek: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

const GRUP_IKON: Record<AracGrubu, string> = { Genel: IKON.liste, Randevu: IKON.sohbet, Takvim: IKON.takvim, Yorumlar: IKON.yildiz, 'İletişim': IKON.mektup };
const GRUPLAR: AracGrubu[] = ['Randevu', 'Takvim', 'Yorumlar', 'İletişim', 'Genel'];

const NEREDE = [
  { ikon: IKON.sohbet, baslik: 'Claude (web, masaüstü, mobil)', metin: 'Gün içinde sohbet eder gibi çalışın: "Bugün kaç randevum var, ilk boşluğum ne zaman?" Masaüstü uygulamasına yapılandırma dosyasıyla, web sürümüne özel bağlayıcı adresiyle eklenir.' },
  { ikon: IKON.terminal, baslik: 'Claude Code', metin: 'Tek komutla eklenir. Toplu işler için idealdir: haftalık randevu raporu çıkarmak, geçmiş talepleri tabloya dökmek veya tatil günlerini topluca kapatmak gibi.' },
  { ikon: IKON.bilgisayar, baslik: 'Cursor ve MCP destekli editörler', metin: 'Kliniğinizin web sitesini geliştirirken takvim ve talep verisini doğrudan editörden görün; sitenize gömdüğünüz rezervasyon modülünü gerçek doluluğa göre test edin.' },
  { ikon: IKON.simsek, baslik: 'Otomasyon araçları', metin: 'MCP istemci düğümü olan otomasyon platformlarında zamanlanmış akışlar kurun: her sabah 08:00\'de günün randevu özetini e-postanıza ya da ekip sohbetinize gönderin.' },
];

const SENARYO = [
  { zaman: 'Sabah', cumle: 'Bugünkü randevularımı saat sırasıyla, telefon numaralarıyla listele. Yeni gelen talep var mı?' },
  { zaman: 'Telefon geldiğinde', cumle: 'Perşembe 15:00 boş mu? Boşsa Selin Kaya için 2 saatlik kanal tedavisi randevusu ekle, telefonu 0532 000 00 00.' },
  { zaman: 'Plan değişince', cumle: 'Cuma 14:00\'teki Ahmet Bey\'in randevusunu pazartesi aynı saate taşı. Hasta bilgilendirilsin.' },
  { zaman: 'İzin / kongre', cumle: '20–22 Ekim arasını online randevuya tamamen kapat.' },
  { zaman: 'Haftada bir', cumle: 'Yanıtlanmamış yorumları getir, her birine kısa ve nazik bir yanıt taslağı yaz. Onayladıklarımı yayınla.' },
  { zaman: 'Hatırlatma', cumle: 'Yarın randevusu olan ve e-posta bırakan hastalara saatlerini hatırlatan kibar bir e-posta gönder.' },
];

const SSS = [
  { s: 'Ücretli mi?', c: 'MCP bağlantısı Hekimhane-Pro üyeliğine dahildir, ek ücret yoktur. Asistanınızın kendi aboneliği (ör. Claude) ayrıca kendi sağlayıcısına tabidir.' },
  { s: 'Asistan benden habersiz randevu iptal eder mi?', c: 'Veri değiştiren veya e-posta gönderen araçlar "işlem" olarak işaretlidir. Sunucumuz asistana bunlardan önce onayınızı almasını söyler. Claude gibi istemciler bu araçları çalıştırmadan önce size sorar. Otomatik onay ayarlarını açmamanızı öneririz.' },
  { s: 'Anahtarım başkasının eline geçerse?', c: 'Panel → MCP Bağlantısı\'ndan anahtarı hemen iptal edin; o anahtarla gelen istekler anında reddedilir. Anahtar yalnızca sizin onaylı işletmelerinize erişir, hesap veya ödeme bilgilerinize erişmez.' },
  { s: 'Kapalı veya dolu saate randevu ekletebilir miyim?', c: 'Hayır. Panelle aynı kurallar geçerlidir: çalışma saati dışı, kapatılmış veya dolu saatler reddedilir ve asistan uygun saatleri görür.' },
  { s: 'Ücretsiz işletmelerim de görünür mü?', c: 'Hesabınızda en az bir Pro işletme varsa tüm onaylı işletmelerinizin talep ve yorumlarını yönetebilirsiniz. Gün veya saat kapatma yalnızca Pro işletmelerde çalışır, panelde olduğu gibi.' },
  { s: 'Hasta verileri nereye gidiyor?', c: 'Asistanınız bir aracı çalıştırdığında sonuç (ör. hasta adı ve telefonu) o asistanın sağlayıcısına iletilir. Kişisel sağlık verisi işlediğiniz için kurumsal veya veri işleme sözleşmeli bir plan kullanmanızı ve yalnızca gerekli sorguları yapmanızı öneririz.' },
];

export default function McpPage() {
  const istemciler = Object.keys(ISTEMCI_BILGI) as Istemci[];
  return (
    <main style={{ background: 'var(--ivory, #FBF8F2)', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg, #071A2E 0%, #0E2D55 45%, ${NAVY} 100%)`, padding: '120px 24px 72px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 44, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.4)', color: GOLD, fontSize: 11.5, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 22 }}>
              Hekimhane-Pro · MCP
            </span>
            <h1 style={{ color: 'white', fontSize: 'clamp(30px, 4.6vw, 42px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.15, margin: '0 0 16px' }}>
              Kliniğinizi yapay zeka asistanınızdan yönetin
            </h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16.5, lineHeight: 1.65, margin: '0 0 28px' }}>
              Randevu talepleri, takvim, hasta yorumları ve hasta e-postaları artık konuşarak yönetilebilir.
              Hekimhane&apos;nin MCP bağlantısını Claude gibi bir asistana ekleyin, panelde tıklayarak yaptığınız işleri tek cümleyle yaptırın.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/panel" style={{ padding: '13px 24px', borderRadius: 12, background: `linear-gradient(135deg, ${GOLD}, #BE8F2C)`, color: 'white', fontSize: 14.5, fontWeight: 800, textDecoration: 'none', boxShadow: '0 6px 20px rgba(212,168,67,.35)' }}>Panelde anahtar oluştur</Link>
              <Link href="/pro" style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,.3)', color: 'white', fontSize: 14.5, fontWeight: 700, textDecoration: 'none' }}>Hekimhane-Pro</Link>
            </div>
          </div>

          {/* Örnek sohbet maketi */}
          <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <div style={{ maxWidth: '85%', background: 'white', color: TEXT, padding: '11px 14px', borderRadius: '14px 14px 4px 14px', fontSize: 13.5, lineHeight: 1.5 }}>
                Perşembe öğleden sonra boşluğum var mı? Varsa 15:00&apos;e Selin Kaya için 2 saatlik randevu ekle.
              </div>
            </div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {['takvim_durumu · Perşembe', 'randevu_ekle · 15:00–17:00'].map(t => (
                <div key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, width: 'fit-content', padding: '5px 10px', borderRadius: 8, background: 'rgba(212,168,67,.14)', border: '1px solid rgba(212,168,67,.3)', color: GOLD, fontSize: 11.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <svg width="11" height="11" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ maxWidth: '90%', background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.92)', padding: '11px 14px', borderRadius: '14px 14px 14px 4px', fontSize: 13.5, lineHeight: 1.55 }}>
              Perşembe 14:00–17:00 arası boştu. <strong>Selin Kaya</strong> için 15:00–17:00 randevusunu iki slot olarak ekledim. Takviminizde ve web sitenizdeki rezervasyon modülünde bu saatler artık dolu görünüyor.
            </div>
          </div>
        </div>
      </section>

      {/* MCP NEDİR */}
      <section style={{ padding: '72px 24px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: TEXT, letterSpacing: '-0.9px', margin: '0 0 10px' }}>MCP nedir, size ne kazandırır?</h2>
          <p style={{ color: MUTED, fontSize: 15.5, margin: '0 auto', maxWidth: 680, lineHeight: 1.65 }}>
            MCP (Model Context Protocol), yapay zeka asistanlarının uygulamalara güvenli ve kontrollü şekilde bağlanması için geliştirilmiş açık bir standarttır.
            Hekimhane bu standardı destekler. Asistanınız paneldeki verilerinizi okuyabilir ve sizin onayınızla işlem yapabilir.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { ikon: IKON.sohbet, b: 'Tıklamak yerine söyleyin', m: 'Menüler arasında gezmeden, tek cümleyle: listele, taşı, kapat, yanıtla. Uzun işlemler ve toplu değişiklikler dakikalar yerine saniyeler sürer.' },
            { ikon: IKON.kalkan, b: 'Panelle aynı kurallar', m: 'Asistan panelinizdeki kuralların dışına çıkamaz: yalnızca onaylı işletmeleriniz, dolu ve kapalı saat kontrolleri, Pro kilitleri, hastaya otomatik bilgilendirmeler aynen geçerlidir.' },
            { ikon: IKON.anahtar, b: 'Kontrol sizde', m: 'Kişisel anahtarla bağlanırsınız ve istediğiniz an iptal edersiniz. Veri değiştiren her işlemden önce asistan onayınızı ister.' },
          ].map(x => (
            <div key={x.b} style={{ background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: '24px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(140deg, ${NAVY}, #0F2A55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Ikon d={x.ikon} size={20} color="white" /></div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.3px' }}>{x.b}</h3>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{x.m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 ADIM */}
      <section style={{ padding: '48px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: '-0.7px', margin: '0 0 28px' }}>Üç adımda bağlanın</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: 1, b: 'Pro üyeliğiniz olsun', m: 'MCP bağlantısı Hekimhane-Pro\'ya dahildir. Hesabınızda en az bir Pro işletme yeterlidir.' },
            { n: 2, b: 'Anahtarınızı oluşturun', m: 'Panel → Hesap → MCP Bağlantısı. Anahtar yalnızca bir kez gösterilir; en fazla 5 anahtar oluşturabilirsiniz.' },
            { n: 3, b: 'Asistanınıza ekleyin', m: 'Paneldeki hazır kodu asistanınızın ayarına yapıştırın. Anahtar koda otomatik yerleşir. "İşletmelerimi göster" diyerek deneyin.' },
          ].map(x => (
            <div key={x.n} style={{ textAlign: 'center', padding: '8px 12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: NAVY, color: 'white', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{x.n}</div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>{x.b}</h3>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{x.m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ARAÇLAR */}
      <section style={{ padding: '48px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.8px', margin: '0 0 8px' }}>Asistanınızın yapabildikleri</h2>
          <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>
            {ARACLAR.length} araç. <strong style={{ color: '#9A742A' }}>İşlem</strong> etiketli araçlar veri değiştirir veya e-posta gönderir, bu yüzden onayınız istenir.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {GRUPLAR.map(g => (
            <div key={g} style={{ background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ikon d={GRUP_IKON[g]} size={17} /></div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>{g}</h3>
              </div>
              {ARACLAR.filter(a => a.grup === g).map(a => (
                <div key={a.name} style={{ padding: '11px 0', borderTop: '1px solid #F1F1F4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{a.title}</span>
                    <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '.4px', textTransform: 'uppercase', background: a.yazma ? '#FDF6E3' : '#EEF4FF', color: a.yazma ? '#9A742A' : NAVY }}>{a.yazma ? 'İşlem' : 'Okuma'}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, margin: '4px 0 5px' }}>{a.description.split('. ')[0]}.</p>
                  <div style={{ fontSize: 12.5, color: '#475569', fontStyle: 'italic' }}>&quot;{a.ornek}&quot;</div>
                  <code style={{ fontSize: 10.5, color: '#94A3B8' }}>{a.name}</code>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* NEREDE */}
      <section style={{ padding: '48px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.8px', margin: '0 0 28px' }}>Nerelerde kullanabilirsiniz?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {NEREDE.map(x => (
            <div key={x.baslik} style={{ background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <Ikon d={x.ikon} size={24} />
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: TEXT, margin: '12px 0 6px' }}>{x.baslik}</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>{x.metin}</p>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: '-0.4px', margin: '44px 0 16px' }}>Günlük kullanımdan örnekler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {SENARYO.map(x => (
            <div key={x.cumle} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'white', borderRadius: 14, border: `1px solid ${BORDER}`, padding: '14px 16px' }}>
              <span style={{ flexShrink: 0, padding: '3px 9px', borderRadius: 999, background: '#EEF3FA', color: NAVY, fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 1 }}>{x.zaman}</span>
              <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.55 }}>&quot;{x.cumle}&quot;</span>
            </div>
          ))}
        </div>
      </section>

      {/* KURULUM */}
      <section style={{ padding: '48px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.8px', margin: '0 0 8px' }}>Kurulum</h2>
        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 22px', maxWidth: 760 }}>
          Sunucu adresi: <code style={{ background: '#EEF3FA', padding: '2px 7px', borderRadius: 6, color: NAVY }}>{MCP_URL}</code>. Kimlik doğrulama için
          <code style={{ background: '#EEF3FA', padding: '2px 7px', borderRadius: 6, color: NAVY, margin: '0 4px' }}>Authorization: Bearer</code> başlığı kullanılır.
          Paneldeki MCP Bağlantısı sekmesi bu kodları anahtarınız yerleşik olarak hazırlar. Aşağıda <code>{YER_TUTUCU}</code> yazan yere anahtarınızı koyun.
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          {istemciler.map(k => (
            <div key={k} style={{ background: 'white', borderRadius: 16, border: `1px solid ${BORDER}`, padding: '18px 20px' }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: TEXT, margin: '0 0 4px' }}>{ISTEMCI_BILGI[k].ad}</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 10px' }}>{ISTEMCI_BILGI[k].nereye}</p>
              <pre style={{ margin: 0, padding: '13px 15px', borderRadius: 11, background: '#0F172A', color: '#E2E8F0', fontSize: 12, lineHeight: 1.6, overflowX: 'auto' }}>{kurulumKodu(k, YER_TUTUCU)}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* GÜVENLİK */}
      <section style={{ padding: '48px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${BORDER}`, padding: '28px 30px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Ikon d={IKON.kalkan} size={24} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', margin: 0 }}>Güvenlik ve gizlilik</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
            <li><strong>Anahtarınız size özeldir.</strong> Yalnızca oluşturulduğu an bir kez gösterilir. Biz yalnızca şifrelenmiş özetini saklarız, açık halini kimse göremez.</li>
            <li><strong>Erişim yalnızca onaylı işletmelerinizle sınırlıdır.</strong> Başka işletmelerin verisine, hesap veya ödeme bilgilerinize erişilemez.</li>
            <li><strong>Panelle aynı yetki kuralları geçerlidir.</strong> Çakışma kontrolü, Pro kilitleri ve hastaya giden bilgilendirmeler panelde nasılsa MCP&apos;de de öyledir.</li>
            <li><strong>Anında iptal.</strong> Panelden iptal ettiğiniz anahtarla gelen istekler hemen reddedilir. Anahtar başına dakikada 120 istek sınırı vardır.</li>
            <li><strong>Hasta verisi ve KVKK.</strong> Asistanınız bir sonucu okuduğunda veri o asistanın sağlayıcısına iletilir. Kurumsal veya veri işleme sözleşmeli plan kullanın, gereksiz hasta verisi sorgulamaktan kaçının.</li>
          </ul>
        </div>
      </section>

      {/* SSS */}
      <section style={{ padding: '48px 24px 90px', maxWidth: 820, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.8px', margin: '0 0 24px' }}>Sık sorulan sorular</h2>
        {SSS.map(x => (
          <details key={x.s} style={{ background: 'white', borderRadius: 14, border: `1px solid ${BORDER}`, padding: '15px 18px', marginBottom: 10 }}>
            <summary style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>{x.s}</summary>
            <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, margin: '10px 0 0' }}>{x.c}</p>
          </details>
        ))}
        <div style={{ textAlign: 'center', marginTop: 34 }}>
          <Link href="/panel" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 12, background: NAVY, color: 'white', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>Panele git ve bağlan</Link>
        </div>
      </section>
    </main>
  );
}
