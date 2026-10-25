import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { panelOturum } from '@/lib/panel-oturum';
import { yoneticiMi } from '@/lib/yonetici';
import { epostaNormal } from '@/lib/sahiplik';

export const dynamic = 'force-dynamic';

/*
 * İlk kullanıcılara ücretsiz Pro — panel tarafı (lib/erken-uye.ts).
 * GET  → kullanıcının SAHİBİ olduğu işletmelerin erken üye kayıtları
 *        (kutlama penceresi + "Ücretsiz Pro" rozeti). Yönetici/asistan görmez:
 *        pencereyi kapatmaları sahibin göreceği kutlamayı silmesin.
 * POST {entity_id} → kutlama görüldü işareti.
 * Tablo yoksa (migration çalışmadı) boş liste döner — panel bozulmaz.
 */

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

async function sahipOlunanlar(admin: any, email: string): Promise<string[]> {
  const { data } = await admin.from('claim_requests')
    .select('entity_id,role').eq('email', email).eq('status', 'approved').limit(200);
  return Array.from(new Set(((data as any[]) || [])
    .filter(r => r.entity_id && r.entity_id !== 'new' && !yoneticiMi(r.role))
    .map(r => String(r.entity_id))));
}

export async function GET(request: NextRequest) {
  const s = await panelOturum(request);
  const email = epostaNormal(s?.user?.email);
  if (!email) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
  const admin = db() as any;
  try {
    const ids = await sahipOlunanlar(admin, email);
    if (!ids.length) return NextResponse.json({ kayitlar: [] });
    const { data, error } = await admin.from('erken_uye_pro')
      .select('entity_type,entity_id,entity_name,sira,kaynak,kutlama_goruldu').in('entity_id', ids);
    if (error) return NextResponse.json({ kayitlar: [] });
    return NextResponse.json({ kayitlar: (data as any[]) || [] });
  } catch {
    return NextResponse.json({ kayitlar: [] });
  }
}

export async function POST(request: NextRequest) {
  const s = await panelOturum(request);
  const email = epostaNormal(s?.user?.email);
  if (!email) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
  const { entity_id } = await request.json().catch(() => ({}));
  const eid = String(entity_id || '');
  if (!eid) return NextResponse.json({ error: 'entity_id gerekli' }, { status: 400 });
  const admin = db() as any;
  const ids = await sahipOlunanlar(admin, email);
  if (!ids.includes(eid)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const { error } = await admin.from('erken_uye_pro')
    .update({ kutlama_goruldu: new Date().toISOString() }).eq('entity_id', eid).is('kutlama_goruldu', null);
  if (error) return NextResponse.json({ ok: false }, { status: 200 });
  return NextResponse.json({ ok: true });
}
