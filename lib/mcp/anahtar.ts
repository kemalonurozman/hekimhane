// ─────────────────────────────────────────────────────────────────
//  MCP API anahtarları — DDL YOK: anahtarların SHA-256 özetleri Supabase
//  Auth kullanıcısının app_metadata'sında tutulur (kullanıcı değiştiremez,
//  yalnız service-role yazar). Anahtarın kendisi hiçbir yerde saklanmaz;
//  yalnız üretildiği an bir kez gösterilir.
//
//  Biçim: hkm_<kullanıcı-uuid-tiresiz>_<48 hex>  → uuid ile tek sorguda
//  kullanıcı bulunur, özet karşılaştırılır.
// ─────────────────────────────────────────────────────────────────
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const MAKS_ANAHTAR = 5;
const SON_KULLANIM_ARALIK_MS = 15 * 60 * 1000;

export interface AnahtarKaydi {
  id: string;
  ad: string;
  onek: string;          // "hkm_26ac75…a1b2" — listede tanımak için
  ozet: string;          // sha256 hex
  olusturma: string;     // ISO
  son_kullanim: string | null;
}

export const ozetle = (token: string) => createHash('sha256').update(token).digest('hex');

export function anahtarUret(userId: string): { token: string; kayit: Omit<AnahtarKaydi, 'ad'> } {
  const token = `hkm_${userId.replace(/-/g, '')}_${randomBytes(24).toString('hex')}`;
  return {
    token,
    kayit: {
      id: randomBytes(6).toString('hex'),
      onek: `${token.slice(0, 10)}…${token.slice(-4)}`,
      ozet: ozetle(token),
      olusturma: new Date().toISOString(),
      son_kullanim: null,
    },
  };
}

export function anahtarlar(appMetadata: unknown): AnahtarKaydi[] {
  const a = (appMetadata as any)?.mcp_anahtarlari;
  return Array.isArray(a) ? a : [];
}

/** Token → kullanıcı. Geçersizse null. Son kullanım zamanını seyrek günceller. */
export async function anahtarDogrula(admin: SupabaseClient, token: string): Promise<{ userId: string; email: string } | null> {
  const m = /^hkm_([0-9a-f]{32})_([0-9a-f]{48})$/.exec(token.trim());
  if (!m) return null;
  const h = m[1];
  const userId = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  const user = data?.user;
  if (error || !user?.email) return null;

  const ozet = Buffer.from(ozetle(token.trim()), 'utf8');
  const liste = anahtarlar(user.app_metadata);
  const kayit = liste.find(k => {
    const b = Buffer.from(String(k.ozet || ''), 'utf8');
    return b.length === ozet.length && timingSafeEqual(b, ozet);
  });
  if (!kayit) return null;

  // Son kullanım — her istekte yazmamak için en fazla 15 dakikada bir
  const son = kayit.son_kullanim ? Date.parse(kayit.son_kullanim) : 0;
  if (Date.now() - son > SON_KULLANIM_ARALIK_MS) {
    const yeni = liste.map(k => (k.id === kayit.id ? { ...k, son_kullanim: new Date().toISOString() } : k));
    await admin.auth.admin.updateUserById(userId, { app_metadata: { ...user.app_metadata, mcp_anahtarlari: yeni } }).catch(() => {});
  }
  return { userId, email: user.email };
}

const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };

export interface SahipIsletme { claimId: string; entity_id: string; entity_type: string; entity_name: string; premium: boolean }

/** E-postanın onaylı işletmeleri + premium durumu (tip başına tek sorgu). */
export async function sahipIsletmeleri(admin: SupabaseClient, email: string): Promise<SahipIsletme[]> {
  const { data: claims } = await (admin as any).from('claim_requests')
    .select('id,entity_id,entity_type,entity_name')
    .eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  const liste = ((claims || []) as any[]).filter(c => c.entity_id && c.entity_id !== 'new');
  const premium: Record<string, boolean> = {};
  await Promise.all(Object.entries(TABLO).map(async ([tip, tbl]) => {
    const ids = liste.filter(c => c.entity_type === tip).map(c => String(c.entity_id));
    if (!ids.length) return;
    const { data } = await (admin as any).from(tbl).select('id,premium').in('id', ids);
    for (const r of (data || [])) premium[String(r.id)] = r.premium === true;
  }));
  // Aynı işletme için birden çok onaylı claim olabilir — tekilleştir
  const gorulen = new Set<string>();
  return liste.filter(c => !gorulen.has(c.entity_id) && gorulen.add(c.entity_id)).map(c => ({
    claimId: String(c.id), entity_id: String(c.entity_id), entity_type: String(c.entity_type),
    entity_name: String(c.entity_name || ''), premium: !!premium[String(c.entity_id)],
  }));
}
