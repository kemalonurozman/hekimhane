# Hekimhane ↔ Ozvelo partner bağlantısı — sözleşme (v1)

Hekimhane tarafı bu belgeye göre yazıldı (`lib/ozvelo/`). Ozvelo tarafı aynı adresleri,
alanları ve imzaları uygulamalı. Değişiklik gerekiyorsa önce bu belge güncellenir.

**Temel kural:** bilginin kaynağı Hekimhane profilidir. Ozvelo bu bilgiyi asistanın bilgi
tabanına yazar. Ozvelo'daki soru-cevap, karşılama cümlesi, konuşmalar ve tasarım ayarları
yalnız Ozvelo'da tutulur. v1'de eşitleme tek yönlüdür (Hekimhane → Ozvelo).

## Ortak ayarlar

| Hekimhane ortam değişkeni | Ne |
| --- | --- |
| `OZVELO_API_URL` | Partner API kökü, ör. `https://ozvelo.com/api/partner/v1` |
| `OZVELO_PARTNER_ANAHTARI` | Ozvelo'nun Hekimhane'ye verdiği anahtar (`Authorization: Bearer …`) |
| `OZVELO_IMZA_SIRRI` | İki tarafın paylaştığı sır, en az 32 karakter |
| `OZVELO_SITE_URL` | Ozvelo sitesi (varsayılan `https://ozvelo.com`); geçiş ve widget betiği |

Üçü de tanımlı değilse Hekimhane hiçbir istek atmaz, panel "yakında" der.

## İmzalar

HMAC-SHA256, anahtar `OZVELO_IMZA_SIRRI`. Başlık biçimi `t=<unix saniye>,v1=<hex>`.
İmzalanan metin `<bağlam>.<t>.<ham gövde>`; GET/DELETE'te gövde boş metindir. 5 dakikadan
eski imza reddedilir.

| Yön | Başlık | Bağlam |
| --- | --- | --- |
| Hekimhane → Ozvelo API | `X-Hekimhane-Imza` | `hk-ozvelo-istek` |
| Ozvelo → Hekimhane olay | `X-Ozvelo-Imza` | `hk-ozvelo-olay` |

## 1. İşletme yaz: `PUT {OZVELO_API_URL}/isletmeler/{dis_kimlik}`

`dis_kimlik` = `hekimhane:<klinik|doktor>:<Hekimhane kimliği>`, ör. `hekimhane:doktor:d4690`.
"Varsa güncelle, yoksa oluştur". Aynı `dis_kimlik` iki işletme açmaz. Ozvelo işletmeyi
**Doctor modunda** (sektör: sağlık, kaynak: hekimhane) açar. `sahip.eposta` ile hesap yoksa
oluşturur, varsa o hesaba bağlar.

Ne zaman gelir:
- Hekim panelde asistanı açtığında (açık aktarım onayıyla).
- Profil her kaydedildiğinde (değişiklik varsa).
- Panelde "Şimdi eşitle"ye basıldığında.
- Her gece 02:00'de (UTC) tüm aktif işletmeler, değişmemiş olsa da.

Gövde (`lib/ozvelo/esleme.ts` → `OzveloIsletme`), alan sırası sabit:

```json
{
  "dis_kimlik": "hekimhane:doktor:d4690",
  "kaynak": "hekimhane", "sektor": "saglik", "tur": "doktor", "dil": "tr",
  "ad": "Ayşe Yılmaz", "unvan": "Uzm. Dr.", "uzmanlik": "Kardiyoloji",
  "hizmetler": ["Efor testi"], "hastaliklar": ["Hipertansiyon"],
  "kurum": "Özel Ömür Hastanesi",
  "il": "Adana", "ilce": "Seyhan", "adres": null,
  "konum": { "lat": 37.0, "lng": 35.3 }, "harita_url": null,
  "telefon": "03221234567", "whatsapp": null, "eposta": null,
  "web_siteleri": ["https://ornek.com"],
  "calisma_saatleri": "Pzt-Cum 09:00-17:00", "acik_24_saat": false,
  "diller": ["İngilizce"], "tanitim": "…", "egitim": "…", "meslege_baslangic_yili": 2010,
  "fotograflar": ["https://…"], "profil_url": "https://www.hekimhane.com.tr/doktorlar/…",
  "randevu": { "aktif": true, "sure_dk": 30 },
  "sahip": { "eposta": "hekim@ornek.com" }
}
```

