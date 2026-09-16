import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { kartSlugify, kartSlugTemel, kisalt, bos, entityKartAlanlari } from '@/lib/hekimkart';

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

function rand4() { return Math.random().toString(36).slice(2, 6); }

/** En fazla kaç eski adres saklanır (yönlendirme zinciri sonsuz büyümesin). */
const MAX_ESKI_SLUG = 20;

/** İşletme tabloları — kart adresi bu slug'larla da çakışmamalı. */
const ENTITY_TABLOLARI = ['klinikler', 'hastaneler', 'doktorlar', 'eczaneler'];
const ENTITY_TABLO: Record<string, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};

/**
 * Profildekiyle **birebir aynı** olan kart alanlarını boşaltır.
 *
 * Panel formu kartı açarken alanları işletme profilinden ön-doldurur; bunlar
 * olduğu gibi kaydedilseydi kart o anın fotoğrafını dondurur, profil sonradan
 * güncellendiğinde kart eski bilgiyi göstermeye devam ederdi. Boş kaydedilen
 * alan kart sayfasında profilden okunur → profil güncellenince kart da güncellenir.
 * Kullanıcı bir alanı profilden FARKLI yazdıysa o değer korunur.
 */
async function profildenDevralinanlariBosalt(
  admin: any, fields: Record<string, unknown>, entityType: unknown, entityId: unknown,
) {
  const tablo = ENTITY_TABLO[String(entityType || '')];
  if (!tablo || !entityId) return;
  let satir: any = null;
  try {
    const { data } = await admin.from(tablo).select('*').eq('id', String(entityId)).maybeSingle();
    satir = data;
  } catch { return; }
  if (!satir) return;

  const profil = entityKartAlanlari(satir);
  for (const [alan, deger] of Object.entries(profil)) {
    if (bos(deger) || !(alan in fields)) continue;
    if (String(fields[alan] ?? '').trim() === String(deger).trim()) fields[alan] = '';
  }
}

/**
 * Bu adres başka biri tarafından tutuluyor mu?
 *
 * Üç şey kontrol edilir:
 *  1. Başka bir kartın **güncel** adresi,
 *  2. Başka bir kartın **eski** adresi — yönlendirme için ayrılmıştır; serbest
 *     bırakılırsa o kartın basılı QR kodları yabancı bir karta düşer,
 *  3. Başka bir işletmenin slug'ı — `/kart/<işletme-slug>` o işletmenin
 *     otomatik kartını açar; aynı adresi bir kart alırsa o işletmenin
 *     kartvizit bağlantısı yabancı bir kişiyi gösterir.
 *
 * Dönen değer: null = müsait, aksi halde kısa sebep.
 */
async function adresSahibi(
  admin: any, slug: string, kartId: string | null, entityId: string | null,
): Promise<'kart' | 'gecmis' | 'isletme' | null> {
  const q = admin.from('hekimkartlar').select('id').eq('slug', slug);
  if (kartId) q.neq('id', kartId);
  const { data: kart } = await q.limit(1).maybeSingle();
  if (kart) return 'kart';

  try {
    const g = admin.from('hekimkartlar').select('id').contains('eski_sluglar', [slug]);
    if (kartId) g.neq('id', kartId);
    const { data: gecmis } = await g.limit(1).maybeSingle();
    if (gecmis) return 'gecmis';
  } catch { /* eski_sluglar kolonu yoksa atla */ }

  for (const t of ENTITY_TABLOLARI) {
    try {
      const { data: e } = await admin.from(t).select('id').eq('slug', slug).limit(1).maybeSingle();
      if (e && String(e.id) !== String(entityId || '')) return 'isletme';
    } catch { /* tablo/kolon sorunu akışı bozmasın */ }
  }
  return null;
}

/** Kullanıcının onaylı sahiplik/yöneticilik kurduğu işletme kimlikleri. */
async function erisilenEntityIdleri(admin: any, email: string): Promise<Set<string>> {
  try {
    const { data } = await admin
      .from('claim_requests')
      .select('entity_id')
      .eq('email', email)
      .eq('status', 'approved')
      .not('entity_id', 'is', null);
    return new Set(((data as any[]) || []).map(c => String(c.entity_id)));
  } catch {
    return new Set<string>();
  }
}

