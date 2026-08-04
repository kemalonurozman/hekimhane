// ─────────────────────────────────────────────────────────────
// Hekimhane — Uzmanlık Alanları Verisi
// Panel'deki SpecPicker ve profil sayfasındaki chip linkleri için.
// ─────────────────────────────────────────────────────────────

import { toSlug } from './helpers';

export interface SpecGrubu {
  /** Kategori başlığı (ör. "Kadın Hastalıkları ve Doğum") */
  ad: string;
  /** /hastaliklar/{slug} için slug — yoksa fallback linki kullanılır */
  hastalikSlug?: string;
  /** Panel'de hangi işletme tipi bu grubu görür */
  entityTypes: Array<'doktor' | 'klinik' | 'hastane'>;
  /** Chip rengi */
  renk: string;
  /** Chip arka planı */
  bg: string;
  /** Bu gruptaki uzmanlık etiketleri */
  items: string[];
}

export const SPEC_GRUPLARI: SpecGrubu[] = [
  // ── Kadın Sağlığı ──────────────────────────────────────────
  {
    ad: 'Kadın Hastalıkları ve Doğum',
    hastalikSlug: 'kadin-sagligi',
    entityTypes: ['doktor', 'hastane'],
    renk: '#9D174D',
    bg: '#FDF2F8',
    items: [
      'Kadın Hastalıkları ve Doğum',
      'Gebelik Takibi',
      'Laparoskopik Cerrahi',
      'Kısırlık Tedavisi',
      'İnfertilite & Tüp Bebek',
      'Yüksek Riskli Gebelik',
      'Perinatoloji',
      'Ürojinekoloji',
      'HPV & Smear Testi',
      'Rahim İçi Araç (RİA)',
      'Menopoz Tedavisi',
      'Jinekolojik Onkoloji',
      'Genital Estetik',
    ],
  },

  // ── Diş Hekimliği ─────────────────────────────────────────
  {
    ad: 'Diş Hekimliği',
    hastalikSlug: 'dis-sagligi',
    entityTypes: ['klinik', 'hastane'],
    renk: '#0891B2',
    bg: '#ECFEFF',
    items: [
      // Uzmanlık dalları
      'Genel Diş Hekimliği',
      'Ortodonti (Diş Teli)',
      'İmplantoloji (İmplant)',
      'Endodonti (Kanal Tedavisi)',
      'Periodontoloji (Diş Eti)',
      'Pedodonti (Çocuk Diş Hekimliği)',
      'Ağız Diş ve Çene Cerrahisi',
      'Protez (Diş Protezi)',
      'Restoratif Diş Tedavisi (Dolgu)',
      'Ağız Diş ve Çene Radyolojisi',
      // Popüler tedaviler
      'Estetik Diş Hekimliği',
      'Diş Beyazlatma',
      'Zirkonyum Kaplama',
      'Lamina (Laminate Veneer)',
      'Şeffaf Plak (Invisalign)',
      'Gülüş Tasarımı',
      'Diş Taşı Temizliği',
      'Bruksizm (Diş Gıcırdatma)',
    ],
  },

  // ── Kardiyoloji ────────────────────────────────────────────
  {
    ad: 'Kardiyoloji',
    hastalikSlug: 'kardiyoloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#DC2626',
    bg: '#FEF2F2',
    items: [
      'Kardiyoloji',
      'İnvazif Kardiyoloji',
      'Girişimsel Kardiyoloji',
      'Kalp Yetmezliği',
      'Aritmi & Elektrofizyoloji',
      'Kalp ve Damar Cerrahisi',
    ],
  },

  // ── Nöroloji ──────────────────────────────────────────────
  {
    ad: 'Nöroloji',
    hastalikSlug: 'noroloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#7C3AED',
    bg: '#F5F3FF',
    items: [
      'Nöroloji',
      'Nöroşirurji (Beyin ve Sinir Cerrahisi)',
      'Nöropsikiyatri',
      'Baş Ağrısı & Migren',
      'Hareket Bozuklukları (Parkinson)',
      'Epilepsi Tedavisi',
    ],
  },

  // ── Ortopedi ──────────────────────────────────────────────
  {
    ad: 'Ortopedi ve Travmatoloji',
    hastalikSlug: 'ortopedi',
    entityTypes: ['doktor', 'hastane'],
    renk: '#92400E',
    bg: '#FFFBEB',
    items: [
      'Ortopedi ve Travmatoloji',
      'Spor Hekimliği',
      'El Cerrahisi',
      'Omurga Cerrahisi',
      'Artroskopik Cerrahi',
      'Fizik Tedavi ve Rehabilitasyon',
      'Protez & Ortez',
    ],
  },

  // ── Çocuk Sağlığı ─────────────────────────────────────────
  {
    ad: 'Çocuk Sağlığı ve Hastalıkları',
    hastalikSlug: 'cocuk-sagligi',
    entityTypes: ['doktor', 'hastane'],
    renk: '#0369A1',
    bg: '#F0F9FF',
    items: [
      'Çocuk Sağlığı ve Hastalıkları (Pediatri)',
      'Neonatoloji (Yenidoğan)',
      'Çocuk Nörolojisi',
      'Çocuk Endokrinolojisi',
      'Çocuk Cerrahisi',
      'Çocuk Kardiyolojisi',
      'Çocuk Psikiyatrisi',
      'Çocuk Gastroenterolojisi',
      'Çocuk Hematoloji-Onkolojisi',
    ],
  },

  // ── Gastroenteroloji ──────────────────────────────────────
  {
    ad: 'Gastroenteroloji',
    hastalikSlug: 'gastroenteroloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#059669',
    bg: '#F0FDF4',
    items: [
      'Gastroenteroloji',
      'Hepatoloji (Karaciğer)',
      'Genel Cerrahi',
      'Kolorektal Cerrahi',
      'Endoskopi & Kolonoskopi',
      'Baritatrik Cerrahi',
    ],
  },

  // ── Endokrinoloji ─────────────────────────────────────────
  {
    ad: 'Endokrinoloji ve Metabolizma',
    hastalikSlug: 'endokrinoloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#BE185D',
    bg: '#FDF2F8',
    items: [
      'Endokrinoloji ve Metabolizma',
      'Diyabet (Şeker Hastalığı) Tedavisi',
      'Tiroid Hastalıkları',
      'Obezite ve Metabolizma',
      'Osteoporoz Tedavisi',
    ],
  },

  // ── Göğüs ─────────────────────────────────────────────────
  {
    ad: 'Göğüs Hastalıkları',
    hastalikSlug: 'gogus',
    entityTypes: ['doktor', 'hastane'],
    renk: '#0284C7',
    bg: '#EFF6FF',
    items: [
      'Göğüs Hastalıkları',
      'Göğüs Cerrahisi',
      'Uyku Bozuklukları (Uyku Apnesi)',
      'Allerjik Solunum Yolu Hastalıkları',
      'KOAH Tedavisi',
      'Astım Tedavisi',
    ],
  },

  // ── Göz ───────────────────────────────────────────────────
  {
    ad: 'Göz Hastalıkları',
    hastalikSlug: 'goz',
    entityTypes: ['doktor', 'hastane'],
    renk: '#0891B2',
    bg: '#ECFEFF',
    items: [
      'Göz Hastalıkları (Oftalmoloji)',
      'Refraksiyon Cerrahisi (Lazer)',
      'Retina Hastalıkları',
      'Katarakt Cerrahisi',
      'Glokom Tedavisi',
      'Pediatrik Oftalmoloji',
      'Kornea ve Kontak Lens',
    ],
  },

  // ── Onkoloji ──────────────────────────────────────────────
  {
    ad: 'Onkoloji',
    hastalikSlug: 'onkoloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#B45309',
    bg: '#FFF7ED',
    items: [
      'Onkoloji',
      'Tıbbi Onkoloji',
      'Radyasyon Onkolojisi',
      'Cerrahi Onkoloji',
      'Hematoloji-Onkoloji',
      'Nükleer Tıp',
    ],
  },

  // ── Dermatoloji ───────────────────────────────────────────
  {
    ad: 'Dermatoloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#D97706',
    bg: '#FFFBEB',
    items: [
      'Dermatoloji',
      'Estetik Dermatoloji',
      'Lazer Dermatoloji',
      'Saç ve Tırnak Hastalıkları',
      'Deri Kanserleri',
      'Akne & Sedef Tedavisi',
    ],
  },

  // ── Psikiyatri & Psikoloji ────────────────────────────────
  {
    ad: 'Psikiyatri ve Psikoloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#7C3AED',
    bg: '#F5F3FF',
    items: [
      'Psikiyatri',
      'Klinik Psikoloji',
      'Çocuk ve Ergen Psikiyatrisi',
      'Bağımlılık Tedavisi',
      'Bilişsel Davranışçı Terapi (BDT)',
      'Çift ve Aile Terapisi',
    ],
  },

  // ── KBB ───────────────────────────────────────────────────
  {
    ad: 'Kulak Burun Boğaz (KBB)',
    entityTypes: ['doktor', 'hastane'],
    renk: '#0369A1',
    bg: '#EFF6FF',
    items: [
      'Kulak Burun Boğaz (KBB)',
      'Baş Boyun Cerrahisi',
      'İşitme ve Denge Bozuklukları',
      'Uyku Apnesi (KBB)',
      'Rinoloji (Burun)',
      'Ses ve Yutma Bozuklukları',
    ],
  },

  // ── Üroloji ───────────────────────────────────────────────
  {
    ad: 'Üroloji ve Androloji',
    entityTypes: ['doktor', 'hastane'],
    renk: '#1D4ED8',
    bg: '#EEF2FF',
    items: [
      'Üroloji',
      'Androloji (Erkek Sağlığı)',
      'Kadın Ürolojisi',
      'Robotik Üroloji',
      'Böbrek Taşı Tedavisi',
      'Onkolojik Üroloji',
    ],
  },

  // ── Plastik Cerrahi ───────────────────────────────────────
  {
    ad: 'Plastik ve Estetik Cerrahi',
    entityTypes: ['doktor', 'hastane'],
    renk: '#DB2777',
    bg: '#FDF2F8',
    items: [
      'Plastik ve Rekonstrüktif Cerrahi',
      'Estetik Cerrahi',
      'Meme Estetiği',
      'Burun Estetiği (Rinoplasti)',
      'Yüz Gençleştirme',
      'Liposuction & Vücut Şekillendirme',
      'Saç Ekimi',
    ],
  },

  // ── Diğer Uzmanlıklar ─────────────────────────────────────
  {
    ad: 'Diğer Uzmanlıklar',
    entityTypes: ['doktor', 'hastane'],
    renk: '#4B5563',
    bg: '#F9FAFB',
    items: [
      'Aile Hekimliği',
      'İç Hastalıkları (Dahiliye)',
      'Genel Pratisyen',
      'Acil Tıp',
      'Anesteziyoloji ve Reanimasyon',
      'Nefroloji (Böbrek Hastalıkları)',
      'Romatoloji',
      'Hematoloji',
      'Radyoloji & Girişimsel Radyoloji',
      'Enfeksiyon Hastalıkları',
      'İmmünoloji & Allerji',
      'Damar Cerrahisi',
      'Spor Hekimliği',
      'İş ve Meslek Hastalıkları',
    ],
  },
];