- Boş alan `null` ya da `[]` gelir: Ozvelo'daki değeri de boşaltır.
- İletişimi gizli hekimde `telefon`, `whatsapp`, `eposta` `null` gelir. Asistan bunları söylememeli.
- Hasta verisi, yorum, puan ve ödeme bilgisi hiç gönderilmez.

Yanıt `200`:

```json
{ "isletme_id": "ozv_123", "widget_anahtari": "6260b3249dec6f9aee5669ea", "durum": "aktif" }
```

`widget_anahtari` panelde şu kodla gösterilir:
`<script src="{OZVELO_SITE_URL}/widget.js?k={widget_anahtari}" async></script>`.
Widget ayarları her açılışta Ozvelo'dan canlı yüklenir; hekim kodu bir kez ekler.

Hata: `4xx/5xx` + `{ "error": "…" }`. Hekimhane gönderimi "hata"ya alır ve 5 dk, 10 dk, 20 dk …
en çok 6 saat arayla, ayrıca gece yeniden dener.

## 2. İşletme kapat: `DELETE {OZVELO_API_URL}/isletmeler/{dis_kimlik}?neden=…`

`neden`: `sahip-kapatti` | `sahiplik-bitti` | `isletme-silindi`. Ozvelo asistanı durdurur, widget
kibar bir "şu an hizmet dışı" gösterir. Hesap ve konuşma geçmişi Ozvelo'nun kendi saklama
kuralına göre kalır. Bilinmeyen işletme `404` ya da `200` dönebilir; ikisi de başarı sayılır.

## 3. Şifresiz geçiş: `GET {OZVELO_SITE_URL}/partner/hekimhane/giris?jeton=…`

Hekim panelde "Asistanımı yönet"e basar, Hekimhane yeni sekmede bu adresi açar.

Jeton: `base64url(JSON) + "." + base64url(HMAC-SHA256("hk-ozvelo-jeton." + ilk parça))`.

```json
{ "iss": "hekimhane", "aud": "ozvelo", "amac": "gecis",
  "iat": 1793750000, "exp": 1793750300, "jti": "uuid",
  "sub": "<Hekimhane kullanıcı kimliği>", "eposta": "hekim@ornek.com",
  "dis_kimlik": "hekimhane:doktor:d4690", "ozvelo_isletme_id": "ozv_123", "rol": "sahip",
  "hedef": "eposta" }
```

`hedef`, girişten sonra açılacak Doctor modu ekranıdır: `genel` (özet) | `gelen-kutusu` |
`eposta` | `randevular` | `soru-cevap` | `bildirimler` | `asistan`. Bilinmeyen değer gelirse `genel`.
Hekimhane panelindeki "Dijital Asistanlar" sayfalarının "Ozvelo'da aç" düğmeleri bunu kullanır.

Ozvelo şunları yapmalı: imzayı doğrula, `exp`'i kontrol et, `jti`'yi bir kez kabul et
(tekrar oynatma), `eposta`'nın o işletmede yetkili olduğunu doğrula, oturum aç, o işletmenin
Doctor paneline yönlendir. `rol`: `sahip` | `yonetici`.

## 4. "Hekimhane ile giriş yap" (Ozvelo → Partnerler sayfası)

1. Ozvelo, kullanıcıyı `https://www.hekimhane.com.tr/ozvelo/giris?donus=<adres>&durum=<rastgele>`
   adresine gönderir. `donus`, `OZVELO_SITE_URL` ile aynı kökte ve `/partner/` ile başlamalı.
   `durum` 8–200 karakter, `[A-Za-z0-9_-]`. Ozvelo `durum`'u tarayıcı oturumunda saklar.
