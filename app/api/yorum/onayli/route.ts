import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { yorumTokeniCoz, talepYorumDurumu, ONAYLI_YORUM_TURU } from '@/lib/onayli-yorum';
import { sendEmail, mailShell, satir } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } });

// POST { t, rating, text, name } — onaylı yorum kaydı. Kimlik = imzalı bağlantı.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  const talepId = yorumTokeniCoz(body?.t);
  if (!talepId) return NextResponse.json({ error: 'Değerlendirme bağlantısı geçersiz ya da süresi dolmuş.' }, { status: 400 });

  const rating = Number(body?.rating);
  const text = String(body?.text || '').trim();
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: 'Lütfen 1–5 arası bir puan seçin.' }, { status: 400 });
  if (text.length < 10) return NextResponse.json({ error: 'Lütfen deneyiminizi en az birkaç cümleyle anlatın.' }, { status: 400 });

  const db = admin();
  const d = await talepYorumDurumu(db, talepId);
  if (d.durum === 'yok') return NextResponse.json({ error: 'Randevu kaydı bulunamadı.' }, { status: 404 });
  if (d.durum === 'tamamlanmadi') return NextResponse.json({ error: 'Bu randevu henüz tamamlanmış görünmüyor.' }, { status: 409 });
  if (d.durum === 'yazildi') return NextResponse.json({ error: 'Bu randevu için değerlendirmeniz zaten alındı. Teşekkürler.' }, { status: 409 });
  const t = d.talep;

  const ad = String(body?.name || t.ad_soyad || '').trim().slice(0, 100) || 'Hekimhane hastası';
  const simdi = new Date();
  // Önce talebi "kullanıldı" işaretle, sonra yorumu yaz; yorum yazılamazsa işaret geri alınır.
  const { data: isaret, error: iErr } = await (db as any).from('cekim_talepleri').insert({
    isletme_turu: ONAYLI_YORUM_TURU, notlar: talepId, durum: 'tamamlandi',
    entity_id: String(t.entity_id), isletme_adi: t.entity_name, ad_soyad: ad,
    tel: '-',   // tabloda zorunlu; işaret kaydında anlamsız
  }).select('id').single();
  if (iErr) return NextResponse.json({ error: 'Yorum kaydedilemedi, lütfen tekrar deneyin.' }, { status: 500 });

  const { data, error } = await (db as any).from('yorumlar').insert({
    entity_id: String(t.entity_id), entity_type: t.entity_type,
    author: ad, rating, text: text.slice(0, 2000),
    date: simdi.toISOString().slice(0, 7), created_at: simdi.toISOString(),
    verified: true,
  }).select('id').single();
  if (error) {
    await (db as any).from('cekim_talepleri').delete().eq('id', isaret.id);
    return NextResponse.json({ error: 'Yorum kaydedilemedi, lütfen tekrar deneyin.' }, { status: 500 });
  }

  // Bilgi: admin'e kısa bildirim (best-effort)
  try {
    await sendEmail({
      to: 'kemalonurozman@gmail.com', subject: `Onaylı yorum — ${t.entity_name}`,
      html: mailShell('Yeni Onaylı Yorum', satir('İşletme', t.entity_name) + satir('Puan', `${rating} / 5`) + satir('Yazan', ad) + satir('Yorum', text.slice(0, 600))),
    });
  } catch { /* yoksay */ }
  return NextResponse.json({ ok: true, id: data.id });
}
