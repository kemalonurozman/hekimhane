// Doktor panelindeki "Baktığınız hastalıklar" seçicisi için yazılmış blog konularının kısa listesini üretir:
//   node scripts/hastalik-secenekleri-uret.mjs   →  lib/hastalik-yazilari.ts
// Yeni yazı eklenince (blog-dizi-uret.mjs'den sonra) bir kez çalıştırın.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KOK = new URL('..', import.meta.url).pathname;
const ADLAR = {            // kısa ad, başlıktan türetilemeyenler
  'emg-elektromiyografi-nedir': 'EMG (Elektromiyografi)',
  'alerji': 'Alerji',
  'kekemelik': 'Kekemelik',
};
const al = (s, ad) => {
  const m = s.match(new RegExp(`^\\s*${ad}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 'm'));
  return m ? (m[1] ?? m[2]).replace(/\\(['"])/g, '$1') : undefined;
};
const kayit = [];
for (const [klasor, kat, brans] of [['lib/blog-ftr', 'Fizik Tedavi ve Rehabilitasyon', 'Fiziksel Tıp ve Rehabilitasyon'], ['lib/blog-saglik', null, null]]) {
  for (const f of readdirSync(join(KOK, klasor)).sort()) {
    if (!f.endsWith('.ts') || /^(index|tip)\.ts$/.test(f)) continue;
    const s = readFileSync(join(KOK, klasor, f), 'utf8');
    const slug = al(s, 'slug'); const title = al(s, 'title');
    if (!slug || !title) continue;
    kayit.push({ slug, ad: ADLAR[slug] || title.split(':')[0].trim(), kategori: kat || al(s, 'kategori'), brans: brans || al(s, 'brans') });
  }
}
const q = (x) => JSON.stringify(x);
writeFileSync(join(KOK, 'lib/hastalik-yazilari.ts'),
`// OTOMATİK ÜRETİLİR — node scripts/hastalik-secenekleri-uret.mjs (elle düzenlemeyin)
// Blogda yazısı olan konuların kısa adı. Doktor paneli "Baktığınız hastalıklar" seçicisi ve profil bağlantıları kullanır.
export interface HastalikYazisi { slug: string; ad: string; kategori: string; brans: string }
export const HASTALIK_YAZILARI: HastalikYazisi[] = [
${kayit.map(k => `  { slug: ${q(k.slug)}, ad: ${q(k.ad)}, kategori: ${q(k.kategori)}, brans: ${q(k.brans)} },`).join('\n')}
];
`);
console.log(kayit.length, 'konu yazıldı');
