// ─────────────────────────────────────────────────────────────────
//  Sahiplik durumu — TEK KAYNAK (Eki 2026).
//
//  "Sahiplenilmiş" = claim_requests'te bu işletme için status='approved'
//  ve yönetici OLMAYAN en az bir satır (= sahip; lib/yonetici.ts ile aynı
//  ayrım — admin "son sahip kalkarsa sahiplenilmemiş" kuralı da bu).
//  Yöneticiler erişim listesinde sayılır ama tek başına sahiplik değildir.
//  Asistanlar status='asistan' ile tutulur, hiç sayılmaz.
//
//  İşletme tablosundaki `claimed` kolonu bunun ÖNBELLEĞİDİR: liste, kart ve
//  ana sayfa sorguları onu kullanır. Sahiplik değişen her yol (onay, red,
//  admin atama/kaldırma, bırakma, silme) `claimedEsitle()` ile kolonu
//  yeniden hesaplar — koşulsuz true/false YAZILMAZ.
//
//  `verified` (doktorlarda içe aktarılan "Onaylı" sütunu) sahiplik DEĞİLDİR;
//  sahiplik kararında hiçbir yerde kullanılmaz. Eskiden /sahiplen ve panel
//  doktorlarda verified'ı sahiplik sayıyordu → profil "Sahiplenilmemiş"
//  derken form "zaten sahiplenilmiş" diyordu (d463 şikâyeti).
//
//  Yalnız sunucuda kullanın (service-role istemcisi gerekir).
// ─────────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { yoneticiMi } from '@/lib/yonetici';

export const SAHIPLIK_TABLO: Record<string, string> = {
  klinik: 'klinikler',
  hastane: 'hastaneler',
  doktor: 'doktorlar',
  eczane: 'eczaneler',
};

/** E-posta karşılaştırmaları her yerde bununla: Auth e-postaları küçük harflidir. */
export const epostaNormal = (e: unknown): string => String(e || '').trim().toLowerCase();

/**
 * claim_requests RLS'i tarayıcı/anon istemcisine yalnız kişinin kendi
 * satırlarını gösterir; sahiplik kararı için service-role şart.
 */
