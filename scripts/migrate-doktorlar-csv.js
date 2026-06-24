/**
 * Doktorlar CSV Migration
 * CSV dosyasındaki verileri doktorlar tablosuna aktarır.
 * Mevcut tüm doktorları siler, CSV'den taze kayıt ekler.
 *
 * Kullanım:
 *   node scripts/migrate-doktorlar-csv.js            (tam migration)
 *   node scripts/migrate-doktorlar-csv.js --dry-run  (önizleme, DB dokunmaz)
 */

const path  = require('path');
const fs    = require('fs');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const dryRun = process.argv.includes('--dry-run');

// ── Türkçe slug ─────────────────────────────────────────────────────────────
function slugify(str) {
  if (!str) return '';
  return str
    .replace(/İ/g,'i').replace(/I/g,'i').replace(/Ğ/g,'g').replace(/ğ/g,'g')
    .replace(/Ş/g,'s').replace(/ş/g,'s').replace(/Ç/g,'c').replace(/ç/g,'c')
    .replace(/Ö/g,'o').replace(/ö/g,'o').replace(/Ü/g,'u').replace(/ü/g,'u')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeSlug(ad, soyad, il, ilce) {
  const parts = [il, ilce, ad, soyad].filter(Boolean).map(slugify);
  return parts.join('-');
}

// ── Yardımcılar ──────────────────────────────────────────────────────────────
function bool(val) {
  if (!val) return false;
  return val.trim().toLowerCase() === 'evet';
}

function num(val, defaultVal = 0) {
  const n = parseFloat((val || '').replace(',', '.'));
  return isNaN(n) ? defaultVal : n;
}

function splitArr(val) {
  if (!val || !val.trim()) return [];
  return val.split(';').map(s => s.trim()).filter(Boolean);
}

// ── CSV parse ────────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const raw   = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''); // BOM kaldır
  const lines = raw.split('\n').filter(l => l.trim());
  const rows  = [];

  for (let i = 1; i < lines.length; i++) {
    // Noktalı virgülle böl ama tırnak içindeki virgülleri koru
    const cols = [];
    let cur = '', inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ';' && !inQ) { cols.push(cur.trim().replace(/^"|"$/g,'')); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim().replace(/^"|"$/g,''));

    // Sütun sırası (CSV başlığına göre):
    // 0:ID 1:Ad 2:Soyad 3:Uzmanlık 4:Şehir 5:İlçe 6:Klinik/Adres
    // 7:Telefon 8:Tel(Link) 9:Puan 10:Yorum 11:Ücret 12:Deneyim
    // 13:Premium 14:Online 15:Onaylı 16:Etiketler 17:Enlem 18:Boylam
    // 19:HastaneKodu 20:Unvan 21:Bio 22:Eğitim 23:UzmanlıkAlanları
    // 24:Tedaviler 25:Sigorta 26:HastalıkTedaviler 27:RandevuURL 28:ProfilOnaylı

    if (cols.length < 8) continue;

    rows.push({
      csv_id:     cols[0] || '',
      ad:         cols[1] || '',
      soyad:      cols[2] || '',
      spec:       cols[3] || '',
      il:         cols[4] || '',
      ilce:       cols[5] || '',
      clinic_name:cols[6] || '',
      tel:        (cols[7] || '').replace(/\s+/g,''),
      rat:        num(cols[9], 4.5),
      rev:        Math.round(num(cols[10], 0)),
      fee:        num(cols[11], 0),
      exp:        Math.round(num(cols[12], 0)),
      premium:    bool(cols[13]),
      online:     bool(cols[14]),
      verified:   bool(cols[15]),
      tags:       splitArr(cols[16]),
      lat:        num(cols[17], 0) || null,
      lng:        num(cols[18], 0) || null,
      unvan:      cols[20] || null,
      bio:        cols[21] || null,
      okul:       cols[22] || null,
      specs:      splitArr(cols[23]),
      sigorta:    splitArr(cols[25]),
    });
  }
  return rows;
}

// ── Ana ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🏥 Doktorlar CSV Migration${dryRun ? ' [DRY-RUN]' : ''}`);
  console.log('═'.repeat(60));

  // CSV yolu: komut satırından veya proje kökünden al
  const argPath = process.argv.find(a => a.endsWith('.csv'));
  const defaultPath = path.join(__dirname, '../doktorlar.csv');
  const csvPath = argPath || defaultPath;

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV dosyası bulunamadı: ${csvPath}`);
    console.error('   Kullanım: node scripts/migrate-doktorlar-csv.js dosya.csv');
    console.error('   Veya doktorlar.csv dosyasını proje köküne kopyalayın.');
    process.exit(1);
  }
  console.log(`📂 CSV: ${csvPath}`);

  const rows    = parseCSV(csvPath);
  console.log(`📋 CSV'den ${rows.length} doktor okundu`);

  if (dryRun) {
    console.log('\nÖnce 5 kayıt:');
    rows.slice(0, 5).forEach(r => {
      console.log(`  ${r.ad} ${r.soyad} | ${r.spec} | ${r.il}/${r.ilce} | tel:${r.tel} | lat:${r.lat}`);
    });
    console.log('\nGerçek migration için --dry-run olmadan çalıştırın.');
    return;
  }

  // 1. Mevcut doktorları sil
  console.log('\n🗑  Mevcut doktorlar siliniyor...');
  const { error: delErr } = await supabase.from('doktorlar').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) { console.error('❌ Silme hatası:', delErr.message); process.exit(1); }
  console.log('   ✓ Silindi');

  // 2. Slug tekrar sayacı (aynı isimden birden fazla varsa -2, -3 ekle)
  const slugCount = {};
  function uniqueSlug(base) {
    slugCount[base] = (slugCount[base] || 0) + 1;
    return slugCount[base] === 1 ? base : `${base}-${slugCount[base]}`;
  }

  // 3. Toplu insert (50'şer batch)
  const BATCH = 50;
  let inserted = 0, failed = 0;

  console.log('\n📥 Kayıtlar ekleniyor...');

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH).map(r => {
      const baseSlug = makeSlug(r.ad, r.soyad, r.il, r.ilce);
      return {
        id:          randomUUID(),
        ad:          r.ad,
        soyad:       r.soyad,
        spec:        r.spec || null,
        il:          r.il   || null,
        ilce:        r.ilce || null,
        clinic_name: r.clinic_name || null,
        tel:         r.tel  || null,
        rat:         r.rat,
        rev:         r.rev,
        fee:         r.fee,
        exp:         r.exp,
        premium:     r.premium,
        online:      r.online,
        verified:    r.verified,
        tags:        r.tags.length    ? r.tags    : null,
        lat:         r.lat,
        lng:         r.lng,
        unvan:       r.unvan || null,
        bio:         r.bio   || null,
        okul:        r.okul  || null,
        sigorta:     r.sigorta.length ? r.sigorta : null,
        slug:        uniqueSlug(baseSlug),
      };
    });

    const { error: insErr } = await supabase.from('doktorlar').insert(chunk);
    if (insErr) {
      console.error(`  ❌ Batch ${Math.floor(i/BATCH)+1} hatası:`, insErr.message);
      failed += chunk.length;
    } else {
      inserted += chunk.length;
      process.stdout.write(`  ✓ ${inserted}/${rows.length}\r`);
    }
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log(`✅ Eklendi:  ${inserted}`);
  if (failed) console.log(`❌ Hatalı:   ${failed}`);
  console.log('═'.repeat(60));
  console.log('\nTamamlandı! Doktorlar sayfasını yenileyin.');
}

main().catch(e => { console.error('❌ Beklenmedik hata:', e); process.exit(1); });
