-- Sahiplenme talepleri tablosu
-- Supabase SQL Editor'da çalıştırın

create table if not exists claim_requests (
  id           uuid primary key default gen_random_uuid(),
  entity_id    uuid not null,
  entity_type  text not null,          -- 'klinik' | 'hastane' | 'eczane' | 'doktor'
  entity_name  text not null,
  ad_soyad     text not null,
  tel          text not null,
  email        text not null,
  unvan        text,
  mesaj        text,
  status       text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS: sadece service_role yazabilsin, herkes okuyamasın
alter table claim_requests enable row level security;

-- Anonim kullanıcıların INSERT yapabilmesi için (form submision)
create policy "Allow anonymous insert"
  on claim_requests for insert
  to anon
  with check (true);

-- Sadece authenticated (admin) okuyabilir
create policy "Allow authenticated select"
  on claim_requests for select
  to authenticated
  using (true);

-- updated_at otomatik güncelle
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
