// Hekimhane Booking — bekleme listesi seçenekleri. TEK KAYNAK: form, API ve
// admin sekmesi buradan okur. İstemci ve sunucuda ortak (sunucu importu koyma).

/** Başvurunun geldiği ürün/özellik sayfası (admin'de ve e-postalarda gösterilir) */
export const BOOKING_URUNLER: { id: string; ad: string }[] = [
  { id: 'booking',          ad: 'Hekimhane Booking' },
  { id: 'randevu-sistemi',  ad: 'Randevu Takvimi' },
  { id: 'randevu-modulu',   ad: 'Randevu Modülü' },
  { id: 'mcp',              ad: 'Yapay Zekâ ile Yönetim' },
  { id: 'pro',              ad: 'Hekimhane-Pro' },
  { id: 'hekimkart',        ad: 'HekimKart' },
  { id: 'degerlendirme',    ad: 'Yorum Yönetimi' },
  { id: 'danismanlik',      ad: 'Ücretsiz Görüşme' },
  { id: 'genel',            ad: 'Hekimhane' },
];

/** /ucretsiz-gorusme — görüşmede konuşulmak istenen konular. Kayıtta `kanallar` kolonunda tutulur
 *  (urun='danismanlik' iken kanal değil konu kimliğidir; admin ve e-posta `kanalEtiketi` ile okur). */
export const DANISMANLIK_KONULAR: { id: string; ad: string; aciklama: string }[] = [
  { id: 'gorunurluk', ad: 'Online görünürlük',      aciklama: 'Hastalar sizi internette nasıl buluyor?' },
  { id: 'randevu',    ad: 'Randevu ve telefon',     aciklama: 'Kaçan çağrılar, online randevu' },
  { id: 'yorum',      ad: 'Hasta yorumları',        aciklama: 'Yorum toplama ve yanıtlama' },
  { id: 'mesaj',      ad: 'Sosyal medya ve mesajlar', aciklama: 'Instagram, Facebook, WhatsApp' },
  { id: 'web',        ad: 'Web sitesi',             aciklama: 'Sitenizden randevu ve iletişim' },
  { id: 'zaman',      ad: 'Ekip ve zaman',          aciklama: 'Sekreter yükü, tekrar eden işler' },
];

/** urun='danismanlik' için talep türü adları (kurulum = telefonla, demo = online görüşme) */
export const DANISMANLIK_TALEPLER: { id: string; ad: string }[] = [
  { id: 'kurulum', ad: 'Telefonla görüşme' },
  { id: 'demo',    ad: 'Online görüntülü görüşme' },
];

/** `kanallar` kolonundaki kimliğin adı — danışmanlık kaydında konu, diğerlerinde kanal */
export const kanalEtiketi = (urun: string | null | undefined, id: string) =>
  etiketBul(urun === 'danismanlik' ? DANISMANLIK_KONULAR : BOOKING_KANALLAR, id);

/** Talep türünün adı — danışmanlıkta görüşme biçimi */
export const talepEtiketi = (urun: string | null | undefined, id: string | null | undefined) =>
  etiketBul(urun === 'danismanlik' ? DANISMANLIK_TALEPLER : BOOKING_TALEPLER, id || 'kurulum');

export const BOOKING_TALEPLER: { id: string; ad: string }[] = [
  { id: 'kurulum', ad: 'Beni arayın (kurulum)' },
  { id: 'demo',    ad: 'Demo' },
];

export const BOOKING_ROLLER: { id: string; ad: string }[] = [
  { id: 'hekim',           ad: 'Hekim / Uzman' },
  { id: 'dis_hekimi',      ad: 'Diş hekimi' },
  { id: 'klinik_yonetici', ad: 'Klinik / muayenehane yöneticisi' },
  { id: 'hastane',         ad: 'Hastane / poliklinik' },
  { id: 'sekreter',        ad: 'Sekreter / asistan' },
  { id: 'diger',           ad: 'Diğer' },
];

export const BOOKING_KANALLAR: { id: string; ad: string; aciklama: string }[] = [
  { id: 'telefon', ad: 'Telefon asistanı',     aciklama: 'Çağrıları 7/24 yanıtlar' },
  { id: 'web',     ad: 'Web sitesi asistanı',  aciklama: 'Sitenizden randevu alır' },
  { id: 'mesaj',   ad: 'Instagram / Facebook mesajları', aciklama: 'Mesajları yanıtlar' },
];

export const BOOKING_HACIM: { id: string; ad: string }[] = [
  { id: '0-10',     ad: 'Günde 10’dan az' },
  { id: '10-30',    ad: 'Günde 10–30' },
  { id: '30-60',    ad: 'Günde 30–60' },
  { id: '60+',      ad: 'Günde 60’tan fazla' },
  { id: 'bilmiyor', ad: 'Bilmiyorum' },
];

export const BOOKING_DURUMLAR: { id: string; ad: string; renk: string }[] = [
  { id: 'yeni',      ad: 'Yeni',            renk: '#2563EB' },
  { id: 'iletisim',  ad: 'İletişime geçildi', renk: '#C77700' },
  { id: 'teklif',    ad: 'Teklif gönderildi', renk: '#6D4AD6' },
  { id: 'kazanildi', ad: 'Müşteri oldu',    renk: '#1E8E5A' },
  { id: 'kapandi',   ad: 'Kapandı',         renk: '#6E6E73' },
];

export const etiketBul = (liste: { id: string; ad: string }[], id: string | null | undefined) =>
  liste.find(x => x.id === id)?.ad || id || '';
