-- WhatsApp numarası alanı — işletme/doktor kendi WhatsApp numarasını girer.
-- Boşsa profilde WhatsApp butonu görünmez (telefon körü körüne WhatsApp sayılmaz).
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS whatsapp text;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
