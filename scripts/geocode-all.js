/**
 * HEKİMHANE — Tüm Tablolar Geocoding
 * Kullanım: node scripts/geocode-all.js [tablo] [il]
 * Örnekler:
 *   node scripts/geocode-all.js hastaneler
 *   node scripts/geocode-all.js eczaneler İstanbul
 *   node scripts/geocode-all.js klinikler
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLO   = process.argv[2] || 'klinikler';
const HEDEF_IL = process.argv[3] || null;
const DELAY_MS = 1100;

const TABLO_CONFIG = {
  klinikler:  { adresAlan: 'adres',   nameAlan: 'name' },
  hastaneler: { adresAlan: 'adres',   nameAlan: 'name' },
  eczaneler:  { adresAlan: 'address', nameAlan: 'name' },
  doktorlar:  { adresAlan: null,      nameAlan: null   },
};

if (!TABLO_CONFIG[TABLO]) {
  console.error(`❌ Geçersiz tablo: ${TABLO}. Seçenekler: klinikler, hastaneler, eczaneler`);
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(name, il, ilce, adres) {
  const sorgular = [
    adres ? `${adres}, ${ilce || ''}, ${il || ''}, Turkey` : null,
    `${name}, ${ilce || ''}, ${il || ''}, Turkey`,
    `${name}, ${il || ''}, Turkey`,
  ].filter(Boolean);

  for (const q of sorgular) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'tr' });

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' }
      });
      const data = await res.json();

      if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch(e) {}
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  console.log(`\n🗺️  ${TABLO} Geocoding${HEDEF_IL ? ` — ${HEDEF_IL}` : ' (Tümü)'}...\n`);

  const { adresAlan } = TABLO_CONFIG[TABLO];

  // Doktorlar için ad+soyad alanı farklı
  const selectAlan = TABLO === 'doktorlar'
    ? 'id, ad, soyad, il, ilce, spec, clinic_name'
    : `id, name, il, ilce${adresAlan ? `, ${adresAlan}` : ''}`;

  // NULL ve 0 değerlerini yakala: lat IS NULL VEYA lat = 0 VEYA lng IS NULL VEYA lng = 0
  let query = supabase
    .from(TABLO)
    .select(selectAlan)
    .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0');

  if (HEDEF_IL) query = query.eq('il', HEDEF_IL);

  const { data: kayitlar, error } = await query.limit(5000);
  if (error) { console.error('❌ Hata:', error.message); process.exit(1); }

  console.log(`📋 ${kayitlar.length} koordinatsız kayıt bulundu\n`);
  if (kayitlar.length === 0) { console.log('✅ Tüm koordinatlar zaten dolu!'); return; }

  const dakika = Math.ceil(kayitlar.length * DELAY_MS / 60000);
  console.log(`⏱  Tahmini süre: ~${dakika} dakika\n`);

  let basarili = 0, basarisiz = 0;

  for (let i = 0; i < kayitlar.length; i++) {
    const k = kayitlar[i];
    const isimStr = TABLO === 'doktorlar'
      ? `${k.ad || ''} ${k.soyad || ''}`.trim()
      : (k.name || '');
    const adres = adresAlan ? k[adresAlan] : (k.clinic_name || null);
    process.stdout.write(`[${i+1}/${kayitlar.length}] ${isimStr.slice(0,40).padEnd(40)} `);

    const coords = await geocode(isimStr, k.il, k.ilce, adres);
    await sleep(DELAY_MS);

    if (coords) {
      await supabase.from(TABLO).update({ lat: coords.lat, lng: coords.lng }).eq('id', k.id);
      console.log(`✅ ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      basarili++;
    } else {
      console.log(`⚠️  bulunamadı`);
      basarisiz++;
    }
    await sleep(DELAY_MS);

    // Her 50 kayıtta özet
    if ((i + 1) % 50 === 0) {
      console.log(`\n--- İlerleme: ${i+1}/${kayitlar.length} | ✅ ${basarili} | ⚠️  ${basarisiz} ---\n`);
    }
  }

  console.log(`\n✅ Tamamlandı: ${basarili} güncellendi, ${basarisiz} bulunamadı`);
}

main().catch(e => { console.error(e); process.exit(1); });
