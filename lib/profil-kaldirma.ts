// ─────────────────────────────────────────────────────────────────
//  Profil kaldırma akışı — YÖNETİCİ KARARI (2026-10-26). Yalnız sunucuda.
//
//  Talep gelir → profil YAYINDA KALIR, talep yönetici paneline düşer
//    (admin → Kaldırma Talepleri), talep sahibine e-posta doğrulama bağlantısı gider.
//  Yönetici 48 saat içinde karar vermezse profil DURAKLATILIR (yayından alınır):
//    işletme satırına talep anında `duraklat_at = +48 saat` yazılır → detay sayfası
//    o an geçince 404 verir (cron beklenmez); cron + admin listesi durumu
//    `duraklatildi` yapıp `gizli=true` yazar.
//  Yönetici kararları (kaldirmaKarar):
//    kaldir       → TAM YEDEK (kayıt + yorumlar + sahiplik) kaldirilan_profiller'e,
//                   sonra kayıt silinir; yedek UYUM_SURE.kaldirma_yedek_gun gün tutulur.
//    duraklat     → profil hemen yayından alınır, karar bekler.
//    yayinda_tut  → talep reddedilir, profil yayına döner (gizli=false, duraklat_at=null).
//    soru         → talep sahibine "neden kaldırılmalı?" sorusu e-postayla gider
//                   (yanıt yöneticiye; soru talepte kayıtlı).
//  Geri yükleme (profilGeriYukle): yedekten kayıt + yorumlar + sahiplik geri yazılır,
//    kaldırılanlar listesinde "geri yüklendi" işaretlenir.
//
//  Eski akış (2026-10-25): talep = anında gizleme, e-posta onayı = SİLME. Artık
//  e-posta bağlantısı yalnız adresi doğrular; hiçbir şeyi silmez.
//  Migration: 2026-10-25_profil_kaldirma.sql + 2026-10-26_kaldirma_karari.sql
// ─────────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { sendEmail, mailShell, satir, satirTel, esc } from '@/lib/email';
import { isletmeBilgisi } from '@/lib/entity-link';
import { SAHIPLIK_TABLO } from '@/lib/sahiplik';
import { entitySil, tabloYok, type SilinebilirTablo } from '@/lib/entity-sil';
import { SIRKET } from '@/lib/sirket';
import { AYDINLATMA_YOL, UYUM_SURE } from '@/lib/uyum';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const SITE = 'https://www.hekimhane.com.tr';
const SAAT = 3600_000;

export function kaldirmaIstemcisi(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const tarihTR = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });
const zamanTR = (d: Date) => d.toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
const dugme = (href: string, metin: string) =>
  `<div style="margin:16px 0 6px;"><a href="${href}" style="display:inline-block;background:#1A335E;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;padding:12px 22px;">${metin}</a></div>`;
const p = (html: string) => `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">${html}</p>`;
const imza = `<p style="font-size:13px;color:#6E6E73;margin-top:12px;">Saygılarımızla, Hekimhane Ekibi</p>`;

function onbellekTazele() {
  try { revalidatePath('/'); revalidateTag('facets'); } catch { /* build dışı */ }
}

/** İşletme satırına alan yazar (gizli / duraklat_at). Kolon yoksa false; hata fırlatmaz. */
async function isletmeGuncelle(admin: SupabaseClient, tip: string, id: string, patch: Record<string, unknown>): Promise<boolean> {
  const tablo = SAHIPLIK_TABLO[tip];
  if (!tablo) return false;
  const { error } = await (admin as any).from(tablo).update(patch).eq('id', id);
  if (!error) { onbellekTazele(); return true; }
  // duraklat_at kolonu yoksa yalnız gizli'yi dene (2026-10-26 migration'ı çalışmamış)
  if ('duraklat_at' in patch && /duraklat_at/.test(error.message || '') && 'gizli' in patch) {
    const { error: e2 } = await (admin as any).from(tablo).update({ gizli: patch.gizli }).eq('id', id);
    if (!e2) { onbellekTazele(); return true; }
  }
  if (!tabloYok(error.message)) console.error('isletmeGuncelle:', error.message);
  return false;
}

/* ─────────────────────────── Talep ─────────────────────────── */

export interface KaldirmaGirdisi {
  entity_type: string;
  entity_id: string;
  ad_soyad: string;
  talep_eden: 'sahip' | 'yetkili';
  email: string;
  tel: string;          // cep telefonu — zorunlu (route doğrular)
  aciklama: string;     // kaldırma nedeni — zorunlu
  ip?: string | null;
}

