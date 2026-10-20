import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getStripe, ENTITY_TABLE } from '@/lib/stripe';
import { faturalaVeGonder } from '@/lib/monetra';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

// entity premium bayrağını + abonelik kaydını güncelle
async function applyPremium(opts: {
  entity_type: string; entity_id: string; active: boolean;
  email?: string | null; customerId?: string | null; subId?: string | null;
  status?: string; periodEnd?: number | null;
}) {
  const { entity_type, entity_id, active } = opts;
  const table = ENTITY_TABLE[entity_type];
  if (!table || !entity_id) return;
  const admin = adminClient();

  // 1) Varlığın premium alanı
  await (admin as any).from(table).update({ premium: active }).eq('id', entity_id);

  // 2) Abonelik kaydı (tablo varsa)
  try {
    // NOT: `email` yalnız geldiğinde yazılır. Eskiden `opts.email ?? null` idi ve
    // her abonelik olayı (updated/deleted) kayıtlı abone e-postasını siliyordu —
    // sonra ne iptal bildirimi ne de portal fallback'i o adresi bulabiliyordu.
    await (admin as any).from('premium_subscriptions').upsert({
      entity_type, entity_id: String(entity_id),
      ...(opts.email ? { email: opts.email } : {}),
      stripe_customer_id: opts.customerId ?? null,
      stripe_subscription_id: opts.subId ?? null,
      status: opts.status ?? (active ? 'active' : 'inactive'),
      current_period_end: opts.periodEnd ? new Date(opts.periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'entity_type,entity_id' });
  } catch (e: any) {
    console.error('premium_subscriptions upsert:', e?.message || e);
  }
}

/** İşletmenin görünen adı — admin bildirim e-postalarında kullanılır. */
async function entityAdi(entity_type: string, entity_id: string): Promise<string> {
  const table = ENTITY_TABLE[entity_type];
  if (!table || !entity_id) return 'Bilinmeyen işletme';
  try {
    const { data } = await (adminClient() as any)
      .from(table).select('name,ad,soyad,unvan,il,ilce').eq('id', entity_id).maybeSingle();
    if (!data) return 'Bilinmeyen işletme';
    const ad = data.name || [data.unvan, data.ad, data.soyad].filter(Boolean).join(' ');
    const yer = [data.ilce, data.il].filter(Boolean).join(', ');
    return yer ? `${ad || 'İsimsiz'} (${yer})` : (ad || 'İsimsiz');
  } catch { return 'Bilinmeyen işletme'; }
}

/**
 * Admin'e abonelik hareketi bildirimi (Resend). Best-effort: mail gitmezse
 * webhook yine 200 döner — Stripe olayı asla bu yüzden tekrar denemesin.
 */
async function adminBildir(baslik: string, ozet: string, satirlar: [string, string][]) {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: baslik,
      html: mailShell(baslik, `
        <p style="margin:0 0 14px;font-size:14px;color:#1c1c1e;line-height:1.6;">${ozet}</p>
        <div style="background:#F6F8FB;border-radius:12px;padding:14px 16px;margin:0 0 14px;">
          ${satirlar.map(([e, d]) => satir(e, d)).join('')}
        </div>
        <p style="margin:0;font-size:12.5px;color:#9CA3AF;">Ayrıntı: admin panel → Premium Üyeler.</p>
      `),
    });
  } catch (e) {
    console.error('admin abonelik bildirimi:', e instanceof Error ? e.message : e);
  }
}

