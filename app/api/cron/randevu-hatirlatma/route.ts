import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/* Günlük cron (vercel.json: 0 9 * * *). Yarın (TR) randevusu olan ve e-posta
   bırakmış hastalara tek seferlik hatırlatma maili gönderir. */
export async function GET(request: NextRequest) {
  // Güvenlik: CRON_SECRET tanımlıysa Vercel'in gönderdiği Authorization ile eşleşmeli
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    const q = request.nextUrl.searchParams.get('secret') || '';
    if (auth !== `Bearer ${secret}` && q !== secret) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }

  try {
    // Yarının TR tarihi (YYYY-MM-DD)
    const todayTR = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const [y, m, d] = todayTR.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d)); dt.setUTCDate(dt.getUTCDate() + 1);
    const yarin = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;

    const admin = adminClient();
    const { data, error } = await (admin as any).from('randevu_talepleri')
      .select('id, entity_name, ad_soyad, tel, email, randevu_slot, status, hatirlatildi')
      .ilike('randevu_slot', `${yarin}%`)
      .neq('status', 'iptal')
      .not('email', 'is', null);

    if (error) {
      // Kolon/tablo yoksa sessizce geç
      return NextResponse.json({ ok: true, gonderildi: 0, not: 'randevu_slot/hatirlatildi hazır değil' });
    }

    const hedef = (data as any[] || []).filter(r => r.email && r.email.includes('@') && r.hatirlatildi !== true);
    let gonderildi = 0;

    for (const r of hedef) {
      const saat = String(r.randevu_slot || '').split(' ')[1] || '';
      const res = await sendEmail({
        to: r.email,
        subject: `Yarınki randevunuz — ${r.entity_name}`,
        html: mailShell('Randevu Hatırlatması',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Merhaba <strong>${String(r.ad_soyad || '')}</strong>,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;"><strong>${r.entity_name}</strong> için <strong>yarın${saat ? ` saat ${saat}` : ''}</strong> randevunuz bulunuyor.</p>` +
          satir('İşletme', r.entity_name) +
          satir('Tarih / Saat', r.randevu_slot) +
          `<p style="font-size:12px;color:#6E6E73;line-height:1.6;margin-top:14px;">Gelemeyecekseniz lütfen işletmeyi arayarak bilgi verin. Bu hatırlatma Hekimhane üzerinden gönderilmiştir.</p>`),
      });
      if (res.ok) {
        await (admin as any).from('randevu_talepleri').update({ hatirlatildi: true }).eq('id', r.id);
        gonderildi++;
      }
    }

    return NextResponse.json({ ok: true, yarin, aday: hedef.length, gonderildi });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
