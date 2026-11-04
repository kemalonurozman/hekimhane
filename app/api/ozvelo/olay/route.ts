import { NextResponse, type NextRequest } from 'next/server';
import { disKimlikCoz, imzaDogrula, ozveloAcik } from '@/lib/ozvelo/ayar';
import { baglantiOku, ozveloIstemcisi, TABLO, tabloYok } from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor

/*
 * Ozvelo → Hekimhane olay bildirimi. Asistanın aldığı randevu talepleri Hekimhane
 * panelindeki "Randevu Talepleri"ne düşer; hekim onaylar/reddederse durum da yansır.
 *
 * Gövde: { olay_id, tur, dis_kimlik, veri }   Başlık: X-Ozvelo-Imza: t=<sn>,v1=<hex>
 * Her olay_id bir kez işlenir (tekrar gönderim güvenli). Bilinmeyen tür → 200 + yoksayildi.
 * Bildirim e-postası GÖNDERİLMEZ: hekime WhatsApp/e-posta bildirimini Ozvelo zaten atıyor.
 * Sözleşme: docs/ozvelo-partner-baglantisi.md
 */

const DURUM_ESLEME: Record<string, string> = {
  onaylandi: 'arandi',      // Hekimhane'de "onaylandı" yok; en yakın karşılık hastayla iletişime geçildi
  reddedildi: 'iptal',
  iptal: 'iptal',
  tamamlandi: 'tamamlandi',
};

const kisalt = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);
const ISLETME_TABLO: Record<string, string> = { klinik: 'klinikler', doktor: 'doktorlar' };

