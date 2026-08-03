import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';
import { makaleSlug, okumaSuresi, icerikGecerli } from '@/lib/makale-icerik';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const SITE = 'https://www.hekimhane.com.tr';

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

async function adminMi(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  return session?.user?.email === ADMIN_EMAIL;
}

const SELECT = 'id,title,slug,summary,category,content,cover_image,author,author_email,entity_name,website,sponsorlu,kaynak,status,published,red_notu,okuma_dk,views,created_at,show_homepage';
const kolonYok = (msg?: string) =>
  /column .* does not exist|could not find|schema cache/i.test(msg || '');
const MIGRATION_UYARISI =
  'Makale kolonları veritabanında yok. Supabase SQL Editor\'da "add_makale_gonderim.sql" migration\'ını çalıştırın.';

/* ── GET: tüm makaleler (onay kuyruğu dahil) ── */
export async function GET(request: NextRequest) {
  try {
    if (!await adminMi(request)) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const admin = adminClient();
    const { data, error } = await (admin as any)
      .from('blog_posts').select(SELECT).order('created_at', { ascending: false }).limit(300);

    if (error) {
      if (kolonYok(error.message)) {
        // Migration yoksa en azından temel listeyi göster
        const { data: basit } = await (admin as any)
          .from('blog_posts')
          .select('id,title,slug,summary,category,content,cover_image,author,published,views,created_at')
          .order('created_at', { ascending: false }).limit(300);
        return NextResponse.json({ makaleler: basit || [], migrationGerekli: true });
      }
      return NextResponse.json({ error: 'Liste alınamadı' }, { status: 500 });
    }
    return NextResponse.json({ makaleler: data || [] });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── POST: admin yeni makale yazar → doğrudan yayına girer ── */
export async function POST(request: NextRequest) {
  try {
    if (!await adminMi(request)) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const b = await request.json();
    const title    = String(b.title    || '').trim().slice(0, 160);
    const summary  = String(b.summary  || '').trim().slice(0, 400);
    const content  = String(b.content  || '').trim().slice(0, 40000);
    const category = String(b.category || '').trim().slice(0, 60) || 'Diş Sağlığı';
    const author   = String(b.author   || '').trim().slice(0, 120) || 'Hekimhane Editör';

    if (title.length < 10)   return NextResponse.json({ error: 'Başlık en az 10 karakter olmalı.' }, { status: 400 });
    if (summary.length < 40) return NextResponse.json({ error: 'Özet en az 40 karakter olmalı.' }, { status: 400 });
    if (!icerikGecerli(content)) return NextResponse.json({ error: 'Makale metni en az 300 karakter olmalı.' }, { status: 400 });

    const admin = adminClient();
    let slug = String(b.slug || '').trim() || makaleSlug(title) || `makale-${Date.now()}`;
    slug = makaleSlug(slug);
    const { data: mevcut } = await (admin as any).from('blog_posts').select('id').eq('slug', slug).maybeSingle();
    if (mevcut) slug = `${slug}-${Math.floor(Date.now() / 1000) % 100000}`;

    const taslak = b.taslak === true;
    const tam = {
      title, slug, summary, content, category, author,
      cover_image: String(b.cover_image || '').trim().slice(0, 500) || null,
      website: String(b.website || '').trim().slice(0, 200) || null,
      sponsorlu: b.sponsorlu === true,
      published: !taslak,
      status: taslak ? 'pending' : 'published',
      okuma_dk: okumaSuresi(content),
      kaynak: 'admin',
      author_email: ADMIN_EMAIL,
    };

    let { data, error } = await (admin as any).from('blog_posts').insert(tam).select('id,slug').single();

    // Migration çalışmadıysa yeni kolonlar olmadan yaz — yazı kaybolmasın
    if (error && kolonYok(error.message)) {
      const { title: t, slug: s, summary: su, content: c, category: ca, author: a, cover_image: ci, published: p } = tam;
      const r = await (admin as any).from('blog_posts')
        .insert({ title: t, slug: s, summary: su, content: c, category: ca, author: a, cover_image: ci, published: p })
        .select('id,slug').single();
      data = r.data; error = r.error;
    }

    if (error) {
      console.error('admin/makale POST:', error.message);
      return NextResponse.json({ error: 'Makale kaydedilemedi.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data?.id, slug: data?.slug });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── PATCH: onayla / reddet / gizle / yayınla / sil ── */
export async function PATCH(request: NextRequest) {
  try {
    if (!await adminMi(request)) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const b = await request.json();
    const id = String(b.id || '');
    const action = String(b.action || '') as 'approve' | 'reject' | 'hide' | 'publish' | 'delete' | 'homepage';
    const not = String(b.not || '').trim().slice(0, 500);
    const bildir = b.bildir !== false;   // varsayılan: yazara mail at

    if (!id || !action) return NextResponse.json({ error: 'id ve action zorunlu' }, { status: 400 });

    const admin = adminClient();
    const { data: post } = await (admin as any)
      .from('blog_posts').select('id,title,slug,author_email,entity_name').eq('id', id).maybeSingle();
    if (!post) return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 });

    if (action === 'delete') {
      const { error } = await (admin as any).from('blog_posts').delete().eq('id', id);
      if (error) return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // Anasayfada öne çıkar / kaldır (admin curation)
    if (action === 'homepage') {
      const { error } = await (admin as any).from('blog_posts').update({ show_homepage: b.value === true }).eq('id', id);
      if (error) {
        if (kolonYok(error.message)) return NextResponse.json({ error: 'show_homepage kolonu yok — add_makale_placement.sql çalıştırın.' }, { status: 500 });
        return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    const yama =
      action === 'approve' || action === 'publish'
        ? { status: 'published', published: true,  red_notu: null }
        : action === 'reject'
        ? { status: 'rejected',  published: false, red_notu: not || null }
        : { status: 'pending',   published: false };   // hide

    const { error } = await (admin as any).from('blog_posts').update(yama).eq('id', id);
    if (error) {
      if (kolonYok(error.message)) {
        // status kolonu yoksa en azından yayın durumunu değiştir
        const { error: e2 } = await (admin as any).from('blog_posts')
          .update({ published: yama.published }).eq('id', id);
        if (e2) return NextResponse.json({ error: MIGRATION_UYARISI }, { status: 500 });
        return NextResponse.json({ ok: true, migrationGerekli: true });
      }
      return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
    }

    // Yazara bildirim (admin kendi yazısıysa gönderme)
    if (bildir && post.author_email && post.author_email !== ADMIN_EMAIL && (action === 'approve' || action === 'reject')) {
      const yayinda = action === 'approve';
      await sendEmail({
        to: post.author_email,
        subject: yayinda ? `Makaleniz yayında — ${post.title}` : `Makaleniz hakkında — ${post.title}`,
        replyTo: ADMIN_EMAIL,
        html: mailShell(yayinda ? 'Makaleniz Yayınlandı' : 'Makaleniz Yayınlanmadı',
          yayinda
            ? `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;"><strong>${post.title}</strong> başlıklı makaleniz incelendi ve Hekimhane blogunda yayına alındı.</p>` +
              `<p style="margin:14px 0 0;"><a href="${SITE}/blog/${post.slug}" style="color:#1B3A69;font-weight:700;">Makaleyi görüntüle</a></p>`
            : `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;"><strong>${post.title}</strong> başlıklı makaleniz şu haliyle yayınlanmadı.</p>` +
              (not ? satir('Gerekçe', not) : '') +
              '<p style="font-size:13px;color:#6E6E73;line-height:1.7;margin-top:12px;">Panelinizdeki <strong>Makalelerim</strong> sekmesinden düzenleyip yeniden gönderebilirsiniz.</p>'),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
