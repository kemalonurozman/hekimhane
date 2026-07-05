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

// Telefon numarasını okunur formata çevirir: "5052699815" → "0505 269 98 15"
// Zaten formatlıysa (boşluk içeriyorsa) dokunmaz.
export function formatTel(tel: string): string {
  if (!tel) return '';
  if (/\s/.test(tel.trim())) return tel;
  const digits = tel.replace(/\D/g, '');
  // 10 hane (5xx...): başına 0 ekle; 11 hane (05xx / 0212...): olduğu gibi
  const d = digits.length === 10 ? '0' + digits : digits;
  if (d.length !== 11) return tel;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}
