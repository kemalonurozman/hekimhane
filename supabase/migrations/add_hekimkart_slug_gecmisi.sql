-- HekimKart adres geçmişi
--
-- Kartın adresi (slug) değiştiğinde eski adres bu diziye eklenir; /kart/<eski>
-- isteği 308 ile yeni adrese yönlendirilir. Böylece basılmış QR kodlar,
-- sosyal medyada paylaşılmış bağlantılar ve Google'daki eski sonuçlar
-- ölmez.
--
-- Supabase SQL Editor'da bir kez çalıştırın.

ALTER TABLE hekimkartlar
  ADD COLUMN IF NOT EXISTS eski_sluglar text[] DEFAULT '{}'::text[];

-- Eski adres aramasını hızlandırır (dizi içinde arama)
CREATE INDEX IF NOT EXISTS hekimkartlar_eski_sluglar_idx
  ON hekimkartlar USING GIN (eski_sluglar);

NOTIFY pgrst, 'reload schema';
