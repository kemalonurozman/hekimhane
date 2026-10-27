// ─────────────────────────────────────────────────────────────────
//  Panel makale kategorileri — sunucu tarafı (hastaliklar-data büyük bir
//  dosya; istemci paketine girmesin diye liste API'den gönderilir).
//
//  Kaynaklar: blog editör kategorileri + hastalık rehberi kategorileri +
//  hekim branşları. Panel "yazdıkça gelen" seçicide bunları gösterir;
//  listede olmayan değer kabul edilmez → yazı kategorisiz yayınlanır.
// ─────────────────────────────────────────────────────────────────
import { KATEGORILER } from '@/lib/hastaliklar-data';
import { DOKTOR_BRANSLARI } from '@/lib/doktor-branslari';
import { MAKALE_KATEGORILERI } from '@/lib/makale-icerik';

export interface KategoriSecenek { ad: string; grup: 'Blog' | 'Hastalıklar' | 'Branşlar' }

let onbellek: KategoriSecenek[] | null = null;

export function makaleKategorileri(): KategoriSecenek[] {
  if (onbellek) return onbellek;
  const gorulen = new Set<string>();
  const liste: KategoriSecenek[] = [];
  const ekle = (ad: string, grup: KategoriSecenek['grup']) => {
    const a = ad.trim();
    const k = a.toLocaleLowerCase('tr-TR');
    if (!a || gorulen.has(k)) return;
    gorulen.add(k);
    liste.push({ ad: a, grup });
  };
  MAKALE_KATEGORILERI.filter(k => k !== 'İşletmeler İçin').forEach(k => ekle(k, 'Blog'));
  KATEGORILER.forEach(k => ekle(k.ad, 'Hastalıklar'));
  DOKTOR_BRANSLARI.forEach(k => ekle(k, 'Branşlar'));
  onbellek = liste;
  return liste;
}

/** Listede varsa kanonik yazımı, yoksa null (kategorisiz). */
export function kategoriDogrula(girdi: unknown): string | null {
  const k = String(girdi || '').trim().toLocaleLowerCase('tr-TR');
  if (!k) return null;
  return makaleKategorileri().find(s => s.ad.toLocaleLowerCase('tr-TR') === k)?.ad || null;
}
