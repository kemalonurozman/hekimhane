/**
 * HEKİMHANE — İl İl Toplu Geocoding
 * Koordinatsız kayıtları il il tarar, Nominatim ile doldurur.
 *
 * Kullanım:
 *   node scripts/geocode-by-il.js [tablo]
 *
 * Örnekler:
 *   node scripts/geocode-by-il.js doktorlar
 *   node scripts/geocode-by-il.js klinikler
 *   node scripts/geocode-by-il.js hastaneler
 *   node scripts/geocode-by-il.js eczaneler
 *   node scripts/geocode-by-il.js hepsi        ← tüm tablolar sırayla
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARG   = process.argv[2] || 'doktorlar';
const DELAY = 1150; // ms — Nominatim: max 1 istek/sn

const TABLOLAR = {
  klinikler:  { adres: 'adres',   isim: r => r.name },
  hastaneler: { adres: 'adres',   isim: r => r.name },
  eczaneler:  { adres: 'address', isim: r => r.name },
  doktorlar:  { adres: null,      isim: r => `${r.ad || ''} ${r.soyad || ''}`.trim() },
};

const HEDEF_TABLOLAR = ARG === 'hepsi'
  ? Object.keys(TABLOLAR)
  : [ARG];

if (!TABLOLAR[HEDEF_TABLOLAR[0]]) {
  console.error(`❌ Geçersiz tablo: "${ARG}". Seçenekler: ${Object.keys(TABLOLAR).join(', ')}, hepsi`);
  process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Nominatim ile koordinat bul ───────────────────────────────────
async function geocode(isim, il, ilce, adres) {
  const sorgular = [
    adres ? `${adres}, ${ilce || ''}, ${il || ''}, Turkey` : null,
    `${isim}, ${ilce || ''}, ${il || ''}, Turkey`,
    `${isim}, ${il || ''}, Turkey`,
  ].filter(Boolean);

  for (const q of sorgular) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'tr' });

      const res  = await fetch(url, { headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' } });
      const data = await res.json();
      if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {}
    await sleep(DELAY);
  }
  return null;
}

// ── İlleri listele ────────────────────────────────────────────────
async function getIller(tablo) {
  const { data, error } = await supabase
    .from(tablo)
    .select('il')
    .not('il', 'is', null)
    .or('lat.eq.0,lng.eq.0');

  if (error) throw error;
  const unique = [...new Set(data.map(r => r.il).filter(Boolean))].sort();
  return unique;
}

// ── Tek bir il için kayıtları geocode et ─────────────────────────
async function geocodeIl(tablo, il) {
  const cfg = TABLOLAR[tablo];

  const selectAlan = tablo === 'doktorlar'
    ? 'id, ad, soyad, il, ilce, clinic_name'
    : `id, name, il, ilce${cfg.adres ? `, ${cfg.adres}` : ''}`;

  const { data: kayitlar, error } = await supabase
    .from(tablo)
    .select(selectAlan)
    .eq('il', il)
    .or('lat.eq.0,lng.eq.0')
    .limit(2000);

  if (error) { console.error(`  ❌ Sorgu hatası: ${error.message}`); return { basarili: 0, basarisiz: 0 }; }
  if (kayitlar.length === 0) return { basarili: 0, basarisiz: 0 };

  let basarili = 0, basarisiz = 0;

  for (let i = 0; i < kayitlar.length; i++) {
    const k     = kayitlar[i];
    const isim  = cfg.isim(k);
    const adres = cfg.adres ? k[cfg.adres] : (k.clinic_name || null);

    process.stdout.write(`  [${i+1}/${kayitlar.length}] ${isim.slice(0, 38).padEnd(38)} `);

    const coords = await geocode(isim, k.il, k.ilce, adres);
    await sleep(DELAY);

    if (coords) {
      await supabase.from(tablo).update({ lat: coords.lat, lng: coords.lng }).eq('id', k.id);
      console.log(`✅ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      basarili++;
    } else {
      console.log(`⚠️  bulunamadı`);
      basarisiz++;
    }
    await sleep(DELAY);
  }

  return { basarili, basarisiz };
}

// ── Ana akış ─────────────────────────────────────────────────────
async function main() {
  const baslangic = Date.now();
  let genelBasarili = 0, genelBasarisiz = 0;

  for (const tablo of HEDEF_TABLOLAR) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🗺️  TABLO: ${tablo.toUpperCase()}`);
    console.log(`${'═'.repeat(60)}\n`);

    let iller;
    try {
      iller = await getIller(tablo);
    } catch (e) {
      console.error(`❌ İl listesi alınamadı: ${e.message}`);
      continue;
    }

    if (iller.length === 0) {
      console.log('✅ Bu tabloda koordinatsız kayıt yok!\n');
      continue;
    }

    console.log(`📍 ${iller.length} il bulundu: ${iller.join(', ')}\n`);

    let tabloBasarili = 0, tabloBasarisiz = 0;

    for (let i = 0; i < iller.length; i++) {
      const il = iller[i];
      console.log(`\n[${i+1}/${iller.length}] 📌 ${il}`);
      console.log(`${'─'.repeat(50)}`);

      const { basarili, basarisiz } = await geocodeIl(tablo, il);
      tabloBasarili   += basarili;
      tabloBasarisiz  += basarisiz;

      const toplam = basarili + basarisiz;
      if (toplam > 0) {
        console.log(`  → ${il}: ✅ ${basarili} / ⚠️  ${basarisiz} (${toplam} kayıt)`);
      } else {
        console.log(`  → ${il}: koordinatsız kayıt yok`);
      }
    }

    genelBasarili   += tabloBasarili;
    genelBasarisiz  += tabloBasarisiz;

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📊 ${tablo} ÖZET: ✅ ${tabloBasarili} güncellendi | ⚠️  ${tabloBasarisiz} bulunamadı`);
  }

  const sure = Math.round((Date.now() - baslangic) / 1000);
  const dk   = Math.floor(sure / 60);
  const sn   = sure % 60;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 TAMAMLANDI`);
  console.log(`   Toplam: ✅ ${genelBasarili} koordinat eklendi | ⚠️  ${genelBasarisiz} bulunamadı`);
  console.log(`   Süre  : ${dk > 0 ? `${dk} dk ` : ''}${sn} sn`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(e => { console.error('❌ Kritik hata:', e); process.exit(1); });
