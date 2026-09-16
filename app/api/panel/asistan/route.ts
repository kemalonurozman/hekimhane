import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { panelOturum } from '@/lib/panel-oturum';
import { sendEmail, mailShell } from '@/lib/email';
import {
  ASISTAN_DURUM, ASISTAN_YETKILERI, MAKS_ASISTAN,
  asistanRolu, asistanYetkileri, asistanDavetEden, yetkileriDuzenle,
} from '@/lib/asistan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = 'https://www.hekimhane.com.tr';

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}
const esc = (s: string) => String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c));

// Kullanıcı başına saatte 20 davet — toplu spam'e karşı
const davetSayac = new Map<string, number[]>();
function davetLimiti(k: string): boolean {
  const now = Date.now();
  const g = (davetSayac.get(k) || []).filter(t => now - t < 3_600_000);
  if (g.length >= 20) return true;
  g.push(now); davetSayac.set(k, g); return false;
}

/** Çağıranın bu işletmede TAM erişimi (sahip ya da yönetici, status='approved') var mı? */
async function tamErisimKaydi(db: any, email: string, entityId: string) {
  const { data } = await db.from('claim_requests')
    .select('id,entity_type,entity_name').eq('entity_id', entityId).eq('email', email).eq('status', 'approved').limit(1);
  return ((data as any[]) || [])[0] || null;
}

function yetkiMetni(yetkiler: string[]): string {
  const ad = ASISTAN_YETKILERI.filter(y => yetkiler.includes(y.key)).map(y => y.baslik);
  return ad.length ? ad.join(', ') : '—';
}

/**
 * GET — Asistan tablosu:
 *  - yonetilen: tam erişimli işletmeler + her birinin asistanları (yetki + durum)
 *  - asistanOlunan: kullanıcının asistan olarak eklendiği işletmeler (yetkileriyle)
 */
export async function GET(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const email = oturum.user.email;

  const { data: benim } = await (db as any).from('claim_requests')
    .select('id,entity_id,entity_type,entity_name,role,status').eq('email', email)
    .in('status', ['approved', ASISTAN_DURUM]).not('entity_id', 'is', null).neq('entity_id', 'new');
  const satirlar = (benim as any[]) || [];
  const tam = satirlar.filter(c => c.status === 'approved');
  const tamIds = Array.from(new Set(tam.map(c => String(c.entity_id))));

  let asistanlar: any[] = [];
  if (tamIds.length) {
    const { data } = await (db as any).from('claim_requests')
      .select('id,entity_id,email,claimant_name,role,created_at').in('entity_id', tamIds).eq('status', ASISTAN_DURUM);
    asistanlar = (data as any[]) || [];
  }

  // "Davet bekliyor": bu asistan kaydından SONRA açılmış, kullanılmamış aktivasyon + hiç giriş yok
  const bekleyen = new Set<string>();
  const epostalar = Array.from(new Set(asistanlar.map(a => String(a.email).toLowerCase())));
  if (epostalar.length) {
    const { data: akt } = await (db as any).from('account_activations')
      .select('email,user_id,used_at,created_at').in('email', epostalar);
    const aktList = (akt as any[]) || [];
    const girisYapti = new Map<string, boolean>();
    for (const a of asistanlar) {
      const e = String(a.email).toLowerCase();
      const eklenme = Date.parse(a.created_at) - 60_000;
      const davet = aktList.filter(x => String(x.email).toLowerCase() === e && Date.parse(x.created_at) >= eklenme);
      if (!davet.length || davet.some(x => x.used_at)) continue;
      const uid = davet.find(x => x.user_id)?.user_id;
      if (uid && !girisYapti.has(uid)) {
        const { data } = await db.auth.admin.getUserById(uid);
        girisYapti.set(uid, !!data?.user?.last_sign_in_at);
      }
      if (!uid || !girisYapti.get(uid)) bekleyen.add(String(a.id));
    }
  }

  const tekil = new Map<string, any>();
  for (const c of tam) if (!tekil.has(String(c.entity_id))) tekil.set(String(c.entity_id), c);

  return NextResponse.json({
    yonetilen: Array.from(tekil.values()).map(c => ({
      entity_id: c.entity_id, entity_type: c.entity_type, entity_name: c.entity_name,
      asistanlar: asistanlar.filter(a => String(a.entity_id) === String(c.entity_id)).map(a => ({
        id: a.id, email: a.email, ad: a.claimant_name || null, eklenme: a.created_at,
        yetkiler: asistanYetkileri(a.role),
        durum: bekleyen.has(String(a.id)) ? 'davet_bekliyor' : 'aktif',
      })),
    })),
    asistanOlunan: satirlar
      .filter(c => c.status === ASISTAN_DURUM && !tamIds.includes(String(c.entity_id)))
      .map(c => ({
        claim_id: c.id, entity_id: c.entity_id, entity_type: c.entity_type, entity_name: c.entity_name,
        yetkiler: asistanYetkileri(c.role), davet_eden: asistanDavetEden(c.role),
      })),
    maks: MAKS_ASISTAN,
  });
}

