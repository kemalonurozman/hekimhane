-- Profil puanı (0–100): profilin ne kadar eksiksiz doldurulduğu. Ziyaretçiye gösterilmez;
-- liste sırasını (Pro → profil puanı → hasta puanı) ve ana sayfa öne çıkanlarını belirler.
-- Çalıştırdıktan sonra mevcut profiller için:  node scripts/profil-puani-hesapla.mjs --commit
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS profil_puani integer NOT NULL DEFAULT 0;
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS profil_puani integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS klinikler_siralama_idx ON klinikler (premium DESC NULLS LAST, profil_puani DESC, rat DESC);
CREATE INDEX IF NOT EXISTS doktorlar_siralama_idx ON doktorlar (premium DESC NULLS LAST, profil_puani DESC, rat DESC);
NOTIFY pgrst, 'reload schema';
