import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { onayBekleyenAlanlar, YORUM_ONAY_MESAJI, gecerliYorumcuEposta } from '@/lib/yorum-onay';
import { adminOnayBildir, yorumEkle } from '@/lib/yorum-onay-sunucu';
import { yorumGirdiHatasi, kurallarKabulAlanlari, gelistirmeSuz, YORUM_MAX_KARAKTER } from '@/lib/yorum-kurallari';

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

/* ── POST: yorum kaydet (auth gerekmez — herkese açık). Kayıt ONAY BEKLER: admin onaylamadan yayınlanmaz. ── */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const { entity_id, entity_type, hekimhane_url: bodyHekimhaneUrl, slug, name, rating, text, date, email, gelistirme } = body as {
    entity_id?: string | null;
    entity_type?: string | null;
    hekimhane_url?: string | null;
    slug?: string;
    name?: string;
    rating?: number;
    text?: string;
    date?: string;
    email?: string;
    gelistirme?: unknown;
  };

  // Zorunlu alanlar
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geçerli bir puan seçin (1–5).' }, { status: 400 });
  }
  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Yorum metni boş olamaz.' }, { status: 400 });
  }
  // Yorum Yayınlama Kuralları kabul edilmeden ve kısa metinle yorum alınmaz.
  const girdiHatasi = yorumGirdiHatasi(body);
  if (girdiHatasi) return NextResponse.json({ error: girdiHatasi }, { status: 400 });
  // Yazan kişi belli olsun: e-posta zorunlu (admin belge isteyebilir). Ziyaretçiye gösterilmez.
  const authorEmail = gecerliYorumcuEposta(email) ? String(email).trim().toLowerCase().slice(0, 150) : null;
  if (!authorEmail) {
    return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
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

  const kayit = {
    entity_id:   resolvedEntityId,
    entity_type: resolvedEntityType,
    author:      (name || 'Anonim').slice(0, 100),
    rating:      Number(rating),
    text:        text.trim().slice(0, YORUM_MAX_KARAKTER),
    date:        (date || new Date().toISOString().slice(0, 7)).slice(0, 10),
    created_at:  new Date().toISOString(),
    ...onayBekleyenAlanlar(),   // admin onaylayana kadar gizli
  };
  // Eksik kolon (author_email / kurallar_* / gelistirme) varsa onsuz yeniden dener — yorum yine onay bekler.
  const { data, error } = await yorumEkle(admin, { ...kayit, author_email: authorEmail, ...kurallarKabulAlanlari(gelistirme) });

  if (error) {
    console.error('yorum insert error:', error);
    // Moderasyon kolonları yoksa (add_yorum_moderation.sql çalışmamış) onaysız yayınlamak yerine
    // kaydı reddet — onay olmadan yorum yayınlanmaz (fail-closed).
    const kolonYok = /hidden|report_status|reported_at|column|schema cache/i.test(error.message || '');
    return NextResponse.json({ error: kolonYok ? 'Yorum sistemi şu an bakımda, lütfen daha sonra tekrar deneyin.' : error.message }, { status: kolonYok ? 503 : 500 });
  }

  await adminOnayBildir(admin, { entity_type: String(resolvedEntityType), entity_id: String(resolvedEntityId), author: kayit.author, rating: Number(rating), text: text.trim(), email: authorEmail, gelistirme: gelistirmeSuz(gelistirme) });

  // Yorum döndürülmez: istemci listeye eklemesin — onaylanana kadar kimse görmez.
  return NextResponse.json({ ok: true, id: data?.id ?? null, bekliyor: true, mesaj: YORUM_ONAY_MESAJI });
}
