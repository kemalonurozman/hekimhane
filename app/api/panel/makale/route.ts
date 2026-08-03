import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';
import { makaleSlug, okumaSuresi, icerikGecerli } from '@/lib/makale-icerik';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

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
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {}, remove() {},
      },
    },
  );
}

const SELECT = 'id,title,slug,summary,category,cover_image,content,status,published,red_notu,entity_name,website,views,created_at,updated_at';

// Migration çalışmadıysa yeni kolonlar yok — bunu tek yerden anlayalım.
const kolonYok = (msg?: string) =>
  /column .* does not exist|could not find|schema cache/i.test(msg || '');

const MIGRATION_UYARISI =
  'Makale kolonları veritabanında yok. Supabase SQL Editor\'da "add_makale_gonderim.sql" migration\'ını çalıştırın.';

/** Oturum + en az bir onaylı claim → yazar kimliği. */
async function yazarKimligi(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  if (!session?.user?.email) return { hata: 'Giriş yapılmamış', kod: 401 as const };

  const email = session.user.email;
  const admin = adminClient();

  const { data: claim } = await (admin as any)
    .from('claim_requests')
    .select('entity_id, entity_type, entity_name')
    .eq('email', email)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle();

  return { email, admin, claim: claim || null };
}

/* ── GET: kullanıcının kendi makaleleri ── */
export async function GET(request: NextRequest) {
  try {
    const k = await yazarKimligi(request);
    if ('hata' in k) return NextResponse.json({ error: k.hata }, { status: k.kod });

    const { data, error } = await (k.admin as any)
      .from('blog_posts')
      .select(SELECT)
      .eq('author_email', k.email)
      .order('created_at', { ascending: false });

    if (error) {
      if (kolonYok(error.message)) return NextResponse.json({ makaleler: [], migrationGerekli: true });
      console.error('panel/makale GET:', error.message);
      return NextResponse.json({ error: 'Makaleler alınamadı' }, { status: 500 });
    }
    return NextResponse.json({ makaleler: data || [], isletme: k.claim?.entity_name || null });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── POST: yeni makale gönder (onaya düşer) ── */
export async function POST(request: NextRequest) {
  try {
    const k = await yazarKimligi(request);
    if ('hata' in k) return NextResponse.json({ error: k.hata }, { status: k.kod });
    if (!k.claim) {
      return NextResponse.json({ error: 'Makale gönderebilmek için onaylanmış bir işletmeniz olmalı.' }, { status: 403 });
    }

    const b = await request.json();
    const title    = String(b.title    || '').trim().slice(0, 160);
    const summary  = String(b.summary  || '').trim().slice(0, 400);
    const category = String(b.category || '').trim().slice(0, 60);
    const content  = String(b.content  || '').trim().slice(0, 40000);
    const cover    = String(b.cover_image || '').trim().slice(0, 500) || null;
    const website  = String(b.website  || '').trim().slice(0, 200) || null;

    if (title.length < 10)   return NextResponse.json({ error: 'Başlık en az 10 karakter olmalı.' }, { status: 400 });
    if (summary.length < 40) return NextResponse.json({ error: 'Özet en az 40 karakter olmalı.' }, { status: 400 });
    if (!icerikGecerli(content)) return NextResponse.json({ error: 'Makale metni en az 300 karakter olmalı.' }, { status: 400 });

    // Slug benzersizleştir
    let slug = makaleSlug(title) || `makale-${Date.now()}`;
    const { data: mevcut } = await (k.admin as any).from('blog_posts').select('id').eq('slug', slug).maybeSingle();
    if (mevcut) slug = `${slug}-${Math.floor(Date.now() / 1000) % 100000}`;

    const kayit = {
      title, slug, summary, category: category || 'Diş Sağlığı',
      content,
      author: k.claim.entity_name || 'Hekimhane',
      cover_image: cover,
      published: false,              // onaya kadar yayında değil
      status: 'pending',
      author_email: k.email,
      entity_id: k.claim.entity_id,
      entity_type: k.claim.entity_type,
      entity_name: k.claim.entity_name,
      okuma_dk: okumaSuresi(content),
      kaynak: 'panel',
      website,
    };

    const { data, error } = await (k.admin as any).from('blog_posts').insert(kayit).select('id,slug').single();

    if (error) {
      if (kolonYok(error.message)) return NextResponse.json({ error: MIGRATION_UYARISI }, { status: 500 });
      console.error('panel/makale POST:', error.message);
      return NextResponse.json({ error: 'Makale kaydedilemedi.' }, { status: 500 });
    }

    // Admin'e bildirim — graceful
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Onay bekleyen makale — ${k.claim.entity_name || k.email}`,
      replyTo: k.email,
      html: mailShell('Yeni Makale Onay Bekliyor',
        satir('Başlık', title) +
        satir('Gönderen', k.claim.entity_name || '—') +
        satir('E-posta', k.email) +
        satir('Kategori', kayit.category) +
        satir('Özet', summary) +
        '<p style="margin:16px 0 0;"><a href="https://www.hekimhane.com.tr/admin" style="color:#1B3A69;font-weight:700;">Admin → Makaleler</a></p>'),
    });

    return NextResponse.json({ ok: true, id: data?.id, slug: data?.slug });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── PUT: kendi bekleyen/reddedilen makalesini düzenle (yeniden onaya girer) ── */
export async function PUT(request: NextRequest) {
  try {
    const k = await yazarKimligi(request);
    if ('hata' in k) return NextResponse.json({ error: k.hata }, { status: k.kod });

    const b = await request.json();
    const id = String(b.id || '');
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

    const { data: mevcut } = await (k.admin as any)
      .from('blog_posts').select('id,author_email,status').eq('id', id).maybeSingle();

    if (!mevcut || mevcut.author_email !== k.email) {
      return NextResponse.json({ error: 'Bu makaleyi düzenleme yetkiniz yok.' }, { status: 403 });
    }
    if (mevcut.status === 'published') {
      return NextResponse.json({ error: 'Yayındaki makaleyi değiştirmek için bizimle iletişime geçin.' }, { status: 403 });
    }

    const title    = String(b.title    || '').trim().slice(0, 160);
    const summary  = String(b.summary  || '').trim().slice(0, 400);
    const content  = String(b.content  || '').trim().slice(0, 40000);
    const category = String(b.category || '').trim().slice(0, 60);

    if (title.length < 10)   return NextResponse.json({ error: 'Başlık en az 10 karakter olmalı.' }, { status: 400 });
    if (summary.length < 40) return NextResponse.json({ error: 'Özet en az 40 karakter olmalı.' }, { status: 400 });
    if (!icerikGecerli(content)) return NextResponse.json({ error: 'Makale metni en az 300 karakter olmalı.' }, { status: 400 });

    const { error } = await (k.admin as any).from('blog_posts').update({
      title, summary, content, category: category || 'Diş Sağlığı',
      cover_image: String(b.cover_image || '').trim().slice(0, 500) || null,
      website: String(b.website || '').trim().slice(0, 200) || null,
      okuma_dk: okumaSuresi(content),
      status: 'pending', published: false, red_notu: null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) {
      if (kolonYok(error.message)) return NextResponse.json({ error: MIGRATION_UYARISI }, { status: 500 });
      return NextResponse.json({ error: 'Güncellenemedi.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── DELETE: kendi yayınlanmamış makalesini sil ── */
export async function DELETE(request: NextRequest) {
  try {
    const k = await yazarKimligi(request);
    if ('hata' in k) return NextResponse.json({ error: k.hata }, { status: k.kod });

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

    const { data: mevcut } = await (k.admin as any)
      .from('blog_posts').select('id,author_email,status').eq('id', id).maybeSingle();

    if (!mevcut || mevcut.author_email !== k.email) {
      return NextResponse.json({ error: 'Bu makaleyi silme yetkiniz yok.' }, { status: 403 });
    }
    if (mevcut.status === 'published') {
      return NextResponse.json({ error: 'Yayındaki makale silinemez.' }, { status: 403 });
    }

    const { error } = await (k.admin as any).from('blog_posts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Silinemedi.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
