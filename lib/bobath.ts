// ─────────────────────────────────────────────────────────────
// Bobath Terapistleri — kategori veri katmanı
// Fizyoterapistler `doktorlar` tablosunda tags=['bobath-terapisti'] ile;
// il bazında gruplanır. E-posta/telefon contact_hidden=true ise gizli.
// Standart /doktorlar aramasında görünmezler.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { toSlug } from './helpers';
import type { Doktor } from './types';

export const BOBATH_TAG = 'bobath-terapisti';

async function fetchAll<T = any>(build: () => any, max = 8000): Promise<T[]> {
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export interface BobathIl { il: string; ilSlug: string; count: number; }

// İl il terapist sayıları
export async function getBobathIller(): Promise<BobathIl[]> {
  const rows = await fetchAll<{ il: string | null }>(
    () => supabase.from('doktorlar').select('il').contains('tags', [BOBATH_TAG]));
  const map: Record<string, BobathIl> = {};
  rows.forEach(r => {
    const il = r.il || 'Diğer';
    const h = map[il] ||= { il, ilSlug: toSlug(il), count: 0 };
    h.count++;
  });
  return Object.values(map).sort((a, b) => a.il.localeCompare(b.il, 'tr'));
}

// Bir ildeki tüm Bobath terapistleri
export async function getBobathByIl(ilSlug: string): Promise<{ il: string; doctors: Doktor[] } | null> {
  const iller = await getBobathIller();
  const match = iller.find(x => x.ilSlug === ilSlug);
  if (!match) return null;
  const doctors = await fetchAll<Doktor>(
    () => supabase.from('doktorlar').select('*').contains('tags', [BOBATH_TAG]).eq('il', match.il));
  doctors.sort((a, b) => `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`, 'tr'));
  return { il: match.il, doctors };
}
