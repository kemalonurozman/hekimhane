// ─────────────────────────────────────────────────────────────────
//  Panel → Yorumlar: hastaya e-postayla yorum daveti + ofis posteri bilgisi.
//
//  GET  ?entity_id=&entity_type=  → { ad, kurum, yorumUrl, davetler[], bugun, gunlukMax }
//  POST { entity_id, entity_type, adresler, not, onay } → her adrese ayrı e-posta
//
//  Yetki: onaylı erişim (sahip/yönetici) ya da 'yorumlar' yetkili asistan.
//  E-posta Hekimhane adresinden gider; görünen ad hekimin adı, replyTo panel
//  kullanıcısı. Davetler DDL'siz `cekim_talepleri`'ne `isletme_turu='yorum-daveti'`
//  ile yazılır (sınır + 30 günlük tekrar kontrolü + panel geçmişi). Admin talep
//  listesi bu satırları göstermez.
// ─────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { panelOturum } from '@/lib/panel-oturum';
import { yetkiliEntityIdleri } from '@/lib/erisim';
import { sendEmail, mailShell, esc } from '@/lib/email';
import {
  YORUM_DAVETI_TURU, DAVET_TEK_SEFER_MAX, DAVET_GUNLUK_MAX, DAVET_TEKRAR_GUN, DAVET_NOT_MAX,
  davetAdresleri, davetKonusu,
} from '@/lib/yorum-daveti';

export const dynamic = 'force-dynamic';

const SITE = 'https://www.hekimhane.com.tr';
const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  ) as any;
}

/** İşletmenin görünen adı, kurumu ve kartın yorum adresi. Yetki ve varlık kontrolü dahil. */
async function isletmeCoz(request: NextRequest, entityId: string, entityType: string) {
  const session = await panelOturum(request);
  if (!session?.user?.email) return { hata: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) };
  const tablo = TABLO[entityType];
  if (!entityId || !tablo) return { hata: NextResponse.json({ error: 'İşletme bilgisi eksik' }, { status: 400 }) };

  const admin = adminClient();
  const ids = await yetkiliEntityIdleri(admin, session.user.email, ['yorumlar']);
  if (!ids.includes(entityId)) return { hata: NextResponse.json({ error: 'Bu işletme üzerinde yetkiniz yok' }, { status: 403 }) };

  const { data: row } = await admin.from(tablo).select('*').eq('id', entityId).maybeSingle();
  if (!row) return { hata: NextResponse.json({ error: 'İşletme kaydı bulunamadı' }, { status: 404 }) };

  // Kayıtlı HekimKart varsa adı ve adresi oradan (kart sahibi adını özelleştirmiş olabilir)
  let kart: any = null;
  try {
    const { data } = await admin.from('hekimkartlar').select('slug,ad,soyad,unvan,clinic_name').eq('entity_id', entityId).limit(1).maybeSingle();
    kart = data;
  } catch { /* tablo yoksa işletme slug'ı */ }

  const kisi = (k: any) => [k?.unvan, `${k?.ad || ''} ${k?.soyad || ''}`.trim()].filter(Boolean).join(' ').trim();
  const ad = (kart && kisi(kart)) || (entityType === 'doktor' ? kisi(row) : '') || row.name || '';
  const kurum = (kart?.clinic_name || (entityType === 'doktor' ? row.clinic_name : null)) || null;
  const slug = kart?.slug || row.slug;
  if (!slug) return { hata: NextResponse.json({ error: 'İşletmenin adresi (slug) yok' }, { status: 409 }) };

  return {
    admin, email: session.user.email,
    bilgi: { ad: String(ad).trim(), kurum, yorumUrl: `${SITE}/kart/${slug}?yorum=1` },
  };
}

const gunOnce = (g: number) => new Date(Date.now() - g * 86_400_000).toISOString();

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const r = await isletmeCoz(request, String(sp.get('entity_id') || ''), String(sp.get('entity_type') || ''));
    if ('hata' in r) return r.hata;

    let davetler: { email: string; tarih: string; durum: string }[] = [];
    let bugun = 0;
    try {
      const { data } = await r.admin.from('cekim_talepleri')
        .select('email,created_at,durum')
        .eq('isletme_turu', YORUM_DAVETI_TURU).eq('entity_id', String(sp.get('entity_id')))
        .order('created_at', { ascending: false }).limit(40);
      davetler = ((data || []) as any[]).map(d => ({ email: d.email, tarih: d.created_at, durum: d.durum }));
      const sinir = gunOnce(1);
      bugun = davetler.filter(d => d.tarih >= sinir && d.durum === 'gonderildi').length;
    } catch { /* geçmiş okunamazsa form yine çalışır */ }

    return NextResponse.json({ ...r.bilgi, davetler, bugun, gunlukMax: DAVET_GUNLUK_MAX });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

