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

/** Veri kaynaklarındaki farklı yazımlar → kanonik uzmanlık (overlaps sorgusu için) */
export const DENTAL_SYNONYMS: Record<string, string[]> = {
  'Genel Diş Hekimliği':             ['Genel Diş Hekimliği', 'Genel Diş Hekimi', 'Diş Sağlığı', 'Diş Kliniği'],
  'Ortodonti (Diş Teli)':            ['Ortodonti (Diş Teli)', 'Ortodonti'],
  'Pedodonti (Çocuk Diş Hekimliği)': ['Pedodonti (Çocuk Diş Hekimliği)', 'Çocuk Diş Hekimliği'],
  'Endodonti (Kanal Tedavisi)':      ['Endodonti (Kanal Tedavisi)', 'Endodonti'],
  'Ağız Diş ve Çene Cerrahisi':      ['Ağız Diş ve Çene Cerrahisi', 'Ağız Diş Çene Cerrahisi'],
  'Restoratif Diş Tedavisi (Dolgu)': ['Restoratif Diş Tedavisi (Dolgu)', 'Restoratif Diş Tedavisi'],
  'Protez (Diş Protezi)':            ['Protez (Diş Protezi)', 'Protetik Diş Tedavisi', 'Protez'],
};

/** Bir uzmanlık için veri eşleşme varyantları */
export function synonymsForSpec(spec: string): string[] {
  return DENTAL_SYNONYMS[spec] || [spec];
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

/** Uzmanlık veya tedavi slug'ını çöz → { label, spec (kanonik), treatment? } (yoksa null) */
export function resolveSpecOrTreatment(uzmSlug: string): { label: string; spec: string; treatment: Treatment | null } | null {
  const t = treatmentBySlug(uzmSlug);
  if (t) return { label: t.name, spec: t.spec, treatment: t };
  for (const item of DENTAL_SPECIALTIES) if (toSlug(item) === uzmSlug) return { label: item, spec: item, treatment: null };
  return null;
}

/** Şehre/uzmanlığa özel SSS — hem içerik zenginliği hem FAQPage schema için */
export function buildDentalFaq(opts: { il: string; ilce?: string | null; label: string; count: number }): { q: string; a: string }[] {
  const yer = opts.ilce ? `${opts.ilce}, ${opts.il}` : opts.il;
  return [
    { q: `${yer} bölgesinde kaç ${opts.label} hekimi bulunuyor?`, a: `Hekimhane'de ${yer} için ${opts.count} adet ${opts.label} hizmeti veren diş hekimi ve klinik listeleniyor. Hepsini puan ve hasta yorumlarıyla karşılaştırabilirsiniz.` },
    { q: `${yer}'da ${opts.label} için nasıl randevu alınır?`, a: `İlgili hekimin profil sayfasından telefonla doğrudan arayabilir veya "Randevu Al" butonuyla talep gönderebilirsiniz; çoğu klinik aynı gün geri dönüş yapar.` },
    { q: `${opts.il}'da ${opts.label} ücretleri ne kadar?`, a: `Ücretler hekime, vakanın zorluğuna ve kullanılan malzemeye göre değişir. Net fiyat için ön muayene önerilir; birçok klinik ilk muayeneyi ücretsiz sunar.` },
    { q: `${yer}'da en iyi ${opts.label} hekimi nasıl seçilir?`, a: `Hasta yorumlarını, puan ortalamasını, deneyimi ve klinik konumunu değerlendirin. Hekimhane bu bilgilerin tümünü tek sayfada karşılaştırmalı gösterir.` },
  ];
}
