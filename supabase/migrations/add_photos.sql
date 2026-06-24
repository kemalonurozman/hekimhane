-- İşletme fotoğraf dizisi — URL listesi (Supabase Storage veya harici CDN)
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Schema cache'ini yenile
NOTIFY pgrst, 'reload schema';

-- 360° panorama fotoğraf URL (equirectangular)
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photo360 TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photo360 TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photo360 TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photo360 TEXT;

NOTIFY pgrst, 'reload schema';