export type KaldirmaSonucu =
  | { ok: true; kayitli: boolean; kararSon: string }
  | { ok: false; durum: number; mesaj: string };

/**
 * Talebi kaydeder (profil yayında kalır), işletmeye 48 saatlik duraklatma zamanını yazar,
 * talep sahibine doğrulama + admin'e bildirim e-postası gönderir.
 * Aynı işletme için açık talep varsa onun süresi korunur (yeniden göndermek süreyi uzatmaz).
 */
export async function kaldirmaTalebiOlustur(admin: SupabaseClient, g: KaldirmaGirdisi): Promise<KaldirmaSonucu> {
  const tablo = SAHIPLIK_TABLO[g.entity_type];
  if (!tablo) return { ok: false, durum: 400, mesaj: 'Geçersiz profil türü.' };
  const db = admin as any;

  const { data: row, error: rowErr } = await db.from(tablo).select('*').eq('id', g.entity_id).maybeSingle();
  if (rowErr) return { ok: false, durum: 500, mesaj: 'Profil doğrulanamadı, lütfen tekrar deneyin.' };
  if (!row) return { ok: false, durum: 404, mesaj: 'Profil bulunamadı.' };

  const b = await isletmeBilgisi(admin, g.entity_type, g.entity_id);
  const profilAdi = b.ad || String(row.name || '') || 'Profil';
  const il = row.il ? String(row.il) : null;

  // Açık talep varsa süresini devral
  let kararSon = new Date(Date.now() + UYUM_SURE.kaldirma_duraklatma_saat * SAAT);
  const { data: acik } = await db.from('profil_kaldirma_talepleri').select('id,karar_son,status')
    .eq('entity_type', g.entity_type).eq('entity_id', g.entity_id).in('status', ['bekliyor', 'duraklatildi'])
    .order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (acik?.karar_son && new Date(acik.karar_son).getTime() < kararSon.getTime()) kararSon = new Date(acik.karar_son);
  const zatenDuraklatildi = acik?.status === 'duraklatildi';

  const token = randomBytes(24).toString('hex');
  const kayit: Record<string, unknown> = {
    entity_type: g.entity_type, entity_id: g.entity_id, entity_name: profilAdi, il,
    ad_soyad: g.ad_soyad.slice(0, 120), talep_eden: g.talep_eden, email: g.email.slice(0, 160),
    tel: g.tel.slice(0, 40), aciklama: g.aciklama.slice(0, 1500),
    token_hash: sha256(token), token_son: new Date(Date.now() + UYUM_SURE.kaldirma_token_saat * SAAT).toISOString(),
    status: zatenDuraklatildi ? 'duraklatildi' : 'bekliyor', ip: g.ip || null,
    karar_son: kararSon.toISOString(),
  };
  let { error: insErr } = await db.from('profil_kaldirma_talepleri').insert(kayit);
  if (insErr && /karar_son/.test(insErr.message || '')) {
    // 2026-10-26 migration'ı yok: karar_son'suz kaydet (48 saat kuralı yine işletme satırından çalışmaz)
    const { karar_son: _k, ...eski } = kayit; void _k;
    ({ error: insErr } = await db.from('profil_kaldirma_talepleri').insert(eski));
  }
  const kayitli = !insErr;
  if (kayitli) {
    // Önceki açık talepler → iptal (son talep geçerli; süresi devralındı)
    await db.from('profil_kaldirma_talepleri').update({ status: 'iptal' })
      .eq('entity_type', g.entity_type).eq('entity_id', g.entity_id).in('status', ['bekliyor', 'duraklatildi'])
      .neq('token_hash', kayit.token_hash);
  } else if (!tabloYok(insErr.message)) {
    console.error('kaldirma insert:', insErr.message);
  }

  // Profil yayında kalır; yalnız 48 saat sonrası yazılır (karar yoksa o an kendiliğinden yayından çıkar)
  if (!zatenDuraklatildi) await isletmeGuncelle(admin, g.entity_type, g.entity_id, { duraklat_at: kararSon.toISOString() });

  // Tablo yoksa talep kaybolmasın: admin'in Randevu & Çekim listesine ayna kayıt
  if (!kayitli) {
    try {
      await db.from('cekim_talepleri').insert({
        isletme_adi: profilAdi, isletme_turu: 'profil-kaldirma', entity_id: g.entity_id,
        ad_soyad: g.ad_soyad, tel: g.tel, email: g.email, durum: 'beklemede',
        notlar: ['[PROFİL KALDIRMA TALEBİ — tablo yok, elle işlenmeli]', `Tür: ${g.entity_type}`,
          `Talep eden: ${g.talep_eden === 'sahip' ? 'profil sahibi' : 'yetkili kişi'}`, `Neden: ${g.aciklama}`].join(' | '),
      });
    } catch { /* best-effort */ }
  }

  const dogrulaUrl = `${SITE}/profil-kaldir/onay?t=${token}`;
  try {
    await sendEmail({
      to: g.email,
      subject: 'Profil kaldırma talebiniz alındı',
      html: mailShell('Profil kaldırma talebiniz alındı',
        p(`Merhaba <strong>${esc(g.ad_soyad)}</strong>,`) +
        p(`${esc(tarihTR(new Date()))} tarihinde Hekimhane'deki <strong>${esc(profilAdi)}</strong> profilinin kaldırılması için bir talep aldık. Talebiniz yönetici incelemesine alındı.`) +
        p(`Yönetici en geç <strong>${UYUM_SURE.kaldirma_duraklatma_saat} saat</strong> içinde karar verir; bu sürede karar verilmezse profil <strong>${esc(zamanTR(kararSon))}</strong> itibarıyla geçici olarak yayından alınır. Ek bilgi gerekirse bu adresten size yazacağız.`) +
        (kayitli ? p('Talebin size ait olduğunu doğrulamak için lütfen aşağıdaki düğmeye basın:') + dugme(dogrulaUrl, 'E-posta adresimi doğrula') +
          `<p style="font-size:12px;color:#6E6E73;line-height:1.6;">Bağlantı ${UYUM_SURE.kaldirma_token_saat} saat geçerlidir. Düğme çalışmazsa bu adresi tarayıcınıza yapıştırın: ${esc(dogrulaUrl)}</p>` : '') +
        `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:14px;">Bu talebi siz yapmadıysanız <a href="mailto:${SIRKET.eposta}" style="color:#1A335E;">${SIRKET.eposta}</a> adresine yazın; profil yayında kalır.</p>` + imza),
    });
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Profil kaldırma talebi — ${profilAdi} (karar: ${zamanTR(kararSon)})`,
      html: mailShell('Profil Kaldırma Talebi — kararınız bekleniyor',
        p(`Profil şu an <strong>yayında</strong>. ${esc(zamanTR(kararSon))} tarihine kadar karar vermezseniz profil kendiliğinden <strong>duraklatılır</strong> (yayından alınır, silinmez).`) +
        satir('Profil', profilAdi) + satir('Tür', g.entity_type) + satir('Konum', b.konum) +
        (b.url ? `<p style="margin:6px 0;font-size:14px;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${esc(b.url)}" style="color:#1A335E;">${esc(b.url.replace(/^https?:\/\/(www\.)?/, ''))}</a></p>` : '') +
        `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">` +
        satir('Talep eden', `${g.ad_soyad} (${g.talep_eden === 'sahip' ? 'profil sahibi' : 'yetkili kişi'})`) +
        satir('E-posta', g.email) + satirTel('Cep telefonu', g.tel) + satir('Kaldırma nedeni', g.aciklama) +
        dugme(`${SITE}/admin`, 'Kaldırma Talepleri sekmesini aç') +
        (kayitli ? '' : `<p style="font-size:12px;color:#B42318;">profil_kaldirma_talepleri tablosu yok — talep yalnız bu e-postada ve Randevu & Çekim listesinde. Migration'ları çalıştırın.</p>`)),
      replyTo: g.email,
    });
  } catch { /* e-posta ana akışı düşürmez */ }

  return { ok: true, kayitli, kararSon: kararSon.toISOString() };
}

