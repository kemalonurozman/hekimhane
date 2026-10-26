// ─────────────────────────────────────────────────────────────────
//  Uyum metinleri — TEK KAYNAK (Eki 2026).
//
//  Kaynak: "Hekimhane Uyum Güncellemeleri ve Site Metinleri" belgesi.
//  Profil kutusu, rozet açıklaması, yorum notu, footer bildirimi ve
//  kaldırma/düzeltme akışlarının metinleri buradan okunur; aynı cümle
//  iki yerde yazılmaz. İstemci ve sunucuda ortak — sunucu importu KOYMA.
//
//  Kural (belgeden): "Sahiplenilmiş" rozeti ücretsizdir, Pro'ya bağlı
//  değildir; yerine "onaylı / güvenilir / önerilen" kelimeleri kullanılmaz.
//  Ücretli paket sıralamayı değiştirmez (lib/profil-puani-sunucu.ts).
// ─────────────────────────────────────────────────────────────────

export type UyumTur = 'klinik' | 'hastane' | 'doktor' | 'eczane';

/** Aydınlatma metinlerinin adresleri — kutu, footer ve e-postalar buraya bağlanır. */
export const AYDINLATMA_YOL = {
  profesyonel: '/aydinlatma/profesyoneller',
  hasta: '/aydinlatma/hasta',
} as const;

/** Belgenin köşeli parantezleri — avukat/sahip netleştirince burası değişir. */
export const UYUM_SURE = {
  /** Belge inceleme ve düzeltme yayın süresi (iş günü) */
  inceleme_is_gunu: 2,
  /** Kaldırma talebinin sonuçlandırılma üst sınırı (gün) — KVKK m.13 */
  kaldirma_ust_gun: 30,
  /** Kaldırma talebinin genellikle sonuçlandığı süre (iş günü) */
  kaldirma_tipik_is_gunu: 3,
  /** Kaldırma onay bağlantısının geçerlilik süresi (saat) */
  kaldirma_token_saat: 72,
} as const;

/** Profil türüne göre kutu/rozet dilindeki özne ("doktor" / "işletme"). */
export function uyumOzne(tur: UyumTur): 'doktor' | 'klinik' | 'işletme' {
  if (tur === 'doktor') return 'doktor';
  if (tur === 'klinik') return 'klinik';
  return 'işletme';
}

/** "Bu profil size mi ait?" kutusu — doktorda kişi, diğerlerinde yetkili dili. */
export function sahiplenKutusu(tur: UyumTur) {
  if (tur === 'doktor') {
    return {
      baslik: 'Bu profil size mi ait?',
      metin: 'Bu profili doğrulayabilir, bilgileri düzeltebilir veya kaldırılmasını isteyebilirsiniz.',
      sahiplen: 'Profili sahiplen',
    };
  }
  const ad = tur === 'klinik' ? 'kliniğin' : tur === 'hastane' ? 'hastanenin' : 'eczanenin';
  const sahiplen = tur === 'klinik' ? 'Kliniği sahiplen' : tur === 'hastane' ? 'Hastaneyi sahiplen' : 'Eczaneyi sahiplen';
  return {
    baslik: `Bu ${ad} yetkilisi misiniz?`,
    metin: tur === 'klinik'
      ? 'Klinik bilgilerini doğrulayabilir, düzeltebilir veya kaldırılmasını isteyebilirsiniz. Klinikte çalışan doktorlar kendi profillerini ayrıca yönetebilir.'
      : 'İşletme bilgilerini doğrulayabilir, düzeltebilir veya kaldırılmasını isteyebilirsiniz.',
    sahiplen,
  };
}

/** Sahiplenilmiş profilde kutunun yerine geçen tek satır. */
export function yonetiliyorNotu(tur: UyumTur): string {
  const ozne = tur === 'doktor' ? 'doktor' : tur === 'klinik' ? 'klinik' : 'işletme';
  return `Bu profil ${ozne} tarafından yönetilmektedir.`;
}

/** Sahiplenilmemiş profil notu — adın altında, herkese görünür. */
export function derlenmisNotu(tur: UyumTur): string {
  const ozne = tur === 'doktor' ? 'doktor' : 'işletme';
  return `Bu profil kamuya açık kaynaklardan derlenmiştir ve ${ozne} tarafından henüz doğrulanmamıştır. Bilgileri randevu öncesinde ilgili sağlık kuruluşundan teyit etmenizi öneririz.`;
}

/** "Sahiplenilmiş" rozetinin üzerine gelince çıkan açıklama. */
export function rozetAciklamasi(tur: UyumTur): string {
  const ozne = tur === 'doktor' ? 'doktorun kendisi' : 'işletmenin yetkilisi';
  const nitelik = tur === 'doktor' ? 'doktorun' : 'işletmenin';
  return `Bu profil, ${ozne} tarafından doğrulanmış ve yönetilmektedir. Rozet, ${nitelik} niteliği hakkında bir değerlendirme değildir.`;
}

/** Yorumların hemen üstünde duran not (bağlantı metni çağıran tarafta). */
export const YORUM_NOTU = 'Görüşler hastalar tarafından bağımsız olarak yazılır. Doktorlar görüşleri silemez veya düzenleyemez, yalnızca yanıt verebilir.';

/** Hatalı bilgi formunun açıklama kutusu altındaki not. */
export const BILDIRIM_NOTU = 'Bildiriminiz editörlerimiz tarafından incelenir. Lütfen bu alana kendinize veya başkasına ait sağlık bilgisi yazmayın.';

