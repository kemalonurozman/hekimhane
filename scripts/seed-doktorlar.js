/**
 * HEKİMHANE — Doktor Seed Script
 * Tüm uzmanlık dallarında gerçekçi Türkçe doktor verisi üretir.
 *
 * Kullanım:
 *   node scripts/seed-doktorlar.js [--count=10000] [--dry-run]
 *
 * Örnekler:
 *   node scripts/seed-doktorlar.js
 *   node scripts/seed-doktorlar.js --count=20000
 *   node scripts/seed-doktorlar.js --dry-run   (upload yapmadan sayım göster)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const DRY_RUN = process.argv.includes('--dry-run');
const COUNT_ARG = process.argv.find(a => a.startsWith('--count='));
const HEDEF = COUNT_ARG ? parseInt(COUNT_ARG.split('=')[1]) : 12000;
const BATCH = 500;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── VERİ HAVUZLARI ───────────────────────────────────────────────

const ERKEK_ADLAR = [
  'Ahmet','Mehmet','Mustafa','Ali','Hasan','Hüseyin','İbrahim','Yusuf','Ömer','Murat',
  'Emre','Burak','Serkan','Kemal','Tarık','Volkan','Cem','Selim','Uğur','Ozan',
  'Tolga','Berk','Alp','Can','Deniz','Kaan','Ege','Taha','Furkan','Ramazan',
  'Ercan','Serdar','Onur','Sinan','Erdal','Orhan','Caner','Gökhan','Yasin','Barış',
  'Fatih','Ferhat','İlker','Oğuz','Soner','Tayfun','Harun','Kerem','Turan','Samet',
  'Kadir','Fikret','Süleyman','Osman','Rıza','Zeki','Nihat','Mete','Cengiz','Adnan',
];

const KADIN_ADLAR = [
  'Ayşe','Fatma','Zeynep','Emine','Hatice','Merve','Selin','Özlem','Burcu','Esra',
  'Elif','Neslihan','Gülcan','Sevgi','Pınar','Derya','Güneş','İrem','Yasemin','Arzu',
  'Ceren','Tuğba','Nilüfer','Berna','Serap','Gül','Aslı','Nuray','Figen','Melike',
  'Leyla','Selma','Meryem','Aysun','Gamze','Dilek','Sibel','Hülya','Reyhan','Serpil',
  'Şule','Nurgül','Özge','Tuba','Hilal','Şebnem','Mina','Alev','Gözde','Duygu',
];

const SOYADLAR = [
  'Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Yıldırım','Öztürk','Aydın','Özdemir',
  'Arslan','Doğan','Kılıç','Aslan','Çetin','Koç','Kurt','Avcı','Erdoğan','Aktaş',
  'Güneş','Bozkurt','Polat','Güler','Tekin','Korkmaz','Bulut','Karaoğlu','Kaplan','Duman',
  'Taş','Ekici','Ünlü','Bıyık','Soylu','Altun','Başaran','Korkut','Keskin','Tunç',
  'Yavuz','Çakır','Akçay','Gündüz','Ateş','Karadağ','Sarı','Erdem','Mutlu','Şimşek',
  'Toprak','Uzun','Bayrak','Demirci','Güven','Özkan','Elmas','Ural','Hoca','Gürbüz',
  'Taner','Sezer','Dinç','Türk','Arıkan','Acun','İnan','Özer','Toy','Kara',
];

const UNVANLAR = ['Dr.', 'Uzm. Dr.', 'Doç. Dr.', 'Prof. Dr.', 'Op. Dr.'];
const UNVAN_AGIRLIK = [0.45, 0.35, 0.10, 0.06, 0.04];

// 81 il + seçili ilçeler
const ILLER = [
  { il: 'İstanbul', ilceler: ['Kadıköy','Beşiktaş','Şişli','Bakırköy','Üsküdar','Maltepe','Pendik','Ataşehir','Fatih','Beyoğlu','Sarıyer','Bağcılar','Zeytinburnu','Sultangazi','Avcılar','Kartal','Tuzla','Çekmeköy','Eyüpsultan','Büyükçekmece'] },
  { il: 'Ankara', ilceler: ['Çankaya','Keçiören','Mamak','Yenimahalle','Etimesgut','Sincan','Altındağ','Pursaklar','Gölbaşı','Polatlı'] },
  { il: 'İzmir', ilceler: ['Konak','Bornova','Karşıyaka','Buca','Çiğli','Bayraklı','Karabağlar','Gaziemir','Menemen','Balçova'] },
  { il: 'Bursa', ilceler: ['Osmangazi','Yıldırım','Nilüfer','Mudanya','Gürsu','Kestel','Gemlik','İnegöl','Mustafakemalpaşa'] },
  { il: 'Antalya', ilceler: ['Muratpaşa','Kepez','Konyaaltı','Alanya','Manavgat','Serik','Döşemealtı','Aksu','Kumluca'] },
  { il: 'Adana', ilceler: ['Çukurova','Seyhan','Yüreğir','Sarıçam','Kozan','Ceyhan','İmamoğlu','Karataş'] },
  { il: 'Konya', ilceler: ['Meram','Selçuklu','Karatay','Ereğli','Akşehir','Beyşehir','Seydişehir','Cihanbeyli'] },
  { il: 'Gaziantep', ilceler: ['Şahinbey','Şehitkamil','Nizip','İslahiye','Nurdağı','Araban','Oğuzeli'] },
  { il: 'Kayseri', ilceler: ['Kocasinan','Melikgazi','Talas','Develi','Yahyalı','Tomarza','Pınarbaşı'] },
  { il: 'Mersin', ilceler: ['Mezitli','Yenişehir','Toroslar','Akdeniz','Tarsus','Silifke','Mut','Erdemli'] },
  { il: 'Trabzon', ilceler: ['Ortahisar','Akçaabat','Araklı','Of','Yomra','Arsin','Sürmene'] },
  { il: 'Diyarbakır', ilceler: ['Bağlar','Kayapınar','Sur','Yenişehir','Ergani','Bismil','Çermik'] },
  { il: 'Eskişehir', ilceler: ['Tepebaşı','Odunpazarı','Çifteler','Sivrihisar','Alpu'] },
  { il: 'Samsun', ilceler: ['Atakum','İlkadım','Canik','Tekkeköy','Bafra','Çarşamba','Vezirköprü'] },
  { il: 'Denizli', ilceler: ['Pamukkale','Merkezefendi','Çivril','Acıpayam','Tavas','Honaz'] },
  { il: 'Sakarya', ilceler: ['Adapazarı','Serdivan','Erenler','Akyazı','Karasu','Hendek'] },
  { il: 'Kocaeli', ilceler: ['İzmit','Gebze','Körfez','Darıca','Gölcük','Başiskele','Kartepe','Kandıra'] },
  { il: 'Malatya', ilceler: ['Battalgazi','Yeşilyurt','Darende','Doğanşehir','Arguvan'] },
  { il: 'Kahramanmaraş', ilceler: ['Dulkadiroğlu','Onikişubat','Türkoğlu','Elbistan','Afşin'] },
  { il: 'Van', ilceler: ['İpekyolu','Tuşba','Edremit','Erciş','Gürpınar'] },
  { il: 'Hatay', ilceler: ['Antakya','İskenderun','Defne','Samandağ','Kırıkhan','Reyhanlı'] },
  { il: 'Manisa', ilceler: ['Şehzadeler','Yunusemre','Akhisar','Salihli','Soma','Turgutlu'] },
  { il: 'Muğla', ilceler: ['Menteşe','Fethiye','Marmaris','Bodrum','Milas','Ortaca','Dalaman'] },
  { il: 'Tekirdağ', ilceler: ['Süleymanpaşa','Çorlu','Ergene','Çerkezköy','Malkara'] },
  { il: 'Balıkesir', ilceler: ['Altıeylül','Karesi','Edremit','Bandırma','Gönen','Erdek'] },
  { il: 'Aydın', ilceler: ['Efeler','Kuşadası','Didim','Nazilli','Söke','İncirliova','Köşk'] },
  { il: 'Şanlıurfa', ilceler: ['Haliliye','Eyyübiye','Karaköprü','Siverek','Viranşehir','Birecik'] },
  { il: 'Mardin', ilceler: ['Artuklu','Kızıltepe','Midyat','Nusaybin','Derik'] },
  { il: 'Elazığ', ilceler: ['Merkez','Kovancılar','Karakoçan','Baskil','Arıcak'] },
  { il: 'Erzurum', ilceler: ['Yakutiye','Palandöken','Aziziye','Horasan','Oltu','Olur'] },
];

// Normalize edilmiş uzmanlıklar — ağırlıklı (yaygın uzmanlıklar daha fazla doktor alır)
// [uzmanlık, ağırlık] — toplam ağırlık ne kadar yüksekse o kadar çok doktor
const UZMANLIKLAR_AGIRLIK = /** @type {[string, number][]} */ ([
  // Çok yaygın
  ['Aile Hekimliği', 12],
  ['Çocuk Sağlığı ve Hastalıkları', 10],
  ['İç Hastalıkları', 10],
  ['Kadın Hastalıkları ve Doğum', 9],
  ['Genel Cerrahi', 9],
  ['Ortopedi ve Travmatoloji', 8],
  ['Göz Hastalıkları', 8],
  ['Kardiyoloji', 7],
  ['Dermatoloji', 7],
  ['Kulak Burun Boğaz', 7],
  ['Diş Hekimi', 7],
  ['Nöroloji', 6],
  ['Psikiyatri', 6],
  ['Üroloji', 6],
  ['Gastroenteroloji', 5],
  ['Pratisyen Hekimlik', 5],
  // Orta
  ['Göğüs Hastalıkları', 4],
  ['Fizik Tedavi ve Rehabilitasyon', 4],
  ['Radyoloji', 4],
  ['Anesteziyoloji ve Reanimasyon', 4],
  ['Enfeksiyon Hastalıkları', 3],
  ['Endokrinoloji ve Metabolizma', 3],
  ['Kalp ve Damar Cerrahisi', 3],
  ['Plastik ve Rekonstrüktif Cerrahi', 3],
  ['Beyin ve Sinir Cerrahisi', 3],
  ['Hematoloji', 3],
  ['Romatoloji', 3],
  ['Nefroloji', 3],
  ['Acil Tıp', 3],
  ['Ağız ve Diş Sağlığı', 3],
  // Çocuk uzmanlıkları
  ['Çocuk Cerrahisi', 3],
  ['Çocuk Kardiyolojisi', 2],
  ['Çocuk Nörolojisi', 2],
  ['Çocuk Nefrolojisi', 2],
  ['Çocuk Endokrinolojisi', 2],
  ['Çocuk Hematoloji ve Onkoloji', 2],
  ['Çocuk Alerjisi', 2],
  ['Çocuk Göğüs Hastalıkları', 2],
  // Dal uzmanlıkları
  ['Tıbbi Onkoloji', 2],
  ['Göğüs Cerrahisi', 2],
  ['Nöroşirürji', 2],
  ['Patoloji', 2],
  ['Ortodonti', 2],
  ['İmplantoloji', 2],
  ['Çocuk Diş Hekimliği', 2],
  ['Beslenme ve Diyet', 2],
  ['Alerji ve İmmünoloji', 2],
  // Az yaygın
  ['Nükleer Tıp', 1],
  ['Radyasyon Onkolojisi', 1],
  ['Cerrahi Onkoloji', 1],
  ['Tıbbi Mikrobiyoloji', 1],
  ['Omurga Cerrahisi', 1],
  ['Perinatoloji', 1],
  ['Girişimsel Radyoloji', 1],
  ['Endoskopi', 1],
]);

