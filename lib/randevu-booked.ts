import { supabase } from '@/lib/supabase';

/** Bir işletmenin dolu (iptal olmayan) slotlarını "YYYY-MM-DD HH:MM" listesi olarak döndürür.
 *  Slot bazlı randevu takvimi açıkken profil sayfasında dolu saatleri gizlemek için. */
export async function bookedSlots(entityId: string | number): Promise<string[]> {
  try {
    // Önce yalnızca slot döndüren SECURITY DEFINER fonksiyon — randevu_talepleri'nde
    // herkese açık SELECT kaldırıldı (hasta adı/telefonu anon anahtarla okunmasın).
    // Fonksiyon henüz oluşturulmadıysa eski doğrudan sorguya düşer.
    const { data: rpc, error: rpcErr } = await (supabase as any).rpc('dolu_slotlar', { p_entity_id: String(entityId) });
    if (!rpcErr && Array.isArray(rpc)) {
      return rpc.map((r: any) => String(typeof r === 'string' ? r : r?.dolu_slotlar ?? r?.slot ?? '')).filter(Boolean);
    }
    const { data } = await (supabase as any).from('randevu_talepleri')
      .select('randevu_slot')
      .eq('entity_id', String(entityId))
      .not('randevu_slot', 'is', null)
      .neq('status', 'iptal');
    return ((data as { randevu_slot: string }[]) || []).map(r => String(r.randevu_slot)).filter(Boolean);
  } catch {
    return [];
  }
}
