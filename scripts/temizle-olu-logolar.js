/**
 * Ölü Google Places görsel URL'lerini temizler (lh3.googleusercontent.com/gps-cs-s/…
 * → 403). Her URL tek tek probe edilir; yalnız GERÇEKTEN ölü olanlar null'a çekilir
 * (klinikler.logo) veya photos dizisinden çıkarılır. Varsayılan kuru çalıştırma.
 *
 *   node scripts/temizle-olu-logolar.js            # rapor
 *   node scripts/temizle-olu-logolar.js --commit   # uygula
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const DESEN = /googleusercontent\.com\/gps-cs-s\//;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function canliMi(url) {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return r.status === 200 && (r.headers.get('content-type') || '').startsWith('image/');
  } catch { return false; }
}

// Eşzamanlılık sınırlı probe — 998 URL'yi ~40 sn'de tarar
async function probeHepsi(urls, limit = 25) {
  const sonuc = new Map(); let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < urls.length) { const u = urls[i++]; sonuc.set(u, await canliMi(u)); }
  }));
  return sonuc;
}

async function sayfali(tablo, secim, filtre) {
  const hepsi = []; let from = 0;
  for (;;) {
    let q = sb.from(tablo).select(secim).range(from, from + 999);
    if (filtre) q = filtre(q);
    const { data, error } = await q;
    if (error) throw error;
    hepsi.push(...(data || []));
    if (!data || data.length < 1000) break;
    from += 1000;
  }
  return hepsi;
}

(async () => {
  // 1) klinikler.logo
  const logolu = await sayfali('klinikler', 'id,name,logo', q => q.like('logo', '%googleusercontent.com/gps-cs-s%'));
  // 2) klinikler.photos içindeki gps-cs-s girdileri
  const fotolu = (await sayfali('klinikler', 'id,photos', q => q.not('photos', 'is', null)))
    .filter(k => Array.isArray(k.photos) && k.photos.some(p => DESEN.test(String(p))));

  const urls = [...new Set([...logolu.map(k => k.logo), ...fotolu.flatMap(k => k.photos.filter(p => DESEN.test(String(p))))])];
  console.log(`logo adayı: ${logolu.length} | photos adayı: ${fotolu.length} | tekil URL: ${urls.length} — probe ediliyor…`);
  const canli = await probeHepsi(urls);
  const olu = urls.filter(u => !canli.get(u));
  console.log(`sonuç: canlı ${urls.length - olu.length} | ölü ${olu.length}`);

  const logoTemizle = logolu.filter(k => !canli.get(k.logo));
  const fotoTemizle = fotolu.map(k => ({ id: k.id, yeni: k.photos.filter(p => !(DESEN.test(String(p)) && !canli.get(p))) }))
    .filter((x, i) => x.yeni.length !== fotolu[i].photos.length);
  console.log(`uygulanacak: ${logoTemizle.length} logo → null, ${fotoTemizle.length} photos dizisi ayıklanacak`);

  if (!COMMIT) { console.log('\nKuru çalıştırma. Uygulamak için: --commit'); return; }

  let n = 0;
  for (let i = 0; i < logoTemizle.length; i += 200) {
    const ids = logoTemizle.slice(i, i + 200).map(k => k.id);
    const { error } = await sb.from('klinikler').update({ logo: null }).in('id', ids);
    if (error) throw error; n += ids.length;
  }
  for (const f of fotoTemizle) {
    const { error } = await sb.from('klinikler').update({ photos: f.yeni.length ? f.yeni : null }).eq('id', f.id);
    if (error) throw error;
  }
  console.log(`✓ ${n} logo temizlendi, ${fotoTemizle.length} photos güncellendi.`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
