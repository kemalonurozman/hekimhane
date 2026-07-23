import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
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

  return NextResponse.json({ ok: true, id: data.id });
}
