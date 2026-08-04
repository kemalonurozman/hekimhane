-- Doktor profiline "Yabancı Diller" alanı (Mesleki Bilgiler bölümü).
-- Dizi olarak saklanır: ["İngilizce","Almanca"]. Yoksa bölüm gizli kalır (graceful).
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS yabanci_diller jsonb DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
