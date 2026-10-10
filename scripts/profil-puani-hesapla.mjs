// Tüm klinik ve doktor profillerinin puanını hesaplar.
//   node scripts/profil-puani-hesapla.mjs            → kuru çalışma (dağılımı gösterir)
//   node scripts/profil-puani-hesapla.mjs --commit   → profil_puani kolonuna yazar
// Önce supabase/migrations/add_profil_puani.sql çalıştırılmış olmalı.
// Node 22.6+ gerekir (TypeScript'i kendisi çalıştırır).
import { createRequire } from 'node:module';
import { profilPuaniHesapla } from '../lib/profil-puani.ts';

const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const COMMIT = process.argv.includes('--commit');

async function hepsi(tablo, kolonlar = '*') {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(tablo).select(kolonlar).order('id').range(from, from + 999);
    if (error) throw new Error(`${tablo}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

const yorumlar = await hepsi('yorumlar', 'id,entity_type,entity_id,reply_text');
const kartlar = await hepsi('hekimkartlar', 'id,entity_id');
const yMap = new Map();
for (const y of yorumlar) {
  const a = `${y.entity_type}|${y.entity_id}`; const m = yMap.get(a) || { t: 0, y: 0 };
  m.t++; if (y.reply_text && String(y.reply_text).trim()) m.y++; yMap.set(a, m);
}
const kartSet = new Set(kartlar.map(k => String(k.entity_id)));

for (const [tip, tablo] of [['klinik', 'klinikler'], ['doktor', 'doktorlar']]) {
  const rows = await hepsi(tablo);
  const dagilim = [0, 0, 0, 0, 0];   // 0-19, 20-39, 40-59, 60-79, 80-100
  const degisen = [];
  let toplam = 0;
  for (const r of rows) {
    const y = yMap.get(`${tip}|${r.id}`);
    const { puan } = profilPuaniHesapla(tip, r, { yorumToplam: y?.t || 0, yorumYanitli: y?.y || 0, hekimKart: kartSet.has(String(r.id)) });
    dagilim[Math.min(4, Math.floor(puan / 20))]++; toplam += puan;
    if (r.profil_puani !== puan) degisen.push({ id: r.id, puan });
  }
  console.log(`\n${tablo}: ${rows.length} kayıt, ortalama ${(toplam / Math.max(1, rows.length)).toFixed(1)}`);
  console.log(`  0-19: ${dagilim[0]}  20-39: ${dagilim[1]}  40-59: ${dagilim[2]}  60-79: ${dagilim[3]}  80-100: ${dagilim[4]}`);
  console.log(`  güncellenecek: ${degisen.length}`);
  if (!COMMIT) continue;
  // Aynı puanı alanlar tek sorguda yazılır (en fazla 101 farklı değer)
  const grup = new Map();
  for (const d of degisen) grup.set(d.puan, [...(grup.get(d.puan) || []), d.id]);
  for (const [puan, ids] of grup) {
    for (let i = 0; i < ids.length; i += 200) {
      const { error } = await sb.from(tablo).update({ profil_puani: puan }).in('id', ids.slice(i, i + 200));
      if (error) throw new Error(`${tablo} yazılamadı: ${error.message}`);
    }
  }
  console.log('  yazıldı.');
}
if (!COMMIT) console.log('\nKuru çalışma — yazmak için --commit ekleyin.');
