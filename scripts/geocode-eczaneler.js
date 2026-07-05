/**
 * Eczane koordinatlarını Nominatim (OpenStreetMap) ile doldurur.
 *
 * İki aşama:
 *   node scripts/geocode-eczaneler.js --merkez   → ilçe merkezi koordinatı (hızlı, ~10 dk)
 *       Eczane adındaki "(İl İlçe)" kalıbından ilçeyi çıkarır; her benzersiz
 *       il+ilçe için TEK Nominatim sorgusu yapar, sonucu tüm eczanelerine yazar.
 *   node scripts/geocode-eczaneler.js --adres    → adres bazlı hassas koordinat (yavaş, saatler)
 *       Yalnızca "approx" işaretli kayıtları adresiyle tek tek sorgular.
 *
 * Durum scripts/.geocode-state.json dosyasında tutulur → kesintiye dayanıklı,
 * tekrar çalıştırılabilir. Nominatim kullanım politikası: 1 istek/sn.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STATE_FILE = path.join(__dirname, '.geocode-state.json');
const UA = 'Hekimhane/1.0 (https://hekimhane.com.tr; kemalonurozman@gmail.com)';
const SLEEP_MS = 1100;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
}
let saveCounter = 0;
function saveState(state, force = false) {
  if (!force && ++saveCounter % 20 !== 0) return;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

async function nominatim(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const arr = await res.json();
  if (!arr.length) return null;
  const lat = parseFloat(arr[0].lat), lng = parseFloat(arr[0].lon);
  // Türkiye sınırları dışıysa güvenme
  if (lat < 35 || lat > 43 || lng < 25 || lng > 45) return null;
  return { lat, lng };
}

async function tumEczaneler() {
  const hepsi = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('eczaneler')
      .select('id, name, il, ilce, address, lat, lng')
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    hepsi.push(...data);
    if (data.length < 1000) break;
  }
  return hepsi;
}

// "Emin Eczanesi (Ankara Çubuk)" → "Çubuk"  |  "(İstanbul Kadıköy)" → "Kadıköy"
function ilceCikar(name, il) {
  const m = (name || '').match(/\(([^)]+)\)\s*$/);
  if (!m) return null;
  let icerik = m[1].trim();
  if (il && icerik.toLowerCase().startsWith(il.toLowerCase())) {
    icerik = icerik.slice(il.length).trim();
  }
  return icerik || null;
}

async function pasMerkez() {
  const state = loadState();
  const eczaneler = (await tumEczaneler()).filter(e => (!e.lat || e.lat === 0) && !state[e.id]);
  console.log(`[merkez] işlenecek eczane: ${eczaneler.length}`);

  // il+ilçe → eczane grupları
  const gruplar = new Map();
  for (const e of eczaneler) {
    const ilce = e.ilce || ilceCikar(e.name, e.il);
    const key = `${e.il || ''}|${ilce || ''}`;
    if (!gruplar.has(key)) gruplar.set(key, { il: e.il, ilce, list: [] });
    gruplar.get(key).list.push(e);
  }
  console.log(`[merkez] benzersiz bölge: ${gruplar.size}`);

  let ok = 0, fail = 0, idx = 0;
  for (const { il, ilce, list } of gruplar.values()) {
    idx++;
    if (!il) { fail += list.length; continue; }
    const sorgu = ilce ? `${ilce}, ${il}, Türkiye` : `${il}, Türkiye`;
    let koord = null;
    try { koord = await nominatim(sorgu); } catch {}
    await sleep(SLEEP_MS);

    if (!koord && ilce) {
      // İlçe bulunamadıysa il merkezini dene
      try { koord = await nominatim(`${il}, Türkiye`); } catch {}
      await sleep(SLEEP_MS);
    }

    if (koord) {
      const ids = list.map(e => e.id);
      // 200'lük parçalarla güncelle
      for (let i = 0; i < ids.length; i += 200) {
        await supabase.from('eczaneler')
          .update({ lat: koord.lat, lng: koord.lng })
          .in('id', ids.slice(i, i + 200));
      }
      list.forEach(e => { state[e.id] = 'approx'; });
      ok += list.length;
    } else {
      list.forEach(e => { state[e.id] = 'miss-merkez'; });
      fail += list.length;
    }
    saveState(state);
    if (idx % 25 === 0) console.log(`[merkez] ${idx}/${gruplar.size} bölge — eczane ok:${ok} fail:${fail}`);
  }
  saveState(state, true);
  console.log(`[merkez] BİTTİ — koordinat yazılan: ${ok}, bulunamayan: ${fail}`);
}

async function pasAdres() {
  const state = loadState();
  const hedefler = (await tumEczaneler()).filter(e =>
    (state[e.id] === 'approx' || state[e.id] === 'miss-merkez') && e.address
  );
  console.log(`[adres] işlenecek eczane: ${hedefler.length} (~${Math.round(hedefler.length * SLEEP_MS / 60000)} dk)`);

  let ok = 0, fail = 0;
  for (let i = 0; i < hedefler.length; i++) {
    const e = hedefler[i];
    const ilce = e.ilce || ilceCikar(e.name, e.il);
    const adres = String(e.address).replace(/\s+/g, ' ').trim().slice(0, 120);
    const sorgu = [adres, ilce, e.il, 'Türkiye'].filter(Boolean).join(', ');

    let koord = null;
    try { koord = await nominatim(sorgu); } catch {}
    await sleep(SLEEP_MS);

    if (koord) {
      await supabase.from('eczaneler').update({ lat: koord.lat, lng: koord.lng }).eq('id', e.id);
      state[e.id] = 'precise';
      ok++;
    } else {
      state[e.id] = state[e.id] === 'approx' ? 'approx' : 'miss-adres'; // approx koordinatı koru
      fail++;
    }
    saveState(state);
    if ((i + 1) % 50 === 0) console.log(`[adres] ${i + 1}/${hedefler.length} — hassas:${ok} bulunamadı:${fail}`);
  }
  saveState(state, true);
  console.log(`[adres] BİTTİ — hassas koordinat: ${ok}, adresi çözülemeyen: ${fail} (ilçe merkezi korundu)`);
}

(async () => {
  const mod = process.argv.includes('--adres') ? 'adres' : 'merkez';
  console.log(`geocode-eczaneler başladı — mod: ${mod} — ${new Date().toLocaleString('tr-TR')}`);
  if (mod === 'merkez') await pasMerkez();
  else await pasAdres();
})().catch(err => { console.error('HATA:', err.message); process.exit(1); });
