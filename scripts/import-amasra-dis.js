/**
 * Amasra Devlet Hastanesi — diş hekimleri (tekil ekleme)
 * Devlet Ağız ve Diş Sağlığı kategorisine dahil edilir:
 *   - hastane `hastaneler` tablosunda type='Devlet' (yoksa oluşturulur)
 *   - hekimler `doktorlar`'a tags=['devlet-dis-hastanesi', spec], clinic_name=hastane adı
 *   - verified=false, tel=hastane telefonu (profil "Hastaneyi Ara" butonu bunu kullanır)
 *   - standart /doktorlar aramasında tag ile gizli
 * Kullanım: node scripts/import-amasra-dis.js [--commit]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const TAG = 'devlet-dis-hastanesi';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// Türkçe-duyarlı küçük harf (İ→i combining-dot tuzağını elle map ile aşar)
const trDown = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ş/g, 'ş').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase();
const trUp1 = c => c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
const titleWord = w => w ? trUp1(trDown(w).charAt(0)) + trDown(w).slice(1) : w;
const titleName = s => (s || '').trim().replace(/\s+/g, ' ').split(' ').map(titleWord).join(' ');

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

// ── Hastane ve hekim verisi ──
const HOSPITAL = {
  name: 'Amasra Devlet Hastanesi',
  type: 'Devlet',
  il: 'Bartın',
  ilce: 'Amasra',
  adres: 'Kaleşah, Çeşmi Cihan 2 Sokak No:2 Amasra/Bartın',
  tel: '03783152198',
};
const HEKIMLER = [
  { name: 'Döne ÜNOĞLU',          unvan: 'Dt.', bolum: 'Genel Diş Polikliniği' },
  { name: 'Furkan Kadir ŞENOCAK', unvan: 'Dt.', bolum: 'Genel Diş Polikliniği' },
];

(async () => {
  // 1. Mevcut hekimler — max d-id, slug seti, name+clinic dedup anahtarları
  const docs = await pageAll('doktorlar', 'id,slug,ad,soyad,clinic_name');
  let maxD = 0; const usedSlugs = new Set(); const existKey = new Set();
  docs.forEach(d => {
    const m = /^d(\d+)$/.exec(d.id); if (m) maxD = Math.max(maxD, +m[1]);
    if (d.slug) usedSlugs.add(d.slug);
    existKey.add(slug(`${d.ad} ${d.soyad} ${d.clinic_name || ''}`));
  });
  const uslug = base => { let s = base || 'dr'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  // 2. Hastane — mevcut mu? (Amasra ilçesinde bir devlet hastanesi)
  const hosps = await pageAll('hastaneler', 'id,name,il,ilce,slug,adres,tel,type');
  let maxH = 0; const usedHSlugs = new Set();
  hosps.forEach(h => { const m = /^h(\d+)$/.exec(h.id); if (m) maxH = Math.max(maxH, +m[1]); if (h.slug) usedHSlugs.add(h.slug); });

  let hospital = hosps.find(h =>
    (h.il || '').toLowerCase().includes('bart') &&
    /amasra/i.test(`${h.name} ${h.ilce || ''}`) &&
    /hastane/i.test(h.name));
  let createHosp = null, updateHosp = null;

  if (hospital) {
    console.log(`Hastane mevcut: ${hospital.id} — ${hospital.name}`);
    const patch = { type: 'Devlet' };
    if (!hospital.adres) patch.adres = HOSPITAL.adres;
    if (!hospital.tel)   patch.tel   = HOSPITAL.tel;
    updateHosp = { id: hospital.id, patch };
  } else {
    maxH += 1;
    const id = `h${maxH}`;
    let s = slug(`${HOSPITAL.il}-${HOSPITAL.ilce}-${HOSPITAL.name}`);
    let base = s, i = 1; while (usedHSlugs.has(s)) s = `${base}-${++i}`; usedHSlugs.add(s);
    createHosp = { id, name: HOSPITAL.name, type: 'Devlet', il: HOSPITAL.il, ilce: HOSPITAL.ilce, adres: HOSPITAL.adres, tel: HOSPITAL.tel, slug: s, claimed: false, rat: 0, rev: 0 };
    hospital = createHosp;
    console.log(`Hastane oluşturulacak: ${id} — ${HOSPITAL.name} (slug: ${s})`);
  }

  // 3. Hekimleri kur
  const doktorlar = []; const atlanan = []; let n = maxD;
  for (const h of HEKIMLER) {
    const fullName = titleName(h.name);
    const spec = 'Genel Diş Hekimliği';
    const key = slug(`${fullName} ${hospital.name}`);
    if (existKey.has(key)) { atlanan.push(fullName); continue; }
    existKey.add(key);
    const parts = fullName.split(' ');
    const soyad = parts.length > 1 ? parts.pop() : '';
    const ad = parts.join(' ');
    n += 1; const id = `d${n}`;
    const s = uslug(slug(`${ad} ${soyad} ${hospital.il}`));
    doktorlar.push({
      id, ad, soyad, unvan: h.unvan, spec,
      il: hospital.il, ilce: hospital.ilce, clinic_name: hospital.name,
      tel: HOSPITAL.tel, tags: [TAG, spec], verified: false, rat: 0, rev: 0, fee: 0,
      slug: s,
    });
  }

  console.log(`\nEklenecek hekim: ${doktorlar.length} | atlanan (zaten var): ${atlanan.length}${atlanan.length ? ' → ' + atlanan.join(', ') : ''}`);
  doktorlar.forEach(d => console.log(`   ${d.id}  ${d.unvan} ${d.ad} ${d.soyad}  [${d.spec}]  ${d.slug}`));

  if (!COMMIT) { console.log('\n[DRY-RUN] Yazmak için --commit ekleyin.'); return; }

  if (createHosp) {
    const { error } = await sb.from('hastaneler').upsert([createHosp], { onConflict: 'id' });
    if (error) throw error;
    console.log(`✓ Hastane oluşturuldu: ${createHosp.id}`);
  } else if (updateHosp) {
    const { error } = await sb.from('hastaneler').update(updateHosp.patch).eq('id', updateHosp.id);
    if (error) throw error;
    console.log(`✓ Hastane güncellendi: ${updateHosp.id} (${JSON.stringify(updateHosp.patch)})`);
  }
  if (doktorlar.length) {
    const { error } = await sb.from('doktorlar').upsert(doktorlar, { onConflict: 'id' });
    if (error) throw error;
    console.log(`✓ ${doktorlar.length} hekim eklendi (tags: ${TAG}).`);
  }
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
