# CLAUDE.md — Hekimhane Teknik Notlar

Bu dosya, Hekimhane projesinin mimari kararlarını, kritik detaylarını ve geliştirme
sırasında dikkat edilmesi gereken noktaları içerir. Her yeni oturumda bu dosyayı
oku — projenin tüm bağlamını sağlar.

---

## Proje Genel Bakış

**Hekimhane**, Türkiye genelindeki klinikleri, hastaneleri, doktorları ve eczaneleri
listeleyen bir sağlık rehberi web sitesidir. İşletme sahipleri profillerini talep edip
yönetebilir (claim); ziyaretçiler sehir/ilçe/uzmanlık gibi filtrelerle arama yapabilir.

- **Stack:** Next.js 14 (App Router) + TypeScript + Supabase
- **Frontend:** Server Components (default) + Client Components (etkileşim gerektiğinde)
- **Veritabanı:** Supabase (PostgreSQL) — tüm veri buradan çekiliyor
- **Auth:** Supabase Auth — şu an yalnızca Google OAuth aktif
- **Deploy:** `npm run dev` → localhost:3000

---

## Klasör Yapısı

```
app/                    → Next.js App Router rotaları
  page.tsx              → Ana sayfa (Server Component, stats Supabase'den)
  layout.tsx            → Global layout (Navbar + Footer)
  globals.css           → CSS değişkenleri ve global stiller
  klinikler/            → Klinik listeleme + detay sayfaları
  hastaneler/           → Hastane listeleme + detay sayfaları
  doktorlar/            → Doktor listeleme + detay sayfaları
  eczaneler/            → Eczane listeleme + detay sayfaları
  hastaliklar/          → Hastalık rehberi (statik veri, Supabase yok)
    page.tsx            → Tüm kategoriler
    [kategori]/         → Kategori sayfası
    [kategori]/[hastalik]/ → Hastalık detay sayfası
  blog/                 → Blog listeleme + detay
  panel/                → İşletme sahibi yönetim paneli (auth zorunlu)
  giris/                → Google OAuth giriş sayfası
  katil/                → İşletme kayıt / sahiplenme başvurusu
  sahiplen/             → Claim (sahiplenme) akışı

components/             → Paylaşılan bileşenler
  Navbar.tsx            → 'use client' — auth durumu, dropdown menü
  KategoriKartlari.tsx  → 'use client' — hover etkileşimi olan ana sayfa kartları
  KlinikCard.tsx        → Klinik liste kartı
  HastaneCard.tsx       → Hastane liste kartı
  DoktorCard.tsx        → Doktor liste kartı
  EczaneCard.tsx        → Eczane liste kartı
  ListingLayout.tsx     → Listeleme sayfaları için ortak iskelet
  ListMap.tsx           → Harita görünümü
  FilterPanel.tsx       → Filtre paneli
  ProfilSayfasi.tsx     → İşletme profil sayfası şablonu
  Footer.tsx            → Global footer

lib/
  types.ts              → Tüm TypeScript tipleri (Klinik, Hastane, Doktor, Eczane...)
  hastaliklar-data.ts   → Tüm hastalık verisi (statik, 105+ hastalık)
  supabase.ts           → Server-side Supabase client (service role)
  supabase-browser.ts   → Client-side Supabase (anon key, tarayıcıda çalışır)
  supabase-server.ts    → Server Component için Supabase (cookie tabanlı session)
  helpers.ts            → Yardımcı fonksiyonlar

middleware.ts           → /panel rotaları auth koruması + session yenileme
scripts/                → Veri migration ve geocoding scriptleri
supabase/schema.sql     → Veritabanı şeması (SQL)
```

---

## Veritabanı Tabloları (Supabase)

| Tablo        | Açıklama                                    | Temel Alanlar                                        |
|--------------|---------------------------------------------|------------------------------------------------------|
| `klinikler`  | Diş klinikleri ve özel muayenehaneler       | id, name, il, ilce, slug, specs[], claimed, tour360url |
| `hastaneler` | Devlet, özel ve üniversite hastaneleri      | id, name, type, il, docs, beds, claimed, tour360url  |
| `doktorlar`  | Uzman ve aile hekimleri                     | id, ad, soyad, spec, il, fee, verified, tour360url   |
| `eczaneler`  | Nöbetçi ve çevre eczaneler                  | id, name, pharmacist, nobetci, slug, tour360url      |
| `yorumlar`   | Tüm entityler için yorum ve puanlar         | entity_type, entity_id, rating, text                 |
| `blog_posts` | Blog içerikleri                             | title, slug, content, published                      |

**Önemli Alan Notları:**
- `slug` — URL için benzersiz tanımlayıcı (`istanbul-besiktas-xyz-klinigi`)
- `claimed` — İşletme sahibi tarafından talep edilip edilmediği
- `rat` / `rev` — Ortalama puan / yorum sayısı
- `specs[]` — PostgreSQL text dizisi (uzmanlık alanları)
- `lat` / `lng` — Harita koordinatları
- `tour360url` — 360° sanal tur linki (Matterport, YouTube 360°, iframe embed kodu) — **Migration: `supabase/migrations/add_tour360url.sql` çalıştırılmalı**

---

## Supabase Client Kullanımı — Kritik Kural

**Üç farklı client var, karıştırmayın:**

```typescript
// 1. Server Component veya API route içinde (cookie okuyabilir):
import { createServerComponentClient } from '@/lib/supabase-server';
// veya basit sorgular için:
import { supabase } from '@/lib/supabase';

// 2. Client Component içinde ('use client' olan dosyalar):
import { createSupabaseBrowser } from '@/lib/supabase-browser';
const supabase = createSupabaseBrowser();

// 3. Auth kontrolü gerektiren server tarafı işlemler:
// middleware.ts zaten bunu yönetiyor
```

---

## Hastalık Rehberi — Özel Mimari

