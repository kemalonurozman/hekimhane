/**
 * Fotoğraf Yükleme API
 * Supabase Storage'a resim yükler, public URL döndürür.
 * Bucket: "hekimhane-photos" (otomatik oluşturulur)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const BUCKET      = 'hekimhane-photos';
const MAX_SIZE_MB = 8;
const ALLOWED     = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sessionClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {}, remove() {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const sess = sessionClient(req);
    const { data: { session } } = await sess.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Oturum açınız' }, { status: 401 });

    // Form data
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });

    // Tip kontrolü
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Desteklenmeyen dosya türü. JPEG, PNG, WebP, GIF desteklenir.' }, { status: 400 });
    }

    // Boyut kontrolü
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Dosya ${MAX_SIZE_MB}MB'dan büyük olamaz.` }, { status: 400 });
    }

    const admin = adminClient();

    // Bucket yoksa oluştur
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = (buckets || []).some((b: any) => b.name === BUCKET);
    if (!bucketExists) {
      await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE_MB * 1024 * 1024,
        allowedMimeTypes: ALLOWED,
      });
    }

    // Dosya adı: userId/timestamp-random.ext
    const ext      = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const userId   = session.user.id.slice(0, 8);
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

    // Buffer'a çevir
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl:  '3600',
        upsert: false,
      });

    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return NextResponse.json({ error: 'Yükleme başarısız: ' + uploadErr.message }, { status: 500 });
    }

    // Public URL
    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('upload-photo error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
