-- ============================================================
-- FIX: İşletme paneli RLS hataları
-- Supabase → SQL Editor'da çalıştırın.
--
-- Sorun 1: profiles üzerindeki "Admins can view all profiles" politikası
--          kendi içinde profiles'ı sorguluyor → SONSUZ DÖNGÜ. Bu, profiles'a
--          bağlı her sorguyu (claim_requests dahil) çökertiyordu.
-- Sorun 2: claim_requests talepleri user_id yerine E-POSTA ile saklanıyor,
--          ama okuma politikası user_id eşliyordu → işletme sahibi kendi
--          talebini panelde göremiyordu.
--
-- Not: Admin işlemleri uygulamada service-role ile yapılıyor (RLS'i bypass
--      eder), bu yüzden recursive admin politikalarına gerek yok.
-- ============================================================

-- 1) Sonsuz döngüyü kır
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 2) claim_requests: recursive admin politikasını kaldır
DROP POLICY IF EXISTS "Admins manage claims" ON claim_requests;

-- 3) Kullanıcı kendi taleplerini e-postasıyla (veya user_id ile) görebilsin
DROP POLICY IF EXISTS "Users can view own claims" ON claim_requests;
CREATE POLICY "Kendi taleplerini gorebilir" ON claim_requests
  FOR SELECT USING (
    email = (auth.jwt() ->> 'email') OR auth.uid() = user_id
  );

NOTIFY pgrst, 'reload schema';
