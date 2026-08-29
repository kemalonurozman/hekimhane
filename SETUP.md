# Hekimhane — Next.js + Supabase Kurulum Rehberi

## Önkoşullar
- Node.js 18+ kurulu
- Vercel hesabı (vercel.com)
- Supabase hesabı (supabase.com)

---

## ADIM 1 — Supabase Projesi Oluştur

1. **supabase.com** → "New Project" → proje adı: `hekimhane`
2. Proje oluşunca: **Settings → API** bölümüne gidin
3. Şunları kopyalayın:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## ADIM 2 — Veritabanı Tablolarını Oluştur

1. Supabase Dashboard → **SQL Editor**
2. `supabase/schema.sql` dosyasının tüm içeriğini yapıştırın
3. **Run** butonuna basın
4. ✅ Tüm tablolar oluşturuldu

---

## ADIM 3 — Ortam Değişkenlerini Ayarla

```bash
# hekimhane-next klasöründe:
cp .env.local.example .env.local
```

`.env.local` dosyasını açın ve değerleri doldurun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://hekimhane.com
```

---

## ADIM 4 — Bağımlılıkları Yükle

```bash
cd hekimhane-next
npm install
```

---

## ADIM 5 — Veriyi Supabase'e Aktar (Migration)

```bash
npm run migrate
```

Bu script:
- 1.044 klinik
- 1.825 hastane
- 1.552 doktor
- 8.789 eczane
- 777+ yorum bloğu

...hepsini Supabase'e aktarır. ~2-3 dakika sürer.

---

## ADIM 6 — Lokal Çalıştır

```bash
npm run dev
```

Tarayıcıda açın: **http://localhost:3000**

---

## ADIM 7 — Vercel'e Deploy Et

### Yöntem A: Vercel CLI (Önerilen)
```bash
npm install -g vercel
vercel
```

### Yöntem B: GitHub üzerinden
1. Projeyi GitHub'a push edin
2. vercel.com → "New Project" → GitHub reponuzu seçin
3. Environment Variables ekleyin (.env.local içindekiler)
4. Deploy!

---

## ADIM 8 — Vercel'de Ortam Değişkenlerini Ekle

Vercel Dashboard → Project → **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://...supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... |
| `NEXT_PUBLIC_SITE_URL` | https://hekimhane.com |

---

## Proje Yapısı

```
hekimhane-next/
├── app/
│   ├── layout.tsx          ← Global layout (Navbar + Footer)
│   ├── page.tsx            ← Ana sayfa
│   ├── globals.css         ← Tasarım sistemi (renkler, fontlar)
│   ├── klinikler/
│   │   ├── page.tsx        ← Klinikler listesi + filtreler
│   │   └── [il]/[ilce]/[slug]/
│   │       └── page.tsx    ← Klinik profil sayfası
│   ├── hastaneler/         ← (klinikler ile aynı yapı)
│   ├── doktorlar/
│   ├── eczaneler/
│   └── blog/
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── KlinikCard.tsx
│   └── FilterPanel.tsx
├── lib/
│   ├── supabase.ts         ← Supabase client
│   ├── types.ts            ← TypeScript tipleri
│   └── helpers.ts          ← Slug + yardımcı fonksiyonlar
├── supabase/
│   └── schema.sql          ← Veritabanı şeması
└── scripts/
    └── migrate-to-supabase.js   ← Veri aktarım scripti