/* ─────────────────────── E-posta doğrulama ─────────────────────── */

export type DogrulamaSonucu =
  | { ok: true; profilAdi: string; kararSon: string | null }
  | { ok: false; neden: 'gecersiz' | 'suresi_dolmus' | 'kapandi'; mesaj: string };

/** E-postadaki bağlantı: yalnız adresi doğrular. Hiçbir şeyi silmez ya da gizlemez. */
export async function kaldirmaEpostaDogrula(admin: SupabaseClient, token: string): Promise<DogrulamaSonucu> {
  if (!/^[a-f0-9]{48}$/.test(token)) return { ok: false, neden: 'gecersiz', mesaj: 'Bağlantı geçersiz.' };
  const db = admin as any;
  const { data: t, error } = await db.from('profil_kaldirma_talepleri').select('*').eq('token_hash', sha256(token)).maybeSingle();
  if (error || !t) return { ok: false, neden: 'gecersiz', mesaj: 'Bağlantı geçersiz veya daha yeni bir taleple değiştirilmiş.' };
  if (!['bekliyor', 'duraklatildi'].includes(t.status)) return { ok: false, neden: 'kapandi', mesaj: 'Bu talep sonuçlandırıldı; ayrıntılar e-postanıza gönderildi.' };
  if (new Date(t.token_son).getTime() < Date.now()) return { ok: false, neden: 'suresi_dolmus', mesaj: 'Bağlantının süresi dolmuş. Talebiniz yine de yönetici incelemesinde.' };
  if (!t.email_dogrulandi_at) {
    const { error: e } = await db.from('profil_kaldirma_talepleri').update({ email_dogrulandi_at: new Date().toISOString() }).eq('id', t.id);
    if (e && !tabloYok(e.message)) console.error('kaldirma dogrula:', e.message);
  }
  return { ok: true, profilAdi: t.entity_name || 'Profil', kararSon: t.karar_son || null };
}