/** POST — Asistan ekle. İşletmede tam erişimi (sahip/yönetici) olan herkes ekleyebilir. */
export async function POST(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const ekleyen = oturum.user.email;

  const body = await request.json().catch(() => ({}));
  const entityId = String(body.entity_id || '').trim();
  const hedef = String(body.email || '').trim().toLowerCase();
  const ad = String(body.ad || '').replace(/[<>]/g, '').trim().slice(0, 80) || null;
  const yetkiler = yetkileriDuzenle(body.yetkiler);

  if (!entityId) return NextResponse.json({ error: 'İşletme seçilmedi.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(hedef)) return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  if (hedef === ekleyen.toLowerCase()) return NextResponse.json({ error: 'Kendinizi asistan olarak ekleyemezsiniz.' }, { status: 400 });
  if (!yetkiler.length) return NextResponse.json({ error: 'En az bir yetki seçin.' }, { status: 400 });

  const kayit = await tamErisimKaydi(db, ekleyen, entityId);
  if (!kayit) return NextResponse.json({ error: 'Bu işletmeye asistan ekleme yetkiniz yok.' }, { status: 403 });

  const { data: mevcut } = await (db as any).from('claim_requests')
    .select('id,email,status').eq('entity_id', entityId).in('status', ['approved', ASISTAN_DURUM]);
  const liste = (mevcut as any[]) || [];
  const ayni = liste.find(c => String(c.email).toLowerCase() === hedef);
  if (ayni) {
    return NextResponse.json({
      error: ayni.status === 'approved'
        ? 'Bu kişinin işletmede zaten tam erişimi (sahip/yönetici) var.'
        : 'Bu kişi zaten asistan — yetkilerini listeden düzenleyebilirsiniz.',
    }, { status: 409 });
  }
  if (liste.filter(c => c.status === ASISTAN_DURUM).length >= MAKS_ASISTAN) {
    return NextResponse.json({ error: `Bir işletmeye en fazla ${MAKS_ASISTAN} asistan eklenebilir.` }, { status: 400 });
  }
  if (davetLimiti(ekleyen)) return NextResponse.json({ error: 'Kısa sürede çok fazla davet gönderildi. Biraz sonra tekrar deneyin.' }, { status: 429 });

  const { data: yeni, error: insErr } = await (db as any).from('claim_requests').insert({
    entity_id: entityId, entity_type: kayit.entity_type, entity_name: kayit.entity_name,
    email: hedef, claimant_name: ad, phone: '-', role: asistanRolu(ekleyen, yetkiler), status: ASISTAN_DURUM,
  }).select('id,created_at').single();
  if (insErr || !yeni) {
    console.error('asistan insert:', insErr?.message);
    return NextResponse.json({ error: 'Asistan eklenemedi.' }, { status: 500 });
  }

  const isletme = esc(kayit.entity_name || 'işletme');
  const yetkiListesi = `<ul style="margin:8px 0 0;padding-left:18px;font-size:13.5px;color:#1c1c1e;line-height:1.7;">${
    ASISTAN_YETKILERI.filter(y => yetkiler.includes(y.key)).map(y => `<li><strong>${esc(y.baslik)}</strong> — ${esc(y.aciklama)}</li>`).join('')
  }</ul>`;

  let yeniHesap = false;
  let mailGitti = false;
  try {
    const { data: created } = await db.auth.admin.createUser({
      email: hedef, password: randomBytes(24).toString('base64url'), email_confirm: true,
      user_metadata: { source: 'asistan_daveti', entity_name: kayit.entity_name },
    });
    if (created?.user) {
      yeniHesap = true;
      const { data: tok } = await (db as any).from('account_activations')
        .insert({ email: hedef, user_id: created.user.id, entity_name: kayit.entity_name })
        .select('token').single();
      const link = `${SITE}/hesap-aktivasyon?token=${tok?.token}`;
      const r = await sendEmail({
        to: hedef, replyTo: ekleyen,
        subject: `${kayit.entity_name} — Hekimhane'de asistan olarak davet edildiniz`,
        html: mailShell('Asistan daveti', `
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(ekleyen)}</strong> sizi Hekimhane'de <strong>${isletme}</strong> işletmesine asistan olarak ekledi.</p>
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin-bottom:0;">Erişebileceğiniz alanlar:</p>${yetkiListesi}
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Başlamak için hesabınızı oluşturun: e-postanız hazır gelir, yalnızca şifrenizi belirlersiniz.</p>
          <p style="margin:18px 0;"><a href="${link}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Hesabımı Oluştur ve Panele Gir</a></p>
          <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Bu bağlantı size özeldir ve 7 gün geçerlidir. Bu daveti beklemiyorsanız e-postayı yok sayabilirsiniz.</p>`),
      });
      mailGitti = r.ok;
    }
  } catch (e: any) { console.error('asistan davet (yeni hesap):', e?.message); }

  if (!yeniHesap) {
    const r = await sendEmail({
      to: hedef, replyTo: ekleyen,
      subject: `${kayit.entity_name} — asistan olarak eklendiniz`,
      html: mailShell('Asistan olarak eklendiniz', `
        <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(ekleyen)}</strong> sizi Hekimhane'de <strong>${isletme}</strong> işletmesine asistan olarak ekledi.</p>
        <p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin-bottom:0;">Erişebileceğiniz alanlar:</p>${yetkiListesi}
        <p style="margin:18px 0;"><a href="${SITE}/giris?tip=isletme&redirect=/panel" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Panele Git</a></p>
        <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Şifrenizi hatırlamıyorsanız giriş sayfasındaki "Şifremi unuttum" bağlantısını kullanın.</p>`),
    });
    mailGitti = r.ok;
  }

  return NextResponse.json({ ok: true, id: yeni.id, yeniHesap, mailGitti, durum: yeniHesap ? 'davet_bekliyor' : 'aktif', yetkiler });
}

/** PATCH — Asistanın yetkilerini değiştir (tam erişimli kişi). */
export async function PATCH(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || '');
  const yetkiler = yetkileriDuzenle(body.yetkiler);
  if (!id) return NextResponse.json({ error: 'Kayıt belirtilmedi.' }, { status: 400 });
  if (!yetkiler.length) return NextResponse.json({ error: 'En az bir yetki seçili olmalı. Erişimi tamamen kaldırmak için "Kaldır"ı kullanın.' }, { status: 400 });

  const { data: kayit } = await (db as any).from('claim_requests')
    .select('id,entity_id,email,status,role').eq('id', id).maybeSingle();
  if (!kayit || kayit.status !== ASISTAN_DURUM) return NextResponse.json({ error: 'Asistan kaydı bulunamadı.' }, { status: 404 });
  if (!(await tamErisimKaydi(db, oturum.user.email, String(kayit.entity_id)))) {
    return NextResponse.json({ error: 'Bu asistanın yetkilerini değiştirme yetkiniz yok.' }, { status: 403 });
  }

  // Daveti yapan kişi bilgisi korunur; değiştiren farklıysa o yazılır
  const davetci = asistanDavetEden(kayit.role) || oturum.user.email;
  const { error } = await (db as any).from('claim_requests').update({ role: asistanRolu(davetci, yetkiler) }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Yetkiler güncellenemedi.' }, { status: 500 });
  return NextResponse.json({ ok: true, yetkiler, ozet: yetkiMetni(yetkiler) });
}

/** DELETE — Asistanı kaldır (tam erişimli kişi) ya da asistanın kendisi ayrılır. */
export async function DELETE(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Kayıt belirtilmedi.' }, { status: 400 });

  const { data: kayit } = await (db as any).from('claim_requests')
    .select('id,entity_id,email,status').eq('id', String(id)).maybeSingle();
  if (!kayit || kayit.status !== ASISTAN_DURUM) return NextResponse.json({ error: 'Asistan kaydı bulunamadı.' }, { status: 404 });

  const kendisi = String(kayit.email).toLowerCase() === oturum.user.email.toLowerCase();
  if (!kendisi && !(await tamErisimKaydi(db, oturum.user.email, String(kayit.entity_id)))) {
    return NextResponse.json({ error: 'Bu asistanı kaldırma yetkiniz yok.' }, { status: 403 });
  }

  const { error } = await (db as any).from('claim_requests').delete().eq('id', kayit.id);
  if (error) return NextResponse.json({ error: 'Kaldırılamadı.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
