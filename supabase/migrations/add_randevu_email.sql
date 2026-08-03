-- Randevu bildirim e-postası — işletme, randevu taleplerinin gideceği adresi seçer.
-- Boş/NULL ise "hesabımla aynı" (onaylı claim e-postası) kullanılır; doluysa bu adrese gider.
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS randevu_email text;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS randevu_email text;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS randevu_email text;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS randevu_email text;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