/**
 * Bir uzmanlık etiketi için /hastaliklar/{slug} veya /doktorlar?spec=... URL'i döndürür.
 * ProfilSayfasi chip linklerinde kullanılır.
 */
export function specToHref(spec: string): string {
  for (const grup of SPEC_GRUPLARI) {
    if (!grup.hastalikSlug) continue;
    if (grup.ad === spec || grup.items.includes(spec)) {
      return `/hastaliklar/${grup.hastalikSlug}`;
    }
  }
  return `/doktorlar?spec=${encodeURIComponent(spec)}`;
}

// ─────────────────────────────────────────────────────────────
// İl + Uzmanlık combo landing sayfaları (/dis-tedavileri/[il]/[uzmanlik])
// ─────────────────────────────────────────────────────────────

/** "Diş Hekimliği" grubundaki kanonik uzmanlıklar — combo sayfaları bunlarla oluşur */
export const DENTAL_SPECIALTIES: string[] = SPEC_GRUPLARI.find(g => g.ad === 'Diş Hekimliği')?.items || [];

/** Veri kaynaklarındaki farklı yazımlar → kanonik uzmanlık (overlaps sorgusu için)
 *
 *  ÖNEMLİ: Sorgu `overlaps('specs', ...)` ile TAM STRING eşleşmesi yapar; bu yüzden
 *  veritabanında fiilen bulunan her yazım varyantı burada listelenmeli. Ayrıca
 *  tedavi adları (Zirkonyum Kaplama, Diş Taşı Temizliği…) ilgili uzmanlığın altına
 *  yazılır — kliniğin kendi etiketi tedavi adıysa uzmanlık sayfasında görünsün diye.
 *  (Örn. Bartın'da yalnızca "Zirkonyum Kaplama" etiketli klinik, düzeltmeden önce
 *   /dis-tedavileri/bartin/zirkonyum-kaplama sayfasında 404 veriyordu.) */
