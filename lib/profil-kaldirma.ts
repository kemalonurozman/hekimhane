// ─────────────────────────────────────────────────────────────────
//  Profil kaldırma akışı — sunucu tarafı (Eki 2026).
//
//  Talep gelir → profil ANINDA gizlenir (`gizli=true`) → talep sahibine tek
//  kullanımlık onay bağlantısı gider → bağlantı tıklanınca kayıt silinir,
//  ad/il/tarih "kaldırıldı listesine" yazılır, "kaldırıldı" e-postası gider.
//
//  Graceful: `profil_kaldirma_talepleri` tablosu yoksa talep cekim_talepleri'ne
//  düşer ve admin e-postası gider (onay bağlantısı çalışmaz — elle tamamlanır).
//  `gizli` kolonu yoksa gizleme sessizce atlanır. Migration:
//  supabase/migrations/2026-10-25_profil_kaldirma.sql
//
//  Yalnız sunucuda (service-role).
// ─────────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import { sendEmail, mailShell, satir, satirTel, esc } from '@/lib/email';
import { isletmeBilgisi } from '@/lib/entity-link';
import { SAHIPLIK_TABLO } from '@/lib/sahiplik';
import { entitySil, tabloYok, type SilinebilirTablo } from '@/lib/entity-sil';
import { SIRKET } from '@/lib/sirket';
import { AYDINLATMA_YOL, UYUM_SURE } from '@/lib/uyum';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const SITE = 'https://www.hekimhane.com.tr';

export function kaldirmaIstemcisi(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const tarihTR = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });

/** İşletme satırını gizler/açar. Kolon yoksa false döner, hata fırlatmaz. */
export async function profilGizle(admin: SupabaseClient, tip: string, id: string, gizli: boolean): Promise<boolean> {
  const tablo = SAHIPLIK_TABLO[tip];
  if (!tablo) return false;
  const { error } = await (admin as any).from(tablo).update({ gizli }).eq('id', id);
  if (error) {
    if (!tabloYok(error.message)) console.error('profilGizle:', error.message);
    return false;
  }
  return true;
}

export interface KaldirmaGirdisi {
  entity_type: string;
  entity_id: string;
  ad_soyad: string;
  talep_eden: 'sahip' | 'yetkili';
  email: string;
  tel?: string | null;
  aciklama?: string | null;
  ip?: string | null;
}

export type KaldirmaSonucu =
  | { ok: true; gizlendi: boolean; onayBaglantisi: boolean }
  | { ok: false; durum: number; mesaj: string };

/**
 * Talebi kaydeder, profili gizler, onay ve admin e-postalarını gönderir.
 * Aynı işletme için bekleyen talep varsa yeni token üretilir (eski bağlantı geçersizleşir).
 */
