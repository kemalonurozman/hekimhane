-- Bozuk doktor kayıtlarını temizle
-- Supabase Dashboard → SQL Editor'da ÖNCE SELECT ile kontrol edin, sonra DELETE çalıştırın.

-- ── ADIM 1: Hangi kayıtlar silinecek? (Önce bunu çalıştırıp kontrol edin) ───────
SELECT id, ad, soyad, spec, il, ilce
FROM doktorlar
WHERE
  -- ad alanına bio/eğitim metni girilmiş (gerçek isim 60 karakterden kısa olur)
  LENGTH(ad) > 60
  OR ad ILIKE '%tarafından%'
  OR ad ILIKE '%fakültesi%'
  OR ad ILIKE '%ödülü%'
  OR ad ILIKE '%hastanesi%'
  OR ad ILIKE '%fellowship%'
  OR ad ILIKE '%üretilmektedir%'
  OR ad ILIKE '%başkanlığı%'
  OR ad ILIKE '%derneği%'
  -- ad alanında noktalı virgül var (birden fazla bilgi birleştirilmiş)
  OR ad LIKE '%;%'
  -- il alanına uzmanlık metni girilmiş (gerçek şehir adı 30 karakterden kısa olur)
  OR (il IS NOT NULL AND LENGTH(il) > 30)
ORDER BY ad;


-- ── ADIM 2: Yukarıdaki SELECT sonuçlarını onayladıktan sonra bu DELETE'i çalıştırın ───
/*
DELETE FROM doktorlar
WHERE
  LENGTH(ad) > 60
  OR ad ILIKE '%tarafından%'
  OR ad ILIKE '%fakültesi%'
  OR ad ILIKE '%ödülü%'
  OR ad ILIKE '%hastanesi%'
  OR ad ILIKE '%fellowship%'
  OR ad ILIKE '%üretilmektedir%'
  OR ad ILIKE '%başkanlığı%'
  OR ad ILIKE '%derneği%'
  OR ad LIKE '%;%'
  OR (il IS NOT NULL AND LENGTH(il) > 30);
*/
