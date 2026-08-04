-- Hasta dosyaları — röntgen / ağız içi foto / reçete vb.
-- Dosyalar PRIVATE Supabase Storage bucket'ında ('hasta-dosyalari') tutulur;
-- burada yalnız META veri (yol, ad, tip) durur. Erişim zaman-sınırlı signed URL ile,
-- yalnız onaylı işletme sahibine (KVKK — hassas sağlık verisi).
CREATE TABLE IF NOT EXISTS hasta_dosyalari (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  text NOT NULL,
  tel        text NOT NULL,
  yol        text NOT NULL,      -- private bucket içindeki dosya yolu
  ad         text,               -- orijinal dosya adı
  tip        text,               -- mime türü
  boyut      bigint,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hasta_dosyalari_entity_tel ON hasta_dosyalari (entity_id, tel);

NOTIFY pgrst, 'reload schema';
