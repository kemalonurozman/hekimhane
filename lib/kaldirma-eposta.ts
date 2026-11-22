// ─────────────────────────────────────────────────────────────────
//  Kaldırma talebi sahibine yöneticinin ELLE, TEK TEK gönderdiği e-posta (Kas 2026). Yalnız sunucuda.
//  Admin → Kaldırma Talepleri → "Mail gönder" → /api/admin/kaldirma/eposta → burası.
//
//  · Alıcı istemciden ALINMAZ: her zaman talebin (profil_kaldirma_talepleri) e-postası.
//  · Toplu/otomatik gönderim yok; cron ya da başka akış bunu çağırmaz.
//  · Her gönderim kaldirma_epostalari'na yazılır (şablon + konu + tarih; metin saklanmaz).
//    Aynı talebe ya da aynı adrese daha önce gönderildiyse `tekrarOnay` olmadan 409 döner.
//  · Tablo yoksa gerçek gönderim KAPALI (fail-closed: tekrar uyarısı çalışamaz).
//    "Kendime deneme" (deneme:true) tablo olmadan da çalışır, yalnız ADMIN_EMAIL'e gider, kayıt yazmaz.
//  · RET: "e-posta istemiyorum" diye yanıtlayan adres yönetici tarafından işaretlenir (kaldirma_eposta_ret).
//    Ret varsa elle gönderim 409 (onayla aşılamaz); otomatik kaldırma e-postası tanıtım bölümünü atlar
//    (lib/profil-kaldirma.ts → epostaRetVar).
//  Şablonlar + HTML: lib/kaldirma-sablonlari.ts (istemciyle ortak)
//  Migration: supabase/migrations/2026-11-22_kaldirma_epostalari.sql
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, esc } from '@/lib/email';
import { tabloYok } from '@/lib/entity-sil';
import { kontenjanOku } from '@/lib/erken-uye-sayac';
import { ADMIN_EMAIL } from '@/lib/admin-auth';
import { SABLON_KODLARI, KALDIRMA_EPOSTA_SINIR as S, baglamBul, epostaGovdesi, type SablonKod } from '@/lib/kaldirma-sablonlari';

const TABLO = 'kaldirma_epostalari';
const RET_TABLO = 'kaldirma_eposta_ret';
const ALANLAR = 'id,talep_id,kaldirilan_id,alici,sablon,konu,created_at';
const MIGRATION_MESAJI = 'Gönderim kaydı tablosu yok: supabase/migrations/2026-11-22_kaldirma_epostalari.sql dosyasını Supabase SQL Editor\'da çalıştırın. O zamana kadar yalnız "Kendime deneme gönder" çalışır.';

export interface KaldirmaEpostaKaydi {
  id: string; talep_id: string; kaldirilan_id: string | null;
  alici: string; sablon: string; konu: string; created_at: string;
}

export interface KaldirmaEpostaRet { alici: string; talep_id: string | null; created_at: string }

/** Admin listesi: tüm gönderim kayıtları + ret listesi + ücretsiz Pro kontenjanı (şablondaki Pro cümlesi buna bağlı). */
export async function kaldirmaEpostaListesi(admin: SupabaseClient) {
  const db = admin as any;
  const [kr, rr, kont] = await Promise.all([
    db.from(TABLO).select(ALANLAR).order('created_at', { ascending: false }).limit(1000),
    db.from(RET_TABLO).select('alici,talep_id,created_at').limit(2000),
    kontenjanOku(admin).catch(() => ({ hata: 'okunamadı', sonuc: null })),
  ]);
  const migration = [kr.error, rr.error].some(e => e && tabloYok(e.message));
  for (const e of [kr.error, rr.error]) if (e && !tabloYok(e.message)) console.error('kaldirmaEpostaListesi:', e.message);
  return {
    kayitlar: (kr.data || []) as KaldirmaEpostaKaydi[],
    retler: (rr.data || []) as KaldirmaEpostaRet[],
    migration,
    // Okunamazsa null → istemci Pro cümlesini yazmaz (fail-closed)
    kontenjanKalan: kont.sonuc ? Math.max(0, kont.sonuc.kalan) : null,
  };
}

export interface EpostaGirdisi {
  talepId: string;
  kaldirilanId?: string | null;
  sablon: string;
  konu: string;
  metin: string;
  deneme?: boolean;
  tekrarOnay?: boolean;
}

