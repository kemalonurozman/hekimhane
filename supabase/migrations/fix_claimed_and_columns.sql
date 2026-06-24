-- ── 1. Eksik kolonları ekle (tüm tablolar) ──────────────────────────
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photos     TEXT[];

ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photos     TEXT[];

ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photos     TEXT[];

ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photos     TEXT[];

-- Yorum yanıt kolonları
ALTER TABLE yorumlar   ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE yorumlar   ADD COLUMN IF NOT EXISTS reply_at   TIMESTAMPTZ;

-- ── 2. Uzm. Dt. Deniz Bayramoğlu kliniğini claimed = true yap ──────
UPDATE klinikler
SET claimed = true
WHERE name ILIKE '%Deniz Bayramoğlu%'
   OR name ILIKE '%Bayramoglu%';

-- ── 3. PostgREST şema cache yenile ─────────────────────────────────
NOTIFY pgrst, 'reload schema';
