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
