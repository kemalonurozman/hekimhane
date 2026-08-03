// ─────────────────────────────────────────────────────────────────
//  İş ortağı makalesi — tek paket, tek fiyat.
//  Fiyatı değiştirmek için yalnızca bu dosyayı düzenleyin; hem
//  /makale-yayinla sayfası hem de proforma e-postaları buradan okur.
// ─────────────────────────────────────────────────────────────────

export const MAKALE_FIYAT = 4900;   // TL, KDV hariç
export const KDV_ORANI    = 0.20;   // %20

export const KDV_TUTAR = MAKALE_FIYAT * KDV_ORANI;
export const TOPLAM    = MAKALE_FIYAT + KDV_TUTAR;

// Binlik ayraç — toLocaleString sunucu/tarayıcı arasında farklı
// sonuç verip hydration uyumsuzluğu yaratabildiği için elle yapılır.
export const tl = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Pakete dahil olan her şey — sayfada ve sipariş e-postasında kullanılır.
export const PAKET_ICERIK = [
  'Hekimhane blogunda kalıcı yayın — süresiz',
  'Metin içine en fazla 3 harici bağlantı (dofollow)',
  'Ana sayfada 30 gün öne çıkarma',
  'Blog bölümünde önerilenler alanında 30 gün',
  'En fazla 3 uzmanlık sayfasında gösterim, 30 gün',
  'Bir sonraki e-bültende yer alma',
  'Editör düzenlemesi, görsel ve SEO optimizasyonu',
  'Yayın sonrası düzeltme ve güncelleme hakkı',
];
