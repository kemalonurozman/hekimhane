import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

// Service role — RLS'yi bypass eder (yalnızca server-side)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
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
    }
  );
}

// Kullanıcının onaylı olarak sahiplendiği işletmelerin entity_id listesi.
async function ownedEntityIds(admin: ReturnType<typeof adminClient>, email: string): Promise<string[]> {
  const { data } = await (admin as any).from('claim_requests')
    .select('entity_id').eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  return Array.from(new Set(((data as { entity_id: string }[]) || []).map(c => String(c.entity_id))));
}

/**
 * GET — Giriş yapmış kullanıcının, sahiplendiği (onaylı) işletmelere gelen
 * randevu taleplerini döndürür. E-posta SESSION'dan alınır; sahiplik
 * onaylı claim üzerinden doğrulanır. Service-role ile okunur (RLS bypass).
 */
export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.length) return NextResponse.json({ talepler: [] });

    const { data, error } = await (admin as any).from('randevu_talepleri')
      .select('*').in('entity_id', ids).order('created_at', { ascending: false });
    if (error) {
      // Tablo henüz yoksa boş dön (özellik pasif)
      return NextResponse.json({ talepler: [] });
    }
    return NextResponse.json({ talepler: data || [] });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}

const VALID_STATUS = ['yeni', 'arandi', 'tamamlandi', 'iptal'];

/**
 * POST — Sahip, kendi işletmesine gelen bir randevu talebinin durumunu
 * günceller. Talebin entity_id'si kullanıcının sahiplendiği işletmelerden
 * biri değilse reddedilir (yetki kontrolü).
 */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const body = await request.json();
    const { id } = body as { id?: string };
    const hasStatus = typeof body.status === 'string';
    const hasNot = typeof body.sahip_notu === 'string';
    const yeniSlot = typeof body.randevu_slot === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(body.randevu_slot.trim())
      ? body.randevu_slot.trim() : null;
    if (!id || (!hasStatus && !hasNot && !yeniSlot)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }
    if (hasStatus && !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);

    // Talep gerçekten bu kullanıcının işletmesine mi ait? (bildirim için detay da al)
    const { data: talep } = await (admin as any).from('randevu_talepleri')
      .select('entity_id, entity_name, ad_soyad, email, randevu_slot').eq('id', id).maybeSingle();
    if (!talep || !ids.includes(String(talep.entity_id))) {
      return NextResponse.json({ error: 'Bu talep üzerinde yetkiniz yok' }, { status: 403 });
    }

    // Erteleme: yeni slot başkası tarafından alınmış mı?
    if (yeniSlot) {
      try {
        const { data: cak } = await (admin as any).from('randevu_talepleri')
          .select('id').eq('entity_id', String(talep.entity_id)).eq('randevu_slot', yeniSlot)
          .neq('status', 'iptal').neq('id', id).limit(1).maybeSingle();
        if (cak) return NextResponse.json({ error: 'Seçtiğiniz saat dolu. Başka bir saat seçin.' }, { status: 409 });
      } catch { /* kolon yoksa geç */ }
    }

    const yama: Record<string, unknown> = {};
    if (hasStatus) yama.status = body.status;
    if (hasNot) yama.sahip_notu = String(body.sahip_notu).slice(0, 2000);
    if (yeniSlot) { yama.randevu_slot = yeniSlot; yama.tercih = yeniSlot; }

    const { error } = await (admin as any).from('randevu_talepleri').update(yama).eq('id', id);
    if (error) {
      const kolonYok = /sahip_notu|randevu_slot|column|schema cache/i.test(error.message || '');
      return NextResponse.json({ error: kolonYok ? 'Kolon yok — ilgili migration\'ı çalıştırın.' : 'Güncellenemedi' }, { status: 500 });
    }

    // Hastaya bildirim (best-effort; e-posta varsa)
    try {
      if (talep.email && String(talep.email).includes('@')) {
        if (hasStatus && body.status === 'iptal') {
          await sendEmail({
            to: talep.email, subject: `Randevunuz iptal edildi — ${talep.entity_name}`,
            html: mailShell('Randevunuz İptal Edildi',
              `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;">Merhaba <strong>${talep.ad_soyad || ''}</strong>, <strong>${talep.entity_name}</strong> için randevunuz iptal edilmiştir.</p>` +
              (talep.randevu_slot ? satir('İptal edilen', talep.randevu_slot) : '') +
              `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:12px;">Yeni bir randevu için işletmeyle iletişime geçebilirsiniz.</p>`),
          });
        } else if (yeniSlot && yeniSlot !== talep.randevu_slot) {
          await sendEmail({
            to: talep.email, subject: `Randevunuz güncellendi — ${talep.entity_name}`,
            html: mailShell('Randevunuz Güncellendi',
              `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;">Merhaba <strong>${talep.ad_soyad || ''}</strong>, <strong>${talep.entity_name}</strong> için randevunuz yeni tarih-saate alınmıştır.</p>` +
              satir('Yeni tarih / saat', yeniSlot) +
              (talep.randevu_slot ? satir('Önceki', talep.randevu_slot) : '')),
          });
        }
      }
    } catch { /* bildirim ana akışı bozmaz */ }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
