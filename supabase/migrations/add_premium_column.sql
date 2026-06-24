-- Premium hesap kolonu — tüm işletme tablolarına eklendi
-- Supabase Dashboard → SQL Editor'da çalıştırın

ALTER TABLE klinikler
  ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

ALTER TABLE hastaneler
  ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

-- doktorlar tablosunda premium zaten var, IF NOT EXISTS ile güvenli
ALTER TABLE doktorlar
  ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

ALTER TABLE eczaneler
  ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

-- Schema cache yenile
NOTIFY pgrst, 'reload schema';
