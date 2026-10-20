/**
 * Başvuru formlarında (/katil, panel "Yeni Başvuru") doktor için önerilen
 * uzmanlıklar. Yazımlar sitede zaten kullanılan `doktorlar.spec` değerleriyle
 * aynıdır (üst menü filtreleri: Psikoloji, Psikiyatri, Fiziksel Tıp ve
 * Rehabilitasyon) — yeni hekim mevcut filtrelerde doğru gruplansın diye.
 * Liste öneridir; form serbest metne de izin verir. Client + server ortak.
 */
export const DOKTOR_BRANSLARI: string[] = [
  'Acil Tıp', 'Aile Hekimliği', 'Alerji Hastalıkları', 'Anesteziyoloji ve Reanimasyon',
  'Beslenme ve Diyet', 'Beyin ve Sinir Cerrahisi', 'Çocuk Cerrahisi', 'Çocuk Sağlığı ve Hastalıkları',
  'Dermatoloji', 'Endokrinoloji ve Metabolizma Hastalıkları', 'Enfeksiyon Hastalıkları ve Klinik Mikrobiyoloji',
  'Fiziksel Tıp ve Rehabilitasyon', 'Fizyoterapist', 'Gastroenteroloji', 'Genel Cerrahi', 'Göğüs Cerrahisi',
  'Göğüs Hastalıkları', 'Göz Hastalıkları', 'Hematoloji', 'İç Hastalıkları', 'Kadın Hastalıkları ve Doğum',
  'Kalp ve Damar Cerrahisi', 'Kardiyoloji', 'Kulak Burun Boğaz Hastalıkları', 'Nefroloji', 'Nöroloji',
  'Nükleer Tıp', 'Ortopedi ve Travmatoloji', 'Perinatoloji', 'Plastik Rekonstrüktif ve Estetik Cerrahi',
  'Pratisyen Hekim', 'Psikiyatri', 'Psikoloji', 'Radyoloji', 'Romatoloji', 'Tıbbi Onkoloji',
  'Tıbbi Patoloji', 'Üroloji',
];

/**
 * Diş hekimliği branşı mı? Özel diş hekimleri `klinikler` tablosunda tutulur;
 * `doktorlar`'a yazılırsa hiçbir listede görünmez (bkz. CLAUDE.md, /doktorlar
 * diş hekimlerini hariç tutar).
 */
export function disHekimiBransi(brans: string | null | undefined): boolean {
  const s = (brans || '').toLocaleLowerCase('tr-TR');
  return /diş|dişçi|\bdis hek|ortodon|implant|endodon|periodon|pedodon|ağız|çene cerrah|protez/.test(s);
}

/** "Dr. Ayşe Yılmaz", "Uzm. Dr. Ali Kaya" → { unvan, adSoyad } */
export function unvanAyir(tamAd: string): { unvan: string | null; adSoyad: string } {
  const RE = /^(Prof\.?|Doç\.?|Dr\.?|Uzm\.?|Op\.?|Dt\.?|Dyt\.?|Fzt\.?|Psk\.?|Klinik Psk\.?|Yrd\.?\s*Doç\.?|Öğr\.?\s*Üyesi|Doktor|Diş Hekimi)\s+/i;
  let kalan = (tamAd || '').trim().replace(/\s+/g, ' ');
  const parca: string[] = [];
  for (let i = 0; i < 4; i++) {
    const m = RE.exec(kalan);
    if (!m) break;
    parca.push(m[1]);
    kalan = kalan.slice(m[0].length);
  }
  return { unvan: parca.length ? parca.join(' ') : null, adSoyad: kalan };
}
