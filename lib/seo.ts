// ─────────────────────────────────────────────────────────────
// SEO yardımcıları — schema.org structured data üreticileri
// ─────────────────────────────────────────────────────────────

const GUN_EN: Record<string, string> = {
  Pazartesi: 'Monday', Salı: 'Tuesday', Çarşamba: 'Wednesday', Perşembe: 'Thursday',
  Cuma: 'Friday', Cumartesi: 'Saturday', Pazar: 'Sunday',
};

type OHS = { '@type': 'OpeningHoursSpecification'; dayOfWeek: string; opens: string; closes: string };

/**
 * calisma_saatleri JSON'unu ({Pazartesi:{acik,baslangic,bitis},...}) schema.org
 * openingHoursSpecification dizisine çevirir. acik24 ise tüm günler 00:00–23:59.
 * Veri yoksa undefined döner (schema'ya eklenmez).
 */
export function openingHoursSpec(calismaSaatleri?: string | null, acik24?: boolean): OHS[] | undefined {
  if (acik24) {
    return Object.values(GUN_EN).map(d => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: d, opens: '00:00', closes: '23:59' }));
  }
  if (!calismaSaatleri) return undefined;
  let sch: Record<string, { acik?: boolean; baslangic?: string; bitis?: string }>;
  try { sch = JSON.parse(calismaSaatleri); } catch { return undefined; }
  if (!sch || typeof sch !== 'object') return undefined;
  const out: OHS[] = Object.entries(GUN_EN).flatMap(([tr, en]) => {
    const g = sch[tr];
    if (!g || g.acik === false) return [];
    const opens = g.baslangic || '09:00';
    const closes = g.bitis || '18:00';
    return [{ '@type': 'OpeningHoursSpecification' as const, dayOfWeek: en, opens, closes }];
  });
  return out.length ? out : undefined;
}

/**
 * Uzmanlık/hizmet etiketlerini (specs[]) schema.org availableService
 * (MedicalProcedure) dizisine çevirir — dental hizmetler için zengin sonuç sinyali.
 */
export function availableServices(specs?: string[] | null, internalTags?: Set<string>): { '@type': 'MedicalProcedure'; name: string }[] | undefined {
  const list = (specs || []).filter(s => s && (!internalTags || !internalTags.has(s))).slice(0, 12);
  if (!list.length) return undefined;
  return list.map(s => ({ '@type': 'MedicalProcedure' as const, name: s }));
}
