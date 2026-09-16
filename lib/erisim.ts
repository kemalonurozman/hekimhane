import { ASISTAN_DURUM, asistanYetkileri, type AsistanYetki } from '@/lib/asistan';

/**
 * Kullanıcının bir işlem için yetkili olduğu işletme kimlikleri.
 *
 *  - Onaylı erişim (sahip + yönetici, status='approved') → her zaman dahil.
 *  - Asistan (status='asistan') → yalnız `yetkiler`'den EN AZ BİRİ role'de
 *    tanımlıysa dahil. `yetkiler` boş verilirse asistan hiç dahil edilmez.
 *
 * Panel rotalarındaki eski `ownedEntityIds()` yerine kullanılır; asistana bir
 * rotayı açmak = o rotada doğru yetkiyle bu fonksiyonu çağırmak.
 */
export async function yetkiliEntityIdleri(
  admin: any, email: string, yetkiler: AsistanYetki[] = [],
): Promise<string[]> {
  const { data } = await admin.from('claim_requests')
    .select('entity_id,status,role')
    .eq('email', email)
    .in('status', ['approved', ASISTAN_DURUM])
    .not('entity_id', 'is', null);

  const ids = new Set<string>();
  for (const c of ((data as any[]) || [])) {
    if (!c.entity_id || c.entity_id === 'new') continue;
    if (c.status === 'approved') { ids.add(String(c.entity_id)); continue; }
    if (yetkiler.length && asistanYetkileri(c.role).some(y => yetkiler.includes(y))) ids.add(String(c.entity_id));
  }
  return Array.from(ids);
}
