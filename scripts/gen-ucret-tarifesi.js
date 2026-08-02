/** TDB 2026 ücret tarifesi CSV → lib/ucret-tarifesi-2026.ts üretir. */
const fs = require('fs');
const path = require('path');
const CSV = process.argv[2] || '/Users/onur/Downloads/tdb_2026_ucret_tarifesi.csv';
const OUT = path.join(__dirname, '../lib/ucret-tarifesi-2026.ts');

function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c === '\r') { /* skip */ }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const rows = parseCSV(fs.readFileSync(CSV, 'utf8')).filter(r => r.length >= 6 && r[0].trim());
rows.shift(); // header

const kats = []; const byKod = {};
for (const r of rows) {
  const [katKod, katAd, kod, ad, , , kdvHaricF, kdvDahilF] = r;
  if (!byKod[katKod]) { byKod[katKod] = { kod: katKod, ad: katAd.trim(), items: [] }; kats.push(byKod[katKod]); }
  byKod[katKod].items.push({ kod: kod.trim(), ad: ad.trim(), kdvHaric: kdvHaricF.trim(), kdvDahil: kdvDahilF.trim() });
}

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let out = `// TDB (Türk Dişhekimleri Birliği) 2026 Ağız-Diş Sağlığı Muayene ve Tedavi Ücret Tarifesi.
// Odanın belirlediği taban (asgari) fiyatlar. scripts/gen-ucret-tarifesi.js ile üretildi — elle düzenleme.
export interface TarifeItem { kod: string; ad: string; kdvHaric: string; kdvDahil: string; }
export interface TarifeKategori { kod: string; ad: string; items: TarifeItem[]; }

export const UCRET_TARIFESI_2026: TarifeKategori[] = [
`;
for (const k of kats) {
  out += `  { kod: '${esc(k.kod)}', ad: '${esc(k.ad)}', items: [\n`;
  for (const it of k.items) {
    out += `    { kod: '${esc(it.kod)}', ad: '${esc(it.ad)}', kdvHaric: '${esc(it.kdvHaric)}', kdvDahil: '${esc(it.kdvDahil)}' },\n`;
  }
  out += `  ]},\n`;
}
out += `];

export const TARIFE_ITEM_SAYISI = ${kats.reduce((s, k) => s + k.items.length, 0)};
`;
fs.writeFileSync(OUT, out);
console.log(`✓ ${OUT} yazıldı — ${kats.length} kategori, ${kats.reduce((s, k) => s + k.items.length, 0)} işlem.`);
