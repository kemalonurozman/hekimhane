// ─────────────────────────────────────────────────────────────────
//  Bir günün çalışma saati slotları — panel (Randevu Takvimi +
//  Hastalarım haftalık görünüm) ve MCP takvim aracı AYNI kuralı kullanır.
//
//  Kural: acik_24_saat → 08:00–22:00. Değilse calisma_saatleri JSON'u
//  ({ "Pazartesi": { acik, baslangic, bitis }, ... }); gün tanımlıysa o,
//  JSON var ama gün yoksa kapalı; hiç tanım yoksa Pazar hariç 09:00–18:00.
//  Bloke (kapatılan saat) bu fonksiyonda dikkate ALINMAZ.
// ─────────────────────────────────────────────────────────────────
export const GUN_ADLARI = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const pad2 = (n: number) => String(n).padStart(2, '0');

export interface TakvimAyar {
  calisma: string | null | undefined;   // calisma_saatleri (JSON metni)
  acik24: boolean;
  slotDk: number;
}

export function gunSlotlari(ayar: TakvimAyar | undefined, iso: string): string[] {
  if (!ayar || !iso) return [];
  const dt = new Date(iso + 'T00:00:00');
  const gun = GUN_ADLARI[dt.getDay()];
  let o = '09:00', c = '18:00', acikGun = true;
  if (ayar.acik24) { o = '08:00'; c = '22:00'; }
  else {
    let sch: Record<string, { acik?: boolean; baslangic?: string; bitis?: string }> = {};
    try { sch = ayar.calisma ? JSON.parse(ayar.calisma) : {}; } catch { sch = {}; }
    if (sch && sch[gun]) { acikGun = sch[gun].acik !== false; o = sch[gun].baslangic || '09:00'; c = sch[gun].bitis || '18:00'; }
    else if (ayar.calisma) { acikGun = false; } else { acikGun = dt.getDay() !== 0; }
  }
  if (!acikGun) return [];
  let t = (+o.split(':')[0]) * 60 + (+o.split(':')[1]);
  const end = (+c.split(':')[0]) * 60 + (+c.split(':')[1]);
  const dk = ayar.slotDk || 30;
  const out: string[] = [];
  while (t + dk <= end) { out.push(pad2(Math.floor(t / 60)) + ':' + pad2(t % 60)); t += dk; }
  return out;
}
