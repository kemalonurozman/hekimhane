import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getStripe, ENTITY_TABLE } from '@/lib/stripe';
import { sendEmail, mailShell, satir } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';

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
    { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } },
  );
}

/** İşletmenin görünen adı — bildirim e-postasında kullanılır. */
async function entityAdi(admin: any, entity_type: string, entity_id: string): Promise<string> {
  const table = ENTITY_TABLE[entity_type];
  if (!table) return 'İşletmeniz';
  try {
    const alan = entity_type === 'doktor' ? 'unvan,ad,soyad' : 'name';
    const { data } = await admin.from(table).select(alan).eq('id', entity_id).maybeSingle();
    if (!data) return 'İşletmeniz';
    return entity_type === 'doktor'
      ? [data.unvan, data.ad, data.soyad].filter(Boolean).join(' ')
      : (data.name || 'İşletmeniz');
  } catch { return 'İşletmeniz'; }
}

/** Aboneye ulaşılacak e-posta: önce abonelik kaydı, yoksa onaylı claim. */
async function aboneEpostasi(admin: any, sub: any, entity_type: string, entity_id: string): Promise<string | null> {
  if (sub?.email) return String(sub.email);
  try {
    const { data } = await admin.from('claim_requests')
      .select('email').eq('entity_type', entity_type).eq('entity_id', entity_id)
      .eq('status', 'approved').limit(1).maybeSingle();
    return data?.email || null;
  } catch { return null; }
}