/* ── GET: kullanıcının erişebildiği tüm kartlar ──
   Kendi oluşturdukları + onaylı sahipliği olan işletmelerin kartları.
   İkincisi olmadan aynı işletmenin ikinci sahibi "kart yok" görüp
   mükerrer kart oluşturuyor, iki farklı adres ortaya çıkıyordu. */
export async function GET(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

  const email = session.user.email!;
  const admin = adminClient();

  const { data: kendi } = await (admin as any)
    .from('hekimkartlar')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: true });

  const liste: any[] = [...((kendi as any[]) || [])];

  const erisim = await erisilenEntityIdleri(admin, email);
  const eksik = Array.from(erisim).filter(id => !liste.some(k => String(k.entity_id) === id));
  if (eksik.length) {
    const { data: ortak } = await (admin as any)
      .from('hekimkartlar')
      .select('*')
      .in('entity_id', eksik);
    for (const k of ((ortak as any[]) || [])) {
      // Kartı başkası oluşturmuş olabilir; panelde düzenlenebilir ama bilgi verilir.
      liste.push({ ...k, baskasinin_karti: k.user_email !== email });
    }
  }

  return NextResponse.json({ kartlar: liste });
}

/* ── POST: kart oluştur veya güncelle ── */
export async function POST(request: NextRequest) {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

  const body = await request.json();
  const email = session.user.email!;
  const admin = adminClient();
  const erisim = await erisilenEntityIdleri(admin, email);

  const ALLOWED = ['ad', 'soyad', 'unvan', 'spec', 'tel', 'instagram_url', 'facebook_url',
                   'photo_url', 'il', 'ilce', 'clinic_name', 'bio', 'slug',
                   'entity_id', 'entity_type', 'iban',
                   'rezervasyon_url', 'website_url', 'maps_url', 'hekimhane_url'] as const;

  const fields: Record<string, unknown> = { user_email: email, updated_at: new Date().toISOString() };
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key] ?? '';
  }

  // ── Hangi satır güncellenecek? ────────────────────────────────────────
  // 1) Gövdedeki id  2) aynı işletmenin mevcut kartı (kim oluşturmuş olursa
  // olsun) — ikisi de yoksa yeni kart.
  let mevcut: any = null;
  if (typeof body.id === 'string' && body.id) {
    const { data } = await (admin as any).from('hekimkartlar').select('*').eq('id', body.id).maybeSingle();
    mevcut = data || null;
    if (!mevcut) return NextResponse.json({ error: 'Kart bulunamadı.' }, { status: 404 });
  } else if (body.entity_id) {
    const { data } = await (admin as any)
      .from('hekimkartlar').select('*').eq('entity_id', String(body.entity_id)).limit(1).maybeSingle();
    mevcut = data || null;
  }

  // ── Yetki ─────────────────────────────────────────────────────────────
  if (mevcut) {
    const sahip = mevcut.user_email === email;
    const isletmeYetkisi = mevcut.entity_id && erisim.has(String(mevcut.entity_id));
    if (!sahip && !isletmeYetkisi) {
      return NextResponse.json({ error: 'Bu kartı düzenleme yetkiniz yok.' }, { status: 403 });
    }
    // Kartı başkası oluşturduysa sahiplik satırı değişmesin
    if (!sahip) delete fields.user_email;
  } else if (body.entity_id && !erisim.has(String(body.entity_id))) {
    return NextResponse.json(
      { error: 'Bu işletme için kart oluşturma yetkiniz yok (onaylı sahiplik gerekli).' }, { status: 403 });
  }

  // ── Adres (slug) ──────────────────────────────────────────────────────
  // Varsayılan: kişinin tam adı. Rastgele ek yalnızca çakışmada.
  const istenen = String(fields.slug ?? '').trim();
  if (istenen) {
    fields.slug = kisalt(kartSlugify(istenen));
  } else if (mevcut?.slug) {
    fields.slug = mevcut.slug;                       // boş gönderildiyse adres korunur
  } else {
    fields.slug = kartSlugTemel(String(body.ad || ''), String(body.soyad || ''));
  }
  if (!fields.slug) fields.slug = `kart-${rand4()}`;

  // Adres müsait mi? Kullanıcı adresi ELLE yazdıysa sessizce değiştirmek
  // yanıltıcı olur (paylaşacağı adres başka çıkar) → net hata döndürülür.
  // Otomatik üretilen adreste ek koyup devam edilir.
  const entityIdStr = fields.entity_id ? String(fields.entity_id) : (mevcut?.entity_id ? String(mevcut.entity_id) : null);
  // Adres değişmiyorsa hiç sorgulama: mevcut adres sonradan bir işletme slug'ı
  // ile çakışmış olsa bile sahibi kendi kartını kaydedememezlik etmesin.
  const adresDegisti = !mevcut || String(fields.slug) !== mevcut.slug;
  let sahip = adresDegisti
    ? await adresSahibi(admin, String(fields.slug), mevcut?.id || null, entityIdStr)
    : null;
  if (sahip && istenen) {
    const mesaj = sahip === 'gecmis'
      ? 'Bu adres daha önce başka bir kartın adresiydi ve eski bağlantıları yönlendirmek için ayrılmış durumda. Lütfen farklı bir adres seçin.'
      : sahip === 'isletme'
        ? 'Bu adres Hekimhane\'deki başka bir işletmenin sayfa adresiyle aynı. Lütfen farklı bir adres seçin.'
        : 'Bu kart adresi kullanımda. Lütfen farklı bir adres seçin.';
    return NextResponse.json({ error: mesaj, adresCakismasi: sahip }, { status: 409 });
  }
  for (let i = 0; sahip && i < 5; i++) {
    fields.slug = `${kisalt(String(fields.slug))}-${rand4()}`;
    sahip = await adresSahibi(admin, String(fields.slug), mevcut?.id || null, entityIdStr);
  }

  // ── Adres geçmişi ─────────────────────────────────────────────────────
  // Adres değiştiyse eskisi saklanır; /kart/<eski> yeni adrese yönlenir.
  const slugDegisti = !!(mevcut?.slug && mevcut.slug !== fields.slug);
  if (slugDegisti) {
    const gecmis: string[] = Array.isArray(mevcut.eski_sluglar) ? mevcut.eski_sluglar : [];
    fields.eski_sluglar = Array.from(new Set([...gecmis, mevcut.slug]))
      .filter(s => s && s !== fields.slug)
      .slice(-MAX_ESKI_SLUG);
  } else if (mevcut && Array.isArray(mevcut.eski_sluglar)) {
    // Adres eski bir adrese geri döndüyse o kaydı listeden çıkar (kendine yönlendirme olmasın)
    const temiz = mevcut.eski_sluglar.filter((s: string) => s !== fields.slug);
    if (temiz.length !== mevcut.eski_sluglar.length) fields.eski_sluglar = temiz;
  }

  // Profilden gelen ve kullanıcının değiştirmediği alanlar boş kaydedilir →
  // kart sayfası onları profilden canlı okur (profil değişince kart da değişir).
  await profildenDevralinanlariBosalt(
    admin, fields,
    fields.entity_type ?? mevcut?.entity_type,
    fields.entity_id ?? mevcut?.entity_id,
  );

  async function saveFields(f: Record<string, unknown>) {
    if (mevcut?.id) {
      return (admin as any)
        .from('hekimkartlar').update(f).eq('id', mevcut.id).select().single();
    }
    return (admin as any)
      .from('hekimkartlar').insert(f).select().single();
  }

  let { data, error } = await saveFields(fields);

  // Kolon henüz Supabase'de yoksa sırasıyla kaldır ve tekrar dene
  const unknownCols = ['eski_sluglar', 'iban', 'rezervasyon_url', 'website_url', 'maps_url',
                       'hekimhane_url', 'entity_id', 'entity_type'];
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

  return NextResponse.json({
    kart: data,
    slugDegisti,
    eskiSlug: slugDegisti ? mevcut.slug : null,
  });
}