export function sahiplikIstemcisi(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

type Erisim = { email: string; sahip: boolean };

/**
 * İşletmenin onaylı erişimleri (sahip + yönetici), e-posta küçük harfle.
 * Sorgu hata verirse null döner (bilinmiyor) — çağıran buna göre karar verir.
 */
export async function onayliErisimler(db: SupabaseClient, entityId: string): Promise<Erisim[] | null> {
  if (!entityId || entityId === 'new') return [];
  const { data, error } = await (db as any).from('claim_requests')
    .select('email,role')
    .eq('entity_id', entityId)
    .eq('status', 'approved')
    .limit(50);
  if (error) {
    console.error('sahiplik: claim_requests okunamadı:', error.message);
    return null;
  }
  return ((data as any[]) || [])
    .map(r => ({ email: epostaNormal(r.email), sahip: !yoneticiMi(r.role) }))
    .filter(r => r.email);
}

/**
 * Profil sayfası, /sahiplen ve /api/claim'in ORTAK kararı.
 * `claimedKolonu`: işletme satırındaki claimed değeri (kolon yoksa undefined).
 * Onaylı sahip varsa VEYA kolon true ise sahiplenilmiş sayılır — kolonu
 * henüz olmayan doktorlarda da doğru çalışır.
 * `erisimler`: erişimi olan TÜM e-postalar (sahip + yönetici); `sahipler`: yalnız sahipler.
 */
export async function sahiplikDurumu(
  db: SupabaseClient, entityId: string, claimedKolonu?: unknown,
): Promise<{ sahipli: boolean; erisimler: string[]; sahipler: string[] }> {
  const liste = (await onayliErisimler(db, entityId)) || [];
  return {
    sahipli: liste.some(e => e.sahip) || claimedKolonu === true,
    erisimler: Array.from(new Set(liste.map(e => e.email))),
    sahipler: Array.from(new Set(liste.filter(e => e.sahip).map(e => e.email))),
  };
}

/** Sunucu bileşenlerinden kısa yol: yalnız evet/hayır. Hata sayfayı düşürmez. */
export async function sahiplenilmisMi(entityId: string, claimedKolonu?: unknown): Promise<boolean> {
  try {
    return (await sahiplikDurumu(sahiplikIstemcisi(), entityId, claimedKolonu)).sahipli;
  } catch {
    return claimedKolonu === true;
  }
}

const kolonYok = (msg: string) => /claimed/i.test(msg) && /(does not exist|could not find|schema cache)/i.test(msg);

/**
 * `claimed` önbelleğini claim_requests'e göre yeniden yazar.
 * Döner:
 *  - `sahipVar`: claim_requests'e göre sahip var mı (okunamadıysa null) — kolon
 *    YAZILAMASA da doğrudur; "son sahip ayrıldı mı?" kararları buna bakmalı.
 *  - `claimed`: kolona yazılan değer (yazılamadıysa null).
 *  - `uyari`: admin'e gösterilecek metin. Hata yutulmaz ama akışı da düşürmez.
 */
export async function claimedEsitle(
  db: SupabaseClient, tip: string, entityId: string,
): Promise<{ sahipVar: boolean | null; claimed: boolean | null; uyari: string | null }> {
  const tablo = SAHIPLIK_TABLO[tip];
  if (!tablo || !entityId || entityId === 'new') return { sahipVar: null, claimed: null, uyari: null };
  const liste = await onayliErisimler(db, entityId);
  if (liste === null) {
    return { sahipVar: null, claimed: null, uyari: 'Sahiplik durumu okunamadı; "sahiplenildi" işareti güncellenmedi.' };
  }
  const sahipVar = liste.some(e => e.sahip);
  const { error } = await (db as any).from(tablo).update({ claimed: sahipVar }).eq('id', entityId);
  if (error) {
    const msg = String(error.message || error);
    console.error(`sahiplik: ${tablo}.claimed yazılamadı:`, msg);
    return {
      sahipVar,
      claimed: null,
      uyari: kolonYok(msg)
        ? `${tablo}.claimed kolonu yok — supabase/migrations/2026-10-25_sahiplik_duzelt.sql çalıştırılmalı. (Erişim yine de çalışır.)`
        : `"Sahiplenildi" işareti güncellenemedi: ${msg}`,
    };
  }
  return { sahipVar, claimed: sahipVar, uyari: null };
}

/**
 * Toplu sahiplik: verilen işletme kimliklerinden gerçekten sahiplenilmiş
 * (claim_requests'te onaylı, yönetici olmayan satırı bulunan) olanların kümesi.
 * Hata ya da service-role yokluğunda boş küme döner — rozet gösterilmez (fail-closed).
 */
export async function sahipliIdSeti(ids: string[]): Promise<Set<string>> {
  const set = new Set<string>();
  const tekil = Array.from(new Set(ids.map(String).filter(x => x && x !== 'new')));
  if (!tekil.length) return set;
  try {
    const db = sahiplikIstemcisi() as any;
    for (let i = 0; i < tekil.length; i += 200) {
      const { data, error } = await db.from('claim_requests')
        .select('entity_id,role')
        .in('entity_id', tekil.slice(i, i + 200))
        .eq('status', 'approved')
        .limit(1000);
      if (error) { console.error('sahiplik: toplu claim_requests okunamadı:', error.message); continue; }
      for (const r of (data as any[]) || []) if (!yoneticiMi(r.role)) set.add(String(r.entity_id));
    }
  } catch (e) {
    console.error('sahiplik: toplu okuma başarısız:', (e as Error)?.message);
  }
  return set;
}

/**
 * Doktor satırlarındaki `verified`'ı GERÇEK sahiplikle değiştirir.
 * `verified` içe aktarılan kaynaktaki "Onaylı" sütunudur (CSV'de 1.371'in 963'ü) —
 * kartlardaki "✓ Onaylı" rozeti ve halka onu okuyordu, hastane kadrolarında
 * sahiplenilmemiş hekimler "Onaylı" görünüyordu. Rozet artık yalnız onaylı sahip
 * kaydı (veya `claimed` önbelleği true) olan profillerde çıkar. Kartlara giden
 * satırı bu süzgeçten geçir; kolon/ham değeri doğrudan kullanma.
 */
export async function gercekOnayIsaretle<T extends { id: string; claimed?: unknown; verified?: unknown }>(rows: T[]): Promise<T[]> {
  if (!rows.length) return rows;
  const set = await sahipliIdSeti(rows.map(r => r.id));
  return rows.map(r => ({ ...r, verified: set.has(String(r.id)) || r.claimed === true }));
}
