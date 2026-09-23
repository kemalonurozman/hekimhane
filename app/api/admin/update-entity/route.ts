import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}


const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  doktor:  'doktorlar',
  eczane:  'eczaneler',
};

const ALLOWED_FIELDS: Record<string, string[]> = {
  klinik:  ['name','type','il','ilce','adres','tel','website','maps_url','specs','online','acil','logo','cover','photos','photo360','tour360url','claimed','premium'],
  hastane: ['name','type','il','ilce','adres','tel','website','maps_url','docs','beds','founded','logo','cover','photos','photo360','tour360url','claimed','premium'],
  doktor:  ['ad','soyad','spec','il','ilce','clinic_name','tel','fee','bio','okul','sigorta','tags','unvan','online','photo','photos','photo360','tour360url','verified','premium'],
  eczane:  ['name','pharmacist','il','ilce','address','tel','nobetci','chamber','cover','photos','photo360','tour360url','claimed','premium'],
};

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { entityType, entityId, fields } = await request.json();
    if (!entityType || !entityId || !fields) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    const table   = TABLE_MAP[entityType];
    const allowed = ALLOWED_FIELDS[entityType] || [];
    if (!table) return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 });

    const safeFields: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) safeFields[key] = fields[key];
    }
    safeFields['updated_at'] = new Date().toISOString();

    if (Object.keys(safeFields).length <= 1) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
    }

    const admin = adminClient();
    let { error } = await admin.from(table).update(safeFields).eq('id', entityId);
    // Tabloda updated_at kolonu yoksa (ör. eczaneler) o alan olmadan tekrar dene —
    // yoksa o türün hiçbir kaydı düzenlenemiyordu.
    if (error && /updated_at/.test(error.message)) {
      delete safeFields['updated_at'];
      ({ error } = await admin.from(table).update(safeFields).eq('id', entityId));
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin/update-entity error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