Hastalık verileri Supabase'de **değil**, `lib/hastaliklar-data.ts` dosyasında
statik olarak tutulur. Bu dosya çok büyük (6000+ satır), dikkatli edit et.

**Veri Yapısı:**
```typescript
interface Hastalik {
  slug: string;
  ad: string;
  kategoriSlug: string;        // → KATEGORILER dizisindeki slug
  altKategoriSlug: string;     // → o kategorinin altKategoriler dizisindeki slug
  ozet: string;
  gorulmeOrani: string;
  yasGrubu: string;
  ciddiyeti: 'düşük' | 'orta' | 'yüksek';  // SADECE bu üç değer geçerli
  belirtiler: { baslik: string; aciklama: string }[];
  nedenler:   { baslik: string; aciklama: string }[];
  taniYontemleri: { ad: string; aciklama: string }[];
  tedaviSecenekleri: { tip: string; ikon: string; aciklama: string }[];  // ikon zorunlu
  riskFaktorleri: string[];
  korunmaYollari: string[];
  uzmanlik: string;
  ilgiliHastaliklar: string[];   // diğer hastalıkların slug'ları
  sikSorilanSorular: { soru: string; cevap: string }[];
}
```

**Sık Yapılan Hatalar:**
- `ciddiyeti` için `'Orta-Yüksek'` veya `'Yüksek'` (büyük harf) yazmak → TypeScript hatası
- `tedaviSecenekleri` içinde `ikon` alanını unutmak → TS2741 hatası
- Tek tırnaklı string içinde Türkçe kesme işareti (`'PKOS'ta`) → parse hatası, `PKOS\'ta` kullan
- `altKategoriSlug` değerinin KATEGORILER içinde tanımlı olmayan bir slug olması → 404

**URL Yapısı:**
```
/hastaliklar                          → Tüm kategoriler
/hastaliklar/[kategoriSlug]           → Bir kategorinin hastalıkları
/hastaliklar/[kategoriSlug]/[slug]    → Hastalık detay sayfası
```

**Mevcut Durum (Nisan 2026):** 105 hastalık, 12 kategori, tüm altKategoriSlug değerleri
KATEGORILER ile eşleştirilmiş ve TypeScript hatasız.

---

## Server vs Client Component Kuralı

Next.js 14 App Router'da **Server Component'lere event handler yazılamaz.**

**Doğru pattern:**
```
app/page.tsx (async Server Component)
  └── veriyi çekip prop olarak geçer
        └── components/KategoriKartlari.tsx ('use client' — hover, click vb.)
```

**Hata örneği:** `onMouseEnter` / `onMouseLeave` server component içinde kullanmak
→ "Event handlers cannot be passed to Client Component props" runtime hatası

---

## Auth & Yetkilendirme

- **Giriş yöntemi:** Yalnızca Google OAuth (`/giris` sayfası)
- **Korumalı rotalar:** `/panel/**` — middleware.ts tarafından yönetilir
- **Yönlendirme:** Giriş yapılmamışsa `/giris?redirect=/panel/...` adresine yönlendirir
- **Session yenileme:** `middleware.ts` her request'te `supabase.auth.getSession()` çağırır
- **Navbar:** `createSupabaseBrowser()` ile client-side session dinler, avatar + dropdown gösterir

---

## Tasarım Sistemi

**Renk Paleti:**
```css
--navy:  #1B3A69   /* Ana lacivert — başlık, buton */
--navy2: #163D6E   /* İkincil lacivert */
--gold:  #D4A843   /* Altın sarısı — vurgu, CTA */
--ivory: #FBF8F2   /* Sayfa arka planı */
--border: #E5E5EA  /* Kenarlık */
--muted: #6E6E73   /* İkincil metin */
```

**Tipografi (Apple tarzı):**
- Font family: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif`
- Başlıklar: `font-weight: 700`, `letter-spacing: -0.6px` ile `-2px` arası
- Gövde metin: `font-weight: 400-500`, `letter-spacing: .05-.1px`
- Küçük etiketler: `font-size: 11-12px`, `letter-spacing: 1px`, `text-transform: uppercase`

**İkon Kuralı:** Emoji kullanılmaz. Tüm ikonlar inline SVG olarak yazılır.

**Bileşen Stili:**
- Kartlar: `border-radius: 16-20px`, `border: 1px solid #E5E5EA`, `box-shadow: 0 1px 4px rgba(0,0,0,.05)`
- Butonlar: `border-radius: 9-14px`, padding orantılı
- Navbar: `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.88)`

---

## Sık Kullanılan Komutlar

```bash
# Geliştirme sunucusu
npm run dev               # localhost:3000

# TypeScript kontrolü (build olmadan)
npx tsc --noEmit

# Yalnızca hastalık verisi için TypeScript kontrolü
npx tsc --noEmit 2>&1 | grep "hastaliklar"

# Hastalık sayısı
grep -c "kategoriSlug:" lib/hastaliklar-data.ts

# Veri migration (Supabase'e)
npm run migrate
```

---

## Hata Yönetimi Felsefesi

LLM Council projesinden ilham alınan yaklaşım — tek bir hata tüm isteği çökertmemeli:

- **Supabase sorgu hataları:** `try/catch` ile sarılır; hata durumunda boş dizi veya
  varsayılan değer döndürülür, kullanıcıya genel bir hata mesajı gösterilir.
- **İstatistik çekme hatası:** `app/page.tsx`'teki `getStats()` hata alırsa
  `{ klinik: 0, hastane: 0, doktor: 0, eczane: 0 }` döndürür — sayfa yine de yüklenir.
- **Auth hataları:** Oturum alınamazsa `/giris`'e yönlendir, sessizce düşme.
- **Hastalık verisi:** Statik dosyadan geldiği için Supabase bağlantısına bağımlı değil;
  `/hastaliklar` sayfaları her zaman çalışır.
- **Hiçbir zaman:** Tek bir eksik veri nedeniyle tüm sayfayı beyaz ekrana düşürme.

