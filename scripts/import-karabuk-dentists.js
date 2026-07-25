/**
 * Apify Google Places (Karabük diş hekimleri) → Supabase import
 * Kullanım:
 *   node scripts/import-karabuk-dentists.js          # dry-run (sadece gösterir)
 *   node scripts/import-karabuk-dentists.js --commit # gerçekten yazar
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const FILE = process.argv.find(a => a.endsWith('.json'))
  || '/Users/onur/Downloads/dataset_crawler-google-places_2026-07-25_06-07-37-814.json';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function cleanName(t = '') {
  return t.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
}

function ilceFrom(r) {
  const s = `${r.city || ''} ${r.neighborhood || ''} ${r.address || ''}`.toLowerCase();
  if (s.includes('safranbolu')) return 'Safranbolu';
  if (s.includes('yenice')) return 'Yenice';
  if (s.includes('eskipazar')) return 'Eskipazar';
  if (s.includes('ovacık') || s.includes('ovacik')) return 'Ovacık';
  if (s.includes('eflani')) return 'Eflani';
  return 'Merkez';
}

function specsFrom(title = '') {
  const t = title.toLowerCase();
  const out = [];
  if (t.includes('ortodont')) out.push('Ortodonti (Diş Teli)');
  if (t.includes('implant') || t.includes('İmplant')) out.push('İmplantoloji (İmplant)');
  if (t.includes('çocuk') || t.includes('cocuk') || t.includes('pedodont')) out.push('Pedodonti (Çocuk Diş Hekimliği)');
  if (t.includes('cerrah')) out.push('Ağız Diş ve Çene Cerrahisi');
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
  console.log(`Kaynak: ${data.length} kayıt\n`);

  // Mevcut max id + mevcut slug'lar
  let maxId = 0; const existingSlugs = new Set();
  for (let from = 0; ; from += 1000) {
    const { data: rows, error } = await sb.from('klinikler').select('id,slug').range(from, from + 999);
    if (error) throw error;
    if (!rows.length) break;
    for (const r of rows) { const m = /^k(\d+)$/.exec(r.id); if (m) maxId = Math.max(maxId, +m[1]); if (r.slug) existingSlugs.add(r.slug); }
    if (rows.length < 1000) break;
  }
  console.log(`Mevcut max id: k${maxId} | mevcut slug sayısı: ${existingSlugs.size}\n`);

  const usedSlugs = new Set(existingSlugs);
  const uslug = base => { let s = base || 'dis-hekimi'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  const klinikler = []; const yorumlar = [];
  let n = maxId;

  for (const r of data) {
    n += 1;
    const id = `k${n}`;
    const name = cleanName(r.title || 'Diş Hekimi');
    const ilce = ilceFrom(r);
    const il = 'Karabük';
    const s = uslug([il, ilce, name].map(slug).filter(Boolean).join('-'));
    const revs = (r.reviews || []).filter(rv => (rv.text || rv.textTranslated || '').trim());
    const rat = typeof r.totalScore === 'number' ? r.totalScore
      : (revs.length ? +(revs.reduce((a, x) => a + (x.stars || 0), 0) / revs.length).toFixed(1) : 0);

    klinikler.push({
      id, name, type: 'Diş Hekimi', il, ilce,
      adres: r.address || null,
      lat: r.location?.lat || 0, lng: r.location?.lng || 0,
      tel: r.phone ? String(r.phone).trim() : (r.phoneUnformatted || null),
      website: r.website || null,
      maps_url: r.url || (r.cid ? `https://www.google.com/maps?cid=${r.cid}` : null),
      specs: specsFrom(name),
      rat, rev: r.reviewsCount || revs.length || 0,
      online: false, acil: false, claimed: false,
      slug: s,
      logo: r.imageUrl || null,
      cover: r.imageUrl || null,
    });

    for (const rv of revs) {
      yorumlar.push({
        entity_type: 'klinik', entity_id: id,
        author: (rv.name || 'Anonim').trim(),
        rating: rv.stars || rv.rating || 5,
        text: (rv.text || rv.textTranslated || '').trim(),
        date: revDate(rv),
        verified: false,
      });
    }
  }

  console.log('Eklenecek klinikler:');
  klinikler.forEach(k => console.log(`  ${k.id} | ${k.name} | ${k.il}/${k.ilce} | ★${k.rat} (${k.rev}) | tel:${k.tel ? 'var' : 'yok'} | slug:${k.slug}`));
  console.log(`\nToplam klinik: ${klinikler.length} | toplam yorum: ${yorumlar.length}`);

  if (!COMMIT) { console.log('\n[DRY-RUN] Yazmak için: node scripts/import-karabuk-dentists.js --commit'); return; }

  const { error: e1 } = await sb.from('klinikler').upsert(klinikler, { onConflict: 'id' });
  if (e1) throw e1;
  console.log(`\n✓ ${klinikler.length} klinik eklendi.`);
  const { error: e2 } = await sb.from('yorumlar').insert(yorumlar);
  if (e2) throw e2;
  console.log(`✓ ${yorumlar.length} yorum eklendi.`);
  console.log('\nBitti. Örnek: /klinikler/karabuk/merkez/' + klinikler[0].slug);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
