// ─────────────────────────────────────────────────────────────────
//  Deneme hesabı — sunucu tarafı (service-role). Kurulum, gece sıfırlaması,
//  gizli giriş bağlantısı ve şifresiz panel girişi. Kurallar: lib/demo.ts.
//
//  Panel hesabının şifresi hiçbir yerde tutulmaz/paylaşılmaz: giriş bağlantısı
//  sunucuda tek kullanımlık bir giriş kodu üretip oturumu açar. Hesap şifresi her
//  sıfırlamada rastgele yenilenir; biri değiştirse de giriş bozulmaz.
//  Bağlantı anahtarı Auth `app_metadata`'da (kullanıcı değiştiremez); admin
//  "Yeni bağlantı" deyince eski bağlantı çalışmaz.
// ─────────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes, timingSafeEqual } from 'crypto';
import {
  DEMO_KLINIK_ID, DEMO_SLUG, DEMO_IL, DEMO_ILCE, DEMO_KULLANICI_ID, DEMO_EPOSTA, DEMO_AD, DEMO_ROL, DEMO_PROFIL_YOLU,
} from '@/lib/demo';

export const SITE = 'https://www.hekimhane.com.tr';

/**
 * Önbelleksiz service-role istemcisi. `cache: 'no-store'` ŞART: gece görevi GET rotası
 * olduğundan Next 14 Data Cache içindeki DELETE/GET isteklerini önbellekten yanıtlıyordu
 * (silmeler veritabanına hiç gitmedi, örnek kayıtlar katlandı — yerelde yakalandı).
 */
export function demoIstemcisi(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (girdi: RequestInfo | URL, ayar?: RequestInit) => fetch(girdi, { ...ayar, cache: 'no-store' }) },
  });
}

// ── Örnek veri ────────────────────────────────────────────────────

const SAATLER = JSON.stringify({
  Pazartesi: { acik: true, baslangic: '09:00', bitis: '18:00' },
  Salı:      { acik: true, baslangic: '09:00', bitis: '18:00' },
  Çarşamba:  { acik: true, baslangic: '09:00', bitis: '18:00' },
  Perşembe:  { acik: true, baslangic: '09:00', bitis: '18:00' },
  Cuma:      { acik: true, baslangic: '09:00', bitis: '17:00' },
  Cumartesi: { acik: true, baslangic: '10:00', bitis: '14:00' },
  Pazar:     { acik: false, baslangic: '09:00', bitis: '18:00' },
});

/** Deneme işletmesi satırı. Telefon/WhatsApp bilerek boş — gerçek bir kişinin numarası olabilirdi. */
function demoKlinikSatiri(): Record<string, unknown> {
  return {
    id: DEMO_KLINIK_ID,
    slug: DEMO_SLUG,
    name: DEMO_AD,
    type: 'Diş Kliniği',
    kurum: 'ozel',
    il: DEMO_IL,
    ilce: DEMO_ILCE,
    adres: 'Örnek Mahallesi, Deneme Sokak No: 1 (temsili adres)',
    lat: 39.9208, lng: 32.8541,
    tel: null, whatsapp: null, website: null, website2: null, maps_url: null,
    instagram_url: null, facebook_url: null, linkedin_url: null,
    specs: ['Genel Diş Hekimliği', 'Estetik Diş Hekimliği', 'İmplant', 'Kanal Tedavisi', 'Diş Beyazlatma'],
    yabanci_diller: ['İngilizce'],
    bio: 'Bu metin bir örnektir. Lilly Diş Kliniği gerçek bir klinik değildir; bu profil, Hekimhane\'de bir diş kliniği sayfasının nasıl göründüğünü göstermek için hazırlandı.\n\n' +
      'Gerçek bir profilde burada kliniğin kendini, hekim kadrosunu, çalışma yaklaşımını ve muayene ortamını anlattığı tanıtım yazısı yer alır. Hastalar ilk muayenede neyle karşılaşacaklarını, hangi tedavilerin yapıldığını ve randevunun nasıl alındığını bu bölümden öğrenir.',
    okul: 'Örnek Üniversitesi Diş Hekimliği Fakültesi (temsili)',
    deneyim_baslangic: 2014,
    online: true, acil: false, acik_24_saat: false,
    calisma_saatleri: SAATLER,
    randevu_aktif: true, randevu_slot_dk: 30, randevu_bloke: [], randevu_email: null,
    logo: null, cover: null, photos: [], photo360: null, tour360url: null, video_url: null,
    claimed: true, premium: true,
    rat: 4.7, rev: 3,
    gizli: false, duraklat_at: null,
    updated_at: new Date().toISOString(),
  };
}

