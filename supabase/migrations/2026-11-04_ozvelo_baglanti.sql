-- Hekimhane ↔ Ozvelo bağlantısı (yapay zekâ asistanı)
-- Supabase SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak zararsızdır.
--
-- ozvelo_baglantilari: asistanı etkinleştirilen her işletme için tek satır.
--   Hekimhane bilginin kaynağıdır; Ozvelo'daki işletme bu satırdaki dis_kimlik ile bulunur
--   ("varsa güncelle, yoksa oluştur"). Tabloya yalnız sunucu (service-role) erişir.
-- ozvelo_olaylari: Ozvelo'dan gelen olayların (randevu talebi vb.) tekrar işlenmemesi için.

create table if not exists public.ozvelo_baglantilari (
  id                 uuid primary key default gen_random_uuid(),
  entity_type        text not null check (entity_type in ('klinik', 'doktor')),
  entity_id          text not null,
  dis_kimlik         text not null unique,           -- hekimhane:<tür>:<kimlik>
  ozvelo_isletme_id  text,
  widget_anahtari    text,
  durum              text not null default 'bekliyor'
                       check (durum in ('bekliyor', 'aktif', 'hata', 'kapali')),
  etkinlestiren      text,                            -- etkinleştiren panel kullanıcısının e-postası
  aktarim_onay_at    timestamptz,                     -- "bilgilerim Ozvelo'ya aktarılsın" onayı
  son_ozet           text,                            -- son gönderilen verinin özeti (değişmediyse gönderilmez)
  son_gonderim_at    timestamptz,
  son_basari_at      timestamptz,
  deneme             int not null default 0,
  sonraki_deneme_at  timestamptz,
  son_hata           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create index if not exists ozvelo_baglantilari_durum_idx
  on public.ozvelo_baglantilari (durum, sonraki_deneme_at);

alter table public.ozvelo_baglantilari enable row level security;
-- Politika yok: tarayıcıdan okunamaz/yazılamaz, yalnız service-role.

create table if not exists public.ozvelo_olaylari (
  olay_id           text primary key,
  tur               text not null,
  dis_kimlik        text,
  ozvelo_talep_id   text,
  randevu_talep_id  text,
  created_at        timestamptz not null default now()
);

create index if not exists ozvelo_olaylari_talep_idx
  on public.ozvelo_olaylari (ozvelo_talep_id);

alter table public.ozvelo_olaylari enable row level security;

notify pgrst, 'reload schema';
