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
        // Doktor sahiplenince gizli iletişimi (Bobath vb.) otomatik aç — best-effort
        if (claim.entity_type === 'doktor') {
          try { await admin.from(table).update({ contact_hidden: false }).eq('id', claim.entity_id); }
          catch { /* contact_hidden kolonu yoksa sessizce geç */ }
        }
      }
    }

    // 5. Bildirim: admin "mail gönder" dediyse (notify) kullanıcıya mail at.
    //    Onayda hesap oluştur/varsa bildir; redde kısa bilgilendirme.
    let mail: { sent: boolean; accountCreated: boolean; tempPassword?: string } = { sent: false, accountCreated: false };
    const email = (claim.email || '').trim().toLowerCase();
    if (notify && email && email.includes('@')) {
      try {
        if (action === 'approve') {
          // 1) Auth kullanıcısını garanti et + user_id al (yeni ya da mevcut)
          let userId: string | null = null;
          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email, password: genPassword(), email_confirm: true,
            user_metadata: { source: 'claim_approval', entity_name: claim.entity_name },
          });
          if (created?.user) userId = created.user.id;
          if (!userId) {
            // Zaten var → user_id'yi generateLink ile al (mail göndermez, sadece user döner)
            try {
              const { data: gl } = await admin.auth.admin.generateLink({ type: 'recovery', email } as any);
              userId = (gl as any)?.user?.id ?? null;
            } catch { /* geç */ }
          }

          // 2) Hesaba özel aktivasyon token'ı üret + sakla
          const token = crypto.randomUUID();
          await (admin as any).from('account_activations').insert({
            token, email, user_id: userId, entity_name: claim.entity_name,
          });

          // 3) Aktivasyon linkli (e-posta gömülü, şifre belirleme) markalı mail
          const aktivUrl = `https://www.hekimhane.com.tr/hesap-aktivasyon?token=${token}`;
          const html = mailShell('İşletmeniz Onaylandı',
            `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${claim.claimant_name || ''}</strong>,</p>` +
            `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${claim.entity_name}</strong> için sahiplenme talebiniz <strong style="color:#059669;">onaylandı</strong> 🎉</p>` +
            `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Hesabınızı etkinleştirip <strong>şifrenizi belirlemek</strong> için butona tıklayın. E-postanız (<strong>${email}</strong>) otomatik dolu gelir; yeni şifrenizi <strong>iki kez</strong> girip doğrudan panele giriş yaparsınız.</p>` +
            `<p style="margin:18px 0;"><a href="${aktivUrl}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">Hesabımı Etkinleştir &amp; Şifre Belirle</a></p>` +
            `<p style="font-size:12px;color:#6E6E73;line-height:1.6;">Bu bağlantı yalnızca size özeldir ve 7 gün geçerlidir. Buton çalışmazsa şu adresi tarayıcıya yapıştırın:<br><span style="color:#1B3A69;word-break:break-all;">${aktivUrl}</span></p>`);

          await sendEmail({ to: email, subject: `İşletmeniz onaylandı — ${claim.entity_name}`, html });
          mail = { sent: true, accountCreated: !!created?.user };
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
