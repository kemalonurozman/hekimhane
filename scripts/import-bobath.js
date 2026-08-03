/**
 * Bobath Terapistleri (fizyoterapist) — kategori import
 *   - `doktorlar` tablosuna: spec='Fizyoterapist', tags=['bobath-terapisti','Fizyoterapist']
 *   - email + tel KAYITLI ama contact_hidden=true → herkese GİZLİ
 *     (kişi profilini sahiplenince/aktive edince veya admin açınca görünür)
 *   - verified=false, clinic_name=null (bireysel terapistler)
 *   - standart /doktorlar aramasında tag ile gizli; /bobath-terapistleri kategorisinde görünür
 *
 * ÖN KOŞUL: `add_bobath_contact.sql` migration'ı çalıştırılmış olmalı
 *           (doktorlar.email + doktorlar.contact_hidden kolonları).
 * Kullanım: node scripts/import-bobath.js [--commit]
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const FILE = path.join(__dirname, 'bobath-data.txt');
const TAG = 'bobath-terapisti';
const SPEC = 'Fizyoterapist';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const trDown = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ş/g, 'ş').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase();
const trUp1 = c => c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
const titleWord = w => w ? trUp1(trDown(w).charAt(0)) + trDown(w).slice(1) : w;
const titleName = s => (s || '').trim().replace(/\s+/g, ' ').split(' ').map(titleWord).join(' ');

// Konum etiketi → { il, ilce }. Bilinen ilçe-etiketleri ve yabancı yerler için özel eşleme.
const LOC_OVERRIDE = {
  'ALANYA':   { il: 'Antalya',  ilce: 'Alanya' },
  'ÇORLU':    { il: 'Tekirdağ', ilce: 'Çorlu' },
  'İSTANBUK': { il: 'İstanbul', ilce: '' },      // kaynak listedeki yazım hatası
};
function resolveLoc(label) {
  const raw = label.trim();
  if (LOC_OVERRIDE[raw]) return LOC_OVERRIDE[raw];
  // "İL / İLÇE" veya "İL - İLÇE"
  const parts = raw.split(/\s*[\/\-]\s*/);
  const il = titleName(parts[0]);
  const ilce = parts[1] ? titleName(parts[1]) : '';
  return { il, ilce };
}
// İsimden meslek ön-eki temizle (ERG., DKT.)
const stripPrefix = n => n.replace(/^\s*(ERG|DKT|DR|FZT|PT)\.?\s*/i, '').trim();

async function pageAll(table, cols) {
  let out = [], from = 0;
  for (;;) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + 999);
    if (error) throw error;
    if (!data || !data.length) break;
    out = out.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

(async () => {
  const lines = fs.readFileSync(FILE, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
  console.log(`Dosya: ${lines.length} satır\n`);

  // Mevcut doktorlar — max d-id, slug seti, email seti (dedup)
  const docs = await pageAll('doktorlar', 'id,slug,ad,soyad');
  let maxD = 0; const usedSlugs = new Set();
  docs.forEach(d => { const m = /^d(\d+)$/.exec(d.id); if (m) maxD = Math.max(maxD, +m[1]); if (d.slug) usedSlugs.add(d.slug); });
  const uslug = base => { let s = base || 'fzt'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  const doktorlar = []; const sorunlu = []; const seenEmail = new Set(); let n = maxD;
  const ilCount = {};
  for (const line of lines) {
    const [locRaw, nameRaw, emailRaw, telRaw] = line.split('|');
    if (!locRaw || !nameRaw) { sorunlu.push(`(eksik alan) ${line}`); continue; }
    const { il, ilce } = resolveLoc(locRaw);
    const fullName = titleName(stripPrefix(nameRaw));
    if (!fullName || fullName.length < 3) { sorunlu.push(`(isim) ${line}`); continue; }
    const email = (emailRaw || '').trim().toLowerCase() || null;
    const tel = (telRaw || '').trim() || null;
    if (email && seenEmail.has(email)) { sorunlu.push(`(mükerrer email) ${email}`); continue; }
    if (email) seenEmail.add(email);

    const parts = fullName.split(' ');
    const soyad = parts.length > 1 ? parts.pop() : '';
    const ad = parts.join(' ');
    n += 1; const id = `d${n}`;
    const s = uslug(slug(`${ad} ${soyad} ${il}`) || `fzt-${n}`);
    doktorlar.push({
      id, ad, soyad, unvan: 'Fzt.', spec: SPEC,
      il, ilce: ilce || null, clinic_name: null,
      tel, email, contact_hidden: true,
      tags: [TAG, SPEC], verified: false, rat: 0, rev: 0, fee: 0,
      slug: s,
    });
    ilCount[il] = (ilCount[il] || 0) + 1;
  }

  console.log(`Eklenecek terapist: ${doktorlar.length} | sorunlu: ${sorunlu.length}`);
  if (sorunlu.length) sorunlu.forEach(s => console.log('   ⚠ ' + s));
  console.log('\nİl dağılımı:');
  Object.entries(ilCount).sort((a, b) => b[1] - a[1]).forEach(([il, c]) => console.log(`   ${String(c).padStart(3)}  ${il}`));
  console.log('\nÖrnek (ilk 3):');
  doktorlar.slice(0, 3).forEach(d => console.log('  ', JSON.stringify({ id: d.id, ad: d.ad, soyad: d.soyad, il: d.il, ilce: d.ilce, email: d.email, tel: d.tel, slug: d.slug })));

  if (!COMMIT) { console.log('\n[DRY-RUN] Yazmak için --commit ekleyin (önce migration çalıştırılmalı).'); return; }

  for (let i = 0; i < doktorlar.length; i += 500) {
    const { error } = await sb.from('doktorlar').upsert(doktorlar.slice(i, i + 500), { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`✓ ${doktorlar.length} Bobath terapisti eklendi (tags: ${TAG}, contact_hidden=true).`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
