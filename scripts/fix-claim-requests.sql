-- ================================================================
-- claim_requests tablosunu yeniden oluştur
-- Supabase Dashboard > SQL Editor'da çalıştırın
-- ================================================================

-- Önce eski tabloyu kaldır (varsa)
drop table if exists claim_requests cascade;

-- Yeni yapıyla yeniden oluştur
create table claim_requests (
  id           uuid primary key default gen_random_uuid(),
  entity_id    text,                          -- NULL = yeni işletme başvurusu
  entity_type  text not null,                 -- 'klinik' | 'hastane' | 'eczane' | 'doktor'
  entity_name  text,
  ad_soyad     text not null,
  tel          text not null,
  email        text not null,
  unvan        text,                           -- Sahip, Yönetici, Müdür...
  mesaj        text,
  status       text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS aktif et
alter table claim_requests enable row level security;

-- Anonim kullanıcılar form gönderebilsin
create policy "Allow anonymous insert"
  on claim_requests for insert
  to anon
  with check (true);

-- Authenticated kullanıcılar (admin) okuyabilsin
create policy "Allow authenticated select"
  on claim_requests for select
  to authenticated
  using (true);

-- updated_at otomatik güncelle (fonksiyon zaten varsa atla)
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger claim_requests_updated_at
  before update on claim_requests
  for each row execute function update_updated_at();
