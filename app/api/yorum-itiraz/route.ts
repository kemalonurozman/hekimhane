import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// IP bazlı basit rate limit — instance başına 10 dk'da 5 itiraz.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now); rateMap.set(ip, hits);
  if (rateMap.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    Array.from(rateMap.entries()).forEach(([k, v]) => { if (!v.some(t => t > cutoff)) rateMap.delete(k); });
  }
  return false;
}

const TABLE: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };

async function entityAdi(admin: ReturnType<typeof adminClient>, type: string, id: string): Promise<string> {
  try {
    if (type === 'doktor') {
      const { data } = await (admin as any).from('doktorlar').select('ad,soyad,unvan').eq('id', id).maybeSingle();
      if (data) return [data.unvan, data.ad, data.soyad].filter(Boolean).join(' ').trim() || String(id);
    } else if (TABLE[type]) {
      const { data } = await (admin as any).from(TABLE[type]).select('name').eq('id', id).maybeSingle();
      if (data?.name) return data.name;
    }
  } catch { /* geç */ }
  return String(id);
}

/* ── POST: herkese açık yorum itirazı (işletme sahibi veya ziyaretçi) ── */
export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla itiraz gönderdiniz. Lütfen biraz sonra tekrar deneyin.' }, { status: 429 });
    }

    const body = await req.json();
    const { yorumId, reason, email, website } = body as { yorumId?: string; reason?: string; email?: string; website?: string };

    // Honeypot
    if (website) return NextResponse.json({ success: true });

    if (!yorumId) return NextResponse.json({ error: 'Yorum bilgisi eksik.' }, { status: 400 });
    if (!reason || String(reason).trim().length < 5) {
      return NextResponse.json({ error: 'Lütfen itiraz gerekçenizi yazın (en az 5 karakter).' }, { status: 400 });
    }

    const admin = adminClient();

    // Yorumu bul
    const { data: yorum, error: yErr } = await (admin as any)
      .from('yorumlar')
      .select('id, entity_id, entity_type, author, rating, text, report_status')
      .eq('id', yorumId)
      .maybeSingle();

    if (yErr && /column|report_status|schema cache/i.test(yErr.message || '')) {
      return NextResponse.json({ error: 'Yorum moderasyon sistemi henüz etkin değil. Lütfen daha sonra tekrar deneyin.' }, { status: 503 });
    }
    if (!yorum) return NextResponse.json({ error: 'Yorum bulunamadı.' }, { status: 404 });

    // Zaten sonuçlanmış / incelemedeyse tekrar bildirime gerek yok
    if (yorum.report_status === 'resolved') {
      return NextResponse.json({ success: true, note: 'Bu yorum zaten değerlendirildi.' });
    }
    if (yorum.report_status === 'pending') {
      return NextResponse.json({ success: true, note: 'Bu yorum hakkında zaten bir itiraz inceleniyor.' });
    }

    const gerekce = String(reason).trim().slice(0, 1000);
    const bildiren = (email && String(email).includes('@')) ? String(email).trim().slice(0, 150) : 'Ziyaretçi';

    const { error: upErr } = await (admin as any)
      .from('yorumlar')
      .update({
        report_status: 'pending',
        report_reason: gerekce,
        reported_by: bildiren,
        reported_at: new Date().toISOString(),
      })
      .eq('id', yorumId);

    if (upErr) {
      const kolonYok = /column|report_status|schema cache/i.test(upErr.message || '');
      return NextResponse.json({
        error: kolonYok
          ? 'Yorum moderasyon kolonları veritabanında yok. Yönetici "add_yorum_moderation.sql" migration\'ını çalıştırmalı.'
          : 'İtiraz kaydedilemedi. Lütfen tekrar deneyin.',
      }, { status: 500 });
    }

    // Admin bildirimi (graceful)
    try {
      const entityName = await entityAdi(admin, yorum.entity_type, yorum.entity_id);
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Yorum itirazı — ${entityName}`,
        replyTo: bildiren !== 'Ziyaretçi' ? bildiren : undefined,
        html: mailShell('Yeni yorum itirazı', `
          <p style="font-size:14px;color:#1c1c1e;margin:0 0 12px;">Bir yoruma itiraz edildi. Admin panelinden inceleyin.</p>
          ${satir('İşletme', entityName)}
          ${satir('İtiraz eden', bildiren)}
          ${satir('Yorum sahibi', yorum.author)}
          ${satir('Puan', `${yorum.rating}/5`)}
          ${satir('Yorum', yorum.text)}
          ${satir('Gerekçe', gerekce)}
          <p style="margin:16px 0 0;"><a href="https://www.hekimhane.com.tr/admin" style="color:#1B3A69;font-weight:700;">Admin → Şikayetler</a></p>
        `),
      });
    } catch { /* mail hatası akışı bozmaz */ }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
