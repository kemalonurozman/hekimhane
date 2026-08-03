-- Randevu bloke — işletmenin elle "kapalı/dolu" işaretlediği zamanlar.
-- jsonb dizi; her eleman ya "YYYY-MM-DD" (tüm gün kapalı) ya da
-- "YYYY-MM-DD HH:MM" (tek slot kapalı). Bu slotlar hastalara gösterilmez.
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS randevu_bloke jsonb DEFAULT '[]'::jsonb;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS randevu_bloke jsonb DEFAULT '[]'::jsonb;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS randevu_bloke jsonb DEFAULT '[]'::jsonb;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS randevu_bloke jsonb DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
