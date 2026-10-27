-- Yorum Yayınlama Kuralları kabul kaydı + "geliştirilebilir noktalar" seçimi (Eki 2026)
-- Yoksa: yorumlar yine kaydolur (onay bekler) ama kabul zamanı/sürümü ve seçimler saklanmaz.
alter table public.yorumlar add column if not exists kurallar_onay_at timestamptz;
alter table public.yorumlar add column if not exists kurallar_surum text;
alter table public.yorumlar add column if not exists gelistirme text[];

notify pgrst, 'reload schema';