```typescript
// Doğru pattern — graceful degradation
async function getStats() {
  try {
    const [k, h, d, e] = await Promise.all([...]);
    return { klinik: k.count || 0, ... };
  } catch {
    return { klinik: 0, hastane: 0, doktor: 0, eczane: 0 }; // sayfa yine render olur
  }
}
```

---

## Test Notları

Projeyi test ederken kullanılacak adımlar:

```bash
# 1. TypeScript derleme kontrolü (build olmadan, hızlı)
npx tsc --noEmit

# 2. Yalnızca hastalık verisi için kontrol
npx tsc --noEmit 2>&1 | grep "hastaliklar"

# 3. Geliştirme sunucusunu başlat ve tarayıcıda kontrol et
npm run dev
# → localhost:3000

# 4. Kritik sayfaları manuel test et:
# localhost:3000                         → Ana sayfa (stats yükleniyor mu?)
# localhost:3000/hastaliklar             → 105+ hastalık listeleniyor mu?
# localhost:3000/hastaliklar/kardiyoloji → Kategori sayfası çalışıyor mu?
# localhost:3000/hastaliklar/kardiyoloji/hipertansiyon → Detay sayfası?
# localhost:3000/panel                   → Auth yönlendirmesi çalışıyor mu?
# localhost:3000/giris                   → Google OAuth butonu görünüyor mu?
# localhost:3000/blog                    → Kategori filtreleme çalışıyor mu?
# localhost:3000/katil                   → Belge + fotoğraf + 360° alanları var mı?
# Panel → Profilimi Düzenle              → tour360url textarea görünüyor mu?
# [İşletme profil] → 360° Tur sekmesi   → tour360url varsa sekme görünüyor mu?

# 5. Supabase bağlantı testi (isteğe bağlı)
node -e "require('./lib/supabase.ts')" 2>&1
```

**Eklenecek yeni hastalık sonrası kontrol listesi:**
1. `npx tsc --noEmit` → sıfır hastaliklar hatası
2. `grep -c "kategoriSlug:" lib/hastaliklar-data.ts` → beklenen sayı
3. `altKategoriSlug` değerinin KATEGORILER'de tanımlı olduğunu doğrula
4. `ciddiyeti` değerinin `'düşük' | 'orta' | 'yüksek'` olduğunu kontrol et
5. `tedaviSecenekleri` her öğesinde `ikon` alanının bulunduğunu kontrol et

---

## UI/UX Prensipleri

