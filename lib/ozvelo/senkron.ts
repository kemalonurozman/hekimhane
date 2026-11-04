// ─────────────────────────────────────────────────────────────────
//  Hekimhane → Ozvelo eşitleme (YALNIZ SUNUCU, service-role).
//
//  Yalnız asistanı panelden ETKİNLEŞTİRİLMİŞ işletmeler eşitlenir
//  (ozvelo_baglantilari satırı). Profil kaydında, panelde "Şimdi eşitle"de ve
//  her gece cron'da çağrılır. Başarısız gönderim "hata" durumuna düşer ve
//  bekleme süresiyle (5 dk → 6 saat) yeniden denenir; gece cron'u ayrıca her
//  aktif işletmeyi baştan gönderir ki Ozvelo tarafında kaçan değişiklik kalmasın.
//
//  Hiçbir hata çağıranı düşürmez: tablo yoksa, ayar yoksa, Ozvelo erişilemezse
//  profil kaydı yine başarılı olur.
// ─────────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { disKimlik, imzaBasligi, ozveloAcik, ozveloAyar, ozveloTuruMu, type OzveloTur } from './ayar';
import { ozveloVerisi, veriOzeti } from './esleme';
import { sahipEpostasi } from '@/lib/yonetici';

export const TABLO = 'ozvelo_baglantilari';
const ISLETME_TABLO: Record<OzveloTur, string> = { klinik: 'klinikler', doktor: 'doktorlar' };

export type BaglantiDurum = 'bekliyor' | 'aktif' | 'hata' | 'kapali';
export interface Baglanti {
  id: string;
  entity_type: OzveloTur;
  entity_id: string;
  dis_kimlik: string;
  ozvelo_isletme_id: string | null;
  widget_anahtari: string | null;
  durum: BaglantiDurum;
  etkinlestiren: string | null;
  aktarim_onay_at: string | null;
  son_ozet: string | null;
  son_gonderim_at: string | null;
  son_basari_at: string | null;
  deneme: number;
  sonraki_deneme_at: string | null;
  son_hata: string | null;
}

/**
 * Service-role istemcisi; her okuma veritabanına gider.
 * Next 14 sunucudaki fetch'leri Data Cache'e alıyor ve `force-dynamic` bunu engellemiyor:
 * gece görevi "aktif bağlantılar" listesini ilk çalıştığı andaki hâliyle okuyup sonraki
 * gecelerde hiçbir işletme göndermiyordu (Ozvelo oturumu buldu, burada yeniden üretildi).
 */
export function ozveloIstemcisi(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (girdi: RequestInfo | URL, ayar?: RequestInit) => fetch(girdi, { ...ayar, cache: 'no-store' }) },
  });
}

/** Tablo henüz kurulmamış mı? (migration çalıştırılmamış) */
export const tabloYok = (e: any) => /ozvelo_baglantilari|ozvelo_olaylari|relation .* does not exist|schema cache|PGRST205|42P01/i.test(String(e?.message || e?.code || ''));

/* ── Ozvelo'ya istek ─────────────────────────────────────────────── */

export interface IstekSonucu { ok: boolean; status: number; json: any; hata: string | null }

export async function ozveloIstek(method: 'PUT' | 'DELETE' | 'GET', yol: string, govde?: unknown, zamanAsimiMs = 8000): Promise<IstekSonucu> {
  const a = ozveloAyar();
  if (!ozveloAcik()) return { ok: false, status: 0, json: null, hata: 'Ozvelo bağlantı ayarları tanımlı değil' };
  const metin = govde === undefined ? '' : JSON.stringify(govde);
  const kontrol = new AbortController();
  const zaman = setTimeout(() => kontrol.abort(), zamanAsimiMs);
  try {
    const r = await fetch(`${a.apiUrl}${yol}`, {
      method,
      headers: {
        authorization: `Bearer ${a.anahtar}`,
        'content-type': 'application/json',
        'x-hekimhane-imza': imzaBasligi('hk-ozvelo-istek', metin),
        'user-agent': 'Hekimhane-Ozvelo/1',
      },
      body: metin || undefined,
      signal: kontrol.signal,
      cache: 'no-store',
    });
    let json: any = null;
    try { json = await r.json(); } catch { /* gövdesiz yanıt */ }
    return { ok: r.ok, status: r.status, json, hata: r.ok ? null : String(json?.error || json?.hata || `Ozvelo ${r.status} döndü`).slice(0, 300) };
  } catch (e: any) {
    return { ok: false, status: 0, json: null, hata: e?.name === 'AbortError' ? 'Ozvelo zamanında yanıt vermedi' : `Ozvelo'ya ulaşılamadı: ${String(e?.message || e).slice(0, 200)}` };
  } finally {
    clearTimeout(zaman);
  }
}

