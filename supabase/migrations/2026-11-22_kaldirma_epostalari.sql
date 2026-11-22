-- ================================================================
--  Kaldırma talepleri — yöneticinin elle gönderdiği e-postaların kaydı (2026-11-22)
--  Admin → Kaldırma Talepleri → "Mail gönder" (talep kartı / Kaldırılan Profiller).
--  Her satır = yöneticinin tek tek gönderdiği BİR e-posta. Toplu/otomatik gönderim yok.
--  Kayıt, aynı kişiye ikinci kez yazmadan önce uyarı göstermek için tutulur.
--  E-posta metni saklanmaz; yalnız şablon, konu, alıcı ve tarih.
--  Bu tablo yoksa gönderim KAPALI kalır (tekrar uyarısı çalışamayacağı için).
--  İkinci tablo kaldirma_eposta_ret: e-posta istemediğini bildiren adresler (aşağıda).
--  Daha önce çalıştırdıysanız yeniden çalıştırın (IF NOT EXISTS, güvenli).
--  Önce 2026-10-25_profil_kaldirma.sql + 2026-10-26_kaldirma_karari.sql çalışmış olmalı.
--  Supabase SQL Editor'da çalıştırın.
-- ================================================================

CREATE TABLE IF NOT EXISTS kaldirma_epostalari (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talep_id      UUID NOT NULL,        -- profil_kaldirma_talepleri.id (alıcı bu talepten çözülür)
  kaldirilan_id UUID,                 -- kaldirilan_profiller.id (Kaldırılan Profiller'den gönderildiyse)
  alici         TEXT NOT NULL,        -- küçük harf; aynı kişiye tekrar uyarısı buna bakar
  sablon        TEXT NOT NULL,        -- veda | ozellik | davet | alternatif | serbest
  konu          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kaldirma_epostalari_talep_idx ON kaldirma_epostalari (talep_id, created_at DESC);
CREATE INDEX IF NOT EXISTS kaldirma_epostalari_alici_idx ON kaldirma_epostalari (alici);

-- Yalnız service role (admin API) okur/yazar; politika yok = anon/authenticated erişemez.
ALTER TABLE kaldirma_epostalari ENABLE ROW LEVEL SECURITY;

-- Ret: "bu tür e-posta almak istemiyorum" diye yanıtlayan adres (yönetici elle işaretler).
-- Bu adrese elle e-posta gönderilemez; otomatik "profil kaldırıldı" e-postasında tanıtım bölümü çıkmaz.
CREATE TABLE IF NOT EXISTS kaldirma_eposta_ret (
  alici      TEXT PRIMARY KEY,        -- küçük harf
  talep_id   UUID,                    -- işaretlendiği talep (bilgi için)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE kaldirma_eposta_ret ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
