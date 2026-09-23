import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { isAdminRequest } from '@/lib/admin-auth';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const VALID_TABLES = ['klinikler', 'hastaneler', 'doktorlar', 'eczaneler'];

// Tablo yoksa (henüz migration çalışmamış) temizliği hata saymadan geç
const tabloYok = (msg?: string) => /does not exist|could not find|relation .* not/i.test(msg || '');

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

    const admin = adminClient() as any;
    const typeKey = entityType.slice(0, -3); // klinikler → klinik

    // 2. Aktif Stripe aboneliği varsa SİLME — kayıt yok olurken tahsilat sürerdi.
    //    Önce Premium Üyeler sekmesinden aboneliğin iptali gerekir.
    const { data: aktifSub, error: subErr } = await admin.from('premium_subscriptions')
      .select('id,status')
      .eq('entity_type', typeKey).eq('entity_id', entityId)
      .in('status', ['active', 'trialing', 'past_due'])
      .limit(1).maybeSingle();
    if (subErr && !tabloYok(subErr.message)) {
      return NextResponse.json({ error: `Abonelik kontrolü yapılamadı: ${subErr.message}` }, { status: 500 });
    }
    if (aktifSub) {
      return NextResponse.json({
        error: 'Bu kaydın aktif bir Premium aboneliği var. Önce Premium Üyeler sekmesinden aboneliği iptal edin, sonra silin.',
      }, { status: 409 });
    }

    // 3. Bağlı kayıtları temizle — herhangi biri gerçekten hata verirse asıl
    //    kaydı silmeden dur (yarım silme = sahipsiz satırlar).
    const adimlar: { ad: string; q: PromiseLike<{ error: any }> }[] = [
      { ad: 'claim_requests',        q: admin.from('claim_requests').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
      { ad: 'yorumlar',              q: admin.from('yorumlar').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
      { ad: 'randevu_talepleri',     q: admin.from('randevu_talepleri').delete().eq('entity_id', entityId).eq('entity_type', typeKey) },
      { ad: 'premium_subscriptions', q: admin.from('premium_subscriptions').delete().eq('entity_id', entityId).eq('entity_type', typeKey) }, // yalnız pasif kayıtlar kaldı
      // HekimKart ve makaleler kullanıcıya ait: silinmez, işletme bağı koparılır
      { ad: 'hekimkartlar',          q: admin.from('hekimkartlar').update({ entity_id: null, entity_type: null }).eq('entity_id', entityId).eq('entity_type', typeKey) },
      { ad: 'blog_posts',            q: admin.from('blog_posts').update({ entity_id: null }).eq('entity_id', entityId).eq('entity_type', typeKey) },
    ];
    const uyarilar: string[] = [];
    for (const { ad, q } of adimlar) {
      const { error } = await q;
      if (!error) continue;
      if (tabloYok(error.message)) { uyarilar.push(`${ad}: tablo/kolon yok, atlandı`); continue; }
      return NextResponse.json({ error: `Bağlı kayıtlar temizlenemedi (${ad}): ${error.message}` }, { status: 500 });
    }

    // 4. Asıl kaydı sil (doctor_images FK ile cascade)
    const { error } = await admin.from(entityType).delete().eq('id', entityId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Public listeler bayat kalmasın
    try { revalidatePath(`/${entityType}`); revalidatePath('/'); } catch { /* build dışı ortamda sessiz */ }

    return NextResponse.json({ success: true, uyarilar });
  } catch (err) {
    console.error('delete-entity error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
