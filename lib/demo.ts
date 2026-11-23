// ─────────────────────────────────────────────────────────────────
//  Deneme hesabı — tek kaynak (client + server + middleware ortak; Node/sunucu
//  importu KOYMA, middleware Edge'de çalışır).
//
//  Ne: Ankara/Çankaya'da gerçek görünen ama gerçek olmadığını açıkça söyleyen bir
//  diş kliniği profili ("Lilly Diş Kliniği", klinikler) + ona bağlı bir panel hesabı. Profil listelerde,
//  aramada, site haritasında ve Google'da görünmez; yalnız gönderilen bağlantıyla
//  açılır. Panele `/deneme-hesabi?k=<anahtar>` bağlantısıyla şifresiz girilir.
//
//  Güvenlik: deneme hesabı oturumu yalnız aşağıdaki "izinli" panel yazmalarını
//  yapabilir; e-posta gönderen, ödeme, davet, dosya yükleme, sahiplik bırakma vb.
//  işlemler middleware'de ve sunucu oturum çözümünde (lib/panel-oturum.ts) kapalı.
//  Deneme işletmesine ait hiçbir kayıtta hasta e-postası tutulmaz → hiçbir
//  randevu/yorum maili çıkmaz. Veriler her gece sıfırlanır (lib/demo-sunucu.ts).
// ─────────────────────────────────────────────────────────────────

/** Deneme işletmesinin kimliği (klinikler.id). Gerçek kayıtlar k + sayı biçimindedir. */
export const DEMO_KLINIK_ID = 'kdeneme1';
export const DEMO_SLUG = 'deneme-lilly-dis-klinigi';
export const DEMO_IL = 'Ankara';
export const DEMO_ILCE = 'Çankaya';
/** Profil adresi (il/ilçe detay sayfalarındaki biçimle aynı). */
export const DEMO_PROFIL_YOLU = `/klinikler/ankara/cankaya/${DEMO_SLUG}`;

/** Deneme panel hesabının Supabase Auth kimliği — sabit, e-posta değişse de bu kalır. */
export const DEMO_KULLANICI_ID = '6e5f0d1a-3c2b-4d7e-9a10-de0e0de0e001';
/** Bu adrese hiçbir e-posta gönderilmez; yalnız oturum ve sahiplik eşleşmesi için. */
export const DEMO_EPOSTA = 'deneme.hesap@hekimhane.com.tr';

export const DEMO_AD = 'Lilly Diş Kliniği';
export const DEMO_ROL = '[deneme] Deneme hesabı — gerçek bir işletme değildir';

export const DEMO_METIN = {
  profilBaslik: 'Bu bir deneme profilidir',
  profilGovde: 'Lilly Diş Kliniği gerçek bir klinik değildir. Bu sayfa, Hekimhane\'de bir diş kliniği profilinin nasıl göründüğünü göstermek için oluşturuldu. Adres, yorumlar ve randevular örnektir; bu profil üzerinden gerçek bir randevu alınamaz.',
  panelBaslik: 'Deneme hesabındasınız',
  panelGovde: 'Bu panel gerçek bir işletmeye ait değildir. Randevu, hasta ve profil ekranlarını serbestçe deneyebilirsiniz; e-posta gönderme, ödeme, ekip daveti ve dosya yükleme kapalıdır; profilde ad, iletişim bilgileri ve bağlantılar değişmez. Yaptığınız değişiklikler her gece sıfırlanır.',
  kapali: 'Deneme hesabında bu işlem kapalı. Kendi işletmeniz için ücretsiz hesap açabilirsiniz.',
} as const;

export const demoMu = (id: unknown) => String(id ?? '') === DEMO_KLINIK_ID;

/**
 * Deneme oturumunun yapabildiği panel yazmaları. Burada olmayan her yazma
 * (POST/PUT/PATCH/DELETE) aşağıdaki korumalı öneklerde reddedilir.
 * Bir rotayı eklemeden önce: deneme işletmesi için e-posta göndermediğinden,
 * dosya/ödeme/davet üretmediğinden emin ol.
 */
const IZINLI_YAZMA = new Set([
  '/api/panel/randevu-talepleri',   // durum, erteleme, çöp kutusu (deneme talepleri e-postasız)
  '/api/panel/randevu-ekle',        // e-posta alanı deneme işletmesinde atılır
  '/api/panel/update-entity',       // profil düzenleme (her gece sıfırlanır)
  '/api/panel/reply-yorum',         // örnek yorumlara yanıt (yorumcu e-postası yok)
  '/api/panel/hasta-notu',
  '/api/panel/hasta-islem',
  '/api/panel/hasta-sil',
  '/api/panel/erken-uye',           // yalnız "görüldü" işareti
]);

/** Oturum gerektiren, deneme hesabına kapalı yazma alanları. */
const KORUMALI_ONEK = ['/api/panel/', '/api/kart', '/api/stripe/', '/api/hesap/', '/api/claim', '/api/admin/'];

/** Deneme oturumu bu isteği yapamaz mı? (yalnız yazma istekleri) */
export function demoYazmaKapali(pathname: string, method: string): boolean {
  const m = (method || 'GET').toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return false;
  const yol = pathname.replace(/\/+$/, '');
  if (IZINLI_YAZMA.has(yol)) return false;
  return KORUMALI_ONEK.some(o => yol === o.replace(/\/$/, '') || yol.startsWith(o));
}
