import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest, ADMIN_EMAIL } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { sendEmail, mailShell, satir } from '@/lib/email';
import { sahipEpostasi } from '@/lib/yonetici';
import { isletmeBilgisi } from '@/lib/entity-link';

export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c));
type Aksiyon = 'hide' | 'delete' | 'dismiss' | 'unhide';

// İşletmeye giden karar metni — e-posta konusu, başlık ve açıklama
const KARAR: Record<Aksiyon, { konu: string; baslik: string; metin: string; renk: string }> = {
  hide:    { konu: 'Şikayetiniz sonuçlandı — yorum kaldırıldı',          baslik: 'Yorum Yayından Kaldırıldı', metin: 'Şikayetiniz değerlendirildi ve yorum <strong>yayından kaldırıldı</strong>. Ziyaretçiler artık bu yorumu profilinizde görmüyor; puan ortalamanız da buna göre güncellendi.', renk: '#059669' },
  delete:  { konu: 'Şikayetiniz sonuçlandı — yorum silindi',             baslik: 'Yorum Silindi',             metin: 'Şikayetiniz değerlendirildi ve yorum <strong>kalıcı olarak silindi</strong>.', renk: '#059669' },
  dismiss: { konu: 'Şikayetiniz değerlendirildi — yorum yayında kalacak', baslik: 'Şikayet Değerlendirildi',   metin: 'Şikayetiniz incelendi; yorum yayın kurallarımıza aykırı bulunmadığı için <strong>yayında kalacak</strong>. Yoruma profilinizden herkese açık bir yanıt yazabilirsiniz.', renk: '#B45309' },
  unhide:  { konu: 'Yorum yeniden yayına alındı',                         baslik: 'Yorum Yeniden Yayında',     metin: 'Daha önce kaldırılan yorum yeniden değerlendirildi ve <strong>tekrar yayına alındı</strong>.', renk: '#B45309' },
};

/** Bir işletmenin görünür (gizli olmayan) yorumları */
async function gorunurYorumlar(db: any, tur: string, id: string): Promise<{ rating: number }[]> {
  const { data } = await db.from('yorumlar').select('rating,hidden').eq('entity_type', tur).eq('entity_id', id);
  return ((data || []) as { rating: number; hidden: boolean | null }[]).filter(r => !r.hidden);
}

/** Puan ortalaması + yorum sayısı görünür yorumlardan yeniden hesaplanır — YALNIZCA kayıtlı `rev`
 *  işlem öncesi görünür yorum sayısına birebir eşitse (değerler sitedeki yorumlardan türemiş demektir).
 *  Varsayılan (doktorlarda ★4.5 / 0) veya Google vb. kaynaktan içe aktarılmış değerler ezilmez. */
async function puanGuncelle(db: any, tur: string, id: string, oncekiGorunur: number) {
  try {
    const tbl = TABLO[tur]; if (!tbl) return;
    const { data: ent } = await db.from(tbl).select('rev').eq('id', id).maybeSingle();
    if (!ent || (ent.rev || 0) !== oncekiGorunur) return;
    const gorunur = await gorunurYorumlar(db, tur, id);
    const rev = gorunur.length;
    const rat = rev ? +(gorunur.reduce((a, r) => a + (Number(r.rating) || 0), 0) / rev).toFixed(1) : 0;
    await db.from(tbl).update({ rev, rat }).eq('id', id);
  } catch (e) { console.error('puanGuncelle:', e); }
}

