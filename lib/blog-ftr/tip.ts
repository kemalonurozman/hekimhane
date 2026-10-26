// Fizik Tedavi ve Rehabilitasyon yazı dizisinin kaynak biçimi.
// `metin` düz metindir (lib/makale-icerik.ts → parseGovde):
//   ## Ara başlık · - Madde · **kalın** · [bağlantı](/blog/...) · > Alıntı
//   Paragraflar boş satırla ayrılır.
// Yazı `created_at` günü Türkiye saatiyle 09:00'da yayına girer (lib/blog-data.ts).
export interface FtrKaynak {
  slug: string;
  title: string;
  summary: string;      // 140–200 karakter, liste kartı + meta description
  created_at: string;   // YYYY-MM-DD — yayın günü
  cover_alt: string;    // kapak görselinin açıklayıcı alt metni
  metin: string;
}
