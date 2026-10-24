-- Hekimhane Booking — başvurular (kurulum için arama + demo talebi)
-- Supabase Dashboard → SQL Editor'da çalıştırın. Tekrar çalıştırmak güvenlidir.
-- Tarih: 2026-10-24

CREATE TABLE IF NOT EXISTS booking_bekleme (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad           TEXT NOT NULL,
  soyad        TEXT NOT NULL,
  email        TEXT NOT NULL,
  tel          TEXT NOT NULL,
  -- hekim | dis_hekimi | klinik_yonetici | hastane | sekreter | diger
  rol          TEXT NOT NULL,
  -- kurulum (beni arayın) | demo
  talep        TEXT NOT NULL DEFAULT 'kurulum',
  kurum_adi    TEXT,
  il           TEXT,
  -- telefon | web | mesaj
  kanallar     TEXT[] NOT NULL DEFAULT '{}',
  -- günlük çağrı sayısı aralığı (fiyat teklifi için)
  cagri_hacmi  TEXT,
  mesaj        TEXT,
  -- E-bülten / ticari ileti izni (isteğe bağlı kutu)
  bulten       BOOLEAN NOT NULL DEFAULT FALSE,
  kaynak       TEXT NOT NULL DEFAULT 'booking-sayfasi',
  -- Satış takibi (yalnız admin değiştirir)
  durum        TEXT NOT NULL DEFAULT 'yeni'
               CHECK (durum IN ('yeni', 'iletisim', 'teklif', 'kazanildi', 'kapandi')),
  admin_notu   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tablo daha önce talep kolonu olmadan oluşturulduysa
ALTER TABLE booking_bekleme ADD COLUMN IF NOT EXISTS talep TEXT NOT NULL DEFAULT 'kurulum';

-- Başvurunun geldiği özellik sayfası (booking | randevu-sistemi | randevu-modulu | mcp | pro | hekimkart | degerlendirme | genel)
ALTER TABLE booking_bekleme ADD COLUMN IF NOT EXISTS urun TEXT NOT NULL DEFAULT 'booking';

-- Aynı e-posta aynı ürün için ikinci kez gelirse yeni satır açılmaz, mevcut kayıt güncellenir
DROP INDEX IF EXISTS booking_bekleme_email_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS booking_bekleme_email_urun_uniq ON booking_bekleme (lower(email), urun);
CREATE INDEX IF NOT EXISTS booking_bekleme_durum_idx ON booking_bekleme (durum);
CREATE INDEX IF NOT EXISTS booking_bekleme_created_idx ON booking_bekleme (created_at DESC);

-- RLS açık, politika YOK → yalnız service-role (API rotaları) okur/yazar.
-- Kişisel veri (ad, telefon, e-posta) tarayıcıdan okunamaz.
ALTER TABLE booking_bekleme ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
