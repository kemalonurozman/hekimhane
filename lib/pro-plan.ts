/**
 * Hekimhane-Pro üyelik planı — UI'da gösterilen fiyat tek noktadan.
 * Gerçek tahsilat Stripe Payment Link'in fiyatından yapılır (Ağu 2026:
 * 190 TL/ay, canlı mod); burası yalnızca görünen metin içindir.
 * Stripe'da fiyat değişirse burayı da güncelle — ekrandaki tutar ile
 * çekilen tutar asla farklı olmamalı.
 */
export const PRO_AYLIK_TL = 190;

/** Buton/rozetlerde kullanılan kısa etiket, ör. "190 TL/ay" */
export const PRO_FIYAT_ETIKET = `${PRO_AYLIK_TL} TL/ay`;
