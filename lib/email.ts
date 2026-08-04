// ─────────────────────────────────────────────────────────────────
//  E-posta gönderimi (Resend) — graceful: RESEND_API_KEY yoksa sessizce
//  atlar (çağıran akış hiç bozulmaz). Key eklenince otomatik çalışır.
// ─────────────────────────────────────────────────────────────────
import { Resend } from 'resend';

const KEY = process.env.RESEND_API_KEY;
// Gönderen adresi — Resend'de doğrulanmış bir domain gerekir.
// Domain doğrulanana kadar 'onboarding@resend.dev' ile test edilebilir.
const FROM = process.env.RESEND_FROM || 'Hekimhane <bildirim@hekimhane.com.tr>';

export interface MailOpts {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: MailOpts): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!KEY) return { ok: false, skipped: true }; // key yok → sessizce atla
  try {
    const resend = new Resend(KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'send failed' };
  }
}

// ── Basit, markalı HTML şablonu ──
export function mailShell(baslik: string, govde: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FBF8F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:20px;">
      <a href="https://www.hekimhane.com.tr" style="text-decoration:none;font-size:20px;font-weight:800;color:#1B3A69;">hekimhane<span style="color:#D4A843;">.com.tr</span></a>
    </div>
    <div style="background:#fff;border:1px solid #E5E5EA;border-radius:16px;padding:24px;">
      <h1 style="font-size:18px;color:#1B3A69;margin:0 0 14px;">${baslik}</h1>
      ${govde}
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:18px;">
      Bu e-posta Hekimhane üzerinden gönderildi. <a href="https://www.hekimhane.com.tr" style="color:#9CA3AF;text-decoration:underline;">hekimhane.com.tr</a>
    </p>
  </div></body></html>`;
}

const esc = (s: string) => String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c));

// Randevu talebi satırı (etiket + değer)
export function satir(etiket: string, deger: string | null | undefined): string {
  if (!deger) return '';
  return `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">${etiket}:</strong> ${esc(deger)}</p>`;
}

// Telefon numarasını tıklanınca aranabilir (tel:) bağlantı olarak gösterir.
export function telHref(tel: string | null | undefined): string {
  const d = String(tel || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 11 && d.startsWith('0')) return '+90' + d.slice(1);   // 05xx… → +90 5xx…
  if (d.length === 10) return '+90' + d;                                 // 5xx… → +90 5xx…
  if (d.length === 12 && d.startsWith('90')) return '+' + d;             // 905xx… → +905xx…
  return d;
}
export function satirTel(etiket: string, tel: string | null | undefined): string {
  if (!tel) return '';
  const href = telHref(tel);
  if (!href) return satir(etiket, tel);
  return `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">${etiket}:</strong> <a href="tel:${href}" style="color:#1B3A69;font-weight:700;text-decoration:none;">${esc(tel)}</a> <span style="color:#9CA3AF;font-size:12px;">(aramak için dokunun)</span></p>`;
}
