/**
 * Üniversite (özel/vakıf) Diş Hastaneleri — hekim rosteri import (CSV)
 * - Hekimler `doktorlar` tablosuna tags=['universite-dis-hastanesi', spec] ile eklenir
 *   → /klinikler?kurum=universite filtresinde görünürler (Kurum → Üniversite).
 * - clinic_name = hastane adı (profilde konum olarak görünür). Hastane kaydı OLUŞTURULMAZ.
 * CSV başlıkları: Üniversite, Bölüm / Anabilim Dalı, Unvan, Adı Soyadı, Görev / Not, Telefon Numarası
 * Kullanım: node scripts/import-universite-dis.js <csv> [--commit]
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const FILE = process.argv.find(a => a.endsWith('.csv'));
if (!FILE) { console.error('CSV yolu ver: node scripts/import-universite-dis.js <csv> [--commit]'); process.exit(1); }
const TAG = 'universite-dis-hastanesi';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const trDown = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ş/g, 'ş').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase();
const trUp1 = c => c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
const titleWord = w => w ? trUp1(trDown(w).charAt(0)) + trDown(w).slice(1) : w;
const titleName = s => (s || '').trim().replace(/\s+/g, ' ').split(' ').map(titleWord).join(' ');

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

// Bölüm → kanonik diş uzmanlığı (devlet import ile aynı kanon)
function specFromBolum(b = '') {
  const t = trDown(b);
  if (t.includes('cerrah')) return 'Ağız Diş ve Çene Cerrahisi';
  if (t.includes('radyoloji')) return 'Ağız Diş ve Çene Radyolojisi';
  if (t.includes('çocuk') || t.includes('pedodont')) return 'Pedodonti (Çocuk Diş Hekimliği)';
  if (t.includes('endodont') || t.includes('kanal')) return 'Endodonti (Kanal Tedavisi)';
  if (t.includes('ortodont')) return 'Ortodonti (Diş Teli)';
  if (t.includes('periodont') || t.includes('diş eti') || t.includes('dişeti')) return 'Periodontoloji (Diş Eti)';
  if (t.includes('protez') || t.includes('protetik')) return 'Protez (Diş Protezi)';
  if (t.includes('restoratif') || t.includes('dolgu')) return 'Restoratif Diş Tedavisi (Dolgu)';
  if (t.includes('implant')) return 'İmplantoloji (İmplant)';
  return 'Genel Diş Hekimliği';
}

// Ünvan — akademik ünvanları korur (Prof./Doç./Dr. Öğr. Üyesi vb.)
function normUnvan(u = '') {
  const t = trDown(u).replace(/\s+/g, ' ').trim();
  if (t.includes('prof')) return 'Prof. Dr.';
  if (t.includes('doç')) return 'Doç. Dr.';
  if (t.includes('öğr. üye') || (t.includes('öğr') && t.includes('üye')) || t.includes('dr. öğr')) return 'Dr. Öğr. Üyesi';
  if (t.includes('öğr. gör') || (t.includes('öğr') && t.includes('gör'))) return 'Öğr. Gör. Dr.';
  if (t.includes('uzm')) return 'Uzm. Dr.';
  if (t.includes('dr') && t.includes('dt')) return 'Dr. Dt.';
  if (t === 'dt.' || t === 'dt' || t.includes('dt')) return 'Dt.';
  if (t.includes('dr')) return 'Dr.';
  return 'Dt.';
}

// CSV hastane adı → { il, ilce, tel }
const HOSP = {
  'Yeditepe Üniversitesi Diş Hastanesi':   { il: 'İstanbul', ilce: 'Kadıköy',  tel: '444 9 347' },
  'Medipol Mega Üniversite Hastanesi':     { il: 'İstanbul', ilce: 'Bağcılar', tel: '0850 811 32 74' },
  'Okan Üniversitesi Hastanesi':           { il: 'İstanbul', ilce: 'Tuzla',    tel: null },
};

(async () => {
  const rows = parseCSV(fs.readFileSync(FILE, 'utf8')).filter(r => r.length >= 4 && r[0].trim());
  const header = rows.shift();
  const IDX = {
    hosp:  header.findIndex(h => /üniversite/i.test(h)),
    bolum: header.findIndex(h => /bölüm|anabilim/i.test(h)),
    unvan: header.findIndex(h => /unvan|ünvan/i.test(h)),
    name:  header.findIndex(h => /adı soyadı|ad soyad/i.test(h)),
  };
  console.log(`CSV: ${rows.length} hekim satırı | IDX=${JSON.stringify(IDX)}\n`);

  // Mevcut doktorlar: max id + name+clinic dedup + slug seti
  let all = [], from = 0;
  for (;;) { const { data } = await sb.from('doktorlar').select('id,slug,ad,soyad,clinic_name').range(from, from + 999); if (!data || !data.length) break; all = all.concat(data); if (data.length < 1000) break; from += 1000; }
  let maxD = 0; const usedSlugs = new Set(); const existKey = new Set();
  all.forEach(d => { const m = /^d(\d+)$/.exec(d.id); if (m) maxD = Math.max(maxD, +m[1]); if (d.slug) usedSlugs.add(d.slug); existKey.add(slug(`${d.ad} ${d.soyad} ${d.clinic_name || ''}`)); });
  const uslug = base => { let s = base || 'dr'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  const doktorlar = []; const atlanan = []; let n = maxD;
  for (const r of rows) {
    const hName = (r[IDX.hosp] || '').trim();
    const fullName = titleName(r[IDX.name]);
    if (!fullName || fullName.length < 3) { atlanan.push('(isimsiz)'); continue; }
    const hosp = HOSP[hName];
    if (!hosp) { atlanan.push(`(hastane eşleşmedi: ${hName})`); continue; }
    const key = slug(`${fullName} ${hName}`);
    if (existKey.has(key)) { atlanan.push(fullName); continue; }
    existKey.add(key);

    const parts = fullName.split(' ');
    const soyad = parts.length > 1 ? parts.pop() : '';
    const ad = parts.join(' ');
    const spec = specFromBolum(r[IDX.bolum] || '');
    n += 1; const id = `d${n}`;
    const s = uslug(slug(`${ad} ${soyad} ${hosp.il}`));
    doktorlar.push({
      id, ad, soyad, unvan: normUnvan(r[IDX.unvan]), spec,
      il: hosp.il, ilce: hosp.ilce, clinic_name: hName,
      tel: hosp.tel, tags: [TAG, spec], verified: false, rat: 0, rev: 0, fee: 0,
      slug: s,
    });
  }

  console.log(`Eklenecek hekim: ${doktorlar.length} | atlanan: ${atlanan.length}`);
  const byHosp = {}; doktorlar.forEach(d => byHosp[d.clinic_name] = (byHosp[d.clinic_name] || 0) + 1);
  Object.entries(byHosp).forEach(([h, c]) => console.log(`   ${c}  ${h}`));
  if (atlanan.length) console.log('atlanan örnek:', atlanan.slice(0, 8).join(' | '));

  if (!COMMIT) { console.log('\n[DRY-RUN] --commit ile yaz'); return; }
  for (let i = 0; i < doktorlar.length; i += 500) {
    const { error } = await sb.from('doktorlar').upsert(doktorlar.slice(i, i + 500), { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`✓ ${doktorlar.length} hekim eklendi (tags: ${TAG}).`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