function davetHtml(ad: string, kurum: string | null, not: string, url: string): string {
  const notBlok = not
    ? `<div style="margin:0 0 18px;padding:14px 16px;background:#F6F8FB;border-left:3px solid #C9A04A;border-radius:10px;font-size:14px;line-height:1.7;color:#1c1c1e;">${esc(not).replace(/\n/g, '<br>')}</div>`
    : '';
  return mailShell('Deneyiminizi değerlendirir misiniz?', `
    <div style="text-align:center;margin:0 0 18px;">
      <div style="font-size:17px;font-weight:700;color:#12294D;">${esc(ad)}</div>
      ${kurum ? `<div style="font-size:13px;color:#6E6E73;margin-top:2px;">${esc(kurum)}</div>` : ''}
      <div style="font-size:24px;letter-spacing:4px;color:#C9A04A;margin-top:10px;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    </div>
    ${notBlok}
    <p style="font-size:14px;line-height:1.7;color:#1c1c1e;margin:0 0 20px;">
      Yorumunuz, <strong>${esc(ad)}</strong> ile ilgili bilgi arayan diğer hastalara yol gösterir. Birkaç dakikanızı alır.
    </p>
    <div style="text-align:center;margin:0 0 20px;">
      <a href="${esc(url)}" style="display:inline-block;background:#12294D;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;">Değerlendirmemi yaz</a>
    </div>
    <p style="font-size:12px;line-height:1.6;color:#6E6E73;margin:0;">
      Bu e-posta <strong>${esc(ad)}</strong>'in isteği üzerine Hekimhane üzerinden gönderildi; yanıtlarsanız doğrudan ${esc(ad)}'e ulaşır.
      Adresiniz yalnız bu davet için kullanıldı, pazarlama listelerine eklenmez.
      Yorumlar yayınlanmadan önce Hekimhane tarafından incelenir.
    </p>`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      entity_id?: string; entity_type?: string; adresler?: string | string[]; not?: string; onay?: boolean;
    };
    const r = await isletmeCoz(request, String(body.entity_id || ''), String(body.entity_type || ''));
    if ('hata' in r) return r.hata;
    if (body.onay !== true) {
      return NextResponse.json({ error: 'Adreslerin, iletişim için size izin veren hastalarınıza ait olduğunu onaylayın.' }, { status: 400 });
    }

    const { gecerli, gecersiz } = davetAdresleri(body.adresler);
    if (gecersiz.length) return NextResponse.json({ error: `Geçersiz adres: ${gecersiz.slice(0, 3).join(', ')}` }, { status: 400 });
    if (!gecerli.length) return NextResponse.json({ error: 'En az bir e-posta adresi yazın.' }, { status: 400 });
    if (gecerli.length > DAVET_TEK_SEFER_MAX) {
      return NextResponse.json({ error: `Tek seferde en fazla ${DAVET_TEK_SEFER_MAX} adres gönderilebilir.` }, { status: 400 });
    }
    const not = String(body.not || '').trim().slice(0, DAVET_NOT_MAX);

    const entityId = String(body.entity_id);
    const { data: gecmis, error: gErr } = await r.admin.from('cekim_talepleri')
      .select('email,created_at,durum')
      .eq('isletme_turu', YORUM_DAVETI_TURU).eq('entity_id', entityId)
      .gte('created_at', gunOnce(DAVET_TEKRAR_GUN));
    if (gErr) return NextResponse.json({ error: 'Davet kaydı okunamadı, lütfen tekrar deneyin.' }, { status: 500 });

    const gonderilmis = ((gecmis || []) as any[]).filter(g => g.durum === 'gonderildi');
    const yakinda = new Set(gonderilmis.map(g => String(g.email || '').toLowerCase()));
    const bugun = gonderilmis.filter(g => g.created_at >= gunOnce(1)).length;

    const atlanan = gecerli.filter(e => yakinda.has(e));
    const hedef = gecerli.filter(e => !yakinda.has(e));
    if (!hedef.length) {
      return NextResponse.json({ error: `Bu adreslere son ${DAVET_TEKRAR_GUN} gün içinde zaten davet gönderildi.`, atlanan }, { status: 409 });
    }
    if (bugun + hedef.length > DAVET_GUNLUK_MAX) {
      return NextResponse.json({ error: `Günlük sınır ${DAVET_GUNLUK_MAX} davet. Bugün ${Math.max(0, DAVET_GUNLUK_MAX - bugun)} davet daha gönderebilirsiniz.` }, { status: 429 });
    }

    const { ad, kurum, yorumUrl } = r.bilgi;
    const url = `${yorumUrl}&utm_source=eposta&utm_medium=yorum-daveti`;
    const html = davetHtml(ad, kurum, not, url);

    const gonderilen: string[] = [];
    const basarisiz: string[] = [];
    for (const e of hedef) {
      const res = await sendEmail({ to: e, subject: davetKonusu(ad), html, replyTo: r.email, fromName: ad });
      if (res.skipped) {
        return NextResponse.json({ error: 'E-posta servisi yapılandırılmamış (RESEND_API_KEY). Yönetici eklemeli.' }, { status: 503 });
      }
      (res.ok ? gonderilen : basarisiz).push(e);
      try {
        await r.admin.from('cekim_talepleri').insert({
          isletme_turu: YORUM_DAVETI_TURU, entity_id: entityId, isletme_adi: ad || entityId,
          ad_soyad: r.email,   // daveti gönderen panel kullanıcısı
          tel: '-',            // tabloda zorunlu; davet kaydında anlamsız
          email: e, durum: res.ok ? 'gonderildi' : 'hata',
        });
      } catch { /* kayıt düşmezse e-posta yine gitmiş olur */ }
    }

    if (!gonderilen.length) return NextResponse.json({ error: 'E-postalar gönderilemedi. Lütfen tekrar deneyin.', basarisiz }, { status: 502 });
    return NextResponse.json({ ok: true, gonderilen, atlanan, basarisiz });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
