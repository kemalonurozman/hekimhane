// İşletme kaydını bağlı satırlarıyla birlikte siler — admin "Sil" ile profil
// kaldırma onayının ORTAK mantığı (iki yerde yazılmaz). Yalnız sunucuda.
import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';

export const SILINEBILIR_TABLOLAR = ['klinikler', 'hastaneler', 'doktorlar', 'eczaneler'] as const;
export type SilinebilirTablo = (typeof SILINEBILIR_TABLOLAR)[number];

// Tablo/kolon yoksa (migration çalışmamış) temizliği hata saymadan geç
export const tabloYok = (msg?: string) => /does not exist|could not find|relation .* not|schema cache/i.test(msg || '');

export type SilSonucu =
  | { ok: true; uyarilar: string[] }
  | { ok: false; kod: 'abonelik' | 'bagli' | 'kayit' | 'kontrol'; mesaj: string };

/**
 * 1) Aktif Stripe aboneliği varsa silmez (kayıt yok olurken tahsilat sürerdi).
 * 2) Bağlı kayıtları temizler; biri gerçekten hata verirse asıl kaydı silmez.
 * 3) Asıl kaydı siler, listeleri tazeler.
 */
export async function entitySil(admin: SupabaseClient, tablo: SilinebilirTablo, entityId: string): Promise<SilSonucu> {
  const db = admin as any;
  const typeKey = tablo.slice(0, -3); // klinikler → klinik

  const { data: aktifSub, error: subErr } = await db.from('premium_subscriptions')
    .select('id,status')
    .eq('entity_type', typeKey).eq('entity_id', entityId)
    .in('status', ['active', 'trialing', 'past_due'])
    .limit(1).maybeSingle();
  if (subErr && !tabloYok(subErr.message)) {
    return { ok: false, kod: 'kontrol', mesaj: `Abonelik kontrolü yapılamadı: ${subErr.message}` };
  }
  if (aktifSub) {
    return { ok: false, kod: 'abonelik', mesaj: 'Bu kaydın aktif bir Premium aboneliği var. Önce Premium Üyeler sekmesinden aboneliği iptal edin, sonra silin.' };
  }

  const adimlar: { ad: string; q: PromiseLike<{ error: any }> }[] = [
    { ad: 'claim_requests',        q: db.from('claim_requests').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
    { ad: 'yorumlar',              q: db.from('yorumlar').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
    { ad: 'randevu_talepleri',     q: db.from('randevu_talepleri').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
    { ad: 'premium_subscriptions', q: db.from('premium_subscriptions').delete().eq('entity_id', entityId).eq('entity_type', typeKey) }, // yalnız pasif kayıtlar kaldı
    // HekimKart ve makaleler kullanıcıya ait: silinmez, işletme bağı koparılır
    { ad: 'hekimkartlar',          q: db.from('hekimkartlar').update({ entity_id: null, entity_type: null }).eq('entity_id', entityId).eq('entity_type', typeKey) },
    { ad: 'blog_posts',            q: db.from('blog_posts').update({ entity_id: null }).eq('entity_id', entityId).eq('entity_type', typeKey) },
  ];
  const uyarilar: string[] = [];
  for (const { ad, q } of adimlar) {
    const { error } = await q;
    if (!error) continue;
    if (tabloYok(error.message)) { uyarilar.push(`${ad}: tablo/kolon yok, atlandı`); continue; }
    return { ok: false, kod: 'bagli', mesaj: `Bağlı kayıtlar temizlenemedi (${ad}): ${error.message}` };
  }

  const { error } = await db.from(tablo).delete().eq('id', entityId);
  if (error) return { ok: false, kod: 'kayit', mesaj: error.message };

  try { revalidatePath(`/${tablo}`); revalidatePath('/'); revalidateTag('facets'); } catch { /* build dışı ortamda sessiz */ }
  return { ok: true, uyarilar };
}
