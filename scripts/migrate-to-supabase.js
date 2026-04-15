/**
 * HEKİMHANE — Veri Migration Scripti
 * Mevcut JS data dosyalarını okur ve Supabase'e aktarır
 *
 * Kullanım:
 *   1. .env.local dosyasını oluşturun (örnek: .env.local.example)
 *   2. npm run migrate
 *
 * Gereksinim: SUPABASE_SERVICE_ROLE_KEY (admin yetkisi)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Türkçe → slug dönüşümü ──────────────────────────────────────
const TR_MAP = { ş:'s',Ş:'s',ı:'i',İ:'i',ğ:'g',Ğ:'g',ü:'u',Ü:'u',ö:'o',Ö:'o',ç:'c',Ç:'c' };
function toSlug(text = '') {
  return text.split('').map(c => TR_MAP[c] || c).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function klinikSlug(name, il, ilce) {
  return [il, ilce, name].filter(Boolean).map(toSlug).join('-');
}

// ── JS dosyasından veriyi oku ────────────────────────────────────
function readJsData(filepath, varName) {
  const raw = fs.readFileSync(filepath, 'utf8');
  // var/const VARNAME = [...]; formatını parse et
  const match = raw.match(new RegExp(`(?:var|const|let)\\s+${varName}\\s*=\\s*([\\s\\S]*?);\\s*$`, 'm'));
  if (!match) {
    // Son satırda ; olmayabilir
    const match2 = raw.match(new RegExp(`(?:var|const|let)\\s+${varName}\\s*=\\s*([\\s\\S]*)`));
    if (!match2) throw new Error(`${varName} bulunamadı: ${filepath}`);
    return eval(match2[1]);
  }
  return eval(match[1]);
}

// ── İlçe çözümleme (eski/yeni format uyumlu) ────────────────────
function getIl(k) {
  return k.state || k.city || null;  // Yeni format: state=il
}
function getIlce(k) {
  // Yeni format: city=ilçe, eski format: district=ilçe
  if (k.state) return k.city || k.district || null;
  return k.district || null;
}

// ── BATCH upsert (Supabase max 1000/batch) ───────────────────────
async function batchUpsert(table, records, batchSize = 500) {
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ ${table} batch ${i}-${i+batchSize} hatası:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  ${table}: ${inserted}/${records.length} kayıt işlendi...`);
    }
  }
  console.log(`\n  ✅ ${table}: ${inserted} kayıt aktarıldı`);
  return inserted;
}

// ================================================================
// 1. KLİNİKLER
// ================================================================
async function migrateKlinikler() {
  console.log('\n📋 Klinikler aktarılıyor...');
  const dataPath = path.join(__dirname, '../../data/klinikler_data.js');

  let raw = fs.readFileSync(dataPath, 'utf8');
  // Slug çakışmalarını önlemek için sayaç
  const slugMap = {};
  const uniqueSlug = (base) => {
    if (!slugMap[base]) { slugMap[base] = 1; return base; }
    slugMap[base]++;
    return `${base}-${slugMap[base]}`;
  };

  // Node.js'de eval ile parse
  raw = raw.replace(/^var ALL_KLINIKLER\s*=\s*/, 'global.__DATA__ = ');
  eval(raw);
  const rawData = global.__DATA__;
  delete global.__DATA__;

  const records = rawData.map(k => ({
    id:       k.id,
    name:     k.name,
    type:     k.type || null,
    il:       getIl(k),
    ilce:     getIlce(k),
    adres:    k.adres || null,
    lat:      k.lat || 0,
    lng:      k.lng || 0,
    tel:      k.tel ? String(k.tel) : null,
    website:  k.website || null,
    maps_url: k.maps || null,
    specs:    k.specs || [],
    rat:      k.rat || 4.5,
    rev:      k.rev || 0,
    online:   k.online || false,
    acil:     k.acil || false,
    claimed:  k.claimed || false,
    slug:     uniqueSlug(klinikSlug(k.name, getIl(k), getIlce(k))),
    logo:     k.logo || null,
    cover:    k.cover || null,
  }));

  console.log(`  Toplam ${records.length} kayıt hazır`);
  return batchUpsert('klinikler', records);
}

// ================================================================
// 2. HASTANELER
// ================================================================
async function migrateHastaneler() {
  console.log('\n🏥 Hastaneler aktarılıyor...');
  const dataPath = path.join(__dirname, '../../data/hastaneler_data.js');
  let raw = fs.readFileSync(dataPath, 'utf8');

  raw = raw.replace(/^(?:var|const)\s+(?:ALL_HASTANELER|HASTANELER)\s*=\s*/, 'global.__DATA__ = ');
  eval(raw);
  const rawData = global.__DATA__;
  delete global.__DATA__;

  const slugMap = {};
  const uniqueSlug = (base) => {
    if (!slugMap[base]) { slugMap[base] = 1; return base; }
    slugMap[base]++;
    return `${base}-${slugMap[base]}`;
  };

  const records = rawData.map(h => ({
    id:       h.id,
    name:     h.name,
    type:     h.type || null,
    il:       h.city || h.il || null,
    ilce:     h.district || h.ilce || null,
    adres:    h.adres || null,
    lat:      h.lat || 0,
    lng:      h.lng || 0,
    tel:      h.tel ? String(h.tel) : null,
    website:  h.website || null,
    maps_url: h.maps || null,
    specs:    h.specs || [],
    rat:      h.rat || 4.5,
    rev:      h.rev || 0,
    docs:     h.docs || 0,
    beds:     h.beds || 0,
    founded:  h.founded || null,
    claimed:  h.claimed || false,
    slug:     uniqueSlug(klinikSlug(h.name, h.city || h.il, h.district || h.ilce)),
    logo:     h.logo || null,
    cover:    h.cover || null,
  }));

  console.log(`  Toplam ${records.length} kayıt hazır`);
  return batchUpsert('hastaneler', records);
}