/* ─────────────────────── 48 saat kuralı ─────────────────────── */

/** Süresi dolan açık talepleri duraklatır; süresi geçmiş yedekleri boşaltır. Cron + admin listesi çağırır. */
export async function kaldirmaZamanAsimi(admin: SupabaseClient): Promise<{ duraklatilan: number }> {
  const db = admin as any;
  const simdi = new Date().toISOString();
  let duraklatilan = 0;
  const { data: dolan, error } = await db.from('profil_kaldirma_talepleri').select('*')
    .eq('status', 'bekliyor').lte('karar_son', simdi).limit(200);
  if (!error) {
    for (const t of dolan || []) {
      await isletmeGuncelle(admin, t.entity_type, String(t.entity_id), { gizli: true });
      await db.from('profil_kaldirma_talepleri').update({ status: 'duraklatildi', duraklatildi_at: simdi }).eq('id', t.id);
      duraklatilan++;
      try {
        await sendEmail({
          to: ADMIN_EMAIL, subject: `Profil duraklatıldı (48 saat doldu) — ${t.entity_name || t.entity_id}`,
          html: mailShell('Profil duraklatıldı', p(`<strong>${esc(t.entity_name || '')}</strong> için kaldırma talebine ${UYUM_SURE.kaldirma_duraklatma_saat} saat içinde karar verilmediği için profil yayından alındı. Kayıt silinmedi; Kaldırma Talepleri sekmesinden kaldırabilir ya da yayına geri alabilirsiniz.`) +
            satir('Talep eden', `${t.ad_soyad} — ${t.email}`) + satirTel('Cep telefonu', t.tel) + satir('Neden', t.aciklama) + dugme(`${SITE}/admin`, 'Kaldırma Talepleri')),
        });
        await sendEmail({
          to: t.email, subject: 'Profil geçici olarak yayından alındı',
          html: mailShell('Profil geçici olarak yayından alındı',
            p(`Merhaba <strong>${esc(t.ad_soyad)}</strong>,`) +
            p(`<strong>${esc(t.entity_name || '')}</strong> profili, kaldırma talebiniz incelenirken geçici olarak yayından alındı. Kesin karar verildiğinde size ayrıca bilgi vereceğiz.`) + imza),
        });
      } catch { /* sessiz */ }
    }
  } else if (!tabloYok(error.message) && !/karar_son/.test(error.message || '')) {
    console.error('kaldirmaZamanAsimi:', error.message);
  }
  // Süresi dolmuş yedekleri boşalt — yalnız ad, il, tarih kalır
  try { await db.from('kaldirilan_profiller').update({ yedek: null }).lte('yedek_silinme', simdi).not('yedek', 'is', null); } catch { /* kolon yok */ }
  return { duraklatilan };
}

/* ─────────────────────── Yönetici kararı ─────────────────────── */