export type EpostaSonucu =
  | { ok: true; mesaj: string; deneme?: boolean; kayit?: KaldirmaEpostaKaydi | null }
  | { ok: false; durum: number; mesaj: string; tekrar?: KaldirmaEpostaKaydi[]; migration?: boolean; ret?: boolean };

/**
 * Bu adres "e-posta istemiyorum" dedi mi? Otomatik kaldırma e-postası tanıtım bölümünü buna göre koyar.
 * Tablo yoksa (migration çalışmamış) kimse işaretlenemediği için ret yok sayılır.
 */
export async function epostaRetVar(admin: SupabaseClient, eposta: string): Promise<boolean> {
  const { data, error } = await (admin as any).from(RET_TABLO).select('alici').eq('alici', eposta.trim().toLowerCase()).limit(1);
  if (error) { if (!tabloYok(error.message)) console.error('epostaRetVar:', error.message); return false; }
  return (data || []).length > 0;
}

/** Yönetici işaretler: talep sahibinin adresi e-posta istemiyor (geriAl → işaret kaldırılır). */
export async function kaldirmaEpostaRet(admin: SupabaseClient, talepId: string, geriAl: boolean): Promise<EpostaSonucu> {
  const db = admin as any;
  const { data: t, error: tErr } = await db.from('profil_kaldirma_talepleri').select('id,email').eq('id', talepId).maybeSingle();
  if (tErr) return { ok: false, durum: 500, mesaj: `Talep okunamadı: ${tErr.message}` };
  if (!t || !t.email) return { ok: false, durum: 404, mesaj: 'Talep ya da e-posta adresi bulunamadı.' };
  const alici = String(t.email).trim().toLowerCase();
  const { error } = geriAl
    ? await db.from(RET_TABLO).delete().eq('alici', alici)
    : await db.from(RET_TABLO).upsert({ alici, talep_id: t.id }, { onConflict: 'alici' });
  if (error) return tabloYok(error.message)
    ? { ok: false, durum: 503, mesaj: MIGRATION_MESAJI, migration: true }
    : { ok: false, durum: 500, mesaj: `Kaydedilemedi: ${error.message}` };
  return { ok: true, mesaj: geriAl
    ? `İşaret kaldırıldı: ${t.email} adresine yeniden elle e-posta gönderilebilir.`
    : `İşaretlendi: ${t.email} e-posta istemiyor. Bu adrese elle e-posta gönderilemez; kaldırma e-postasında tanıtım bölümü çıkmaz.` };
}

const EPOSTA_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

