-- HekimKart: rezervasyon, website ve harita linkleri
ALTER TABLE hekimkartlar
  ADD COLUMN IF NOT EXISTS rezervasyon_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website_url     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maps_url        TEXT NOT NULL DEFAULT '';

NOTIFY pgrst, 'reload schema';

-- Hekimhane profil URL'si (otomatik doldurulur)
ALTER TABLE hekimkartlar
  ADD COLUMN IF NOT EXISTS hekimhane_url TEXT NOT NULL DEFAULT '';