export type KararAksiyon = 'kaldir' | 'duraklat' | 'yayinda_tut' | 'soru';
export type KararSonucu = { ok: true; mesaj: string; mail?: boolean } | { ok: false; durum: number; mesaj: string };

export async function kaldirmaKarar(admin: SupabaseClient, talepId: string, aksiyon: KararAksiyon, notMetni: string | null, bildir = true): Promise<KararSonucu> {
  const db = admin as any;
  const { data: t } = await db.from('profil_kaldirma_talepleri').select('*').eq('id', talepId).maybeSingle();
  if (!t) return { ok: false, durum: 404, mesaj: 'Talep bulunamadı.' };
  const acik = ['bekliyor', 'duraklatildi'].includes(t.status);
  const simdi = new Date().toISOString();
  const not = notMetni ? notMetni.trim().slice(0, 2000) : null;
  const tip = String(t.entity_type), id = String(t.entity_id);

  if (aksiyon === 'soru') {
    if (!acik) return { ok: false, durum: 409, mesaj: 'Bu talep kapanmış.' };
    if (!not || not.length < 5) return { ok: false, durum: 400, mesaj: 'Soruyu yazın.' };
    const r = await sendEmail({
      to: t.email, replyTo: ADMIN_EMAIL,
      subject: `Profil kaldırma talebiniz hakkında bir sorumuz var — ${t.entity_name || ''}`,
      html: mailShell('Talebiniz hakkında bir sorumuz var',
        p(`Merhaba <strong>${esc(t.ad_soyad)}</strong>,`) +
        p(`<strong>${esc(t.entity_name || '')}</strong> profilinin kaldırılması talebinizi inceliyoruz. Karar verebilmemiz için aşağıdaki soruyu yanıtlamanızı rica ederiz:`) +
        `<div style="margin:0 0 14px;padding:12px 14px;background:#F8FAFF;border-left:3px solid #1A335E;border-radius:8px;font-size:14px;color:#1c1c1e;line-height:1.6;">${esc(not).replace(/\n/g, '<br>')}</div>` +
        p('Yanıtınızı <strong>bu e-postayı yanıtlayarak</strong> gönderebilirsiniz. Doktor ya da işletme adına başvurduysanız yetki belgenizi de ekleyin.') + imza),
    });
    if (!r.ok && !r.skipped) return { ok: false, durum: 502, mesaj: `E-posta gönderilemedi: ${r.error || ''}` };
    await db.from('profil_kaldirma_talepleri').update({ soru_metni: not, soru_at: simdi }).eq('id', t.id);
    return { ok: true, mesaj: r.ok ? `Soru gönderildi: ${t.email}` : 'Soru kaydedildi (e-posta servisi yapılandırılmamış)', mail: r.ok };
  }

  if (aksiyon === 'duraklat') {
    if (!acik) return { ok: false, durum: 409, mesaj: 'Bu talep kapanmış.' };
    await isletmeGuncelle(admin, tip, id, { gizli: true });
    await db.from('profil_kaldirma_talepleri').update({ status: 'duraklatildi', duraklatildi_at: t.duraklatildi_at || simdi, karar_notu: not ?? t.karar_notu }).eq('id', t.id);
    return { ok: true, mesaj: 'Profil duraklatıldı (yayından alındı, silinmedi).' };
  }

  if (aksiyon === 'yayinda_tut') {
    if (!acik) return { ok: false, durum: 409, mesaj: 'Bu talep kapanmış.' };
    await isletmeGuncelle(admin, tip, id, { gizli: false, duraklat_at: null });
    await db.from('profil_kaldirma_talepleri').update({ status: 'reddedildi', karar_notu: not, karar_at: simdi }).eq('id', t.id);
    let mail = false;
    if (bildir) {
      const r = await sendEmail({
        to: t.email, replyTo: ADMIN_EMAIL, subject: `Profil kaldırma talebiniz sonuçlandı — ${t.entity_name || ''}`,
        html: mailShell('Talebiniz sonuçlandı',
          p(`Merhaba <strong>${esc(t.ad_soyad)}</strong>,`) +
          p(`<strong>${esc(t.entity_name || '')}</strong> profilinin kaldırılması talebinizi inceledik; profil şu an için yayında kalacak.`) +
          (not ? `<div style="margin:0 0 14px;padding:12px 14px;background:#F8FAFF;border-left:3px solid #1A335E;border-radius:8px;font-size:14px;color:#1c1c1e;line-height:1.6;">${esc(not).replace(/\n/g, '<br>')}</div>` : '') +
          p(`Profil size aitse <a href="${SITE}/sahiplen?id=${encodeURIComponent(id)}&type=${encodeURIComponent(tip)}" style="color:#1A335E;">profili sahiplenerek</a> bilgileri düzeltebilir ya da bu e-postayı yanıtlayarak ek bilgi gönderebilirsiniz.`) + imza),
      });
      mail = r.ok;
    }
    return { ok: true, mesaj: 'Talep reddedildi, profil yayında.', mail };
  }

  // aksiyon === 'kaldir'
  if (!acik) return { ok: false, durum: 409, mesaj: 'Bu talep kapanmış.' };
  const tablo = SAHIPLIK_TABLO[tip] as SilinebilirTablo | undefined;
  if (!tablo) return { ok: false, durum: 400, mesaj: 'Profil türü çözülemedi.' };
  const { data: row } = await db.from(tablo).select('*').eq('id', id).maybeSingle();

  if (row) {
    // 1) Tam yedek — silmeden ÖNCE; yedek yazılamazsa silme yapılmaz
    const [yr, cr] = await Promise.all([
      db.from('yorumlar').select('*').eq('entity_type', tip).eq('entity_id', id),
      db.from('claim_requests').select('*').eq('entity_type', tip).eq('entity_id', id),
    ]);
    const yedek = { kayit: row, yorumlar: yr.data || [], claims: cr.data || [], tablo };
    const { error: kErr } = await db.from('kaldirilan_profiller').insert({
      entity_type: tip, eski_entity_id: id, ad: t.entity_name || t.ad_soyad, il: t.il,
      talep_tarihi: String(t.created_at).slice(0, 10), talep_id: t.id, yedek,
      yedek_silinme: new Date(Date.now() + UYUM_SURE.kaldirma_yedek_gun * 24 * SAAT).toISOString(),
    });
    if (kErr) return { ok: false, durum: 500, mesaj: `Yedek alınamadı, kayıt silinmedi: ${kErr.message}. 2026-10-26_kaldirma_karari.sql çalıştırılmış olmalı.` };

    // 2) Sil
    const s = await entitySil(admin, tablo, id);
    if (!s.ok) {
      await db.from('kaldirilan_profiller').delete().eq('talep_id', t.id).is('geri_yuklendi_at', null);   // yarım kalan yedek satırı geri al
      return { ok: false, durum: s.kod === 'abonelik' ? 409 : 500, mesaj: s.mesaj };
    }
  }
  await db.from('profil_kaldirma_talepleri').update({ status: 'kaldirildi', karar_notu: not, karar_at: simdi, confirmed_at: simdi }).eq('id', t.id);

  let mail = false;
  if (bildir) {
    const r = await sendEmail({
      to: t.email, subject: 'Profiliniz Hekimhane\'den kaldırıldı',
      html: mailShell('Profiliniz Hekimhane\'den kaldırıldı',
        p(`Merhaba <strong>${esc(t.ad_soyad)}</strong>,`) +
        p(`<strong>${esc(t.entity_name || '')}</strong> profili ${esc(tarihTR(new Date()))} itibarıyla Hekimhane'den kaldırıldı. Yanlış ya da yetkisiz bir talebe karşı kayıt ${UYUM_SURE.kaldirma_yedek_gun} gün boyunca geri yüklenebilir biçimde saklanır, ardından silinir; yeniden eklenmemesi için yalnızca ad, il ve talep tarihi kaldırılanlar listesinde kalır.`) +
        p(`İleride yeniden listelenmek isterseniz <a href="${SITE}/katil" style="color:#1A335E;">hekimhane.com.tr/katil</a> üzerinden başvurabilirsiniz. Kişisel verilerinizin nasıl işlendiğini <a href="${SITE}${AYDINLATMA_YOL.profesyonel}" style="color:#1A335E;">Profesyoneller Aydınlatma Metni</a>'nde okuyabilirsiniz.`) + imza),
    });
    mail = r.ok;
  }
  return { ok: true, mesaj: row ? 'Profil kaldırıldı; yedek Kaldırılan Profiller listesinde.' : 'Kayıt zaten yoktu; talep kapatıldı.', mail };
}

