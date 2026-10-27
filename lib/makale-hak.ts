// ─────────────────────────────────────────────────────────────────
//  Panelden makale gönderme hakkı — tek kaynak (client-safe).
//
//  Kural: yalnız Pro işletmeler panelden makale gönderir; her takvim
//  haftasında (Pazartesi 00:00 – Pazar 23:59, Türkiye saati) işletme başına
//  MAKALE_HAFTALIK_PRO makale ücretsiz. Sayılan = o hafta oluşturulmuş,
//  reddedilmemiş (pending/published) yazı. Reddedilen yazı hakkı geri verir;
//  bekleyen/reddedilen yazıyı düzenlemek yeni hak harcamaz.
//  Pro olmayanlar için ücretli yol: /makale-yayinla (İş Ortağı paketi).
// ─────────────────────────────────────────────────────────────────

export const MAKALE_HAFTALIK_PRO = 1;

const TR_OFSET = 3 * 3600_000; // Türkiye UTC+3 (yaz saati yok)

/** İçinde bulunulan haftanın başı (Pazartesi 00:00 TR) — ISO. */
export function haftaBaslangici(simdi: Date = new Date()): string {
  const tr = new Date(simdi.getTime() + TR_OFSET);
  const geri = (tr.getUTCDay() + 6) % 7; // Pazartesi = 0
  const bas = Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), tr.getUTCDate() - geri) - TR_OFSET;
  return new Date(bas).toISOString();
}

/** Bir sonraki hakkın açılacağı an (gelecek Pazartesi 00:00 TR) — ISO. */
export function sonrakiHafta(simdi: Date = new Date()): string {
  return new Date(new Date(haftaBaslangici(simdi)).getTime() + 7 * 86_400_000).toISOString();
}

export interface MakaleHakki {
  /** İşletme Pro mu? (Erken üye ücretsiz Pro dahil) */
  pro: boolean;
  /** Bu hafta sayılan gönderim */
  buHafta: number;
  /** Haftalık hak */
  hak: number;
  /** Şu an yeni makale gönderilebilir mi? */
  acik: boolean;
  /** Hak dolduysa yeniden açılış zamanı (ISO) */
  sonraki: string | null;
}

export function makaleHakki(pro: boolean, buHafta: number, simdi: Date = new Date()): MakaleHakki {
  const acik = pro && buHafta < MAKALE_HAFTALIK_PRO;
  return { pro, buHafta, hak: MAKALE_HAFTALIK_PRO, acik, sonraki: pro && !acik ? sonrakiHafta(simdi) : null };
}
