// Sağlık / hastalık yazı dizisinin kaynak biçimi.
// `metin` düz metindir (lib/makale-icerik.ts → parseGovde):
//   ## Ara başlık · - Madde · **kalın** · [bağlantı](/blog/...) · > Alıntı
//   Hekim bulma bağlantısı için [metin](/hekim-bul) yazılır; index.ts bunu
//   /doktorlar?spec=<brans> adresine çevirir. Yayın anı lib/blog-takvim.ts'ten gelir.
export interface SaglikKaynak {
  slug: string;
  title: string;
  summary: string;      // 140–200 karakter
  kategori: string;     // blog kategorisi
  brans: string;        // doktorlar.spec ile birebir aynı uzmanlık adı
  cover_alt: string;
  metin: string;
}