export const DENTAL_SYNONYMS: Record<string, string[]> = {
  'Genel Diş Hekimliği':             ['Genel Diş Hekimliği', 'Genel Diş Hekimi', 'Diş Sağlığı', 'Diş Kliniği', 'Ağız ve Diş Sağlığı', 'Ağız ve Diş Sağlığı Merkezi', 'Diş Hastanesi', 'Acil Diş', 'Diş Muayenehanesi'],
  'Ortodonti (Diş Teli)':            ['Ortodonti (Diş Teli)', 'Ortodonti', 'Diş Teli', 'Diş Teli (Ortodonti)', 'Şeffaf Plak (Invisalign)', 'Şeffaf Plak', 'Invisalign'],
  'Pedodonti (Çocuk Diş Hekimliği)': ['Pedodonti (Çocuk Diş Hekimliği)', 'Çocuk Diş Hekimliği', 'Pedodonti', 'Çocuk Diş Hekimi'],
  'Endodonti (Kanal Tedavisi)':      ['Endodonti (Kanal Tedavisi)', 'Endodonti', 'Kanal Tedavisi'],
  'Ağız Diş ve Çene Cerrahisi':      ['Ağız Diş ve Çene Cerrahisi', 'Ağız Diş Çene Cerrahisi', 'Ağız, Diş ve Çene Cerrahisi', 'Çene Cerrahisi', '20 Yaş Dişi Çekimi', 'Diş Çekimi'],
  'Restoratif Diş Tedavisi (Dolgu)': ['Restoratif Diş Tedavisi (Dolgu)', 'Restoratif Diş Tedavisi', 'Diş Dolgusu', 'Dolgu'],
  'Protez (Diş Protezi)':            ['Protez (Diş Protezi)', 'Protetik Diş Tedavisi', 'Protez', 'Diş Protezi'],
  'Periodontoloji (Diş Eti)':        ['Periodontoloji (Diş Eti)', 'Periodontoloji', 'Diş Eti Tedavisi', 'Diş Taşı Temizliği'],
  'İmplantoloji (İmplant)':          ['İmplantoloji (İmplant)', 'İmplantoloji', 'İmplant', 'Diş İmplantı'],
  'Ağız Diş ve Çene Radyolojisi':    ['Ağız Diş ve Çene Radyolojisi', 'Ağız, Diş ve Çene Radyolojisi', 'Diş Radyolojisi', 'Panoramik Röntgen'],
  'Estetik Diş Hekimliği':           ['Estetik Diş Hekimliği', 'Estetik Diş Hekimi', 'Zirkonyum Kaplama', 'Diş Beyazlatma', 'Lamina (Laminate Veneer)', 'Lamina (Yaprak Porselen)', 'Gülüş Tasarımı', 'Porselen Kaplama'],
  'Diş Beyazlatma':                  ['Diş Beyazlatma', 'Estetik Diş Hekimliği'],
  'Zirkonyum Kaplama':               ['Zirkonyum Kaplama', 'Estetik Diş Hekimliği'],
  'Lamina (Laminate Veneer)':        ['Lamina (Laminate Veneer)', 'Lamina (Yaprak Porselen)', 'Estetik Diş Hekimliği'],
  'Şeffaf Plak (Invisalign)':        ['Şeffaf Plak (Invisalign)', 'Şeffaf Plak', 'Ortodonti (Diş Teli)', 'Ortodonti'],
  'Gülüş Tasarımı':                  ['Gülüş Tasarımı', 'Estetik Diş Hekimliği'],
  'Diş Taşı Temizliği':              ['Diş Taşı Temizliği', 'Periodontoloji (Diş Eti)', 'Periodontoloji'],
  'Bruksizm (Diş Gıcırdatma)':       ['Bruksizm (Diş Gıcırdatma)', 'Bruksizm', 'Gece Plağı'],
};