// ================================================================
// 3. DOKTORLAR
// ================================================================
async function migrateDoktorlar() {
  console.log('\n👨‍⚕️ Doktorlar aktarılıyor...');
  const dataPath = path.join(__dirname, '../../data/doktorlar_data.js');
  let raw = fs.readFileSync(dataPath, 'utf8');

  raw = raw.replace(/^(?:var|const)\s+(?:DOCS|DOKTORLAR)\s*=\s*/, 'global.__DATA__ = ');
  eval(raw);
  const rawData = global.__DATA__;
  delete global.__DATA__;

  const slugMap = {};
  const uniqueSlug = (base) => {
    if (!slugMap[base]) { slugMap[base] = 1; return base; }
    slugMap[base]++;
    return `${base}-${slugMap[base]}`;
  };

  const records = rawData.map(d => {
    const fullName = `${d.f || ''} ${d.l || ''}`.trim();
    return {
      id:          d.id,
      ad:          d.f || '',
      soyad:       d.l || '',
      spec:        d.spec || null,
      il:          d.city || null,
      ilce:        d.district || null,
      clinic_name: d.clinic || null,
      rat:         d.rat || 4.5,
      rev:         d.rev || 0,
      fee:         d.fee || 0,
      premium:     d.premium || false,
      online:      d.online || false,
      verified:    d.verified || false,
      tel:         d.tel ? String(d.tel) : null,
      tags:        d.tags || [],
      exp:         d.exp || 0,
      lat:         d.lat || 0,
      lng:         d.lng || 0,
      slug:        uniqueSlug(toSlug(`${d.spec || 'doktor'} ${fullName} ${d.city || ''}`)),
      photo:       d.photo || null,
    };
  });

  console.log(`  Toplam ${records.length} kayıt hazır`);
  return batchUpsert('doktorlar', records);
}

// ================================================================
// 4. ECZANELER
// ================================================================
async function migrateEczaneler() {
  console.log('\n💊 Eczaneler aktarılıyor...');
  const dataPath = path.join(__dirname, '../../data/eczaneler_data.js');
  let raw = fs.readFileSync(dataPath, 'utf8');

  raw = raw.replace(/^(?:var|const)\s+ECZANELER\s*=\s*/, 'global.__DATA__ = ');
  eval(raw);
  const rawData = global.__DATA__;
  delete global.__DATA__;

  const slugMap = {};
  const uniqueSlug = (base) => {
    if (!slugMap[base]) { slugMap[base] = 1; return base; }
    slugMap[base]++;
    return `${base}-${slugMap[base]}`;
  };

  const records = rawData.map(e => ({
    id:          e.id,
    name:        e.name,
    pharmacist:  e.pharmacist || null,
    il:          e.city || null,
    ilce:        e.district || null,
    address:     e.address || null,
    tel:         e.tel ? String(e.tel) : null,
    nobetci:     e.nobetci || false,
    chamber:     e.chamber || null,
    slug:        uniqueSlug(toSlug(`eczane ${e.name} ${e.city || ''}`)),
    lat:         e.lat || 0,
    lng:         e.lng || 0,
  }));

  console.log(`  Toplam ${records.length} kayıt hazır`);
  return batchUpsert('eczaneler', records);
}

// ================================================================
// 5. YORUMLAR
// ================================================================
async function migrateYorumlar() {
  console.log('\n💬 Yorumlar aktarılıyor...');
  const dataPath = path.join(__dirname, '../../data/reviews_db.js');
  let raw = fs.readFileSync(dataPath, 'utf8');

  // reviews_db.js formatı: var REVIEWS_DB = { 'k1': [{...},...], 'h1': ... }
  raw = raw.replace(/^(?:var|const)\s+REVIEWS_DB\s*=\s*/, 'global.__DATA__ = ');
  eval(raw);
  const db = global.__DATA__;
  delete global.__DATA__;

  const records = [];
  for (const [entityId, reviews] of Object.entries(db)) {
    const entityType = entityId.startsWith('h') ? 'hastane'
                     : entityId.startsWith('d') ? 'doktor'
                     : entityId.startsWith('e') ? 'eczane'
                     : 'klinik';
    for (const r of (reviews || [])) {
      records.push({
        entity_type: entityType,
        entity_id:   entityId,
        author:      r.author || 'Anonim',
        rating:      r.rating || 5,
        text:        r.text || null,
        date:        r.date || null,
        helpful:     r.helpful || 0,
        verified:    r.verified || false,
      });
    }
  }

  console.log(`  Toplam ${records.length} yorum hazır`);
  return batchUpsert('yorumlar', records);
}

// ================================================================
// ANA FONKSİYON
// ================================================================
async function main() {
  console.log('🚀 HEKİMHANE Migration Başlıyor...\n');

  // Bağlantı testi
  const { error: testErr } = await supabase.from('klinikler').select('id').limit(1);
  if (testErr) {
    console.error('❌ Supabase bağlantı hatası:', testErr.message);
    console.error('   .env.local dosyasını kontrol edin');
    process.exit(1);
  }
  console.log('✅ Supabase bağlantısı başarılı\n');

  const start = Date.now();

  try {
    await migrateKlinikler();
    await migrateHastaneler();
    await migrateDoktorlar();
    await migrateEczaneler();
    await migrateYorumlar();
  } catch (err) {
    console.error('\n❌ Migration hatası:', err.message);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Migration tamamlandı! Süre: ${elapsed}s`);
  console.log('\n📊 Supabase Dashboard\'dan verileri kontrol edin:');
  console.log('   https://supabase.com/dashboard/project/_/editor\n');
}

main();
