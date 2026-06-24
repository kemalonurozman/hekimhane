-- Sosyal medya + çalışma saatleri kolonları
-- Supabase Dashboard → SQL Editor'da çalıştırın

ALTER TABLE klinikler
  ADD COLUMN IF NOT EXISTS instagram_url      TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS calisma_saatleri   TEXT,
  ADD COLUMN IF NOT EXISTS acik_24_saat       BOOLEAN DEFAULT FALSE;

ALTER TABLE hastaneler
  ADD COLUMN IF NOT EXISTS instagram_url      TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS calisma_saatleri   TEXT,
  ADD COLUMN IF NOT EXISTS acik_24_saat       BOOLEAN DEFAULT FALSE;

ALTER TABLE doktorlar
  ADD COLUMN IF NOT EXISTS instagram_url      TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS calisma_saatleri   TEXT,
  ADD COLUMN IF NOT EXISTS acik_24_saat       BOOLEAN DEFAULT FALSE;

ALTER TABLE eczaneler
  ADD COLUMN IF NOT EXISTS instagram_url      TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS calisma_saatleri   TEXT,
  ADD COLUMN IF NOT EXISTS acik_24_saat       BOOLEAN DEFAULT FALSE;

-- Schema cache yenile
NOTIFY pgrst, 'reload schema';
