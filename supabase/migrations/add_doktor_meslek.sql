-- Doktor "Mesleki Bilgiler" alanları — hekim panelden kendi ekler.
-- uzmanlik_kurum   : Uzmanlık eğitimini aldığı kurum (metin)
-- deneyim_baslangic: Mesleğe başlangıç yılı (örn. 2013) → "X yıl deneyim" bundan hesaplanır
-- deneyimler       : İş geçmişi [{kurum, baslangic, bitis}] (bitis boşsa "Günümüz")
-- sertifikalar     : Sertifikalar [{ad, url}] (url = görsel bağlantısı)
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS uzmanlik_kurum    text;
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS deneyim_baslangic integer;
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS deneyimler        jsonb DEFAULT '[]'::jsonb;
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS sertifikalar      jsonb DEFAULT '[]'::jsonb;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