/* ── Okuma ───────────────────────────────────────────────────────── */

export async function baglantiOku(db: SupabaseClient, tur: string, id: string): Promise<{ baglanti: Baglanti | null; tabloVar: boolean }> {
  const { data, error } = await (db as any).from(TABLO).select('*').eq('entity_type', tur).eq('entity_id', id).maybeSingle();
  if (error) return { baglanti: null, tabloVar: !tabloYok(error) };
  return { baglanti: (data as Baglanti) || null, tabloVar: true };
}

/** Sonraki deneme: 5 dk, 10, 20 … en çok 6 saat. */
function beklemeMs(deneme: number) {
  return Math.min(5 * 60_000 * 2 ** Math.max(0, deneme - 1), 6 * 3600_000);
}

/* ── Eşitleme ────────────────────────────────────────────────────── */

export interface EsitlemeSonucu {
  durum: 'gonderildi' | 'degismedi' | 'atlandi' | 'hata' | 'kapatildi';
  hata?: string | null;
  baglanti?: Baglanti | null;
}

/**
 * Bir işletmeyi Ozvelo'ya gönderir ("varsa güncelle, yoksa oluştur").
 * `zorla`: veri değişmemiş olsa da gönder (gece kontrolü, "Şimdi eşitle").
 */
export async function esitle(db: SupabaseClient, tur: string, id: string, opt: { zorla?: boolean; zamanAsimiMs?: number } = {}): Promise<EsitlemeSonucu> {
  if (!ozveloTuruMu(tur)) return { durum: 'atlandi' };
  const { baglanti } = await baglantiOku(db, tur, id);
  if (!baglanti || baglanti.durum === 'kapali') return { durum: 'atlandi', baglanti };
  if (!ozveloAcik()) return { durum: 'atlandi', hata: 'Ozvelo bağlantı ayarları tanımlı değil', baglanti };

  const { data: satir, error: okumaHata } = await (db as any).from(ISLETME_TABLO[tur]).select('*').eq('id', id).maybeSingle();
  if (okumaHata) return { durum: 'hata', hata: 'İşletme kaydı okunamadı', baglanti };
  // İşletme silinmiş (ör. profil kaldırıldı) → Ozvelo'daki işletme de kapanır
  if (!satir) return kapat(db, tur, id, 'isletme-silindi');

  const sahip = await sahipEpostasi(db, id, tur).catch(() => null);
  const veri = ozveloVerisi(tur, satir, sahip || baglanti.etkinlestiren);
  const ozet = veriOzeti(veri);
  if (!opt.zorla && baglanti.durum === 'aktif' && baglanti.son_ozet === ozet) return { durum: 'degismedi', baglanti };

  const simdi = new Date().toISOString();
  const s = await ozveloIstek('PUT', `/isletmeler/${encodeURIComponent(veri.dis_kimlik)}`, veri, opt.zamanAsimiMs);

  const guncelleme: Partial<Baglanti> & { updated_at: string } = s.ok
    ? {
        durum: 'aktif', son_ozet: ozet, son_gonderim_at: simdi, son_basari_at: simdi,
        deneme: 0, sonraki_deneme_at: null, son_hata: null, updated_at: simdi,
        ozvelo_isletme_id: s.json?.isletme_id ? String(s.json.isletme_id).slice(0, 100) : baglanti.ozvelo_isletme_id,
        widget_anahtari: s.json?.widget_anahtari ? String(s.json.widget_anahtari).slice(0, 100) : baglanti.widget_anahtari,
      }
    : {
        durum: 'hata', son_gonderim_at: simdi, deneme: (baglanti.deneme || 0) + 1,
        sonraki_deneme_at: new Date(Date.now() + beklemeMs((baglanti.deneme || 0) + 1)).toISOString(),
        son_hata: s.hata, updated_at: simdi,
      };
  const { data: yeni } = await (db as any).from(TABLO).update(guncelleme).eq('id', baglanti.id).select('*').maybeSingle();
  return s.ok
    ? { durum: 'gonderildi', baglanti: (yeni as Baglanti) || { ...baglanti, ...guncelleme } as Baglanti }
    : { durum: 'hata', hata: s.hata, baglanti: (yeni as Baglanti) || { ...baglanti, ...guncelleme } as Baglanti };
}

