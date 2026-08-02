import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

// Güçlü, okunabilir geçici şifre (harf + rakam, 12 karakter)
function genPassword(): string {
  const base = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return (base + 'Hk9').slice(0, 12);
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
}

const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  doktor:  'doktorlar',
  eczane:  'eczaneler',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum doğrula
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { claimId, action, notify } = await request.json();
    if (!claimId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. Talebi bul
    const { data: claim, error: fetchErr } = await admin
      .from('claim_requests')
      .select('*')
      .eq('id', claimId)
      .single();

    if (fetchErr || !claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 3. Talep durumunu güncelle
    const { error: updateErr } = await admin
      .from('claim_requests')
      .update({ status: newStatus })
      .eq('id', claimId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 4. Onaylandıysa → işletmeyi "claimed = true" yap
    if (action === 'approve' && claim.entity_id && claim.entity_id !== 'new') {
      const table = TABLE_MAP[claim.entity_type];
      if (table) {
        await admin.from(table).update({ claimed: true }).eq('id', claim.entity_id);
      }
    }

    // 5. Bildirim: admin "mail gönder" dediyse (notify) kullanıcıya mail at.
    //    Onayda hesap oluştur/varsa bildir; redde kısa bilgilendirme.
    let mail: { sent: boolean; accountCreated: boolean; tempPassword?: string } = { sent: false, accountCreated: false };
    const email = (claim.email || '').trim().toLowerCase();
    if (notify && email && email.includes('@')) {
      try {
        if (action === 'approve') {
          // Hesap oluşturmayı dene (varsa "already registered" döner)
          const password = genPassword();
          const { error: createErr } = await admin.auth.admin.createUser({
            email, password, email_confirm: true,
            user_metadata: { source: 'claim_approval', entity_name: claim.entity_name },
          });
          const alreadyExists = !!createErr && /already|registered|exists/i.test(createErr.message || '');
          const accountCreated = !createErr;

          const girisUrl = 'https://www.hekimhane.com.tr/giris';
          const ortak =
            `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${claim.claimant_name || ''}</strong>,</p>` +
            `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${claim.entity_name}</strong> için sahiplenme talebiniz <strong style="color:#059669;">onaylandı</strong> 🎉 Artık profilinizi panelden yönetebilirsiniz.</p>`;

          const html = accountCreated
            ? mailShell('İşletmeniz Onaylandı', ortak +
                `<p style="font-size:14px;color:#1c1c1e;margin-top:12px;">Panel giriş bilgileriniz:</p>` +
                satir('E-posta', email) + satir('Geçici Şifre', password) +
                `<p style="margin:16px 0;"><a href="${girisUrl}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:700;font-size:14px;">Panele Giriş Yap</a></p>` +
                `<p style="font-size:12px;color:#6E6E73;line-height:1.6;">Güvenliğiniz için ilk girişten sonra şifrenizi değiştirmenizi öneririz.</p>`)
            : mailShell('İşletmeniz Onaylandı', ortak +
                `<p style="font-size:14px;color:#1c1c1e;margin-top:12px;">Bu e-posta (<strong>${email}</strong>) ile zaten bir hesabınız var. Mevcut şifrenizle giriş yapabilirsiniz.</p>` +
                `<p style="margin:16px 0;"><a href="${girisUrl}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:700;font-size:14px;">Panele Giriş Yap</a></p>` +
                `<p style="font-size:12px;color:#6E6E73;">Şifrenizi hatırlamıyorsanız giriş sayfasından sıfırlayabilirsiniz.</p>`);

          await sendEmail({ to: email, subject: `İşletmeniz onaylandı — ${claim.entity_name}`, html });
          mail = { sent: true, accountCreated, ...(accountCreated ? { tempPassword: password } : {}) };
          if (alreadyExists) { /* hesap zaten vardı — sorun değil */ }
        } else {
          // Reddedildi bilgisi
          await sendEmail({
            to: email,
            subject: `Sahiplenme talebiniz hakkında — ${claim.entity_name}`,
            html: mailShell('Sahiplenme Talebiniz Değerlendirildi',
              `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${claim.claimant_name || ''}</strong>,</p>` +
              `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${claim.entity_name}</strong> için sahiplenme talebiniz şu an için onaylanamadı. Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`),
          });
          mail = { sent: true, accountCreated: false };
        }
      } catch (e) {
        console.error('claim-action mail error:', e);
      }
    }

    return NextResponse.json({ success: true, status: newStatus, mail });
  } catch (err) {
    console.error('claim-action error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
