import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { panelOturum } from '@/lib/panel-oturum';
import { yetkiliEntityIdleri } from '@/lib/erisim';
import { yorumTokeni, yorumBaglantisi, talepYorumDurumu } from '@/lib/onayli-yorum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET ?talep=<id> — tamamlanmış randevu için hastaya iletilecek onaylı yorum bağlantısı.
// E-postası olmayan hastalara işletme bu bağlantıyı SMS/WhatsApp ile gönderir.
export async function GET(request: NextRequest) {
  const oturum = await panelOturum(request);
  if (!oturum?.user?.email) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
  const talepId = request.nextUrl.searchParams.get('talep') || '';
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
  const d = await talepYorumDurumu(db, talepId);
  if (d.durum === 'yok') return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
  const yetkili = await yetkiliEntityIdleri(db, oturum.user.email, ['randevu']);
  if (!yetkili.includes(String(d.talep.entity_id))) return NextResponse.json({ error: 'Bu talep üzerinde yetkiniz yok' }, { status: 403 });
  if (d.durum === 'tamamlanmadi') return NextResponse.json({ error: 'Önce randevuyu "Tamamlandı" olarak işaretleyin.' }, { status: 409 });
  if (d.durum === 'yazildi') return NextResponse.json({ yazildi: true });
  return NextResponse.json({ baglanti: yorumBaglantisi(yorumTokeni(talepId)) });
}
