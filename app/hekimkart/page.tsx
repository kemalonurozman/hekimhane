import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HekimKart — Dijital Kartvizit',
  description:
    'HekimKart, diş hekimleri için ücretsiz dijital kartvizit. Online randevu, telefon, Instagram, LinkedIn, Facebook, web sitesi ve konum — hepsi tek linkte ve QR kodda. Her özelliğin ne işe yaradığını keşfedin.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/hekimkart' },
  openGraph: {
    title: 'HekimKart — Dijital Kartvizit',
    description: 'Tüm iletişim kanalların tek linkte. Neden özel bir kart olduğunu keşfet.',
    url: 'https://www.hekimhane.com.tr/hekimkart',
    type: 'website',
  },
};

/* ── İkonlar (inline SVG) ─────────────────────────────────────── */
const Phone = ({ c = 'white', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" /></svg>
);
const Ig = ({ c = 'white', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const In = ({ c = 'white', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const Fb = ({ c = 'white', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const Globe = ({ c = '#5B21B6', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const Cal = ({ c = 'white', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
const Pin = ({ c = '#EA4335', s = 17 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const Qr = ({ c = '#1B3A69', s = 22 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM21 14v7M17 21h4M17 17h.01" /></svg>
);
const Shield = ({ c = '#059669', s = 22 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
);
const Link2 = ({ c = '#1B3A69', s = 22 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
const Star = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="#D4A843"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
);
const Check = ({ c = 'white', s = 12 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

/* ── Profil avatarı — self-contained illüstrasyon (hekim örnek) ── */
function AvatarIllustration() {
  return (
    <svg width="92" height="92" viewBox="0 0 100 100" style={{ borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,.32)' }}>
      <defs>
        <clipPath id="hkAvatar"><circle cx="50" cy="50" r="50" /></clipPath>
        <linearGradient id="hkBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE7F5" /><stop offset="1" stopColor="#B9CDE8" />
        </linearGradient>
        <linearGradient id="hkCoat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EEF2F7" />
        </linearGradient>
      </defs>
      <g clipPath="url(#hkAvatar)">
        <rect width="100" height="100" fill="url(#hkBg)" />
        {/* Beyaz önlük / omuzlar */}
        <path d="M20 100 C20 78 34 70 50 70 C66 70 80 78 80 100 Z" fill="url(#hkCoat)" />
        <path d="M50 70 L44 100 M50 70 L56 100" stroke="#D9E0E9" strokeWidth="1.5" fill="none" />
        {/* Yaka + lacivert vurgu */}
        <path d="M42 72 L50 84 L44 92 Z" fill="#EDF1F6" />
        <path d="M58 72 L50 84 L56 92 Z" fill="#EDF1F6" />
        <path d="M49 84 h2 v16 h-2 z" fill="#1B3A69" opacity=".18" />
        {/* Boyun */}
        <path d="M43 62 h14 v10 c0 4 -14 4 -14 0 z" fill="#E4A886" />
        {/* Baş */}
        <ellipse cx="50" cy="46" rx="17" ry="19" fill="#EDB595" />
        {/* Kulaklar */}
        <circle cx="33" cy="47" r="3.2" fill="#E4A886" /><circle cx="67" cy="47" r="3.2" fill="#E4A886" />
        {/* Saç */}
        <path d="M31 48 C29 26 41 20 50 20 C59 20 71 26 69 48 C69 40 64 33 50 33 C36 33 31 40 31 48 Z" fill="#3A2A26" />
        <path d="M31 48 C30 60 32 66 34 70 C31 62 33 52 34 48 Z" fill="#3A2A26" />
        <path d="M69 48 C70 60 68 66 66 70 C69 62 67 52 66 48 Z" fill="#3A2A26" />
        {/* Kaşlar + gözler */}
        <path d="M40 42 q4 -2.5 8 0" stroke="#4A362F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M52 42 q4 -2.5 8 0" stroke="#4A362F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="47" r="2.1" fill="#3A2A26" /><circle cx="56" cy="47" r="2.1" fill="#3A2A26" />
        {/* Gülümseme */}
        <path d="M44 55 q6 5 12 0" stroke="#B9705A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ── Kart link tanımları (yeni sıralama) ──────────────────────── */
const SOSYAL = [
  { cls: 'hk-ig', icon: <Ig s={16} />, name: 'Instagram' },
  { cls: 'hk-in', icon: <In s={16} />, name: 'LinkedIn' },
  { cls: 'hk-fb', icon: <Fb s={16} />, name: 'Facebook' },
];

/* ── "Neden özel?" — her başlık + önemi ───────────────────────── */
const OZELLIKLER = [
  {
    ic: <Cal c="#059669" s={22} />, bg: '#EAF7F0', renk: '#047857',
    baslik: 'Online Randevu — en üstte',
    onem: 'Kartın ilk butonu randevu. Hasta seni araması gerekmeden, o an talebini bırakır. Kaçan hastayı yakalar, dönüşümü artırır — bu yüzden en üstte.',
  },
  {
    ic: <Phone c="#1B3A69" s={22} />, bg: '#EEF2FF', renk: '#1B3A69',
    baslik: 'Doğrudan Ara',
    onem: 'Tek dokunuşla telefon açılır. Acil ağrı ya da hızlı bilgi isteyen hasta için en kısa yol. Randevunun hemen altında, her zaman erişilebilir.',
  },
  {
    ic: <Ig c="#C13584" s={22} />, bg: '#FDECF4', renk: '#C13584',
    baslik: 'Instagram · LinkedIn · Facebook',
    onem: 'Sosyal medya tek satırda, kompakt. Instagram vaka vitrinin, LinkedIn profesyonel kimliğin, Facebook topluluğun. Üçü birden güven inşa eder — hasta seni tanıyarak gelir.',
  },
  {
    ic: <Globe c="#6D28D9" s={22} />, bg: '#F3EEFF', renk: '#6D28D9',
    baslik: 'Web Sitesi',
    onem: 'Kendi siten varsa buradan bağlanır. Hizmetlerin, ekibin ve içeriklerin için ayrıntılı vitrin. İsteğe bağlı — dolu değilse görünmez.',
  },
  {
    ic: <Pin c="#EA4335" s={22} />, bg: '#FFF0E6', renk: '#C2410C',
    baslik: 'Konum — en altta',
    onem: 'Hasta kararını verip iletişime geçtikten sonra ihtiyacı olan son şey: yol tarifi. Google Maps ile tek dokunuşta navigasyon. Bu yüzden en altta.',
  },
  {
    ic: <Shield c="#059669" s={22} />, bg: '#EAF7F0', renk: '#047857',
    baslik: 'Onaylı Hekim rozeti',
    onem: 'Pro hesaplarda kartın en üstünde yeşil onay rozeti. Sıradan bir link listesinden ayrışmanı sağlar; hasta gözünde güveni ve ciddiyeti artırır.',
  },
  {
    ic: <Qr c="#1B3A69" s={22} />, bg: '#EEF2FF', renk: '#1B3A69',
    baslik: 'QR kod',
    onem: 'Kliniğinde, vitrininde, basılı kartında QR. Okutan hasta saniyeler içinde kartında. Fiziksel dünyayı dijitale bağlayan köprü.',
  },
  {
    ic: <Star s={22} />, bg: '#FFF7E6', renk: '#B45309',
    baslik: 'Gerçek puan ve yorumlar',
    onem: 'Kartındaki puan, Hekimhane profilindeki gerçek hasta yorumlarından gelir — uydurma değil. Şeffaf itibar, en güçlü pazarlama.',
  },
];

export default function HekimKartTanitim() {
  return (
    <div style={{ paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', background: '#FBF8F2' }}>
      <style>{`
        .hk-wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .hk-hero { background: linear-gradient(160deg,#071A2E 0%,#0E2D55 45%,#163D6E 100%); padding: 64px 0 210px; text-align:center; }
        .hk-grid { display:grid; grid-template-columns: 1fr 372px; gap: 52px; align-items:start; margin-top: -160px; }
        @media (max-width: 880px) { .hk-grid { grid-template-columns: 1fr; gap: 34px; margin-top: -150px; } .hk-card-col { order:-1; } }

        /* Kart */
        .hk-card { width: 372px; max-width: 100%; margin: 0 auto; background:#fff; border-radius: 26px; box-shadow: 0 30px 70px rgba(7,26,46,.28); overflow:hidden; }
        .hk-poster { background: radial-gradient(120% 90% at 50% 0%, #143a6b 0%, #0d2547 55%, #0a1f3d 100%); padding: 28px 24px 20px; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .hk-name { font-size: 20px; font-weight:800; color:#fff; letter-spacing:-.4px; text-align:center; margin-top:4px; }
        .hk-spec { font-size:13px; color:#E7BE5C; font-weight:600; text-align:center; }
        .hk-clinic { font-size:12px; color:rgba(255,255,255,.55); text-align:center; }
        .hk-badges { display:flex; gap:7px; flex-wrap:wrap; justify-content:center; margin-top:2px; }
        .hk-b { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
        .hk-b-ok { background:rgba(16,185,129,.16); border:1px solid rgba(16,185,129,.4); color:#6EE7B7; }
        .hk-b-loc { background:rgba(255,255,255,.12); color:rgba(255,255,255,.8); font-weight:500; }
        .hk-b-rat { background:rgba(212,168,67,.16); border:1px solid rgba(212,168,67,.35); color:#E7BE5C; }

        .hk-links { padding: 16px 16px 8px; display:flex; flex-direction:column; gap:9px; }
        .hk-btn { display:flex; align-items:center; gap:12px; padding:13px 15px; border-radius:15px; font-size:14px; font-weight:600; text-decoration:none; transition:transform .15s, box-shadow .15s; }
        .hk-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.18); }
        .hk-ic { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .hk-ic-l { background:#EDE9FE; }
        .hk-lbl { display:flex; flex-direction:column; min-width:0; }
        .hk-lbl-sub { font-size:10.5px; opacity:.75; font-weight:500; }
        .hk-lbl-main { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Kompakt sosyal satır — yarı boyut, yan yana */
        .hk-social-row { display:flex; gap:9px; }
        .hk-mini { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:10px 6px; border-radius:13px; font-size:12px; font-weight:700; color:#fff; text-decoration:none; transition:transform .15s, box-shadow .15s; }
        .hk-mini:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.18); }

        .hk-phone { background:linear-gradient(135deg,#1B3A69,#2d5496); color:#fff; box-shadow:0 4px 16px rgba(27,58,105,.28); }
        .hk-rez   { background:linear-gradient(135deg,#047857,#059669); color:#fff; box-shadow:0 4px 16px rgba(5,150,105,.25); }
        .hk-ig    { background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); box-shadow:0 4px 14px rgba(131,58,180,.22); }
        .hk-in    { background:linear-gradient(135deg,#0A66C2,#004182); box-shadow:0 4px 14px rgba(10,102,194,.22); }
        .hk-fb    { background:linear-gradient(135deg,#1877F2,#0D5EC7); box-shadow:0 4px 14px rgba(24,119,242,.22); }
        .hk-web, .hk-map { background:#F4F2FB; color:#3A3A3C; }
        .hk-web .hk-lbl-sub { color:#6D28D9; } .hk-map .hk-ic { background:#FFF0E6; } .hk-map .hk-lbl-sub { color:#C2410C; }
        .hk-foot { text-align:center; font-size:11px; color:#9AA4B2; padding: 6px 0 18px; }

        /* Açıklama kartı */
        .hk-panel { background:#fff; border-radius:24px; border:1px solid #EEE7DA; padding:32px 30px; box-shadow:0 4px 20px rgba(0,0,0,.04); }

        /* Özellik listesi */
        .hk-feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width:680px){ .hk-feat-grid { grid-template-columns:1fr; } }
        .hk-feat { background:#fff; border:1px solid #EEE7DA; border-radius:18px; padding:22px 22px; }
        .hk-feat-ic { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hk-hero">
        <div className="hk-wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '5px 16px', fontSize: 11, fontWeight: 700, color: '#D4A843', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 22 }}>
            Dijital Kartvizit · Ücretsiz
          </div>
          <h1 style={{ fontSize: 'clamp(34px,5.5vw,58px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, margin: '0 0 18px' }}>
            HekimKart
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.62)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Sıradan bir link listesi değil — <strong style={{ color: '#fff' }}>sağlığa özel</strong>, önceliklendirilmiş bir dijital kartvizit.
            İşte hastalarının göreceği kart:
          </p>
        </div>
      </section>

      {/* ── İÇERİK: açıklama + örnek kart ─────────────────── */}
      <section className="hk-wrap" style={{ paddingBottom: 64 }}>
        <div className="hk-grid">
          {/* Sol — kısa anlatım */}
          <div className="hk-panel">
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1B3A69', letterSpacing: '-.6px', margin: '0 0 10px' }}>
              Butonların sırası tesadüf değil
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 15, lineHeight: 1.7, margin: '0 0 22px' }}>
              HekimKart, bir hastanın karar yolculuğuna göre tasarlandı. En çok ihtiyaç duyulan iki eylem
              — <strong style={{ color: '#1D1D1F' }}>online randevu</strong> ve <strong style={{ color: '#1D1D1F' }}>doğrudan arama</strong> —
              en üstte. Sosyal medyan güven için tek kompakt satırda. Konum ise, hasta zaten iletişime geçtikten sonra
              gerekeceği için en altta.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['1', 'Önce eylem', 'Randevu ve telefon üstte — dönüşüm burada olur.'],
                ['2', 'Sonra güven', 'Instagram, LinkedIn, Facebook yan yana — itibarını gösterir.'],
                ['3', 'En son yön', 'Web sitesi ve konum — kararını vermiş hasta için.'],
              ].map(([n, t, d]) => (
                <div key={n} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: '#1B3A69', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1D1D1F' }}>{t}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ — örnek kart (yeni sıralama) */}
          <div className="hk-card-col">
            <div className="hk-card">
              <div className="hk-poster">
                <AvatarIllustration />
                <div className="hk-name">Dr. Dt. Elif Yılmaz</div>
                <div className="hk-spec">Ağız, Diş ve Çene Cerrahisi</div>
                <div className="hk-clinic">Yılmaz Ağız ve Diş Sağlığı Kliniği</div>
                <div className="hk-badges">
                  <span className="hk-b hk-b-ok"><Check s={11} c="#6EE7B7" /> Onaylı Hekim</span>
                  <span className="hk-b hk-b-rat"><Star /> 4.9 · 128</span>
                </div>
                <div className="hk-badges">
                  <span className="hk-b hk-b-loc"><Pin s={12} /> Kadıköy, İstanbul</span>
                </div>
              </div>

              <div className="hk-links">
                {/* 1) Online randevu */}
                <div className="hk-btn hk-rez">
                  <span className="hk-ic"><Cal /></span>
                  <span className="hk-lbl"><span className="hk-lbl-sub">Online Randevu</span><span className="hk-lbl-main">Randevu Al</span></span>
                </div>
                {/* 2) Telefon */}
                <div className="hk-btn hk-phone">
                  <span className="hk-ic"><Phone /></span>
                  <span className="hk-lbl"><span className="hk-lbl-sub">Doğrudan Ara</span><span className="hk-lbl-main">0212 555 34 12</span></span>
                </div>
                {/* 3) Sosyal — kompakt, yan yana */}
                <div className="hk-social-row">
                  {SOSYAL.map(s => (
                    <div key={s.name} className={`hk-mini ${s.cls}`}>{s.icon}<span>{s.name}</span></div>
                  ))}
                </div>
                {/* 4) Web sitesi */}
                <div className="hk-btn hk-web">
                  <span className="hk-ic hk-ic-l"><Globe /></span>
                  <span className="hk-lbl"><span className="hk-lbl-sub">Web Sitesi</span><span className="hk-lbl-main">drelifyilmaz.com</span></span>
                </div>
                {/* 5) Konum — en altta */}
                <div className="hk-btn hk-map">
                  <span className="hk-ic"><Pin /></span>
                  <span className="hk-lbl"><span className="hk-lbl-sub">Konum</span><span className="hk-lbl-main">Harita&apos;da Görüntüle</span></span>
                </div>
              </div>
              <div className="hk-foot">Hekimhane ile oluşturuldu</div>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9AA4B2', marginTop: 12, lineHeight: 1.5 }}>
              Örnek karttır. Gerçek kartında kendi fotoğrafını ve bilgilerini kullanırsın.
            </p>
          </div>
        </div>
      </section>

      {/* ── NEDEN ÖZEL — her başlık + önemi ──────────────── */}
      <section className="hk-wrap" style={{ paddingBottom: 64 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 }}>
            <Star s={13} /> Neden özel bir kart?
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.4vw,34px)', fontWeight: 800, color: '#1B3A69', letterSpacing: '-.8px', margin: '0 0 10px' }}>
            Her başlık, bir amaca hizmet ediyor
          </h2>
          <p style={{ color: '#6E6E73', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            HekimKart&apos;taki her bölüm, hastanın seni bulmasını, sana güvenmesini ve iletişime geçmesini kolaylaştırmak için var.
          </p>
        </div>

        <div className="hk-feat-grid">
          {OZELLIKLER.map(o => (
            <div key={o.baslik} className="hk-feat">
              <div className="hk-feat-ic" style={{ background: o.bg }}>{o.ic}</div>
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: o.renk, letterSpacing: '-.3px', margin: '0 0 7px' }}>{o.baslik}</h3>
              <p style={{ fontSize: 13.5, color: '#5A5A5F', lineHeight: 1.6, margin: 0 }}>{o.onem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÖZEL BANDI ───────────────────────────────────── */}
      <section className="hk-wrap" style={{ paddingBottom: 64 }}>
        <div style={{ background: 'linear-gradient(135deg,#FBF3E0,#F6ECD4)', border: '1px solid #EADBB5', borderRadius: 22, padding: '34px 32px', display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield c="#D4A843" s={26} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1B3A69', letterSpacing: '-.4px', margin: '0 0 8px' }}>
              Genel bir “link sayfası” değil — sağlığa özel
            </h3>
            <p style={{ fontSize: 14.5, color: '#6b5d3e', lineHeight: 1.7, margin: 0 }}>
              HekimKart; Onaylı Hekim rozeti, gerçek hasta yorumlarından gelen puan ve doğrudan Hekimhane profiline bağlı yapısıyla
              sıradan bağlantı araçlarından ayrılır. Hasta karşısına <strong>güven</strong> ve <strong>doğrulanmış kimlik</strong> ile çıkarsın —
              üstelik tamamen ücretsiz.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="hk-wrap">
          <div style={{ background: 'linear-gradient(155deg,#0A2540 0%,#163D6E 100%)', borderRadius: 24, padding: '48px 40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#fff', letterSpacing: '-.6px', margin: '0 0 12px' }}>
              Kendi HekimKart&apos;ını oluştur
            </h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, maxWidth: 480, margin: '0 auto 26px', lineHeight: 1.6 }}>
              Kliniğini Hekimhane&apos;ye ekle; profilin onaylandığında dijital kartın otomatik hazır olur.
            </p>
            <Link href="/katil" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 13, background: '#D4A843', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '-.2px' }}>
              Kliniğini Ekle <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