/** Türkiye takvimine göre bugünden `gun` gün sonrası, YYYY-MM-DD. */
function trGun(gun: number): string {
  const d = new Date(Date.now() + gun * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Pazar kapalı → o güne düşen örnek randevuyu pazartesiye kaydır. */
function isGunu(gun: number): string {
  for (let g = gun; g < gun + 3; g++) {
    const t = trGun(g);
    const hg = new Date(`${t}T12:00:00+03:00`).getUTCDay();
    if (hg !== 0) return t;
  }
  return trGun(gun);
}

// Telefonlar 0500… — kullanılmayan önek, gerçek bir kişiye ait olmasın. E-posta yok.
const ORNEK_TALEPLER: { ad: string; tel: string; gun: number; saat: string; status: string; mesaj?: string }[] = [
  { ad: 'Elif Kaya (örnek hasta)',    tel: '05000000001', gun: 0, saat: '10:30', status: 'yeni' },
  { ad: 'Mert Demir (örnek hasta)',   tel: '05000000002', gun: 1, saat: '14:00', status: 'yeni' },
  { ad: 'Zeynep Aydın (örnek hasta)', tel: '05000000003', gun: 1, saat: '11:00', status: 'arandi' },
  { ad: 'Can Öztürk (örnek hasta)',   tel: '05000000004', gun: 3, saat: '09:30', status: 'arandi' },
  { ad: 'Selin Arslan (örnek hasta)', tel: '05000000005', gun: 5, saat: '16:00', status: 'yeni' },
  { ad: 'Burak Şahin (örnek hasta)',  tel: '05000000006', gun: -2, saat: '15:30', status: 'tamamlandi' },
  { ad: 'Ayşe Yıldız (örnek hasta)',  tel: '05000000007', gun: -6, saat: '10:00', status: 'tamamlandi' },
];

const ORNEK_YORUMLAR = [
  { author: 'Elif K.', rating: 5, text: 'Örnek yorum: Randevu saatine tam uyuldu, tedavi öncesinde her adım sakin bir dille anlatıldı. Muayenehane çok temizdi, kendimi rahat hissettim.', gun: -9, yanit: 'Örnek yanıt: Güzel sözleriniz için teşekkür ederiz, sağlıklı günler dileriz.' },
  { author: 'Mert D.', rating: 5, text: 'Örnek yorum: Kanal tedavisinden çok çekiniyordum ama hiç ağrı hissetmedim. Kontrol randevusunu da telefonla hatırlattılar.', gun: -21, yanit: null },
  { author: 'Zeynep A.', rating: 4, text: 'Örnek yorum: İlgili ve açıklayıcı bir hekim. Bekleme salonunda biraz bekledim ama tedaviden çok memnun kaldım.', gun: -40, yanit: null },
];

const ORNEK_HASTALAR = [
  { tel: '05000000006', ad: 'Burak Şahin (örnek hasta)', notlar: 'Örnek not: Diş taşı temizliği yapıldı. 6 ay sonra kontrol önerildi.', etiketler: ['Kontrol'] },
  { tel: '05000000007', ad: 'Ayşe Yıldız (örnek hasta)', notlar: 'Örnek not: Sol alt azı dişine kompozit dolgu. Hassasiyet olursa aranacak.', etiketler: ['Dolgu'] },
];

// ── Yardımcılar ───────────────────────────────────────────────────

/** Eksik kolon hatasında o kolonu atıp yeniden dener (eski şemalarda kurulum düşmesin). */
async function esnekYaz(db: SupabaseClient, tablo: string, satir: Record<string, unknown>, tur: 'upsert' | 'insert') {
  let s = { ...satir };
  const atilan: string[] = [];
  for (let i = 0; i < 25; i++) {
    const q = (db as any).from(tablo);
    const { error } = tur === 'upsert' ? await q.upsert(s, { onConflict: 'id' }) : await q.insert(s);
    if (!error) return { atilan, hata: null as string | null };
    const msg = String(error.message || '');
    const kolon = /'([a-z0-9_]+)' column/i.exec(msg)?.[1] || /column "?([a-z0-9_]+)"? (?:of relation|does not exist)/i.exec(msg)?.[1];
    if (!kolon || !(kolon in s) || kolon === 'id') return { atilan, hata: msg };
    const { [kolon]: _x, ...kalan } = s; s = kalan; atilan.push(kolon);
  }
  return { atilan, hata: 'çok fazla eksik kolon' };
}

async function demoKullanicisi(db: SupabaseClient) {
  const { data } = await db.auth.admin.getUserById(DEMO_KULLANICI_ID);
  return data?.user || null;
}

const yeniAnahtar = () => randomBytes(18).toString('base64url');

/** Kullanıcıyı garanti eder: yoksa oluşturur, e-postası değiştiyse geri alır, şifreyi yeniler. */
async function kullaniciyiHazirla(db: SupabaseClient, anahtarYenile = false) {
  const sifre = randomBytes(24).toString('base64url');
  const mevcut = await demoKullanicisi(db);
  if (!mevcut) {
    const { data, error } = await db.auth.admin.createUser({
      id: DEMO_KULLANICI_ID, email: DEMO_EPOSTA, email_confirm: true, password: sifre,
      user_metadata: { full_name: 'Lilly Diş Kliniği', deneme: true },
      app_metadata: { deneme: true, deneme_anahtar: yeniAnahtar(), deneme_sifirlama: new Date().toISOString() },
    } as any);
    if (error || !data?.user) throw new Error('Deneme kullanıcısı oluşturulamadı: ' + (error?.message || 'bilinmeyen'));
    return data.user;
  }
  const am = (mevcut.app_metadata || {}) as Record<string, unknown>;
  const { data, error } = await db.auth.admin.updateUserById(DEMO_KULLANICI_ID, {
    email: DEMO_EPOSTA, email_confirm: true, password: sifre,
    user_metadata: { full_name: 'Lilly Diş Kliniği', deneme: true },
    app_metadata: {
      ...am, deneme: true,
      deneme_anahtar: anahtarYenile || !am.deneme_anahtar ? yeniAnahtar() : am.deneme_anahtar,
      deneme_sifirlama: new Date().toISOString(),
    },
  } as any);
  if (error || !data?.user) throw new Error('Deneme kullanıcısı güncellenemedi: ' + (error?.message || 'bilinmeyen'));
  return data.user;
}

// ── Kurulum / sıfırlama ───────────────────────────────────────────

export type DemoSonuc = { ok: true; uyarilar: string[] };

/**
 * Deneme hesabını sıfırdan kurar ya da örnek hâline döndürür (idempotent).
 * Gece görevi ve admin "Sıfırla" düğmesi bunu çağırır. Gerçek işletmelere dokunmaz:
 * tüm silmeler `entity_id = DEMO_KLINIK_ID` ile sınırlı.
 */
export async function demoSifirla(db: SupabaseClient, opts: { anahtarYenile?: boolean } = {}): Promise<DemoSonuc> {
  const uyarilar: string[] = [];
  await kullaniciyiHazirla(db, !!opts.anahtarYenile);

  // 1) İşletme satırı
  const k = await esnekYaz(db, 'klinikler', demoKlinikSatiri(), 'upsert');
  if (k.hata) throw new Error('Deneme profili yazılamadı: ' + k.hata);
  if (k.atilan.length) uyarilar.push('Veritabanında olmayan alanlar atlandı: ' + k.atilan.join(', '));

  // 2) Sahiplik: yalnız deneme e-postasıyla tek onaylı kayıt (başka erişim varsa kaldırılır)
  await (db as any).from('claim_requests').delete().eq('entity_id', DEMO_KLINIK_ID);
  const c = await esnekYaz(db, 'claim_requests', {
    entity_id: DEMO_KLINIK_ID, entity_type: 'klinik', entity_name: DEMO_AD,
    email: DEMO_EPOSTA, claimant_name: DEMO_AD, phone: '-', role: DEMO_ROL, status: 'approved',
  }, 'insert');
  if (c.hata) throw new Error('Deneme sahipliği yazılamadı: ' + c.hata);

  // 3) Panelde denenen her şey örneğe döner
  for (const t of ['randevu_talepleri', 'yorumlar', 'hastalar', 'hasta_islemleri', 'hasta_dosyalari', 'hekimkartlar']) {
    const { error } = await (db as any).from(t).delete().eq('entity_id', DEMO_KLINIK_ID);
    if (error && !/does not exist|schema cache/i.test(error.message || '')) uyarilar.push(`${t} temizlenemedi: ${error.message}`);
  }

  // 4) Örnek randevu talepleri (e-postasız → hiçbir bildirim gitmez)
  const talepler = ORNEK_TALEPLER.map((t, i) => {
    const gun = isGunu(t.gun);
    return {
      entity_type: 'klinik', entity_id: DEMO_KLINIK_ID, entity_name: DEMO_AD,
      ad_soyad: t.ad, tel: t.tel, email: null,
      tercih: `${gun} ${t.saat}`, randevu_slot: `${gun} ${t.saat}`, status: t.status,
      mesaj: t.mesaj || null,
      created_at: new Date(Date.now() - (i + 1) * 5 * 3_600_000).toISOString(),
    };
  });
  const { error: rErr } = await (db as any).from('randevu_talepleri').insert(talepler);
  if (rErr) {
    // randevu_slot kolonu yoksa slotsuz dene
    const { error: r2 } = await (db as any).from('randevu_talepleri').insert(talepler.map(({ randevu_slot: _s, ...x }) => x));
    if (r2) uyarilar.push('Örnek randevular yazılamadı: ' + r2.message);
  }

  // 5) Örnek yorumlar (yayında, yorumcu e-postası yok)
  for (const y of ORNEK_YORUMLAR) {
    const tarih = new Date(Date.now() + y.gun * 86_400_000).toISOString();
    const r = await esnekYaz(db, 'yorumlar', {
      entity_type: 'klinik', entity_id: DEMO_KLINIK_ID, author: y.author, rating: y.rating, text: y.text,
      date: tarih.slice(0, 10), created_at: tarih, helpful: 0, verified: false,
      hidden: false, report_status: null,
      reply_text: y.yanit, reply_at: y.yanit ? tarih : null,
    }, 'insert');
    if (r.hata) { uyarilar.push('Örnek yorum yazılamadı: ' + r.hata); break; }
  }

  // 6) Örnek hasta kartları
  for (const h of ORNEK_HASTALAR) {
    const r = await esnekYaz(db, 'hastalar', { entity_id: DEMO_KLINIK_ID, email: null, updated_at: new Date().toISOString(), ...h }, 'insert');
    if (r.hata) { if (!/does not exist|schema cache/i.test(r.hata)) uyarilar.push('Örnek hasta yazılamadı: ' + r.hata); break; }
  }

  return { ok: true, uyarilar };
}

// ── Bağlantı ve giriş ─────────────────────────────────────────────

export type DemoDurum = {
  kurulu: boolean;
  profilUrl: string;
  girisUrl: string | null;
  sonSifirlama: string | null;
};

export async function demoDurumu(db: SupabaseClient): Promise<DemoDurum> {
  const [u, { data: k }] = await Promise.all([
    demoKullanicisi(db),
    (db as any).from('klinikler').select('id').eq('id', DEMO_KLINIK_ID).maybeSingle(),
  ]);
  const am = (u?.app_metadata || {}) as Record<string, unknown>;
  const anahtar = typeof am.deneme_anahtar === 'string' ? am.deneme_anahtar : null;
  return {
    kurulu: !!(u && k),
    profilUrl: SITE + DEMO_PROFIL_YOLU,
    girisUrl: anahtar ? `${SITE}/deneme-hesabi?k=${anahtar}` : null,
    sonSifirlama: typeof am.deneme_sifirlama === 'string' ? am.deneme_sifirlama : null,
  };
}

/** Gönderilen bağlantıdaki anahtar geçerli mi? (sabit zamanlı karşılaştırma) */
export async function demoAnahtarGecerli(db: SupabaseClient, k: unknown): Promise<boolean> {
  const verilen = typeof k === 'string' ? k.trim() : '';
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(verilen)) return false;
  const u = await demoKullanicisi(db);
  const dogru = (u?.app_metadata as any)?.deneme_anahtar;
  if (typeof dogru !== 'string') return false;
  const a = Buffer.from(verilen), b = Buffer.from(dogru);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Panel girişi için tek kullanımlık giriş kodu (e-posta GÖNDERİLMEZ; kod sunucuda
 * hemen kullanılır). Hesabın e-postası değiştirilmişse önce geri alınır.
 */
export async function demoGirisKodu(db: SupabaseClient): Promise<string> {
  const u = await demoKullanicisi(db);
  if (!u) throw new Error('Deneme hesabı kurulu değil');
  if (u.email !== DEMO_EPOSTA) await kullaniciyiHazirla(db);
  const { data, error } = await db.auth.admin.generateLink({ type: 'magiclink', email: DEMO_EPOSTA });
  const kod = data?.properties?.hashed_token;
  if (error || !kod) throw new Error('Giriş kodu üretilemedi: ' + (error?.message || 'bilinmeyen'));
  return kod;
}
