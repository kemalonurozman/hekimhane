/**
 * Yorum onay akışı — sunucu tarafı yardımcıları (e-posta). İstemciye import ETME.
 * Client-safe sabitler ve süzgeçler lib/yorum-onay.ts'te.
 */
import { sendEmail, mailShell, satir, esc } from '@/lib/email';
import { ADMIN_EMAIL } from '@/lib/admin-auth';
import { isletmeBilgisi } from '@/lib/entity-link';
import { KURALLAR_KOLONLARI, gelistirmeAdi } from '@/lib/yorum-kurallari';

/**
 * Yorumu ekler; yeni kolonlardan biri (author_email, kurallar_onay_at, kurallar_surum,
 * gelistirme) veritabanında yoksa o kolonu atıp yeniden dener — migration çalışmamış
 * olsa da yorum (yine onay bekleyerek) kaydolur. Moderasyon kolonu eksikse hata döner.
 */
export async function yorumEkle(db: any, kayit: Record<string, unknown>, secim = '*') {
  const atilabilir = ['author_email', ...KURALLAR_KOLONLARI];
  let satir = { ...kayit };
  for (let i = 0; i <= atilabilir.length; i++) {
    const { data, error } = await db.from('yorumlar').insert(satir).select(secim).single();
    if (!error) return { data, error: null, eksik: atilabilir.filter(k => k in kayit && !(k in satir)) };
    const msg = String(error.message || '');
    const kolon = atilabilir.find(k => k in satir && msg.includes(k));
    if (!kolon) return { data: null, error, eksik: [] as string[] };
    const { [kolon]: _at, ...kalan } = satir; satir = kalan;
  }
  return { data: null, error: { message: 'yorum eklenemedi' }, eksik: [] as string[] };
}

/** Admin'e "onay bekleyen yorum" bildirimi — best-effort, akışı bozmaz. */
export async function adminOnayBildir(admin: any, y: { entity_type: string; entity_id: string; author: string; rating: number; text: string; verified?: boolean; email?: string | null; gelistirme?: string[] }) {
  try {
    const b = await isletmeBilgisi(admin, y.entity_type, String(y.entity_id));
    const isletme = b.ad || `${y.entity_type}:${y.entity_id}`;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Onay bekleyen yorum — ${isletme}`,
      html: mailShell('Onay Bekleyen Yorum',
        `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 14px;">Bir ziyaretçi yorum bıraktı. Yorum siz onaylayana kadar <strong>yayınlanmaz</strong>.</p>` +
        satir('İşletme', isletme) +
        satir('Puan', `${y.rating} / 5`) +
        satir('Yazan', y.author) +
        satir('E-posta', y.email || null) +
        (y.verified ? satir('Kaynak', 'Onaylı hasta bağlantısı') : '') +
        satir('Yorum', y.text.slice(0, 800)) +
        (y.gelistirme?.length ? satir('Geliştirilebilir', y.gelistirme.map(gelistirmeAdi).join(', ')) : '') +
        `<p style="margin:18px 0 0;"><a href="https://www.hekimhane.com.tr/admin" style="display:inline-block;background:#1A335E;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:700;font-size:13px;">Yorum Onayı sekmesini aç</a></p>` +
        (b.url ? `<p style="font-size:12px;color:#6E6E73;margin-top:12px;">Profil: <a href="${b.url}">${esc(b.url)}</a></p>` : '')),
    });
  } catch { /* bildirim gitmese de yorum kaydı durur */ }
}
