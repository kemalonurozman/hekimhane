// Onaylı (doğrulanmış) yorum — yalnız Hekimhane üzerinden randevusu TAMAMLANAN hasta yazabilir.
//
// Akış: işletme panelde talebi "Tamamlandı" yapar → hastaya (e-postası varsa) tek kullanımlık
// değerlendirme bağlantısı gider; e-postası yoksa işletme panelden bağlantıyı kopyalayıp
// SMS/WhatsApp ile iletir → hasta /degerlendir?t=… sayfasında puan + yorum bırakır →
// yorum `verified=true` ile kaydedilir ve profilde "Onaylı hasta" rozetiyle görünür.
//
// DDL yok: bağlantı HMAC imzalı (`talepId.sonGecerlilik.imza`), tabloya yazılmaz.
// Tek kullanım: yorum yazılınca `cekim_talepleri`'ne `isletme_turu='onayli-yorum'`,
// `notlar=<talepId>` kaydı düşülür (DDL'siz kayıt deseni; admin talep listesinde gizli).
// `yorumlar.user_id` KULLANILAMAZ — `profiles` tablosuna yabancı anahtarlı.
import { createHmac, timingSafeEqual } from 'crypto';
import { unstable_noStore as noStore } from 'next/cache';

const GECERLILIK_GUN = 60;
export const ONAYLI_YORUM_TURU = 'onayli-yorum';
const sir = () => process.env.YORUM_TOKEN_SECRET || process.env.MCP_INTERNAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const imza = (gov: string) => createHmac('sha256', sir()).update(`hk-onayli-yorum.${gov}`).digest('base64url').slice(0, 32);

export function yorumTokeni(talepId: string): string {
  const son = Math.floor(Date.now() / 1000) + GECERLILIK_GUN * 86400;
  const gov = `${talepId}.${son}`;
  return `${gov}.${imza(gov)}`;
}

/** Geçerliyse talep id'sini döndürür; bozuk, süresi geçmiş ya da imzasız token → null. */
export function yorumTokeniCoz(token: string | null | undefined): string | null {
  if (!token || !sir()) return null;
  const p = String(token).split('.');
  if (p.length !== 3) return null;
  const [id, son, sig] = p;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{10}$/.test(son)) return null;
  if (Number(son) < Date.now() / 1000) return null;
  const a = Buffer.from(sig), b = Buffer.from(imza(`${id}.${son}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export const yorumBaglantisi = (token: string) => `https://www.hekimhane.com.tr/degerlendir?t=${encodeURIComponent(token)}`;

/** Talebin onaylı yorum durumu: yorum yazılabilir mi, zaten yazılmış mı? */
export async function talepYorumDurumu(admin: any, talepId: string) {
  noStore();   // Data Cache bayat durum döndürmesin (yazıldıktan sonra form yeniden açılıyordu)
  const { data: talep } = await admin.from('randevu_talepleri')
    .select('id,entity_id,entity_type,entity_name,ad_soyad,status').eq('id', talepId).maybeSingle();
  if (!talep) return { durum: 'yok' as const };
  if (talep.status !== 'tamamlandi') return { durum: 'tamamlanmadi' as const, talep };
  const { data: var_ } = await admin.from('cekim_talepleri').select('id')
    .eq('isletme_turu', ONAYLI_YORUM_TURU).eq('notlar', talepId).limit(1);
  if (var_ && var_.length) return { durum: 'yazildi' as const, talep };
  return { durum: 'acik' as const, talep };
}
