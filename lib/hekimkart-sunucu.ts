import { supabase } from '@/lib/supabase';

/**
 * Bir işletmenin **güncel** HekimKart adresi.
 *
 * Profil sayfalarındaki "HekimKart" bağlantısı eskiden doğrudan işletmenin
 * kendi slug'ını kullanıyordu; kart sahibi panelden adresi değiştirdiğinde
 * site içindeki bağlantı ile kartın gerçek adresi ayrışıyordu. Artık kayıtlı
 * kart varsa onun adresi, yoksa işletme slug'ı (otomatik kart) döner.
 *
 * Hata durumunda sessizce `varsayilan` döner — kart tablosu yoksa da profil
 * sayfası çalışmaya devam eder.
 */
export async function kartSlugCoz(
  entityId: string | null | undefined,
  varsayilan: string | null | undefined,
): Promise<string | null> {
  const fb = varsayilan || null;
  if (!entityId) return fb;
  try {
    const { data } = await (supabase as any)
      .from('hekimkartlar')
      .select('slug')
      .eq('entity_id', String(entityId))
      .limit(1)
      .maybeSingle();
    return data?.slug || fb;
  } catch {
    return fb;
  }
}
