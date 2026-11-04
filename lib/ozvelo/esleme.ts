// ─────────────────────────────────────────────────────────────────
//  Hekimhane profili → Ozvelo işletme verisi (saf fonksiyon, sunucu importu yok).
//
//  Ne gider: ad, uzmanlık, hizmetler, konum, iletişim, çalışma saatleri, diller,
//  tanıtım, eğitim, fotoğraflar, randevu ayarı ve sahibin e-postası (Ozvelo
//  hesabı bu adresle açılır).
//  Ne GİTMEZ: hasta verisi, yorumlar, puanlar, Pro/ödeme bilgisi, yönetici notları.
//  İletişimi gizli hekimde telefon, WhatsApp ve e-posta da gönderilmez — asistan
//  hekimin gizlediği numarayı söylemesin.
// ─────────────────────────────────────────────────────────────────
import { createHash } from 'crypto';
import { disKimlik, type OzveloTur } from './ayar';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';

const metin = (v: unknown, maks = 500): string | null => {
  const s = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
  return s ? s.slice(0, maks) : null;
};
const uzunMetin = (v: unknown, maks = 4000): string | null => {
  const s = typeof v === 'string' ? v.replace(/\r/g, '').trim() : '';
  return s ? s.slice(0, maks) : null;
};
const liste = (v: unknown, maks = 40): string[] => {
  const ham = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[,;\n]/) : [];
  const gor = new Set<string>();
  const out: string[] = [];
  for (const x of ham) {
    const s = metin(x, 120);
    if (!s || gor.has(s.toLocaleLowerCase('tr-TR'))) continue;
    gor.add(s.toLocaleLowerCase('tr-TR'));
    out.push(s);
    if (out.length >= maks) break;
  }
  return out;
};
/** Süresi dolan Google Places görselleri (gps-cs) gönderilmez — Ozvelo'da kırık resim olurdu. */
const gorsel = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^https:\/\//.test(s) && !/googleusercontent\.com\/gps-cs/.test(s) ? s : null;
};
const sayi = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function urlParca(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/̇/g, '')
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function profilAdresi(tur: OzveloTur, r: any): string | null {
  if (!r?.slug) return null;
  return tur === 'doktor'
    ? `${SITE}/doktorlar/${r.slug}`
    : `${SITE}/klinikler/${urlParca(r.il || 'turkiye')}/${urlParca(r.ilce || 'merkez')}/${r.slug}`;
}

/** WhatsApp alanı: boş = yok, 'same' = telefonla aynı, aksi hâlde numara. */
function whatsapp(r: any): string | null {
  const w = metin(r.whatsapp, 40);
  if (!w) return null;
  return w === 'same' ? metin(r.tel, 40) : w;
}

export interface OzveloIsletme {
  dis_kimlik: string;
  kaynak: 'hekimhane';
  sektor: 'saglik';
  tur: OzveloTur;
  dil: 'tr';
  ad: string;
  unvan: string | null;
  uzmanlik: string | null;
  hizmetler: string[];
  hastaliklar: string[];
  kurum: string | null;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  konum: { lat: number; lng: number } | null;
  harita_url: string | null;
  telefon: string | null;
  whatsapp: string | null;
  eposta: string | null;
  web_siteleri: string[];
  calisma_saatleri: string | null;
  acik_24_saat: boolean;
  diller: string[];
  tanitim: string | null;
  egitim: string | null;
  meslege_baslangic_yili: number | null;
  fotograflar: string[];
  profil_url: string | null;
  randevu: { aktif: boolean; sure_dk: number | null };
  sahip: { eposta: string | null };
}

/** İşletme satırından (select '*') Ozvelo'ya gidecek veri. */
export function ozveloVerisi(tur: OzveloTur, r: any, sahipEposta: string | null): OzveloIsletme {
  const gizli = tur === 'doktor' && r.contact_hidden === true;
  const ad = tur === 'doktor'
    ? [r.ad, r.soyad].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    : String(r.name || '').trim();

  const kapak = gorsel(tur === 'doktor' ? r.photo : r.logo);
  const fotograflar = [kapak, ...(Array.isArray(r.photos) ? r.photos.map(gorsel) : [])]
    .filter((x, i, a): x is string => !!x && a.indexOf(x) === i).slice(0, 12);

  const lat = sayi(r.lat), lng = sayi(r.lng);
  const yil = Number(String(r.deneyim_baslangic || '').slice(0, 4));

  return {
    dis_kimlik: disKimlik(tur, String(r.id)),
    kaynak: 'hekimhane',
    sektor: 'saglik',
    tur,
    dil: 'tr',
    ad: ad.slice(0, 200),
    unvan: tur === 'doktor' ? metin(r.unvan, 60) : null,
    uzmanlik: tur === 'doktor' ? metin(r.spec, 120) : metin(r.type, 120),
    // Doktorda tags içinde iç etiketler de var ("devlet-dis-hastanesi", "bobath-terapisti") — onlar gitmez
    hizmetler: tur === 'doktor'
      ? liste(r.tags).filter(t => !/^[a-z0-9]+(-[a-z0-9]+)+$/.test(t) && t !== metin(r.spec, 120))
      : liste(r.specs),
    hastaliklar: tur === 'doktor' ? liste(r.conditions, 30) : [],
    kurum: tur === 'doktor' ? metin(r.clinic_name, 200) : null,
    il: metin(r.il, 60),
    ilce: metin(r.ilce, 60),
    adres: tur === 'doktor' ? null : metin(r.adres, 300),
    konum: lat != null && lng != null ? { lat, lng } : null,
    harita_url: metin(r.maps_url, 500),
    telefon: gizli ? null : metin(r.tel, 40),
    whatsapp: gizli ? null : whatsapp(r),
    eposta: gizli || tur !== 'doktor' ? null : metin(r.email, 150),
    web_siteleri: [metin(r.website, 300), metin(r.website2, 300)].filter((x): x is string => !!x),
    calisma_saatleri: metin(r.calisma_saatleri, 500),
    acik_24_saat: r.acik_24_saat === true,
    diller: liste(r.yabanci_diller, 15),
    tanitim: uzunMetin(r.bio),
    egitim: metin(r.okul, 300),
    meslege_baslangic_yili: yil >= 1940 && yil <= 2100 ? yil : null,
    fotograflar,
    profil_url: profilAdresi(tur, r),
    randevu: { aktif: r.randevu_aktif === true, sure_dk: sayi(r.randevu_slot_dk) },
    sahip: { eposta: sahipEposta ? sahipEposta.toLowerCase() : null },
  };
}

/** Verinin özeti: değişmediyse tekrar gönderilmez. Alan sırası sabit olduğu için JSON yeterli. */
export const veriOzeti = (v: OzveloIsletme) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
