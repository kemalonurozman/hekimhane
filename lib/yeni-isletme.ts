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
import { disHekimiBransi, unvanAyir } from '@/lib/doktor-branslari';

export const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
const ID_ONEK: Record<string, string> = { klinik: 'k', hastane: 'h', doktor: 'd', eczane: 'e' };

export interface BasvuruBilgisi {
  unvan: string | null;      // başvuranın rolü ("Sahip", "Yönetici") — işletme kaydına yazılmaz
  il: string | null; ilce: string | null; adres: string | null;
  brans: string | null;      // doktor uzmanlığı ("Uzmanlık: …" parçası)
  tur360: string | null;     // "360° tur linki: …" parçası
}

const norm = (s: string) => s.trim().toLocaleLowerCase('tr-TR').replace(/i̇/g, 'i');

/** `role` metninden il / ilçe / adres / ünvan çıkarır. */
export function basvuruBilgisi(role: string | null | undefined): BasvuruBilgisi {
  const out: BasvuruBilgisi = { unvan: null, il: null, ilce: null, adres: null, brans: null, tur360: null };
  if (!role) return out;
  const parcalar = role.split(' | ').map(p => p.trim()).filter(Boolean);
  const ilMap = new Map(IL_LISTE.map(il => [norm(il), il]));
  parcalar.forEach((p, i) => {
    if (/^adres:/i.test(p)) { out.adres = p.replace(/^adres:\s*/i, '').trim() || null; return; }
    if (/^uzmanl[ıi]k:/i.test(p)) { out.brans = p.replace(/^uzmanl[ıi]k:\s*/i, '').trim().slice(0, 80) || null; return; }
    if (/^360° tur linki:/i.test(p)) { out.tur360 = p.replace(/^360° tur linki:\s*/i, '').trim() || null; return; }
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

export interface OlusanKayit {
  id: string; slug: string; tablo: string;
  entityType: string;          // diş hekimi "doktor" başvurusu → 'klinik' olur
  uyari: string | null;        // admin'e gösterilecek eksik bilgi notu
}

/**
 * Başvurudan işletme kaydı oluşturur.
 *  - Doktor: uzmanlık "Uzmanlık:" parçasından; "Dr./Uzm. Dr." ön eki `unvan` kolonuna.
 *    Uzmanlık boşsa kayıt yine açılır ama /doktorlar listesinde görünmez → `uyari`.
 *  - Diş hekimi branşlı doktor başvurusu `klinikler`'e "Diş Hekimi" türüyle yazılır
 *    (doktorlar'daki diş hekimi hiçbir listede görünmez).
 *  - 360° tur linki varsa profile işlenir (kolon yoksa sessizce atlanır).
 */
export async function yeniIsletmeOlustur(
  admin: SupabaseClient,
  claim: { entity_type: string; entity_name: string | null; claimant_name: string | null; role: string | null },
): Promise<OlusanKayit> {
  const ad = (claim.entity_name || '').trim();
  if (!ad) throw new Error('Başvuruda işletme adı yok.');
  const b = basvuruBilgisi(claim.role);
  const dis = claim.entity_type === 'doktor' && disHekimiBransi(b.brans);
  const tur = dis ? 'klinik' : claim.entity_type;
  const tablo = TABLO[tur];
  if (!tablo) throw new Error(`Bilinmeyen işletme türü: ${claim.entity_type}`);
  // Kimlik: mevcut kayıtlar k1…k9999 biçiminde; çakışmasın diye zaman damgalı sayı.
  const id = ID_ONEK[tur] + Date.now();
  let uyari: string | null = null;

  let satir: Record<string, unknown>;
  let slugTaban: string;
  switch (tur) {
    case 'eczane':
      slugTaban = toSlug(`eczane ${ad} ${b.il || ''}`);
      satir = { id, name: ad, pharmacist: null, il: b.il, ilce: b.ilce, address: b.adres, tel: null, nobetci: false, claimed: true, lat: 0, lng: 0 };
      break;
    case 'klinik':
      slugTaban = [b.il, b.ilce, ad].filter(Boolean).map(x => toSlug(String(x))).join('-');
      satir = dis
        ? { id, name: ad, type: 'Diş Hekimi', il: b.il, ilce: b.ilce, adres: b.adres, tel: null, specs: [], claimed: true, lat: 0, lng: 0, rat: 0, rev: 0 }
        : { id, name: ad, type: 'Klinik', il: b.il, ilce: b.ilce, adres: b.adres, tel: null, specs: [], claimed: true, lat: 0, lng: 0, rat: 0, rev: 0 };
      break;
    case 'hastane':
      slugTaban = [b.il, b.ilce, ad].filter(Boolean).map(x => toSlug(String(x))).join('-');
      satir = { id, name: ad, type: 'Özel', il: b.il, ilce: b.ilce, adres: b.adres, tel: null, specs: [], claimed: true, lat: 0, lng: 0, rat: 0, rev: 0 };
      break;
    case 'doktor': {
      const { unvan, adSoyad } = unvanAyir(ad);
      const kelimeler = adSoyad.split(' ').filter(Boolean);
      const soyad = kelimeler.length > 1 ? kelimeler.pop()! : '';
      const adi = kelimeler.join(' ');
      slugTaban = toSlug(`${b.brans || 'doktor'} ${adi} ${soyad} ${b.il || ''}`);
      satir = { id, ad: adi, soyad, unvan, spec: b.brans, il: b.il, ilce: b.ilce, tel: null, verified: false, rat: 0, rev: 0, fee: 0, lat: 0, lng: 0 };
      if (!b.brans) uyari = 'Başvuruda uzmanlık yok — hekim /doktorlar listesinde uzmanlık girilene kadar görünmez (admin ya da sahibi panelden ekleyebilir).';
      break;
    }
    default: throw new Error('Desteklenmeyen tür');
  }
  if (!b.il) uyari = [uyari, 'Başvuruda şehir çözülemedi — kayıt şehir listelerinde görünmez, şehir girilmeli.'].filter(Boolean).join(' ');

  const slug = await bosSlug(admin, tablo, slugTaban);
  const { error } = await (admin as any).from(tablo).insert({ ...satir, slug });
  if (error) throw new Error(error.message);

  // İsteğe bağlı kolonlar — migration'ı olmayan ortamda kaydı bozmasın (best-effort)
  if (b.tur360) { try { await (admin as any).from(tablo).update({ tour360url: b.tur360 }).eq('id', id); } catch { /* kolon yok */ } }
  if (tur === 'doktor') { try { await (admin as any).from(tablo).update({ contact_hidden: false }).eq('id', id); } catch { /* kolon yok */ } }

  return { id, slug, tablo, entityType: tur, uyari };
}
