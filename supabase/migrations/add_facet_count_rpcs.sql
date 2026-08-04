-- Filtre sayaçlarını GROUP BY ile tek sorguda döndüren fonksiyonlar.
-- Amaç: tüm satırları çekip JS'te saymak yerine veritabanında saymak (cache-miss hızı).
-- Kod bu RPC'ler yoksa eski yönteme (tüm satırları çekip sayma) düşer — graceful.

-- ── Klinikler ──
create or replace function klinik_il_counts(p_uzmanlik text default null)
returns table(deger text, adet bigint) language sql stable as $$
  select il, count(*)::bigint from klinikler
  where il is not null and (p_uzmanlik is null or specs @> array[p_uzmanlik])
  group by il order by il;
$$;

create or replace function klinik_uzmanlik_counts(p_il text default null)
returns table(deger text, adet bigint) language sql stable as $$
  select s, count(*)::bigint from klinikler, unnest(specs) as s
  where s is not null and (p_il is null or il = p_il)
  group by s order by count(*) desc;
$$;

create or replace function klinik_ilce_counts(p_il text)
returns table(deger text, adet bigint) language sql stable as $$
  select ilce, count(*)::bigint from klinikler
  where il = p_il and ilce is not null
  group by ilce order by ilce;
$$;

-- ── Doktorlar (diş hekimleri hariç, standart aramadaki gizli etiketler hariç) ──
create or replace function doktor_il_counts(p_spec text default null)
returns table(deger text, adet bigint) language sql stable as $$
  select il, count(*)::bigint from doktorlar
  where il is not null
    and spec not in ('Diş Hekimi','Diş Hekimliği','Dişçi')
    and not (tags @> array['devlet-dis-hastanesi'])
    and not (tags @> array['universite-dis-hastanesi'])
    and not (tags @> array['bobath-terapisti'])
    and (p_spec is null or spec = p_spec)
  group by il order by il;
$$;

create or replace function doktor_spec_counts(p_il text default null)
returns table(deger text, adet bigint) language sql stable as $$
  select spec, count(*)::bigint from doktorlar
  where spec is not null
    and spec not in ('Diş Hekimi','Diş Hekimliği','Dişçi')
    and not (tags @> array['devlet-dis-hastanesi'])
    and not (tags @> array['universite-dis-hastanesi'])
    and not (tags @> array['bobath-terapisti'])
    and (p_il is null or il = p_il)
  group by spec order by count(*) desc;
$$;

notify pgrst, 'reload schema';
