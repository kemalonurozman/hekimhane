-- Web bağlantıları (Eki 2026)
-- Doktor profilinde web sitesi alanı yoktu (doktorlar tablosunda kolon yok);
-- tüm türlere ikinci bir bağlantı (ör. kurumun resmi randevu sayfası) eklendi.
-- İkisi de Pro'ya kilitli: panel + /api/panel/update-entity PRO_FIELDS.
-- Kolon yokken kayıt "website kolonu veritabanında yok" uyarısıyla reddedilir.

ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS website  text;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS website2 text;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS website2 text;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS website2 text;

NOTIFY pgrst, 'reload schema';
