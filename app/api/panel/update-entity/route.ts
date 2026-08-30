import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';

// Service role client — RLS'yi bypass eder, sadece server-side
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Cookie-tabanlı session client — kullanıcıyı doğrular
function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. Kullanıcı oturumunu doğrula
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, fields } = body;

    if (!entityType || !entityId || !fields) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    // 2. Kullanıcının bu işletme için onaylı claim'i olduğunu doğrula
    const admin = adminClient();
    const { data: claim } = await admin
      .from('claim_requests')
      .select('id')
      .eq('email', session.user.email!)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('status', 'approved')
      .single();

    if (!claim) {
      return NextResponse.json({ error: 'Bu işletmeyi düzenleme yetkiniz yok' }, { status: 403 });
    }

    // 3. İzin verilen alanları filtrele (güvenlik için whitelist)
    const TABLE_MAP: Record<string, string> = {
      klinik:  'klinikler',
      hastane: 'hastaneler',
      doktor:  'doktorlar',
      eczane:  'eczaneler',
    };

    const ALLOWED_FIELDS: Record<string, string[]> = {
      klinik:  ['name','sorumlu_hekim','type','il','ilce','adres','tel','whatsapp','website','maps_url','specs','yabanci_diller','bio','okul','uzmanlik_kurum','deneyim_baslangic','deneyimler','sertifikalar','online','acil','logo','cover','photos','photo360','tour360url','video_url','instagram_url','facebook_url','linkedin_url','calisma_saatleri','acik_24_saat','randevu_email','randevu_aktif','randevu_slot_dk','randevu_bloke','lat','lng'],
      hastane: ['name','sorumlu_hekim','type','il','ilce','adres','tel','whatsapp','website','maps_url','specs','yabanci_diller','docs','beds','founded','logo','cover','photos','photo360','tour360url','video_url','instagram_url','facebook_url','linkedin_url','calisma_saatleri','acik_24_saat','randevu_email','randevu_aktif','randevu_slot_dk','randevu_bloke','lat','lng'],
      doktor:  ['ad','soyad','spec','il','ilce','clinic_name','tel','email','contact_hidden','whatsapp','fee','bio','okul','uzmanlik_kurum','deneyim_baslangic','deneyimler','sertifikalar','yabanci_diller','sigorta','tags','conditions','unvan','online','photo','photos','photo360','tour360url','video_url','instagram_url','facebook_url','linkedin_url','calisma_saatleri','acik_24_saat','randevu_email','randevu_aktif','randevu_slot_dk','randevu_bloke','lat','lng'],
      eczane:  ['name','pharmacist','il','ilce','address','tel','whatsapp','chamber','yabanci_diller','logo','photos','photo360','tour360url','video_url','instagram_url','facebook_url','linkedin_url','calisma_saatleri','acik_24_saat','randevu_email','randevu_aktif','randevu_slot_dk','randevu_bloke','lat','lng'],
    };

    const table   = TABLE_MAP[entityType];
    const allowed = ALLOWED_FIELDS[entityType] || [];

    if (!table) {
      return NextResponse.json({ error: 'Geçersiz işletme türü' }, { status: 400 });
    }

    // Sadece izin verilen alanları al
    const safeFields: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) safeFields[key] = fields[key];
    }

    // Pro'ya kilitli alanlar — panel bunları zaten devre dışı gösterir ama
    // API doğrudan çağrılırsa da yazılamamalı. Premium değilse sessizce
    // düşürülür (form tüm formData'yı gönderdiği için hata dönmek her
    // kaydı bozar); mevcut değerler DB'de olduğu gibi kalır.
    const PRO_FIELDS = ['website', 'instagram_url', 'facebook_url', 'linkedin_url',
      'randevu_aktif', 'randevu_slot_dk', 'randevu_bloke'];
    if (PRO_FIELDS.some(k => k in safeFields)) {
      const { data: entRow } = await (admin as any).from(table).select('premium').eq('id', entityId).maybeSingle();
      if (entRow?.premium !== true) {
        for (const k of PRO_FIELDS) delete safeFields[k];
      }
    }
    // eczaneler tablosunda updated_at kolonu yok
    if (entityType !== 'eczane') safeFields['updated_at'] = new Date().toISOString();

    if (Object.keys(safeFields).length <= 1) {
      return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 });
    }

    // 4. Güncelle
    const { error } = await (admin as any).from(table).update(safeFields).eq('id', entityId);
    if (error) {
      // Kolon yoksa daha anlaşılır hata mesajı döndür
      const missingCol = error.message?.match(/column "([^"]+)"/)?.[1];
      const msg = missingCol
        ? `"${missingCol}" kolonu veritabanında yok. Admin → Sistem & DB → SQL migration'ı çalıştırın.`
        : error.message;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 5. Next.js cache temizle — liste ve profil sayfaları güncel veri göstersin
    const pathMap: Record<string, string> = {
      klinik:  '/klinikler',
      hastane: '/hastaneler',
      doktor:  '/doktorlar',
      eczane:  '/eczaneler',
    };
    const basePath = pathMap[entityType];
    if (basePath) {
      revalidatePath(basePath, 'layout');  // liste sayfası
      revalidatePath('/', 'layout');       // ana sayfa stats
    }
    revalidateTag('facets');   // filtre sayaçları (1s önbellek) düzenlemeden sonra tazelensin

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('update-entity error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
