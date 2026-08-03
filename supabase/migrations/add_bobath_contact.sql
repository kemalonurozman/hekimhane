-- ================================================================
--  Bobath Terapistleri + gizli iletişim (e-posta/telefon) desteği
--  doktorlar tablosuna e-posta kolonu + contact_hidden bayrağı ekler.
--  Supabase SQL Editor'da çalıştır, ardından:  NOTIFY pgrst, 'reload schema';
-- ================================================================

ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS email          TEXT;
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS contact_hidden BOOLEAN DEFAULT false; -- true → tel+email herkese gizli

-- Mevcut doktorların iletişimi açık kalsın (yalnız Bobath importu true yazar)
UPDATE doktorlar SET contact_hidden = false WHERE contact_hidden IS NULL;

CREATE INDEX IF NOT EXISTS idx_doktorlar_contact_hidden ON doktorlar(contact_hidden);

NOTIFY pgrst, 'reload schema';