export async function POST(request: NextRequest) {
  const ham = await request.text();
  if (!ozveloAcik()) return NextResponse.json({ error: 'Bağlantı kapalı' }, { status: 503 });
  if (!imzaDogrula('hk-ozvelo-olay', request.headers.get('x-ozvelo-imza'), ham)) {
    return NextResponse.json({ error: 'İmza geçersiz' }, { status: 401 });
  }

  let olay: any;
  try { olay = JSON.parse(ham); } catch { return NextResponse.json({ error: 'Gövde JSON değil' }, { status: 400 }); }
  const olayId = kisalt(olay?.olay_id, 120);
  const tur = kisalt(olay?.tur, 60);
  const dk = disKimlikCoz(olay?.dis_kimlik);
  const veri = olay?.veri && typeof olay.veri === 'object' ? olay.veri : {};
  if (!olayId || !tur || !dk) return NextResponse.json({ error: 'olay_id, tur ve dis_kimlik gerekli' }, { status: 400 });

  const db = ozveloIstemcisi() as any;
  const { baglanti, tabloVar } = await baglantiOku(db, dk.tur, dk.id);
  if (!tabloVar) return NextResponse.json({ error: 'Bağlantı tablosu kurulmamış' }, { status: 503 });
  if (!baglanti) return NextResponse.json({ error: 'Bu işletmenin asistanı Hekimhane\'de etkin değil' }, { status: 404 });

  // Ozvelo tarafı işletmeyi kapattıysa (deneme bitti, hesap silindi…) Hekimhane de kapalı işaretler
  if (tur === 'isletme.kapatildi') {
    await db.from(TABLO).update({ durum: 'kapali', son_ozet: null, sonraki_deneme_at: null, son_hata: null, updated_at: new Date().toISOString() }).eq('id', baglanti.id);
    return NextResponse.json({ ok: true });
  }
  if (tur !== 'randevu.olusturuldu' && tur !== 'randevu.durum') return NextResponse.json({ ok: true, yoksayildi: true });
  if (baglanti.durum === 'kapali') return NextResponse.json({ error: 'Bu işletmenin asistanı kapalı' }, { status: 409 });

  const talepId = kisalt(veri.talep_id, 120);
  if (!talepId) return NextResponse.json({ error: 'veri.talep_id gerekli' }, { status: 400 });

  // Tekrar gönderim: aynı olay ikinci kez işlenmez
  const { error: kayitHata } = await db.from('ozvelo_olaylari').insert({ olay_id: olayId, tur, dis_kimlik: baglanti.dis_kimlik, ozvelo_talep_id: talepId });
  if (kayitHata) {
    if (/duplicate|23505/i.test(String(kayitHata.message || kayitHata.code))) return NextResponse.json({ ok: true, tekrar: true });
    if (tabloYok(kayitHata)) return NextResponse.json({ error: 'Olay tablosu kurulmamış' }, { status: 503 });
    return NextResponse.json({ error: 'Olay kaydedilemedi' }, { status: 500 });
  }
  const olayiGeriAl = () => db.from('ozvelo_olaylari').delete().eq('olay_id', olayId);

  if (tur === 'randevu.olusturuldu') {
    const adSoyad = kisalt(veri.ad_soyad, 100);
    const tel = kisalt(veri.tel, 30)?.replace(/[^\d+]/g, '') || null;
    const email = kisalt(veri.email, 150);
    if (!adSoyad || (!tel && !email)) { await olayiGeriAl(); return NextResponse.json({ error: 'ad_soyad ve tel ya da email gerekli' }, { status: 400 }); }

    const { data: isletme } = await db.from(ISLETME_TABLO[dk.tur]).select('*').eq('id', dk.id).maybeSingle();
    if (!isletme) { await olayiGeriAl(); return NextResponse.json({ error: 'İşletme bulunamadı' }, { status: 404 }); }
    const ad = dk.tur === 'doktor' ? [isletme.unvan, isletme.ad, isletme.soyad].filter(Boolean).join(' ') : isletme.name;

    const slot = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(veri.randevu_slot || '')) ? String(veri.randevu_slot) : null;
    const kayit: Record<string, unknown> = {
      entity_type: dk.tur,
      entity_id: dk.id,
      entity_name: String(ad || '').slice(0, 200),
      ad_soyad: adSoyad,
      tel: tel || '-',
      email,
      tercih: ['Yapay zekâ asistanı', kisalt(veri.tercih, 150)].filter(Boolean).join(' · '),
      // Not alanı sağlık verisi içerebilir: Hekimhane formundaki kuralla aynı, yalnız açık rızayla
      mesaj: veri.saglik_rizasi === true ? kisalt(veri.mesaj, 1000) : null,
    };
    let { data: yeni, error } = await db.from('randevu_talepleri').insert(slot ? { ...kayit, randevu_slot: slot } : kayit).select('id').maybeSingle();
    if (error && slot && /randevu_slot/.test(String(error.message))) {
      ({ data: yeni, error } = await db.from('randevu_talepleri').insert(kayit).select('id').maybeSingle());
    }
    if (error || !yeni) { await olayiGeriAl(); return NextResponse.json({ error: 'Randevu talebi kaydedilemedi' }, { status: 500 }); }
    await db.from('ozvelo_olaylari').update({ randevu_talep_id: String(yeni.id) }).eq('olay_id', olayId);
    return NextResponse.json({ ok: true, randevu_talep_id: String(yeni.id) });
  }

  // randevu.durum
  const yeniDurum = DURUM_ESLEME[String(veri.durum || '')];
  if (!yeniDurum) { await olayiGeriAl(); return NextResponse.json({ error: 'Geçersiz durum (onaylandi | reddedildi | iptal | tamamlandi)' }, { status: 400 }); }
  const { data: ilk } = await db.from('ozvelo_olaylari').select('randevu_talep_id')
    .eq('ozvelo_talep_id', talepId).eq('tur', 'randevu.olusturuldu').eq('dis_kimlik', baglanti.dis_kimlik)
    .not('randevu_talep_id', 'is', null).limit(1).maybeSingle();
  if (!ilk?.randevu_talep_id) { await olayiGeriAl(); return NextResponse.json({ error: 'Bu talep Hekimhane\'de bulunamadı' }, { status: 404 }); }
  const { error } = await db.from('randevu_talepleri').update({ status: yeniDurum })
    .eq('id', ilk.randevu_talep_id).eq('entity_id', dk.id).neq('status', 'silindi');
  if (error) { await olayiGeriAl(); return NextResponse.json({ error: 'Durum güncellenemedi' }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
