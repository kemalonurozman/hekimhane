-- Randevu hatırlatma — hastaya yarınki randevusu için tek sefer hatırlatma maili
-- gönderildi mi? (çift gönderimi önler)
ALTER TABLE randevu_talepleri ADD COLUMN IF NOT EXISTS hatirlatildi boolean DEFAULT false;

NOTIFY pgrst, 'reload schema';
