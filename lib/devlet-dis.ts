// ─────────────────────────────────────────────────────────────
// Devlet Ağız ve Diş Sağlığı Hastaneleri — kategori veri katmanı
// Doktorlar `doktorlar` tablosunda tags=['devlet-dis-hastanesi'] ile;
// hastaneye clinic_name ile bağlı. Standart aramada görünmezler.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { toSlug } from './helpers';
import type { Doktor } from './types';

export const DEVLET_TAG = 'devlet-dis-hastanesi';

async function fetchAll<T = any>(build: () => any, max = 8000): Promise<T[]> {
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export interface DevletHospital { name: string; il: string; ilce: string; slug: string; ilSlug: string; count: number; }

export async function getDevletHospitals(): Promise<DevletHospital[]> {
  const rows = await fetchAll<{ clinic_name: string | null; il: string | null; ilce: string | null }>(
    () => supabase.from('doktorlar').select('clinic_name,il,ilce').contains('tags', [DEVLET_TAG]));
  const map: Record<string, DevletHospital> = {};
  rows.forEach(r => {
    if (!r.clinic_name) return;
    const h = map[r.clinic_name] ||= { name: r.clinic_name, il: r.il || 'Türkiye', ilce: r.ilce || 'Merkez', slug: toSlug(r.clinic_name), ilSlug: toSlug(r.il || 'turkiye'), count: 0 };
    h.count++;
  });
  return Object.values(map).sort((a, b) => a.il.localeCompare(b.il, 'tr') || b.count - a.count);
}

export async function getHospitalWithDoctors(ilSlug: string, slug: string): Promise<{ hospital: DevletHospital; doctors: Doktor[] } | null> {
  const hospitals = await getDevletHospitals();
  const hospital = hospitals.find(h => h.ilSlug === ilSlug && h.slug === slug);
  if (!hospital) return null;
  const doctors = await fetchAll<Doktor>(
    () => supabase.from('doktorlar').select('*').contains('tags', [DEVLET_TAG]).eq('clinic_name', hospital.name));
  doctors.sort((a, b) => (a.spec || '').localeCompare(b.spec || '', 'tr') || `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`, 'tr'));
  return { hospital, doctors };
}
