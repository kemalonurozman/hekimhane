/**
 * Apify Google Places (diş hekimleri) → Supabase import — HER İL için genel.
 * Kullanım:
 *   node scripts/import-apify-dentists.js <dosya.json>            # dry-run
 *   node scripts/import-apify-dentists.js <dosya.json> --commit   # yazar
 *
 * il = kaydın state alanından; ilce = city alanından türetilir.
 * Zaten var olan (aynı slug tabanı) kayıtlar atlanır → aynı dosya iki kez çalıştırılsa çift kayıt olmaz.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const FILE = process.argv.find(a => a.endsWith('.json'));
if (!FILE) { console.error('Dosya yolu gerekli: node scripts/import-apify-dentists.js <dosya.json> [--commit]'); process.exit(1); }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function cleanName(t = '') {
  let s = t.replace(/\s+/g, ' ').trim();
  if (s.includes('|')) s = s.split('|')[0].trim();              // "İsim | Eskişehir implant | ..." → "İsim"
  const dash = s.split(/\s+-\s+/);                              // "Frig Dent - Gülüş - İmplant - ..." (≥2 tire = doldurma)
  if (dash.length >= 3 && dash[0].length >= 4) s = dash[0].trim();
  return s.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
}
const titleTr = (s = '') => s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1).toLocaleLowerCase('tr') : s;

function ilFrom(r)  { return titleTr((r.state || r.city || 'Türkiye').split('/').pop().trim()); }

function ilceFrom(r) {
  let c = (r.city || '').trim();
  const state = (r.state || '').trim();
  if (c.includes('/')) c = c.split('/').pop().trim();               // "Filyos/Çaycuma" → "Çaycuma"
  if (state && c.toLowerCase().startsWith(state.toLowerCase())) c = c.slice(state.length).trim(); // "Zonguldak Merkez" → "Merkez"
  if (!c || /merkez/i.test(c)) return 'Merkez';
  return titleTr(c);
}

function specsFrom(title = '') {
  const t = title.toLowerCase();
  const out = [];
  if (t.includes('ortodont')) out.push('Ortodonti (Diş Teli)');
  if (t.includes('implant') || t.includes('İmplant')) out.push('İmplantoloji (İmplant)');
  if (t.includes('çocuk') || t.includes('cocuk') || t.includes('pedodont')) out.push('Pedodonti (Çocuk Diş Hekimliği)');
  if (t.includes('cerrah') || t.includes('çene')) out.push('Ağız Diş ve Çene Cerrahisi');
  if (t.includes('estetik') || t.includes('gülüş') || t.includes('gulus')) out.push('Estetik Diş Hekimliği');
  if (!out.length) out.push('Genel Diş Hekimliği');
  return out;
}

function revDate(rv) {
  const d = rv.publishedAtDate || '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${m[1]}-${m[2]}` : (d ? String(d).slice(0, 7) : null);
}

(async () => {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  console.log(`Kaynak: ${data.length} kayıt (${path.basename(FILE)})\n`);

  // Normalize: mükerrer tespiti için (isim + il), slug formatından bağımsız
  const norm = (s = '') => s.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const nameKey = (name, il) => `${norm(name)}|${norm(il)}`;

  let maxId = 0; const existingSlugs = new Set(); const existingKeys = new Set();
  for (let from = 0; ; from += 1000) {
    const { data: rows, error } = await sb.from('klinikler').select('id,slug,name,il').range(from, from + 999);
    if (error) throw error;
    if (!rows.length) break;
    for (const r of rows) {
      const m = /^k(\d+)$/.exec(r.id); if (m) maxId = Math.max(maxId, +m[1]);
      if (r.slug) existingSlugs.add(r.slug);
      if (r.name) existingKeys.add(nameKey(r.name, r.il || ''));
    }
    if (rows.length < 1000) break;
  }
  console.log(`Mevcut max id: k${maxId} | mevcut kayıt: ${existingKeys.size}\n`);

  const usedSlugs = new Set(existingSlugs);
  const uslug = base => { let s = base || 'dis-hekimi'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  const klinikler = []; const yorumlar = []; const atlanan = [];
  let n = maxId;

  for (const r of data) {
    const name = cleanName(r.title || 'Diş Hekimi');
    const il = ilFrom(r); const ilce = ilceFrom(r);
    const key = nameKey(name, il);
    const base = [il, ilce, name].map(slug).filter(Boolean).join('-');
    // isim+il veya slug tabanı zaten varsa atla (mükerrer önleme; farklı ilçe formatlarını da yakalar)
    if (existingKeys.has(key) || existingSlugs.has(base)) { atlanan.push(name); continue; }
    existingKeys.add(key);  // aynı dosyada tekrar gelirse de atla

    n += 1;
    const id = `k${n}`;
    const s = uslug(base);
    const revs = (r.reviews || []).filter(rv => (rv.text || rv.textTranslated || '').trim());
    // rev/rat = fiilen eklenen (Hekimhane'deki gerçek) yorumlardan — kart ve profil aynı sayıyı gösterir
    const rat = revs.length ? +(revs.reduce((a, x) => a + (x.stars || 0), 0) / revs.length).toFixed(1) : 0;

    klinikler.push({
      id, name, type: 'Diş Hekimi', il, ilce,
      adres: r.address || null,
      lat: r.location?.lat || 0, lng: r.location?.lng || 0,
      tel: r.phone ? String(r.phone).trim() : (r.phoneUnformatted || null),
      website: r.website || null,
      maps_url: r.url || (r.cid ? `https://www.google.com/maps?cid=${r.cid}` : null),
      specs: specsFrom(name),
      rat, rev: revs.length,
      online: false, acil: false, claimed: false,
      slug: s, logo: r.imageUrl || null, cover: r.imageUrl || null,
    });

    for (const rv of revs) {
      yorumlar.push({
        entity_type: 'klinik', entity_id: id,
        author: (rv.name || 'Anonim').trim(),
        rating: rv.stars || rv.rating || 5,
        text: (rv.text || rv.textTranslated || '').trim(),
        date: revDate(rv), verified: false,
      });
    }
  }

  console.log('Eklenecek klinikler:');
  klinikler.forEach(k => console.log(`  ${k.id} | ${k.name} | ${k.il}/${k.ilce} | ★${k.rat} (${k.rev}) | tel:${k.tel ? 'var' : 'yok'}`));
  if (atlanan.length) console.log(`\nAtlanan (zaten var): ${atlanan.length} → ${atlanan.slice(0, 5).join(', ')}${atlanan.length > 5 ? '…' : ''}`);
  console.log(`\nToplam klinik: ${klinikler.length} | toplam yorum: ${yorumlar.length}`);

  if (!COMMIT) { console.log('\n[DRY-RUN] Yazmak için: --commit ekleyin'); return; }
  if (!klinikler.length) { console.log('\nEklenecek yeni kayıt yok.'); return; }

  const { error: e1 } = await sb.from('klinikler').upsert(klinikler, { onConflict: 'id' });
  if (e1) throw e1;
  console.log(`\n✓ ${klinikler.length} klinik eklendi.`);
  const { error: e2 } = await sb.from('yorumlar').insert(yorumlar);
  if (e2) throw e2;
  console.log(`✓ ${yorumlar.length} yorum eklendi.`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
