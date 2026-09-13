import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { anahtarlar, anahtarUret, sahipIsletmeleri, MAKS_ANAHTAR, type AnahtarKaydi } from '@/lib/mcp/anahtar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Panel → MCP Bağlantısı: kişisel MCP anahtarlarını listele / üret / iptal et.
 * Yalnız çerez oturumu (MCP'nin kendisi anahtar üretemez). Üretim Pro şartına bağlı.
 * Anahtarın açık hali YALNIZ üretim yanıtında bir kez döner; listede asla yok.
 */

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

async function kullanici(request: NextRequest) {
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } });
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user?.id || !session.user.email) return null;
  const { data } = await admin().auth.admin.getUserById(session.user.id);
  return data?.user || null;
}

const disa = (k: AnahtarKaydi) => ({ id: k.id, ad: k.ad, onek: k.onek, olusturma: k.olusturma, son_kullanim: k.son_kullanim });

export async function GET(request: NextRequest) {
  const u = await kullanici(request);
  if (!u) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const isletmeler = await sahipIsletmeleri(admin(), u.email!);
  return NextResponse.json({
    pro: isletmeler.some(i => i.premium),
    anahtarlar: anahtarlar(u.app_metadata).map(disa),
    maks: MAKS_ANAHTAR,
  });
}

export async function POST(request: NextRequest) {
  const u = await kullanici(request);
  if (!u) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const isletmeler = await sahipIsletmeleri(admin(), u.email!);
  if (!isletmeler.some(i => i.premium)) {
    return NextResponse.json({ error: 'MCP bağlantısı Hekimhane-Pro üyeliğine dahildir.' }, { status: 403 });
  }
  const mevcut = anahtarlar(u.app_metadata);
  if (mevcut.length >= MAKS_ANAHTAR) {
    return NextResponse.json({ error: `En fazla ${MAKS_ANAHTAR} anahtar oluşturabilirsiniz; kullanmadığınız birini iptal edin.` }, { status: 400 });
  }
  const { ad } = await request.json().catch(() => ({}));
  const temizAd = String(ad || '').replace(/[<>]/g, '').trim().slice(0, 40) || `Anahtar ${mevcut.length + 1}`;
  const { token, kayit } = anahtarUret(u.id);
  const yeni: AnahtarKaydi = { ...kayit, ad: temizAd };
  const { error } = await admin().auth.admin.updateUserById(u.id, {
    app_metadata: { ...u.app_metadata, mcp_anahtarlari: [...mevcut, yeni] },
  });
  if (error) return NextResponse.json({ error: 'Anahtar kaydedilemedi.' }, { status: 500 });
  return NextResponse.json({ anahtar: token, kayit: disa(yeni) });
}

export async function DELETE(request: NextRequest) {
  const u = await kullanici(request);
  if (!u) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  const mevcut = anahtarlar(u.app_metadata);
  if (!mevcut.some(k => k.id === id)) return NextResponse.json({ error: 'Anahtar bulunamadı.' }, { status: 404 });
  const { error } = await admin().auth.admin.updateUserById(u.id, {
    app_metadata: { ...u.app_metadata, mcp_anahtarlari: mevcut.filter(k => k.id !== id) },
  });
  if (error) return NextResponse.json({ error: 'İptal edilemedi.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
