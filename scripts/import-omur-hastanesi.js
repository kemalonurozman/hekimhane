/**
 * Özel Ömür Hastanesi (Adana/Seyhan, klinikler k1270) hekim kadrosu importu.
 *
 * Kaynak: hastanenin kendi sitesindeki "Hekim Kadromuz" sayfası (27 hekim,
 * kullanıcı tarafından iletildi). Yalnız isim, unvan ve branş alınır —
 * fotoğraflar hastanenin sitesinden KOPYALANMAZ/bağlanmaz.
 *
 * Bağlantı modeli: doktorlar.clinic_name = kurumun adı (hastane profilleriyle
 * aynı). Klinik profili bu eşleşmeyle "Bünyedeki Hekimler" sekmesini gösterir.
 *
 *   node scripts/import-omur-hastanesi.js            → kuru çalıştırma
 *   node scripts/import-omur-hastanesi.js --commit   → yazar
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const KLINIK_ID = 'k1270';

// Hastane sitesindeki bölüm adı → sitedeki yerleşik branş adı (filtrelerde
// en çok kayıtla kullanılan yazım). Diş hekimleri "Diş Hekimliği": /doktorlar
// genel aramasından hariç (diş hekimleri /klinikler'de aranır), hastane
// kadrosunda ve kendi profil sayfalarında görünür.
const BRANS = {
  'Acil Servis': 'Acil Servis',
  'Ağız ve Diş Sağlığı': 'Diş Hekimliği',
  'Anesteziyoloji ve Reanimasyon': 'Anestezi ve Reanimasyon',
  'Beslenme ve Diyetetik': 'Beslenme ve Diyet',
  'Çocuk Sağlığı ve Hastalıkları': 'Çocuk Sağlığı ve Hastalıkları',
  'Dahiliye (İç Hastalıkları)': 'İç Hastalıkları',
  'Fizik Tedavi ve Rehabilitasyon': 'Fiziksel Tıp ve Rehabilitasyon',
  'Genel Cerrahi': 'Genel Cerrahi',
  'Göz Hastalıkları': 'Göz Hastalıkları',
  'Kadın Hastalıkları ve Doğum': 'Kadın Hastalıkları ve Doğum',
  'Kardiyoloji': 'Kardiyoloji',
  'Kulak Burun ve Boğaz (KBB)': 'Kulak Burun Boğaz Hastalıkları',
  'Nöroloji': 'Nöroloji',
  'Ortopedi ve Travmatoloji': 'Ortopedi ve Travmatoloji',
  'Psikiyatri (Ruh Sağlığı ve Hastalıkları)': 'Psikiyatri',
  'Radyoloji': 'Radyoloji',
  'Tıbbi Biyokimya (Laboratuvar)': 'Biyokimya',
  'Üroloji': 'Üroloji',
};

const KADRO = [
  ['Dr. Fatih Bayat', 'Acil Servis'],
  ['Dr. Hamdi Kahraman', 'Acil Servis'],
  ['Dr. Hashim Sharifi', 'Acil Servis'],
  ['Dr. İbrahim Halil Sakar', 'Acil Servis'],
  ['Dt. Melis Arslan', 'Ağız ve Diş Sağlığı'],
  ['Dt. Ozan Cem Kaşısarı', 'Ağız ve Diş Sağlığı'],
  ['Uzm. Dr. Kemal Şişik', 'Anesteziyoloji ve Reanimasyon'],
  ['Uzm. Dr. Pınar Turgut', 'Anesteziyoloji ve Reanimasyon'],
  ['Dyt. Helin Kaplan', 'Beslenme ve Diyetetik'],
  ['Uzm. Dr. Yahya Çerçi', 'Çocuk Sağlığı ve Hastalıkları'],
  ['Uzm. Dr. Mustafa Fazıl Yalçın', 'Dahiliye (İç Hastalıkları)'],
  ['Uzm. Dr. Hasan Ali Uyar', 'Fizik Tedavi ve Rehabilitasyon'],
  ['Uzm. Dr. Ömer Fıratoğlu', 'Fizik Tedavi ve Rehabilitasyon'],
  ['Uzm. Dr. Yalçın Ağar', 'Fizik Tedavi ve Rehabilitasyon'],
  ['Op. Dr. Civan Koca', 'Genel Cerrahi'],
  ['Uzm. Dr. Ahmet Kaya', 'Göz Hastalıkları'],
  ['Op. Dr. Derviş Uğur', 'Kadın Hastalıkları ve Doğum'],
  ['Op. Dr. Kadriye Sapmaz', 'Kadın Hastalıkları ve Doğum'],
  ['Uzm. Dr. Şükrü Karaca', 'Kardiyoloji'],
  ['Uzm. Dr. İsmail Seçerlioğlu', 'Kulak Burun ve Boğaz (KBB)'],
  ['Uzm. Dr. Ali Can Türküner', 'Nöroloji'],
  ['Op. Dr. Mehmet Arıkoğlu', 'Ortopedi ve Travmatoloji'],
  ['Uzm. Dr. Kadir İncikli', 'Psikiyatri (Ruh Sağlığı ve Hastalıkları)'],
  ['Uzm. Dr. Alpay Fevzi Ertan', 'Radyoloji'],
  ['Uzm. Dr. Bilal Kaya', 'Radyoloji'],
  ['Uzm. Dr. Akif Kemal Akay', 'Tıbbi Biyokimya (Laboratuvar)'],
  ['Op. Dr. Abidin Yıldırım', 'Üroloji'],
];

const UNVANLAR = ['Uzm. Dr.', 'Op. Dr.', 'Dr.', 'Dt.', 'Dyt.'];   // uzun önce
const TR = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u' };
const slugla = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const anahtar = (ad, soyad) => slugla(`${ad} ${soyad}`);

(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: klinik, error: kErr } = await sb.from('klinikler').select('id,name,il,ilce,tel,lat,lng').eq('id', KLINIK_ID).single();
  if (kErr || !klinik) throw new Error('Klinik bulunamadı: ' + (kErr && kErr.message));
  console.log(`Kurum: ${klinik.name} (${klinik.il}/${klinik.ilce}) · tel ${klinik.tel}`);

  // Tüm doktorlar: en büyük id, kullanılan slug'lar, bu kurumdaki mevcut isimler
  let tum = [], from = 0;
  for (;;) {
    const { data, error } = await sb.from('doktorlar').select('id,slug,ad,soyad,clinic_name').range(from, from + 999);
    if (error) throw error;
    if (!data || !data.length) break;
    tum = tum.concat(data); if (data.length < 1000) break; from += 1000;
  }
  let maxD = 0; const slugSet = new Set(); const mevcut = new Set();
  for (const d of tum) {
    const m = /^d(\d+)$/.exec(d.id); if (m) maxD = Math.max(maxD, +m[1]);
    if (d.slug) slugSet.add(d.slug);
    if (d.clinic_name === klinik.name) mevcut.add(anahtar(d.ad, d.soyad));
  }
  const tekilSlug = (taban) => { let s = taban, i = 1; while (slugSet.has(s)) s = `${taban}-${++i}`; slugSet.add(s); return s; };

  const eklenecek = [], atlanan = [];
  for (const [tam, bolum] of KADRO) {
    const unvan = UNVANLAR.find(u => tam.startsWith(u + ' '));
    if (!unvan) throw new Error('Unvan çözülemedi: ' + tam);
    const isim = tam.slice(unvan.length).trim().split(/\s+/);
    const soyad = isim.pop(); const ad = isim.join(' ');
    const spec = BRANS[bolum];
    if (!spec) throw new Error('Branş eşlemesi yok: ' + bolum);
    if (mevcut.has(anahtar(ad, soyad))) { atlanan.push(tam); continue; }
    maxD += 1;
    eklenecek.push({
      id: `d${maxD}`, ad, soyad, unvan, spec,
      il: klinik.il, ilce: klinik.ilce, clinic_name: klinik.name,
      tel: klinik.tel || null, lat: klinik.lat ?? null, lng: klinik.lng ?? null,
      tags: [spec], verified: false, rat: 0, rev: 0, fee: 0,
      slug: tekilSlug(slugla(`${unvan} ${ad} ${soyad} ${klinik.il}`)),
    });
  }

  console.log(`Eklenecek: ${eklenecek.length} · zaten kayıtlı (atlanan): ${atlanan.length}`);
  eklenecek.forEach(d => console.log(`  ${d.id}  ${d.unvan} ${d.ad} ${d.soyad}  ·  ${d.spec}  ·  /doktorlar/${d.slug}`));
  if (atlanan.length) console.log('  atlanan:', atlanan.join(', '));

  if (!COMMIT) { console.log('\n[KURU ÇALIŞTIRMA] yazmak için --commit'); return; }
  if (!eklenecek.length) { console.log('Yazılacak kayıt yok.'); return; }
  const { error } = await sb.from('doktorlar').insert(eklenecek);
  if (error) throw error;
  console.log(`\n✓ ${eklenecek.length} hekim eklendi → clinic_name="${klinik.name}"`);
})().catch(e => { console.error('HATA:', e.message); process.exit(1); });
