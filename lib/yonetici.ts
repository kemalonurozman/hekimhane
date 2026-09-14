// ─────────────────────────────────────────────────────────────────
//  İşletme yöneticileri — DDL YOK.
//
//  Sistemde erişim = claim_requests'te status='approved' e-posta eşleşmesi.
//  Yönetici de aynı tabloda onaylı bir satırdır; ayırt edici tek şey `role`
//  alanının YONETICI_ONEK ile başlamasıdır. Böylece panel, randevu, hasta,
//  yorum ve MCP yetkileri yönetici için kendiliğinden çalışır.
//
//  Sahibe özel kalanlar (yönetici YAPAMAZ): yönetici ekleme/kaldırma,
//  Pro abonelik başlatma/yönetme/iptal, işletmenin sahipliğini bırakma
//  (yöneticinin "ayrıl"ı yalnız kendi erişimini siler).
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';

/** role alanı serbest metin — form metinleriyle çakışmayacak bir önek. */
export const YONETICI_ONEK = '[yönetici]';

export const yoneticiMi = (role: unknown): boolean =>
  String(role || '').trim().toLocaleLowerCase('tr').startsWith(YONETICI_ONEK);

export const yoneticiRolu = (davetEden: string) => `${YONETICI_ONEK} Davet eden: ${davetEden}`;

/** role metninden daveti yapan sahibin e-postası. */
export const davetEden = (role: unknown): string | null =>
  String(role || '').match(/Davet eden:\s*(\S+@\S+)/i)?.[1] || null;

/** E-posta bu işletmenin SAHİBİ mi (yönetici değil, onaylı)? */
export async function sahibiMi(admin: SupabaseClient, email: string, entityId: string): Promise<boolean> {
  const { data } = await (admin as any).from('claim_requests')
    .select('role').eq('email', email).eq('entity_id', entityId).eq('status', 'approved');
  return ((data as any[]) || []).some(r => !yoneticiMi(r.role));
}

/** Bildirim adresi: önce sahip, yoksa herhangi bir onaylı erişimi olan kişi. */
export async function sahipEpostasi(admin: SupabaseClient, entityId: string, entityType?: string): Promise<string | null> {
  let q = (admin as any).from('claim_requests').select('email,role')
    .eq('entity_id', entityId).eq('status', 'approved').not('email', 'is', null).limit(20);
  if (entityType) q = q.eq('entity_type', entityType);
  const { data } = await q;
  const satirlar = ((data as any[]) || []).filter(r => String(r.email || '').includes('@'));
  const sahip = satirlar.find(r => !yoneticiMi(r.role)) || satirlar[0];
  return sahip?.email || null;
}
