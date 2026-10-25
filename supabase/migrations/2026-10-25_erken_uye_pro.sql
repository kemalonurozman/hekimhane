-- İlk kullanıcılara ücretsiz Pro (Eki 2026)
-- Sahiplenmesi onaylanan (ya da admin tarafından sahibi atanan) ilk 100 işletme
-- Stripe aboneliği olmadan Pro'ya geçirilir. Kota yalnız kaynak='otomatik' satırları sayar.
-- Satır, panelde bir kez gösterilen kutlama penceresinin de kaynağıdır (kutlama_goruldu).
-- RLS açık, politika yok → yalnız service-role okur/yazar.

CREATE TABLE IF NOT EXISTS erken_uye_pro (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type      text NOT NULL CHECK (entity_type IN ('klinik','hastane','doktor','eczane')),
  entity_id        text NOT NULL,
  entity_name      text,
  email            text,
  sira             integer,                          -- otomatik verilenlerde 1..100
  kaynak           text NOT NULL DEFAULT 'otomatik', -- 'otomatik' | 'elle'
  kutlama_goruldu  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS erken_uye_pro_entity_uq ON erken_uye_pro (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS erken_uye_pro_kaynak_idx ON erken_uye_pro (kaynak);
ALTER TABLE erken_uye_pro ENABLE ROW LEVEL SECURITY;

-- Elle Pro verilen iki kurucu profil: kutlama penceresini görürler, kotadan düşmezler.
INSERT INTO erken_uye_pro (entity_type, entity_id, entity_name, kaynak)
SELECT 'doktor', id, trim(coalesce(unvan,'') || ' ' || ad || ' ' || soyad), 'elle'
  FROM doktorlar WHERE slug = 'fiziksel-tip-ve-rehabilitasyon-osman-alper-arslan-ankara'
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO erken_uye_pro (entity_type, entity_id, entity_name, kaynak)
SELECT 'klinik', id, name, 'elle'
  FROM klinikler WHERE slug = 'ankara-cankaya-ozel-klinik-99-agiz-ve-dis-sagligi-poliklinigi'
ON CONFLICT (entity_type, entity_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
