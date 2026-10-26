// ─────────────────────────────────────────────────────────────────
//  İlk kullanıcılara ücretsiz Pro — KONTENJAN SAYACI (tek kaynak, 2026-10-26).
//  Ana sayfa bandı ve erkenUyeProVer (lib/erken-uye.ts) aynı hesabı kullanır:
//  ekranda görünen "kalan" ile sistemin gerçekten vereceği Pro sayısı hep eşit.
//
//  dolu = ERKEN_UYE_BASLANGIC (sistem öncesi sahiplenmeler)
//       + kaynak='otomatik' kayıt sayısı (gerçek onaylar)
//       + kayıtsız geçen gün sayısı (her biri bir yeri KAPATIR)
//
//  Kural (sahibinin kararı): her gün en az bir yer azalır. O gün en az bir
//  gerçek kayıt olduysa ek düşüş yok; hiç kayıt olmadıysa gün bitince bir yer
//  kapanır. Gün = Türkiye takvim günü; sayım ERKEN_UYE_SAYAC_TARIH gününden
//  başlar ve yalnız BİTMİŞ günleri sayar (bugün henüz bitmedi).
//  Kapanan yer gerçekten kapanır — bant yanıltıcı kıtlık göstermez.
//
//  Sunucu importu yok (yalnız tip): istemci + sunucu ortak.
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';
import { ERKEN_UYE_BASLANGIC, ERKEN_UYE_KOTA, ERKEN_UYE_SAYAC_TARIH } from '@/lib/erken-uye-metin';

/** Bir anın Türkiye takvim günü (YYYY-MM-DD). */
export function trGunu(t: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(typeof t === 'string' ? new Date(t) : t);
}

/** YYYY-MM-DD'ye n gün ekler (takvim günü; saat dilimi etkisiz). */
function gunEkle(gun: string, n: number): string {
  const d = new Date(`${gun}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Saf hesap. `kayitTarihleri`: kaynak='otomatik' satırların created_at değerleri.
 * Dönen `dolu` hiçbir zaman ERKEN_UYE_KOTA'yı aşmaz.
 */
export function kontenjanHesapla(kayitTarihleri: string[], simdi: Date = new Date()) {
  const kayitGunleri = new Set(kayitTarihleri.filter(Boolean).map(trGunu));
  const bugun = trGunu(simdi);
  let kapanan = 0;
  for (let g = ERKEN_UYE_SAYAC_TARIH; g < bugun; g = gunEkle(g, 1)) {
    if (!kayitGunleri.has(g)) kapanan++;
  }
  const ham = ERKEN_UYE_BASLANGIC + kayitTarihleri.length + kapanan;
  const dolu = Math.min(ERKEN_UYE_KOTA, ham);
  return { dolu, kalan: ERKEN_UYE_KOTA - dolu, gercek: kayitTarihleri.length, kapanan };
}

/**
 * Veritabanından okur (service-role istemcisi). Tablo yoksa/okunamazsa null:
 * çağıran bandı göstermez, Pro vermez (fail-closed).
 */
export async function kontenjanOku(db: SupabaseClient, simdi: Date = new Date()) {
  const { data, error } = await (db as any).from('erken_uye_pro')
    .select('created_at').eq('kaynak', 'otomatik').limit(1000);
  if (error) return { hata: String(error.message || error), sonuc: null };
  const tarihler = (data || []).map((r: { created_at: string }) => r.created_at);
  return { hata: null, sonuc: kontenjanHesapla(tarihler, simdi) };
}