/** Panelden "Asistanı etkinleştir": satırı açar (ya da kapalıysa yeniden açar) ve hemen gönderir. */
export async function etkinlestir(db: SupabaseClient, tur: OzveloTur, id: string, eposta: string): Promise<EsitlemeSonucu & { tabloVar: boolean }> {
  const { baglanti, tabloVar } = await baglantiOku(db, tur, id);
  if (!tabloVar) return { durum: 'hata', hata: 'Bağlantı tablosu kurulmamış (supabase/migrations/2026-11-04_ozvelo_baglanti.sql).', tabloVar };
  const simdi = new Date().toISOString();
  if (!baglanti) {
    const { error } = await (db as any).from(TABLO).insert({
      entity_type: tur, entity_id: id, dis_kimlik: disKimlik(tur, id), durum: 'bekliyor',
      etkinlestiren: eposta.toLowerCase(), aktarim_onay_at: simdi,
    });
    if (error && !/duplicate|23505/i.test(String(error.message || error.code))) {
      return { durum: 'hata', hata: 'Bağlantı kaydı açılamadı', tabloVar };
    }
  } else if (baglanti.durum === 'kapali') {
    await (db as any).from(TABLO).update({
      durum: 'bekliyor', etkinlestiren: eposta.toLowerCase(), aktarim_onay_at: simdi,
      son_ozet: null, deneme: 0, sonraki_deneme_at: null, son_hata: null, updated_at: simdi,
    }).eq('id', baglanti.id);
  }
  return { ...(await esitle(db, tur, id, { zorla: true })), tabloVar };
}

/**
 * Asistanı kapatır: Ozvelo'ya kapatma isteği gider, satır "kapali" olur.
 * Ozvelo'ya ulaşılamasa da satır kapanır (bir daha veri gönderilmez); Ozvelo
 * tarafı gece kontrolünde gelmeyen işletmeyi ayrıca fark edebilir.
 */
export async function kapat(db: SupabaseClient, tur: string, id: string, neden: 'sahip-kapatti' | 'sahiplik-bitti' | 'isletme-silindi'): Promise<EsitlemeSonucu> {
  if (!ozveloTuruMu(tur)) return { durum: 'atlandi' };
  const { baglanti } = await baglantiOku(db, tur, id);
  if (!baglanti || baglanti.durum === 'kapali') return { durum: 'atlandi', baglanti };
  const s = ozveloAcik()
    ? await ozveloIstek('DELETE', `/isletmeler/${encodeURIComponent(baglanti.dis_kimlik)}?neden=${neden}`)
    : { ok: false, status: 0, json: null, hata: 'Ozvelo bağlantı ayarları tanımlı değil' };
  const simdi = new Date().toISOString();
  await (db as any).from(TABLO).update({
    durum: 'kapali', son_ozet: null, sonraki_deneme_at: null, updated_at: simdi,
    son_hata: s.ok || s.status === 404 ? null : `Kapatma Ozvelo'ya iletilemedi: ${s.hata}`,
  }).eq('id', baglanti.id);
  return { durum: 'kapatildi', hata: s.ok || s.status === 404 ? null : s.hata };
}

/**
 * Profil kaydedildikten sonra (update-entity). Etkin değilse tek bir okuma yapar ve çıkar.
 * Kısa zaman aşımı: Ozvelo yavaşsa kayıt beklemez, gönderim "hata"ya düşüp yeniden denenir.
 */
export async function profilDegisti(db: SupabaseClient, tur: string, id: string): Promise<void> {
  if (!ozveloTuruMu(tur)) return;
  try { await esitle(db, tur, id, { zamanAsimiMs: 4000 }); } catch (e) { console.error('ozvelo profilDegisti:', e); }
}