2. Hekimhane oturum yoksa kendi girişini açar, sonra geri döner.
3. Hekimhane `donus?jeton=…&durum=…` adresine yönlendirir. Jeton biçimi 3. maddedekiyle aynı,
   `amac: "giris"`:

```json
{ "iss": "hekimhane", "aud": "ozvelo", "amac": "giris", "iat": 0, "exp": 0, "jti": "uuid",
  "sub": "…", "eposta": "hekim@ornek.com", "durum": "<gelen durum>",
  "isletmeler": [
    { "dis_kimlik": "hekimhane:doktor:d4690", "tur": "doktor", "ad": "…", "rol": "sahip",
      "asistan": "aktif", "ozvelo_isletme_id": "ozv_123" }
  ] }
```

`asistan`: `aktif` | `hazirlaniyor` | `kapali`. Asistanı kapalı işletme için Ozvelo,
"Asistanı Hekimhane panelinden açın" der ya da kendi akışıyla açmayı teklif eder (açarsa
Hekimhane'nin bundan haberi olmaz; v1'de asistanı açmak Hekimhane panelinden yapılır).
Ozvelo jetondaki `durum`'u, sakladığıyla karşılaştırmalı.

## 4b. Özet: `GET {OZVELO_API_URL}/isletmeler/{dis_kimlik}/ozet`

Hekimhane panelindeki "Dijital Asistanlar" sayfaları (E-posta Asistanı, Randevu Talebi Asistanı,
Soru-Cevap) içeriği buradan **anlık** okur; Hekimhane bu veriyi saklamaz. İmza ve anahtar 1. maddedeki
gibi (gövde boş). 6 saniyede yanıt gelmezse sayfa "şu an alınamadı" der.

```json
{
  "kanallar": { "site": true, "eposta": true, "whatsapp_bildirim": true },
  "sohbet": { "son_7g": 41, "son_konusma_at": "2026-11-04T09:12:00Z" },
  "eposta": {
    "bekleyen_taslak": 3, "yanitlanan_7g": 12,
    "son": [ { "konu": "Randevu saati", "kimden": "Mehmet Yılmaz", "tarih": "2026-11-04T08:40:00Z", "durum": "taslak-hazir" } ]
  },
  "randevu": {
    "bekleyen": 2, "son_7g": 9,
    "son": [ { "kisi": "Ayşe Demir", "zaman": "2026-11-06T14:30:00+03:00", "durum": "bekliyor", "kanal": "site" } ]
  },
  "sss": { "toplam": 14, "ornekler": [ { "soru": "Otopark var mı?", "cevap": "Binanın arkasında ücretsiz otopark var." } ] },
  "guncellendi_at": "2026-11-04T09:15:00Z"
}
```

- `eposta.son[].durum`: `bekliyor` | `taslak-hazir` | `yanitlandi` | `insana-aktarildi`.
- `randevu.son[].durum`: `bekliyor` | `onaylandi` | `reddedildi` | `iptal` | `tamamlandi`.
- Listeler en çok 8, `sss.ornekler` en çok 6 öğe gösterilir. Hekimhane kişi adlarını "Ad S." biçimine
  kısaltır, metinleri kısaltır, bilinmeyen durumları `bekliyor` sayar. Eksik alan sıfır ya da boş liste sayılır.
- Asistanı kapalı işletme için `404`.

## 5. Olaylar: `POST https://www.hekimhane.com.tr/api/ozvelo/olay`

Başlık `X-Ozvelo-Imza`, gövde:

```json
{ "olay_id": "evt_1", "tur": "randevu.olusturuldu", "dis_kimlik": "hekimhane:doktor:d4690", "veri": { } }
```

Her `olay_id` bir kez işlenir; tekrar gönderim `200 {"tekrar": true}` döner. Ozvelo `2xx`
almazsa yeniden göndermeli. Bilinmeyen `tur` → `200 {"yoksayildi": true}`.

