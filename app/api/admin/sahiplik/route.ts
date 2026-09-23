import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { sendEmail, mailShell } from '@/lib/email';
import { yoneticiMi, davetEden } from '@/lib/yonetici';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Admin → işletme listesinden e-postayla SAHİPLİK atama.
 * Sahiplik = claim_requests'te status='approved' satır (panelin her yerinde
 * yetki bu eşleşmeden okunur). Hesabı olmayan e-postaya, sahiplenme onayıyla
 * aynı akış uygulanır: auth kullanıcısı + account_activations token + şifre
 * belirleme daveti. Yalnız ADMIN_EMAIL erişir.
 */

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';
const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
const YOL: Record<string, string> = { klinik: '/klinikler', hastane: '/hastaneler', doktor: '/doktorlar', eczane: '/eczaneler' };

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}
async function adminMi(request: NextRequest): Promise<boolean> {
  return isAdminRequest(request);
}
const esc = (s: string) => String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c));

async function isletmeAdi(db: any, entityType: string, entityId: string): Promise<string | null> {
  const tbl = TABLO[entityType]; if (!tbl) return null;
  const { data } = await db.from(tbl).select('*').eq('id', entityId).maybeSingle();
  if (!data) return null;
  return entityType === 'doktor'
    ? [data.unvan, data.ad, data.soyad].filter(Boolean).join(' ').trim() || 'İşletme'
    : (data.name || 'İşletme');
}

