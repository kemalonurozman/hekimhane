import { dogrulanmisOturum } from '@/lib/panel-oturum';
import { yoneticiMi } from '@/lib/yonetici';
import { claimedEsitle, epostaNormal } from '@/lib/sahiplik';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Service role — RLS bypass, yalnız server-side
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const TABLE_MAP: Record<string, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};
const PATH_MAP: Record<string, string> = {
  klinik: '/klinikler', hastane: '/hastaneler', doktor: '/doktorlar', eczane: '/eczaneler',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum
    const session = await dogrulanmisOturum(request);
    if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

    const { claimId } = await request.json();
    if (!claimId) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });

    // 2. Claim bu kullanıcıya ait ve onaylı mı?
    const admin = adminClient();
    const { data: claim } = await admin.from('claim_requests')
      .select('id, entity_type, entity_id, email, status, role')
      .eq('id', claimId).single();
    const c = claim as { id: string; entity_type: string; entity_id: string | null; email: string | null; status: string; role: string | null } | null;
    if (!c || epostaNormal(c.email) !== epostaNormal(session.user.email) || c.status !== 'approved') {
      return NextResponse.json({ error: 'Bu işletmenin sahipliğini bırakma yetkiniz yok' }, { status: 403 });
    }

    // 2b. Yönetici ayrılıyor → yalnız kendi erişim kaydı silinir; işletme sahibinde kalır
    if (yoneticiMi(c.role)) {
      await admin.from('claim_requests').delete().eq('id', claimId);
      return NextResponse.json({ success: true, yonetici: true });
    }

    // 3. Claim kaydını sil — sahiplik bırakılır (kullanıcı dilerse yeniden sahiplenebilir)
    await admin.from('claim_requests').delete().eq('id', claimId);

    // 4. "claimed" önbelleğini yeniden hesapla (lib/sahiplik.ts). Yalnız SON sahip
    //    ayrıldıysa premium + online randevu kapanır — eskiden başka sahip kalsa da
    //    claimed=false/premium=false yazılıyordu; claimed kolonu olmayan tabloda
    //    (doktorlar) birleşik update tümden düşüp premium da kapanmıyordu.
    const table = TABLE_MAP[c.entity_type];
    if (table && c.entity_id && c.entity_id !== 'new') {
      // Karar kolonun yazılabilmesine değil claim_requests'e bağlı (kolon yoksa da kapanır)
      const { sahipVar } = await claimedEsitle(admin, c.entity_type, c.entity_id);
      if (sahipVar === false) {
        await (admin as any).from(table).update({ premium: false }).eq('id', c.entity_id);
        // randevu_aktif kolonu yoksa akış bozulmasın — best-effort (hata döner, fırlatmaz)
        await (admin as any).from(table).update({ randevu_aktif: false }).eq('id', c.entity_id);
      }
    }

    // 5. Cache tazele — liste + profil "sahiplenilmemiş" olarak görünsün
    const basePath = PATH_MAP[c.entity_type];
    if (basePath) { revalidatePath(basePath, 'layout'); revalidatePath('/', 'layout'); }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('release-claim error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
