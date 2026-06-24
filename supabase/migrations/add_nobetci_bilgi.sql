-- Eczaneler tablosuna nöbet bilgisi kolonu ekle
ALTER TABLE eczaneler
  ADD COLUMN IF NOT EXISTS nobetci_bilgi TEXT;

-- Schema cache yenile
NOTIFY pgrst, 'reload schema';
