-- ================================================================
-- HEKİMHANE — Auth & Sahiplenme Migration
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- ================================================================

-- ── 1. PROFILES TABLOSU ─────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user',  -- 'user' | 'owner' | 'admin'
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Herkes kendi profilini okuyabilir/güncelleyebilir
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Admin tümünü görebilir
create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── 2. OTOMATİK PROFİL OLUŞTUR (Google Auth trigger) ────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── 3. İŞLETME TABLOLARINA SAHIP ALANLARI EKLE ──────────────────
-- klinikler
alter table klinikler
  add column if not exists is_verified boolean not null default false,
  add column if not exists owner_id    uuid references profiles(id) on delete set null;

-- hastaneler
alter table hastaneler
  add column if not exists is_verified boolean not null default false,
  add column if not exists owner_id    uuid references profiles(id) on delete set null;

-- eczaneler
alter table eczaneler
  add column if not exists is_verified boolean not null default false,
  add column if not exists owner_id    uuid references profiles(id) on delete set null;

-- doktorlar
alter table doktorlar
  add column if not exists is_verified boolean not null default false,
  add column if not exists owner_id    uuid references profiles(id) on delete set null;


-- ── 4. CLAIM_REQUESTS TABLOSU ────────────────────────────────────
-- (daha önce oluşturulduysa güvenli: create if not exists)
create table if not exists claim_requests (
  id          uuid primary key default gen_random_uuid(),
  entity_id   uuid not null,
  entity_type text not null,        -- 'klinik' | 'hastane' | 'eczane' | 'doktor'
  entity_name text not null,
  user_id     uuid references profiles(id) on delete set null,
  ad_soyad    text not null,
  tel         text not null,
  email       text not null,
  unvan       text,
  mesaj       text,
  status      text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Mevcut tabloya user_id sütununu ekle (yoksa)
alter table claim_requests
  add column if not exists user_id    uuid references profiles(id) on delete set null,
  add column if not exists admin_note text;

alter table claim_requests enable row level security;

-- Oturum açmış kullanıcılar kendi taleplerini görebilir
create policy "Users can view own claims" on claim_requests
  for select using (auth.uid() = user_id);

-- Oturum açmış ve açmamış kullanıcılar insert yapabilir
create policy "Anyone can insert claim" on claim_requests
  for insert with check (true);

-- Admin tümünü yönetebilir
create policy "Admins manage claims" on claim_requests
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── 5. YORUMLARA ALT PUANLAMA ────────────────────────────────────
-- Mevcut yorumlar tablosuna alt puanlar ekle
alter table yorumlar
  add column if not exists rating_temizlik  numeric(2,1),
  add column if not exists rating_ilgi      numeric(2,1),
  add column if not exists rating_hiz       numeric(2,1),
  add column if not exists user_id          uuid references profiles(id) on delete set null,
  add column if not exists reply_text       text,
  add column if not exists reply_at         timestamptz;

-- Yorumlar için RLS
alter table yorumlar enable row level security;

create policy "Anyone can read reviews" on yorumlar
  for select using (true);

create policy "Authenticated users can insert reviews" on yorumlar
  for insert with check (auth.uid() = user_id);

-- İşletme sahibi kendi yorumlarına yanıt yazabilir
create policy "Owners can reply to reviews" on yorumlar
  for update using (
    exists (
      select 1 from (
        select owner_id from klinikler where id::text = entity_id::text
        union all
        select owner_id from hastaneler where id::text = entity_id::text
        union all
        select owner_id from eczaneler where id::text = entity_id::text
        union all
        select owner_id from doktorlar where id::text = entity_id::text
      ) owners where owner_id = auth.uid()
    )
  );


-- ── 6. DOKTOR FOTOĞRAF GALERİSİ ─────────────────────────────────
create table if not exists doctor_images (
  id         uuid primary key default gen_random_uuid(),
  doktor_id  uuid not null references doktorlar(id) on delete cascade,
  url        text not null,
  caption    text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

alter table doctor_images enable row level security;

create policy "Anyone can view doctor images" on doctor_images
  for select using (true);

create policy "Doctor owner can manage images" on doctor_images
  for all using (
    exists (select 1 from doktorlar where id = doktor_id and owner_id = auth.uid())
  );

-- Max 13 fotoğraf kontrolü
create or replace function check_doctor_image_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from doctor_images where doktor_id = new.doktor_id) >= 13 then
    raise exception 'Bir doktor için en fazla 13 fotoğraf yüklenebilir';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_doctor_image_limit on doctor_images;
create trigger enforce_doctor_image_limit
  before insert on doctor_images
  for each row execute function check_doctor_image_limit();


-- ── 7. 360 VIEW URL ──────────────────────────────────────────────
alter table doktorlar
  add column if not exists view_360_url text;

alter table klinikler
  add column if not exists view_360_url text;

alter table hastaneler
  add column if not exists view_360_url text;


-- ── TAMAMLANDI ───────────────────────────────────────────────────
-- Bu migration'ı çalıştırdıktan sonra:
-- 1. Supabase Dashboard > Auth > Providers > Google (zaten aktif ✓)
-- 2. Redirect URL: https://hekimhane.com/api/auth/callback
-- 3. Aynı URL'yi Google Cloud Console > OAuth 2.0 > Authorized redirect URIs'a ekleyin
