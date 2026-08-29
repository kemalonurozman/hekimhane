/**
 * Hekimhane-Pro üyelik planı — UI'da gösterilen fiyat tek noktadan.
 * Gerçek tahsilat Stripe'daki Hekimhane-Pro ürününün fiyatından yapılır
 * (lib/stripe.ts → getProPriceId); burası yalnızca görünen metin içindir.
 * Stripe'da fiyat değişirse burayı da güncelle.
 */
export const PRO_AYLIK_TL = 150;

/** Buton/rozetlerde kullanılan kısa etiket: "150 TL/ay" */
export const PRO_FIYAT_ETIKET = `${PRO_AYLIK_TL} TL/ay`;
