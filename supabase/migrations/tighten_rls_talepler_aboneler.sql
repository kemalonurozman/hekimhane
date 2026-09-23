-- Hasta / kişisel veri taşıyan tablolarda HERKESE AÇIK SELECT ve UPDATE kaldırılıyor (2026-09-22)
--
-- Eski durum: randevu_talepleri, cekim_talepleri ve email_aboneleri üzerinde
-- "USING (TRUE)" politikaları vardı → hasta adı, telefon ve e-postalar PUBLIC
-- (anon) anahtarla okunup güncellenebiliyordu. Bunu gerektiren tek yer admin
-- panelinin bu tabloları tarayıcıdan okumasıydı; artık service-role rotalar
-- (api/admin/talepler, api/admin/aboneler) kullanılıyor. İşletme paneli
-- (api/panel/*), MCP sunucusu ve cron zaten service-role ile çalışıyor.
--
-- INSERT politikaları KORUNUR: public formlar (randevu talebi, 360° çekim
-- talebi, e-bülten aboneliği) anon anahtarla satır ekler.
--
-- Önce deploy edin (kod dolu_slotlar fonksiyonunu kullanacak şekilde güncellendi,
-- fonksiyon yoksa eski sorguya düşer), sonra bu dosyayı SQL Editor'da çalıştırın.

-- 1) Profil sayfası ve randevu embed'inin ihtiyacı olan TEK şey dolu slot listesi.
--    Yalnızca slotu döndüren SECURITY DEFINER fonksiyon — ad/telefon sızmaz.
CREATE OR REPLACE FUNCTION public.dolu_slotlar(p_entity_id text)
RETURNS SETOF text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT randevu_slot::text
    FROM randevu_talepleri
   WHERE entity_id = p_entity_id
     AND randevu_slot IS NOT NULL
     AND status IS DISTINCT FROM 'iptal';
$$;
REVOKE ALL ON FUNCTION public.dolu_slotlar(text) FROM public;
GRANT EXECUTE ON FUNCTION public.dolu_slotlar(text) TO anon, authenticated;

-- 2) Herkese açık SELECT / UPDATE politikalarını kaldır
DROP POLICY IF EXISTS "Admin okuyabilir"           ON randevu_talepleri;
DROP POLICY IF EXISTS "Admin güncelleyebilir"      ON randevu_talepleri;
DROP POLICY IF EXISTS "Admin okuyabilir"           ON email_aboneleri;
DROP POLICY IF EXISTS "Admin güncelleyebilir"      ON email_aboneleri;
DROP POLICY IF EXISTS "Admin her şeyi okuyabilir"  ON cekim_talepleri;
DROP POLICY IF EXISTS "Admin güncelleme yapabilir" ON cekim_talepleri;

NOTIFY pgrst, 'reload schema';