/** Bir uzmanlık için veri eşleşme varyantları (ham metin — küme karşılaştırmaları için) */
export function synonymsForSpec(spec: string): string[] {
  return DENTAL_SYNONYMS[spec] || [spec];
}

/** PostgREST `overlaps` filtresi için güvenli değerler.
 *
 *  TUZAK: `.overlaps('specs', [...])` değerleri `ov.{a,b,c}` biçiminde virgülle
 *  birleştirir. İçinde virgül olan bir değer ("Ağız, Diş ve Çene Cerrahisi")
 *  iki ayrı öğeye bölünür ve "Ağız" gibi yanlış etiketlerle eşleşir — İstanbul
 *  radyoloji sayfası bu yüzden alakasız bir kliniği listeliyordu. Çift tırnak
 *  içine alınca PostgREST tek öğe olarak okur. */
export function specFilterValues(specs: string[]): string[] {
  return specs.map(s => (s.includes(',') ? `"${s}"` : s));
}

/** Herhangi bir spec etiketini kanonik diş uzmanlığına eşler (diş uzmanlığı değilse null) */
export function canonicalDentalSpec(spec: string): string | null {
  if (DENTAL_SPECIALTIES.includes(spec)) return spec;
  for (const [canon, syns] of Object.entries(DENTAL_SYNONYMS)) if (syns.includes(spec)) return canon;
  return null;
}