export async function kaldirmaTalebiOlustur(admin: SupabaseClient, g: KaldirmaGirdisi): Promise<KaldirmaSonucu> {
  const tablo = SAHIPLIK_TABLO[g.entity_type];
  if (!tablo) return { ok: false, durum: 400, mesaj: 'Geçersiz profil türü.' };

  const { data: row, error: rowErr } = await (admin as any).from(tablo).select('*').eq('id', g.entity_id).maybeSingle();
  if (rowErr) return { ok: false, durum: 500, mesaj: 'Profil doğrulanamadı, lütfen tekrar deneyin.' };
  if (!row) return { ok: false, durum: 404, mesaj: 'Profil bulunamadı.' };

  const b = await isletmeBilgisi(admin, g.entity_type, g.entity_id);
  const profilAdi = b.ad || String(row.name || '') || 'Profil';
  const il = row.il ? String(row.il) : null;

  // 1) Anında gizle — talep kaydedilemese bile profil yayında kalmasın
  const gizlendi = await profilGizle(admin, g.entity_type, g.entity_id, true);

  // 2) Tek kullanımlık onay bağlantısı
  const token = randomBytes(24).toString('hex');
  const tokenSon = new Date(Date.now() + UYUM_SURE.kaldirma_token_saat * 3600_000);
  let onayBaglantisi = false;

  const kayit = {
    entity_type: g.entity_type, entity_id: g.entity_id, entity_name: profilAdi, il,
    ad_soyad: g.ad_soyad.slice(0, 120), talep_eden: g.talep_eden, email: g.email.slice(0, 160),
    tel: g.tel ? String(g.tel).slice(0, 40) : null, aciklama: g.aciklama ? String(g.aciklama).slice(0, 1000) : null,
    token_hash: sha256(token), token_son: tokenSon.toISOString(), status: 'bekliyor', ip: g.ip || null,
  };
  const { error: insErr } = await (admin as any).from('profil_kaldirma_talepleri').insert(kayit);
  if (!insErr) {
    onayBaglantisi = true;
    // Aynı işletmenin önceki bekleyen talepleri → iptal (yalnız bu bağlantı geçerli)
    await (admin as any).from('profil_kaldirma_talepleri').update({ status: 'iptal' })
      .eq('entity_type', g.entity_type).eq('entity_id', g.entity_id).eq('status', 'bekliyor').neq('token_hash', kayit.token_hash);
  } else if (!tabloYok(insErr.message)) {
    console.error('kaldirma insert:', insErr.message);
  }

  // 3) Admin paneli (Randevu & Çekim listesi) için ayna kayıt — DDL'siz görünürlük
  try {
    await (admin as any).from('cekim_talepleri').insert({
      isletme_adi: profilAdi, isletme_turu: 'profil-kaldirma', entity_id: g.entity_id,
      ad_soyad: g.ad_soyad, tel: g.tel || '-', email: g.email,
      notlar: ['[PROFİL KALDIRMA TALEBİ]', `Tür: ${g.entity_type}`, `Talep eden: ${g.talep_eden === 'sahip' ? 'profil sahibi' : 'yetkili kişi'}`,
        `Profil gizlendi: ${gizlendi ? 'evet' : 'HAYIR (gizli kolonu yok)'}`, `Onay bağlantısı: ${onayBaglantisi ? 'gönderildi' : 'ÜRETİLEMEDİ (tablo yok) — elle tamamlanmalı'}`,
        g.aciklama ? `Açıklama: ${g.aciklama}` : null].filter(Boolean).join(' | '),
      durum: 'beklemede',
    });
  } catch { /* ayna kayıt best-effort */ }

  // 4) E-postalar
  const onayUrl = `${SITE}/profil-kaldir/onay?t=${token}`;
  const tarih = tarihTR(new Date());
  try {
    // Talep sahibine — belgenin 2. şablonu ("Kaldırma talebi alındı")
    await sendEmail({
      to: g.email,
      subject: 'Profil kaldırma talebinizi onaylayın',
      html: mailShell('Profil kaldırma talebinizi onaylayın',
        `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${esc(g.ad_soyad)}</strong>,</p>` +
        `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">${esc(tarih)} tarihinde Hekimhane'deki <strong>${esc(profilAdi)}</strong> profilinin kaldırılması için bir talep aldık. Profil şu anda yayında değil ve sizin açık isteğiniz olmadan yeniden yayına alınmayacak.</p>` +
        (onayBaglantisi
          ? `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Profil bilgilerinizin kalıcı olarak silinmesi için aşağıdaki bağlantıyı onaylamanız yeterli. Bağlantı ${UYUM_SURE.kaldirma_token_saat} saat geçerlidir.</p>` +
            `<div style="margin:16px 0 6px;"><a href="${onayUrl}" style="display:inline-block;background:#1A335E;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;padding:12px 22px;">Kaldırma talebimi onaylıyorum</a></div>` +
            `<p style="font-size:12px;color:#6E6E73;line-height:1.6;">Düğme çalışmazsa bu adresi tarayıcınıza yapıştırın: ${esc(onayUrl)}</p>`
          : `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Talebiniz ekibimize iletildi; kaldırma işlemi en geç ${UYUM_SURE.kaldirma_tipik_is_gunu} iş günü içinde tamamlanır ve size e-postayla bildirilir.</p>`) +
        `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:14px;">Bu talebi siz yapmadıysanız ve profilinizin yayında kalmasını istiyorsanız <a href="mailto:${SIRKET.eposta}" style="color:#1A335E;">${SIRKET.eposta}</a> adresine yazabilirsiniz.</p>` +
        `<p style="font-size:13px;color:#6E6E73;margin-top:12px;">Saygılarımızla, Hekimhane Ekibi</p>`),
    });
    // Admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Profil kaldırma talebi — ${profilAdi}`,
      html: mailShell('Profil Kaldırma Talebi',
        satir('Profil', profilAdi) + satir('Tür', g.entity_type) + satir('Konum', b.konum) +
        (b.url ? `<p style="margin:6px 0;font-size:14px;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${esc(b.url)}" style="color:#1A335E;">${esc(b.url.replace(/^https?:\/\/(www\.)?/, ''))}</a> <span style="color:#6E6E73;font-size:12px;">(${gizlendi ? 'şu an gizli' : 'GİZLENEMEDİ — gizli kolonu yok'})</span></p>` : '') +
        `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">` +
        satir('Talep eden', `${g.ad_soyad} (${g.talep_eden === 'sahip' ? 'profil sahibi' : 'yetkili kişi'})`) +
        satir('E-posta', g.email) + satirTel('Telefon', g.tel || null) + satir('Açıklama', g.aciklama || null) +
        `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">${onayBaglantisi
          ? 'Talep sahibi e-postadaki bağlantıyı onaylayınca kayıt silinir ve kaldırıldı listesine yazılır.'
          : 'profil_kaldirma_talepleri tablosu yok — onay bağlantısı üretilemedi. Migration 2026-10-25_profil_kaldirma.sql çalıştırılmalı; bu talep admin panelinden elle tamamlanmalı.'}</p>`),
      replyTo: g.email,
    });
  } catch { /* e-posta ana akışı düşürmez */ }

  return { ok: true, gizlendi, onayBaglantisi };
}

