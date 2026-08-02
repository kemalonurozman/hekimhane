// ─────────────────────────────────────────────────────────────
// Premium profil arka planları — Apple tarzı, akışkan dalga grafikleri.
// 3 tema: Navy / Pearl / Aurora. Premium hesapta dalgalar HAREKETLİ,
// normal hesapta STATİK (daha sade). Işletme sahibi panelden seçer
// (cover = "preset:<key>"). Yazı okunurluğu için scrim katmanı vardır.
// ─────────────────────────────────────────────────────────────
export interface HeroBg {
  key: string;
  name: string;
  desc: string;
  base: string;       // taban gradient
  style?: 'wave' | 'blob'; // 'wave'=akışkan dalga (varsayılan), 'blob'=Apple-tarzı hareketli gradient lekeler
  blobs?: [string, string, string]; // blob temalarında 3 hareketli renk lekesi
  light?: boolean;    // açık tema → hero metni koyu renk kullanır
  swatch: string;     // panel önizleme küçük gradient
  dots: [string, string, string]; // panel swatch renk noktaları
}

export const HERO_BACKGROUNDS: HeroBg[] = [
  // ── Dalga temaları (Premium) ──
  {
    key: 'navy', name: 'Navy Premium', style: 'wave',
    desc: 'Lacivert tonlar, altın detaylar. Güçlü, kurumsal ve modern.',
    base: 'linear-gradient(155deg,#091B36 0%,#12315E 52%,#0A1F3E 100%)',
    swatch: 'linear-gradient(150deg,#0A1E3C,#12315E,#D4A843)',
    dots: ['#0F2A55', '#D4A843', '#9FC2E8'],
  },
  {
    key: 'pearl', name: 'Pearl Premium', style: 'wave',
    desc: 'Açık, ferah ve elegant görünüm. Minimal ve sade.',
    base: 'linear-gradient(155deg,#FCFAF4 0%,#F1E7D5 52%,#FBF6EC 100%)',
    light: true,
    swatch: 'linear-gradient(150deg,#FBF7EF,#EAD9BC,#C9CDD6)',
    dots: ['#FBF6EC', '#E4C687', '#C7CCD6'],
  },
  {
    key: 'aurora', name: 'Aurora Premium', style: 'wave',
    desc: 'Mavi tonlarında dinamik geçişler. Modern ve teknolojik.',
    base: 'linear-gradient(155deg,#0B4488 0%,#2C77D0 52%,#7FB8EC 100%)',
    swatch: 'linear-gradient(150deg,#0C4A8F,#2E7BD6,#8FD0F0)',
    dots: ['#0C4A8F', '#2E7BD6', '#8FD0F0'],
  },
  // ── Klasik Apple-tarzı hareketli lekeler (geri getirildi) ──
  {
    key: 'ocean', name: 'Okyanus', style: 'blob',
    desc: 'Lacivert–turkuaz derin okyanus tonları.',
    base: 'linear-gradient(160deg,#0b2545 0%,#0e7490 50%,#059669 100%)',
    blobs: ['#0891b2', '#10b981', '#0ea5e9'],
    swatch: 'linear-gradient(150deg,#0b2545,#1098ad,#0ca678)',
    dots: ['#0b2545', '#1098ad', '#0ca678'],
  },
  {
    key: 'sunset', name: 'Gün Batımı', style: 'blob',
    desc: 'Turuncu–mavi sıcak gün batımı geçişleri.',
    base: 'linear-gradient(160deg,#b91c1c 0%,#ea580c 45%,#2563eb 100%)',
    blobs: ['#f97316', '#ef4444', '#3b82f6'],
    swatch: 'linear-gradient(150deg,#f76707,#e8590c,#4263eb)',
    dots: ['#f76707', '#e8590c', '#4263eb'],
  },
  {
    key: 'gold', name: 'Altın Lacivert', style: 'blob',
    desc: 'Marka rengi — lacivert zeminde altın vurgular.',
    base: 'linear-gradient(160deg,#0F2A55 0%,#1B3A69 50%,#8a6d1f 100%)',
    blobs: ['#D4A843', '#2563eb', '#1B3A69'],
    swatch: 'linear-gradient(150deg,#0F2A55,#1B3A69,#D4A843)',
    dots: ['#0F2A55', '#1B3A69', '#D4A843'],
  },
  {
    key: 'yesil', name: 'Aurora Yeşil', style: 'blob',
    desc: 'Mavi–yeşil kuzey ışığı tonları.',
    base: 'linear-gradient(160deg,#1e3a8a 0%,#2563eb 45%,#16a34a 100%)',
    blobs: ['#3b82f6', '#22c55e', '#6366f1'],
    swatch: 'linear-gradient(150deg,#3b5bdb,#40c057,#5c7cfa)',
    dots: ['#3b5bdb', '#40c057', '#5c7cfa'],
  },
];

