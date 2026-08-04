-- Klinik profiline "Mesleki Bilgiler" (hekim özgeçmişi + eğitim) alanları.
-- Diş klinikleri hekim-adlı olduğundan doktorlardaki Mesleki Bilgiler kliniklere de açılır.
-- Yoksa bölüm gizli kalır (graceful).
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS okul text;
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS uzmanlik_kurum text;
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS deneyim_baslangic integer;
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS deneyimler jsonb DEFAULT '[]'::jsonb;
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS sertifikalar jsonb DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
