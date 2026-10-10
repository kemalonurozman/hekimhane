// Profil puanı — tek kaynak. Profilin ne kadar eksiksiz doldurulduğunu 0–100 arasında ölçer.
// Ziyaretçiye HİÇBİR yerde gösterilmez; yalnız liste sırasını (Pro → puan → hasta puanı)
// ve ana sayfa "öne çıkanlar" seçimini etkiler. Sahibi panelde kalem kalem görür.
//
// Kurallar:
//  • Her kalemin üst sınırı vardır → 50 fotoğraf yükleyerek puan şişirilemez.
//  • Dosya hem tarayıcıda (panel), hem sunucuda, hem de Node betiğinde
//    (scripts/profil-puani-hesapla.mjs) çalışır: '@/' importu ve sunucu importu KOYMA,
//    yalnız silinebilir TS sözdizimi kullan (enum/namespace yok).

export type PuanTip = 'klinik' | 'doktor';

export interface PuanEk {
  /** Yanıtlanmış yorum sayısı / toplam yorum sayısı */
  yorumToplam?: number;
  yorumYanitli?: number;
  /** Kayıtlı (elle oluşturulmuş) HekimKart var mı */
  hekimKart?: boolean;
}

export interface PuanKalemi {
  anahtar: string;
  baslik: string;
  puan: number;
  max: number;
  /** Eksikse ne yapılmalı — tamamsa boş */
  ipucu: string;
  /** Panelde götürülecek yer: Profil Düzenle bölümü ya da sekme */
  hedef: 'profil' | 'medya' | 'meslek' | 'takvim' | 'yorumlar' | 'hekimkart';
}

export interface PuanSonucu { puan: number; kalemler: PuanKalemi[] }

const dolu = (v: unknown): boolean => typeof v === 'string' ? v.trim().length > 0 : v != null && v !== false;
const dizi = (v: unknown): unknown[] => Array.isArray(v) ? v.filter(x => x != null && x !== '') : [];
/** Süresi dolan Google Places görselleri (toplu 403) fotoğraf sayılmaz. */
const gercekGorsel = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0 && !/googleusercontent\.com\/gps-cs/.test(v);

