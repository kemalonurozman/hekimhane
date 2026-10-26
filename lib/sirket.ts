// İşletmenin yasal kimliği — TEK KAYNAK. KVKK, çerez, sözleşme ve iletişim
// sayfaları buradan okur; başka hiçbir yerde unvan/adres yazılmaz.
// Boş bırakılan alan sayfalarda hiç gösterilmez (yer tutucu basılmaz).
// İstemci ve sunucuda ortak — sunucu importu koyma.

export const SIRKET = {
  /** Satıcı / veri sorumlusu unvanı */
  unvan: 'Doktorio.cz',
  /** Hekimhane'nin bağlı olduğu kuruluş (footer'da "bir Doktorio.cz kuruluşudur") */
  anaKurulus: 'Doktorio.cz',
  anaKurulusSite: 'https://www.doktorio.cz',
  marka: 'Hekimhane',
  site: 'https://www.hekimhane.com.tr',
  alanAdi: 'hekimhane.com.tr',
  eposta: 'info@hekimhane.com.tr',
  /** KVKK başvuruları için adres (ayrı bir kutu açılırsa burası değişir) */
  kvkkEposta: 'info@hekimhane.com.tr',
  /** Aşağıdakiler doldurulunca sayfalarda kendiliğinden görünür */
  adres: '',
  ulke: '',
  vergiNo: '',      // vergi / kimlik / ticaret sicil numarası
  telefon: '',
  /** MERSİS ve KEP — aydınlatma metinlerinde veri sorumlusu künyesi (boşsa yazılmaz) */
  mersis: '',
  kep: '',
  /** Footer'daki "Editör: ad, e-posta" satırı — ad boşsa satır çıkmaz */
  editorAd: '',
  editorEposta: 'info@hekimhane.com.tr',
} as const;

/** Yasal metinlerin son güncelleme tarihi (hepsi birlikte güncellendi). */
export const YASAL_GUNCELLEME = '10 Ekim 2026';

/** Unvan + dolu olan kimlik satırları — sözleşme ve aydınlatma metinlerinde. */
export function sirketKunyesi(): { etiket: string; deger: string }[] {
  return [
    { etiket: 'Unvan', deger: SIRKET.unvan },
    { etiket: 'Adres', deger: [SIRKET.adres, SIRKET.ulke].filter(Boolean).join(', ') },
    { etiket: 'Vergi / sicil no', deger: SIRKET.vergiNo },
    { etiket: 'MERSİS', deger: SIRKET.mersis },
    { etiket: 'KEP', deger: SIRKET.kep },
    { etiket: 'Telefon', deger: SIRKET.telefon },
    { etiket: 'E-posta', deger: SIRKET.eposta },
    { etiket: 'İnternet sitesi', deger: SIRKET.alanAdi },
  ].filter(x => x.deger);
}
