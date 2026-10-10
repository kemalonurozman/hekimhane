import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { panelOturum } from '@/lib/panel-oturum';
import { puanHesapla, puanTipi } from '@/lib/profil-puani-sunucu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — oturum sahibinin onaylı (sahip/yönetici) klinik ve doktor profillerinin
// puanı + kalem kalem dökümü. Puan yalnız burada (panelde) görünür; herkese açık
// hiçbir sayfa/uç nokta döndürmez. Her çağrıda canlı hesaplanır ve kolona yazılır.
export async function GET(request: NextRequest) {
  try {
    const oturum = await panelOturum(request);
    const email = oturum?.user?.email;
    if (!email) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: claims } = await (admin as any).from('claim_requests')
      .select('entity_id,entity_type,entity_name').eq('email', email).eq('status', 'approved');

    const gorulen = new Set<string>();
    const sonuc: any[] = [];
    for (const c of (claims || []) as any[]) {
      const tip = puanTipi(c.entity_type);
      const anahtar = `${c.entity_type}|${c.entity_id}`;
      if (!tip || gorulen.has(anahtar)) continue;
      gorulen.add(anahtar);
      const s = await puanHesapla(admin, tip, String(c.entity_id));
      if (!s) continue;
      // Kolonu da tazele (yoksa hata yutulur)
      try { await (admin as any).from(tip === 'klinik' ? 'klinikler' : 'doktorlar').update({ profil_puani: s.puan }).eq('id', c.entity_id); } catch { /* yoksay */ }
      sonuc.push({ entity_id: String(c.entity_id), entity_type: c.entity_type, entity_name: c.entity_name, ...s });
    }
    return NextResponse.json({ profiller: sonuc });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Sunucu hatası' }, { status: 500 });
  }
}
