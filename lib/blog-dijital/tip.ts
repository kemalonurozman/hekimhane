// "Diş Doktorlarına Özel Setler — Dijital Hekimlik" yazı dizisinin kaynak biçimi.
// Okur kitlesi diş hekimleridir (hasta bilgilendirmesi değil).
// `metin` düz metindir (lib/makale-icerik.ts → parseGovde):
//   ## Ara başlık · - Madde · **kalın** · *italik* · [bağlantı](/blog/...) · > Alıntı
//   Paragraflar boş satırla ayrılır. Metin içi atıf: (Yazar ve ark., yıl).
//   Her yazı "## Kaynaklar" bölümüyle biter (madde listesi, Vancouver benzeri).
export interface DijitalKaynak {
  slug: string;
  sira: number;         // dizideki sıra (1–10) — yalnız dizi listesinde kullanılır
  title: string;
  summary: string;      // 140–200 karakter, liste kartı + meta description
  created_at: string;   // YYYY-MM-DDTHH:MM:SS+03:00 — yayın anı
  cover_alt: string;    // kapak görselinin açıklayıcı alt metni
  metin: string;
}
