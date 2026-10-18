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
- **Ödeme akışı Payment Link üzerinden (Ağu 2026):** checkout rotası sahiplik + zaten-Pro kontrolünden sonra canlı Payment Link'e `client_reference_id=tip__id` + `prefilled_email` ekleyip yönlendirir (`STRIPE_PAYMENT_LINK` env ile değiştirilebilir; boş string API-session akışına döndürür). Webhook metadata yoksa `client_reference_id`'yi çözer (`tip:id` ve `tip__id`). Fiyat 190 TL/ay (`lib/pro-plan.ts`). **Çıplak link paylaşılmamalı** — referanssız ödemede Pro otomatik açılmaz.
- **Pro'ya kilitli alanlar (Ağu 2026):** `website`, `instagram_url/facebook_url/linkedin_url`, rezervasyon modülü (`randevu_aktif/randevu_slot_dk/randevu_bloke` + embed). Üç katman: panel UI kilidi (EditProfileTab `pro` = formData.premium; RandevuModulTab `proAktif`; ortak `ProKilit` bileşeni) + `update-entity` API'de `PRO_FIELDS` sessizce düşürülür (form tüm formData'yı gönderdiği için hata dönmek her kaydı bozar) + `/embed/randevu` premium değilse kilit HTML döner (fail-closed). `randevu_email` kilitli DEĞİL (Randevu Talepleri sekmesi ücretsiz kalır).

### Abonelik İptali & İletişim Görünürlüğü (Ağu 2026)
- **Sorun:** Pro aboneliğin iptal yolu yalnızca Genel Bakış'taki "Pro Üyeliği Yönet" butonuydu; buton Stripe portalına gidiyor, portal hata verince kullanıcı çıkmazda kalıyordu ("ayarlara giremiyorum").
- **Üç katmanlı iptal yolu:**
  1. `app/panel/page.tsx` → **Hesabım** sekmesinde "Hekimhane-Pro Üyeliği" kartı: her işletme için durum (Pro/ücretsiz/ödeme sorunu), sonraki yenileme tarihi, **"Aboneliği Yönet · İptal"** butonu + "Nasıl iptal edilir?" açıklaması. `ProfileTab` artık `approvedClaims/premiumMap/subsMap/onManage/managingId` alır.
  2. Genel Bakış butonu "Pro Üyeliği Yönet" → **"Aboneliği Yönet · İptal"** (iptal kelimesi görünür olmalı).
  3. `handleManage` başarısız olursa `iptalYolunuOner()` → kullanıcıya `/abonelik-iptali` formunu önerir (eskiden düz `alert` ile çıkmaz).
- **`/abonelik-iptali` sayfası:** panelden 3 adımda iptal anlatımı + iptal talep formu (`AbonelikIptalForm.tsx`) + iptal SSS'i. Form `/api/iletisim`'e `konu='abonelik-iptali'` ve `isletme` ile gider; admin'e "ABONELİK İPTAL TALEBİ — <işletme>" başlıklı mail (kemalonurozman@gmail.com), aboneye onay maili. Kayıt `cekim_talepleri`'ne `isletme_turu='abonelik-iptali'` ile düşer — **DDL yok.**
- **Footer:** marka sütununda ayrı **İletişim** bloğu (info@hekimhane.com.tr + iletişim formu + Pro abonelik iptali); "Abonelik İptali" hem Şirket hem Yasal listesinde. Ödeme alan sitede iptal yolunun görünür olması yasal gereklilik.
- **Randevu Takvimi işletme seçici:** `<select>` yerine `IsletmeSecici` — her işletme ismiyle listelenir, **Pro / Takvim açık / Takvim kapalı / Ücretsiz** rozetleri ve "Yönetiliyor" işaretiyle. Durumlar tablo başına tek `.in('id', ids)` sorgusuyla topluca çekilir. İşletme değişince `proAktif` **null'a çekilir** (yoksa bir an önceki işletmenin kilit/açık ekranı görünüyordu).
- **Not:** Stripe portalı, `STRIPE_SECRET_KEY` Vercel'de geçersizse "Stripe anahtarı geçersiz" döner — bu env sorunudur, koddan çözülmez; iptal formu bu durumda yedek yoldur.

### MCP Sunucusu — Yapay Zeka Asistanından Yönetim (Eyl 2026)
- **Uç nokta:** `app/api/mcp/route.ts` — Streamable HTTP, JSON yanıt, oturumsuz (GET 405). Yöntemler: `initialize`, `ping`, `tools/list`, `tools/call`; bildirimler 202. Kimlik `Authorization: Bearer hkm_…` veya header desteklemeyen istemciler için `?key=`. Anahtar başına dakikada 120 istek. **Erişim Pro'ya bağlı** (hesapta ≥1 premium işletme; her `tools/call`'da kontrol).
- **Araç kataloğu tek kaynak:** `lib/mcp/araclar.ts` (`ARACLAR` + kurulum kodları `kurulumKodu/ISTEMCI_BILGI`). `tools/list`, `/mcp` rehber sayfası ve panel sekmesi buradan okur — araç eklerken dokümantasyon ayrıca güncellenmez. Bu dosyaya sunucu import'u koyma (sayfalarda da kullanılıyor).
- **Yazma araçları panel rotalarını SÜREÇ İÇİNDE çağırır** (`lib/mcp/sunucu.ts` → `rota()`): randevu-talepleri, randevu-ekle, reply-yorum, hasta-mail, update-entity. Sahiplik, Pro kilidi, çakışma, hastaya giden erteleme/iptal mailleri panelle birebir aynı — **iş kuralını MCP'ye kopyalama**. Rotalar oturumu `lib/panel-oturum.ts` → `panelOturum()` ile çözer: çerez **veya** imzalı iç başlık (`x-hk-mcp-email/ts/sig`, HMAC-SHA256, 60 sn; başlık var ama imza geçersizse çereze düşülmez). Yeni bir rotayı MCP'ye açarken o rotadaki `sessionClient(...).auth.getSession()` satırını `panelOturum(request)` ile değiştir.
- **Anahtarlar DDL'siz:** `lib/mcp/anahtar.ts` — SHA-256 özetleri Supabase Auth `app_metadata.mcp_anahtarlari`'nda (kullanıcı değiştiremez). Biçim `hkm_<uuid-tiresiz>_<48hex>` → uuid ile tek `getUserById`. Açık anahtar yalnız üretimde bir kez döner. Panel API: `app/api/panel/mcp-anahtar` (GET/POST/DELETE, max 5, üretim Pro şartlı). `app_metadata` güncellerken **mevcut alanları yay** (`...user.app_metadata`) — provider bilgisi silinmesin.
- **İşletmeye özel anahtar (Eyl 2026):** anahtar kaydında opsiyonel `isletme_id/isletme_ad`. Panelde birden çok işletme varsa anahtar varsayılan olarak sidebar'daki **Aktif İşletme**'ye özel oluşturulur ("Tüm işletmelerime erişsin" kutusu ile genişletilir); listede her anahtarın üstünde işletme rozeti. Eski/kapsamsız anahtar = tüm işletmeler. `anahtarDogrula` → `kapsam`; `aracCalistir(..., kapsam)` işletme listesini süzer. **Tuzak:** panel rotaları hesabın TÜM işletmelerine yetki verir — kimlikle çalışan araçlarda (`randevu_guncelle`, `hastaya_eposta_gonder`, `yoruma_yanit_ver`) kaydın `entity_id`'si `kapsamda()` ile ayrıca doğrulanır. Yeni kimlik-tabanlı araç eklerken bu kontrolü unutma.
- **Takvim slot kuralı tek kaynak:** `lib/takvim-slot.ts` → `gunSlotlari()`; panelin iki `gunSaatleri`'si ve MCP `takvim_durumu`/`randevu_ekle` bunu kullanır.
- **UI:** panel Hesap → **MCP Bağlantısı** (`app/panel/McpTab.tsx`: anahtar oluştur/iptal, istemciye göre hazır kod, araç listesi) + herkese açık **`/mcp`** rehberi (MCP nedir, 3 adım, araçlar, nerelerde, örnek senaryolar, kurulum, güvenlik/KVKK, SSS). Footer + sitemap + /pro kartı bağlantılı.
- **Test notu:** yazma araçlarını test ederken hastası e-postasız kayıt kullan (erteleme/iptal maili gitmesin) ve test kayıtlarını service-role ile sil.

