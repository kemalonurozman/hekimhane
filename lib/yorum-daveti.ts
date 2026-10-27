// ─────────────────────────────────────────────────────────────────
//  Hastaya e-postayla yorum daveti — ortak kurallar (client-safe).
//  Panel formu ve /api/panel/yorum-daveti aynı sınırları buradan okur.
//  Sunucu importu KOYMA (panel de kullanıyor).
// ─────────────────────────────────────────────────────────────────

/** `cekim_talepleri.isletme_turu` değeri (DDL'siz kayıt; admin talep listesinde gizli). */
export const YORUM_DAVETI_TURU = 'yorum-daveti';

/** Tek gönderimde en fazla adres. */
export const DAVET_TEK_SEFER_MAX = 20;
/** İşletme başına 24 saatte en fazla davet. */
export const DAVET_GUNLUK_MAX = 50;
/** Aynı adrese aynı işletmeden tekrar davet için beklenecek gün. */
export const DAVET_TEKRAR_GUN = 30;
/** Kişisel not sınırı. */
export const DAVET_NOT_MAX = 500;

const EPOSTA_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

/** Serbest metinden (virgül, boşluk, satır) e-posta listesi: küçük harf, geçerli, tekil. */
export function davetAdresleri(girdi: string | string[] | null | undefined): { gecerli: string[]; gecersiz: string[] } {
  const ham = Array.isArray(girdi) ? girdi.join('\n') : String(girdi || '');
  const gecerli: string[] = [];
  const gecersiz: string[] = [];
  for (const p of ham.split(/[\s,;]+/)) {
    const e = p.trim().replace(/^<|>$/g, '').toLowerCase();
    if (!e) continue;
    if (!EPOSTA_RE.test(e)) { if (!gecersiz.includes(e)) gecersiz.push(e); continue; }
    if (!gecerli.includes(e)) gecerli.push(e);
  }
  return { gecerli, gecersiz };
}

/** Hastanın göreceği konu satırı. */
export function davetKonusu(ad: string): string {
  return `${ad} deneyiminizi soruyor`;
}

/** Formda önerilen kişisel not (hekim değiştirebilir ya da silebilir). */
export function varsayilanDavetNotu(ad: string): string {
  return `Merhaba, bizi tercih ettiğiniz için teşekkür ederiz. Deneyiminizi birkaç cümleyle paylaşırsanız hem bize hem de bizi araştıran diğer hastalara yol göstermiş olursunuz.\n\n${ad}`;
}
