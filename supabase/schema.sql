-- ================================================================
-- HEKİMHANE — Supabase Veritabanı Şeması
-- Supabase Dashboard > SQL Editor'a kopyalayıp çalıştırın
-- ================================================================

-- UUID extension
create extension if not exists "uuid-ossp";

-- ================================================================
-- 1. KLİNİKLER
-- ================================================================
create table if not exists klinikler (
  id            text primary key,           -- 'k1', 'k2', ...
  name          text not null,
  type          text,                        -- 'Klinik', 'Özel', 'Diş Hekimi', ...
  il            text,                        -- 'İstanbul'
  ilce          text,                        -- 'Beşiktaş'
  adres         text,
  lat           double precision default 0,
  lng           double precision default 0,
  tel           text,
  website       text,
  maps_url      text,
  specs         text[],                      -- ['Diş Sağlığı', 'Ortodonti']
  rat           double precision default 4.5,
  rev           integer default 0,
  online        boolean default false,
  acil          boolean default false,
  claimed       boolean default false,
  slug          text unique,                 -- 'istanbul-besiktas-xyz-dis-klinigi'
  logo          text,                        -- URL
  cover         text,                        -- URL
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ================================================================
-- 2. HASTANELER
-- ================================================================
create table if not exists hastaneler (
  id            text primary key,
  name          text not null,
  type          text,                        -- 'Özel', 'Devlet', 'Üniversite'
  il            text,
  ilce          text,
  adres         text,
  lat           double precision default 0,
  lng           double precision default 0,
  tel           text,
  website       text,
  maps_url      text,
  specs         text[],
  rat           double precision default 4.5,
  rev           integer default 0,
  docs          integer default 0,           -- doktor sayısı
  beds          integer default 0,           -- yatak sayısı
  founded       integer,                     -- kuruluş yılı
  claimed       boolean default false,
  slug          text unique,
  logo          text,
  cover         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ================================================================
-- 3. DOKTORLAR
-- ================================================================
create table if not exists doktorlar (
  id            text primary key,
  ad            text not null,
  soyad         text not null,
  spec          text,                        -- 'Diş Hekimi', 'Kardiyolog', ...
  il            text,
  ilce          text,
  clinic_name   text,
  rat           double precision default 4.5,
  rev           integer default 0,
  fee           integer default 0,
  premium       boolean default false,
  online        boolean default false,
  verified      boolean default false,
  tel           text,
  tags          text[],
  exp           integer default 0,           -- deneyim yılı
  lat           double precision default 0,
  lng           double precision default 0,
  slug          text unique,
  photo         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ================================================================
-- 4. ECZANELER
-- ================================================================
create table if not exists eczaneler (
  id            text primary key,
  name          text not null,
  pharmacist    text,
  il            text,
  ilce          text,
  address       text,
  tel           text,
  nobetci       boolean default false,
  chamber       text,
  slug          text unique,
  lat           double precision default 0,
  lng           double precision default 0,
  created_at    timestamptz default now()
);

-- ================================================================
-- 5. YORUMLAR
-- ================================================================
create table if not exists yorumlar (
  id            uuid primary key default uuid_generate_v4(),
  entity_type   text not null,              -- 'klinik', 'hastane', 'doktor', 'eczane'
  entity_id     text not null,              -- 'k857', 'h12', ...
  author        text not null,
  rating        double precision not null check (rating >= 1 and rating <= 5),
  text          text,
  date          text,                       -- '2024-03-15'
  helpful       integer default 0,
  verified      boolean default false,
  created_at    timestamptz default now()
);

-- ================================================================
-- 6. BLOG YAZILARI
-- ================================================================
create table if not exists blog_posts (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text unique not null,
  summary       text,
  content       text,                       -- HTML içerik
  category      text,
  tags          text[],
  author        text default 'Hekimhane Editör',
  cover_image   text,
  published     boolean default true,
  views         integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ================================================================
-- 7. SAHİPLENME TALEPLERİ
-- ================================================================
create table if not exists claim_requests (
  id            uuid primary key default uuid_generate_v4(),
  entity_type   text not null,
  entity_id     text not null,
  entity_name   text,
  claimant_name text not null,
  phone         text not null,
  email         text not null,
  role          text,
  status        text default 'pending',    -- 'pending', 'approved', 'rejected'
  created_at    timestamptz default now()
);

-- ================================================================
-- 8. KULLANICILAR (işletme sahipleri)
-- ================================================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique,
  full_name     text,
  phone         text,
  entity_type   text,                      -- hangi işletme türü
  entity_id     text,                      -- 'k857'
  role          text default 'owner',      -- 'owner', 'admin'
  created_at    timestamptz default now()
);

-- ================================================================
-- İNDEKSLER — Filtreleme ve arama için
-- ================================================================
create index if not exists idx_klinikler_il      on klinikler(il);
create index if not exists idx_klinikler_ilce    on klinikler(ilce);
create index if not exists idx_klinikler_type    on klinikler(type);
create index if not exists idx_klinikler_rat     on klinikler(rat desc);
create index if not exists idx_klinikler_specs   on klinikler using gin(specs);

create index if not exists idx_hastaneler_il     on hastaneler(il);
create index if not exists idx_hastaneler_ilce   on hastaneler(ilce);
create index if not exists idx_hastaneler_type   on hastaneler(type);
create index if not exists idx_hastaneler_rat    on hastaneler(rat desc);

create index if not exists idx_doktorlar_il      on doktorlar(il);
create index if not exists idx_doktorlar_spec    on doktorlar(spec);
create index if not exists idx_doktorlar_rat     on doktorlar(rat desc);

create index if not exists idx_eczaneler_il      on eczaneler(il);
create index if not exists idx_eczaneler_ilce    on eczaneler(ilce);

create index if not exists idx_yorumlar_entity   on yorumlar(entity_type, entity_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Herkes okuyabilir
alter table klinikler    enable row level security;
alter table hastaneler   enable row level security;
alter table doktorlar    enable row level security;
alter table eczaneler    enable row level security;
alter table yorumlar     enable row level security;
alter table blog_posts   enable row level security;

create policy "Herkese açık okuma" on klinikler    for select using (true);
create policy "Herkese açık okuma" on hastaneler   for select using (true);
create policy "Herkese açık okuma" on doktorlar    for select using (true);
create policy "Herkese açık okuma" on eczaneler    for select using (true);
create policy "Herkese açık okuma" on yorumlar     for select using (true);
create policy "Herkese açık okuma" on blog_posts   for select using (published = true);

-- Sadece admin yazabilir (service role key ile)
-- Sahip olan kullanıcı kendi kaydını güncelleyebilir
create policy "Sahip güncelleyebilir" on klinikler
  for update using (
    auth.uid() in (
      select id from profiles where entity_id = klinikler.id and entity_type = 'klinik'
    )
  );

create policy "Sahip güncelleyebilir" on hastaneler
  for update using (
    auth.uid() in (
      select id from profiles where entity_id = hastaneler.id and entity_type = 'hastane'
    )
  );

-- ================================================================
-- UPDATED_AT otomatik güncelleme
-- ================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger klinikler_updated_at
  before update on klinikler
  for each row execute function update_updated_at();

create trigger hastaneler_updated_at
  before update on hastaneler
  for each row execute function update_updated_at();

create trigger doktorlar_updated_at
  before update on doktorlar
  for each row execute function update_updated_at();