/* ─────────────────────── Geri yükleme ─────────────────────── */

export async function profilGeriYukle(admin: SupabaseClient, kaldirilanId: string): Promise<KararSonucu> {
  const db = admin as any;
  const { data: k } = await db.from('kaldirilan_profiller').select('*').eq('id', kaldirilanId).maybeSingle();
  if (!k) return { ok: false, durum: 404, mesaj: 'Kayıt bulunamadı.' };
  if (k.geri_yuklendi_at) return { ok: false, durum: 409, mesaj: 'Bu profil zaten geri yüklendi.' };
  const y = k.yedek as { kayit?: any; yorumlar?: any[]; claims?: any[]; tablo?: string } | null;
  if (!y?.kayit) return { ok: false, durum: 409, mesaj: 'Bu kaydın yedeği yok (eski akışta silinmiş ya da yedek süresi dolmuş). Elle eklenmesi gerekir.' };
  const tablo = SAHIPLIK_TABLO[k.entity_type];
  if (!tablo) return { ok: false, durum: 400, mesaj: 'Profil türü çözülemedi.' };

  const { data: var_ } = await db.from(tablo).select('id').eq('id', y.kayit.id).maybeSingle();
  if (var_) return { ok: false, durum: 409, mesaj: `Bu kimlikle (${y.kayit.id}) bir kayıt zaten var.` };

  const kayit = { ...y.kayit, gizli: false, duraklat_at: null };
  let { error } = await db.from(tablo).insert(kayit);
  if (error && /duraklat_at|gizli/.test(error.message || '')) {
    const { duraklat_at: _d, gizli: _g, ...sade } = kayit; void _d; void _g;
    ({ error } = await db.from(tablo).insert(sade));
  }
  if (error) return { ok: false, durum: 500, mesaj: `Kayıt geri yüklenemedi: ${error.message}` };

  const uyarilar: string[] = [];
  if (y.yorumlar?.length) { const { error: e } = await db.from('yorumlar').insert(y.yorumlar); if (e) uyarilar.push(`yorumlar: ${e.message}`); }
  if (y.claims?.length)   { const { error: e } = await db.from('claim_requests').insert(y.claims); if (e) uyarilar.push(`sahiplik: ${e.message}`); }

  await db.from('kaldirilan_profiller').update({ geri_yuklendi_at: new Date().toISOString() }).eq('id', k.id);
  if (k.talep_id) await db.from('profil_kaldirma_talepleri').update({ status: 'reddedildi', karar_notu: 'Profil geri yüklendi.', karar_at: new Date().toISOString() }).eq('id', k.talep_id);
  onbellekTazele();
  return { ok: true, mesaj: `Profil geri yüklendi (${y.yorumlar?.length || 0} yorum, ${y.claims?.length || 0} sahiplik kaydı).${uyarilar.length ? ' Uyarı: ' + uyarilar.join('; ') : ''}` };
}

