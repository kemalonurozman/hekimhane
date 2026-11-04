// ─────────────────────────────────────────────────────────────────
//  Ozvelo bağlantısı — ayarlar ve imzalar (YALNIZ SUNUCU).
//
//  Hekimhane ile Ozvelo aynı paylaşılan sırla (OZVELO_IMZA_SIRRI) birbirini
//  doğrular. Her kullanım için ayrı bir bağlam öneki vardır; böylece bir yöne
//  atılmış imza başka bir yerde geçerli sayılmaz:
//    hk-ozvelo-istek  Hekimhane → Ozvelo API istekleri
//    hk-ozvelo-olay   Ozvelo → Hekimhane olay bildirimleri
//    hk-ozvelo-jeton  şifresiz geçiş / "Hekimhane ile giriş yap" jetonları
//
//  Ayarlardan biri eksikse bağlantı KAPALIDIR (ozveloAcik() false): hiçbir
//  istek gitmez, panel "yakında" der, site bozulmaz.
//  Sözleşme: docs/ozvelo-partner-baglantisi.md
// ─────────────────────────────────────────────────────────────────
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export const OZVELO_TURLER = ['klinik', 'doktor'] as const;
export type OzveloTur = (typeof OZVELO_TURLER)[number];
export const ozveloTuruMu = (t: unknown): t is OzveloTur => OZVELO_TURLER.includes(t as OzveloTur);

const temizUrl = (s: string | undefined) => (s || '').trim().replace(/\/+$/, '');

export function ozveloAyar() {
  return {
    /** Partner API kökü, ör. https://ozvelo.com/api/partner/v1 */
    apiUrl: temizUrl(process.env.OZVELO_API_URL),
    /** Ozvelo'nun Hekimhane'ye verdiği partner anahtarı (Bearer) */
    anahtar: (process.env.OZVELO_PARTNER_ANAHTARI || '').trim(),
    /** İki tarafın imza sırrı */
    sir: (process.env.OZVELO_IMZA_SIRRI || '').trim(),
    /** Ozvelo sitesi: şifresiz geçiş ve widget betiği buradan */
    siteUrl: temizUrl(process.env.OZVELO_SITE_URL) || 'https://ozvelo.com',
  };
}

/** Bağlantı kurulu mu? Üç ayar da tanımlıysa evet. */
export function ozveloAcik(): boolean {
  const a = ozveloAyar();
  return !!(a.apiUrl && a.anahtar && a.sir.length >= 32);
}

/** Ozvelo'daki işletmenin Hekimhane tarafındaki kalıcı kimliği. */
export const disKimlik = (tur: string, id: string) => `hekimhane:${tur}:${id}`;

export function disKimlikCoz(dk: unknown): { tur: OzveloTur; id: string } | null {
  const m = /^hekimhane:(klinik|doktor):([A-Za-z0-9_-]{1,64})$/.exec(String(dk || ''));
  return m ? { tur: m[1] as OzveloTur, id: m[2] } : null;
}

/* ── İstek / olay imzası ───────────────────────────────────────────
   Başlık biçimi: "t=<unix saniye>,v1=<hex>"; imzalanan metin "<bağlam>.<t>.<gövde>". */

type Baglam = 'hk-ozvelo-istek' | 'hk-ozvelo-olay';

function hmacHex(baglam: string, metin: string): string {
  return createHmac('sha256', ozveloAyar().sir).update(`${baglam}.${metin}`).digest('hex');
}

export function imzaBasligi(baglam: Baglam, govde: string, simdi = Date.now()): string {
  const t = Math.floor(simdi / 1000);
  return `t=${t},v1=${hmacHex(baglam, `${t}.${govde}`)}`;
}

const esit = (a: string, b: string) => {
  const x = Buffer.from(a, 'utf8'), y = Buffer.from(b, 'utf8');
  return x.length === y.length && timingSafeEqual(x, y);
};

/** İmza geçerli ve en çok `maksYasSn` saniye önce atılmışsa true. Sır yoksa hep false. */
export function imzaDogrula(baglam: Baglam, baslik: string | null, govde: string, maksYasSn = 300, simdi = Date.now()): boolean {
  if (!baslik || ozveloAyar().sir.length < 32) return false;
  const p = Object.fromEntries(baslik.split(',').map(s => s.trim().split('=') as [string, string]));
  const t = Number(p.t);
  if (!Number.isInteger(t) || !/^[0-9a-f]{64}$/.test(p.v1 || '')) return false;
  if (Math.abs(simdi / 1000 - t) > maksYasSn) return false;
  return esit(p.v1, hmacHex(baglam, `${t}.${govde}`));
}

/* ── Jetonlar (şifresiz geçiş, "Hekimhane ile giriş yap") ──────────
   Biçim: base64url(JSON) + "." + base64url(HMAC). Ozvelo doğrular, `jti`'yi
   bir kez kullanır (tekrar oynatma), `exp`'i (5 dk) kontrol eder. */

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export interface JetonGovdesi {
  iss: 'hekimhane';
  aud: 'ozvelo';
  amac: 'gecis' | 'giris';
  iat: number;
  exp: number;
  jti: string;
  [k: string]: unknown;
}

export function jetonUret(amac: JetonGovdesi['amac'], veri: Record<string, unknown>, sureSn = 300, simdi = Date.now()): string {
  const iat = Math.floor(simdi / 1000);
  const govde: JetonGovdesi = { ...veri, iss: 'hekimhane', aud: 'ozvelo', amac, iat, exp: iat + sureSn, jti: randomUUID() };
  const p = b64(JSON.stringify(govde));
  const imza = createHmac('sha256', ozveloAyar().sir).update(`hk-ozvelo-jeton.${p}`).digest();
  return `${p}.${b64(imza)}`;
}

/** Test ve Ozvelo tarafı için örnek doğrulayıcı (Hekimhane kendi jetonunu çözmez). */
export function jetonCoz(jeton: string, simdi = Date.now()): JetonGovdesi | null {
  const [p, s] = String(jeton || '').split('.');
  if (!p || !s || ozveloAyar().sir.length < 32) return null;
  const beklenen = b64(createHmac('sha256', ozveloAyar().sir).update(`hk-ozvelo-jeton.${p}`).digest());
  if (!esit(s, beklenen)) return null;
  try {
    const g = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as JetonGovdesi;
    if (g.iss !== 'hekimhane' || g.aud !== 'ozvelo' || g.exp < simdi / 1000) return null;
    return g;
  } catch { return null; }
}

/**
 * "Hekimhane ile giriş yap" dönüş adresi yalnız Ozvelo sitesinin /partner/ yoluna
 * gidebilir — başka bir siteye jeton taşınmasın (açık yönlendirme yok).
 */
export function donusAdresiGecerli(donus: unknown): URL | null {
  try {
    const u = new URL(String(donus || ''));
    const site = new URL(ozveloAyar().siteUrl);
    if (u.origin !== site.origin || !u.pathname.startsWith('/partner/')) return null;
    if (u.username || u.password) return null;
    return u;
  } catch { return null; }
}

/** "Ozvelo'ya giriş yap" düğmesinin açabileceği Ozvelo ekranları (sözleşme 3. madde). */
export const OZVELO_HEDEFLER = ['genel', 'gelen-kutusu', 'eposta', 'randevular', 'soru-cevap', 'bildirimler', 'asistan'] as const;
export type OzveloHedef = (typeof OZVELO_HEDEFLER)[number];
export const ozveloHedefi = (h: unknown): OzveloHedef => (OZVELO_HEDEFLER.includes(h as OzveloHedef) ? h as OzveloHedef : 'genel');