/** il + spec → /dis-tedavileri/<il>/<uzmanlik> (spec diş uzmanlığı değilse null) */
export function dentalComboHref(il: string | null | undefined, spec: string): string | null {
  const c = canonicalDentalSpec(spec);
  if (!c || !il) return null;
  return `/dis-tedavileri/${toSlug(il)}/${toSlug(c)}`;
}

// ─────────────────────────────────────────────────────────────
// Ticari-niyetli TEDAVİ sayfaları (uzmanlık değil, tedavi adıyla arama)
// Her tedavi, listeleme için bir kanonik uzmanlığa eşlenir.
// ─────────────────────────────────────────────────────────────
export interface Treatment { slug: string; name: string; spec: string; ozet: string; }

export const TREATMENTS: Treatment[] = [
  { slug: 'dis-implanti',      name: 'Diş İmplantı',            spec: 'İmplantoloji (İmplant)',        ozet: 'Eksik dişlerin yerine çene kemiğine yerleştirilen, üzerine kalıcı diş takılan titanyum vida tedavisi.' },
  { slug: 'zirkonyum-kaplama', name: 'Zirkonyum Kaplama',       spec: 'Estetik Diş Hekimliği',         ozet: 'Metal desteksiz, ışık geçirgenliğiyle doğal görünen dayanıklı estetik diş kaplaması.' },
  { slug: 'dis-beyazlatma',    name: 'Diş Beyazlatma',          spec: 'Estetik Diş Hekimliği',         ozet: 'Dişlerin renk tonunu birkaç ton açan, ofis tipi veya ev tipi estetik uygulama.' },
  { slug: 'seffaf-plak',       name: 'Şeffaf Plak (Invisalign)',spec: 'Ortodonti (Diş Teli)',          ozet: 'Telsiz, çıkarılabilir şeffaf plaklarla estetik diş düzeltme tedavisi.' },
  { slug: 'gulus-tasarimi',    name: 'Gülüş Tasarımı',          spec: 'Estetik Diş Hekimliği',         ozet: 'Yüz hatlarına uygun, kişiye özel estetik gülüş planlaması.' },
  { slug: 'lamina-veneer',     name: 'Lamina (Yaprak Porselen)',spec: 'Estetik Diş Hekimliği',         ozet: 'Dişin ön yüzeyine yapıştırılan ince porselen yaprak ile estetik düzeltme.' },
  { slug: 'kanal-tedavisi',    name: 'Kanal Tedavisi',          spec: 'Endodonti (Kanal Tedavisi)',    ozet: 'İltihaplanan diş sinirinin temizlenip kanalın doldurulmasıyla dişin kurtarılması.' },
  { slug: 'dis-teli',          name: 'Diş Teli (Ortodonti)',    spec: 'Ortodonti (Diş Teli)',          ozet: 'Çapraşık diş ve çene bozukluklarını düzelten braket (tel) tedavisi.' },
  { slug: '20-yas-disi-cekimi',name: '20 Yaş Dişi Çekimi',      spec: 'Ağız Diş ve Çene Cerrahisi',    ozet: 'Gömülü veya ağrı yapan 20 yaş dişlerinin cerrahi olarak çekilmesi.' },
  { slug: 'cocuk-dis-hekimi',  name: 'Çocuk Diş Hekimi',        spec: 'Pedodonti (Çocuk Diş Hekimliği)', ozet: 'Bebek ve çocuklarda ağız-diş sağlığı, koruyucu uygulamalar ve tedaviler.' },
];

