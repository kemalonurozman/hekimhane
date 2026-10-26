-- ─────────────────────────────────────────────────────────────────
--  Profil kaldırma akışı (Eki 2026) — "Hekimhane Uyum Güncellemeleri" belgesi, madde 2.
--
--  1) `gizli` kolonu: kaldırma talebi geldiği anda profil yayından çekilir
--     (detay sayfası 404 verir); onay gelince kayıt silinir.
--  2) `profil_kaldirma_talepleri`: başvuru kaydı + tek kullanımlık onay bağlantısı
--     (token'ın SHA-256 özeti tutulur, açık token yalnız e-postada).
--  3) `kaldirilan_profiller`: "kaldırıldı listesi" — yalnız ad, il, tür ve tarih;
--     içe aktarma betikleri yeniden eklememek için buraya bakar.
--
--  Kolon/tablo yoksa kod graceful davranır: gizleme sessizce atlanır, talep
--  cekim_talepleri'ne düşer ve admin e-postası yine gider — ama onay bağlantısı
--  çalışmaz. Bu dosya çalıştırılmadan akış tamamlanmaz.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS gizli BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS gizli BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS gizli BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS gizli BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS profil_kaldirma_talepleri (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL,                -- klinik | hastane | doktor | eczane
  entity_id     TEXT NOT NULL,
  entity_name   TEXT,
  il            TEXT,
  ad_soyad      TEXT NOT NULL,
  talep_eden    TEXT NOT NULL DEFAULT 'sahip', -- sahip | yetkili
  email         TEXT NOT NULL,
  tel           TEXT,
  aciklama      TEXT,
  token_hash    TEXT NOT NULL UNIQUE,         -- SHA-256(token)
  token_son     TIMESTAMPTZ NOT NULL,         -- bağlantının geçerlilik sonu
  status        TEXT NOT NULL DEFAULT 'bekliyor', -- bekliyor | onaylandi | iptal
  ip            TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS profil_kaldirma_entity_idx ON profil_kaldirma_talepleri (entity_type, entity_id);
ALTER TABLE profil_kaldirma_talepleri ENABLE ROW LEVEL SECURITY;   -- politika yok → yalnız service-role

CREATE TABLE IF NOT EXISTS kaldirilan_profiller (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT NOT NULL,
  eski_entity_id  TEXT,
  ad              TEXT NOT NULL,
  il              TEXT,
  talep_tarihi    DATE NOT NULL,
  kaldirma_tarihi TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kaldirilan_profiller_ad_idx ON kaldirilan_profiller (lower(ad), il);
ALTER TABLE kaldirilan_profiller ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