// Weighted random için düz liste
const UZMANLIK_DEGERLERI = UZMANLIKLAR_AGIRLIK.map(([s]) => s);
const UZMANLIK_AGIRLIKLARI = UZMANLIKLAR_AGIRLIK.map(([, w]) => w);

// İl bazlı ağırlıklar (büyük şehirler daha fazla doktor)
const IL_AGIRLIK = [
  30, 20, 15, 8, 8, 5, 5, 5, 4, 4,  // ilk 10
  3, 3, 3, 3, 3, 3, 3, 2, 2, 2,     // 11-20
  2, 2, 2, 2, 2, 2, 2, 1, 1, 1,     // 21-30
];

// Poliklinik/hastane isimleri
const KLINIK_TIPLER = ['Kliniği','Polikliniği','Tıp Merkezi','Hastanesi','Sağlık Merkezi','Medical Center'];
const KLINIK_ON_EKLER = ['Özel','Medline','Acıbadem','Doğu','Batı','Merkez','Şehir','Yaşam','Sağlık','Umut','Hayat','Güven','Modern','Yeni'];

// ─── YARDIMCILAR ──────────────────────────────────────────────────

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndFloat(min, max, dec = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }

function weightedRnd(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

const TR_MAP = { ş:'s',Ş:'S',ı:'i',İ:'I',ğ:'g',Ğ:'G',ü:'u',Ü:'U',ö:'o',Ö:'O',ç:'c',Ç:'C' };
function slugify(t = '') {
  return t.split('').map(c => TR_MAP[c] || c).join('').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const slugMap = {};
function uniqueSlug(base) {
  const s = slugify(base);
  if (!slugMap[s]) { slugMap[s] = 1; return s; }
  return s + '-' + (++slugMap[s]);
}

function telefon(il) {
  const KODLAR = {
    'İstanbul': ['212','216'], 'Ankara': ['312'], 'İzmir': ['232'],
    'Bursa': ['224'], 'Antalya': ['242'], 'Adana': ['322'], 'Konya': ['332'],
    'Gaziantep': ['342'], 'Kayseri': ['352'], 'Mersin': ['324'],
  };
  const kodlar = KODLAR[il] || [String(rndInt(200, 499))];
  const kod = rnd(kodlar);
  return `0${kod} ${rndInt(200,999)} ${rndInt(10,99)} ${rndInt(10,99)}`;
}

function klinikIsmi(il) {
  return `${rnd(KLINIK_ON_EKLER)} ${il} ${rnd(KLINIK_TIPLER)}`;
}

// ─── DOKTOR ÜRET ──────────────────────────────────────────────────

function doktorUret(id, index) {
  const kadin = Math.random() < 0.40;
  const ad    = kadin ? rnd(KADIN_ADLAR) : rnd(ERKEK_ADLAR);
  const soyad = rnd(SOYADLAR);
  const unvan = weightedRnd(UNVANLAR, UNVAN_AGIRLIK);
  const spec  = weightedRnd(UZMANLIK_DEGERLERI, UZMANLIK_AGIRLIKLARI);

  // Büyük şehirlere ağırlık ver
  const ilIdx = weightedRnd(
    ILLER.map((_, i) => i),
    ILLER.map((_, i) => IL_AGIRLIK[i] || 1)
  );
  const ilObj = ILLER[ilIdx];
  const il    = ilObj.il;
  const ilce  = rnd(ilObj.ilceler);

  const rat = rndFloat(3.8, 5.0, 1);
  const rev = rndInt(0, 180);
  const exp = rndInt(1, 35);
  const fee = rndInt(3, 30) * 100; // 300-3000 TL
  const online  = Math.random() < 0.30;
  const premium = Math.random() < 0.15;
  const verified = Math.random() < 0.55;

  const clinic_name = klinikIsmi(il);
  const slug = uniqueSlug(`${spec} ${ad} ${soyad} ${il}`);

  return {
    id: `d-seed-${String(index).padStart(6,'0')}`,
    ad, soyad,
    spec,
    il, ilce,
    clinic_name,
    rat, rev, fee, exp,
    online, premium, verified,
    tel: telefon(il),
    lat: 0, lng: 0,  // geocode ayrıca çalıştırılır
    slug,
    photo: null,
    tags: [],
  };
}

// ─── MEVCUT SAYIYI KONTROL ET ─────────────────────────────────────

async function getMevcutSayi() {
  const { count } = await supabase.from('doktorlar').select('id', { count: 'exact', head: true });
  return count || 0;
}

// ─── UPLOAD ──────────────────────────────────────────────────────

async function upload(rows) {
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('doktorlar').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`\n  ❌ Hata (batch ${Math.floor(i/BATCH)+1}):`, error.message);
    } else {
      uploaded += batch.length;
      process.stdout.write(`\r  ⬆️  ${uploaded}/${rows.length} yüklendi...`);
    }
  }
  console.log('');
  return uploaded;
}