export async function kaldirmaEpostaGonder(admin: SupabaseClient, g: EpostaGirdisi): Promise<EpostaSonucu> {
  const db = admin as any;

  // 1) Girdi
  if (!SABLON_KODLARI.includes(g.sablon as SablonKod)) return { ok: false, durum: 400, mesaj: 'Geçersiz şablon.' };
  const konu = String(g.konu || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  const metin = String(g.metin || '').replace(/\r\n?/g, '\n').trim();
  if (konu.length < S.konuMin || konu.length > S.konuMax) return { ok: false, durum: 400, mesaj: `Konu ${S.konuMin}–${S.konuMax} karakter olmalı.` };
  if (metin.length < S.metinMin || metin.length > S.metinMax) return { ok: false, durum: 400, mesaj: `Metin ${S.metinMin}–${S.metinMax} karakter olmalı.` };

  // 2) Alıcı = talebin e-postası (istemciden gelmez)
  const { data: t, error: tErr } = await db.from('profil_kaldirma_talepleri')
    .select('id,email,status,entity_type,entity_id').eq('id', String(g.talepId)).maybeSingle();
  if (tErr) return { ok: false, durum: 500, mesaj: `Talep okunamadı: ${tErr.message}` };
  if (!t) return { ok: false, durum: 404, mesaj: 'Talep bulunamadı.' };
  if (t.status === 'iptal') return { ok: false, durum: 409, mesaj: 'Bu talep daha yeni bir taleple değiştirilmiş (iptal).' };
  const eposta = String(t.email || '').trim();
  if (!EPOSTA_RE.test(eposta)) return { ok: false, durum: 409, mesaj: 'Talepte geçerli bir e-posta adresi yok.' };

  // 3) Kaldırılan kaydı bu talebe mi ait (eski akışta talep_id yok → tür + kimlik eşleşmesi)
  let kaldirilanId: string | null = null;
  if (g.kaldirilanId) {
    const { data: k } = await db.from('kaldirilan_profiller').select('id,talep_id,entity_type,eski_entity_id').eq('id', String(g.kaldirilanId)).maybeSingle();
    const ait = k && (k.talep_id ? k.talep_id === t.id : (k.entity_type === t.entity_type && String(k.eski_entity_id) === String(t.entity_id)));
    if (!ait) return { ok: false, durum: 400, mesaj: 'Kaldırılan kayıt bu talebe ait değil.' };
    kaldirilanId = k.id;
  }

  const baglam = baglamBul(String(t.status));
  const govde = epostaGovdesi(metin, baglam);

  // 4) Deneme: yalnız yöneticinin kendi adresine, kayıt yazmadan
  if (g.deneme) {
    const not = `<div style="margin:0 0 14px;padding:10px 12px;background:#FFF7E6;border:1px solid #F5D48A;border-radius:8px;font-size:12.5px;color:#7A4B00;line-height:1.5;">DENEME — bu e-posta yalnız size gönderildi. Gerçek alıcı: <strong>${esc(eposta)}</strong></div>`;
    const r = await sendEmail({ to: ADMIN_EMAIL, subject: `[Deneme] ${konu}`, html: mailShell(esc(konu), not + govde), replyTo: ADMIN_EMAIL });
    if (r.skipped) return { ok: false, durum: 503, mesaj: 'E-posta servisi yapılandırılmamış (RESEND_API_KEY yok).' };
    if (!r.ok) return { ok: false, durum: 502, mesaj: `Deneme e-postası gönderilemedi: ${r.error || ''}` };
    return { ok: true, deneme: true, mesaj: `Deneme e-postası ${ADMIN_EMAIL} adresine gönderildi.` };
  }

  // 5) Ret + önceki gönderimler: aynı talep ya da aynı adres (tablolar yoksa gönderim yok)
  const alici = eposta.toLowerCase();
  const [a, b, rt] = await Promise.all([
    db.from(TABLO).select(ALANLAR).eq('alici', alici).order('created_at', { ascending: false }).limit(50),
    db.from(TABLO).select(ALANLAR).eq('talep_id', t.id).order('created_at', { ascending: false }).limit(50),
    db.from(RET_TABLO).select('alici,created_at').eq('alici', alici).limit(1),
  ]);
  const kErr = a.error || b.error || rt.error;
  if (kErr) return tabloYok(kErr.message)
    ? { ok: false, durum: 503, mesaj: MIGRATION_MESAJI, migration: true }
    : { ok: false, durum: 500, mesaj: `Gönderim kaydı okunamadı: ${kErr.message}` };
  if ((rt.data || []).length) {
    return { ok: false, durum: 409, ret: true, mesaj: `Bu kişi e-posta almak istemediğini bildirdi (${new Date(rt.data[0].created_at).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })}); e-posta gönderilemez.` };
  }
  const onceki = new Map<string, KaldirmaEpostaKaydi>();
  for (const r of [...(a.data || []), ...(b.data || [])] as KaldirmaEpostaKaydi[]) onceki.set(r.id, r);
  if (onceki.size && !g.tekrarOnay) {
    const liste = Array.from(onceki.values()).sort((x, y) => y.created_at.localeCompare(x.created_at));
    return { ok: false, durum: 409, mesaj: 'Bu kişiye daha önce e-posta gönderildi.', tekrar: liste };
  }

  // 6) Gönder
  const r = await sendEmail({ to: eposta, replyTo: ADMIN_EMAIL, subject: konu, html: mailShell(esc(konu), govde) });
  if (r.skipped) return { ok: false, durum: 503, mesaj: 'E-posta servisi yapılandırılmamış (RESEND_API_KEY yok); gönderilmedi.' };
  if (!r.ok) return { ok: false, durum: 502, mesaj: `E-posta gönderilemedi: ${r.error || ''}` };

  // 7) Kayıt — e-posta gitti; kayıt yazılamazsa yöneticiye söylenir (tekrar uyarısı bu kişi için çalışmaz)
  const { data: kayit, error: insErr } = await db.from(TABLO)
    .insert({ talep_id: t.id, kaldirilan_id: kaldirilanId, alici, sablon: g.sablon, konu })
    .select(ALANLAR).maybeSingle();
  if (insErr) {
    console.error('kaldirma eposta kaydi:', insErr.message);
    return { ok: true, kayit: null, mesaj: `E-posta gönderildi: ${eposta} — ama gönderim kaydı yazılamadı (${insErr.message}); bu kişiye tekrar göndermeden önce uyarı çıkmaz.` };
  }
  return { ok: true, kayit: kayit as KaldirmaEpostaKaydi, mesaj: `E-posta gönderildi: ${eposta}` };
}
