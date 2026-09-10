// ─────────────────────────────────────────────────────────────────
//  İşletme özeti + profil linki (sunucu tarafı) — bildirim e-postaları
//  için. Sahiplenme talebi maili "hangi bölümdeki doktor, hangi kurum,
//  nerede" sorularına linkle birlikte cevap verir.
//
//  URL kuralı 4 detay rotasıyla birebir aynı (klinik/hastane: il/ilçe/slug,
//  doktor + eczane: slug). il/ilçe dönüşümü de rotaların kendi tr() mantığı.
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';

/** Detay rotalarındaki tr() ile aynı — il/ilçe'yi URL parçasına çevirir. */
export function urlParca(s: string | null | undefined): string {
  return (s || '').toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export interface IsletmeBilgisi {
  ad: string | null;
  /** Doktor: uzmanlık/bölüm · Hastane: tür · Klinik: uzmanlıklar */
  bolum: string | null;
  /** Doktor: çalıştığı kurum (clinic_name) */
  kurum: string | null;
  /** "İstanbul / Pendik" */
  konum: string | null;
  /** Mutlak profil URL'i — slug yoksa null */
  url: string | null;
}

const BOS: IsletmeBilgisi = { ad: null, bolum: null, kurum: null, konum: null, url: null };

/**
 * Service-role client ile işletmeyi çekip mail için özetler.
 * Graceful: bulunamazsa / kolon yoksa boş nesne döner, çağıran akış bozulmaz.
 */
export async function isletmeBilgisi(admin: SupabaseClient, entityType: string, entityId: string): Promise<IsletmeBilgisi> {
  try {
    const db = admin as any;
    const konumStr = (d: any) => [d?.il, d?.ilce].filter(Boolean).join(' / ') || null;

    if (entityType === 'doktor') {
      const { data: d } = await db.from('doktorlar').select('ad,soyad,unvan,spec,clinic_name,il,ilce,slug').eq('id', entityId).maybeSingle();
      if (!d) return BOS;
      return {
        ad: [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim() || null,
        bolum: d.spec || null,
        kurum: d.clinic_name || null,
        konum: konumStr(d),
        url: d.slug ? `${SITE}/doktorlar/${d.slug}` : null,
      };
    }
    if (entityType === 'klinik') {
      const { data: d } = await db.from('klinikler').select('name,specs,il,ilce,slug').eq('id', entityId).maybeSingle();
      if (!d) return BOS;
      return {
        ad: d.name || null,
        bolum: Array.isArray(d.specs) && d.specs.length ? d.specs.slice(0, 4).join(', ') : null,
        kurum: null,
        konum: konumStr(d),
        url: d.slug ? `${SITE}/klinikler/${urlParca(d.il || 'turkiye')}/${urlParca(d.ilce || 'merkez')}/${d.slug}` : null,
      };
    }
    if (entityType === 'hastane') {
      const { data: d } = await db.from('hastaneler').select('name,type,il,ilce,slug').eq('id', entityId).maybeSingle();
      if (!d) return BOS;
      return {
        ad: d.name || null,
        bolum: d.type || null,
        kurum: null,
        konum: konumStr(d),
        url: d.slug ? `${SITE}/hastaneler/${urlParca(d.il || 'turkiye')}/${urlParca(d.ilce || 'merkez')}/${d.slug}` : null,
      };
    }
    if (entityType === 'eczane') {
      const { data: d } = await db.from('eczaneler').select('name,il,ilce,slug').eq('id', entityId).maybeSingle();
      if (!d) return BOS;
      return { ad: d.name || null, bolum: null, kurum: null, konum: konumStr(d), url: d.slug ? `${SITE}/eczaneler/${d.slug}` : null };
    }
  } catch { /* bildirim için yardımcı bilgi — hata sessizce yutulur */ }
  return BOS;
}
