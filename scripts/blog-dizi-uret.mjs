#!/usr/bin/env node
// Blog dizileri için iki dosya üretir:
//  1) lib/blog-saglik/index.ts — lib/blog-saglik/<slug>.ts dosyalarını içe aktarır.
//  2) lib/blog-takvim.ts — yayın anları. MEVCUT kayıtlara dokunmaz; takvimde olmayan
//     yazıları son kayıttan sonraki günlere, günde 1–3 yazı, farklı saatlerde ve
//     dizileri/kategorileri karıştırarak ekler. FTR dizisinin kendi sırası korunur.
// Kullanım: node scripts/blog-dizi-uret.mjs [--bas YYYY-MM-DD]
import fs from 'fs';
import path from 'path';

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SAGLIK = path.join(KOK, 'lib/blog-saglik');
const FTR = path.join(KOK, 'lib/blog-ftr');
const TAKVIM = path.join(KOK, 'lib/blog-takvim.ts');

// ── 1) Sağlık dizisi index ──
const dosyalar = fs.readdirSync(SAGLIK).filter(f => f.endsWith('.ts') && !['index.ts', 'tip.ts'].includes(f)).sort();
const kaynaklar = dosyalar.map(f => {
  const t = fs.readFileSync(path.join(SAGLIK, f), 'utf8');
  const al = k => (t.match(new RegExp(`\\b${k}:\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1];
  return { dosya: f.replace(/\.ts$/, ''), slug: al('slug'), kategori: al('kategori') };
});
for (const k of kaynaklar) if (k.slug !== k.dosya) throw new Error(`slug/dosya adı uyuşmuyor: ${k.dosya}`);
const ad = s => 'y_' + s.replace(/-/g, '_');
fs.writeFileSync(path.join(SAGLIK, 'index.ts'), `// OTOMATİK ÜRETİLİR — scripts/blog-dizi-uret.mjs. Elle düzenleme.
// Sağlık / hastalık yazı dizisi. Yayın anı lib/blog-takvim.ts'ten gelir; takvimde
// olmayan yazı yayınlanmaz.
import type { BlogYazi } from '../blog-data';
import { parseGovde, okumaSuresi } from '../makale-icerik';
import { TAKVIM } from '../blog-takvim';
import type { SaglikKaynak } from './tip';

${kaynaklar.map(k => `import ${ad(k.slug)} from './${k.slug}';`).join('\n')}

const UYARI =
  'Bu içerik yalnızca genel bilgilendirme amaçlıdır; hekim muayenesinin, tanı ve tedavinin yerini tutmaz. Şikâyetleriniz için bir hekime başvurun; acil durumlarda 112\\'yi arayın.';

const KAYNAKLAR: SaglikKaynak[] = [
${kaynaklar.map(k => `  ${ad(k.slug)},`).join('\n')}
];

/** [metin](/hekim-bul) → yazının branşına göre hekim listesi */
const hekimBul = (metin: string, brans: string) =>
  metin.replace(/\\]\\(\\/hekim-bul\\)/g, \`](/doktorlar?spec=\${encodeURIComponent(brans).replace(/[()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())})\`);

export const SAGLIK_YAZILARI: BlogYazi[] = KAYNAKLAR
  .filter(k => TAKVIM[k.slug])
  .map(k => ({
    slug: k.slug,
    title: k.title,
    summary: k.summary,
    category: k.kategori,
    author: 'Hekimhane Editör',
    created_at: TAKVIM[k.slug],
    okumaDk: okumaSuresi(k.metin),
    cover_image: \`/blog/\${k.slug}.svg\`,
    cover_alt: k.cover_alt,
    views: 0,
    govde: [...parseGovde(hekimBul(k.metin, k.brans)), { tip: 'p' as const, metin: UYARI }],
    brans: k.brans,
  }));
`);

// ── 2) Takvim ──
const mevcut = {};
if (fs.existsSync(TAKVIM)) for (const m of fs.readFileSync(TAKVIM, 'utf8').matchAll(/'([a-z0-9-]+)':\s*'([^']+)'/g)) mevcut[m[1]] = m[2];

const ftrSira = fs.readdirSync(FTR).filter(f => /^\d\d-.*\.ts$/.test(f)).sort().map(f => f.replace(/^\d\d-/, '').replace(/\.ts$/, ''));
const ftrBekleyen = ftrSira.filter(s => !mevcut[s]);
// İlk FTR yazısı mevcut takvimde yoksa kendi gününde 09:00 (zaten yayında)
if (ftrBekleyen[0] === 'kas-iskelet-sistemi-hastaliklari-tani-ve-tedavi') { mevcut[ftrBekleyen.shift()] = '2026-10-26T09:00:00+03:00'; }

// Sağlık yazılarını kategoriye göre sırayla dağıt (art arda aynı kategori olmasın)
const gruplar = {};
for (const k of kaynaklar.filter(k => !mevcut[k.slug])) (gruplar[k.kategori] ??= []).push(k.slug);
const kategoriler = Object.keys(gruplar).sort((a, b) => gruplar[b].length - gruplar[a].length);
const saglikSira = [];
while (kategoriler.some(c => gruplar[c].length)) for (const c of kategoriler) if (gruplar[c].length) saglikSira.push(gruplar[c].shift());

// FTR'yi araya eşit aralıkla serpiştir
const sira = [];
const adim = ftrBekleyen.length ? Math.max(2, Math.floor((saglikSira.length + ftrBekleyen.length) / ftrBekleyen.length)) : Infinity;
let f = 0, s2 = 0;
for (let i = 0; f < ftrBekleyen.length || s2 < saglikSira.length; i++) {
  if (f < ftrBekleyen.length && (i % adim === 0 || s2 >= saglikSira.length)) sira.push(ftrBekleyen[f++]);
  else if (s2 < saglikSira.length) sira.push(saglikSira[s2++]);
}

// Başlangıç günü: son kaydın ertesi günü (ya da --bas)
const basArg = process.argv.indexOf('--bas');
const sonGun = Object.values(mevcut).map(v => v.slice(0, 10)).sort().pop();
const gunEkle = (g, n) => { const d = new Date(g + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
let gun = basArg > -1 ? process.argv[basArg + 1] : (sonGun ? gunEkle(sonGun, 1) : new Date().toISOString().slice(0, 10));

// Tekrarlanabilir rastgelelik (aynı girdi → aynı takvim)
let tohum = 20261026;
const rnd = () => ((tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648);
const SAATLER = ['07:40', '08:20', '09:05', '09:50', '10:35', '11:15', '12:10', '13:25', '14:40', '15:30', '16:15', '17:20', '18:45', '19:30', '20:40', '21:15'];
const GUN_SAYI = [2, 1, 3, 2, 2, 1, 3, 2, 1, 2, 3, 2]; // ortalama ~2/gün, örüntü + rastgele kaydırma

let i = 0, g = 0;
while (i < sira.length) {
  const n = Math.min(GUN_SAYI[(g + Math.floor(rnd() * 3)) % GUN_SAYI.length], sira.length - i);
  const havuz = [...SAATLER]; const secilen = [];
  for (let j = 0; j < n; j++) secilen.push(havuz.splice(Math.floor(rnd() * havuz.length), 1)[0]);
  secilen.sort();
  for (const saat of secilen) mevcut[sira[i++]] = `${gun}T${saat}:00+03:00`;
  gun = gunEkle(gun, 1); g++;
}

const satirlar = Object.entries(mevcut).sort((a, b) => a[1].localeCompare(b[1]));
fs.writeFileSync(TAKVIM, `// OTOMATİK ÜRETİLİR (scripts/blog-dizi-uret.mjs) — mevcut kayıtlar korunur, elle de düzenlenebilir.
// Statik blog yazılarının yayın anları (Europe/Istanbul, +03:00). Listede olmayan
// FTR yazısı kendi dosyasındaki gün 09:00'da, sağlık yazısı hiç yayınlanmaz.
export const TAKVIM: Record<string, string> = {
${satirlar.map(([k, v]) => `  '${k}': '${v}',`).join('\n')}
};
`);
const gunler = {}; for (const [, v] of satirlar) gunler[v.slice(0, 10)] = (gunler[v.slice(0, 10)] || 0) + 1;
console.log(`sağlık dosyası: ${kaynaklar.length}, takvimde: ${satirlar.length}, gün: ${Object.keys(gunler).length}, ilk: ${satirlar[0]?.[1]}, son: ${satirlar.at(-1)?.[1]}`);
