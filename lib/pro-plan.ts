/**
 * Hekimhane-Pro üyelik planı — UI'da gösterilen fiyat tek noktadan.
 * Gerçek tahsilat Stripe Payment Link'in fiyatından yapılır (Eki 2026:
 * 290 TL/ay — Stripe'daki Payment Link fiyatı da 290 olmalı; yayına almadan
 * önce kontrol et); burası yalnızca görünen metin içindir.
 * Stripe'da fiyat değişirse burayı da güncelle — ekrandaki tutar ile
 * çekilen tutar asla farklı olmamalı.
 */
export const PRO_AYLIK_TL = 290;

/** Buton/rozetlerde kullanılan kısa etiket, ör. "290 TL/ay" */
export const PRO_FIYAT_ETIKET = `${PRO_AYLIK_TL} TL/ay`;
