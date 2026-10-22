/**
 * Supabase (PostgREST) tek sorguda en fazla 1000 satır döndürür; `.limit(100000)`
 * bu sınırı AŞMAZ, sessizce ilk 1000 satırda keser. Sayaç / facet / indeks gibi
 * tüm satırlara ihtiyaç duyan sorgular bunu kullanmalı.
 *
 *   const rows = await fetchAllRows<{ il: string | null }>(
 *     () => supabase.from('eczaneler').select('il').not('il', 'is', null));
 *
 * Hız: sayfalar 8'erli PARALEL gruplar halinde çekilir; dolu olmayan ilk sayfada
 * durulur (eskiden sıralıydı: 9 bin satır = 9 ardışık istek ≈ 1,5 sn → şimdi 2 tur).
 * Sayfalar arası kayma/çakışma olmasın diye sorguya `id` sırası eklenir — çağıran
 * ayrıca `.order('id')` eklemesin. `build` her çağrıda YENİ sorgu üretmeli.
 */
export async function fetchAllRows<T = any>(build: () => any, maxRows = 50000): Promise<T[]> {
  const PAGE = 1000;
  const GRUP = 8;
  const sayfa = async (from: number): Promise<T[] | null> => {
    const { data, error } = await build().order('id', { ascending: true }).range(from, from + PAGE - 1);
    return error || !data ? null : (data as T[]);
  };

  const ilk = await sayfa(0);
  if (!ilk) return [];
  const out: T[] = [...ilk];
  if (ilk.length < PAGE) return out;

  for (let bas = PAGE; bas < maxRows; bas += PAGE * GRUP) {
    const froms = Array.from({ length: GRUP }, (_, k) => bas + k * PAGE).filter(f => f < maxRows);
    const parcalar = await Promise.all(froms.map(sayfa));
    let bitti = false;
    for (const p of parcalar) {
      if (!p) { bitti = true; break; }          // hata: elde olanla devam (graceful)
      out.push(...p);
      if (p.length < PAGE) { bitti = true; break; }
    }
    if (bitti) break;
  }
  return out;
}
