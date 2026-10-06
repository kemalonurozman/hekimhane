// ─────────────────────────────────────────────────────────────
// Hekimhane Tasarım Sistemi v3 — ortak yardımcılar
// ─────────────────────────────────────────────────────────────

/** Baş harfler: unvanlar (Prof., Doç., Dr., Uzm., Dt., Op., Psk., Fzt., "Diş Hekimi") atlanır,
 *  ilk iki kelimenin baş harfi alınır. "Uzm. Dt. Mehmet Barış Akar" → MB, "Dental Clinic Antalya" → DC. */
export function basHarfler(ad: string | null | undefined): string {
  const temiz = String(ad || '')
    .replace(/(^|\s)(Prof|Doç|Doc|Dr|Uzm|Dt|Op|Psk|Fzt|Yrd|Exp)\.?(?=\s|$)/gi, ' ')
    .replace(/Diş Hekimi/gi, ' ')
    .replace(/(^|\s)(Özel|T\.?C\.?)(?=\s)/gi, ' ')
    .trim();
  const harfler = temiz.split(/[\s,.\-]+/).filter(k => /[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû]/.test(k)).slice(0, 2).map(k => k.charAt(0)).join('');
  return (harfler || String(ad || '?').trim().charAt(0) || '?').toLocaleUpperCase('tr-TR');
}

/** Puan Türkçe biçimde, virgüllü ve tek ondalık: 4.9 → "4,9", 5 → "5,0" */
export function puanYaz(puan: number | null | undefined): string {
  return Number(puan || 0).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** 10'dan az değerlendirmede yüksek puan dürüstçe işaretlenir */
export const AZ_DEGERLENDIRME_SINIRI = 10;
