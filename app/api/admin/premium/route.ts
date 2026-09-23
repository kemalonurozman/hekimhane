import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

// Her istekte taze — premium üye listesi cache'lenmesin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const admin = adminClient();

    // Her varlık türünde premium=true olanları çek
    const [klinik, hastane, doktor, eczane] = await Promise.all([
      admin.from('klinikler').select('id,name,il,ilce,slug,type,rat,rev,claimed,tel').eq('premium', true),
      admin.from('hastaneler').select('id,name,il,ilce,slug,type,rat,rev,claimed,tel').eq('premium', true),
      admin.from('doktorlar').select('id,ad,soyad,unvan,spec,il,ilce,slug,rat,rev,verified,tel').eq('premium', true),
      admin.from('eczaneler').select('id,name,il,ilce,slug,rat,rev,claimed,tel').eq('premium', true),
    ]);

    const map = (rows: any[] | null, type: string) => (rows || []).map((r) => ({
      type,
      id: r.id,
      name: type === 'doktor' ? [r.unvan, r.ad, r.soyad].filter(Boolean).join(' ') : r.name,
      il: r.il || '', ilce: r.ilce || '',
      slug: r.slug || null,
      spec: r.spec || r.type || null,
      rat: r.rat || 0, rev: r.rev || 0,
      claimed: r.claimed ?? r.verified ?? false,
      tel: r.tel || null,
    }));

    const items = [
      ...map(klinik.data, 'klinik'),
      ...map(hastane.data, 'hastane'),
      ...map(doktor.data, 'doktor'),
      ...map(eczane.data, 'eczane'),
    ].map(it => ({ ...it, premiumAktif: true }));

    // Stripe abonelik bilgisi (tablo varsa) — entity_id ile eşle
    let subsByEntity: Record<string, any> = {};
    try {
      const { data: subs } = await (admin as any)
        .from('premium_subscriptions')
        .select('entity_type,entity_id,email,status,current_period_end,stripe_customer_id,stripe_subscription_id');
      if (subs) subs.forEach((s: any) => { subsByEntity[`${s.entity_type}:${s.entity_id}`] = s; });
    } catch { /* tablo yoksa geç */ }

    // Geçmiş aboneler: premium=false olduğu için yukarıdaki sorgulara düşmezler.
    // İptal edilen üyelik listeden tamamen kaybolmasın diye abonelik kaydı olan
    // ama premium'u kapalı işletmeler de çekilir (admin geçmişi görebilsin).
    const varOlan = new Set(items.map(it => `${it.type}:${it.id}`));
    const eksik: Record<string, string[]> = {};
    Object.values(subsByEntity).forEach((sub: any) => {
      const k = `${sub.entity_type}:${sub.entity_id}`;
      if (!varOlan.has(k)) (eksik[sub.entity_type] ||= []).push(String(sub.entity_id));
    });
    const TBL: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
    const gecmis: any[] = [];
    await Promise.all(Object.entries(eksik).map(async ([tur, ids]) => {
      const tbl = TBL[tur]; if (!tbl || !ids.length) return;
      try {
        const alanlar = tur === 'doktor'
          ? 'id,ad,soyad,unvan,spec,il,ilce,slug,rat,rev,verified,tel'
          : 'id,name,il,ilce,slug,type,rat,rev,claimed,tel';
        const { data } = await (admin as any).from(tbl).select(alanlar).in('id', ids);
        gecmis.push(...map(data, tur).map(it => ({ ...it, premiumAktif: false })));
      } catch { /* kayıt silinmişse atla */ }
    }));
    items.push(...gecmis);

    // Stripe'tan canlı durum — tek liste çağrısı, abonelik id'siyle eşlenir.
    // `cancel_at_period_end` DB'de tutulmuyor; "dönem sonunda bitecek" bilgisi
    // yalnızca buradan gelir. Anahtar yok/geçersizse liste yine çalışır.
    const canli: Record<string, { status: string; cancel_at_period_end: boolean; current_period_end: number | null }> = {};
    let stripeHata: string | null = null;
    if (Object.values(subsByEntity).some((s: any) => s?.stripe_subscription_id)) {
      try {
        const stripe = getStripe();
        let starting_after: string | undefined;
        for (let sayfa = 0; sayfa < 5; sayfa++) {   // en fazla 500 abonelik
          const liste: any = await stripe.subscriptions.list({ status: 'all', limit: 100, starting_after });
          (liste.data || []).forEach((s: any) => {
            canli[s.id] = {
              status: s.status,
              cancel_at_period_end: !!s.cancel_at_period_end,
              current_period_end: s.current_period_end ?? null,
            };
          });
          if (!liste.has_more || !liste.data?.length) break;
          starting_after = liste.data[liste.data.length - 1].id;
        }
      } catch (e: any) {
        stripeHata = e?.message || String(e);
        console.error('admin/premium stripe list:', stripeHata);
      }
    }

    const withSub = items.map((it) => {
      const kayit = subsByEntity[`${it.type}:${it.id}`] || null;
      const live = kayit?.stripe_subscription_id ? canli[kayit.stripe_subscription_id] : null;
      return {
        ...it,
        sub: kayit ? {
          ...kayit,
          // Canlı durum varsa DB'dekini ezer — DB webhook gecikirse bayat kalabilir.
          status: live?.status ?? kayit.status,
          cancel_at_period_end: live?.cancel_at_period_end ?? null,
          current_period_end: live?.current_period_end
            ? new Date(live.current_period_end * 1000).toISOString()
            : kayit.current_period_end,
          stripe_canli: !!live,
        } : null,
      };
    });

    const counts = {
      klinik: klinik.data?.length || 0,
      hastane: hastane.data?.length || 0,
      doktor: doktor.data?.length || 0,
      eczane: eczane.data?.length || 0,
      aktif: items.filter(i => i.premiumAktif).length,
      gecmis: gecmis.length,
      toplam: items.length,
    };

    return NextResponse.json({ items: withSub, counts, stripeHata });
  } catch (e) {
    console.error('admin/premium error:', e);
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