### Panel — Global Aktif İşletme Seçici (Eyl 2026)
- **Amaç:** bir e-postaya birden çok onaylı işletme bağlıysa her sekmede ayrı ayrı seçmek yerine sidebar'daki **"Aktif İşletme"** seçicisi (Genel Bakış'ın üstü) belirler; tüm sekmeler o işletmeyle açılır. Tek işletmede seçici gizli.
- **State:** `PanelPage` → `aktifId` (claim.id, `localStorage['hk_panel_aktif']`'te kalıcı) → `aktifClaim` (kayıtlı seçim artık onaylı değilse ilk işletmeye düşer). Genel Bakış "Düzenle" de `aktifSec()` çağırır.
- **Sekmeler:** `RandevuTalepleriTab`, `YorumlarTab` (`aktifEntityId` → başlangıç filtresi; "Tümü" hâlâ seçilebilir), `RandevuModulTab` (başlangıç `idx`), `HastalarTab` (başlangıç `calEntity`), `HekimKartTab` (`aktifClaimId` → doğrudan o kart, "geri" ile diğerleri), `EditProfileTab` (`selectedClaim = editListe ? null : aktifClaim`). Bu sekmeler `key={... + aktifKey}` ile render edilir — **işletme değişince yeniden kurulur**, iç seçimleri senkronlamak için ayrıca effect yazma.
- Mobil üst bar birden çok işletmede aktif işletme adını gösterir.
- **Kenar çubuğu teması (Eyl 2026):** varsayılan **açık/beyaz** (`sbLight=true`); yalnız `localStorage['hk_panel_theme']==='dark'` ise gece modu. Sağ alttaki ay/güneş düğmesi geçiş yapar ve tercihi yazar. (Eskiden varsayılan geceydi ve 'light' aranıyordu — tersine çevrildi; hiç tercih yapmamış kullanıcılar artık beyaz açar, geceyi seçmiş olanlar korunur.)
- **Genel Bakış — onaylı işletme satırı:** isim sütunu `flex:1 1 200px; min-width:0` (uzun isim alt satıra iner), işlem düğmeleri `flex-wrap:nowrap` + `flex-shrink:0` ile **tek satırda sağa yaslı** (düğmelerde `white-space:nowrap`). 980px altında satır dikey yığılır; o media query'de `.panel-approved-name { flex:none }` **şart** — yoksa `flex-grow` dikey eksende çalışıp isim ile düğmeler arasında dev boşluk bırakır.
- **Randevu Talepleri — Liste / Takvim:** `talepKarti(t)` tek kart fonksiyonu; liste ve takvimdeki ayrıntı penceresi aynı kartı (Arandı/Ertele/Mail/İptal/not) kullanır — kartı iki yerde yazma. `takvimGorunumu()`: bugün en solda 7 gün (‹ › 7'şer kaydırır), satırlar = kapsamdaki işletmelerin `gunSlotlari` birleşimi + saat dışı randevular, iptaller gizli, `randevu_slot`'suz talepler "Saati belirlenmemiş" kutusunda. **İşletme filtresi `entity_id` ile** (eskiden `entity_name` karşılaştırıyordu; global seçici kimlik verdiği için liste boş açılıyordu).
- **Hastalarım — işletme bazlı:** hastalar `entity_id|tel` ile gruplanır (notlar/işlemler/dosyalar zaten böyle anahtarlı); "Tüm hastalar" + işletme chipleri, varsayılan aktif işletme. **`/api/panel/hasta-sil` `entityId` alır** → silme yalnız o işletmeyle sınırlı (verilmezse eski davranış: tüm işletmeler). Haftalık takvim de bugünden başlar.

### Panel Mobil & Randevu Çöp Kutusu (Eyl 2026)
- **iOS yakınlaşma:** iPhone Safari, yazı tipi 16px'ten küçük bir input'a odaklanınca sayfayı büyütür ve geri küçültmez — davet/aktivasyon sonrası panel "zoomlu" açılıyordu. `app/globals.css` sonunda `@media (max-width: 820px)` içinde `input/select/textarea { font-size: 16px !important }` (ölçüler inline style ile verildiği için `!important` **şart**; checkbox/radio hariç). Masaüstü tasarımı değişmez.
- **Mobil üst bar:** üç çizgi düğmesi artık etiketli — kapalıyken "Profil & Ayarlar", açıkken "Kapat" (`aria-label` de değişir). Menünün profil/hesap ayarlarını açtığı yazıyla belli olmalı.
- **Randevu talebi çöp kutusu:** `status='silindi'` (DDL yok, `VALID_STATUS`'a eklendi). Kart üzerindeki **Sil** düğmesi talebi oraya taşır (**hastaya bildirim gitmez** — bildirim yalnız "İptal et"te), "Silinenler" sekmesinde **Geri al** (→ `iptal`) ve **Kalıcı olarak sil** vardır. Kalıcı silme `DELETE /api/panel/randevu-talepleri`, yalnız `status='silindi'` kayıtlarda çalışır (409 ile korur). "Tümü" filtresi ve takvim silinenleri göstermez; erteleme çakışma kontrolü de onları saymaz.

### Randevu Bildirimi — Pro'da 2 adres (Eyl 2026)
- **DDL yok:** `randevu_email` tek metin kolon; birden çok adres **virgülle** saklanır (`a@x.com, b@y.com`). Tek adresli eski kayıtlar aynen çalışır.
- **Tek kaynak `lib/randevu-email.ts`:** `epostaListesi()` (böl/küçült/doğrula/tekilleştir), `epostaListesiYaz()`, `gecerliEposta()`, `RANDEVU_EMAIL_MAX_PRO = 2`. Sunucu import'u koyma (panel de kullanıyor).
- **Sınır sunucuda:** `update-entity` `randevu_email`'i normalize eder — premium ise en fazla 2, değilse 1. **Hata dönmez, sessizce kırpar**: profil formu her kayıtta mevcut değeri de gönderir, Pro'su biten işletmenin iki adresi yüzünden profil kaydı bozulmasın. Panel kendi doğrulamasını (geçersiz/aynı adres) ayrıca yapar.
- **Gönderim:** `lib/entity-link.ts` → `randevuEmailler: string[]` (+ geriye uyum için ilk adres `randevuEmail`); `randevu-talebi` sahip bildirimini listedeki **tüm** adreslere gönderir (admin adresi hariç — admin zaten ayrıca alıyor), admin mailinde iki adres de listelenir.
- Randevu Takvimi sekmesi zaten Pro'ya kilitli; "Farklı adres" seçilince 1. adres + 2. adres (isteğe bağlı) alanları çıkar.

### İşletme Yöneticileri — davetle erişim (Eyl 2026)
- **Model (DDL yok):** yönetici = `claim_requests`'te `status='approved'` bir satır, `role` alanı `[yönetici] Davet eden: <sahip>` ile başlar (`lib/yonetici.ts` → `YONETICI_ONEK`, `yoneticiMi`, `davetEden`, `sahipEpostasi`). Erişim her yerde onaylı claim eşleşmesi olduğu için panel sekmeleri, randevu/hasta/yorum API'leri ve MCP yönetici için **kendiliğinden** çalışır. `role` serbest metin olduğundan önek köşeli parantezli — form metinleriyle çakışmaz.
- **Sahibe özel (yönetici yapamaz):** yönetici ekleme/kaldırma (`/api/panel/yonetici` sahip kontrolü), Pro abonelik başlatma/yönetme/iptal (`lib/stripe-owner.ts` `verifyOwner` + checkout — tüm erişim kayıtları yöneticiyse 403), sahipliği bırakma (`release-claim`: yönetici için yalnız kendi kaydını siler, işletmenin `claimed/premium`'una dokunmaz).
- **API `/api/panel/yonetici`** (`panelOturum`): GET sahip olunan işletmeler + yöneticileri (durum) + yönetici olunan işletmeler; POST `{entity_id,email,ad}` — işletme başına en fazla 10, sahip başına saatte 20 davet; `createUser` başarılıysa hesap yoktu → `account_activations` token + "hesabını oluştur" daveti (mevcut `/hesap-aktivasyon` akışı), hesap varsa "yönetici olarak eklendiniz" bildirimi; DELETE `{id}` yalnız sahip.
- **Durum hesabı:** "davet bekliyor" = yönetici kaydından SONRA oluşturulmuş, kullanılmamış aktivasyon + kullanıcı hiç giriş yapmamış (`getUserById.last_sign_in_at`). **Tuzak:** e-postanın herhangi bir kullanılmamış aktivasyonuna bakmak yanlış — eski sahiplenme onayından kalan bağlantı, hesabı olan kişiyi "bekliyor" gösteriyordu.
- **Bildirim adresleri sahibi tercih eder:** randevu bildirimi (`randevu-talebi`) ve admin abonelik iptal maili (`premium-action`) `sahipEpostasi()` ile önce sahibi, yoksa herhangi bir onaylı erişimi seçer (eskiden `.limit(1)` rastgele bir yöneticiye gidebilirdi).
- **UI:** Hesabım → **Hesap Yöneticileri** kartı (`YoneticilerKarti`: işletme başına liste, Aktif/Davet bekliyor rozeti, Kaldır, e-posta+ad ile ekleme; "yönetici olarak eriştiğiniz işletmeler"). Yönetici satırlarında ödeme butonları yerine **YÖNETİCİ** rozeti; Genel Bakış'ta "Yöneticilikten Ayrıl"; sidebar Aktif İşletme altında YÖNETİCİ etiketi. Admin Talepler listesinde yönetici kayıtları `[yönetici] …` rolüyle görünür.

### İşletme Asistanları — yetki bazlı sınırlı erişim (Eyl 2026)
- **Model (DDL yok):** asistan = `claim_requests`'te **`status='asistan'`** satır; `role` = `[asistan] Davet eden: <e-posta> | yetkiler: randevu,hastalar,...`. **Bilerek `approved` değil:** sistemdeki tüm yetki kontrolleri `status='approved'` aradığı için asistan varsayılan olarak **hiçbir yere erişemez (fail-closed)**. Yöneticiden farkı bu — yönetici `approved` olduğu için her yere kendiliğinden erişir.
- **Tek kaynak `lib/asistan.ts`** (client-safe): `ASISTAN_YETKILERI` (randevu · hastalar · randevu_ekle · yorumlar; `randevu_ekle` → `hastalar` gerektirir), `yetkileriDuzenle()` (geçersizleri atar, bağımlılığı ekler), `asistanRolu()`, `asistanYetkileri(role)` (bozuk rol → `[]`), `ASISTAN_YAPAMAZ`.
- **Sunucu `lib/erisim.ts` → `yetkiliEntityIdleri(admin, email, yetkiler)`:** onaylı erişim + role'de verilen yetkilerden biri olan asistan işletmeleri. Rotalardaki eski `ownedEntityIds()` gövdesi bununla değiştirildi:
  - `randevu-talepleri` GET → `randevu|hastalar` (Hastalarım listesi talepten türer); POST/DELETE → yalnız `randevu`
  - `randevu-ekle` → `randevu_ekle` · `hasta-notu/islem/dosya` → `hastalar` · `hasta-mail` → `randevu|hastalar` · `reply-yorum` → `yorumlar`
  - `update-entity` → onaylı değilse `randevu_ekle` asistanı **yalnız `randevu_bloke`** yazabilir (profil/fiyat/iletişim/randevu_email asla). Önce tam erişim ayrıca aranır — `.single()` iki onaylı satırı olan sahipte null döndüğü için gerçek sahip asistan kısıtına düşmesin.
  - **Kapalı kalanlar (bilerek):** `hasta-sil`, `report-yorum`, `release-claim`, `makale`, Stripe, MCP, yönetici API'si.
  - **Yeni bir rotayı asistana açarken** yalnız o rotada doğru yetkiyle `yetkiliEntityIdleri` çağır; `status='approved'` sorgularını genişletme.
- **API `/api/panel/asistan`** (`panelOturum`): GET (tam erişimli işletmeler + asistanları, durum hesabı yöneticiyle aynı; + kullanıcının asistan olduğu işletmeler), POST (tam erişimli kişi = sahip **veya yönetici** ekler; en az 1 yetki; işletme başına 10; saatte 20 davet; hesap yoksa aktivasyon daveti, varsa bilgilendirme — mailde yetki listesi), PATCH (yetki değiştir; asistan kendi yetkisini yükseltemez), DELETE (tam erişimli kişi ya da asistanın kendisi).
- **Panel:** Hesap → **Asistanlar** sekmesi (`app/panel/AsistanlarTab.tsx`: yetki rehberi + "asistan hiçbir zaman" listesi, onay kutulu yetki kartları, satır içi yetki düzenleme, Aktif/Davet bekliyor, Kaldır). `PanelPage` → `yetkiliListe(yetki)` ile Randevu Talepleri/Hastalarım/Yorumlar sekmelerine asistan işletmeleri eklenir; **yalnız asistan** kullanıcıda kenar çubuğu yetkili sekmelere + Genel Bakış + Hesabım'a iner, Genel Bakış **"Asistan olarak eriştiğiniz işletmeler"** kartını (`AsistanErisimKarti`: alanlar + sekmeye git) gösterir. Aktif İşletme'de ASİSTAN etiketi; Profil Düzenle/HekimKart asistan işletmesiyle açılmaz. Hastalarım: `takvimIds` dışında takvim salt okunur (bilgi bandı), `tamIds` dışında "Hastayı sil" gizli. Başvurularım/sayaçlar asistan satırlarını saymaz (`basvurular`).
- **Test:** imzalı iç başlıkla 20 senaryo (yetki yok/var, alan kısıtı, yükseltme denemesi, sahip PATCH/DELETE, ayrılma) — test satırı service-role ile eklenip silindi; POST davet akışı gerçek mail/hesap oluşturduğu için test edilmedi.

### Ana Sayfa Hero — Açık, Sade (Eyl 2026)
- `components/HeroAnimated.tsx`: koyu lacivert gradyan + **partikül/yıldız canvas'ı + fare gradyanı kaldırıldı** (ölü kod bırakılmadı). Zemin `#FBFBFD` + tepede hafif mavi radyal tint, altta `#E5E5EA` hairline (sonraki beyaz "Premium" bölümüyle sınır). Başlık lacivert `#1B3A69`, ikinci satır `#4A6A9A` (tek renk ailesi, altın metin yok), etiket lacivert tint. Arama kutusu beyaz + `#D9DCE3` kenarlık; **Ara** ve **Diş Hekimlerini Listele** düğmeleri düz lacivert (altın gradyan/parlama yok). Çipler beyaz hairline. Sayaçlar lacivert, tabular-nums.
- `HeroKonumSecici.tsx` + `globals.css .hero-konum-*` aynı palete çekildi. Altın (`--gold`) ana sayfada yalnız navbar CTA'sında kaldı.
- Hero `<style>` `dangerouslySetInnerHTML` ile — içinde `>` var (hidrasyon tuzağı), metin çocuğuna çevirme.
- **Konum seçici (Eki 2026):** `HeroAnimated.tsx` → `KonumSecici` (tarayıcı `datalist`'i yerine özel açılır liste). `konumOnerileri(girdi)`: boşsa 81 il; metin bir ile **tam** eşitse "İl (Tüm il)" + o ilin ilçeleri (**Merkez başta** — `merkezOnce`); aksi hâlde önce eşleşen iller (başlayan > içeren, 8), sonra ilçeler (başlayan > içeren > Merkez > alfabetik, 12; "İlçe · İl" biçiminde). İl seçilince liste kapanmaz, ilçeleri gösterir; ilçe seçilince değer `"İlçe, İl"` olur. `konumCoz` virgüllü biçimi **önce** çözer (çok kelimeli ilçe adı boşluktan bölünmesin). Klavye: ok tuşları/Enter/Esc; `role=combobox/listbox`. Stil `.hk-konum-dd*` hero `<style>` bloğunda — **Apple popover**: %96 beyaz + backdrop blur, `::before` ok ucu, iOS grup başlıkları (11px/500/uppercase), satırlar 15px/400 ince, satır arası 0.5px iç ayraç, seçimde hafif lacivert tint (düz dolgu değil), il satırında › (ilçelere iner). Eşleşme yokken "Sonuç yok" boş durumu. Mobilde alan tam genişlik, liste 300px, ok ucu solda.
- **Arama çubuğu odak görünümü:** `.hk-hero-arama input:focus-visible { outline:none }` ve `.hk-hero-arama .hk-search__field:focus-within { box-shadow:none }` — tasarım sistemindeki iki iç içe odak dikdörtgeni (input outline + alan halkası) hero'da kapalı; odak tüm çubuğun kenarlığında (`:focus-within { border-color }`) belli olur. **Her iki alan tamamen tıklanabilir:** sarmalayıcı `onClick` → input `focus()` (`button, a` hedefleri hariç — açılır listedeki satır/temizle düğmeleri odakla yeniden açılmasın).
- **Profil kenar çubuğu (Eki 2026):** "İletişim & Konum" kartı **kaldırıldı** (tel/adres/yol tarifi/web zaten hero'da). **Online Randevu widget'ı en üstte.** Hero'da olmayan bilgiler (çalışma saatleri + sosyal bağlantılar) randevunun altında küçük "Çalışma Saatleri" kartında, yalnız veri varsa.
- **"360° Tur" sekmesi → "Fotoğraflar"** (`fa-images`, YENİ rozeti kalktı): içerik = `fotoGalerisi()` (galeri, Genel ile ortak fonksiyon — `sc/scHd/scBody`'den hemen sonra tanımlı) + altında 360° sanal tur bölümü (boş durumu dahil). Genel sekmesi galeriyi göstermeye devam eder.

### Marka Kimliği v1 — Logo, İkon Seti, Arama Çubuğu (Eki 2026)
- **Kaynak:** Claude Design teslimi "Healthcare identity system" (`Hekimhane Logo.dc.html`, `hk-icons.js`, `Hekimhane Mockups.dc.html`). Zip repoda **tutulmaz** (untracked).
- **Logo ("Akışkan H"):** `components/Logo.tsx` — `HK_LOGO` (48 ızgara: left/right sütun, band = altın dalga, gap = 1.6 birimlik boşluk çizgisi), `HK_RENK` (navy `#12294D`, gold `#C9A04A`, gold300 `#DEC283`). `LogoMark` şeffaf zeminli sembol; boşluk **SVG mask** ile gerçek boşluk (`useId` ile benzersiz id) → cam navbar ve lacivert footer'da doğru. `dark` → beyaz sütun + Altın 300. `Logo` = sembol + "hekimhane" (**Manrope 700, −0.035em**; `--font-manrope` yalnız logoda, `app/layout.tsx`). `.com.tr` eki kalktı; `tld` artık alt satırda aralıklı "hekimhane.com.tr" (varsayılan kapalı). `ToothGlyph` dental yer tutucu olarak duruyor.
- **Mask kullanılamayan yerler** (zemin rengi bilinir, boşluk zemin rengiyle çizilir): `app/icon.svg`, `app/opengraph-image.tsx` (satori), `lib/hekimkart.ts` → `rozetHtml` (`ROZET_LOGO`; yollar orada **tekrar** — logo değişirse üçünü de güncelle).
- **Favicon/app ikonu (düz):** lacivert zemin + beyaz sütun + Altın 300 dalga. `app/favicon.ico` (16/32/48), `app/apple-icon.png` (180, tam kare — iOS kendi maskeler), `public/web-app-manifest-192/512.png`. Rasterleştirici yok (sharp/rsvg yok) → PIL ile bezier düzleştirip çizildi; yeniden üretmek gerekirse aynı yöntem.
- **İkon seti:** `lib/hk-icons.ts` (**üretilmiş**, 57 ikon: gezinme, uzmanlık, kurum, platform, durum; 24 ızgara, 1.5px çizgi) + `components/HkIcon.tsx` (hook yok → server/client ortak). Props: `name`, `size`, `color` (taban), `accent` (altın detay; `false` = tek renk), `active` (dolgulu varyant), `bg`. Durum ikonları (`success/warning/info/open-now/closed`) kendi ton rengini kullanır. **Yeni ikon gereken yerde Font Awesome yerine bunu kullan.** Hareketli sürümü aşağıda.
- **Hero arama çubuğu** (`components/HeroAnimated.tsx`, `.hk-hero-arama*`): beyaz kart, 18px köşe, kenarlık yok + yumuşak gölge; iki alan **etiket + girdi** ("Ne arıyorsunuz?" / "Şehir"), 22px `HkIcon` (search, location-pin), ince dikey ayraç (`::before`), lacivert **"Hekim bul"** düğmesi (12px köşe, min 56px). Alan `<label>` olduğu için tamamı tıklanır; odakta alan zemini `#F6F8FB` olur (çerçeve yok). Tasarım sistemi `.hk-search` sınıfları hero'da artık **kullanılmıyor**. Tedavi çipleri beyaz hap + diş ikonu. Konum listesindeki il/ilçe ikonları da setten (`city`, `location-pin`).
- **Hareket (Eki 2026):** `lib/hk-icons.ts` artık hareket verisini de taşır (`HK_HAREKET`, `HK_BEKLEME`, parça `tag`'leri, ikon başına `hover/idle/origin/shine`). Üretici: tasarımdaki `hk-icons.js` node `vm` ile okunup TS'e dökülür — dosyayı elle düzenleme.
  - `components/HkIconAnim.tsx` (`'use client'`, WAAPI): üzerine gelince oynar — tetikleyici en yakın `a, button, [data-hk-hover]` atası (`hoverTarget` ile değişir), yoksa ikonun kendisi; `playOnView` + `delay` ile görünür olunca bir kez; `idle` döngüsü tanımlı ikonlarda (konum iğnesi, nöbetçi eczane, şimdi açık) sürekli. Statik gereken yerde (server, liste satırı) `HkIcon` kullan.
  - `components/HkLogoAnim.tsx`: hareketli logo (sütunlar yükselir → dalga akar → kıvılcım → yazı). `autoplay` iken görünür olana dek **opacity 0** (1,5 sn yedek zamanlayıcı); `autoplay={false}` → yalnız üzerine gelince. Boşluk maskesi açılma maskesinin içinde → boşluk dalgayla birlikte açılır. Aynı dosyada `HkSpinner` (yükleme göstergesi).
  - **Kullanıldığı yerler:** hero'da eski "TÜRKİYE DİŞ SAĞLIĞI REHBERİ" rozetinin yerinde hareketli logo; hero arama ikonları + arama sırasında `HkSpinner`; tedavi çipleri (sırayla oynar); navbar logosu (hover) ve footer logosu (görününce); ana sayfa kategori kartları ve "Şehre göre" başlığı; 4 liste sayfasının başlığında beyaz ikon kutusu (`.listing-ikon`, `ListingLayout` `icon` prop'u yeniden çiziliyor).
  - "Hareketi azalt" tercihinde hiçbir şey oynamaz. Kök `app/loading.tsx` **bilerek eklenmedi** (tüm sayfaları akışa alır, 404 durum kodlarını etkiler).
- **Hero dönen başlık (Eki 2026):** `HeroAnimated` → `basliklar` (başlık + alt metin çiftleri). İlki hasta başlığı (SSR'daki `<h1>`), diğerleri hekimlere: randevu yönetimi, hatırlatma, gelir-gider, rezervasyon modülü, HekimKart. Süre dolunca **her zaman** kendiliğinden geçer (7,5 sn / 6 sn; "hareketi azalt" açıkken de — yalnız kayma kapanır, solma kalır; noktaya basmak durdurmaz). Geçiş iki aşamalı ve yavaş: `soluk` ile 0,6 sn söner → metin değişir → 0,9 sn belirir (`gec()`). `gec` içindeki `% 6` başlık sayısıyla eş tutulmalı. Nokta göstergesinde aktif nokta 34px'lik bir **süre çubuğu**: içindeki lacivert dolgu kalan süre boyunca soldan sabit, sağdan kısalır (`hkNoktaSure`, süre `SURE_ILK`/`SURE_DIGER` sabitlerinden — zamanlayıcıyla aynı kaynak). `.hk-hero-baslik-kutu` / `.hk-hero-alt-kutu` en uzun başlık kadar `min-height` ayırır → arama kutusu zıplamaz (ölçüldü: 0px kayma, mobil dahil). Hero logosu 38px, `.com.tr` satırı yok, **bir kez** oynar (`hover={false}`). `HekimSerit` artık sabit çağrı (aynı cümleler iki yerde dönmesin).
- **Bilinçli dışarıda:** site genelindeki `--brand #1a335e` tokenı logodaki `#12294D`'ye çekilmedi; profil, panel ve diğer iç sayfalardaki Font Awesome ikonları değiştirilmedi.

### Klinik Profili — Telefon Gizleme, Hakkında, Fotoğraf Kaydırma (Eki 2026)
- **Telefon numarası sitede hiçbir yerde açıkta yazmaz (Eki 2026, tüm türler):** tek kaynak `components/AraDugmesi.tsx` (`'use client'`) — `tel:` bağlantısı; basınca arar **ve** etiket numaraya döner (masaüstünde numarayı görmenin yolu bu). `goster` biçimi, `children(metin, acik)` özel iç düzen, `durdur` kart tıklamasını keser. Kullanıldığı yerler: `ProfilSayfasi` (`telGizle = !telAcik`, hero + konum sekmesi + `MhrsDugmeleri` "Hastaneyi Ara"; eczane bilgi tablosundaki Telefon satırı kaldırıldı), `EczaneCard`, karşılaştırma tablosu, `/yakin-eczane`, `/bobath-terapistleri/[il]`, HekimKart (`KartClient` düğmesi; **afişteki numara satırı kaldırıldı** — karekod karta götürür), yapay zekâ sohbeti (`HekimhaneAI` 📞 token'ı). `ListMap` balonu her zaman "Telefonla ara" (`telGizli` prop'u kalktı). `KlinikCard`/`DoktorCard`/`HastaneCard` zaten numarasız etiket gösteriyordu. SSS (`lib/faq.ts`) numarayı yazmaz, "Ara" düğmesine yönlendirir. **Yeni bir yerde telefon gösterirken numarayı metin olarak basma, `AraDugmesi` kullan.** **Bilerek duran:** `LocalBusiness` JSON-LD `telephone` (SEO) ve RSC verisinde numara (düğmenin açılması için gerekli). Form alanları ve e-postalar (hastanın kendi numarası) kapsam dışı.
- **Eczanelerde cep numarası yok (Eki 2026):** `eczaneler.tel` cep numarası olan 1.871 kayıt (hiçbiri sahiplenilmemiş, tek numaralı) `null`'a çekildi — import kaynağı eczacıların kişisel numaralarını yazmıştı. Yedek yalnız yerelde: `.yedek/eczane-cep-numaralari-2026-10-18.json` (git dışı). Yeni eczane importunda 5xx ile başlayan numaraları yazma.
- **"Klinik Bilgileri" kartı klinikte kaldırıldı** (tür/şehir/ilçe/telefon zaten hero'da). Yerinde `klinikHakkinda()`: `bio` paragrafları + öne çıkanlar (hizmet süresi = `deneyim_baslangic`, online randevu, acil, 7/24). Hiçbiri yoksa bölüm çıkmaz. **Doktor Bilgileri** kartında şehir/ilçe/telefon satırları kalktı (hero'da var); yalnız deneyim, seans ücreti, e-posta gösterilir ve hiçbiri yoksa kart çıkmaz. Hastane/eczane kartları aynen duruyor.
- **Panel:** Profil Düzenle'de klinik için **"Klinik Hakkında"** alanı (`bio`, 2000 karakter) eklendi — eskiden `bio` yalnız doktor formundaydı, klinikler tanıtım yazamıyordu (`update-entity` whitelist'inde zaten vardı).
- **Fotoğraflar telefonda kaydırılır:** ≤640px'te `.profil-photo-grid` yatay scroll-snap şerit (%82 genişlik, sonraki fotoğrafın kenarı görünür; fotoğraf varken boş yer tutucular gizli). Lightbox'ta parmakla sola/sağa kaydırma (45px eşik, sürüklerken fotoğraf parmağı izler), aşağı çekince kapanır; `touchAction:none`.

### /klinikler — Varsayılan "Hepsi", Kurum Rozeti, Kelime Başı Arama (Eki 2026)
- **Varsayılan kurum = `hepsi`** (eskiden `ozel`): ilk açılışta özel klinikler + devlet + üniversite hekimleri birlikte (`getHepsi`). "Hepsi" filtre sayılmaz → çip/sayaç üretmez (`ListingLayout` `activeChips`: `hideAll && 'hepsi'` elenir); `hasActiveFilters` de `!== 'hepsi'`. Özet etiketi kuruma göre: klinik / hekim / klinik ve hekim.
- **Kurum rozeti:** `components/KurumRozeti.tsx` (hook yok) — Özel (lacivert tint) / Devlet (yeşil) / Üniversite (mor). `KlinikCard` → `k.kurum || 'ozel'`; `DoktorCard` → `kurumBul(tags)` (devlet/üniversite etiketi yoksa **rozet çıkmaz**, tahmin yürütülmez). Meta satırındaki "Özel" yazısı kalktı.
- **Arama (hepsi + devlet/üniversite modları):** `aramaKelimeleri()` metni kelimelere böler (`.or()` bozan `, ( ) % *` ayıklanır), her kelime **VE** ile ve **kelime başından** eşleşir (`basla()`: `w%`, `% w%`, `%.w%`). Hekimde ad/soyad (+3 harften itibaren branş), klinikte ad. Böylece "mehmet y" → 11, "mehmet yıl" → 1 sonuç: yazdıkça aranan hekime kadar daralır. Arama varken adı yazılanla başlayan kayıt, özel/devlet ayrımından önce en üste gelir. Özel modun (`getKlinikler`) kendi arama mantığı aynen duruyor.
- `DoktorCard`: unvan adın başında zaten varsa tekrar eklenmez ("Dt. Dt. …" düzeltildi).

### Üst Menü — Diğer Branşlar (Eki 2026)
- Diş dışı meslekler (fizyoterapist/Bobath, fizik tedavi, psikiyatri, psikolog) ve kurumlar (devlet diş hastaneleri, hastaneler, eczaneler) eskiden **yalnız footer'daydı** (commit f1c6ff5); üst menü 75ca3c1'den beri diş odaklıydı. Artık `Navbar.tsx` → `DIGER_BRANSLAR` ile **"Diğer Branşlar"** açılır menüsü (masaüstü + mobil akordeon), alt bağlantı "Tüm Doktorlar" → `/doktorlar`.
- **Menü genişliği:** öğeler `white-space: nowrap` (`.nav-ogesi`); ≤1260px 14px/8px sıkılaşır; **≤1100px hamburger menüye geçilir** (eskiden 768px — 769–1100px arasında yazılar iki satıra kırılıyordu).

### Navbar CTA ve /katil İlk Adım (Eki 2026)
- **"Kayıt Ol" açılır menüsü kaldırıldı** (`regOpen` state'i artık kullanılmıyor). İçindeki "İşletmeni Sahiplen" yolu `/katil` sayfasındaki "İşletmeniz zaten listede mi?" bağlantısına taşındı.
- **Altın çağrı düğmesi `.hk-cta-isik`** (`app/globals.css`): akan altın gradyan + `::after` ile eğik ışık şeridi (4,2 sn), hover'da hafif yükselme; "hareketi azalt"ta sabit. Masaüstü ve mobil menüdeki "Kliniğinizi ekleyin" bunu kullanır. Başka altın düğmede kullanılacaksa `background` inline verilmemeli (sınıf zemini ezer).
- **`/katil` üst bölüm + tür seçimi:** lacivert hero kalktı → beyaz `.katil-ust` (etiket, 40px başlık, alt metin, **1 Tür · 2 Bilgiler · 3 Onay** adım göstergesi; başlık ve alt metin adıma göre değişir). Renkli dört kart yerine tek gruplu liste `.katil-liste` (iOS ayarlar düzeni: tek renk ikon kutusu, ad, açıklama, ok; ikonlar `HkIconAnim` — `TUR_IKON`). Altında dört sade "sunulanlar" sütunu: emoji yok ve **yalnız gerçekten var olan özellikler** (eski "İstatistikler" ve "öne çıkar" vaatleri kaldırıldı — istatistik özelliği yok). 
- **Adımlar tarayıcı geçmişine bağlı (geri tuşu düzeltmesi):** tür seçilince `history.pushState` ile `/katil?tur=klinik` kaydı açılır; `popstate` URL'den adımı okur. Eskiden adım yalnız React state'iydi → geri tuşu tür seçimine değil **önceki sayfaya** (ör. Neden Hekimhane) atıyordu. "Tür seçimine dön" kendi kaydımız varsa `history.back()` yapar (çift kayıt yok); başvuru gönderilince `replaceState('/katil')` (geri tuşu gönderilmiş forma dönmez). `?tur=` ile doğrudan/yenilemede form açılır. **Yeni adımlı sayfa yazarken aynı deseni kullan.**
- **Form adımı:** türe göre renk (yeşil/kahve/mor) kalktı — tüm türler lacivert; başlıkta zaten yazan "Başvuru Türü" kutusu kaldırıldı; yan panel nötr ("Nasıl çalışır?", "Onaydan sonra" — var olmayan "ziyaret istatistikleri" maddesi çıkarıldı); alt not gerçeği söyler (hangi bilgi yayımlanır) + KVKK bağlantısı; doktor türünde alan adı "Hekimin Adı Soyadı". Tamam adımı sade kart + `success` ikonu. Sayfa başlığı için `app/katil/layout.tsx` (sayfa client olduğundan metadata orada).

### Giriş Sayfası, /katil Ek Düzeltmeler ve Mobil Taşma Taraması (Eki 2026)
- **Giriş türü adres çubuğunu izler:** `app/giris/page.tsx` `?tip=` değerini yalnız ilk açılışta okuyordu → sayfa açıkken üst menüden Doktor/Hasta seçilince kart değişmiyordu. `useEffect([tipParam])` ile senkron. Giriş Yap / Kayıt Ol sekmesi belirgin: seçili **lacivert dolgu + beyaz yazı**, 46px, 15px/700.
- **/katil:** form adımında adım göstergesindeki **"1 Tür" tıklanır** (`.katil-adim-geri` → `tureDon`). "Nasıl çalışır?" metni: çoğu başvuru **birkaç saat, en geç 24 saat**; işletme zaten kayıtlıysa **kayıtlar birleştirilir**, güncel hesap gönderilir. Yan panelde "Pro üyelik mi düşünüyorsunuz?" kutusu (sohbet balonu + e-posta + /pro). `/sahiplen` metinlerindeki "1–2 / 2–5 iş günü" de aynı süreye çekildi.
- **Mobil taşma kuralı:** `grid-template-columns: 1fr` içeriğin min-content'ine kadar genişler → geniş tablo/uzun kelime sayfayı sağa taşırır. **Mobil tek sütunda `minmax(0, 1fr)` yaz.** Düzeltilenler: `.hastalik-content-grid` (KVKK), `.yasal-izgara` (çerez tablosu; tablo kendi kutusunda yatay kayar), `.listing-body` (/doktorlar 12px taşıyordu), `.hakk-grid-4`, hastalık rehberi alt çağrısı (`.hast-cta`, eski inline grid). KVKK makalesi telefonda dar iç boşluk (`.kvkk-article`, `.kvkk-iki`).
- **Tarama yöntemi:** 375px iframe'de her sayfa için `main` içindeki, sağ kenarı 376px'i aşan ve kaydırılabilir/kırpan bir atası olmayan öğeler listelenir. 29 sayfa tarandı; son durumda taşan öğe yok.
- **Blog bülteni sahteydi:** düğme hiçbir yere kaydetmeden "Abone oldunuz" diyordu → `FooterBulten` (gerçek kayıt + izin kutusu). Hastalık rehberindeki "12.000+ doktor profili" (gerçek dışı sayı) metinden çıkarıldı.

### Vitrin Dili — özellik tanıtımları (Eki 2026)
- **Kaynak:** kullanıcının gösterdiği referans (geliştirici portalı tarzı): açık gri zemin, büyük yuvarlak beyaz kartlar, iri ve sıkı başlıklar, küçük renkli etiket, köşede **noktalı siluet grafik**, yapışkan yan menülü büyük kart dizisi, siyah "bento" bölümü. Görsel/varlık kopyalanmadı; tümü kendi ikon setimiz + CSS.
- **Stil sınıfları `app/globals.css` → `vt-` öneki:** `vt-zemin`, `vt-bolum`, `vt-ustyazi`, `vt-h1` (76px'e kadar), `vt-h2`, `vt-govde`, `vt-dugme(--koyu|--acik)`, `vt-pro`; `vt-arac*` (yapışkan vitrin), `vt-cihaz` (koyu cihaz çerçevesi), `vt-izgara` + `vt-oz*` (özellik kartı), `vt-koyu` + `vt-bento` + `vt-bk*` (koyu kutular). **Yeni tanıtım bölümü yazarken bunları kullan, sayfaya özel stil yazma.**
- **Bileşenler `components/vitrin/`:** `NoktaGrafik` (ikon setinden maske + nokta deseni; `ikon`, `size`, `koyu` — hook yok, görsel dosyası yok) · `AracVitrini` (`'use client'`; solda yapışkan başlık + liste, sağda büyük kartlar; IntersectionObserver ile kaydırdıkça aktif öğe; telefonda liste yatay çip şeridi) · `Gorseller` (örnek arayüz çizimleri: takvim, yorum, kart, asistan, bölge, puan, ekip, adım — HTML/CSS, temsili içerik, gerçek isim yok).
- **`/neden-hekimhane` baştan yazıldı** (429 satır → vitrin dili): giriş + gerçek sayaçlar → "Öne çıkan araçlar" (Randevu Takvimi, Yorum Yönetimi, HekimKart, Yapay Zekâ Asistanı) → "Panelinizde neler var?" ızgarası (Ücretsiz/Pro etiketli) → koyu bento → ücret (0 TL / `PRO_AYLIK_TL`). **Eski sayfadaki doğrulanamayan iddialar kaldırıldı:** "%90'a varan fiyat–performans", "kripto-şifreli hafıza", "listede öne çıkan sıralama", "Doğrulanmış ✓ rozet".
- **Ana sayfa:** kategori kartları (`KategoriKartlari`) `vt-oz` kartlarına çevrildi (etiket/kayıt sayısı + iri başlık + noktalı siluet); bölüm başlığı `vt-h2`.
- **Renk ve hareket (ikinci tur):**
  - `components/vitrin/SekmeliVitrin.tsx` (`'use client'`) — siyah, sekmeli vitrin: üst yazı + vurgulu iri başlık (`baslik: [normal, vurgulu]`) + bağlantı düğmesi + süzülen ekran çizimi + arkada renkli noktalı siluet. **Her sekmenin kendi rengi** (`renk` → `--vt-vurgu`: başlıktaki sözcük, düğme, ışıma, gölge). Sekmeler altta; 6,5 sn'de kendiliğinden geçer, aktif sekmenin altındaki çizgi süreyi doldurur; **üzerine gelince ve ekran dışındayken bekler**. Ana sayfada hero'nun hemen altında: Klinik Bul (mavi) · Randevu (altın) · Değerlendirmeler (pembe) · Sağlık Rehberi (turkuaz) · Hekimler İçin (mor).
  - `AracVitrini` kartları artık **bağlantılı ve renkli**: `href` + `renk: { zemin, vurgu }`. Üzerine gelince kart o renge bürünür, arkasından "Ad →" şeridi akar (`.vt-serit`, `vt-kay`), ekran çizimi yükselir. Ana sayfada "Hekimler için araçlar" bölümü (CTA'dan önce) ve `/neden-hekimhane`.
  - Çizimlerde küçük hareketler (`vt-h-belir/nabiz/buyu/sec/balon`): takvim sütunları sırayla belirir ve seçili saat nabız atar, asistan balonları sırayla gelir, çubuklar büyür, harita işaretleri atar. Yeni çizimler: `AramaGorsel`, `RehberGorsel`. `NoktaGrafik` `renk` alır.
  - "Hareketi azalt"ta tüm vitrin hareketleri kapanır. `color-mix()` kullanılıyor (ışıma/gölge) — eski tarayıcıda yalnız ışıma görünmez.
- **Önizleme notu:** tarayıcı paneli kaydırılmış sayfada boş kare veriyor → uzun sayfayı görmek için `resize_window` ile yüksek bir görünüm alanı (ör. 1280×5200, mobil 390×6400) verip tek kare al.

### Giriş Türü Rozeti (Eki 2026)
- `components/GirisRozeti.tsx` (hook yok) — Doktor/İşletme ve Hasta/Ziyaretçi için **tek ortak rozet**: aynı biçim ve ikon ailesi (`HkIcon`), markanın iki rengi ters çevrilmiş. `isletme` = lacivert zemin + beyaz çizgi + altın detay (`doctor-profile`); `hasta` = şampanya zemin + lacivert çizgi + altın detay (`user-account`). Tonlar `GIRIS_TON`'da. `soluk` → seçili olmayan kart.
- Kullanıldığı yerler: üst menü "Giriş Yap" açılır listesi, mobil menüdeki iki giriş düğmesi, `/giris` sayfasındaki "Kim olarak giriyorsunuz?" kartları (seçili kartın kenarlığı/onay işareti de türün tonunda: lacivert ya da altın). **Bu iki giriş türünü gösteren yeni bir yer olursa aynı bileşeni kullan.** `/giris` sekme başlığı için `app/giris/layout.tsx` (noindex).

### Yasal Uyum Düzenlemeleri (Eki 2026)
- **Yasal kimlik tek kaynak `lib/sirket.ts`:** `SIRKET.unvan = 'Prague K. Onur Ozman'`, e-posta, `kvkkEposta` (şimdilik info@ — eski `kvkk@` adresinin varlığı doğrulanmadı), `YASAL_GUNCELLEME`. **`adres`, `ulke`, `vergiNo`, `telefon` BOŞ** — doldurulunca KVKK, sözleşme ve footer'da kendiliğinden görünür; boş alan sayfaya hiç basılmaz (eski "[Adres]" yer tutucusu kaldırıldı). Başka hiçbir yerde unvan yazma.
- **Çerez onayı:** `components/CerezOnay.tsx` (layout'ta). Reddet / Tercihler / Kabul et **eşit boyutta**; varsayılan kapalı; tercih `localStorage['hk_cerez_tercih']` (`surum` artarsa yeniden sorulur). **Vercel Analytics + Speed Insights yalnız onay varsa yüklenir** (bu bileşenin içinden — layout'a doğrudan `<Analytics/>` koyma). Footer'da "Çerez tercihleri" (`CerezTercihBaglantisi`, `hk-cerez-ac` olayı). `/embed` altında pencere gösterilmez. Ölçüldü: reddedince 0 istatistik betiği, kabul edince 2.
- **Yasal sayfalar:** ortak iskelet `components/YasalSayfa.tsx` (`YasalBolum`: string = paragraf, string[] = liste, `{tablo}`; `KunyeKutusu`). Yeni: `/mesafeli-satis-sozlesmesi`, `/on-bilgilendirme-formu`, `/iptal-iade`. `/cerez` baştan yazıldı (eskisi sitede olmayan Google Analytics çerezlerini anlatıyordu). `/kvkk`: veri sorumlusu unvanı, gerçek hizmet sağlayıcı listesi (Vercel, Supabase, Resend, Stripe, Google, Ozvelo) ve yurt dışı aktarım açıklaması. Satın alma düğmesinin altında (`app/pro/ProCta.tsx`) sözleşme + ön bilgilendirme bağlantısı.
- **İade politikası değişmedi:** hatalı/mükerrer tahsilat iade, dönem ortası iptalde kısmi iade yok. Sözleşmeye **onaylanmamış taahhüt yazma** (14 gün iade, süre garantisi vb. sahibine sorulmadan eklenmez).
- **E-posta listesi yalnız açık izinle:** `/api/abone` `izin: true` olmadan **400** döner. `AboneWidget` + yeni `FooterBulten` (footer formu eskiden işlevsizdi) izin kutusu ister. Randevu formunda bülten izni **ayrı, isteğe bağlı, varsayılan kapalı** kutu; `randevu-talebi` yalnız `bulten === true` ise listeye ekler (eskiden e-posta bırakan her hasta sessizce ekleniyordu). **Yan etki:** `giris` ve `sahiplen` akışlarındaki sessiz `/api/abone` çağrıları artık 400 alıp atlanıyor → yeni işletme sahipleri listeye otomatik düşmüyor.
- **Randevu formu:** not alanı yer tutucusu artık sağlık şikâyeti istemiyor; onay metni açık rıza olarak yeniden yazıldı.
- **Üstünlük ve puan:** karşılaştırma sayfasındaki "En iyi" rozeti ve yeşil vurgu kaldırıldı. Profilde yorum yokken 4,2 "başlangıç puanı" **gösterilmez** ("Henüz değerlendirme yok"); sıralamadaki Bayesian hesap aynen duruyor.
- **Sohbet balonu:** `components/SohbetBalonu.tsx` — Ozvelo (`ozvelo.com/widget.js`, `lazyOnload`). `/admin`, `/panel`, `/embed`, giriş ve aktivasyon sayfalarında yüklenmez. Yalnız yerel depo kullanır (çerez yok); çerez politikasında "kullandığınızda çalışan hizmetler" altında açıklandı, onaya bağlanmadı.
- **Bilerek yapılmadı (sahibinin kararı):** ücretli öne çıkarmanın (Pro sıralaması) "reklam/sponsorlu" diye etiketlenmesi.
- **Yerel önizleme:** 3000 portu başka projede olabiliyor → `.claude/launch.json`'da `hekimhane-3100` yapılandırması var.

### Profil Puanı — gizli sıralama sinyali (Eki 2026)
- **Amaç:** profilini eksiksiz dolduran klinik/doktor üst sıraya çıkar (Booking benzeri). **Puan ziyaretçiye hiçbir yerde gösterilmez**; sahibi panelde kalem kalem görür.
- **Sıra kuralı (karar):** **Pro → profil puanı → hasta puanı (`rat`)**. `lib/profil-puani-sunucu.ts` → `profilSirasi(q, puanli)`; `/klinikler` (3 mod) ve `/doktorlar` bunu kullanır. `getHepsi` birleşik sıralaması da aynı (pro, puan, sonra klinik-önce, rat).
- **Migration (ŞART):** `supabase/migrations/add_profil_puani.sql` → `klinikler/doktorlar.profil_puani int` + sıralama indeksleri. **Yoksa her şey graceful:** `puanKolonuVar()` (60 sn önbellek) false döner → sıra yalnız Pro → rat; puan yazımı sessizce yutulur; panel kartı yine çalışır (canlı hesap). Migration'dan sonra bir kez: `node scripts/profil-puani-hesapla.mjs --commit` (kuru çalışma: bayraksız; Node 22.6+ `.ts` importu için).
- **Hesap tek kaynak `lib/profil-puani.ts`** (client + server + Node betiği ortak — `@/` importu ve sunucu importu KOYMA, enum kullanma): `profilPuaniHesapla(tip, row, ek)` → 10 kalem / 100 puan: ana görsel 10, galeri 15 (6 fotoğrafa kadar kademeli), tanıtım 10 (300+ karakter), eğitim 10, deneyim+sertifika 10, uzmanlık+dil 10, saat+adres+konum 10, online randevu 10, yorum yanıtı 5 (yorum yoksa tam puan), HekimKart+video+360° 10. Her kalemde üst sınır → şişirilemez. Süresi dolan Google Places görselleri (`gps-cs`) fotoğraf sayılmaz. `puanSeviyesi()`.
- **Ne zaman yeniden hesaplanır:** `update-entity` ve `reply-yorum` sonrası (`puanGuncelle`, best-effort) + panel kartı her açıldığında (`/api/panel/profil-puani` hesaplar ve kolonu tazeler). HekimKart kaydı ayrıca tetiklemez — panel açılınca düzelir.
- **Panel:** Genel Bakış'ta `app/panel/ProfilPuaniKarti.tsx` (halka gösterge, seviye, "puan kazanabileceğiniz alanlar" +N puan ve ilgili sekmeye götüren düğme, tamamlananlar). Aktif işletmeyi gösterir; `DashboardTab` `ustEk` slotu. Yalnız klinik ve doktor profilleri (hastane/eczane puanlanmaz).
- **Ana sayfa "öne çıkanlar" (son hâl, Eki 2026):** adaylar = Pro üyeler + sahibi tarafından yönetilen profiller; **9 kart, fotoğrafsız** (yalın kart: tür · ad · uzmanlık · konum · değerlendirme; görsel şartı ve görsel yoklaması kaldırıldı). **Sıra yalnız profil puanı** (canlı hesaplanır, migration'a bağlı değil) → ilk üç kart her zaman profili en dolu üç üye. **Puanı eşit olanlar her açılışta kendi aralarında yer değiştirir** (Fisher–Yates karıştır + kararlı sırala). Pro üyelik sıralamada rol oynamaz, yalnız küçük altın yıldızla belirtilir. Yorum yoksa yıldız yerine "Henüz değerlendirme yok". Sahiplik: klinikte `claimed`; **doktorlar tablosunda `claimed` kolonu yok** → onaylı `claim_requests` kaydından bulunur.
- **Sızıntı önlemi:** `select('*')` satırları client kartlara gitmeden `puansiz()` ile temizlenir (liste, ilçe, diş tedavileri, kadro, PremiumHekimler); ana sayfada `sira` alanı sıralamadan sonra düşürülür. **Yeni bir yerde satırı client bileşene veriyorsan `puansiz()` kullan.** Ölçüldü: `/`, `/klinikler`, `/doktorlar` HTML'inde `profil_puani` 0 kez geçiyor.
- **Mevcut dağılım (kuru çalışma):** klinik ort. 12,4, doktor ort. 13,7; 60+ yalnız 1 profil — sistem ayırt edici, kimse baştan avantajlı değil.

### Listeleme Sayfaları Başlığı — Açık, Sade (Eyl 2026)
- **Eki 2026 — sıkı tek bant:** gradyan `hk-cathero` paneli ve ayrı breadcrumb şeridi kalktı. `.listing-ust` tek beyaz bant: yol (13px) → 56px tint ikon kutusu + 30px başlık + tek satır özet ("76 klinik · 54 şehir", kapsül yok). Yükseklik ~240px → ~133px (mobil ~108px). **İl seçiliyken "şehir" sayısı gösterilmez** (`activeFilters.il`) — Konya sayfasında "54 şehir" yazıyordu. Aşağıdaki eski `hk-cathero`/stat şeridi notları artık geçerli değil.
- `components/ListingLayout.tsx` üst bandı: koyu gradyan + `HeroParticles` canvas'ı + dekoratif daireler **kaldırıldı**. Beyaz zemin, `var(--border)` hairline'lar, başlık `var(--text)` 700, breadcrumb gri. İkon kutusu düz `color` (sayfanın marka rengi) üstünde beyaz glif — sayfaların `icon` SVG'leri `stroke="white"` olduğu için bu şart. Aktif filtre çipleri `${color}12` tint.
- `gradient` prop'u artık **kullanılmıyor** (opsiyonel bırakıldı; 4 liste sayfası hâlâ geçiyor, kaldırmak isteğe bağlı).
- **Mobil sayaçlar (≤768px):** stat şeridi büyük kutular yerine tek satır (`4 klinik listelendi | 4 şehir`): `.listing-stat-item` flex satır, ikinci öğe `border-left` ile ayrılır (`content:'·'` KULLANILMADI — `<style>` metin çocuğunda tırnak hidrasyon tuzağı). Etiketlere `.listing-stat-label` sınıfı verildi. İkon 44px, başlık 21px.
- **`/neden-hekimhane`** de aynı dile çekildi: koyu lacivert hero/kartlar (Etkimiz, HekimKart spotlight, kapanış CTA) beyaz/açık gri kart + hairline; altın gradyan CTA'lar düz lacivert (`.nh-cta-gold` adı kaldı, rengi lacivert), `.nh-cta-ghost` beyaz kenarlıklı; parlama süsleri (`nh-hero-glow`) kaldırıldı; bölüm üst yazıları altın yerine lacivert.
- **Tuzak:** dış kapsayıcıdaki `overflow: hidden` **kalmalı** — stat şeridi negatif marjla (`-32px`/mobilde `-16px`) taşar, kaldırınca mobilde yatay kaydırma çıkıyor (ölçüldü: 375px'te scrollWidth > innerWidth).

### Admin Paneli — Açık Tema (Eyl 2026)
- **Tek kaynak `app/admin/tema.ts`** (`C`): Apple sadeliği — `#F5F5F7` zemin, beyaz kartlar, `#E5E5EA` hairline, `#1D1D1F/#6E6E73/#AEAEB2` metin kademeleri, tek vurgu **lacivert** (aktif menü, bağlantı), durum renkleri 600 tonları (beyaz zeminde metin olarak okunur). `page.tsx` ve `MakalelerTab.tsx` yerel `C` tanımlarını bıraktı, buradan import eder.
- **Koyu temadan kalan sabitler dönüştürüldü:** `rgba(255,255,255,.0x)` dolgular → `C.soft`, `.07–.15` kenarlıklar → `C.border`, `rgba(0,0,0,.2)` tablo başlıkları → `C.soft`, `#0D1526` → `C.card`, karartmalar `rgba(29,29,31,.32)`. Kalan `rgba(255,255,255,…)` yalnız **renkli düğme üstündeki** spinner/sayaçlarda (doğru). Yeni admin bileşeni yazarken **token dışına çıkma**; `C.dim` eylem metni için değil, yalnız ikincil süs için.
- **Kabuk:** kenar çubuğu beyaz, `LogoMark` + "Hekimhane / Yönetim", aktif öğe `rgba(27,58,105,.08)` + lacivert; altta avatar + tek ikon çıkış. Hover sınıfları `adm-nav / adm-stat / adm-satir` sayfa sonundaki `<style>`'da (tırnak/`>` yok — hidrasyon tuzağı).
- **Genel Bakış:** dört sayaç **tek kartta** hairline ile bölünmüş (grid `gap:1` + `background:C.border` hilesi), 32px tabular-nums rakam, ikon gri; sahiplenme sayaçları renkli nokta + rakam; son başvurular tıklanabilir satırlar. Başlık altında bugünün tarihi.
- **Önizleme yöntemi (oturum gerektiren panel):** geçici rota, `@supabase/ssr 0.1.0` tarayıcıda oturumu **çerezde URI-encoded JSON** tutar (`sb-<ref>-auth-token`; localStorage DEĞİL) — sahte çerez + `window.fetch` mock'u ile `AdminPage` yerelde render edilir; iş bitince çerez silinir, rota kaldırılır. Sunucu tarafında hiçbir şey açılmaz (API'ler mock).
- **Bilinçli dışarıda:** `/admin/giris` hâlâ koyu lacivert — panelle uyum için açık temaya alınabilir.

### Admin — E-postayla Sahiplik Atama (Eyl 2026)
- **Nerede:** admin panel → Klinikler/Hastaneler/Doktorlar/Eczaneler listelerinde her satırda **"Sahip"** düğmesi → `SahiplikModal`: mevcut erişimler (Sahip/Yönetici rozeti, kaldır) + e-posta ile sahiplik atama (ad + "davet gönder" seçeneği).
- **API `app/api/admin/sahiplik`** (yalnız `ADMIN_EMAIL` çerez oturumu): GET `?entity_id` erişim listesi; POST `{entity_type,entity_id,email,ad,notify}` → onaylı `claim_requests` satırı (`role='[admin] Sahiplik atandı: …'` → sahip, yönetici değil) + `claimed=true` (+ doktorda `contact_hidden=false`) + hesap yoksa `account_activations` token ile şifre belirleme daveti, varsa bilgilendirme; DELETE `{id}` erişimi kaldırır.
- **DELETE kuralı:** son sahip kalkarsa `claimed=false` (`sahipsiz:true`), **`premium`'a dokunulmaz** — Stripe aboneliği sürüyor olabilir; iptal admin Premium sekmesinden yapılır (aynı gerekçe `premium_off` guard'ında).
- **Test notu:** admin rotaları çerez oturumu ister; imzalı iç başlık (MCP) admin'e **açılmadı**. Test ederken `adminMi`'ye geçici kanca eklenip sonra geri alındı — commit'te kanca olmamalı (`grep panelOturum app/api/admin/sahiplik/route.ts` boş dönmeli).

### HekimKart Adresi — kalıcı bağlantı ve adres geçmişi (Eyl 2026)
- **Sorun:** kartın adresi (slug) değişince daha önce paylaşılmış bağlantılar ve basılı QR kodlar 404 veriyordu; ayrıca profil sayfasındaki "HekimKart" düğmesi **işletme slug'ına** gidiyordu, sahip adresi değiştirince site içi bağlantı ile kartın gerçek adresi ayrışıyordu.
- **Adres geçmişi (migration ŞART):** `supabase/migrations/add_hekimkart_slug_gecmisi.sql` → `hekimkartlar.eski_sluglar text[]` + GIN index. Adres değişince eskisi bu diziye eklenir (en fazla 20), `/kart/<eski>` **308 ile** yeni adrese gider (`app/kart/[slug]/page.tsx` → `eskiAdrestenCoz`). Kolon yoksa her iki taraf da sessizce eski davranışa düşer (`unknownCols` listesinde `eski_sluglar` var).
- **Kanonik adres:** `/kart/<işletme-slug>` isteği, o işletmenin kayıtlı kartı varsa kartın adresine yönlendirilir (`isletmeninKarti`). Profil sayfaları da `lib/hekimkart-sunucu.ts` → `kartSlugCoz(entityId, entitySlug)` ile **kartın gerçek adresini** bağlar — 4 detay sayfasında `kartSlug={kartSlug}`.
- **Varsayılan adres = tam ad:** `lib/hekimkart.ts` (client+server ortak, sunucu importu KOYMA) → `kartSlugify`, `kartSlugTemel(ad,soyad)`, `kartSlugYaz` (elle yazarken sondaki tireyi korur), `kisalt` (70 karakter, kelime ortasından kesmez). Rastgele ek **yalnızca çakışmada** eklenir (eskiden her karta `-ab12` geliyordu).
- **Panel (`HekimKartTab`):** kayıtlı kartta adres **kilitli** görünür; "Değiştir" uyarı penceresi açar (eski bağlantılar yönlendirilir · yönlendirme eski adresi başkası almadığı sürece geçerli · sık değiştirmeyin). Kaydedince yeşil bilgi kutusu eski→yeni adresi gösterir. Yeni kartta adres ad–soyaddan **canlı** üretilir (`slugElle` ile kullanıcı yazınca durur).
- **`/api/kart` yetki modeli değişti:** GET artık kendi kartları + **onaylı sahipliği olan işletmelerin kartlarını** döndürür (eskiden yalnız `user_email`; aynı işletmenin ikinci sahibi "kart yok" görüp mükerrer kart açıyordu). POST kaydı `id` yoksa `entity_id` ile bulup **günceller**; kart yoksa yeni işletme kartı için onaylı sahiplik şart (403). Kartı başkası oluşturduysa `user_email` satırı korunur.
- **Kart alanları profilden tamamlanır:** kayıtlı kartta **boş bırakılan** fotoğraf/tel/web/konum/sosyal/bio/uzmanlık/kurum/il-ilçe alanları işletme satırından doldurulur (`entityKartAlanlari` + `bos()`); eskiden yalnız adres/puan/onay geliyordu, bu yüzden elle kaydedilen kart otomatik karttan **daha fakir** görünüyordu (foto yerine harf baş harfi, web/konum düğmesi yok). `cover` gibi `preset:` değerleri fotoğraf sayılmaz. Panel formunda bu davranış yazılı — boş alan = profilden devral.
- **Profil ↔ kart canlı bağ:** `/api/kart` kaydederken, kart alanı işletme profilindeki değerle **birebir aynıysa boş kaydedilir** (`profildenDevralinanlariBosalt`). Panel formu kartı açarken alanları profilden ön-doldurduğu için, aksi hâlde kart o anın kopyasını dondurur ve profil güncellenince kart eski bilgiyi gösterirdi. Panel de kayıtlı kartı açarken profili çekip **boş alanları profil değeriyle** gösterir (`selectClaim`: profil → kartın dolu alanları üste yazılır). Net davranış: **farklı yazarsan kartın, aynı/boş bırakırsan profilin.**
- **Panel önizlemesi = gerçek kart:** "Önizle & Paylaş" artık elle çizilmiş mini kopya değil, `/kart/<slug>?onizleme=1` **iframe**'i (telefon çerçevesi, 700px). Profilden devralınan foto/web/konum/yorumlar dahil ziyaretçinin gördüğü kartın aynısı. `?onizleme=1` → kart sayfası `.site-nav,.site-footer{display:none}` basar (`<style dangerouslySetInnerHTML>` — metin çocuğu olarak yazma, hidrasyon tuzağı). Navbar `<nav className="site-nav">`, Footer `<footer className="site-footer">`. Her kayıttan sonra `onizlemeAnahtar` değişir → iframe yeniden yüklenir.
- **Web sitesi rozeti:** `lib/hekimkart.ts` → `rozetHtml({ kartUrl, ad, tema: 'acik'|'koyu' })`. İşletmenin kendi sitesinin footer'ına yapıştırdığı "Onaylı Üye · Bu işletme hekimhane.com.tr üyesidir · Dijital kartvizitimizi görüntüleyin →" bağlantısı. **Tamamen kendi içinde** (inline stil + inline SVG logo, dış script/görsel/CSS yok) → WordPress/Wix/düz HTML'de çalışır, sitenin CSS'iyle çakışmaz. HekimKart'a `utm_source=rozet&utm_medium=footer` ile gider; `rel="noopener"` (nofollow YOK — Hekimhane'ye geri bağlantı). Panelde tema seçimi + canlı önizleme (kopyalanacak kodun kendisi render edilir) + kopyala + nereye yapıştırılır notu. Puan/yorum sayısı bilerek konmadı: statik kodda bayatlar.
- **Adres rezervasyonu (`adresSahibi`):** yeni/değişen kart adresi üç yerle çakışamaz — başka kartın **güncel** adresi, başka kartın **eski** adresi (yönlendirme için ayrılmıştır) ve **işletme slug'ları** (`/kart/<işletme-slug>` o işletmenin otomatik kartını açar). Kullanıcı adresi elle yazdıysa **409 + net mesaj** döner (sessizce `-ab12` eklemek yanıltıcı olur: paylaşacağı adres başka çıkar); otomatik üretilen adreste ek koyulup devam edilir. **Adres değişmiyorsa hiç sorgulanmaz** — yoksa sonradan oluşan bir çakışma sahibin kendi kartını kaydetmesini engellerdi.
- **Not:** işletme slug'ı çalışma zamanında hiçbir API'den üretilmiyor (import script'leri + admin). Bir import, kart adresiyle aynı slug'ı yazarsa `/kart/<slug>` kartı göstermeye devam eder; import'ta bu ihtimal gözetilmeli.
- **Tuzak:** adresi bu tarihten **önce** değişmiş kartların geçmişi yok — eski bağlantı hâlâ ölü. Kurtarmak için ilgili kartın `eski_sluglar` dizisine elle eklemek yeterli.

### Admin — Pro Aboneliklerin Yönetimi (Ağu 2026)
- **Liste:** admin panel **Premium Üyeler** sekmesi (`PremiumTab`). `/api/admin/premium` premium=true işletmeleri döndürür; `premium_subscriptions` kaydına ek olarak **Stripe'tan canlı durum** okunur (tek `subscriptions.list({status:'all'})` çağrısı, sayfalı, en fazla 500). `cancel_at_period_end` DB'de tutulmuyor — "dönem sonunda bitecek" bilgisi yalnız buradan gelir. Stripe'a ulaşılamazsa liste DB kaydıyla çalışmaya devam eder ve sekmede kırmızı uyarı çıkar (`stripeHata`).
- **Aksiyonlar:** `/api/admin/premium-action` (admin oturumu şartı, service-role):
  - `cancel_period_end` — dönem sonunda iptal (`cancel_at_period_end=true`); premium dönem sonuna kadar açık kalır, webhook kapatır.
  - `cancel_now` — `subscriptions.cancel` + `premium=false` + kayıt `canceled` (webhook'u beklemez).
  - `resume` — dönem sonu iptalini geri alır.
  - `premium_off` — **elle** açılmış premium'u kapatır. Stripe aboneliği hâlâ `active/trialing/past_due/unpaid` ise **409 ile reddeder** — yoksa üyelik kapanır ama kart çekilmeye devam ederdi.
- **UI kuralı:** yalnız Stripe'ta yaşayan abonelikte (`active|trialing|past_due|unpaid|incomplete`) iptal butonları görünür; `canceled` satırda sadece "Premium'u Kapat" çıkar — zaten iptal edilmiş aboneliğe `cancel` çağrısı Stripe'ta hata verir.
- **Bildirim:** her iptalde "işletme sahibine mail gönderilsin mi?" sorulur (claim onayıyla aynı desen). Adres önce `premium_subscriptions.email`, yoksa onaylı `claim_requests.email`. `RESEND_API_KEY` yoksa sessizce atlanır.
- **Geçmiş aboneler listede kalır:** liste yalnız `premium=true` çekiyordu, iptal edilen üyelik ekrandan tamamen kayboluyordu. Artık `premium_subscriptions` kaydı olan ama premium'u kapalı işletmeler de çekilir (`premiumAktif:false`, "PRO KAPALI" rozeti) ve **Tüm kayıtlar / Pro aktif / Sona ermiş** durum filtresi eklendi. Geçmiş satırlarda iptal butonu gösterilmez.
- **DDL yok** — mevcut `premium_subscriptions` tablosu yeterli.

### Abonelik Hareketlerinde Admin Bildirimi (webhook → Resend)
- **Sorun:** müşteri Stripe portalından aboneliğini iptal ettiğinde admin hiçbir bildirim almıyordu.
- **Tuzak:** portaldan iptalde Stripe abonelik **durumunu değiştirmez** (hâlâ `active`), yalnız `cancel_at_period_end` true olur. Bu yüzden iptal `event.data.previous_attributes.cancel_at_period_end === false` geçişinden yakalanır — sadece `status`'a bakan kod iptali göremez.
- **Gönderilen bildirimler** (`app/api/stripe/webhook/route.ts` → `adminBildir()`, hepsi kemalonurozman@gmail.com'a): `checkout.session.completed` → "Yeni Pro üye"; iptal geçişi → "Abonelik iptal edildi" (dönem sonu tarihiyle); iptalin geri alınması → "İptal geri alındı"; `customer.subscription.deleted` → "Pro üyelik sona erdi". Best-effort — mail hatası webhook'u 200'den düşürmez.
- **Düzeltilen hata:** `applyPremium` upsert'i `email: opts.email ?? null` yazıyordu; her abonelik olayı kayıtlı abone e-postasını **siliyordu**. Artık e-posta yalnız geldiğinde yazılır — yoksa iptal bildirimi de portal fallback'i de adresi bulamıyordu.
- **Stripe koşulu:** webhook endpoint'i `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted` olaylarına abone olmalı; `RESEND_API_KEY` Vercel'de tanımlı olmalı.

### Onaylı Yorum — yalnız randevusu tamamlanan hasta (Eki 2026)
- **Akış:** işletme panelde talebi **Tamamlandı** yapar → hastanın e-postası varsa "Deneyiminizi Değerlendirin" maili (tek kullanımlık bağlantı) gider; e-postası yoksa talep kartındaki **"Yorum bağlantısını kopyala" / "WhatsApp ile gönder"** (`app/panel/OnayliYorumDugmesi.tsx`) → hasta `/degerlendir?t=…` sayfasında puan + yorum bırakır → `yorumlar`'a `verified=true` yazılır, profilde yeşil **"Onaylı hasta"** rozeti (`ProfilSayfasi` → `OnayliHastaRozeti`, Genel ve Yorumlar sekmesinde).
- **Tek kaynak `lib/onayli-yorum.ts`:** `yorumTokeni` / `yorumTokeniCoz` (HMAC imzalı `talepId.sonGecerlilik.imza`, 60 gün, `YORUM_TOKEN_SECRET` → `MCP_INTERNAL_SECRET` → service-role), `talepYorumDurumu` (`yok | tamamlanmadi | yazildi | acik`; içinde `noStore()` **şart** — yoksa yazıldıktan sonra sayfa formu yeniden açıyordu).
- **DDL yok. Tek kullanım işareti `cekim_talepleri`'nde:** `isletme_turu='onayli-yorum'`, `notlar=<talepId>`, `tel='-'` (kolon zorunlu). Önce işaret, sonra yorum yazılır; yorum yazılamazsa işaret silinir. Admin talep listesi bu satırları `.or('isletme_turu.is.null,isletme_turu.neq.onayli-yorum')` ile gizler. **Tuzak:** `yorumlar.user_id` kullanılamaz — `profiles` tablosuna yabancı anahtarlı (23503).
- **Rotalar:** `POST /api/yorum/onayli` (token + puan 1–5 + en az 10 karakter; admin'e bildirim maili) · `GET /api/panel/yorum-baglantisi?talep=` (`panelOturum` + `yetkiliEntityIdleri(['randevu'])`; yazıldıysa `{yazildi:true}`) · `randevu-talepleri` POST'u tamamlandı geçişinde maili atar (yalnız durum gerçekten değiştiyse ve yorum açıksa).
- Onaylı yorum da normal yorum gibi işletmenin `rat/rev` alanlarını değiştirmez.

### Bekleyen migration'lar (kullanıcı Supabase SQL Editor'da çalıştırmalı)
- `supabase/migrations/add_account_activations.sql` — **çalıştırıldı** (aktivasyon akışı için şart).
- `supabase/migrations/add_premium_column.sql` + `add_premium_subscriptions.sql` — Stripe akışı için **şart**. `add_premium_subscriptions.sql` daha önce çalıştırıldıysa **yeniden çalıştırılmalı**: eski sürümdeki `USING (TRUE)` SELECT politikası abone e-postalarını herkese açıyordu, yeni sürüm onu `DROP` eder.
- `supabase/migrations/add_whatsapp.sql` — `whatsapp text` kolonu (4 tablo). WhatsApp butonu bu alan doluysa görünür (telefonu körü körüne WhatsApp saymaz).
- `supabase/migrations/add_yorum_moderation.sql` — yorum şikayet/moderasyon kolonları (yukarıdaki akış için **şart**; çalıştırılmadan şikayet/gizleme çalışmaz).
- `supabase/migrations/add_bobath_contact.sql` — `doktorlar.email` + `doktorlar.contact_hidden` kolonları. Bobath terapistleri importu (`scripts/import-bobath.js`) ve gizli-iletişim akışı için **şart**. Çalıştırılmadan import commit edilemez.

### Özel Hastane Kadrosu — Özel Ömür Hastanesi (Eyl 2026)
- **Kayıt:** `klinikler` **k1270** "Özel Ömür Hastanesi" (Adana/Seyhan; slug eski İngilizce çeviri `adana-seyhan-special-lifetime-medical-center`, sahiplenilmiş). Hastane olduğu halde `klinikler`'de — taşınmadı (URL, sahiplik ve yorum bağları kırılırdı).
- **Kadro:** 27 hekim `doktorlar`'a (d4688–d4714), `clinic_name='Özel Ömür Hastanesi'`, kurumun il/ilçe/tel/konumu, `verified=false`. Kaynak: hastanenin kendi "Hekim Kadromuz" sayfası (yalnız isim/unvan/branş — **fotoğraflar kopyalanmadı/bağlanmadı**). Script: `node scripts/import-omur-hastanesi.js [--commit]` (idempotent: kurum+isim eşleşeni atlar). Bölüm adları sitedeki yerleşik branş yazımına eşlendi (ör. Dahiliye → İç Hastalıkları, KBB → Kulak Burun Boğaz Hastalıkları); diş hekimleri `Diş Hekimliği` → `/doktorlar` genel aramasında gizli, kadroda görünür.
- **Klinik profilinde kadro:** `/klinikler/[il]/[ilce]/[slug]` artık hastane sayfasıyla aynı sorguyla (`doktorlar.clinic_name = k.name`) "Hekimler" sekmesini gösterir (`ProfilSayfasi` sekmesi `hastane || klinik`). O an eşleşen tek diğer klinik k174 Bartın Şehit Cem Kanbur ADSM (30 devlet diş hekimi — doğru).
- **Hekim → kurum bağlantısı:** `app/doktorlar/[slug]` önce `hastaneler`, bulamazsa `klinikler`'de **ad + il** eşleşmesi arar; birden çok eşleşmede bağlantı verilmez.
- **Yeni bir hastane kadrosu eklerken** bu script'i şablon al: kurum id'si, `KADRO` listesi ve `BRANS` eşlemesi değişir.

### Bobath Terapistleri (fizyoterapist kategorisi + gizli iletişim)
- **Amaç:** ~379 Bobath (fizyoterapist) terapisti; her biri kendi ilinde, ayrı kategori. E-posta/telefon **kayıtlı ama varsayılan gizli** (`contact_hidden=true`); kişi profilini sahiplenince otomatik açılır, admin de elle açıp kapatabilir.
- **Veri modeli:** `doktorlar`'a `spec='Fizyoterapist'`, `tags=['bobath-terapisti','Fizyoterapist']`, `email`, `contact_hidden=true`, `verified=false`, `clinic_name=null`. Standart `/doktorlar` aramasında **tag ile gizli** (4 sorguya `.not('tags','cs','{bobath-terapisti}')` eklendi — devlet/üniversite gibi).
- **Import:** `node scripts/import-bobath.js [--commit]` — kaynak `scripts/bobath-data.txt` (pipe: `konum|isim|email|telefon`). Konum→il/ilçe eşlemesi (ALANYA→Antalya, ÇORLU→Tekirdağ, İSTANBUK→İstanbul, "İL / İLÇE" ayrımı, yabancı yerler olduğu gibi); isim ön-eki (ERG./DKT.) temizlenir; Türkçe title-case; e-posta ile dedup. Migration çalışmadan commit **hata verir** (email/contact_hidden kolonu yok).
- **Sayfalar:** `/bobath-terapistleri` (il il + arama) ve `/bobath-terapistleri/[il]` (terapist kartları, gizli iletişim kilitli rozetle). Veri katmanı `lib/bobath.ts` (il bazında gruplar; `noStore`). Footer 'Diğer Sağlık'ta.
- **Gizli iletişim gating:** `ProfilSayfasi` `contactHidden` prop'u ile tel+email+Randevu butonunu gizler, "İletişim gizli" notu gösterir (`tel` yeniden atanarak tüm `{tel && ...}` noktaları otomatik kapanır). `/bobath-terapistleri/[il]` kartlarında da aynı.
- **Otomatik açılma:** `/api/admin/claim-action` onayında entity_type='doktor' ise `contact_hidden=false` (best-effort). **Admin elle toggle:** admin doktor listesinde e-postası olan satırlarda "Gizli/Açık" butonu → `/api/admin/toggle-contact`.
- `supabase/migrations/add_makale_gonderim.sql` — `blog_posts` onay akışı kolonları (panelden makale gönderimi için **şart**).
- `supabase/migrations/add_makale_placement.sql` — `blog_posts.show_homepage` kolonu (admin "Anasayfada öne çıkar" için **şart**; yoksa anasayfa öne çıkan bölümü boş kalır, graceful).
- `supabase/migrations/add_hekimkart_slug_gecmisi.sql` — `hekimkartlar.eski_sluglar text[]` (HekimKart adresi değişince eski bağlantıların yönlendirilmesi için **şart**; yoksa adres değişir ama eski link 404 verir — graceful).
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