/**
 * Admin abonelik işlemleri — Premium Üyeler sekmesinden kullanılır.
 *
 *  cancel_period_end : Stripe aboneliğini dönem sonunda bitirir (ödeme alınmaz,
 *                      üyelik ödenmiş dönem sonuna kadar açık kalır). Varsayılan.
 *  cancel_now        : Aboneliği anında iptal eder + premium bayrağını kapatır.
 *  resume            : Dönem-sonu iptalini geri alır.
 *  premium_off       : Stripe kaydı olmayan ELLE açılmış premium'u kapatır.
 *                      Aktif Stripe aboneliği varsa reddedilir — yoksa tahsilat
 *                      sürerken üyelik kapanmış olurdu.
 */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { entity_type, entity_id, action, notify } = await request.json();
    if (!entity_type || !entity_id || !action) {
      return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });
    }
    const table = ENTITY_TABLE[entity_type];
    if (!table) return NextResponse.json({ error: 'Geçersiz işletme türü.' }, { status: 400 });

    const admin = adminClient();
    const { data: sub } = await (admin as any)
      .from('premium_subscriptions')
      .select('stripe_subscription_id,stripe_customer_id,email,status')
      .eq('entity_type', entity_type).eq('entity_id', String(entity_id)).maybeSingle();

    const subId: string | null = sub?.stripe_subscription_id || null;
    let mesaj = '';
    let premiumKapandi = false;

    if (action === 'premium_off') {
      // Stripe tarafında hâlâ tahsilat varsa elle kapatmayı engelle.
      if (subId) {
        try {
          const s = await getStripe().subscriptions.retrieve(subId);
          if (['active', 'trialing', 'past_due', 'unpaid'].includes(s.status)) {
            return NextResponse.json({
              error: 'Bu işletmenin Stripe aboneliği hâlâ açık. Önce “Aboneliği iptal et” ile tahsilatı durdurun; '
                   + 'aksi halde üyelik kapanır ama kart çekilmeye devam eder.',
            }, { status: 409 });
          }
        } catch { /* Stripe'a ulaşılamadıysa elle kapatmaya izin ver */ }
      }
      await (admin as any).from(table).update({ premium: false }).eq('id', entity_id);
      try {
        await (admin as any).from('premium_subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('entity_type', entity_type).eq('entity_id', String(entity_id));
      } catch { /* kayıt yoksa geç */ }
      premiumKapandi = true;
      mesaj = 'Premium elle kapatıldı.';

    } else if (action === 'cancel_period_end' || action === 'cancel_now' || action === 'resume') {
      if (!subId) {
        return NextResponse.json({
          error: 'Bu işletmede Stripe aboneliği kayıtlı değil (elle açılmış premium). '
               + '“Premium’u kapat” seçeneğini kullanın.',
        }, { status: 404 });
      }
      const stripe = getStripe();

      if (action === 'cancel_now') {
        await stripe.subscriptions.cancel(subId);
        await (admin as any).from(table).update({ premium: false }).eq('id', entity_id);
        try {
          await (admin as any).from('premium_subscriptions')
            .update({ status: 'canceled', updated_at: new Date().toISOString() })
            .eq('entity_type', entity_type).eq('entity_id', String(entity_id));
        } catch { /* geç */ }
        premiumKapandi = true;
        mesaj = 'Abonelik anında iptal edildi, premium kapatıldı.';
      } else {
        const iptal = action === 'cancel_period_end';
        await stripe.subscriptions.update(subId, { cancel_at_period_end: iptal });
        mesaj = iptal
          ? 'Abonelik dönem sonunda bitecek şekilde iptal edildi. Yeni ödeme alınmayacak.'
          : 'Dönem sonu iptali geri alındı, abonelik devam ediyor.';
      }
    } else {
      return NextResponse.json({ error: 'Bilinmeyen işlem.' }, { status: 400 });
    }

    // ── Aboneye bilgilendirme (isteğe bağlı; RESEND yoksa sessizce atlanır) ──
    let mailDurumu = 'gönderilmedi';
    if (notify && action !== 'resume') {
      const to = await aboneEpostasi(admin, sub, entity_type, String(entity_id));
      if (to) {
        const ad = await entityAdi(admin, entity_type, String(entity_id));
        const hemen = action !== 'cancel_period_end';
        try {
          await sendEmail({
            to,
            subject: 'Hekimhane-Pro üyeliğiniz iptal edildi',
            replyTo: ADMIN_EMAIL,
            html: mailShell('Pro Üyeliğiniz İptal Edildi', `
              <p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">Merhaba,</p>
              <p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">
                <strong>${ad}</strong> için Hekimhane-Pro aboneliğiniz iptal edilmiştir.
                ${hemen
                  ? 'Üyelik hemen sonlandırıldı ve bundan sonra ödeme alınmayacaktır.'
                  : 'Ödemesi yapılmış dönemin sonuna kadar Pro özellikleriniz açık kalacak, sonrasında yeni ödeme alınmayacaktır.'}
              </p>
              <div style="background:#FBF8F2;border-radius:12px;padding:14px 16px;margin:14px 0;">
                ${satir('İşletme', ad)}
                ${satir('Durum', hemen ? 'Üyelik sonlandırıldı' : 'Dönem sonunda sonlanacak')}
              </div>
              <p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">
                İşletme profiliniz yayında kalmaya devam eder; yalnızca Pro özellikleri (web sitesi, sosyal medya bağlantıları,
                rezervasyon modülü) kapanır. Dilediğiniz an
                <a href="${SITE}/panel" style="color:#1B3A69;font-weight:600;">panelinizden</a> yeniden abone olabilirsiniz.
              </p>
              <p style="margin:0;font-size:13px;color:#6E6E73;line-height:1.6;">
                Bir yanlışlık olduğunu düşünüyorsanız bu e-postayı yanıtlamanız yeterli.
              </p>
            `),
          });
          mailDurumu = `gönderildi: ${to}`;
        } catch (e) {
          console.error('premium-action mail:', e instanceof Error ? e.message : e);
          mailDurumu = 'gönderilemedi';
        }
      } else {
        mailDurumu = 'e-posta adresi bulunamadı';
      }
    }

    return NextResponse.json({ success: true, mesaj, premiumKapandi, mail: mailDurumu });
  } catch (e: any) {
    const msg: string = e?.message || String(e);
    console.error('admin/premium-action error:', msg);
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json({ error: 'Stripe anahtarı tanımlı değil — Stripe işlemleri yapılamıyor.' }, { status: 500 });
    }
    if (/api key|authentication|invalid.*key/i.test(msg)) {
      return NextResponse.json({ error: 'Stripe anahtarı reddedildi. Vercel’deki STRIPE_SECRET_KEY değerini yenileyin.' }, { status: 500 });
    }
    if (/No such subscription|resource_missing/i.test(msg)) {
      return NextResponse.json({ error: 'Abonelik Stripe’ta bulunamadı (silinmiş olabilir). “Premium’u kapat” ile elle kapatabilirsiniz.' }, { status: 404 });
    }
    return NextResponse.json({ error: `İşlem başarısız: ${msg}` }, { status: 500 });
  }
}
