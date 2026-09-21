/**
 * Admin paneli teması — TEK KAYNAK (page.tsx + MakalelerTab.tsx).
 *
 * Apple sadeliği: açık gri zemin (#F5F5F7), beyaz kartlar, ince (hairline)
 * kenarlıklar, gölge yerine kontrast, tek vurgu rengi (lacivert) ve yalnız
 * anlam taşıyan yerlerde durum renkleri. Koyu tema kaldırıldı — koyu temaya
 * özel sabit değerler (rgba(255,255,255,.04) gibi) buradaki token'larla
 * değiştirildi; yeni bileşen yazarken token dışına çıkma.
 */
export const C = {
  bg:     '#F5F5F7',   // sayfa zemini
  panel:  '#FFFFFF',   // kenar çubuğu / üst bar
  card:   '#FFFFFF',
  soft:   '#F5F5F7',   // kart içi hafif dolgu (tablo başlığı, input, chip)
  hover:  '#F2F2F4',
  border: '#E5E5EA',
  text:   '#1D1D1F',
  muted:  '#6E6E73',
  dim:    '#AEAEB2',
  navy:   '#1B3A69',   // tek vurgu — aktif menü, birincil düğme, bağlantı
  gold:   '#B48A2A',   // marka altını, beyaz zeminde okunur ton
  // Durum renkleri — beyaz zeminde metin olarak da okunur (600 tonları)
  green:  '#1E8E5A',
  amber:  '#C77700',
  red:    '#D93025',
  blue:   '#2563EB',
  cyan:   '#0E8AA8',
  purple: '#6D4AD6',
  orange: '#D9601A',
};

/** Ortak yüzeyler — inline stil tekrarını azaltır. */
export const YUZEY = {
  kart: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 } as const,
  bolumBasligi: { fontSize: 11, fontWeight: 600, letterSpacing: '.6px', textTransform: 'uppercase', color: C.muted } as const,
};