| tur | veri | Hekimhane ne yapar |
| --- | --- | --- |
| `randevu.olusturuldu` | `talep_id`, `ad_soyad`, `tel` ve/veya `email`, `tercih?`, `randevu_slot?` (`YYYY-MM-DD HH:MM`, Türkiye saati), `mesaj?`, `saglik_rizasi?` | Panelde "Randevu Talepleri"ne yeni talep, tercih "Yapay zekâ asistanı · …". `mesaj` yalnız `saglik_rizasi: true` ise saklanır. E-posta göndermez (bildirimi Ozvelo atar). |
| `randevu.durum` | `talep_id`, `durum`: `onaylandi` \| `reddedildi` \| `iptal` \| `tamamlandi` | Talebin durumu: arandı / iptal / iptal / tamamlandı |
| `isletme.kapatildi` | — | Hekimhane'de asistan "kapalı" görünür, veri gönderimi durur |

Yanıtlar: `401` imza, `400` eksik alan, `404` işletme ya da talep yok, `409` asistan kapalı,
`503` Hekimhane'de bağlantı kapalı ya da tablo kurulmamış.

## Ozvelo tarafında yapılacaklar (özet)

1. Partner anahtarı ve imza sırrı üret; Hekimhane'ye ver.
2. `PUT/DELETE /api/partner/v1/isletmeler/{dis_kimlik}` — Doctor modu, hesabı e-postayla aç/bağla.
3. `/partner/hekimhane/giris` — jeton doğrula, `jti` tek kullanım, oturum aç.
4. Partnerler sayfası + "Hekimhane ile giriş yap" düğmesi (4. madde).
5. Asistanın aldığı randevu talepleri ve durum değişikliklerinde Hekimhane'ye olay gönder.
5b. `GET /api/partner/v1/isletmeler/{dis_kimlik}/ozet` (4b) ve geçiş jetonundaki `hedef` ekranları.
6. Widget: `?k=` anahtarıyla Hekimhane teması, "Hekimhane with Ozvelo" ibaresi.

## Ozvelo tarafının durumu (2026-11-04)

Ozvelo tarafı yazıldı ve yerelde 53 adımlık uçtan uca senaryoyla denendi (Hekimhane adımları Hekimhane'nin
kendi koduyla). Henüz canlıda değil. Ozvelo'daki ayrıntılar: Ozvelo projesi `docs/partner-hekimhane.md`.

- Ozvelo ortam değişkenleri: `HEKIMHANE_PARTNER_ANAHTARI` (Hekimhane'deki `OZVELO_PARTNER_ANAHTARI` ile aynı),
  `HEKIMHANE_IMZA_SIRRI` (Hekimhane'deki `OZVELO_IMZA_SIRRI` ile aynı).
- Ozvelo veritabanı: `supabase/update-2026-11-hekimhane.sql` (Ozvelo projesinde) çalıştırılmalı.
- "Doctor modu" Ozvelo'da `saglik` işletme türü olarak kuruldu: tıbbi tavsiye ve teşhis yok, acil durumda 112,
  hastadan yalnız randevu bilgisi; tür panelden değiştirilemez.
- Partnerler sayfası: `/partners`.

Sözleşmeden sapmalar (Hekimhane tarafı bunlarla uyumlu):
- `randevu.olusturuldu` olayında `mesaj` hiç gönderilmez, `saglik_rizasi` hep `false` (Ozvelo sohbette açık sağlık rızası almıyor).
- `tercih` alanında yalnız kanal adı gelir (ör. "Site sohbeti"); Hekimhane bunu "Yapay zekâ asistanı · Site sohbeti" olarak kaydeder.
- `isletme_id` Ozvelo'daki işletmenin UUID'sidir (örnekteki `ozv_123` biçiminde değil).
- Asistan kapatılınca widget en çok 60 saniyede kapanır.
- Hekimin yapay zekâ yanıtları kendi Ozvelo planından düşer; ücretsiz planda toplam 100 yanıt.

## Bilinçli olarak v1'de yok

- Ozvelo'dan Hekimhane'ye profil yazma (iki yönlü eşitleme).
- Hekimin elle yazdığı soru-cevaplar Hekimhane'de alan olarak yok; Ozvelo'da tutulur.
- Sahiplik yeni birine devredilince Ozvelo hesabı eski sahipte kalır; son sahip ayrılınca
  asistan kapanır (`sahiplik-bitti`).
