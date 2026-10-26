// Form sayfaları (sahiplen / düzelt / kaldır / hatalı bilgi) için işletme özeti.
// Yalnız sunucuda — service-role ile okur, kolon eksikliğine dayanıklı (select('*')).
import { supabase } from '@/lib/supabase';
import { SAHIPLIK_TABLO } from '@/lib/sahiplik';
import { urlParca } from '@/lib/entity-link';
import type { UyumTur } from '@/lib/uyum';

export const TUR_ETIKETI: Record<UyumTur, string> = {
  klinik: 'Diş Kliniği', hastane: 'Hastane', eczane: 'Eczane', doktor: 'Doktor',
};

export function uyumTuru(v: unknown): UyumTur | null {
  const s = String(v || '');
  return s === 'klinik' || s === 'hastane' || s === 'doktor' || s === 'eczane' ? s : null;
}

export interface ProfilOzeti { id: string; tur: UyumTur; ad: string; il: string | null; ilce: string | null; href: string | null; gizli: boolean }

export async function profilOzeti(tur: UyumTur, id: string): Promise<ProfilOzeti | null> {
  const tablo = SAHIPLIK_TABLO[tur];
  if (!tablo || !id) return null;
  try {
    const { data } = await (supabase as any).from(tablo).select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    const d = data as any;
    const ad = tur === 'doktor' ? [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim() : String(d.name ?? '');
    const href = !d.slug ? null
      : tur === 'doktor' ? `/doktorlar/${d.slug}`
      : tur === 'eczane' ? `/eczaneler/${d.slug}`
      : `/${tablo}/${urlParca(d.il || 'turkiye')}/${urlParca(d.ilce || 'merkez')}/${d.slug}`;
    return { id: String(d.id), tur, ad, il: d.il || null, ilce: d.ilce || null, href, gizli: d.gizli === true };
  } catch {
    return null;
  }
}