export function profilPuaniHesapla(tip: PuanTip, r: Record<string, any>, ek: PuanEk = {}): PuanSonucu {
  const k: PuanKalemi[] = [];
  const ekle = (anahtar: string, baslik: string, puan: number, max: number, ipucu: string, hedef: PuanKalemi['hedef']) =>
    k.push({ anahtar, baslik, puan: Math.max(0, Math.min(max, Math.round(puan))), max, ipucu: puan >= max ? '' : ipucu.charAt(0).toLocaleUpperCase('tr') + ipucu.slice(1), hedef });

  // 1) Profil fotoğrafı / logo — 10
  const ana = tip === 'doktor' ? r.photo : r.logo;
  ekle('ana-gorsel', tip === 'doktor' ? 'Profil fotoğrafı' : 'Logo', gercekGorsel(ana) ? 10 : 0, 10,
    tip === 'doktor' ? 'Profil fotoğrafınızı yükleyin.' : 'Kliniğinizin logosunu yükleyin.', 'medya');

  // 2) Galeri — 15 (6 fotoğrafa kadar kademeli; fazlası puan getirmez)
  const foto = dizi(r.photos).filter(gercekGorsel).length;
  const fotoPuan = [0, 4, 7, 10, 12, 14, 15][Math.min(foto, 6)];
  ekle('galeri', 'Fotoğraf galerisi', fotoPuan, 15,
    foto === 0 ? 'Klinik ve muayenehane fotoğraflarınızı ekleyin (6 fotoğrafa kadar puan kazandırır).'
      : `${6 - foto} fotoğraf daha ekleyin (şu an ${foto}/6).`, 'medya');

  // 3) Tanıtım yazısı — 10 (300+ karakter tam puan)
  const bio = typeof r.bio === 'string' ? r.bio.trim().length : 0;
  ekle('tanitim', tip === 'doktor' ? 'Biyografi' : 'Klinik hakkında yazısı', bio >= 300 ? 10 : bio >= 120 ? 6 : bio > 0 ? 3 : 0, 10,
    bio === 0 ? 'Kendinizi ve hizmetlerinizi anlatan bir tanıtım yazısı ekleyin.'
      : 'Tanıtım yazınızı biraz daha ayrıntılandırın (en az 300 karakter).', 'profil');

  // 4) Eğitim — 10 (okul 4 + uzmanlık kurumu 3 + başlangıç yılı 3)
  const yil = Number(r.deneyim_baslangic) || 0;
  const egitim = (dolu(r.okul) ? 4 : 0) + (dolu(r.uzmanlik_kurum) ? 3 : 0) + (yil >= 1950 ? 3 : 0);
  const eksikEgitim = [!dolu(r.okul) && 'mezun olunan okul', !dolu(r.uzmanlik_kurum) && 'uzmanlık kurumu', !(yil >= 1950) && 'mesleğe başlama yılı'].filter(Boolean);
  ekle('egitim', 'Eğitim bilgileri', egitim, 10, `Eksik: ${eksikEgitim.join(', ')}.`, 'meslek');

  // 5) Deneyim ve sertifikalar — 10 (deneyim 5 + sertifika 5)
  const den = dizi(r.deneyimler).filter((d: any) => d && dolu(d.kurum)).length;
  const ser = dizi(r.sertifikalar).filter((c: any) => c && (dolu(c.ad) || dolu(c.url))).length;
  ekle('deneyim', 'Deneyim ve sertifikalar', (den >= 2 ? 5 : den === 1 ? 3 : 0) + (ser >= 2 ? 5 : ser === 1 ? 3 : 0), 10,
    [den < 2 && 'çalıştığınız kurumları', ser < 2 && 'sertifikalarınızı'].filter(Boolean).join(' ve ') + ' ekleyin.', 'meslek');

  // 6) Uzmanlık ve diller — 10 (uzmanlık 6 + yabancı dil 4)
  const uzm = tip === 'doktor' ? (dolu(r.spec) ? 3 : 0) : dizi(r.specs).length;
  const dil = dizi(r.yabanci_diller).length;
  ekle('uzmanlik', 'Uzmanlık alanları ve diller', (uzm >= 3 ? 6 : uzm >= 1 ? 3 : 0) + (dil >= 1 ? 4 : 0), 10,
    [uzm < 3 && (tip === 'doktor' ? 'branşınızı' : 'en az 3 uzmanlık alanı'), dil < 1 && 'konuştuğunuz yabancı dilleri'].filter(Boolean).join(' ve ') + ' ekleyin.', 'profil');

  // 7) Ulaşım bilgileri — 10 (çalışma saatleri 4 + adres 3 + harita konumu 3)
  const saat = dolu(r.calisma_saatleri) || r.acik_24_saat === true;
  const adres = dolu(tip === 'doktor' ? (r.clinic_name || r.adres) : r.adres);
  const konum = (Number(r.lat) !== 0 && Number.isFinite(Number(r.lat)) && r.lat != null) || dolu(r.maps_url);
  ekle('ulasim', 'Çalışma saatleri ve konum', (saat ? 4 : 0) + (adres ? 3 : 0) + (konum ? 3 : 0), 10,
    `Eksik: ${[!saat && 'çalışma saatleri', !adres && 'adres', !konum && 'harita konumu'].filter(Boolean).join(', ')}.`, 'profil');

  // 8) Online randevu — 10
  ekle('randevu', 'Online randevu takvimi', r.randevu_aktif === true ? 10 : 0, 10,
    'Randevu takviminizi açın; hastalar profilinizden saat seçebilsin.', 'takvim');

  // 9) Yorumlara yanıt — 5 (yorum yoksa nötr: tam puan — elde olmayan bir şey cezalandırılmaz)
  const yt = ek.yorumToplam || 0, yy = ek.yorumYanitli || 0;
  ekle('yorum', 'Hasta yorumlarını yanıtlama', yt === 0 ? 5 : yy / yt >= 0.5 ? 5 : yy > 0 ? 3 : 0, 5,
    `Yorumlarınızın en az yarısını yanıtlayın (şu an ${yy}/${yt}).`, 'yorumlar');

  // 10) Zengin içerik — 10 (HekimKart 4 + video 3 + 360° tur 3)
  const video = dolu(r.video_url), tur = dolu(r.tour360url) || dolu(r.photo360);
  ekle('zengin', 'HekimKart, video ve 360° tur', (ek.hekimKart ? 4 : 0) + (video ? 3 : 0) + (tur ? 3 : 0), 10,
    `Eksik: ${[!ek.hekimKart && 'HekimKart', !video && 'tanıtım videosu', !tur && '360° sanal tur'].filter(Boolean).join(', ')}.`, 'hekimkart');

  return { puan: k.reduce((t, x) => t + x.puan, 0), kalemler: k };
}

/** Panelde gösterilen seviye adı (dışarıya yansımaz). */
export function puanSeviyesi(puan: number): { ad: string; renk: string } {
  if (puan >= 85) return { ad: 'Örnek profil', renk: '#1F7A4F' };
  if (puan >= 65) return { ad: 'Güçlü profil', renk: '#1A335E' };
  if (puan >= 40) return { ad: 'Gelişiyor', renk: '#B8892F' };
  return { ad: 'Başlangıç', renk: '#8B93A1' };
}

/** Ana sayfa "öne çıkanlar"a girmek için gereken en düşük puan (Pro üyeler bundan bağımsız). */
export const ONE_CIKAN_ESIK = 60;

/** Satırı tarayıcıya göndermeden önce puan alanını düşürür — puan sayfa kaynağında da görünmesin.
 *  `select('*')` ile çekilip client bileşene (kart) verilen her satırda kullan. */
export function puansiz<T>(row: T): T {
  if (!row || typeof row !== 'object' || !('profil_puani' in (row as any))) return row;
  const { profil_puani: _p, ...kalan } = row as any;
  return kalan as T;
}