Tasarım kararlarını yönlendiren ilkeler (Apple HIG'den esinlenen yaklaşım):

**Şeffaflık:** Kullanıcı her zaman ne gördüğünü anlayabilmeli.
- İşletme profili `claimed: false` ise "Sahiplenilmemiş" rozeti göster
- Yorum sayısı 0 ise boş yıldız gösterme, "Henüz yorum yok" yaz
- Filtre uygulanmışsa kaç sonuç bulunduğunu açıkça belirt

**Güven:** Sağlık sektöründe kullanıcı güveni kritik.
- `verified: true` doktorlarda mavi onay rozeti
- Her sayfada "Bu bilgiler genel amaçlıdır, doktora başvurun" uyarısı
- Hastalık rehberinde kaynak belirtimi

**Hız:** Server Component'ler varsayılan; sadece etkileşim gerektiğinde `'use client'`.
- Listeleme sayfaları server-side render → SEO ve ilk yükleme hızı
- Filtreler URL query string ile yönetilir → geri tuşu ve paylaşım çalışır
- Harita bileşeni lazy load → ağır bileşen sayfa yüklemesini bloklamaz

**Tutarlılık:** Tüm sayfalarda aynı bileşen dili.
- Kartlar: `border-radius: 16-20px`, `border: 1px solid #E5E5EA`
- Butonlar: `border-radius: 9-14px`
- İkonlar: sadece inline SVG, emoji yok
- Yazı tipi: `-apple-system` ailesi, `letter-spacing` negatif başlıklarda

---

## Bilinen Önceden Var Olan TypeScript Hataları

`npx tsc --noEmit` çalıştırıldığında bu dosyalarda hata görünmesi normaldir,
bizim yazdığımız kodlarla ilgisi yoktur:

- `doktorlar/page.tsx` — `'il'`, `'spec'` property `never` type (liste sayfası)
- `klinikler/page.tsx` — `'id'`, `'name'` property `never` type (liste sayfası)
- `eczaneler/page.tsx` — `'il'`, `'nobetci'` property `never` type (liste sayfası)
- `hastaneler/page.tsx` — `'page'` incompatible with index signature (liste sayfası)
- `api/auth/` — parametre `'any'` tip hatası
- `api/panel/update-entity/route.ts` — parametre `'name'` `'any'` tip hatası

**NOT:** Liste sayfaları (page.tsx) `never` tipine düşüyor çünkü Supabase JS client'ın
generic tip çözümlemesi bu dosyalarda başarısız oluyor. **Detay sayfaları** (`[slug]/page.tsx`)
explicit `as Tip` cast ile düzeltilmiştir — bu sayfalar hatasız çalışır.

---

## Yeni Özellikler — Nisan 2026

### 360° Sanal Tur
- Tüm 4 işletme tipine `tour360url TEXT` kolonu eklendi (migration: `supabase/migrations/add_tour360url.sql`)
- `ProfilSayfasi.tsx` — `extractTourSrc()` fonksiyonu: düz URL veya `<iframe...>` embed kodunu otomatik ayırt eder
- Tab bar: `tour360url` dolu ise "360° Tur" sekmesi görünür; boşsa gizlenir
- Panel EditProfileTab: tüm tipler için `tour360url` textarea alanı eklendi
- Profil sayfaları `export const dynamic = 'force-dynamic'` — fetch cache devre dışı

### Blog Sayfası Ayrımı
- `app/blog/page.tsx` → Server Component (veri çekme)
- `app/blog/BlogInteractive.tsx` → Client Component (kategori filtre, newsletter, hover)

### İşletme Kayıt Formu (katil/page.tsx)
- `DocSlot` bileşeni: 4 belge yükleme slotu (Vergi Levhası, Sicil, İmza, Kimlik)
- `PhotoSlot` bileşeni: 6 fotoğraf slotu (drag-and-drop, önizleme, kapak etiketi)
- 360° tur linki / embed kodu alanı (iki sekme: Link + Önizleme)

### Panel — Profil Düzenleme
- `EditProfileTab`: tüm işletme türleri için form (klinik/hastane/doktor/eczane)
- `/api/panel/update-entity` API route: whitelist tabanlı güvenli güncelleme
- Claim onaylı işletmeler için Dashboard'da "Düzenle" butonu

### TypeScript Tip Güncellemeleri
- `Klinik`, `Hastane`, `Doktor`, `Eczane` interface'lerine `tour360url: string | null` eklendi
- `Eczane` interface'ine `rat`, `rev`, `claimed` eklendi
- 4 detay sayfasına explicit type cast (`as Hastane | null` vb.) eklendi

---

## Yeni Özellikler — Ağustos 2026

### E-posta Sistemi (Resend)
- `lib/email.ts` — `sendEmail()` (Resend), `mailShell(baslik, govde)` markalı HTML şablonu, `satir(etiket, değer)`.
  - **Graceful:** `RESEND_API_KEY` yoksa sessizce atlar (akış bozulmaz). Domain doğrulandı → gönderen `bildirim@hekimhane.com.tr`.
  - Şablon header + footer'daki "hekimhane.com.tr" tıklanır link (`https://www.hekimhane.com.tr`).
- **Env:** `RESEND_API_KEY` **Vercel'de tanımlı olmalı** (Production). Yoksa hiçbir mail gitmez. Opsiyonel `RESEND_FROM`.
- **Tuzak:** `<style>` **blok metnine** tırnak koyma → hydration uyumsuzluğu. E-posta HTML'inde (string) tırnak sorun değil.

### Randevu Talebi Sistemi
- **API:** `app/api/randevu-talebi/route.ts` → `randevu_talepleri` tablosuna yazar; yoksa `cekim_talepleri`'ne düşer. Honeypot + IP rate-limit.
- **Form:** `ProfilSayfasi.tsx` içindeki `RandevuModal` — "Randevu Al" **doğrudan popup açar**. Tarih seçici (`<input type=date>`, min bugün) + saat dilimi `<select>`; `tercih` metni bunlardan üretilir. Buton pasif kalmaz; eksik alanda uyarı verir. CSS `RANDEVU_MODAL_CSS` (tırnaksız `<style>`).
- **Mailler:** admin (`kemalonurozman@gmail.com`) + işletme sahibi (onaylı claim e-postası varsa) + hasta (e-posta bıraktıysa onay).
- **E-posta listesi yakalama:** hasta e-posta bıraktıysa `email_aboneleri`'ne `kaynak='randevu'` ile eklenir.
- **Admin görünüm:** panel "Randevu & Çekim" sekmesi (kaynak filtresi Randevu/Çekim, yeşil RANDEVU rozeti, sidebar bekleyen-randevu sayacı).
- **İşletme sahibi görünüm:** panel "Randevu Talepleri" sekmesi (`/api/panel/randevu-talepleri`, sahiplik onaylı claim entity_id eşleşmesiyle; durum: yeni/arandı/tamamlandı).

### Sahiplenme (Claim) Akışı — uçtan uca
- **Gönderim:** 3 yol (**/sahiplen, panel NewClaimTab, katil sayfası**) artık hepsi **`/api/claim`** (service-role) üzerinden yazar — `claim_requests` RLS özyinelemesini aşar. Gönderince admin + talep sahibine mail ("24 saat içinde değerlendirilir").
- **Onay:** admin panel → `/api/admin/claim-action` (`notify` sorulur: "kullanıcıya mail?"). Onayda: `claimed=true` + auth kullanıcısı garanti edilir + **`account_activations`** tablosuna tek-kullanımlık token yazılır + kullanıcıya **aktivasyon linki** maili.
- **Aktivasyon:** `/hesap-aktivasyon?token=...` (`app/api/hesap/aktivasyon/route.ts`) — e-posta **ön-dolu (readOnly)**, kullanıcı **şifresini 2 kez** girer → şifre set + auto giriş → panelde işletmesini yönetir (e-posta eşleşmesiyle sahiplik).
- **KRİTİK migration:** `supabase/migrations/add_account_activations.sql` **çalıştırılmış olmalı**; yoksa token yazılamaz, aktivasyon linki çalışmaz.

### Admin Güvenlik
- **Coğrafi kısıt (middleware.ts):** `/admin` ve `/api/admin/*` yalnızca **TR + CZ** (`x-vercel-ip-country`). Diğer ülkelerden 403. Ülke boşsa (localhost) engellenmez. `ALLOWED = ['TR','CZ']`.
- **`app/admin/layout.tsx`** `force-dynamic` — admin sayfaları cache'lenmesin ki middleware her istekte çalışsın.
- **Giriş uyarısı:** başarılı admin girişinde `/api/admin/login-alert` (access_token doğrulamalı) → admin adresine zaman+IP+cihaz maili.
- **Admin listeleri service-role API'den:** `claim_requests` tarayıcıda RLS özyinelemesi ("infinite recursion in profiles") verdiği için `/api/admin/claims` (+ stats) service-role ile okur. Talepler sekmesi her açılışta taze çeker.
- **Admin girişi:** `kemalonurozman@gmail.com` (Supabase Auth, şifre `app/api/admin/setup/route.ts`'te seed). Yalnızca bu e-posta admin panelini görür.

### Devlet Ağız ve Diş Sağlığı Hastaneleri (ayrı kategori)
- Mevcut `hastaneler` (type='Devlet') + `doktorlar` (`tags=['devlet-dis-hastanesi', spec]`, `clinic_name`=hastane adı). DDL yok.
- **Gizleme:** `/doktorlar`'ın 4 sorgusunda `.not('tags','cs','{devlet-dis-hastanesi}')` → standart doktor aramasında görünmezler.
- **Sayfalar:** `/devlet-dis-hastaneleri` (il il) + `/[il]/[slug]` (bölüm bölüm). Veri: `lib/devlet-dis.ts`.
- **Import:** `node scripts/import-devlet-dis.js <csv> --commit` (elle `HOSP` map: csvName→{q,il,ilce}; q ile mevcut hastaneyi bulur ya da oluşturur). Durum: ~35 hastane / ~2653 hekim.
- **Tuzak:** `toLocaleLowerCase('tr')` İ'de combining-dot üretir → ilçe casing'i elle temizle.

### SEO + Marka
- **Favicon:** H monogramı (lacivert kare + beyaz H + altın orta bar). `app/icon.svg` + `favicon.ico` (16/32/48) + `apple-icon.png` + `app/manifest.ts`. Google güncellemesi haftalar sürebilir (`s2/favicons` ile teşhis edilebilir).
- **Kombinasyon SEO sayfaları:** `/dis-tedavileri/[il]/[...seg]` (il+uzmanlık, ilçe+uzmanlık, tedavi), `/klinikler/[il]/[ilce]` landing, FAQPage JSON-LD (`lib/faq.ts`: buildKlinikFaq/buildDoktorFaq/buildEczaneFaq).
- **Sitemap ağacı:** `app/sitemap.xml` (index) + `sitemap-{genel,klinikler,dis-tedavileri,hastaneler,doktorlar,eczaneler}.xml`. `lib/sitemap-data.ts`. RSS: `app/rss.xml`.
- **Karşılaştırma:** `components/CompareButton.tsx` (corner variant absolute) + `CompareBar.tsx`. Kart isimlerinde float `-shim span` ile buton çakışması önlendi.

### Yorum Şikayet / Moderasyon Akışı
- **Amaç:** İşletme sahibi istenmeyen yorumu şikayet eder; **son kararı yalnızca admin verir** (gizle / kalıcı sil / reddet).
- **Migration (ŞART):** `supabase/migrations/add_yorum_moderation.sql` — `yorumlar` tablosuna `hidden bool`, `report_status text` (null|pending|resolved|dismissed), `report_reason`, `reported_by`, `reported_at`, `admin_note`.
- **Sahip tarafı:** panel **Yorum Inbox** (`app/panel/yorumlar`) — her yorum kartında `YorumSikayet.tsx` ile "Bu yorumu şikayet et" + gerekçe. Gönderim `/api/panel/report-yorum` (session + onaylı claim e-posta eşleşmesi doğrulanır, reply-yorum ile aynı desen). Şikayet edince admin'e mail. Sonuç rozetle görünür (inceleniyor/kaldırıldı/reddedildi).
- **Admin tarafı:** admin panel **Şikayetler** sekmesi (`SikayetlerTab`). Liste `/api/admin/reported-yorumlar` (service-role, entity isim çözümlemesi), aksiyonlar `/api/admin/yorum-action` (`hide`/`delete`/`dismiss`/`unhide`). Sidebar'da bekleyen şikayet sayacı (kırmızı rozet, `reportPending`).
- **Gizleme herkese yansır:** 4 detay sayfası + kart sayfası `yorumlar`'ı **JS'te `.filter(y => !y.hidden)`** ile eler (kolon yoksa `undefined` → gösterilir; migration'dan önce sayfa bozulmaz — graceful). Not: `hidden` işlemi entity'nin `rat`/`rev` sayılarını değiştirmez, yalnız yorum metnini gizler.

### İş Ortağı İçeriği — Makale Yayınlama (`/makale-yayinla`)
- **Amaç:** Klinik/firma ücretli "iş ortağı makalesi" sipariş eder; proforma e-posta ile gönderilir.
- **Sayfa:** `app/makale-yayinla/page.tsx` (Server — metadata + Supabase'den klinik/hekim sayacı) → `MakaleYayinlaClient.tsx` (`'use client'`, tüm bölümler + iki form). Bölümler: hero+istatistik, neden, nasıl çalışır, **fiyat** (`#fiyat`), makale önizleme, **sipariş** (`#siparis`), soru formu.
- **Fiyat tek noktadan:** `lib/makale-fiyat.ts` — `MAKALE_FIYAT`, `KDV_ORANI`, `PAKET_ICERIK`, `tl()`. Sayfa **ve** e-postalar buradan okur; başka yerde fiyat yazılı değil. **Tek paket, tek fiyat** — Doktor.cz'deki ek modüller (3 bağlantı, ana sayfa, öne çıkarma, bülten) pakete dahildir, ayrı satır yoktur.
- **Aylık ziyaretçi rakamı:** `page.tsx` içindeki `AYLIK_ZIYARETCI` sabiti — **placeholder**, gerçek analytics değeriyle güncellenmeli. Klinik/hekim sayaçları Supabase'den gerçek.
- **API:** `app/api/makale-talebi/route.ts` — `tip: 'siparis' | 'soru'`. Honeypot (`hp`) + IP rate-limit. **DDL yok:** kayıtlar `cekim_talepleri`'ne `isletme_turu='makale-siparis'|'makale-soru'` ile yazılır, `notlar` alanında `[MAKALE SİPARİŞİ]` / `[MAKALE SORUSU]` önekiyle detay durur → admin panelinin Çekim listesinde görünür.
- **Mailler:** admin'e sipariş/soru bildirimi + müşteriye onay (proforma 1 iş günü). `RESEND_API_KEY` yoksa sessizce atlanır, form yine çalışır.
- **Tuzak:** fiyat metinlerinde `toLocaleString` kullanma — SSR/CSR farkı hydration uyumsuzluğu yapar; `lib/makale-fiyat.ts`'teki `tl()` regex ayracı kullanılır.

### Makale Gönderim / Onay Akışı (panel → admin → blog)
- **Amaç:** İşletme sahibi panelden makale yazar → **admin onaylar** → blogda yayınlanır. Admin ayrıca kendi makalesini doğrudan yayınlar.
- **Migration (ŞART):** `supabase/migrations/add_makale_gonderim.sql` — `blog_posts`'a `status` (pending|published|rejected), `author_email`, `entity_id/type/name`, `okuma_dk`, `red_notu`, `kaynak`, `sponsorlu`, `website`. Yoksa API'ler graceful davranır (admin yazısı temel kolonlarla yazılır, panel gönderimi net hata mesajı verir).
- **İçerik biçimi:** `content` **düz metin** (HTML değil — XSS yüzeyi yok). `## ` ara başlık, `- ` madde, boş satır paragraf. Parser + slug + okuma süresi: `lib/makale-icerik.ts` (`parseGovde` → statik bloglarla aynı `BlogBlok[]`).
- **Panel:** `app/panel/MakalelerimTab.tsx` (sidebar → İçerik → Makalelerim). Onaylı claim şartı. Durum rozetleri; reddedilen yazı **editör notuyla** görünür, düzenleyip yeniden gönderilebilir. API `app/api/panel/makale/route.ts` (GET/POST/PUT/DELETE; yayındaki yazı silinemez/düzenlenemez).
- **Admin:** `app/admin/MakalelerTab.tsx` (sidebar "Makaleler", bekleyen sayısı rozetle). Filtreler bekleyen/yayında/reddedilen, satır içi önizleme, Onayla/Reddet(gerekçeli)/Yayından kaldır/Sil + "Yeni Makale" (taslak seçeneği, iş ortağı etiketi). API `app/api/admin/makale/route.ts` (GET/POST/PATCH). Onay/red yazara mail atar.
- **Blog tarafı:** `/blog` listesi DB + statik yazıları **birleştirir** (eskiden DB doluysa statikler gizleniyordu). `/blog/[slug]` statikte bulamazsa `blog_posts`'tan okur (async, `revalidate=300`), `sponsorlu` ise "İş Ortağı İçeriği" şeridi ve `website` bağlantısı gösterir.
- **Tuzak:** blog listesinde `noStore()` **şart** — Next Data Cache sabit Supabase sorgusunu süresiz cache'ler, yeni onaylanan makale görünmez ([[nextjs-datacache-filter-stale]] ile aynı tuzak).

### Diş Tedavileri Combo Sayfaları — 404 yerine dürüst fallback
- **Sorun:** `/dis-tedavileri/[il]/[...seg]` bölgede o hizmetle etiketli klinik yoksa 404 veriyordu. Ölçüm: 44 il × 11 uzmanlık = 484 kombinasyonun **367'si** boştu (yalnızca "Genel Diş Hekimliği" tam doluydu) — çünkü import kaynağı kliniklerin çoğuna sadece jenerik etiket veriyor.
- **İki gerçek hata düzeltildi (`lib/uzmanlik-data.ts`):**
  1. `DENTAL_SYNONYMS` genişletildi — tedavi adları ilgili uzmanlığın altına eklendi. "Zirkonyum Kaplama" etiketli klinik `/bartin/zirkonyum-kaplama`'da görünmüyordu.
  2. **`overlaps` virgül tuzağı:** `.overlaps('specs', [...])` değerleri `ov.{a,b,c}` olarak birleştirir; içinde virgül olan etiket ("Ağız, Diş ve Çene Cerrahisi") ikiye bölünüp "Ağız" gibi alakasız etiketlerle eşleşiyordu. `specFilterValues()` virgüllü değerleri çift tırnağa alır — **yeni `overlaps` çağrılarında bu fonksiyonu kullan.**
- **Fallback (veriye dokunmadan):** kapsamda etiketli klinik yoksa `genelListe=true` → (a) hizmeti **fiilen etiketlemiş en yakın klinikler** (`enYakinlar()`: önce aynı ilin diğer ilçeleri, sonra `IL_KONUM` üzerinden haversine ile en yakın iller, ilk 6; her kartın üstünde "Bursa — İstanbul'a yaklaşık 93 km" rozeti) + (b) bölgenin kendi diş klinikleri, üstte şeffaflık notu ve düzeltilmiş SSS metniyle. Başlık/description de değişir.
- **Karar:** klinik kayıtlarına doğrulanmamış hizmet etiketi **yazılmadı** — sağlık rehberinde gerçek işletme hakkında yanlış iddia olurdu. Fallback sayfaları sitemap'e de eklenmedi (aynı klinik listesi 11 başlıkta → yinelenen içerik riski); sitemap yalnızca veri destekli kombinasyonları listeler.

### Sahiplenilmemiş Profil Mührü
- `components/ProfilSayfasi.tsx` — logo üzerindeki tırtıklı mühür üç durumlu: **premium** (altın ✓), **claimed** (lacivert ✓), **sahiplenilmemiş** (çelik mavi **+**, eskiden %50 opak gri).
- Sahiplenilmemişte mühür tıklanabilir (`/sahiplen?id=…&type=…`), hafif nabız animasyonu var ve üzerine gelince profesyonel davet balonu açılır.
- **Tuzak:** hero `overflow:hidden` — balon `position:fixed` ve konumu React state'ten (`sealTip`) hesaplanır; absolute konumlandırma kırpılıyordu. Yukarıda yer yoksa (`r.top < 260`) balon aşağı açılır (`hk-tip--alt`), yatayda viewport'a klemplenir.

### Stripe Ödeme Sistemi — Hekimhane-Pro (aylık 150 TL)
- **Ürün:** Stripe Product Catalog → `Hekimhane-Pro`, `prod_VA4Ez1eZ6NPoBm`, 150 TL/ay abonelik.
- **Fiyat çözümü (`lib/stripe.ts` → `getProPriceId()`):** önce `STRIPE_PRICE_MONTHLY` env → yoksa ürünün Stripe'daki varsayılan fiyatı (API'den, modül seviyesinde cache) → son çare eski `STRIPE_PRICE_YEARLY`. **Fiyat kodda sabit değil** — Stripe'da değiştirmek yeter. UI'da görünen metin ayrı: `lib/pro-plan.ts` (`PRO_AYLIK_TL`).
- **Rotalar:** `checkout` (abonelik başlat) · `portal` (iptal/kart/fatura — Stripe Müşteri Portalı) · `subscription` (panel için durum okuma) · `webhook` (premium bayrağını yönetir).
- **Yetki:** dördü de `lib/stripe-owner.ts` → `verifyOwner()` kullanır: oturum + `claim_requests`'te `status='approved'` e-posta eşleşmesi. Stripe çağrısından **önce** çalışır, böylece anahtar yokken bile yetkisiz istek 401 alır.
- **Premium bayrağı yalnız webhook'tan değişir:** `checkout.session.completed` → `premium=true`; `customer.subscription.updated/deleted` → `active|trialing` dışında `premium=false`. İmzasız istek 400 — kimse dışarıdan premium açamaz.
- **Metadata düşerse:** abonelik olayında `entity_type/entity_id` yoksa `premium_subscriptions`'tan `stripe_subscription_id` ile bulunur (Stripe panelinden elle açılan abonelikler kaybolmasın).
- **Panel butonu üç durumlu** (`app/panel/page.tsx`): `past_due|unpaid|incomplete` → "Ödeme Sorunu · Kartı Güncelle" (portal) · `active|trialing` → "Aboneliği Yönet" (portal) · yoksa → "Pro'ya Yükselt". **Tuzak:** ödeme sorunlu abonede "Yükselt" göstermek mükerrer abonelik doğurur — bu yüzden durum `subsMap`'ten okunur, tek başına `premium` bayrağından değil.
- **`premium_subscriptions` tarayıcıya kapalı:** abone e-postası + Stripe ID'leri içerir, RLS'te politika yok (yalnız service-role). Panel durumu bu yüzden `/api/stripe/subscription` üzerinden sunucudan okur — `supabase.from('premium_subscriptions')` client'ta **çalışmaz**.
- **Stripe panelinden yapılması gerekenler:** Customer portal etkin olmalı (yoksa "Aboneliği Yönet" hata verir) + webhook endpoint'i 3 olaya abone olmalı. Detay: `SETUP.md` ADIM 9.
- **Yasal eksik:** Mesafeli Satış Sözleşmesi + İptal/İade sayfaları **yok**; Türkiye'de online tahsilat için zorunlu. `/kvkk`, `/gizlilik`, `/kullanim` bunları karşılamaz.

### Bekleyen migration'lar (kullanıcı Supabase SQL Editor'da çalıştırmalı)
- `supabase/migrations/add_account_activations.sql` — **çalıştırıldı** (aktivasyon akışı için şart).
- `supabase/migrations/add_premium_column.sql` + `add_premium_subscriptions.sql` — Stripe akışı için **şart**. `add_premium_subscriptions.sql` daha önce çalıştırıldıysa **yeniden çalıştırılmalı**: eski sürümdeki `USING (TRUE)` SELECT politikası abone e-postalarını herkese açıyordu, yeni sürüm onu `DROP` eder.
- `supabase/migrations/add_whatsapp.sql` — `whatsapp text` kolonu (4 tablo). WhatsApp butonu bu alan doluysa görünür (telefonu körü körüne WhatsApp saymaz).
- `supabase/migrations/add_yorum_moderation.sql` — yorum şikayet/moderasyon kolonları (yukarıdaki akış için **şart**; çalıştırılmadan şikayet/gizleme çalışmaz).
- `supabase/migrations/add_bobath_contact.sql` — `doktorlar.email` + `doktorlar.contact_hidden` kolonları. Bobath terapistleri importu (`scripts/import-bobath.js`) ve gizli-iletişim akışı için **şart**. Çalıştırılmadan import commit edilemez.

### Bobath Terapistleri (fizyoterapist kategorisi + gizli iletişim)
- **Amaç:** ~379 Bobath (fizyoterapist) terapisti; her biri kendi ilinde, ayrı kategori. E-posta/telefon **kayıtlı ama varsayılan gizli** (`contact_hidden=true`); kişi profilini sahiplenince otomatik açılır, admin de elle açıp kapatabilir.
- **Veri modeli:** `doktorlar`'a `spec='Fizyoterapist'`, `tags=['bobath-terapisti','Fizyoterapist']`, `email`, `contact_hidden=true`, `verified=false`, `clinic_name=null`. Standart `/doktorlar` aramasında **tag ile gizli** (4 sorguya `.not('tags','cs','{bobath-terapisti}')` eklendi — devlet/üniversite gibi).
- **Import:** `node scripts/import-bobath.js [--commit]` — kaynak `scripts/bobath-data.txt` (pipe: `konum|isim|email|telefon`). Konum→il/ilçe eşlemesi (ALANYA→Antalya, ÇORLU→Tekirdağ, İSTANBUK→İstanbul, "İL / İLÇE" ayrımı, yabancı yerler olduğu gibi); isim ön-eki (ERG./DKT.) temizlenir; Türkçe title-case; e-posta ile dedup. Migration çalışmadan commit **hata verir** (email/contact_hidden kolonu yok).
- **Sayfalar:** `/bobath-terapistleri` (il il + arama) ve `/bobath-terapistleri/[il]` (terapist kartları, gizli iletişim kilitli rozetle). Veri katmanı `lib/bobath.ts` (il bazında gruplar; `noStore`). Footer 'Diğer Sağlık'ta.
- **Gizli iletişim gating:** `ProfilSayfasi` `contactHidden` prop'u ile tel+email+Randevu butonunu gizler, "İletişim gizli" notu gösterir (`tel` yeniden atanarak tüm `{tel && ...}` noktaları otomatik kapanır). `/bobath-terapistleri/[il]` kartlarında da aynı.
- **Otomatik açılma:** `/api/admin/claim-action` onayında entity_type='doktor' ise `contact_hidden=false` (best-effort). **Admin elle toggle:** admin doktor listesinde e-postası olan satırlarda "Gizli/Açık" butonu → `/api/admin/toggle-contact`.
- `supabase/migrations/add_makale_gonderim.sql` — `blog_posts` onay akışı kolonları (panelden makale gönderimi için **şart**).
- `supabase/migrations/add_makale_placement.sql` — `blog_posts.show_homepage` kolonu (admin "Anasayfada öne çıkar" için **şart**; yoksa anasayfa öne çıkan bölümü boş kalır, graceful).
- `supabase/migrations/add_doktor_meslek.sql` — `doktorlar`'a `uzmanlik_kurum`, `deneyim_baslangic`, `deneyimler jsonb`, `sertifikalar jsonb` (doktor "Mesleki Bilgiler" paneli + profil bölümü için **şart**; yoksa bölüm gizli kalır, graceful).

### DB Tabloları (Ağustos eki)
| Tablo | Açıklama |
|-------|----------|
| `randevu_talepleri` | Randevu talepleri (entity_type/id, ad_soyad, tel, email, tercih, mesaj, status: yeni/arandi/tamamlandi/iptal) |
| `claim_requests` | Sahiplenme/itiraz talepleri (status: pending/approved/rejected; email eşleşmesi = sahiplik) |
| `cekim_talepleri` | 360° çekim + randevu fallback |
| `email_aboneleri` | E-posta listesi (email, isim, tip, **kaynak**, entity...). **Unique constraint YOK** → upsert onConflict çalışmaz, **check-then-insert** kullan. |
| `account_activations` | Tek-kullanımlık şifre-belirleme token'ları (yalnızca service-role) |

---

## Sık Yapılan Geliştirici Hataları (Common Gotchas)

1. **Yanlış Supabase client:** Client component'te `supabase` (service role) yerine
   `createSupabaseBrowser()` kullanmak zorundasın — aksi halde cookie hatası alırsın.

2. **Event handler Server Component'e:** `onMouseEnter`, `onClick` gibi handler'lar
   `async` page component'lere yazılamaz. Çözüm: ilgili parçayı `'use client'` bileşenine taşı.

3. **`altKategoriSlug` uyumsuzluğu:** Hastalığa yeni bir `altKategoriSlug` değeri
   yazarken KATEGORILER dizisinde tanımlı olduğundan emin ol. Tanımlı değilse 404 verir.

4. **Türkçe kesme işareti:** `'PKOS'ta çalışır'` → string parse hatası.
   `\'` ile escape et: `'PKOS\'ta çalışır'`.

5. **`ciddiyeti` büyük harf:** `'Yüksek'` veya `'Orta-Yüksek'` geçersizdir.
   Sadece `'düşük'`, `'orta'`, `'yüksek'` (küçük harf).

6. **`tedaviSecenekleri` eksik `ikon`:** Her tedavi seçeneğinde `ikon` zorunludur.
   Unutulursa TS2741 hatası alırsın.

7. **Migration script'i root'tan çalıştır:**
   ```bash
   # Doğru:
   npm run migrate
   # Yanlış:
   cd scripts && node migrate-to-supabase.js
   ```

8. **CORS ve port:** Backend API varsa `localhost:3000`'in izinli olduğundan emin ol.
   Next.js varsayılan portu 3000'dir.

9. **`tour360url` kolonu eksikliği:** "Could not find the 'tour360url' column in schema cache"
   hatası alınırsa `supabase/migrations/add_tour360url.sql` SQL Editor'da çalıştırılmamış demektir.
   Ardından `NOTIFY pgrst, 'reload schema';` çalıştır.

10. **`tour360url` alanına iframe kodu girilmesi:** Düz URL veya `<iframe src="...">` kodu
    kabul edilir. `extractTourSrc()` fonksiyonu her iki formatı da işler.
    Panel formunda `type: 'textarea'` kullanılır (`type: 'url'` değil) — uzun kodlar için.

11. **Profil sayfası `force-dynamic`:** 4 detay sayfası `export const dynamic = 'force-dynamic'`
    ile işaretlidir. Bu, Next.js fetch cache'ini devre dışı bırakır; Supabase'den her zaman
    taze veri çekilir. Kaldırılırsa eski/stale veriler görünebilir.

---

## Gelecek Geliştirme Fikirleri

**Kısa vadeli (düşük efor):**
- Hastalık rehberine client-side arama/filtreleme
- Doktor detay sayfasında uzmanlık alanına göre benzer doktorlar
- Eczane sayfasında nöbetçi / değil rozeti

**Orta vadeli:**
- Doktor-Klinik eşleştirme (çalıştığı klinikle ilişkilendirme)
- Kullanıcı yorumları moderasyon paneli
- İşletme profili fotoğraf yükleme (Supabase Storage)
- SEO: `schema.org/MedicalCondition` structured data

**Uzun vadeli:**
- Nöbetçi eczane için konum bazlı otomatik güncelleme
- Çok dilli destek (TR/EN)
- İşletme sahiplerinin analitik dashboard'u (profil görüntülenme, tıklanma)
- Mobil uygulama (React Native + aynı Supabase backend)

---

## Veri Akışı Özeti

```
Ziyaretçi
    ↓
Next.js Server Component (app/*/page.tsx)
    ↓
Supabase sorgusu (lib/supabase.ts veya supabase-server.ts)
    ↓
TypeScript tipleri (lib/types.ts)
    ↓
Server Component'te render veya Client Component'e prop olarak geçilir
    ↓
Kullanıcıya sayfa gösterilir

Auth gerektiren işlemler:
    ↓
middleware.ts → session kontrolü → /panel erişimi veya /giris yönlendirmesi
```