```

---

## ADIM 9 — Stripe Ödeme Sistemi (Hekimhane-Pro)

İşletme sahipleri panelden **Hekimhane-Pro** aylık aboneliğine (150 TL/ay) geçer.
Kod tarafı hazır; aşağıdaki adımlar Stripe ve Vercel panellerinden yapılmalıdır.

### 9.1 — Ortam değişkenleri (Vercel → Settings → Environment Variables)

| Değişken | Zorunlu | Nereden alınır |
|----------|---------|----------------|
| `STRIPE_SECRET_KEY` | Evet | Stripe → Developers → API keys → Secret key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Evet | Webhook oluşturunca verilen `whsec_…` (bkz. 9.3) |
| `STRIPE_PRICE_MONTHLY` | Hayır | Fiyat ID'si (`price_…`). Boş bırakılırsa ürünün varsayılan fiyatı Stripe API'den okunur. |
| `STRIPE_PRODUCT_PRO` | Hayır | Ürün ID'si. Varsayılan: `prod_VA4Ez1eZ6NPoBm` |

> `STRIPE_SECRET_KEY` yoksa "Pro'ya Yükselt" butonu hata verir — site geri kalanı çalışmaya devam eder.

### 9.2 — Veritabanı migration'ları (Supabase → SQL Editor)

```sql
-- Sırayla çalıştırın:
supabase/migrations/add_premium_column.sql        -- 4 tabloya premium kolonu
supabase/migrations/add_premium_subscriptions.sql -- abonelik kayıt tablosu
```

`add_premium_subscriptions.sql` daha önce çalıştırıldıysa **tekrar çalıştırın** — eski
sürüm abonelik tablosuna herkese açık okuma izni veriyordu (abone e-postaları + Stripe
müşteri ID'leri görünürdü). Yeni sürüm o politikayı kaldırır.

### 9.3 — Webhook (Stripe → Developers → Webhooks → Add endpoint)

- **URL:** `https://www.hekimhane.com.tr/api/stripe/webhook`
- **Dinlenecek olaylar:** `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`

Webhook olmadan ödeme alınır ama profil Pro'ya geçmez. Verilen `whsec_…` değerini
`STRIPE_WEBHOOK_SECRET` olarak Vercel'e ekleyin.

### 9.4 — Müşteri Portalı (Stripe → Settings → Billing → Customer portal)

**Etkinleştirilmeli.** Panel'deki "Aboneliği Yönet" butonu buraya yönlendirir; abonelik
iptali, kart değiştirme ve fatura geçmişi Stripe'ın kendi arayüzünde yapılır. Portal
kapalıysa buton hata verir.

### 9.5 — Akış özeti

```
Panel → "Pro'ya Yükselt"  → /api/stripe/checkout → Stripe Checkout → ödeme
                                                          ↓
                          /api/stripe/webhook ← checkout.session.completed
                                    ↓
                   premium = true  +  premium_subscriptions kaydı
                                    ↓
Panel → "Aboneliği Yönet" → /api/stripe/portal → Stripe Müşteri Portalı
```

Ödeme başarısız olursa (`past_due`) webhook premium'u kapatır ve panel
"Ödeme Sorunu · Kartı Güncelle" butonuna döner — yeni abonelik açtırmaz.

### 9.6 — Yayına almadan önce

- [ ] Stripe **test modunda** uçtan uca dene (test kartı `4242 4242 4242 4242`)
- [ ] 150 TL'nin **KDV dahil mi hariç mi** olduğuna karar ver, ürün açıklamasına yaz
- [ ] **Mesafeli Satış Sözleşmesi** ve **İptal/İade Koşulları** sayfalarını yayınla —
      Türkiye'de online tahsilat için yasal zorunluluk (mevcut `/kvkk`, `/gizlilik`,
      `/kullanim` bunları karşılamaz)
- [ ] Ödeme sayfasında bu sözleşmelere bağlantı ver

---

## Sonraki Adımlar

Temel kurulum tamamlandıktan sonra eklenecekler:

- [ ] `hastaneler/page.tsx` ve profil sayfası
- [ ] `doktorlar/page.tsx` ve profil sayfası
- [ ] `eczaneler/page.tsx` ve profil sayfası
- [ ] `blog/page.tsx` + `blog/[slug]/page.tsx`
- [ ] Sahiplenme (claim) sistemi
- [ ] Admin paneli (Supabase Auth ile korumalı)
- [ ] `app/sitemap.ts` — dinamik sitemap
- [ ] `app/robots.ts` — robots.txt
- [ ] Randevu formu API route

---

## URL Yapısı (SEO)

| Eski | Yeni |
|------|------|
| `klinik-profil.html?id=k857` | `/klinikler/izmir/konak/xyz-dis-klinigi` |
| `klinikler.html?il=İstanbul` | `/klinikler?il=İstanbul` |
| `hastane-profil.html?id=h12` | `/hastaneler/istanbul/pendik/emsey-hospital` |

---

## Yardım

Sorun yaşarsanız:
- Supabase logları: Dashboard → **Logs**
- Next.js hataları: terminal çıktısı
- Vercel build: Dashboard → **Deployments**
