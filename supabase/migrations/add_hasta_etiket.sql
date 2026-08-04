-- Hasta etiketleri — "Yeni hasta", "Tedavi sürüyor", "VIP" vb. (renkli filtreleme).
ALTER TABLE hastalar ADD COLUMN IF NOT EXISTS etiketler jsonb DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