export function treatmentBySlug(s: string): Treatment | null {
  return TREATMENTS.find(t => t.slug === s) || null;
}

// ── Diş sağlığı PROBLEMLERİ (belirti/şikâyet) — il/ilçe bazlı aramalar için.
// Her problem, çözüm sunan diş uzmanlığına (spec) eşlenir; o şehirdeki ilgili
// klinikler listelenir. hastalikSlug varsa /hastaliklar detayına bağlanır.
export interface DentalProblem { slug: string; ad: string; spec: string; ozet: string; hastalikSlug?: string; }
export const DENTAL_PROBLEMS: DentalProblem[] = [
  { slug: 'dis-agrisi',           ad: 'Diş Ağrısı',                 spec: 'Endodonti (Kanal Tedavisi)',      ozet: 'Diş ağrısının en sık nedenleri ilerlemiş çürük, diş siniri iltihabı ve apsedir. Ağrının kaynağına göre dolgu, kanal tedavisi veya çekim gerekebilir.' },
  { slug: 'dis-eti-kanamasi',     ad: 'Diş Eti Kanaması',           spec: 'Periodontoloji (Diş Eti)',        ozet: 'Fırçalarken veya kendiliğinden diş eti kanaması çoğunlukla diş taşı ve diş eti iltihabının (gingivit) belirtisidir; erken tedaviyle geri döndürülebilir.' },
  { slug: 'dis-curugu',           ad: 'Diş Çürüğü',                 spec: 'Restoratif Diş Tedavisi (Dolgu)', ozet: 'Diş çürüğü, minede başlayan ve ilerledikçe ağrı ve hassasiyet yapan doku kaybıdır. Erken evrede dolgu ile tedavi edilir.' },
  { slug: 'dis-hassasiyeti',      ad: 'Diş Hassasiyeti',            spec: 'Restoratif Diş Tedavisi (Dolgu)', ozet: 'Soğuk-sıcak veya tatlıya karşı kısa süreli keskin ağrı; mine aşınması, çürük ya da diş eti çekilmesine bağlı olabilir.' },
  { slug: 'dis-apsesi',           ad: 'Diş Apsesi',                 spec: 'Endodonti (Kanal Tedavisi)',      ozet: 'Diş kökü çevresinde iltihap birikmesi; zonklayan ağrı ve şişlik yapar. Kanal tedavisi veya cerrahi müdahale gerektirir.' },
  { slug: 'dis-eti-cekilmesi',    ad: 'Diş Eti Çekilmesi',          spec: 'Periodontoloji (Diş Eti)',        ozet: 'Diş etinin kök yüzeyini açığa çıkaracak şekilde geri çekilmesi; hassasiyet ve estetik kayba yol açar.' },
  { slug: 'agiz-kokusu',          ad: 'Ağız Kokusu (Halitozis)',    spec: 'Diş Taşı Temizliği',              ozet: 'Kalıcı ağız kokusunun başlıca nedenleri diş taşı, diş eti hastalığı ve dil bakımının yetersizliğidir; profesyonel temizlikle azalır.' },
  { slug: '20-yas-disi-agrisi',   ad: '20 Yaş Dişi Ağrısı',         spec: 'Ağız Diş ve Çene Cerrahisi',      ozet: 'Sürmekte olan veya gömülü 20 yaş dişleri ağrı, şişlik ve çevre dişlere baskı yapabilir; sıklıkla cerrahi çekim gerekir.' },
  { slug: 'gomulu-dis',           ad: 'Gömülü Diş',                 spec: 'Ağız Diş ve Çene Cerrahisi',      ozet: 'Çene kemiği veya diş eti içinde kalarak süremeyen dişler; ağrı ve enfeksiyon yapabilir, cerrahi olarak değerlendirilir.' },
  { slug: 'carpik-dis',           ad: 'Çarpık / Düzensiz Dişler',   spec: 'Ortodonti (Diş Teli)',            ozet: 'Çapraşık ve düzensiz dişler; diş teli veya şeffaf plak (ortodonti) ile düzeltilir, hem estetik hem sağlık kazandırır.' },
  { slug: 'eksik-dis',            ad: 'Eksik Diş',                  spec: 'İmplantoloji (İmplant)',          ozet: 'Bir veya birden fazla eksik diş; implant, köprü veya protez ile fonksiyon ve estetik yeniden kazanılır.' },
  { slug: 'dis-sikma-gicirdatma', ad: 'Diş Sıkma / Gıcırdatma',     spec: 'Bruksizm (Diş Gıcırdatma)',       ozet: 'Genellikle uykuda görülen diş sıkma/gıcırdatma; diş aşınması, çene ağrısı ve baş ağrısı yapar, gece plağı ile korunur.' },
  { slug: 'dis-kirigi',           ad: 'Diş Kırığı / Çatlağı',       spec: 'Restoratif Diş Tedavisi (Dolgu)', ozet: 'Travma veya sert gıdalarla oluşan diş kırığı/çatlağı; kapsamına göre dolgu, kaplama veya kanal tedavisiyle onarılır.' },
  { slug: 'dis-sararmasi',        ad: 'Diş Sararması / Renklenme',  spec: 'Diş Beyazlatma',                  ozet: 'Kahve, çay, sigara ve yaşa bağlı renklenmeler; profesyonel diş beyazlatma ile birkaç ton açılabilir.' },
];
export function problemBySlug(s: string): DentalProblem | null {
  return DENTAL_PROBLEMS.find(p => p.slug === s) || null;
}