/** Bir işletmenin erişim listesi: sahipler + yöneticiler. */
export async function GET(request: NextRequest) {
  if (!(await adminMi(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  const entityId = request.nextUrl.searchParams.get('entity_id');
  if (!entityId) return NextResponse.json({ error: 'entity_id gerekli' }, { status: 400 });

  const db = adminClient();
  const { data } = await (db as any).from('claim_requests')
    .select('id,email,claimant_name,role,status,created_at').eq('entity_id', entityId)
    .eq('status', 'approved').order('created_at', { ascending: true });

  return NextResponse.json({
    erisimler: ((data as any[]) || []).map(r => ({
      id: r.id, email: r.email, ad: r.claimant_name || null, created_at: r.created_at,
      tip: yoneticiMi(r.role) ? 'yonetici' : 'sahip',
      davet_eden: yoneticiMi(r.role) ? davetEden(r.role) : null,
    })),
  });
}

/** E-postaya sahiplik ata (+ hesabı yoksa şifre belirleme daveti). */
export async function POST(request: NextRequest) {
  if (!(await adminMi(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  const db = adminClient();
  const { entity_type, entity_id, email, ad, notify } = await request.json().catch(() => ({}));

  const tip = String(entity_type || '');
  const eid = String(entity_id || '').trim();
  const hedef = String(email || '').trim().toLowerCase();
  const isim = String(ad || '').replace(/[<>]/g, '').trim().slice(0, 120) || null;

  if (!TABLO[tip] || !eid) return NextResponse.json({ error: 'Geçersiz işletme.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(hedef)) return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });

  const isletme = await isletmeAdi(db, tip, eid);
  if (!isletme) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 });

  const { data: mevcut } = await (db as any).from('claim_requests')
    .select('id,email,role').eq('entity_id', eid).eq('status', 'approved');
  if (((mevcut as any[]) || []).some(c => String(c.email).toLowerCase() === hedef)) {
    return NextResponse.json({ error: 'Bu e-postanın bu işletmeye zaten erişimi var.' }, { status: 409 });
  }

  const { data: yeni, error: insErr } = await (db as any).from('claim_requests').insert({
    entity_id: eid, entity_type: tip, entity_name: isletme,
    email: hedef, claimant_name: isim, phone: '-',
    role: `[admin] Sahiplik atandı: ${ADMIN_EMAIL}`, status: 'approved',
  }).select('id').single();
  if (insErr || !yeni) {
    console.error('sahiplik insert:', insErr?.message);
    return NextResponse.json({ error: 'Sahiplik atanamadı.' }, { status: 500 });
  }

  // İşletmeyi sahiplenilmiş yap (claim onayıyla aynı davranış)
  try { await (db as any).from(TABLO[tip]).update({ claimed: true }).eq('id', eid); } catch { /* kolon yoksa geç */ }
  if (tip === 'doktor') { try { await (db as any).from('doktorlar').update({ contact_hidden: false }).eq('id', eid); } catch { /* geç */ } }

  // Hesap + davet: createUser başarılıysa hesap YOKTU → şifre belirleme bağlantısı
  let yeniHesap = false, mailGitti = false;
  if (notify !== false) {
    try {
      const { data: created } = await db.auth.admin.createUser({
        email: hedef, password: randomBytes(24).toString('base64url'), email_confirm: true,
        user_metadata: { source: 'admin_sahiplik', entity_name: isletme },
      });
      if (created?.user) {
        yeniHesap = true;
        const { data: tok } = await (db as any).from('account_activations')
          .insert({ email: hedef, user_id: created.user.id, entity_name: isletme }).select('token').single();
        const link = `${SITE}/hesap-aktivasyon?token=${tok?.token}`;
        const r = await sendEmail({
          to: hedef, replyTo: ADMIN_EMAIL,
          subject: `${isletme} — Hekimhane işletme hesabınız hazır`,
          html: mailShell('İşletmeniz hesabınıza tanımlandı', `
            <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(isletme)}</strong> profilinin yönetimi Hekimhane tarafından bu e-posta adresine tanımlandı.</p>
            <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Randevu taleplerini, takvimi, hastaları, yorumları ve profil bilgilerinizi yönetmek için hesabınızı oluşturun: e-postanız hazır gelir, yalnızca şifrenizi belirlersiniz.</p>
            <p style="margin:18px 0;"><a href="${link}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Hesabımı Oluştur ve Panele Gir</a></p>
            <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Bu bağlantı size özeldir ve 7 gün geçerlidir. Beklemiyorsanız bu e-postayı yanıtlayarak bize bildirin.</p>`),
        });
        mailGitti = r.ok;
      } else {
        const r = await sendEmail({
          to: hedef, replyTo: ADMIN_EMAIL,
          subject: `${isletme} — işletme yönetimi hesabınıza tanımlandı`,
          html: mailShell('İşletmeniz hesabınıza tanımlandı', `
            <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(isletme)}</strong> profilinin yönetimi Hekimhane hesabınıza tanımlandı.</p>
            <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Panelinizde görünüyor; randevu, takvim, hasta ve profil işlemlerini oradan yapabilirsiniz.</p>
            <p style="margin:18px 0;"><a href="${SITE}/giris?redirect=/panel" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Panele Git</a></p>
            <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Şifrenizi hatırlamıyorsanız giriş sayfasındaki "Şifremi unuttum" bağlantısını kullanın.</p>`),
        });
        mailGitti = r.ok;
      }
    } catch (e: any) { console.error('sahiplik davet:', e?.message); }
  }

  try { revalidatePath(YOL[tip] || '/', 'layout'); revalidatePath('/', 'layout'); } catch { /* geç */ }
  return NextResponse.json({ ok: true, id: yeni.id, isletme, yeniHesap, mailGitti });
}

/** Erişimi kaldır (sahip veya yönetici). Son sahip kalkarsa işletme sahiplenilmemişe döner. */
export async function DELETE(request: NextRequest) {
  if (!(await adminMi(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  const db = adminClient();
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Kayıt belirtilmedi.' }, { status: 400 });

  const { data: kayit } = await (db as any).from('claim_requests')
    .select('id,entity_id,entity_type,role').eq('id', String(id)).maybeSingle();
  if (!kayit) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });

  const { error } = await (db as any).from('claim_requests').delete().eq('id', kayit.id);
  if (error) return NextResponse.json({ error: 'Kaldırılamadı.' }, { status: 500 });

  // Başka sahip kalmadıysa profil "sahiplenilmemiş" olur. premium'a DOKUNULMAZ:
  // Stripe aboneliği sürüyor olabilir — kapatma admin Premium sekmesinden yapılır.
  let sahipsiz = false;
  const { data: kalan } = await (db as any).from('claim_requests')
    .select('role').eq('entity_id', kayit.entity_id).eq('status', 'approved');
  if (!((kalan as any[]) || []).some(r => !yoneticiMi(r.role))) {
    sahipsiz = true;
    try { await (db as any).from(TABLO[kayit.entity_type]).update({ claimed: false }).eq('id', kayit.entity_id); } catch { /* geç */ }
  }
  try { revalidatePath(YOL[kayit.entity_type] || '/', 'layout'); revalidatePath('/', 'layout'); } catch { /* geç */ }
  return NextResponse.json({ ok: true, sahipsiz });
}
