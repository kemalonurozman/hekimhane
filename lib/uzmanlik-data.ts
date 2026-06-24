// ─────────────────────────────────────────────────────────────
// Hekimhane — Uzmanlık Alanları Verisi
// Panel'deki SpecPicker ve profil sayfasındaki chip linkleri için.
// ─────────────────────────────────────────────────────────────

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
      'Diş Hekimi',
      'Ortodonti',
      'İmplantoloji',
      'Periodontoloji (Diş Eti)',
      'Endodonti (Kanal Tedavisi)',
      'Oral Cerrahi (Çene Cerrahisi)',
      'Protez Diş',
      'Pedodonti (Çocuk Diş)',
      'Estetik Diş Hekimliği',
      'Diş Beyazlatma',
      'Bruksizm Tedavisi',
      'Diş Eti Tedavisi',
      'Zirkonyum & Porselen',
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