const trTarih = (t?: number | null) => t
  ? new Date(t * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—';

export async function POST(request: NextRequest) {
  // Virgülle ayrılmış birden çok secret desteklenir ("whsec_a,whsec_b") —
  // Stripe'ta hedef değiştirilirken/yenilenirken eski+yeni birlikte
  // tanımlanabilir, geçiş sırasında hiçbir olay kaybolmaz.
  const secrets = (process.env.STRIPE_WEBHOOK_SECRET || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const sig = request.headers.get('stripe-signature');
  if (!secrets.length || !sig) return NextResponse.json({ error: 'İmza yok' }, { status: 400 });

  const body = await request.text(); // ham gövde — imza doğrulaması için şart
  let event: Stripe.Event | null = null;
  let sonHata = '';
  for (const secret of secrets) {
    try { event = getStripe().webhooks.constructEvent(body, sig, secret); break; }
    catch (e: any) { sonHata = e?.message || String(e); }
  }
  if (!event) {
    console.error('webhook imza hatası:', sonHata);
    return NextResponse.json({ error: 'Geçersiz imza' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      let m: Record<string, string> = (s.metadata || {}) as any;

      // Payment Link akışında metadata olmaz; işletme kimliği
      // client_reference_id'de taşınır. İki biçim: 'tip:id' (API akışı)
      // ve 'tip__id' (Payment Link — ':' kabul etmediği için).
      if ((!m.entity_type || !m.entity_id) && s.client_reference_id) {
        const ref = s.client_reference_id;
        const ayrac = ref.includes(':') ? ':' : '__';
        const i = ref.indexOf(ayrac);
        if (i > 0) {
          m = { entity_type: ref.slice(0, i), entity_id: ref.slice(i + ayrac.length) };
        }
      }

      if (m.entity_type && m.entity_id) {
        const abonEmail = s.customer_email || (s as any).customer_details?.email || m.user_email || null;
        await applyPremium({
          entity_type: m.entity_type, entity_id: m.entity_id, active: true,
          email: abonEmail,
          customerId: typeof s.customer === 'string' ? s.customer : null,
          subId: typeof s.subscription === 'string' ? s.subscription : null,
          status: 'active',
        });
        const ad = await entityAdi(m.entity_type, m.entity_id);
        await adminBildir(
          `Yeni Pro üye — ${ad}`,
          `<strong>${ad}</strong> Hekimhane-Pro aboneliği başlattı.`,
          [['İşletme', ad], ['Tür', m.entity_type], ['Abone e-postası', abonEmail || '—'],
           ['Tutar', s.amount_total ? `${(s.amount_total / 100).toFixed(2)} ${String(s.currency || 'TRY').toUpperCase()}` : '—']],
        );
      }
    } else if (event.type === 'invoice.paid') {
      // Her başarılı abonelik tahsilatı (ilk ödeme + aylık yenilemeler) —
      // Monetra'da fatura kes ve müşteriye e-posta ile gönder. Best-effort:
      // faturalama hatası premium akışını asla bozmaz (webhook yine 200 döner).
      const inv = event.data.object as Stripe.Invoice;
      try {
        const subId = typeof (inv as any).subscription === 'string' ? (inv as any).subscription : (inv as any).subscription?.id;
        const email = inv.customer_email || (inv as any).customer_address?.email || null;

        // İşletme adını abonelik kaydımızdan çöz (fatura müşterisi = işletme).
        // Stripe olay sırası garanti etmez: invoice.paid, checkout.session.completed'dan
        // ÖNCE gelebilir ve abonelik kaydı henüz yazılmamış olur — kısa bekleyerek
        // birkaç kez denenir (ilk gerçek ödemede yaşandı: fatura kart sahibinin
        // adıyla kesildi).
        let musteriAd = inv.customer_name || email || 'Hekimhane-Pro Üyesi';
        if (subId) {
          let row: any = null;
          for (let deneme = 0; deneme < 4 && !row; deneme++) {
            if (deneme > 0) await new Promise(r => setTimeout(r, 2500));
            const { data } = await (adminClient() as any)
              .from('premium_subscriptions')
              .select('entity_type,entity_id')
              .eq('stripe_subscription_id', subId)
              .maybeSingle();
            row = data;
          }
          if (row) {
            const { data: ent } = await (adminClient() as any)
              .from(ENTITY_TABLE[row.entity_type]).select('name,ad,soyad').eq('id', row.entity_id).maybeSingle();
            const ad = ent?.name || [ent?.ad, ent?.soyad].filter(Boolean).join(' ');
            if (ad) musteriAd = ad;
          }
        }

        // Dönem metni: faturanın ilk kaleminin period aralığı
        const p = (inv.lines?.data?.[0] as any)?.period;
        const tr = (t: number) => new Date(t * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
        const donem = p?.start && p?.end ? `${tr(p.start)} – ${tr(p.end)}` : tr(inv.created);

        const sonuc = await faturalaVeGonder({
          musteriAd,
          musteriEmail: email,
          tutar: (inv.amount_paid || 0) / 100,
          paraBirimi: inv.currency || 'try',
          donem,
          stripeInvoiceId: inv.id,
        });
        if (!sonuc.ok && !sonuc.skipped) console.error('monetra fatura hatası:', sonuc.error);
        else if (sonuc.error) console.error('monetra uyarı:', sonuc.error);
      } catch (e: any) {
        console.error('invoice.paid işleme hatası:', e?.message || e);
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      let m: Record<string, string> = (sub.metadata || {}) as any;

      // Metadata düşmüşse (ör. abonelik Stripe panelinden elle oluşturulmuşsa)
      // ilgili işletmeyi kendi kaydımızdan bul — sessizce kaybolmasın.
      if (!m.entity_type || !m.entity_id) {
        const { data: row } = await (adminClient() as any)
          .from('premium_subscriptions')
          .select('entity_type,entity_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();
        if (row) m = { entity_type: row.entity_type, entity_id: String(row.entity_id) };
      }

      if (m.entity_type && m.entity_id) {
        // 'past_due' / 'unpaid' → ödeme alınamadı, premium kapanır.
        const active = ['active', 'trialing'].includes(sub.status);
        await applyPremium({
          entity_type: m.entity_type, entity_id: m.entity_id, active,
          customerId: typeof sub.customer === 'string' ? sub.customer : null,
          subId: sub.id, status: sub.status,
          periodEnd: (sub as any).current_period_end ?? null,
        });

        // ── Admin bildirimi ──
        // Müşteri portalından "iptal et" dediğinde Stripe abonelik durumunu
        // DEĞİŞTİRMEZ (hâlâ 'active'), yalnız cancel_at_period_end true olur.
        // Bu yüzden iptali `previous_attributes` ile geçişten yakalıyoruz;
        // yoksa iptal hiçbir bildirim üretmeden sessizce geçiyordu.
        const oncekiler = (event.data as any).previous_attributes || {};
        const iptalEdildi = event.type === 'customer.subscription.updated'
          && (sub as any).cancel_at_period_end === true
          && oncekiler.cancel_at_period_end === false;
        const iptalGeriAlindi = event.type === 'customer.subscription.updated'
          && (sub as any).cancel_at_period_end === false
          && oncekiler.cancel_at_period_end === true;
        const sonaErdi = event.type === 'customer.subscription.deleted';

        if (iptalEdildi || iptalGeriAlindi || sonaErdi) {
          const ad = await entityAdi(m.entity_type, m.entity_id);
          const { data: kayit } = await (adminClient() as any)
            .from('premium_subscriptions').select('email')
            .eq('entity_type', m.entity_type).eq('entity_id', String(m.entity_id)).maybeSingle();
          const abonEmail = kayit?.email || '—';
          const bitis = trTarih((sub as any).current_period_end);

          if (sonaErdi) {
            await adminBildir(
              `Pro üyelik sona erdi — ${ad}`,
              `<strong>${ad}</strong> işletmesinin Hekimhane-Pro aboneliği sona erdi. Pro özellikleri kapatıldı.`,
              [['İşletme', ad], ['Abone e-postası', abonEmail], ['Durum', 'Üyelik bitti'], ['Bitiş', bitis]],
            );
          } else if (iptalEdildi) {
            await adminBildir(
              `Abonelik iptal edildi — ${ad}`,
              `<strong>${ad}</strong> işletmesi Hekimhane-Pro aboneliğini iptal etti. Yeni ödeme alınmayacak; üyelik dönem sonuna kadar açık kalacak.`,
              [['İşletme', ad], ['Abone e-postası', abonEmail], ['Durum', 'Dönem sonunda bitecek'], ['Bitiş tarihi', bitis]],
            );
          } else {
            await adminBildir(
              `İptal geri alındı — ${ad}`,
              `<strong>${ad}</strong> işletmesi abonelik iptalini geri aldı; üyelik yenilenmeye devam edecek.`,
              [['İşletme', ad], ['Abone e-postası', abonEmail], ['Durum', 'Abonelik devam ediyor'], ['Sonraki yenileme', bitis]],
            );
          }
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('webhook işleme hatası:', e?.message || e);
    return NextResponse.json({ error: 'İşlenemedi' }, { status: 500 });
  }
}
