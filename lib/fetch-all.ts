/**
 * Supabase (PostgREST) tek sorguda en fazla 1000 satır döndürür; `.limit(100000)`
 * bu sınırı AŞMAZ, sessizce ilk 1000 satırda keser. Sayaç / facet / indeks gibi
 * tüm satırlara ihtiyaç duyan sorgular bunu kullanmalı.
 *
 *   const rows = await fetchAllRows<{ il: string | null }>(
 *     () => supabase.from('eczaneler').select('il').not('il', 'is', null));
 *
 * `build` her sayfa için YENİ bir sorgu üretmeli (aynı builder'a iki kez .range()
 * uygulanamaz). Sıra kararlılığı için sorguya bir `.order('id')` eklemek iyi olur.
 */
export async function fetchAllRows<T = any>(build: () => any, maxRows = 50000): Promise<T[]> {
  const PAGE = 1000;
  const out: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE) {
    const { data, error } = await build().range(from, from + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}
