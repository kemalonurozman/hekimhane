// ─────────────────────────────────────────────────────────────────
//  İşletme özeti + profil linki + kayıtlı e-postalar (sunucu tarafı) —
//  bildirim e-postaları için. Sahiplenme ve randevu mailleri "hangi
//  işletme, nerede, linki ne, e-postası var mı" sorularına cevap verir.
//
//  URL kuralı 4 detay rotasıyla birebir aynı (klinik/hastane: il/ilçe/slug,
//  doktor + eczane: slug). il/ilçe dönüşümü de rotaların kendi tr() mantığı.
//  Sorgular select('*') — `email` kolonu yalnız doktorlar'da var; kolon
//  seçerek sorgulamak diğer tablolarda 400 verirdi.
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';
import { epostaListesi } from '@/lib/randevu-email';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';
const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };

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
  /** Panelden ayarlanan randevu bildirim adresi (randevu_email) — ilk adres */
  randevuEmail: string | null;
  /** Tüm randevu bildirim adresleri (Pro'da en fazla 2) */
  randevuEmailler: string[];
  /** İşletme kaydındaki e-posta (yalnız doktorlar.email) */
  profilEmail: string | null;
}

const BOS: IsletmeBilgisi = { ad: null, bolum: null, kurum: null, konum: null, url: null, randevuEmail: null, randevuEmailler: [], profilEmail: null };

const temizEmail = (v: unknown): string | null => {
  const s = String(v || '').trim();
  return s.includes('@') ? s : null;
};

/**
 * Service-role client ile işletmeyi çekip mail için özetler.
 * Graceful: bulunamazsa / sorgu patlarsa boş nesne döner, çağıran akış bozulmaz.
 */
export async function isletmeBilgisi(admin: SupabaseClient, entityType: string, entityId: string): Promise<IsletmeBilgisi> {
  try {
    const tbl = TABLO[entityType];
    if (!tbl) return BOS;
    const { data: d } = await (admin as any).from(tbl).select('*').eq('id', entityId).maybeSingle();
    if (!d) return BOS;

    const konum = [d.il, d.ilce].filter(Boolean).join(' / ') || null;
    const randevuEmailler = epostaListesi(d.randevu_email);
    const ortak = { konum, randevuEmail: randevuEmailler[0] || null, randevuEmailler, profilEmail: temizEmail(d.email) };

    if (entityType === 'doktor') {
      return {
        ...ortak,
        ad: [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim() || null,
        bolum: d.spec || null,
        kurum: d.clinic_name || null,
        url: d.slug ? `${SITE}/doktorlar/${d.slug}` : null,
      };
    }
    if (entityType === 'klinik') {
      return {
        ...ortak, ad: d.name || null, kurum: null,
        bolum: Array.isArray(d.specs) && d.specs.length ? d.specs.slice(0, 4).join(', ') : null,
        url: d.slug ? `${SITE}/klinikler/${urlParca(d.il || 'turkiye')}/${urlParca(d.ilce || 'merkez')}/${d.slug}` : null,
      };
    }
    if (entityType === 'hastane') {
      return {
        ...ortak, ad: d.name || null, kurum: null, bolum: d.type || null,
        url: d.slug ? `${SITE}/hastaneler/${urlParca(d.il || 'turkiye')}/${urlParca(d.ilce || 'merkez')}/${d.slug}` : null,
      };
    }
    return { ...ortak, ad: d.name || null, bolum: null, kurum: null, url: d.slug ? `${SITE}/eczaneler/${d.slug}` : null };
  } catch { /* bildirim için yardımcı bilgi — hata sessizce yutulur */ }
  return BOS;
}

/** Mail gövdesinde tıklanabilir profil satırı (satir() ile aynı görünüm). */
export function profilSatiri(url: string | null): string {
  if (!url) return '';
  const kisa = url.replace(/^https?:\/\/(www\.)?/, '');
  return `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${url}" style="color:#1B3A69;font-weight:600;">${kisa}</a></p>`;
}