/* ─────────────────────── Admin listesi ─────────────────────── */

export async function kaldirmaListesi(admin: SupabaseClient) {
  const db = admin as any;
  await kaldirmaZamanAsimi(admin);
  const [tr, kr] = await Promise.all([
    db.from('profil_kaldirma_talepleri').select('*').neq('status', 'iptal').order('created_at', { ascending: false }).limit(300),
    db.from('kaldirilan_profiller').select('id,entity_type,eski_entity_id,ad,il,talep_tarihi,kaldirma_tarihi,talep_id,yedek_silinme,geri_yuklendi_at,yedek').order('kaldirma_tarihi', { ascending: false }).limit(300),
  ]);
  const migration = [tr.error, kr.error].some(e => e && /column|karar_|yedek|talep_id|geri_yuklendi/i.test(e.message || ''));
  const talepler = (tr.data || []) as any[];
  // Açık taleplerde profil bağlantısı (az sayıda — tek tek çözülür)
  const urls: Record<string, string> = {};
  await Promise.all(talepler.filter(t => ['bekliyor', 'duraklatildi'].includes(t.status)).slice(0, 60).map(async t => {
    const b = await isletmeBilgisi(admin, t.entity_type, String(t.entity_id));
    if (b.url) urls[t.id] = b.url.replace(SITE, '');
  }));
  const kaldirilanlar = ((kr.data || []) as any[]).map(({ yedek, ...r }) => ({ ...r, yedekVar: !!yedek?.kayit, yorumSayisi: yedek?.yorumlar?.length || 0 }));
  return { talepler, kaldirilanlar, urls, migration: migration || (!!tr.error && tabloYok(tr.error.message)) };
}
