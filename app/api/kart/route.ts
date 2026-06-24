import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

function toSlug(s: string) {
  return (s || '').toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function rand4() { return Math.random().toString(36).slice(2, 6); }

/* ── GET: kullanıcının tüm kartlarını döndür ── */
export async function GET(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

  const admin = adminClient();
  const { data } = await (admin as any)
    .from('hekimkartlar')
    .select('*')
    .eq('user_email', session.user.email!)
    .order('created_at', { ascending: true });

  return NextResponse.json({ kartlar: data || [] });
}

/* ── POST: kart oluştur veya güncelle ── */
export async function POST(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

  const body = await request.json();
  const email = session.user.email!;
  const admin = adminClient();

  const ALLOWED = ['ad', 'soyad', 'unvan', 'spec', 'tel', 'instagram_url', 'facebook_url',
                   'photo_url', 'il', 'ilce', 'clinic_name', 'bio', 'slug',
                   'entity_id', 'entity_type', 'iban',
                   'rezervasyon_url', 'website_url', 'maps_url', 'hekimhane_url'] as const;

  // Mevcut kartın UUID'si varsa → UPDATE by id (her zaman doğru satırı günceller)
  const existingId = typeof body.id === 'string' && body.id ? body.id : null;

  const fields: Record<string, unknown> = { user_email: email, updated_at: new Date().toISOString() };
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key] ?? '';
  }

  // Slug yönetimi
  if (!fields.slug || String(fields.slug).trim() === '') {
    // Mevcut kart var mı? → slug'ı koru
    if (existingId) {
      const { data: existing } = await (admin as any)
        .from('hekimkartlar').select('slug').eq('id', existingId).single();
      if (existing?.slug) {
        fields.slug = existing.slug;
      } else {
        const base = toSlug(`${body.ad || ''} ${body.soyad || ''}`).slice(0, 30);
        fields.slug = base ? `${base}-${rand4()}` : `kart-${rand4()}`;
      }
    } else {
      const base = toSlug(`${body.ad || ''} ${body.soyad || ''}`).slice(0, 30);
      fields.slug = base ? `${base}-${rand4()}` : `kart-${rand4()}`;
    }
  } else {
    fields.slug = toSlug(String(fields.slug));
  }

  // Slug başka kullanıcıda var mı?
  const slugQuery = (admin as any)
    .from('hekimkartlar')
    .select('user_email')
    .eq('slug', fields.slug)
    .neq('user_email', email);
  if (existingId) slugQuery.neq('id', existingId);
  const { data: conflict } = await slugQuery.single();
  if (conflict) fields.slug = `${fields.slug}-${rand4()}`;

  // UPDATE by id (mevcut kart) veya INSERT/UPSERT (yeni kart)
  async function saveFields(f: Record<string, unknown>) {
    if (existingId) {
      // Mevcut satırı güncelle — her zaman doğru satırı yakalar
      return (admin as any)
        .from('hekimkartlar')
        .update(f)
        .eq('id', existingId)
        .eq('user_email', email)   // güvenlik: başkasının kartını değiştiremesin
        .select()
        .single();
    }
    // Yeni kart — entity_id varsa (user_email,entity_id) üzerinden, yoksa slug üzerinden
    const onConflict = f.entity_id ? 'user_email,entity_id' : 'slug';
    return (admin as any)
      .from('hekimkartlar')
      .upsert(f, { onConflict, ignoreDuplicates: false })
      .select()
      .single();
  }

  let { data, error } = await saveFields(fields);

  // Kolon henüz Supabase'de yoksa sırasıyla kaldır ve tekrar dene
  const unknownCols = ['iban', 'rezervasyon_url', 'website_url', 'maps_url', 'hekimhane_url', 'entity_id', 'entity_type'];
  for (const col of unknownCols) {
    if (error && error.message && error.message.includes(`'${col}'`)) {
      delete fields[col];
      ({ data, error } = await saveFields(fields));
    }
  }

  if (error) {
    console.error('kart save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ kart: data });
}