/** Sahiplik değişince (claimedEsitle): son sahip ayrıldıysa asistan kapanır. */
export async function sahiplikDegisti(db: SupabaseClient, tur: string, id: string, sahipVar: boolean | null): Promise<void> {
  if (sahipVar !== false || !ozveloTuruMu(tur)) return;
  try { await kapat(db, tur, id, 'sahiplik-bitti'); } catch (e) { console.error('ozvelo sahiplikDegisti:', e); }
}

/**
 * Cron: önce süresi gelen hatalı gönderimler, sonra (gece) tüm aktif işletmeler baştan.
 * Süre bütçesi aşılınca durur; kalanlar bir sonraki çalışmada.
 */
export async function topluEsitle(db: SupabaseClient, opt: { tam?: boolean; butceMs?: number } = {}) {
  const bitis = Date.now() + (opt.butceMs ?? 45_000);
  const sonuc = { yeniden_denenen: 0, gonderilen: 0, degismeyen: 0, hatali: 0, kapatilan: 0, kalan: 0, tabloVar: true, acik: ozveloAcik() };
  if (!sonuc.acik) return sonuc;

  const simdi = new Date().toISOString();
  const { data: hatalar, error } = await (db as any).from(TABLO).select('entity_type,entity_id')
    .in('durum', ['hata', 'bekliyor']).or(`sonraki_deneme_at.is.null,sonraki_deneme_at.lte.${simdi}`).limit(500);
  if (error) { sonuc.tabloVar = !tabloYok(error); return sonuc; }

  let aktifler: any[] = [];
  if (opt.tam) {
    const { data } = await (db as any).from(TABLO).select('entity_type,entity_id').eq('durum', 'aktif').order('son_basari_at', { ascending: true, nullsFirst: true }).limit(2000);
    aktifler = (data as any[]) || [];
  }

  const isler = [...((hatalar as any[]) || []).map(r => ({ ...r, yeniden: true })), ...aktifler.map(r => ({ ...r, yeniden: false }))];
  for (let i = 0; i < isler.length; i++) {
    if (Date.now() > bitis) { sonuc.kalan = isler.length - i; break; }
    const is = isler[i];
    const r = await esitle(db, is.entity_type, is.entity_id, { zorla: true });
    if (is.yeniden) sonuc.yeniden_denenen++;
    if (r.durum === 'gonderildi') sonuc.gonderilen++;
    else if (r.durum === 'degismedi') sonuc.degismeyen++;
    else if (r.durum === 'kapatildi') sonuc.kapatilan++;
    else if (r.durum === 'hata') sonuc.hatali++;
  }
  return sonuc;
}

/** Hekimin sitesine yapıştıracağı kod. Ozvelo widget anahtarı dönmediyse null. */
export function widgetKodu(b: Pick<Baglanti, 'widget_anahtari'> | null): string | null {
  if (!b?.widget_anahtari || !/^[A-Za-z0-9_-]{6,100}$/.test(b.widget_anahtari)) return null;
  return `<script src="${ozveloAyar().siteUrl}/widget.js?k=${b.widget_anahtari}" async></script>`;
}

/* ── Erişim ──────────────────────────────────────────────────────── */

export interface ErisimliIsletme { tur: OzveloTur; id: string; ad: string; yonetici: boolean }

/**
 * Kullanıcının asistanını yönetebileceği işletmeler: onaylı sahip ya da yönetici
 * (status='approved'). Asistan rolündeki (status='asistan') kişiler dahil DEĞİL —
 * yapay zekâ asistanı ayarları profil ve iletişim bilgisi demek.
 */
export async function erisimliIsletmeler(db: SupabaseClient, eposta: string): Promise<ErisimliIsletme[]> {
  const { data } = await (db as any).from('claim_requests')
    .select('entity_type,entity_id,entity_name,role')
    .eq('email', eposta).eq('status', 'approved').in('entity_type', ['klinik', 'doktor']);
  const gor = new Set<string>();
  const out: ErisimliIsletme[] = [];
  for (const c of ((data as any[]) || [])) {
    const id = String(c.entity_id || '');
    if (!id || id === 'new' || !ozveloTuruMu(c.entity_type) || gor.has(c.entity_type + id)) continue;
    gor.add(c.entity_type + id);
    out.push({ tur: c.entity_type, id, ad: String(c.entity_name || '').slice(0, 200), yonetici: /^\[yönetici\]/.test(String(c.role || '')) });
  }
  return out;
}

