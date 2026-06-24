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
