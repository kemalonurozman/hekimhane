import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'hasta-dosyalari';          // PRIVATE bucket
const MAX_MB = 15;
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'];

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n: string) { return request.cookies.get(n)?.value; }, set() {}, remove() {} } },
  );
}
async function ownedEntityIds(admin: ReturnType<typeof adminClient>, email: string): Promise<string[]> {
  const { data } = await (admin as any).from('claim_requests')
    .select('entity_id').eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  return Array.from(new Set(((data as { entity_id: string }[]) || []).map(c => String(c.entity_id))));
}
async function ensureBucket(admin: ReturnType<typeof adminClient>) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!(buckets || []).some((b: any) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: MAX_MB * 1024 * 1024, allowedMimeTypes: ALLOWED });
  }
}

/* GET — liste (meta) veya ?signed=<id> ile 5 dk geçerli imzalı URL. */
export async function GET(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);

    const signedId = request.nextUrl.searchParams.get('signed');
    if (signedId) {
      const { data: row } = await (admin as any).from('hasta_dosyalari').select('entity_id,yol').eq('id', signedId).maybeSingle();
      if (!row || !ids.includes(String(row.entity_id))) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
      const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(row.yol, 300);   // 5 dk
      if (error || !data?.signedUrl) return NextResponse.json({ error: 'Bağlantı üretilemedi' }, { status: 500 });
      return NextResponse.json({ url: data.signedUrl });
    }

    if (!ids.length) return NextResponse.json({ dosyalar: [] });
    const { data, error } = await (admin as any).from('hasta_dosyalari')
      .select('id,entity_id,tel,ad,tip,boyut,created_at').in('entity_id', ids).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ dosyalar: [], migrationGerekli: true });
    return NextResponse.json({ dosyalar: data || [] });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* POST (multipart) — dosya yükle. */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const entityId = String(form.get('entityId') || '').trim();
    const tel = String(form.get('tel') || '').replace(/\D/g, '');
    if (!file) return NextResponse.json({ error: 'Dosya yok' }, { status: 400 });
    if (!entityId || tel.length < 10) return NextResponse.json({ error: 'Geçersiz hasta bilgisi' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Desteklenmeyen tür. JPEG/PNG/WebP/PDF yükleyin.' }, { status: 400 });
    if (file.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `Dosya ${MAX_MB}MB'dan büyük olamaz.` }, { status: 400 });

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.includes(entityId)) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });

    await ensureBucket(admin);
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const yol = `${entityId}/${tel}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage.from(BUCKET).upload(yol, buffer, { contentType: file.type, upsert: false });
    if (upErr) return NextResponse.json({ error: 'Yükleme başarısız: ' + upErr.message }, { status: 500 });

    const kayit = { entity_id: entityId, tel, yol, ad: String(file.name).slice(0, 200), tip: file.type, boyut: file.size };
    const { data, error } = await (admin as any).from('hasta_dosyalari').insert(kayit).select('id,entity_id,tel,ad,tip,boyut,created_at').single();
    if (error) {
      await admin.storage.from(BUCKET).remove([yol]);   // kayıt olmadıysa dosyayı da sil
      const yok = /relation .*hasta_dosyalari.* does not exist|schema cache|does not exist/i.test(error.message || '');
      return NextResponse.json({ error: yok ? 'Dosya tablosu yok — add_hasta_dosyalari.sql çalıştırın.' : 'Kaydedilemedi' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, dosya: data });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* DELETE ?id= — dosyayı sil (storage + kayıt). */
export async function DELETE(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    const { data: row } = await (admin as any).from('hasta_dosyalari').select('entity_id,yol').eq('id', id).maybeSingle();
    if (!row || !ids.includes(String(row.entity_id))) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    await admin.storage.from(BUCKET).remove([row.yol]);
    const { error } = await (admin as any).from('hasta_dosyalari').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
