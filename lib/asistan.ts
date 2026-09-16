// ─────────────────────────────────────────────────────────────────
//  İşletme asistanları — sınırlı, yetki bazlı erişim. DDL YOK.
//
//  Asistan = claim_requests'te status='asistan' bir satır. Bilerek
//  'approved' DEĞİL: sistemdeki tüm yetki kontrolleri status='approved'
//  aradığı için asistan varsayılan olarak HİÇBİR yere erişemez (fail-closed).
//  Erişim yalnız lib/erisim.ts → yetkiliEntityIdleri() ile açıkça izin
//  verilen rotalarda, role alanındaki yetkiler kadar açılır.
//
//  Bu dosya panelde (tarayıcı) de kullanılır — sunucu import'u koyma.
// ─────────────────────────────────────────────────────────────────

export const ASISTAN_DURUM = 'asistan';
export const ASISTAN_ONEK = '[asistan]';
export const MAKS_ASISTAN = 10;

export type AsistanYetki = 'randevu' | 'randevu_ekle' | 'hastalar' | 'yorumlar';

/** Panel sekmesi anahtarı — asistanın "nerelere ulaşabileceğini" göstermek için. */
export type AsistanSekme = 'randevu' | 'hastalar' | 'yorumlar';

export const ASISTAN_YETKILERI: {
  key: AsistanYetki; baslik: string; aciklama: string; sekme: AsistanSekme; gerektirir?: AsistanYetki;
}[] = [
  { key: 'randevu',      sekme: 'randevu',  baslik: 'Randevu talepleri',
    aciklama: 'Gelen talepleri görme; arandı / tamamlandı işaretleme, erteleme, iptal, not ve hastaya e-posta.' },
  { key: 'hastalar',     sekme: 'hastalar', baslik: 'Hasta kayıtları',
    aciklama: 'Hastalarım: hasta kartları, notlar, işlem geçmişi ve dosyalar (hastayı tamamen silme hariç).' },
  { key: 'randevu_ekle', sekme: 'hastalar', baslik: 'Takvim ve randevu girişi', gerektirir: 'hastalar',
    aciklama: 'Takvimden yeni randevu ekleme (telefonla gelen hasta vb.), saatleri / günleri kapatıp açma.' },
  { key: 'yorumlar',     sekme: 'yorumlar', baslik: 'Yorumlar',
    aciklama: 'Hasta yorumlarını görme ve yanıt yazma.' },
];

export const ASISTAN_VARSAYILAN: AsistanYetki[] = ['randevu', 'hastalar', 'randevu_ekle'];

/** Asistanın hiçbir durumda yapamadıkları — panelde açıkça gösterilir. */
export const ASISTAN_YAPAMAZ = [
  'İşletme profilini, fotoğrafları ve fiyatları düzenleyemez',
  'Pro abonelik ve ödeme bilgilerine erişemez',
  'Yönetici veya başka asistan ekleyemez',
  'Hastayı sistemden tamamen silemez, sahipliği bırakamaz',
];

const GECERLI = new Set<AsistanYetki>(ASISTAN_YETKILERI.map(y => y.key));

/** Yetki listesini temizler + bağımlılıkları uygular (randevu_ekle → hastalar). */
export function yetkileriDuzenle(liste: unknown): AsistanYetki[] {
  const ham = Array.isArray(liste) ? liste : [];
  const set = new Set<AsistanYetki>(ham.map(String).filter((k): k is AsistanYetki => GECERLI.has(k as AsistanYetki)));
  for (const y of ASISTAN_YETKILERI) if (y.gerektirir && set.has(y.key)) set.add(y.gerektirir);
  return ASISTAN_YETKILERI.map(y => y.key).filter(k => set.has(k));   // sabit sıra
}

export const asistanRolu = (davetEden: string, yetkiler: AsistanYetki[]) =>
  `${ASISTAN_ONEK} Davet eden: ${davetEden} | yetkiler: ${yetkileriDuzenle(yetkiler).join(',')}`;

/** role metninden yetkiler. Tanınmayan / bozuk metin → boş liste (fail-closed). */
export function asistanYetkileri(role: unknown): AsistanYetki[] {
  const m = String(role || '').match(/yetkiler:\s*([a-z_,\s]*)/i);
  return m ? yetkileriDuzenle(m[1].split(',').map(s => s.trim())) : [];
}

/** role metninden daveti yapanın e-postası. */
export const asistanDavetEden = (role: unknown): string | null =>
  String(role || '').match(/Davet eden:\s*([^\s|]+@[^\s|]+)/i)?.[1] || null;
