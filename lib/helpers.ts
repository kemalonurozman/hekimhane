// ================================================================
// URL Slug oluşturma
// ================================================================

const TR_MAP: Record<string, string> = {
  ş: 's', Ş: 's', ı: 'i', İ: 'i', ğ: 'g', Ğ: 'g',
  ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c',
};

export function toSlug(text: string): string {
  return text
    .split('')
    .map(c => TR_MAP[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Klinik için: istanbul-besiktas-xyz-dis-klinigi
export function klinikSlug(name: string, il: string, ilce?: string): string {
  const parts = [il, ilce, name].filter(Boolean) as string[];
  return parts.map(toSlug).join('-');
}

// Supabase filtre query builder
export function buildKlinikQuery(
  query: ReturnType<any>,
  filters: {
    il?: string;
    ilce?: string;
    uzmanlik?: string;
    tip?: string;
    minRat?: number;
    q?: string;
  }
) {
  if (filters.il)       query = query.eq('il', filters.il);
  if (filters.ilce)     query = query.eq('ilce', filters.ilce);
  if (filters.tip)      query = query.eq('type', filters.tip);
  if (filters.uzmanlik) query = query.contains('specs', [filters.uzmanlik]);
  if (filters.minRat)   query = query.gte('rat', filters.minRat);
  if (filters.q)        query = query.ilike('name', `%${filters.q}%`);
  return query;
}

// Puan yıldızı
export function formatRat(rat: number): string {
  return rat.toFixed(1);
}

// Türkçe il adından URL-safe versiyon
export function ilToPath(il: string): string {
  return toSlug(il);
}

export function ilceToPath(ilce: string): string {
  return toSlug(ilce);
}
