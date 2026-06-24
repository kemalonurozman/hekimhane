-- HekimKart: IBAN alanı ekle
ALTER TABLE hekimkartlar
  ADD COLUMN IF NOT EXISTS iban TEXT NOT NULL DEFAULT '';

-- Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