export type OnaySonucu =
  | { ok: true; profilAdi: string }
  | { ok: false; neden: 'gecersiz' | 'suresi_dolmus' | 'zaten' | 'abonelik' | 'hata'; mesaj: string };

/** Onay bağlantısı: token doğrula → kaldırıldı listesine yaz → kaydı sil → "kaldırıldı" e-postası. */
export async function kaldirmaOnayla(admin: SupabaseClient, token: string): Promise<OnaySonucu> {
  if (!/^[a-f0-9]{48}$/.test(token)) return { ok: false, neden: 'gecersiz', mesaj: 'Bağlantı geçersiz.' };
  const db = admin as any;
  const { data: t, error } = await db.from('profil_kaldirma_talepleri').select('*').eq('token_hash', sha256(token)).maybeSingle();
  if (error || !t) return { ok: false, neden: 'gecersiz', mesaj: 'Bağlantı geçersiz veya daha önce kullanılmış.' };
  if (t.status === 'onaylandi') return { ok: false, neden: 'zaten', mesaj: 'Bu talep daha önce onaylandı; profil kaldırılmıştır.' };
  if (t.status !== 'bekliyor') return { ok: false, neden: 'gecersiz', mesaj: 'Bu bağlantı artık geçerli değil.' };
  if (new Date(t.token_son).getTime() < Date.now()) return { ok: false, neden: 'suresi_dolmus', mesaj: 'Bağlantının süresi dolmuş. Profil yayında değil; yeniden talep oluşturabilirsiniz.' };

  const tablo = SAHIPLIK_TABLO[t.entity_type] as SilinebilirTablo | undefined;
  if (!tablo) return { ok: false, neden: 'hata', mesaj: 'Profil türü çözülemedi.' };

  // Kaldırıldı listesi — yalnız ad, il, tür, tarih (kayıt silinmeden ÖNCE)
  try {
    await db.from('kaldirilan_profiller').insert({
      entity_type: t.entity_type, eski_entity_id: t.entity_id, ad: t.entity_name || t.ad_soyad, il: t.il,
      talep_tarihi: String(t.created_at).slice(0, 10),
    });
  } catch { /* liste tablosu yoksa sessiz — admin maili yine gider */ }

  // Kayıt var mı? (admin daha önce elle silmiş olabilir)
  const { data: row } = await db.from(tablo).select('id').eq('id', t.entity_id).maybeSingle();
  if (row) {
    const s = await entitySil(admin, tablo, String(t.entity_id));
    if (!s.ok) {
      if (s.kod === 'abonelik') {
        // Aktif abonelik: kayıt gizli kalır, admin iptal edip siler
        try {
          await sendEmail({ to: ADMIN_EMAIL, subject: `Kaldırma onayı bekliyor (aktif abonelik) — ${t.entity_name || t.entity_id}`,
            html: mailShell('Kaldırma onayı — elle işlem gerekli', `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">${esc(t.entity_name || '')} profilinin sahibi kaldırma talebini onayladı ama kaydın aktif bir Pro aboneliği var. Premium Üyeler sekmesinden aboneliği iptal edip kaydı silin. Profil şu an gizli.</p>`) });
        } catch { /* sessiz */ }
        await db.from('profil_kaldirma_talepleri').update({ status: 'onaylandi', confirmed_at: new Date().toISOString() }).eq('id', t.id);
        return { ok: true, profilAdi: t.entity_name || 'Profil' };
      }
      return { ok: false, neden: 'hata', mesaj: 'Kayıt silinemedi; ekibimiz bilgilendirildi, profil yayında değil.' };
    }
  }

  await db.from('profil_kaldirma_talepleri').update({ status: 'onaylandi', confirmed_at: new Date().toISOString() }).eq('id', t.id);

  // Belgenin 3. şablonu ("Kaldırma tamamlandı")
  const tarih = tarihTR(new Date());
  try {
    await sendEmail({
      to: t.email,
      subject: 'Profiliniz Hekimhane\'den kaldırıldı',
      html: mailShell('Profiliniz Hekimhane\'den kaldırıldı',
        `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${esc(t.ad_soyad)}</strong>,</p>` +
        `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(t.entity_name || '')}</strong> profilinize ait bilgiler ${esc(tarih)} itibarıyla Hekimhane'den silindi. Profilinizin daha sonra yeniden eklenmemesi için yalnızca adınızı, ilinizi ve talep tarihinizi bir kaldırılanlar listesinde tutuyoruz. Kanunen saklamamız gereken kayıtlar varsa bunlar yasal süre sonunda silinir.</p>` +
        `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">İleride yeniden listelenmek isterseniz <a href="${SITE}/katil" style="color:#1A335E;">${SITE.replace(/^https?:\/\/(www\.)?/, '')}/katil</a> üzerinden profil oluşturabilirsiniz. Kişisel verilerinizin nasıl işlendiğini <a href="${SITE}${AYDINLATMA_YOL.profesyonel}" style="color:#1A335E;">Profesyoneller Aydınlatma Metni</a> sayfasında okuyabilirsiniz.</p>` +
        `<p style="font-size:13px;color:#6E6E73;margin-top:12px;">Saygılarımızla, Hekimhane Ekibi</p>`),
    });
    await sendEmail({
      to: ADMIN_EMAIL, subject: `Profil kaldırıldı — ${t.entity_name || t.entity_id}`,
      html: mailShell('Profil kaldırıldı', satir('Profil', t.entity_name) + satir('Tür', t.entity_type) + satir('İl', t.il) + satir('Talep eden', `${t.ad_soyad} — ${t.email}`) +
        `<p style="margin-top:12px;font-size:12px;color:#6E6E73;">Kayıt silindi; ad/il/tarih kaldırılanlar listesine yazıldı. İçe aktarma betikleri bu listeyi kontrol etmeli.</p>`),
    });
  } catch { /* sessiz */ }

  return { ok: true, profilAdi: t.entity_name || 'Profil' };
}
