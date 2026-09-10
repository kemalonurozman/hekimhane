import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir, satirTel } from '@/lib/email';
import { isletmeBilgisi } from '@/lib/entity-link';

const TUR_ETIKET: Record<string, string> = { doktor: 'Doktor', klinik: 'Klinik', hastane: 'Hastane', eczane: 'Eczane' };

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Sahiplenme talebi bildirimleri — admin + talep sahibi. Ana akışı bloklamaz.
async function sendClaimBildirimleri(k: {
  entity_id: string; entity_name: string; entity_type: string; claimant_name: string;
  phone: string; email: string; role: string | null; isDispute: boolean;
}) {
  try {
    const tur = k.isDispute ? 'Sahiplenme İtirazı' : 'Sahiplenme Talebi';

    // İşletmenin kendisi: doktorda bölüm + kurum, diğerlerinde tür/konum, hepsinde profil linki.
    // Formdan gelen entity_name boş/eksikse DB'deki ad kullanılır.
    const b = await isletmeBilgisi(adminClient(), k.entity_type, k.entity_id);
    const isletmeAdi = k.entity_name || b.ad || '—';
    const turEtiket = TUR_ETIKET[k.entity_type] || k.entity_type;
    const linkSatiri = b.url
      ? `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${b.url}" style="color:#1B3A69;font-weight:600;">${b.url.replace(/^https?:\/\/(www\.)?/, '')}</a></p>`
      : '';

    const detay =
      satir('İşletme', isletmeAdi) +
      satir('Tür', turEtiket) +
      (k.entity_type === 'doktor' ? satir('Bölüm / Uzmanlık', b.bolum) + satir('Çalıştığı Kurum', b.kurum) : satir(k.entity_type === 'hastane' ? 'Hastane Türü' : 'Uzmanlıklar', b.bolum)) +
      satir('Konum', b.konum) +
      linkSatiri +
      `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">` +
      satir('Ad Soyad', k.claimant_name) +
      satirTel('Telefon', k.phone) +
      satir('E-posta', k.email) +
      satir('Not / Rol', k.role);

    // 1) Admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Yeni ${tur.toLowerCase()} — ${isletmeAdi}${b.bolum && k.entity_type === 'doktor' ? ` (${b.bolum})` : ''}`,
      html: mailShell(`Yeni ${tur}`, detay +
        `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Admin panelindeki Talepler sekmesinden onaylayabilir veya reddedebilirsiniz.</p>`),
      replyTo: k.email || undefined,
    });

    // 2) Talep sahibi
    if (k.email && k.email.includes('@')) {
      await sendEmail({
        to: k.email,
        subject: `${tur}niz alındı — ${k.entity_name}`,
        html: mailShell(`${tur}niz Alındı`,
          `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${k.claimant_name || ''}</strong>,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${isletmeAdi}</strong> için ${tur.toLowerCase()}niz başarıyla alındı. Talebiniz <strong>24 saat içinde</strong> değerlendirilip size geri dönüş yapılacaktır.</p>` +
          (b.url ? `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:8px;">Talep ettiğiniz profil: <a href="${b.url}" style="color:#1B3A69;font-weight:600;">${b.url.replace(/^https?:\/\/(www\.)?/, '')}</a></p>` : '') +
          `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:12px;">Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`),
      });
    }
  } catch { /* bildirim hatası ana akışı etkilemez */ }
}

/* ── POST: sahiplenme / itiraz talebi kaydet (auth gerekmez) ──
   Tarayıcıdan anon key ile doğrudan insert RLS'e (profiles özyineleme
   hatası) takıldığı için yazma işlemi service role ile burada yapılır. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const {
    entity_id, entity_type, entity_name,
    claimant_name, phone, email, role, status,
  } = body as {
    entity_id?: string;
    entity_type?: string;
    entity_name?: string;
    claimant_name?: string;
    phone?: string;
    email?: string;
    role?: string | null;
    status?: string;
  };

  // Zorunlu alanlar
  if (!entity_id || !entity_type) {
    return NextResponse.json({ error: 'İşletme bilgisi eksik.' }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: 'Telefon zorunludur.' }, { status: 400 });
  }
  if (!email || !email.trim()) {
    return NextResponse.json({ error: 'E-posta zorunludur.' }, { status: 400 });
  }

  const safeStatus = status === 'dispute' ? 'dispute' : 'pending';

  const admin = adminClient();
  const { data, error } = await admin
    .from('claim_requests')
    .insert({
      entity_id:     String(entity_id).slice(0, 100),
      entity_type:   String(entity_type).slice(0, 40),
      entity_name:   (entity_name || '').slice(0, 200) || null,
      claimant_name: (claimant_name || '').slice(0, 120) || null,
      phone:         phone.trim().slice(0, 40),
      email:         email.trim().slice(0, 160),
      role:          role ? String(role).slice(0, 300) : null,
      status:        safeStatus,
    })
    .select()
    .single();

  if (error) {
    console.error('claim insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendClaimBildirimleri({
    entity_id: String(entity_id),
    entity_name: (entity_name || '').toString(),
    entity_type: String(entity_type),
    claimant_name: (claimant_name || '').toString(),
    phone: phone.trim(),
    email: email.trim(),
    role: role ? String(role) : null,
    isDispute: safeStatus === 'dispute',
  });

  return NextResponse.json({ ok: true, id: data.id });
}
