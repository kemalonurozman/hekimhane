-- Mevcut Supabase Auth kullanıcılarını email_aboneleri tablosuna aktar
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- Not: email_aboneleri tablosunun önce oluşturulmuş olması gerekir
--   (add_email_aboneleri.sql migration'ı çalıştırılmış olmalı)

INSERT INTO email_aboneleri (email, isim, tip, kaynak, aktif)
SELECT
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    NULL
  )                      AS isim,
  'hasta'                AS tip,
  'giris'                AS kaynak,
  TRUE                   AS aktif
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT ON CONSTRAINT email_aboneleri_uniq DO NOTHING;

-- Kaç kullanıcı aktarıldığını göster
SELECT COUNT(*) AS aktarilan FROM email_aboneleri WHERE kaynak = 'giris';