/** Hatalı bilgi formu — tek seçimli konu listesi. */
export const HATALI_BILGI_KONULARI = [
  { v: 'adres', ad: 'Adres' },
  { v: 'telefon', ad: 'Telefon' },
  { v: 'uzmanlik', ad: 'Uzmanlık' },
  { v: 'saat', ad: 'Çalışma saatleri' },
  { v: 'ayrildi', ad: 'Doktor artık burada çalışmıyor' },
  { v: 'yorum', ad: 'Kurallara aykırı görüş' },
  { v: 'diger', ad: 'Diğer' },
] as const;
export type HataliBilgiKonu = (typeof HATALI_BILGI_KONULARI)[number]['v'];

/** Doktor panelindeki düzenleme ekranının üstünde duran mevzuat notu. */
export const PANEL_MODERASYON_NOTU = 'Sağlık Hizmetlerinde Tanıtım ve Bilgilendirme Faaliyetleri Hakkında Yönetmelik gereği profilinizde ücret, indirim veya kampanya bilgisi, "en iyi" ya da "garantili" gibi ifadeler, önce ve sonra fotoğrafları ve hasta teşekkür mesajları yayınlanamaz. Değişiklikleriniz editör kontrolünden geçtikten sonra yayına alınır.';

/**
 * Tanıtım yönetmeliğine aykırı ifadeler — panelden gelen serbest metinlerde
 * (tanıtım yazısı vb.) aranır. Eşleşme varsa kayıt reddedilir, metin
 * sahibine hangi ifadenin sorun olduğu söylenir.
 */
const YASAK_IFADELER: { re: RegExp; ad: string }[] = [
  { re: /\ben iyi\b/i, ad: '"en iyi"' },
  { re: /\bgarantili?\b/i, ad: '"garanti"' },
  { re: /\bkampanya/i, ad: '"kampanya"' },
  { re: /\bindirim/i, ad: '"indirim"' },
  { re: /\bücretsiz muayene\b/i, ad: '"ücretsiz muayene"' },
  { re: /(\d[\d.,]*\s*(₺|tl\b))|(₺\s*\d)/i, ad: 'ücret bilgisi' },
  { re: /\bönce\s*(ve|\/|-)\s*sonra\b/i, ad: '"önce / sonra"' },
];
export function yasakIfade(metin: unknown): string | null {
  const s = String(metin || '');
  if (!s.trim()) return null;
  const hit = YASAK_IFADELER.find(y => y.re.test(s));
  return hit ? hit.ad : null;
}

/** Footer'daki genel bildirim — tüm sayfaların en altında. */
export const FOOTER_BILDIRIMI: string[] = [
  'Hekimhane.com.tr, doktorlar ve sağlık kuruluşları hakkında genel bilgiye ulaşmayı kolaylaştıran bir rehberdir. Hekimhane bir sağlık kuruluşu değildir, sağlık hizmeti sunmaz, tıbbi tavsiye vermez ve hiçbir doktoru veya sağlık kuruluşunu tavsiye etmez ya da desteklemez.',
  'Profillerdeki bilgiler kamuya açık kaynaklardan derlenmiş olabilir. Randevu öncesinde bilgileri ilgili sağlık kuruluşundan teyit etmenizi öneririz. "Sahiplenilmiş" rozeti, profilin doktorun kendisi veya kuruluşun yetkilisi tarafından doğrulandığını ve yönetildiğini gösterir; bu rozet bir kalite değerlendirmesi veya tavsiye anlamına gelmez.',
  'Hasta görüşleri, ilgili doktorun veya kuruluşun talebi ya da yönlendirmesi olmadan hastalar tarafından bağımsız olarak yazılır. Doktorlar görüşleri silemez veya seçemez, yalnızca yanıt verebilir.',
  'Arama sonuçları uzmanlık, konum ve profil bilgilerinin güncelliği gibi ölçütlere göre sıralanır. Ücretli paketler sıralamayı veya görünürlüğü etkilemez. Sitedeki yapay zekâ asistanı tıbbi tavsiye vermez. Acil durumlarda 112\'yi arayın.',
];

/** Footer bildiriminin ve iki aydınlatma metninin son güncelleme tarihi (metin değişince güncelle). */
export const FOOTER_BILDIRIMI_GUNCELLEME = '25 Ekim 2026';
export const UYUM_GUNCELLEME = FOOTER_BILDIRIMI_GUNCELLEME;

/** Randevu e-postasının (işletmeye giden) alt notu — düz metin, bağlantılar çağıran tarafta eklenir. */
export const RANDEVU_EPOSTA_ALT_NOTU =
  'Bu e-postayı, Hekimhane\'deki profilinizde yer alan iletişim bilgileri üzerinden bir hasta adayının randevu talebini size iletmek için gönderiyoruz. Hekimhane profillerdeki bilgileri kamuya açık kaynaklardan derleyebilir. Bu e-posta yalnızca randevu talebini iletmek için gönderilmiştir.';

/** Randevu formunda, yalnız hasta not yazdığında görünen açık rıza kutusunun metni. */
export function saglikRizaMetni(isletmeAdi: string): string {
  return `Randevu talebime eklediğim şikâyet ve sağlık durumu bilgilerimin, talebimin ${isletmeAdi} adlı doktora veya kuruma iletilmesi amacıyla Hekimhane tarafından işlenmesine ve bu doktora veya kuruma aktarılmasına açık rıza veriyorum. Bu onayı vermesem de randevu talebimi sağlık bilgisi olmadan iletebileceğimi biliyorum.`;
}
