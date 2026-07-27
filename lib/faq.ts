// ─────────────────────────────────────────────────────────────────
//  SSS (Sıkça Sorulan Sorular) üretimi — diş hekimi / klinik profilleri
//  Cevaplar sistemdeki gerçek veriden üretilir; eksik veri varsa ilgili
//  soru atlanır (asla sahte telefon/adres uydurulmaz).
// ─────────────────────────────────────────────────────────────────

export interface FaqItem { soru: string; cevap: string; }

export interface FaqInput {
  name: string;
  il?: string | null;
  ilce?: string | null;
  adres?: string | null;
  tel?: string | null;
  rat?: number | null;
  rev?: number | null;
  specs?: string[] | null;
  calisma_saatleri?: string | null;
}

// Türkçe-duyarlı küçük harf (İ→i, I→ı) — JS'in case-insensitive'i bunu yapmaz.
// toLocaleLowerCase('tr') combining-dot üretebildiği için elle map ediyoruz.
const trLower = (s: string) => s
  .replace(/İ/g, 'i').replace(/I/g, 'ı')
  .replace(/Ş/g, 'ş').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
  .toLowerCase();

// İlk harfi büyüt (Türkçe: i→İ, ı→I), gerisini küçült
const cap = (w: string) => {
  const lw = trLower(w);
  const f = lw.charAt(0);
  const F = f === 'i' ? 'İ' : f === 'ı' ? 'I' : f.toLocaleUpperCase('en');
  return F + lw.slice(1);
};

// Ünvan / etiket token'ları (kişi adı değil) — atılır
const LABELS = new Set([
  'dt', 'dr', 'uzm', 'prof', 'doç', 'doc', 'yrd', 'op', 'opr', 'özel', 'ozel',
  'diş', 'dis', 'dişhekimi', 'dishekimi', 'hekimi', 'hekim', 'ortodonti', 'ortodontist',
  'uzmanı', 'uzmani', 'çocuk', 'cocuk', 'pedodonti', 'çene', 'cene', 'cerrahı', 'cerrahi',
  'cerrahisi', 'ağız', 'agiz', 've', 'sağlığı', 'sagligi', 'sağlık', 'saglik', 'muayenehanesi',
]);

// Bu kelimelerden biri geçiyorsa kayıt bir işletme/kurumdur → kişi ismi çıkarma
const BUSINESS = /klinik|poliklinik|polikli|merkez|center|dental|group|grup|depo|hastane|muayenehane|şube|sube|beyazlat|implant|zirkonyum|estetik|akademi|academy/;

// İşletme adından kişi (diş hekimi) ad-soyadını çıkarmaya çalışır.
// Temiz bir kişi ismi bulunamazsa null döner → başlıkta işletme adı kullanılır.
export function extractDentistName(rawName: string): string | null {
  if (!rawName) return null;
  if (BUSINESS.test(trLower(rawName))) return null;

  // "A - B" gibi çift kayıtlarda ilk kişiyi al (boşluklu ayraç)
  const firstSeg = rawName.split(/\s*[–—|/]\s+|\s+-\s+/)[0];

  // token'lara ayır: boşluk, nokta, virgül, &
  const rawTokens = firstSeg.split(/[\s.,&]+/).filter(Boolean);
  const kept: string[] = [];
  for (const tok of rawTokens) {
    const n = trLower(tok).replace(/['’]/g, '');
    if (LABELS.has(n)) continue;
    if (n.length <= 1) continue;                       // baş harf (A. K.) → at
    if (!/^[a-zçğıöşü'’-]+$/.test(n)) return null;      // sayı/sembol → şüpheli, vazgeç
    kept.push(tok);
  }
  // Ad + (ikinci ad) + soyad → 2-3 kelime; fazlası birleşik/işletme demektir
  if (kept.length < 2 || kept.length > 3) return null;
  return kept.map(cap).join(' ');
}

export function buildKlinikFaq(input: FaqInput): FaqItem[] {
  const { name, il, ilce, adres, tel, rat, rev, specs, calisma_saatleri } = input;

  const person = extractDentistName(name);
  const label = person ? `Diş Doktoru ${person}` : name;
  const yer = [ilce, il].filter(Boolean).join(', ') || 'Türkiye';

  // Öncelik sırasına göre aday sorular; null olanlar elenir, ilk 5 alınır.
  // Sorular ek (' -den/-in) yerine "için / hakkında" kullanır → Türkçe uyumu bozulmaz.
  const candidates: (FaqItem | null)[] = [
    // 1) Adres
    {
      soru: `${label} nerede, adresi neresi?`,
      cevap: adres
        ? `${label}, ${yer} bölgesinde hizmet vermektedir. Adres: ${adres}. Konum ve yol tarifi için Hekimhane profil sayfasındaki haritayı kullanabilirsiniz.`
        : `${label}, ${yer} bölgesinde hizmet vermektedir. Detaylı adres ve konum bilgisine Hekimhane profil sayfasından ulaşabilirsiniz.`,
    },
    // 2) Randevu
    {
      soru: `${label} için nasıl randevu alabilirim?`,
      cevap: tel
        ? `Randevu almak için ${tel} numaralı telefondan doğrudan iletişime geçebilir ya da Hekimhane profil sayfası üzerinden iletişim bilgilerini görüntüleyebilirsiniz.`
        : `Randevu ve iletişim bilgilerine Hekimhane profil sayfası üzerinden ulaşabilir, uygun saatler için doğrudan iletişime geçebilirsiniz.`,
    },
    // 3) Telefon (yalnızca kayıtlı numara varsa)
    tel ? {
      soru: `${label} telefon numarası nedir?`,
      cevap: `${label} iletişim telefonu: ${tel}. Güncel iletişim bilgileri Hekimhane profil sayfasında yer almaktadır.`,
    } : null,
    // 4) Hizmet / uzmanlık (yalnızca specs varsa)
    (specs && specs.length) ? {
      soru: `${label} hangi tedavi ve hizmetleri sunuyor?`,
      cevap: `Başlıca sunulan hizmetler: ${specs.slice(0, 6).join(', ')}. Ayrıntılar ve güncel hizmet listesi için profil sayfasını inceleyebilirsiniz.`,
    } : null,
    // 5) Puan / yorum (yalnızca gerçek yorum varsa)
    (rev && rev > 0 && rat) ? {
      soru: `${label} hakkında hasta yorumları ve puanı nasıl?`,
      cevap: `${label}, ${rev} hasta değerlendirmesi sonucunda 5 üzerinden ${rat.toFixed(1)} puana sahiptir. Tüm hasta yorumlarını Hekimhane profil sayfasında okuyabilirsiniz.`,
    } : null,
    // 6) Bölge (dolgu — her zaman geçerli)
    {
      soru: `${label} hangi il ve ilçede hizmet veriyor?`,
      cevap: `${label}, ${yer} bölgesinde hasta kabul etmektedir.`,
    },
    // 7) Çalışma saatleri (yalnızca kayıtlıysa)
    calisma_saatleri ? {
      soru: `${label} çalışma saatleri nedir?`,
      cevap: `Çalışma saatleri: ${calisma_saatleri}. Güncel saatler için profil sayfasını kontrol etmenizi öneririz.`,
    } : null,
  ];

  return candidates.filter((x): x is FaqItem => x !== null).slice(0, 5);
}