/**
 * Admin bir şikayet edilen yorum için son kararı verir:
 *   hide    → yorum herkese görünmez (geri alınabilir), şikayet 'resolved'
 *   delete  → yorum kalıcı silinir
 *   dismiss → şikayet reddedilir, yorum görünür kalır ('dismissed')
 *   unhide  → gizlenmiş yorum tekrar görünür
 * note   → işletmeye not: panelde yorum kartında ve e-postada gösterilir
 * notify → işletmeye e-posta (varsayılan: açık)
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { yorumId, action, note, notify } = body as { yorumId?: string; action?: Aksiyon; note?: string; notify?: boolean };
    if (!yorumId || !action || !(action in KARAR)) {
      return NextResponse.json({ error: 'yorumId ve geçerli action zorunlu' }, { status: 400 });
    }

    const db = adminClient() as any;
    const adminNote = note ? String(note).trim().slice(0, 1000) : null;

    // Karar öncesi yorumu al — silinirse bilgiler kaybolmasın (e-posta için gerekli)
    const { data: y, error: yErr } = await db.from('yorumlar')
      .select('id,entity_type,entity_id,author,rating,text,report_reason,reported_by')
      .eq('id', yorumId).maybeSingle();
    if (yErr || !y) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
    const oncekiGorunur = (await gorunurYorumlar(db, y.entity_type, String(y.entity_id))).length;

    if (action === 'delete') {
      const { error } = await db.from('yorumlar').delete().eq('id', yorumId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const patch: Record<string, unknown> =
        action === 'hide'   ? { hidden: true,  report_status: 'resolved',  admin_note: adminNote }
                            : { hidden: false, report_status: 'dismissed', admin_note: adminNote }; // dismiss + unhide
      const { error } = await db.from('yorumlar').update(patch).eq('id', yorumId);
      if (error) {
        const missing = /hidden|report_status|column/.test(error.message || '');
        return NextResponse.json({ error: missing ? 'Veritabanı kolonları eksik. "add_yorum_moderation.sql" migration\'ını çalıştırın.' : error.message }, { status: 500 });
      }
    }

    // Puan ortalaması + public sayfa önbelleği
    if (action !== 'dismiss') await puanGuncelle(db, y.entity_type, String(y.entity_id), oncekiGorunur);
    const b = await isletmeBilgisi(db, y.entity_type, String(y.entity_id));
    try { if (b.url) revalidatePath(new URL(b.url).pathname); } catch { /* sessiz */ }

    // İşletmeye bildirim — şikayet eden kişi, yoksa onaylı sahip
    let mail: { sent: boolean; to?: string; reason?: string } = { sent: false };
    if (notify !== false) {
      const alici = (y.reported_by && String(y.reported_by).includes('@')) ? String(y.reported_by)
                  : await sahipEpostasi(db, String(y.entity_id), y.entity_type);
      if (!alici) mail = { sent: false, reason: 'İşletmenin kayıtlı e-postası yok' };
      else {
        const k = KARAR[action];
        const isletme = b.ad || 'İşletmeniz';
        const kisaYorum = y.text ? (String(y.text).length > 300 ? String(y.text).slice(0, 300) + '…' : String(y.text)) : null;
        const html = mailShell(k.baslik,
          `<p style="font-size:14px;color:#1c1c1e;margin:0 0 10px;">Merhaba,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 14px;"><strong>${esc(isletme)}</strong> profilinizdeki bir yorumla ilgili işlem yapıldı. ${k.metin}</p>` +
          satir('Yorum sahibi', esc(y.author)) +
          satir('Puan', `${Number(y.rating) || 0}/5`) +
          satir('Yorum', kisaYorum ? esc(kisaYorum) : null) +
          satir('Şikayet gerekçeniz', y.report_reason ? esc(y.report_reason) : null) +
          (adminNote
            ? `<div style="margin:14px 0 0;padding:12px 14px;background:#F8FAFF;border-left:3px solid ${k.renk};border-radius:8px;"><div style="font-size:11px;font-weight:700;color:#6E6E73;letter-spacing:.4px;margin-bottom:4px;">YÖNETİCİ NOTU</div><div style="font-size:14px;color:#1c1c1e;line-height:1.6;">${esc(adminNote).replace(/\n/g, '<br>')}</div></div>`
            : '') +
          `<p style="margin:18px 0 0;"><a href="https://www.hekimhane.com.tr/panel" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:700;font-size:13px;">Panelde Yorumlarım</a></p>` +
          `<p style="font-size:12px;color:#6E6E73;margin-top:12px;">Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`);
        const r = await sendEmail({ to: alici, subject: `${k.konu} — ${isletme}`, html, replyTo: ADMIN_EMAIL });
        mail = r.ok ? { sent: true, to: alici } : { sent: false, to: alici, reason: r.skipped ? 'E-posta servisi yapılandırılmamış' : (r.error || 'Gönderilemedi') };
      }
    }

    return NextResponse.json({ success: true, deleted: action === 'delete', mail });
  } catch (err) {
    console.error('admin/yorum-action error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
