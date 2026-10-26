import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest } from '@/lib/admin-auth';
import { entitySil, type SilinebilirTablo } from '@/lib/entity-sil';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const VALID_TABLES = ['klinikler', 'hastaneler', 'doktorlar', 'eczaneler'];

export async function DELETE(request: NextRequest) {
  try {
    // 1. Oturum doğrula — sadece admin silebilir
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { entityId, entityType } = await request.json();

    if (!entityId || !entityType || !VALID_TABLES.includes(entityType)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    // Silme mantığı profil kaldırma onayıyla ORTAK: lib/entity-sil.ts
    const sonuc = await entitySil(adminClient(), entityType as SilinebilirTablo, String(entityId));
    if (!sonuc.ok) {
      return NextResponse.json({ error: sonuc.mesaj }, { status: sonuc.kod === 'abonelik' ? 409 : 500 });
    }
    const { uyarilar } = sonuc;

    return NextResponse.json({ success: true, uyarilar });
  } catch (err) {
    console.error('delete-entity error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