/* ── Ozvelo'dan özet (Dijital Asistanlar sayfaları) ───────────────
   İçerik Ozvelo'da yaşar; Hekimhane yalnız okur, SAKLAMAZ. Gelen veri burada
   süzülür: sayılar sınırlanır, metinler kısaltılır, kişi adı "Ad S." yapılır. */

const sayiSinirli = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 99999) : 0);
const kisaMetin = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');
const tarihMi = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);
function kisaAd(v: unknown): string {
  const p = kisaMetin(v, 80).split(' ').filter(Boolean);
  if (!p.length) return 'İsimsiz';
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1].charAt(0)}.`;
}
const secim = <T extends string>(v: unknown, izin: readonly T[], vars: T): T => (izin.includes(v as T) ? v as T : vars);

export const EPOSTA_DURUM = ['bekliyor', 'taslak-hazir', 'yanitlandi', 'insana-aktarildi'] as const;
export const RANDEVU_DURUM = ['bekliyor', 'onaylandi', 'reddedildi', 'iptal', 'tamamlandi'] as const;

export interface OzveloOzet {
  kanallar: { site: boolean; eposta: boolean; whatsapp_bildirim: boolean };
  sohbet: { son_7g: number; son_konusma_at: string | null };
  eposta: { bekleyen_taslak: number; yanitlanan_7g: number; son: { konu: string; kimden: string; tarih: string | null; durum: (typeof EPOSTA_DURUM)[number] }[] };
  randevu: { bekleyen: number; son_7g: number; son: { kisi: string; zaman: string | null; durum: (typeof RANDEVU_DURUM)[number]; kanal: string }[] };
  sss: { toplam: number; ornekler: { soru: string; cevap: string }[] };
  guncellendi_at: string | null;
}

export function ozetSuz(j: any): OzveloOzet {
  const k = j?.kanallar || {}, s = j?.sohbet || {}, e = j?.eposta || {}, r = j?.randevu || {}, q = j?.sss || {};
  return {
    kanallar: { site: k.site === true, eposta: k.eposta === true, whatsapp_bildirim: k.whatsapp_bildirim === true },
    sohbet: { son_7g: sayiSinirli(s.son_7g), son_konusma_at: tarihMi(s.son_konusma_at) },
    eposta: {
      bekleyen_taslak: sayiSinirli(e.bekleyen_taslak),
      yanitlanan_7g: sayiSinirli(e.yanitlanan_7g),
      son: (Array.isArray(e.son) ? e.son : []).slice(0, 8).map((x: any) => ({
        konu: kisaMetin(x?.konu, 90) || '(konusuz)', kimden: kisaAd(x?.kimden), tarih: tarihMi(x?.tarih), durum: secim(x?.durum, EPOSTA_DURUM, 'bekliyor'),
      })),
    },
    randevu: {
      bekleyen: sayiSinirli(r.bekleyen),
      son_7g: sayiSinirli(r.son_7g),
      son: (Array.isArray(r.son) ? r.son : []).slice(0, 8).map((x: any) => ({
        kisi: kisaAd(x?.kisi), zaman: tarihMi(x?.zaman), durum: secim(x?.durum, RANDEVU_DURUM, 'bekliyor'), kanal: kisaMetin(x?.kanal, 30) || 'site',
      })),
    },
    sss: {
      toplam: sayiSinirli(q.toplam),
      ornekler: (Array.isArray(q.ornekler) ? q.ornekler : []).slice(0, 6).map((x: any) => ({ soru: kisaMetin(x?.soru, 160), cevap: kisaMetin(x?.cevap, 300) })).filter((x: any) => x.soru),
    },
    guncellendi_at: tarihMi(j?.guncellendi_at),
  };
}

/** Asistanın Ozvelo'daki özeti. Ulaşılamazsa null (sayfa "şu an alınamadı" der). */
export async function ozetOku(dk: string): Promise<OzveloOzet | null> {
  const s = await ozveloIstek('GET', `/isletmeler/${encodeURIComponent(dk)}/ozet`, undefined, 6000);
  return s.ok && s.json && typeof s.json === 'object' ? ozetSuz(s.json) : null;
}
