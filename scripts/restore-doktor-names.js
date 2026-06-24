/**
 * Doktor isimlerini orijinal JS dosyasından geri yükler.
 * ad = f, soyad = l (ünvan ayrımı yok, isimler aynen korunur)
 * Eşleştirme: telefon numarası (normalize edilmiş)
 *
 * Kullanım: node scripts/restore-doktor-names.js
 * Önizleme: node scripts/restore-doktor-names.js --dry-run
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const dryRun = process.argv.includes('--dry-run');

// Telefon numarasını normalleştir — sadece rakamlar, başındaki 0 ve +90 kaldır
function normTel(tel) {
  if (!tel) return '';
  const digits = String(tel).replace(/\D/g, '');
  // +90 veya 090 ile başlıyorsa kaldır
  if (digits.startsWith('90') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0')  && digits.length === 11) return digits.slice(1);
  return digits;
}

async function main() {
  console.log(`\n👨‍⚕️ Doktor İsim Geri Yükleme${dryRun ? ' [DRY-RUN]' : ''}`);
  console.log('═'.repeat(60));

  // JS dosyasını oku ve parse et
  const jsPath = path.join(__dirname, '../../../uploads/doktorlar_data.js');
  // Alternatif: uploads klasörü yoksa aynı dizinde dene
  const altPath = path.join(__dirname, '../doktorlar_data.js');

  let filePath = fs.existsSync(jsPath) ? jsPath : altPath;
  if (!fs.existsSync(filePath)) {
    // Cowork uploads path
    filePath = '/sessions/gifted-gallant-bell/mnt/uploads/doktorlar_data.js';
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  // var DOCS=[...] formatını parse et
  const match = raw.match(/var DOCS\s*=\s*(\[[\s\S]*\]);/);
  if (!match) { console.error('❌ DOCS dizisi bulunamadı'); process.exit(1); }

  // JSON'a çevir — tek tırnak → çift tırnak
  let jsonStr = match[1]
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":')        // anahtar → "anahtar"
    .replace(/"(\w+)":/g, '"$1":')      // tekrar düzelt
    .replace(/,\s*\}/g, '}')            // trailing comma
    .replace(/,\s*\]/g, ']');

  let docs;
  try {
    docs = JSON.parse(jsonStr);
  } catch (e) {
    // Daha sağlam parse: eval
    const vm = require('vm');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(raw, ctx);
    docs = ctx.DOCS;
  }

  console.log(`\n📋 Dosyadan ${docs.length} kayıt okundu`);

  // Veritabanındaki doktorları çek
  const { data: dbDoctors, error } = await supabase
    .from('doktorlar')
    .select('id, ad, soyad, tel, unvan, spec');

  if (error) { console.error('❌ DB hatası:', error.message); process.exit(1); }
  console.log(`📊 Veritabanında ${dbDoctors.length} doktor\n`);

  // DB doktorlarını tel'e göre indexle
  const dbByTel = {};
  dbDoctors.forEach(d => {
    const n = normTel(d.tel);
    if (n) dbByTel[n] = d;
  });

  let updated = 0, notFound = 0, skipped = 0;

  for (const doc of docs) {
    // Diş Hekimlerini atla — onlar klinikler tablosunda
    if (doc.spec === 'Diş Hekimi') { skipped++; continue; }

    const telNorm = normTel(doc.tel);
    const match   = dbByTel[telNorm];

    if (!match) {
      // Tel ile bulunamadı — isim ile dene
      const adNorm   = (doc.f || '').toLowerCase().trim();
      const soyNorm  = (doc.l || '').toLowerCase().trim();
      const nameMatch = dbDoctors.find(d =>
        d.ad?.toLowerCase().includes(adNorm) &&
        d.soyad?.toLowerCase().includes(soyNorm)
      );

      if (!nameMatch) {
        notFound++;
        if (dryRun) console.log(`  ✗ Bulunamadı: ${doc.f} ${doc.l} (tel: ${doc.tel})`);
        continue;
      }

      // İsim eşleşmesi
      if (!dryRun) {
        await supabase.from('doktorlar').update({
          ad: doc.f, soyad: doc.l, unvan: null
        }).eq('id', nameMatch.id);
      }
      console.log(`  ✓ [isim] ${doc.f} ${doc.l}`);
      updated++;
      continue;
    }

    // Telefon eşleşmesi
    const newAd  = doc.f?.trim() || match.ad;
    const newSoy = doc.l?.trim() || match.soyad;

    if (!dryRun) {
      await supabase.from('doktorlar').update({
        ad: newAd, soyad: newSoy, unvan: null
      }).eq('id', match.id);
    }
    console.log(`  ✓ [tel] ${newAd} ${newSoy}`);
    updated++;
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Güncellendi:    ${updated}`);
  console.log(`✗  Bulunamadı:     ${notFound}`);
  console.log(`⏭  Atlandı (Diş): ${skipped}`);
  console.log('═'.repeat(60));

  if (dryRun) console.log('\nGerçek güncelleme için --dry-run olmadan çalıştırın.');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
