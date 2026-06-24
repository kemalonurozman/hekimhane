/**
 * HEKİMHANE — Klinik Geocoding
 * lat/lng = 0 olan klinikleri Nominatim (OpenStreetMap) ile kodlar
 * Kullanım: node scripts/geocode-klinikler.js [il]
 * Örnek:    node scripts/geocode-klinikler.js Antalya
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const hedefIl = process.argv[2] || null;
const DELAY_MS = 1100; // Nominatim: max 1 istek/sn

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(name, il, ilce, adres) {
  // Arama sorgusu: adres > klinik adı + ilçe + il
  const queries = [
    adres ? `${adres}, ${ilce || ''}, ${il || ''}, Turkey` : null,
    `${name}, ${ilce || ''}, ${il || ''}, Turkey`,
    `${name}, ${il || ''}, Turkey`,
  ].filter(Boolean);

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'tr' });

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' }
      });
      const data = await res.json();

      if (data && data[0]) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch(e) {}
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  console.log(`\n🗺️  Klinik Geocoding Başlıyor${hedefIl ? ` — ${hedefIl}` : ' (Tümü)'}...\n`);

  // Koordinatsız klinikleri çek
  // NULL ve 0 değerlerini yakala
  let query = supabase
    .from('klinikler')
    .select('id, name, il, ilce, adres')
    .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0');

  if (hedefIl) query = query.eq('il', hedefIl);

  const { data: klinikler, error } = await query.limit(2000);
  if (error) { console.error('❌ Sorgu hatası:', error.message); process.exit(1); }

  console.log(`📋 ${klinikler.length} koordinatsız klinik bulundu\n`);

  let basarili = 0, basarisiz = 0;

  for (let i = 0; i < klinikler.length; i++) {
    const k = klinikler[i];
    process.stdout.write(`[${i+1}/${klinikler.length}] ${k.name.slice(0,45).padEnd(45)} `);

    const coords = await geocode(k.name, k.il, k.ilce, k.adres);
    await sleep(DELAY_MS);

    if (coords) {
      const { error: updateErr } = await supabase
        .from('klinikler')
        .update({ lat: coords.lat, lng: coords.lng })
        .eq('id', k.id);

      if (updateErr) {
        console.log(`❌ güncelleme hatası`);
        basarisiz++;
      } else {
        console.log(`✅ ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        basarili++;
      }
    } else {
      console.log(`⚠️  bulunamadı`);
      basarisiz++;
    }
  }

  console.log(`\n✅ Tamamlandı: ${basarili} güncellendi, ${basarisiz} bulunamadı`);
}

main().catch(e => { console.error(e); process.exit(1); });
