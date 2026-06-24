/**
 * HEKİMHANE — Diş Klinikleri Geocoding
 * type içinde 'diş' geçen, lat/lng = null veya 0 olan klinikleri
 * Nominatim (OpenStreetMap) ile adreslerinden koordinat alır.
 *
 * Kullanım:
 *   node scripts/geocode-dis-klinikleri.js
 *   node scripts/geocode-dis-klinikleri.js Ankara      (sadece Ankara)
 *   node scripts/geocode-dis-klinikleri.js --dry-run   (sadece listeler, güncelleme yapmaz)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const hedefIl = process.argv.find(a => !a.startsWith('-') && !a.includes('node') && !a.includes('.js')) || null;
const dryRun  = process.argv.includes('--dry-run');
const DELAY   = 1200; // Nominatim: max 1 istek/sn, 1.2s güvenli aralık

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Nominatim'den koordinat al — birden fazla sorgu dener, ilk başarılıyı döner
 */
async function geocode(name, il, ilce, adres) {
  const queries = [
    // En spesifik: tam adres
    adres && il  ? `${adres}, ${ilce || ''}, ${il}, Türkiye` : null,
    adres && !il ? `${adres}, Türkiye` : null,
    // Orta: klinik adı + ilçe + il
    il           ? `${name}, ${ilce || ''}, ${il}, Türkiye`  : null,
    // Geniş: sadece il
    il           ? `${name}, ${il}, Türkiye`                 : null,
    // Son çare: sadece isim
    `${name}, Türkiye`,
  ].filter(Boolean);

  for (const q of queries) {
    try {
      await sleep(DELAY);
      const url = 'https://nominatim.openstreetmap.org/search?' +
        new URLSearchParams({ q: q.trim(), format: 'json', limit: '1', countrycodes: 'tr' });

      const res  = await fetch(url, {
        headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' }
      });
      const data = await res.json();

      if (data?.[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          query: q,
        };
      }
    } catch (e) {
      // ağ hatası — devam et
    }
  }
  return null;
}

async function main() {
  console.log('\n🦷 Diş Klinikleri Geocoding' + (dryRun ? ' [DRY-RUN]' : '') + (hedefIl ? ` — ${hedefIl}` : ' — Tümü'));
  console.log('═'.repeat(60));

  // Koordinatsız diş kliniklerini çek
  let query = supabase
    .from('klinikler')
    .select('id, name, type, il, ilce, adres, lat, lng')
    .ilike('type', '%diş%')
    .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0')
    .order('il', { ascending: true });

  if (hedefIl) {
    query = query.ilike('il', `%${hedefIl}%`);
  }

  const { data: klinikler, error } = await query.limit(2000);

  if (error) {
    console.error('\n❌ Supabase sorgu hatası:', error.message);
    process.exit(1);
  }

  const withAddr    = klinikler.filter(k => k.adres && k.adres.trim());
  const withoutAddr = klinikler.filter(k => !k.adres || !k.adres.trim());

  console.log(`\n📋 Toplam koordinatsız: ${klinikler.length}`);
  console.log(`   ✓ Adresli: ${withAddr.length}  (adresten geocode edilecek)`);
  console.log(`   ✗ Adrессиз: ${withoutAddr.length}  (isim+il+ilçe ile denenecek)`);

  if (dryRun) {
    console.log('\n--- DRY-RUN listesi ---');
    klinikler.forEach((k, i) => {
      const adresStr = k.adres ? k.adres.slice(0, 40) : '(adres yok)';
      console.log(`${String(i+1).padStart(4)}. ${k.name.slice(0,40).padEnd(40)} | ${(k.il||'?').padEnd(12)} | ${adresStr}`);
    });
    console.log('\nGüncelleme yapmak için --dry-run olmadan çalıştırın.');
    return;
  }

  if (klinikler.length === 0) {
    console.log('\n✅ Tüm diş klinikleri zaten koordinatlı!');
    return;
  }

  console.log('\nBaşlıyor... (Nominatim hız limiti nedeniyle ~1.2 sn/kayıt)\n');

  let basarili = 0, basarisiz = 0, atlanan = 0;

  for (let i = 0; i < klinikler.length; i++) {
    const k = klinikler[i];
    const prefix = `[${String(i+1).padStart(4)}/${klinikler.length}]`;
    const displayName = k.name.slice(0, 38).padEnd(38);

    process.stdout.write(`${prefix} ${displayName} `);

    const coords = await geocode(k.name, k.il, k.ilce, k.adres);

    if (!coords) {
      console.log(`⚠️  bulunamadı`);
      basarisiz++;
      continue;
    }

    // Koordinat Türkiye sınırları içinde mi kontrol et
    if (coords.lat < 35.8 || coords.lat > 42.3 || coords.lng < 25.5 || coords.lng > 45.0) {
      console.log(`⚠️  geçersiz koordinat (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`);
      atlanan++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('klinikler')
      .update({ lat: coords.lat, lng: coords.lng, updated_at: new Date().toISOString() })
      .eq('id', k.id);

    if (updateErr) {
      console.log(`❌ güncelleme hatası: ${updateErr.message}`);
      basarisiz++;
    } else {
      console.log(`✅ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      basarili++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Başarılı:    ${basarili}`);
  console.log(`⚠️  Bulunamadı:  ${basarisiz}`);
  console.log(`⛔ Geçersiz:    ${atlanan}`);
  console.log(`📊 Toplam:      ${klinikler.length}`);
  console.log('═'.repeat(60));
  console.log('\nTamamlandı! Klinikler sayfasında harita artık noktaları gösterecek.');
}

main().catch(e => { console.error('\n❌ Beklenmedik hata:', e); process.exit(1); });
