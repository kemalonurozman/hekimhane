import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { panelOturum } from '@/lib/panel-oturum';
import { sendEmail, mailShell } from '@/lib/email';
import { yoneticiMi, yoneticiRolu, davetEden } from '@/lib/yonetici';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = 'https://www.hekimhane.com.tr';
const MAKS_YONETICI = 10;

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}
const esc = (s: string) => String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c));

// Sahip başına saatte 20 davet — toplu spam'e karşı
const davetSayac = new Map<string, number[]>();
function davetLimiti(k: string): boolean {
  const now = Date.now();
  const g = (davetSayac.get(k) || []).filter(t => now - t < 3_600_000);
  if (g.length >= 20) return true;
  g.push(now); davetSayac.set(k, g); return false;
}

/**
 * Hesabın erişim tablosu:
 *  - sahip olunan işletmeler + her birinin yöneticileri (durumlarıyla)
 *  - yönetici olarak eklenilen işletmeler (daveti yapanla)
 */
export async function GET(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const email = oturum.user.email;

  const { data: benim } = await (db as any).from('claim_requests')
    .select('id,entity_id,entity_type,entity_name,role').eq('email', email).eq('status', 'approved')
    .not('entity_id', 'is', null).neq('entity_id', 'new');
  const satirlar = (benim as any[]) || [];
  const sahipOlunan = satirlar.filter(c => !yoneticiMi(c.role));
  const yoneticiOlunan = satirlar.filter(c => yoneticiMi(c.role) && !sahipOlunan.some(s => s.entity_id === c.entity_id));

  const ids = Array.from(new Set(sahipOlunan.map(c => String(c.entity_id))));
  let yoneticiler: any[] = [];
  if (ids.length) {
    const { data } = await (db as any).from('claim_requests')
      .select('id,entity_id,email,claimant_name,role,created_at').in('entity_id', ids).eq('status', 'approved');
    yoneticiler = ((data as any[]) || []).filter(r => yoneticiMi(r.role));
  }

  // Durum: "davet bekliyor" = bu yönetici daveti için hesap AÇILDI ama kişi hiç giriş yapmadı.
  // Yalnız davetle (yönetici kaydından sonra) oluşturulan aktivasyonlar sayılır — eski bir
  // sahiplenme onayından kalmış kullanılmamış bağlantı, hesabı olan kişiyi "bekliyor" göstermesin.
  const bekleyen = new Set<string>();   // claim id
  const epostalar = Array.from(new Set(yoneticiler.map(y => String(y.email).toLowerCase())));
  if (epostalar.length) {
    const { data: akt } = await (db as any).from('account_activations')
      .select('email,user_id,used_at,created_at').in('email', epostalar);
    const aktList = (akt as any[]) || [];
    const girisYapti = new Map<string, boolean>();
    for (const y of yoneticiler) {
      const e = String(y.email).toLowerCase();
      const eklenme = Date.parse(y.created_at) - 60_000;
      const davet = aktList.filter(a => String(a.email).toLowerCase() === e && Date.parse(a.created_at) >= eklenme);
      if (!davet.length || davet.some(a => a.used_at)) continue;          // hesabı zaten vardı / bağlantıyı kullandı
      const uid = davet.find(a => a.user_id)?.user_id;
      if (uid && !girisYapti.has(uid)) {
        const { data } = await db.auth.admin.getUserById(uid);
        girisYapti.set(uid, !!data?.user?.last_sign_in_at);
      }
      if (!uid || !girisYapti.get(uid)) bekleyen.add(String(y.id));
    }
  }

  return NextResponse.json({
    sahipOlunan: sahipOlunan.map(c => ({
      entity_id: c.entity_id, entity_type: c.entity_type, entity_name: c.entity_name,
      yoneticiler: yoneticiler.filter(y => String(y.entity_id) === String(c.entity_id)).map(y => ({
        id: y.id, email: y.email, ad: y.claimant_name || null, eklenme: y.created_at,
        durum: bekleyen.has(String(y.id)) ? 'davet_bekliyor' : 'aktif',
      })),
    })),
    yoneticiOlunan: yoneticiOlunan.map(c => ({ claim_id: c.id, entity_id: c.entity_id, entity_name: c.entity_name, davet_eden: davetEden(c.role) })),
    maks: MAKS_YONETICI,
  });
}