/** Uzmanlık, tedavi veya diş-sağlığı problemi slug'ını çöz → { label, spec, treatment?, problem? } (yoksa null) */
export function resolveSpecOrTreatment(uzmSlug: string): { label: string; spec: string; treatment: Treatment | null; problem?: DentalProblem } | null {
  const t = treatmentBySlug(uzmSlug);
  if (t) return { label: t.name, spec: t.spec, treatment: t };
  for (const item of DENTAL_SPECIALTIES) if (toSlug(item) === uzmSlug) return { label: item, spec: item, treatment: null };
  const p = problemBySlug(uzmSlug);
  if (p) return { label: p.ad, spec: p.spec, treatment: null, problem: p };
  return null;
}

/** Şehre/uzmanlığa özel SSS — hem içerik zenginliği hem FAQPage schema için */
export function buildDentalFaq(opts: { il: string; ilce?: string | null; label: string; count: number; genelListe?: boolean }): { q: string; a: string }[] {
  const yer = opts.ilce ? `${opts.ilce}, ${opts.il}` : opts.il;
  // genelListe: bölgede bu hizmeti ayrıca belirtmiş klinik kaydı yok; liste
  // bölgedeki diş klinikleridir. Cevap bunu olduğu gibi söylemeli.
  return [
    opts.genelListe
      ? { q: `${yer} bölgesinde kaç ${opts.label} hekimi bulunuyor?`, a: `Hekimhane rehberinde ${yer} için ${opts.label} hizmetini ayrıca belirtmiş bir klinik kaydı henüz bulunmuyor. Bu sayfada bölgedeki ${opts.count} diş kliniğini listeliyoruz; işlemin yapılıp yapılmadığını randevu öncesi klinikle teyit edebilirsiniz.` }
      : { q: `${yer} bölgesinde kaç ${opts.label} hekimi bulunuyor?`, a: `Hekimhane'de ${yer} için ${opts.count} adet ${opts.label} hizmeti veren diş hekimi ve klinik listeleniyor. Hepsini puan ve hasta yorumlarıyla karşılaştırabilirsiniz.` },
    { q: `${yer}'da ${opts.label} için nasıl randevu alınır?`, a: `İlgili hekimin profil sayfasından telefonla doğrudan arayabilir veya "Randevu Al" butonuyla talep gönderebilirsiniz; çoğu klinik aynı gün geri dönüş yapar.` },
    { q: `${opts.il}'da ${opts.label} ücretleri ne kadar?`, a: `Ücretler hekime, vakanın zorluğuna ve kullanılan malzemeye göre değişir. Net fiyat için ön muayene önerilir; birçok klinik ilk muayeneyi ücretsiz sunar.` },
    { q: `${yer}'da en iyi ${opts.label} hekimi nasıl seçilir?`, a: `Hasta yorumlarını, puan ortalamasını, deneyimi ve klinik konumunu değerlendirin. Hekimhane bu bilgilerin tümünü tek sayfada karşılaştırmalı gösterir.` },
  ];
}
