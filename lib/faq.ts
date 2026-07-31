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

// ─────────────────────────────────────────────────────────────────
//  Eczane SSS — nöbetçilik, 24 saat, eczacı, adres, iletişim.
//  Cevaplar gerçek veriden üretilir; eksik alanların sorusu atlanır.
// ─────────────────────────────────────────────────────────────────

export interface EczaneFaqInput {
  name: string;
  il?: string | null;
  ilce?: string | null;
  adres?: string | null;
  tel?: string | null;
  pharmacist?: string | null;
  nobetci?: boolean | null;
  acik_24_saat?: boolean | null;
  rat?: number | null;
  rev?: number | null;
  calisma_saatleri?: string | null;
}

export function buildEczaneFaq(input: EczaneFaqInput): FaqItem[] {
  const { name, il, ilce, adres, tel, pharmacist, nobetci, acik_24_saat, rat, rev, calisma_saatleri } = input;
  const label = name;
  const yer = [ilce, il].filter(Boolean).join(', ') || 'Türkiye';

  const candidates: (FaqItem | null)[] = [
    // 1) Adres / konum
    {
      soru: `${label} nerede, adresi neresi?`,
      cevap: adres
        ? `${label}, ${yer} bölgesinde hizmet vermektedir. Adres: ${adres}. Konum ve yol tarifi için Hekimhane profil sayfasındaki haritayı kullanabilirsiniz.`
        : `${label}, ${yer} bölgesinde hizmet vermektedir. Konum ve yol tarifi bilgisine Hekimhane profil sayfasındaki haritadan ulaşabilirsiniz.`,
    },
    // 2) Nöbetçi mi? (kayıtlı nöbet durumuna göre)
    {
      soru: `${label} nöbetçi mi?`,
      cevap: nobetci
        ? `${label} şu anda nöbetçi eczane olarak hizmet vermektedir. Nöbet günleri değişebildiğinden, gitmeden önce güncel durumu Hekimhane profil sayfasından veya telefonla teyit etmenizi öneririz.`
        : `Nöbetçi eczane listeleri günlük olarak değişir. ${label} için güncel nöbet durumunu Hekimhane profil sayfasından kontrol edebilir, bölgenizdeki nöbetçi eczaneleri Eczaneler sayfasından görüntüleyebilirsiniz.`,
    },
    // 3) 24 saat açık mı? (yalnızca kayıtlıysa)
    acik_24_saat ? {
      soru: `${label} 24 saat açık mı?`,
      cevap: `${label} 24 saat (kesintisiz) hizmet vermektedir. Yine de gece saatlerinde gitmeden önce telefonla teyit etmeniz faydalı olur.`,
    } : null,
    // 4) Telefon (yalnızca kayıtlı numara varsa)
    tel ? {
      soru: `${label} telefon numarası nedir?`,
      cevap: `${label} iletişim telefonu: ${tel}. İlaç stoğu ve nöbet durumu gibi bilgileri arayarak öğrenebilirsiniz.`,
    } : null,
    // 5) Eczacı / sorumlu (yalnızca kayıtlıysa)
    pharmacist ? {
      soru: `${label} sorumlu eczacısı kimdir?`,
      cevap: `${label} sorumlu eczacısı ${pharmacist}'dır. İlaç danışmanlığı ve reçete işlemleri için eczaneye başvurabilirsiniz.`,
    } : null,
    // 6) Çalışma saatleri (yalnızca kayıtlıysa)
    calisma_saatleri ? {
      soru: `${label} çalışma saatleri nedir?`,
      cevap: `Çalışma saatleri: ${calisma_saatleri}. Güncel saatler ve nöbet günleri için profil sayfasını kontrol etmenizi öneririz.`,
    } : null,
    // 7) Puan / yorum (yalnızca gerçek yorum varsa)
    (rev && rev > 0 && rat) ? {
      soru: `${label} hakkında müşteri yorumları ve puanı nasıl?`,
      cevap: `${label}, ${rev} değerlendirme sonucunda 5 üzerinden ${rat.toFixed(1)} puana sahiptir. Tüm yorumları Hekimhane profil sayfasında okuyabilirsiniz.`,
    } : null,
    // 8) Bölge (dolgu — her zaman geçerli)
    {
      soru: `${label} hangi il ve ilçede bulunuyor?`,
      cevap: `${label}, ${yer} bölgesinde hizmet vermektedir. Aynı bölgedeki diğer eczaneleri ve nöbetçi eczaneleri Hekimhane Eczaneler sayfasından görüntüleyebilirsiniz.`,
    },
  ];

  return candidates.filter((x): x is FaqItem => x !== null).slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────
//  Doktor (uzman / aile hekimi) SSS — ad/soyad temiz olduğu için isim
//  çıkarımı gerekmez. Branşa (spec) özel soru + muayene ücreti/deneyim.
// ─────────────────────────────────────────────────────────────────

export interface DoktorFaqInput {
  ad: string;
  soyad: string;
  unvan?: string | null;
  spec?: string | null;
  il?: string | null;
  ilce?: string | null;
  clinic_name?: string | null;
  tel?: string | null;
  fee?: number | null;
  exp?: number | null;
  rat?: number | null;
  rev?: number | null;
  online?: boolean | null;
  calisma_saatleri?: string | null;
}

export function buildDoktorFaq(input: DoktorFaqInput): FaqItem[] {
  const { ad, soyad, unvan, spec, il, ilce, clinic_name, tel, fee, exp, rat, rev, online, calisma_saatleri } = input;

  const rawName = `${ad || ''} ${soyad || ''}`.trim();
  // ad/soyad bazı kayıtlarda bozuk işletme adı olabilir ("ZE DENT ... AŞ").
  // Temiz kişi ismi çıkarsa "Dr./ünvan Ad Soyad", çıkmazsa ham adı olduğu
  // gibi kullan (yanlış "Dr. ZE DENT AŞ" üretmemek için).
  const clean = extractDentistName(rawName);
  const label = clean
    ? (unvan ? `${unvan} ${clean}` : `Dr. ${clean}`)
    : (unvan ? `${unvan} ${rawName}` : rawName);
  const yer = [ilce, il].filter(Boolean).join(', ') || 'Türkiye';
  const yerCumle = clinic_name ? `${clinic_name}${yer ? ' (' + yer + ')' : ''}` : yer;

  const candidates: (FaqItem | null)[] = [
    // 1) Konum / muayene adresi
    {
      soru: `${label} nerede, muayene adresi neresi?`,
      cevap: `${label}, ${yerCumle} bölgesinde hasta kabul etmektedir. Konum, yol tarifi ve iletişim bilgileri için Hekimhane profil sayfasını kullanabilirsiniz.`,
    },
    // 2) Randevu
    {
      soru: `${label} için nasıl randevu alabilirim?`,
      cevap: tel
        ? `Randevu almak için ${tel} numaralı telefondan doğrudan iletişime geçebilir ya da Hekimhane profil sayfası üzerinden randevu ve iletişim bilgilerini görüntüleyebilirsiniz.`
        : `Randevu ve iletişim bilgilerine Hekimhane profil sayfası üzerinden ulaşabilir, uygun saatler için doğrudan iletişime geçebilirsiniz.`,
    },
    // 3) Branşa özel soru (yalnızca spec varsa)
    spec ? {
      soru: `${label} hangi alanda uzman ve hangi şikâyetlere bakar?`,
      cevap: `${label}, ${spec} alanında hizmet vermektedir. ${spec} ile ilgili şikâyet ve sağlık durumlarınız için randevu alarak muayene olabilirsiniz. Teşhis ve tedavi süreci muayene sonucunda hekiminiz tarafından belirlenir.`,
    } : null,
    // 4) Muayene ücreti (yalnızca kayıtlı ücret varsa)
    (fee && fee > 0) ? {
      soru: `${label} muayene ücreti ne kadar?`,
      cevap: `Muayene ücreti ${fee} TL'den başlamaktadır. Güncel ücret, ödeme ve anlaşmalı kurum bilgileri için Hekimhane profil sayfasını inceleyebilir ya da doğrudan iletişime geçebilirsiniz.`,
    } : null,
    // 5) Telefon (yalnızca kayıtlı numara varsa)
    tel ? {
      soru: `${label} telefon numarası nedir?`,
      cevap: `${label} iletişim telefonu: ${tel}. Güncel iletişim bilgileri Hekimhane profil sayfasında yer almaktadır.`,
    } : null,
    // 6) Puan / yorum (yalnızca gerçek yorum varsa)
    (rev && rev > 0 && rat) ? {
      soru: `${label} hakkında hasta yorumları ve puanı nasıl?`,
      cevap: `${label}, ${rev} hasta değerlendirmesi sonucunda 5 üzerinden ${rat.toFixed(1)} puana sahiptir. Tüm hasta yorumlarını Hekimhane profil sayfasında okuyabilirsiniz.`,
    } : null,
    // 7) Deneyim (yalnızca kayıtlıysa)
    (exp && exp > 0) ? {
      soru: `${label} kaç yıllık deneyime sahip?`,
      cevap: `${label}, ${spec ? spec + ' alanında ' : ''}${exp} yılı aşkın klinik deneyime sahiptir.`,
    } : null,
    // 8) Online görüşme (varsa)
    online ? {
      soru: `${label} online (uzaktan) muayene / görüşme yapıyor mu?`,
      cevap: `${label} online görüşme hizmeti sunmaktadır. Uygun saatler ve randevu için Hekimhane profil sayfasını kullanabilirsiniz.`,
    } : null,
    // 9) Çalışma saatleri (dolgu)
    calisma_saatleri ? {
      soru: `${label} çalışma saatleri nedir?`,
      cevap: `Çalışma saatleri: ${calisma_saatleri}. Güncel saatler için profil sayfasını kontrol etmenizi öneririz.`,
    } : null,
    // 10) Bölge (son dolgu)
    {
      soru: `${label} hangi il ve ilçede hizmet veriyor?`,
      cevap: `${label}, ${yer} bölgesinde hasta kabul etmektedir.`,
    },
  ];

  return candidates.filter((x): x is FaqItem => x !== null).slice(0, 5);
}
