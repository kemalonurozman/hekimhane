/**
 * "Yeni işletme" başvurusundan (claim_requests.entity_id = 'new') gerçek bir
 * işletme kaydı üretir. Yalnız sunucuda (service-role) kullanılır.
 *
 * Başvuru formları (/katil, panel Yeni Başvuru) il/ilçe/adresi `role` alanına
 * " | " ile ayrılmış serbest metin olarak yazar:
 *   "Eczacı | Ankara / Çankaya | Adres: … | mesaj | YENİ İŞLETME BAŞVURUSU"
 * Buradan il, ilçe ve adres ayrıştırılır; eşleşmeyen il boş bırakılır.
 *
 * KİŞİSEL VERİ KURALI: başvurandaki telefon ve e-posta kişiye aittir, işletme
 * kaydına YAZILMAZ (`tel` boş kalır — sahibi panelden iş yeri numarasını girer).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { toSlug } from '@/lib/helpers';
import { IL_LISTE, ILCELER } from '@/lib/tr-il-ilce';

export const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
const ID_ONEK: Record<string, string> = { klinik: 'k', hastane: 'h', doktor: 'd', eczane: 'e' };

export interface BasvuruBilgisi { unvan: string | null; il: string | null; ilce: string | null; adres: string | null }

const norm = (s: string) => s.trim().toLocaleLowerCase('tr-TR').replace(/i̇/g, 'i');

/** `role` metninden il / ilçe / adres / ünvan çıkarır. */
export function basvuruBilgisi(role: string | null | undefined): BasvuruBilgisi {
  const out: BasvuruBilgisi = { unvan: null, il: null, ilce: null, adres: null };
  if (!role) return out;
  const parcalar = role.split(' | ').map(p => p.trim()).filter(Boolean);
  const ilMap = new Map(IL_LISTE.map(il => [norm(il), il]));
  parcalar.forEach((p, i) => {
    if (/^adres:/i.test(p)) { out.adres = p.replace(/^adres:\s*/i, '').trim() || null; return; }
    const [ilHam, ilceHam] = p.split(' / ').map(x => x.trim());
    const il = ilMap.get(norm(ilHam || ''));
    if (il && !out.il) {
      out.il = il;
      if (ilceHam) {
        const ilce = ILCELER(il).find(x => norm(x) === norm(ilceHam));
        out.ilce = ilce || ilceHam;
      }
      return;
    }
    // Ünvan formda İLK parçadır; sonraki parçalar serbest mesajdır (ünvan sayılmaz).
    if (i === 0 && p.length <= 60 && !/YENİ İŞLETME BAŞVURUSU|SAHİPLENME/i.test(p)) out.unvan = p;
  });
  return out;
}

async function bosSlug(admin: SupabaseClient, tablo: string, taban: string): Promise<string> {
  const t = taban || 'isletme';
  for (let i = 0; i < 10; i++) {
    const aday = i === 0 ? t : `${t}-${i + 1}`;
    const { data } = await (admin as any).from(tablo).select('id').eq('slug', aday).maybeSingle();
    if (!data) return aday;
  }
  return `${t}-${Date.now().toString(36)}`;
}

/** Başvurudan işletme kaydı oluşturur; { id, slug } döner. */
export async function yeniIsletmeOlustur(
  admin: SupabaseClient,
  claim: { entity_type: string; entity_name: string | null; claimant_name: string | null; role: string | null },
): Promise<{ id: string; slug: string; tablo: string }> {
  const tablo = TABLO[claim.entity_type];
  if (!tablo) throw new Error(`Bilinmeyen işletme türü: ${claim.entity_type}`);
  const ad = (claim.entity_name || '').trim();
  if (!ad) throw new Error('Başvuruda işletme adı yok.');
  const b = basvuruBilgisi(claim.role);
  // Kimlik: mevcut kayıtlar k1…k9999 biçiminde; çakışmasın diye zaman damgalı sayı.
  const id = ID_ONEK[claim.entity_type] + Date.now();

  let satir: Record<string, unknown>;
  let slugTaban: string;
  switch (claim.entity_type) {
    case 'eczane':
      slugTaban = toSlug(`eczane ${ad} ${b.il || ''}`);
      satir = { id, name: ad, pharmacist: null, il: b.il, ilce: b.ilce, address: b.adres, tel: null, nobetci: false, claimed: true, lat: 0, lng: 0 };
      break;
    case 'klinik':
      slugTaban = [b.il, b.ilce, ad].filter(Boolean).map(x => toSlug(String(x))).join('-');
      satir = { id, name: ad, type: 'Klinik', il: b.il, ilce: b.ilce, adres: b.adres, tel: null, specs: [], claimed: true, lat: 0, lng: 0, rat: 0, rev: 0 };
      break;
    case 'hastane':
      slugTaban = [b.il, b.ilce, ad].filter(Boolean).map(x => toSlug(String(x))).join('-');
      satir = { id, name: ad, type: 'Özel', il: b.il, ilce: b.ilce, adres: b.adres, tel: null, specs: [], claimed: true, lat: 0, lng: 0, rat: 0, rev: 0 };
      break;
    case 'doktor': {
      const kelimeler = ad.replace(/^(Dr\.?|Dt\.?|Prof\.?|Doç\.?|Uzm\.?|Op\.?)\s+/gi, '').split(/\s+/);
      const soyad = kelimeler.length > 1 ? kelimeler.pop()! : '';
      const adi = kelimeler.join(' ');
      slugTaban = toSlug(`${b.unvan || 'doktor'} ${adi} ${soyad} ${b.il || ''}`);
      satir = { id, ad: adi, soyad, spec: b.unvan, il: b.il, ilce: b.ilce, tel: null, verified: false, rat: 0, rev: 0, fee: 0, lat: 0, lng: 0 };
      break;
    }
    default: throw new Error('Desteklenmeyen tür');
  }
  const slug = await bosSlug(admin, tablo, slugTaban);
  const { error } = await (admin as any).from(tablo).insert({ ...satir, slug });
  if (error) throw new Error(error.message);
  return { id, slug, tablo };
}