// Eski/kaldırılmış cover key'leri → mevcut temalara eşleme (geriye dönük uyum)
const ALIASES: Record<string, string> = {};

export function heroBgByKey(key: string | null | undefined): HeroBg | null {
  if (!key) return null;
  const k = ALIASES[key] || key;
  return HERO_BACKGROUNDS.find(b => b.key === k) || null;
}

/** cover alanı "preset:<key>" ise key'i döndürür */
export function coverPresetKey(cover: string | null | undefined): string | null {
  if (cover && cover.startsWith('preset:')) return cover.slice(7);
  return null;
}

/**
 * Dalga arka planı SVG'sinin path'leri — tüm temalarda ortaktır;
 * renkler CSS değişkenleriyle (per-tema) verilir. Bileşende bir kez render edilir.
 */
export const HERO_WAVE_PATHS = {
  w1: 'M-70,120 C60,60 150,150 250,110 C340,74 400,120 470,86 L470,-70 L-70,-70 Z',
  w2: 'M-70,175 C70,120 160,205 260,160 C350,120 410,165 470,135 L470,-70 L-70,-70 Z',
  w3: 'M-70,230 C80,185 170,255 280,215 C360,186 420,225 470,200 L470,-70 L-70,-70 Z',
  line1: 'M-70,150 C70,92 160,178 258,138 C348,102 408,146 470,114',
  line2: 'M-70,205 C80,158 176,232 286,190 C360,162 420,198 470,176',
};

