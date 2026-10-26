// Profil puanının sunucu tarafı: ek verileri (yorum yanıtı, HekimKart) toplar,
// puanı hesaplar ve `profil_puani` kolonuna yazar. Kolon yoksa (migration
// çalıştırılmamışsa) sessizce atlar — profil kaydı asla bozulmaz.
import { profilPuaniHesapla, type PuanEk, type PuanSonucu, type PuanTip } from './profil-puani';

const TABLO: Record<PuanTip, string> = { klinik: 'klinikler', doktor: 'doktorlar' };

export function puanTipi(entityType: string): PuanTip | null {
  return entityType === 'klinik' || entityType === 'doktor' ? entityType : null;
}

export async function puanEkleri(admin: any, tip: PuanTip, id: string): Promise<PuanEk> {
  const ek: PuanEk = {};
  try {
    const [y, kart] = await Promise.all([
      admin.from('yorumlar').select('reply_text').eq('entity_type', tip).eq('entity_id', String(id)).limit(500),
      admin.from('hekimkartlar').select('id').eq('entity_id', String(id)).limit(1),
    ]);
    const yorumlar = (y.data || []) as { reply_text?: string | null }[];
    ek.yorumToplam = yorumlar.length;
    ek.yorumYanitli = yorumlar.filter(x => x.reply_text && String(x.reply_text).trim()).length;
    ek.hekimKart = !!(kart.data && kart.data.length);
  } catch { /* ek veri alınamazsa nötr say */ }
  return ek;
}

/** İşletmenin güncel puanını hesaplar (yazmaz). Kayıt yoksa null. */
export async function puanHesapla(admin: any, tip: PuanTip, id: string): Promise<PuanSonucu | null> {
  const { data: row } = await admin.from(TABLO[tip]).select('*').eq('id', id).maybeSingle();
  if (!row) return null;
  return profilPuaniHesapla(tip, row, await puanEkleri(admin, tip, id));
}

/** Hesaplar ve kolona yazar. Best-effort: hata fırlatmaz. */
export async function puanGuncelle(admin: any, entityType: string, id: string): Promise<PuanSonucu | null> {
  const tip = puanTipi(entityType);
  if (!tip) return null;
  try {
    const s = await puanHesapla(admin, tip, id);
    if (!s) return null;
    await admin.from(TABLO[tip]).update({ profil_puani: s.puan }).eq('id', id);   // kolon yoksa hata döner, yutulur
    return s;
  } catch { return null; }
}

// ── Sıralama ───────────────────────────────────────────────────────────────
let kolonOnbellek: { var: boolean; zaman: number } | null = null;

/** `profil_puani` kolonu iki tabloda da var mı (60 sn önbellek). Yoksa sıralama eski düzende kalır. */
export async function puanKolonuVar(db: any): Promise<boolean> {
  if (kolonOnbellek && Date.now() - kolonOnbellek.zaman < 60_000) return kolonOnbellek.var;
  let v = false;
  try {
    const [a, b] = await Promise.all([
      db.from('klinikler').select('profil_puani').limit(1),
      db.from('doktorlar').select('profil_puani').limit(1),
    ]);
    v = !a.error && !b.error;
  } catch { v = false; }
  kolonOnbellek = { var: v, zaman: Date.now() };
  return v;
}

/** Liste sırası: profil puanı → hasta puanı. `puanli=false` iken puan adımı atlanır.
 *  Eki 2026: Pro üyelik sıralamadan ÇIKARILDI — ücretli paket sırayı/görünürlüğü
 *  etkilemez (Tanıtım Yönetmeliği; footer'daki cümle buna dayanır). Geri ekleme. */
export function profilSirasi<T>(q: T, puanli: boolean): T {
  let s: any = q;
  if (puanli) s = s.order('profil_puani', { ascending: false, nullsFirst: false });
  return s.order('rat', { ascending: false });
}
