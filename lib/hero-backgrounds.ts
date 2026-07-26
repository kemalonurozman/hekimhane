// ─────────────────────────────────────────────────────────────
// Premium profil arka planları — Apple tarzı, hafif hareketli gradient'ler.
// Sabit/curated set; premium üye panelden seçer (cover = "preset:<key>").
// Yazı okunurluğu için üstte scrim katmanı vardır.
// ─────────────────────────────────────────────────────────────
export interface HeroBg {
  key: string;
  name: string;
  base: string;       // taban linear-gradient
  blobs: [string, string, string]; // 3 hareketli renk lekesi
  swatch: string;     // panel önizleme için küçük gradient
}

export const HERO_BACKGROUNDS: HeroBg[] = [
  {
    key: 'aurora', name: 'Aurora (Mavi-Yeşil)',
    base: 'linear-gradient(160deg,#1e3a8a 0%,#2563eb 45%,#16a34a 100%)',
    blobs: ['#3b82f6', '#22c55e', '#6366f1'],
    swatch: 'linear-gradient(150deg,#3b5bdb,#40c057,#5c7cfa)',
  },
  {
    key: 'sunset', name: 'Gün Batımı (Turuncu-Mavi)',
    base: 'linear-gradient(160deg,#b91c1c 0%,#ea580c 45%,#2563eb 100%)',
    blobs: ['#f97316', '#ef4444', '#3b82f6'],
    swatch: 'linear-gradient(150deg,#f76707,#e8590c,#4263eb)',
  },
  {
    key: 'ocean', name: 'Okyanus (Lacivert-Turkuaz)',
    base: 'linear-gradient(160deg,#0b2545 0%,#0e7490 50%,#059669 100%)',
    blobs: ['#0891b2', '#10b981', '#0ea5e9'],
    swatch: 'linear-gradient(150deg,#0b2545,#1098ad,#0ca678)',
  },
  {
    key: 'gold', name: 'Altın Lacivert (Marka)',
    base: 'linear-gradient(160deg,#0F2A55 0%,#1B3A69 50%,#8a6d1f 100%)',
    blobs: ['#D4A843', '#2563eb', '#1B3A69'],
    swatch: 'linear-gradient(150deg,#0F2A55,#1B3A69,#D4A843)',
  },
];

export function heroBgByKey(key: string | null | undefined): HeroBg | null {
  if (!key) return null;
  return HERO_BACKGROUNDS.find(b => b.key === key) || null;
}

/** cover alanı "preset:<key>" ise key'i döndürür */
export function coverPresetKey(cover: string | null | undefined): string | null {
  if (cover && cover.startsWith('preset:')) return cover.slice(7);
  return null;
}

/** Tüm preset'ler için animasyon + renk CSS'i (bir kez <style> ile enjekte edilir) */
export const HERO_BG_CSS = `
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
${HERO_BACKGROUNDS.map(b => `
.hb--${b.key} .hb__base{background:${b.base};}
.hb--${b.key} .hb__b1{background:radial-gradient(circle at 50% 50%,${b.blobs[0]},transparent 70%);}
.hb--${b.key} .hb__b2{background:radial-gradient(circle at 50% 50%,${b.blobs[1]},transparent 70%);}
.hb--${b.key} .hb__b3{background:radial-gradient(circle at 50% 50%,${b.blobs[2]},transparent 70%);}`).join('')}
`;