// ─── ANA AKIŞ ────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('👨‍⚕️  HEKİMHANE — Doktor Seed');
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — Supabase\'e yükleme yapılmayacak\n');
  }

  // Mevcut doktor sayısı
  const mevcut = await getMevcutSayi();
  console.log(`\n📊 Mevcut doktor sayısı: ${mevcut.toLocaleString('tr')}`);
  console.log(`🎯 Hedef toplam: ${HEDEF.toLocaleString('tr')}`);

  const eklenecek = Math.max(0, HEDEF - mevcut);
  if (eklenecek === 0) {
    console.log('\n✅ Hedef zaten karşılanmış, ek veri gerekmez.');
    return;
  }

  console.log(`➕ Eklenecek yeni doktor: ${eklenecek.toLocaleString('tr')}\n`);

  // Üret
  console.log('🔧 Doktor verileri üretiliyor...');
  const doktorlar = [];
  for (let i = 0; i < eklenecek; i++) {
    doktorlar.push(doktorUret(mevcut + i, mevcut + i));
  }

  // Uzmanlık dağılımı özeti
  const specSay = {};
  doktorlar.forEach(d => specSay[d.spec] = (specSay[d.spec] || 0) + 1);
  const topSpec = Object.entries(specSay).sort((a,b) => b[1]-a[1]).slice(0,10);
  console.log('\n📋 Uzmanlık dağılımı (ilk 10):');
  topSpec.forEach(([s,c]) => console.log(`  ${c.toString().padStart(5)} - ${s}`));
  console.log(`  ... (${Object.keys(specSay).length} uzmanlık toplam)\n`);

  // İl dağılımı
  const ilSay = {};
  doktorlar.forEach(d => ilSay[d.il] = (ilSay[d.il] || 0) + 1);
  const topIl = Object.entries(ilSay).sort((a,b) => b[1]-a[1]).slice(0,5);
  console.log('🏙️  Şehir dağılımı (ilk 5):');
  topIl.forEach(([il,c]) => console.log(`  ${c.toString().padStart(5)} - ${il}`));

  if (DRY_RUN) {
    console.log('\n✅ Dry run tamamlandı. Gerçek yükleme için --dry-run bayrağını kaldırın.');
    return;
  }

  // Upload
  console.log('\n🚀 Supabase\'e yükleniyor...');
  const uploaded = await upload(doktorlar);

  const yeniToplam = mevcut + uploaded;
  console.log('\n' + '─'.repeat(60));
  console.log(`✅ ${uploaded.toLocaleString('tr')} doktor eklendi`);
  console.log(`📊 Yeni toplam: ${yeniToplam.toLocaleString('tr')} doktor`);
  console.log('\n💡 Koordinat eklemek için:');
  console.log('   node scripts/geocode-by-il.js doktorlar');
  console.log('═'.repeat(60) + '\n');
}

main().catch(e => { console.error('❌ Kritik hata:', e); process.exit(1); });