/** Yönetici ekle — yalnız işletme sahibi. Hesabı yoksa aktivasyon (hesap oluşturma) daveti gider. */
export async function POST(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const sahip = oturum.user.email;

  const body = await request.json().catch(() => ({}));
  const entityId = String(body.entity_id || '').trim();
  const hedef = String(body.email || '').trim().toLowerCase();
  const ad = String(body.ad || '').replace(/[<>]/g, '').trim().slice(0, 80) || null;

  if (!entityId) return NextResponse.json({ error: 'İşletme seçilmedi.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(hedef)) return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  if (hedef === sahip.toLowerCase()) return NextResponse.json({ error: 'Kendinizi yönetici olarak ekleyemezsiniz; zaten işletmenin sahibisiniz.' }, { status: 400 });

  // Yetki: çağıran bu işletmenin SAHİBİ olmalı (yönetici başka yönetici ekleyemez)
  const { data: erisim } = await (db as any).from('claim_requests')
    .select('id,email,role,entity_type,entity_name').eq('entity_id', entityId).eq('status', 'approved');
  const liste = (erisim as any[]) || [];
  const sahipKaydi = liste.find(c => String(c.email).toLowerCase() === sahip.toLowerCase() && !yoneticiMi(c.role));
  if (!sahipKaydi) return NextResponse.json({ error: 'Yalnızca işletme sahibi yönetici ekleyebilir.' }, { status: 403 });

  if (liste.some(c => String(c.email).toLowerCase() === hedef)) {
    return NextResponse.json({ error: 'Bu e-posta adresinin bu işletmeye zaten erişimi var.' }, { status: 409 });
  }
  if (liste.filter(c => yoneticiMi(c.role)).length >= MAKS_YONETICI) {
    return NextResponse.json({ error: `Bir işletmeye en fazla ${MAKS_YONETICI} yönetici eklenebilir.` }, { status: 400 });
  }
  if (davetLimiti(sahip)) return NextResponse.json({ error: 'Kısa sürede çok fazla davet gönderildi. Biraz sonra tekrar deneyin.' }, { status: 429 });

  const { data: yeni, error: insErr } = await (db as any).from('claim_requests').insert({
    entity_id: entityId, entity_type: sahipKaydi.entity_type, entity_name: sahipKaydi.entity_name,
    email: hedef, claimant_name: ad, phone: '-', role: yoneticiRolu(sahip), status: 'approved',
  }).select('id,created_at').single();
  if (insErr || !yeni) {
    console.error('yonetici insert:', insErr?.message);
    return NextResponse.json({ error: 'Yönetici eklenemedi.' }, { status: 500 });
  }

  // Hesap var mı? createUser başarılıysa hesap YOKTU → davet (hesap oluşturma) bağlantısı
  const isletme = esc(sahipKaydi.entity_name || 'işletme');
  let yeniHesap = false;
  let mailGitti = false;
  try {
    const { data: created } = await db.auth.admin.createUser({
      email: hedef, password: randomBytes(24).toString('base64url'), email_confirm: true,
      user_metadata: { source: 'yonetici_daveti', entity_name: sahipKaydi.entity_name },
    });
    if (created?.user) {
      yeniHesap = true;
      const { data: tok } = await (db as any).from('account_activations')
        .insert({ email: hedef, user_id: created.user.id, entity_name: sahipKaydi.entity_name })
        .select('token').single();
      const link = `${SITE}/hesap-aktivasyon?token=${tok?.token}`;
      const r = await sendEmail({
        to: hedef, replyTo: sahip,
        subject: `${sahipKaydi.entity_name} — Hekimhane'de yönetici olarak davet edildiniz`,
        html: mailShell('İşletme yöneticiliği daveti', `
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(sahip)}</strong> sizi Hekimhane'de <strong>${isletme}</strong> işletmesinin yöneticisi olarak ekledi.</p>
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Yönetici olarak randevu taleplerini, takvimi, hastaları, yorumları ve işletme profilini yönetebilirsiniz. Başlamak için hesabınızı oluşturun: e-postanız hazır gelir, yalnızca şifrenizi belirlersiniz.</p>
          <p style="margin:18px 0;"><a href="${link}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Hesabımı Oluştur ve Panele Gir</a></p>
          <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Bu bağlantı size özeldir ve 7 gün geçerlidir. Bu daveti beklemiyorsanız e-postayı yok sayabilirsiniz; sorularınızı bu e-postayı yanıtlayarak davet edene iletebilirsiniz.</p>`),
      });
      mailGitti = r.ok;
    }
  } catch (e: any) { console.error('yonetici davet (yeni hesap):', e?.message); }

  if (!yeniHesap) {
    // Hesabı zaten var → bilgilendirme; işletme panelinde hemen görünür
    const r = await sendEmail({
      to: hedef, replyTo: sahip,
      subject: `${sahipKaydi.entity_name} — yönetici olarak eklendiniz`,
      html: mailShell('Yönetici olarak eklendiniz', `
        <p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(sahip)}</strong> sizi Hekimhane'de <strong>${isletme}</strong> işletmesinin yöneticisi olarak ekledi.</p>
        <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">İşletme panelinizde artık görünüyor. Birden çok işletmeniz varsa sol menüdeki <strong>Aktif İşletme</strong> seçiminden geçebilirsiniz.</p>
        <p style="margin:18px 0;"><a href="${SITE}/giris?redirect=/panel" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Panele Git</a></p>
        <p style="font-size:12px;color:#6E6E73;line-height:1.6;">Şifrenizi hatırlamıyorsanız giriş sayfasındaki "Şifremi unuttum" bağlantısını kullanın.</p>`),
    });
    mailGitti = r.ok;
  }

  return NextResponse.json({
    ok: true, id: yeni.id, yeniHesap, mailGitti,
    durum: yeniHesap ? 'davet_bekliyor' : 'aktif',
  });
}

/** Yöneticiyi kaldır — yalnız işletme sahibi. Yalnız yönetici kaydı silinir. */
export async function DELETE(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const db = admin();
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Kayıt belirtilmedi.' }, { status: 400 });

  const { data: kayit } = await (db as any).from('claim_requests').select('id,entity_id,email,role').eq('id', String(id)).maybeSingle();
  if (!kayit || !yoneticiMi(kayit.role)) return NextResponse.json({ error: 'Yönetici kaydı bulunamadı.' }, { status: 404 });

  const { data: sahipler } = await (db as any).from('claim_requests')
    .select('role').eq('entity_id', kayit.entity_id).eq('email', oturum.user.email).eq('status', 'approved');
  if (!((sahipler as any[]) || []).some(r => !yoneticiMi(r.role))) {
    return NextResponse.json({ error: 'Yalnızca işletme sahibi yönetici kaldırabilir.' }, { status: 403 });
  }

  const { error } = await (db as any).from('claim_requests').delete().eq('id', kayit.id);
  if (error) return NextResponse.json({ error: 'Kaldırılamadı.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