/** Animasyon + per-tema renk CSS'i (bir kez <style> ile enjekte edilir) */
export const HERO_BG_CSS = `
.hbw{position:absolute;inset:0;overflow:hidden;}
.hbw__base{position:absolute;inset:-2px;}
.hbw__svg{position:absolute;left:-6%;top:0;width:112%;height:118%;}
.hbw__w,.hbw__l{will-change:transform;transform-origin:center;}
.hbw__l{fill:none;stroke-linecap:round;}
.hbw__scrim{position:absolute;inset:0;}
/* Koyu temalarda beyaz yazı okunsun diye üstten alta koyulaşan scrim */
.hbw--dark .hbw__scrim{background:linear-gradient(180deg,rgba(6,16,32,.14) 0%,rgba(6,16,32,.34) 46%,rgba(6,16,32,.60) 100%);}
/* Açık (pearl) temada koyu yazı okunsun diye çok hafif beyazlaştıran scrim */
.hbw--light .hbw__scrim{background:linear-gradient(180deg,rgba(255,255,255,.10) 0%,rgba(255,253,247,.30) 62%,rgba(255,253,247,.55) 100%);}

/* Hareket yalnızca premium (is-anim) hesaplarda */
.hbw.is-anim .hbw__w1{animation:hbwA 26s ease-in-out infinite alternate;}
.hbw.is-anim .hbw__w2{animation:hbwB 32s ease-in-out infinite alternate;}
.hbw.is-anim .hbw__w3{animation:hbwC 38s ease-in-out infinite alternate;}
.hbw.is-anim .hbw__l1{animation:hbwB 30s ease-in-out infinite alternate;}
.hbw.is-anim .hbw__l2{animation:hbwA 24s ease-in-out infinite alternate;}
@keyframes hbwA{from{transform:translate(0,0)}to{transform:translate(-5%,2.2%)}}
@keyframes hbwB{from{transform:translate(0,0)}to{transform:translate(4.5%,-2%)}}
@keyframes hbwC{from{transform:translate(0,0)}to{transform:translate(-3.5%,2.6%)}}
@media (prefers-reduced-motion: reduce){.hbw__w,.hbw__l{animation:none!important;}}
/* Normal hesap — hareketsiz, daha sade (ince çizgiler bir tık soluk) */
.hbw.is-lite .hbw__l{opacity:.6;}

/* ── Navy Premium ── */
.hbw--navy .hbw__base{background:linear-gradient(155deg,#091B36 0%,#12315E 52%,#0A1F3E 100%);}
.hbw--navy .hbw__w1{fill:rgba(255,255,255,.055);}
.hbw--navy .hbw__w2{fill:rgba(212,168,67,.20);}
.hbw--navy .hbw__w3{fill:rgba(159,194,232,.10);}
.hbw--navy .hbw__l1{stroke:rgba(232,197,120,.85);stroke-width:1.4;}
.hbw--navy .hbw__l2{stroke:rgba(255,255,255,.28);stroke-width:1;}

/* ── Pearl Premium (açık) ── */
.hbw--pearl .hbw__base{background:linear-gradient(155deg,#FCFAF4 0%,#F1E7D5 52%,#FBF6EC 100%);}
.hbw--pearl .hbw__w1{fill:rgba(199,163,90,.10);}
.hbw--pearl .hbw__w2{fill:rgba(180,140,66,.14);}
.hbw--pearl .hbw__w3{fill:rgba(150,160,180,.10);}
.hbw--pearl .hbw__l1{stroke:rgba(184,142,64,.55);stroke-width:1.3;}
.hbw--pearl .hbw__l2{stroke:rgba(150,160,180,.45);stroke-width:1;}

/* ── Aurora Premium ── */
.hbw--aurora .hbw__base{background:linear-gradient(155deg,#0B4488 0%,#2C77D0 52%,#7FB8EC 100%);}
.hbw--aurora .hbw__w1{fill:rgba(255,255,255,.14);}
.hbw--aurora .hbw__w2{fill:rgba(255,255,255,.22);}
.hbw--aurora .hbw__w3{fill:rgba(12,74,143,.20);}
.hbw--aurora .hbw__l1{stroke:rgba(255,255,255,.55);stroke-width:1.3;}
.hbw--aurora .hbw__l2{stroke:rgba(226,240,255,.35);stroke-width:1;}

/* ══ Klasik Apple-tarzı hareketli lekeler (.hb) ══ */
.hb{position:absolute;inset:0;overflow:hidden;}
.hb__base{position:absolute;inset:-2px;}
.hb__blob{position:absolute;width:75%;height:80%;border-radius:50%;filter:blur(46px);opacity:.62;mix-blend-mode:screen;will-change:transform;}
.hb__b1{top:-25%;left:-12%;animation:hbDrift1 26s ease-in-out infinite alternate;}
.hb__b2{bottom:-30%;right:-12%;animation:hbDrift2 34s ease-in-out infinite alternate;}
.hb__b3{top:8%;right:18%;width:55%;height:60%;opacity:.5;animation:hbDrift3 22s ease-in-out infinite alternate;}
.hb__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,18,34,.30) 0%,rgba(8,18,34,.50) 55%,rgba(8,18,34,.66) 100%);}
@keyframes hbDrift1{from{transform:translate(0,0) scale(1)}to{transform:translate(16%,12%) scale(1.18)}}
@keyframes hbDrift2{from{transform:translate(0,0) scale(1)}to{transform:translate(-14%,-10%) scale(1.12)}}
@keyframes hbDrift3{from{transform:translate(0,0) scale(1)}to{transform:translate(-12%,14%) scale(1.22)}}
@media (prefers-reduced-motion: reduce){.hb__blob{animation:none!important;}}
${HERO_BACKGROUNDS.filter(b => b.style === 'blob' && b.blobs).map(b => `
.hb--${b.key} .hb__base{background:${b.base};}
.hb--${b.key} .hb__b1{background:radial-gradient(circle at 50% 50%,${b.blobs![0]},transparent 70%);}
.hb--${b.key} .hb__b2{background:radial-gradient(circle at 50% 50%,${b.blobs![1]},transparent 70%);}
.hb--${b.key} .hb__b3{background:radial-gradient(circle at 50% 50%,${b.blobs![2]},transparent 70%);}`).join('')}
`;
