import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * hekimhane_url'den entity_type + entity_id çöz.
 * Desteklenen URL biçimleri:
 *   /hastaneler/{il}/{ilce}/{slug}
 *   /klinikler/{il}/{ilce}/{slug}
 *   /doktorlar/{slug}
 *   /eczaneler/{slug}
 */
async function resolveEntityFromUrl(
  admin: ReturnType<typeof adminClient>,
  url: string
): Promise<{ entity_id: string; entity_type: string } | null> {
  if (!url) return null;
  const parts = url.replace(/^\//, '').split('/');

  try {
    if (parts[0] === 'hastaneler' && parts.length >= 4) {
      const slug = parts[3];
      const { data } = await (admin as any).from('hastaneler').select('id').eq('slug', slug).single();
      if (data?.id) return { entity_id: String(data.id), entity_type: 'hastane' };
    }
    if (parts[0] === 'klinikler' && parts.length >= 4) {
      const slug = parts[3];
      const { data } = await (admin as any).from('klinikler').select('id').eq('slug', slug).single();
      if (data?.id) return { entity_id: String(data.id), entity_type: 'klinik' };
    }
    if (parts[0] === 'doktorlar' && parts.length >= 2) {
      const slug = parts[1];
      const { data } = await (admin as any).from('doktorlar').select('id').eq('slug', slug).single();
      if (data?.id) return { entity_id: String(data.id), entity_type: 'doktor' };
    }
    if (parts[0] === 'eczaneler' && parts.length >= 2) {
      const slug = parts[1];
      const { data } = await (admin as any).from('eczaneler').select('id').eq('slug', slug).single();
      if (data?.id) return { entity_id: String(data.id), entity_type: 'eczane' };
    }
  } catch { /* sessizce geç */ }
  return null;
}

/* ── POST: yorum kaydet (auth gerekmez — herkese açık) ── */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const { entity_id, entity_type, hekimhane_url: bodyHekimhaneUrl, slug, name, rating, text, date } = body as {
    entity_id?: string | null;
    entity_type?: string | null;
    hekimhane_url?: string | null;
    slug?: string;
    name?: string;
    rating?: number;
    text?: string;
    date?: string;
  };

  // Zorunlu alanlar
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geçerli bir puan seçin (1–5).' }, { status: 400 });
  }
  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Yorum metni boş olamaz.' }, { status: 400 });
  }

  const admin = adminClient();

  let resolvedEntityId   = (entity_id   && String(entity_id).trim())   || null;
  let resolvedEntityType = (entity_type && String(entity_type).trim())  || null;

  // 1. Öncelik: body'deki hekimhane_url (sunucu tarafında zaten doğru çözülmüş)
  if ((!resolvedEntityId || !resolvedEntityType) && bodyHekimhaneUrl) {
    const fromBodyUrl = await resolveEntityFromUrl(admin, bodyHekimhaneUrl);
    if (fromBodyUrl) {
      resolvedEntityId   = fromBodyUrl.entity_id;
      resolvedEntityType = fromBodyUrl.entity_type;
    }
  }

  // 2. Hâlâ eksikse — kart'tan bul (entity_id / entity_type / hekimhane_url sütunları)
  if ((!resolvedEntityId || !resolvedEntityType) && slug) {
    try {
      const { data: kart } = await (admin as any)
        .from('hekimkartlar')
        .select('entity_id, entity_type, hekimhane_url')
        .eq('slug', slug)
        .single();

      if (kart) {
        if (kart.entity_id)   resolvedEntityId   = String(kart.entity_id);
        if (kart.entity_type) resolvedEntityType = String(kart.entity_type);

        if ((!resolvedEntityId || !resolvedEntityType) && kart.hekimhane_url) {
          const fromUrl = await resolveEntityFromUrl(admin, kart.hekimhane_url);
          if (fromUrl) {
            resolvedEntityId   = fromUrl.entity_id;
            resolvedEntityType = fromUrl.entity_type;
          }
        }
      }
    } catch { /* hekimkartlar'da sütun yoksa veya kart bulunamazsa sessizce geç */ }
  }

  // Son çare: kart slug'ını entity_id olarak kullan
  // (bu yorumlar profil sayfasında görünmeyecek ama kaydedilsin)
  if (!resolvedEntityId) {
    resolvedEntityId   = slug || 'unknown';
    resolvedEntityType = resolvedEntityType || 'kart';
  }

  const { data, error } = await (admin as any)
    .from('yorumlar')
    .insert({
      entity_id:   resolvedEntityId,
      entity_type: resolvedEntityType,
      author:      (name || 'Anonim').slice(0, 100),
      rating:      Number(rating),
      text:        text.trim().slice(0, 2000),
      date:        (date || new Date().toISOString().slice(0, 7)).slice(0, 10),
      created_at:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('yorum insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
