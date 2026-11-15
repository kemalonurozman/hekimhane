/**
 * Yol haritası — admin paneli "Yol Haritası" sekmesinin TEK KAYNAĞI.
 *
 * YALNIZ SUNUCUDA OKUNUR (`/api/admin/yol-haritasi`, admin oturumu şart).
 * İstemci bileşenine import ETME: içinde açık güvenlik notları var; istemciye
 * girerse /admin'in JS paketinden herkes okuyabilir.
 *
 * Bakım kuralı (CLAUDE.md → "Yol Haritası"):
 *  - Her güncellemede YAPILANLAR'ın başına o günün tarihiyle bir kayıt eklenir
 *    (sade dille: siteye ne eklendi / ne düzeldi).
 *  - Biten yapılacak YAPILACAKLAR'dan silinir, YAPILANLAR'a yazılır.
 *  - Grupların ve maddelerin dizideki sırası = yapılma sırası.
 */

export type Kim = 'siz' | 'claude' | 'avukat' | 'ozvelo';
export type YapilacakDurum = 'yapiliyor' | 'sirada' | 'kontrol';
export type Alan =
  | 'Site' | 'Panel' | 'Admin' | 'Blog' | 'SEO' | 'Yasal'
  | 'Güvenlik' | 'Ödeme' | 'Tasarım' | 'Altyapı';

export interface Yapilacak {
  baslik: string;
  aciklama?: string;
  kim: Kim;
  durum: YapilacakDurum;
  oncelikli?: boolean;
}

export interface YapilacakGrup {
  id: string;
  baslik: string;
  aciklama: string;
  maddeler: Yapilacak[];
}

export interface Guncelleme {
  /** YYYY-MM-DD (Türkiye günü) */
  tarih: string;
  alan: Alan;
  baslik: string;
  maddeler: string[];
}

/* ───────────────────────── YAPILACAKLAR ─────────────────────────
   Sıra önemli: üstteki grup önce. */
export const YAPILACAKLAR: YapilacakGrup[] = [
  {
    id: 'yz-asistan',
    baslik: 'Hekimlere yapay zekâ asistanı (Ozvelo bağlantısı)',
    aciklama: 'İki taraf da yazıldı ve yerelde birlikte denendi; canlıya alınması sizde. Sözleşme: docs/ozvelo-partner-baglantisi.md',
    maddeler: [
      {
        baslik: 'Ortak anahtar ve imza sırrını üretin',
        aciklama: 'Biri partner anahtarı, biri en az 32 karakterlik imza sırrı. Aynı iki değer hem Ozvelo\'ya hem Hekimhane\'ye girilecek; kimseyle paylaşmayın.',
        kim: 'siz', durum: 'sirada', oncelikli: true,
      },
      {
        baslik: 'Ozvelo: veritabanı dosyasını çalıştırın, iki ayarı girip yayına alın',
        aciklama: 'Ozvelo projesinde supabase/update-2026-11-hekimhane.sql; Vercel\'de HEKIMHANE_PARTNER_ANAHTARI ve HEKIMHANE_IMZA_SIRRI. Ozvelo klasörü git deposu değil, yayına alma yöntemi oradaki notlarda.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Hekimhane\'yi yayına alın ve dört Ozvelo ayarını girin',
        aciklama: 'Ozvelo canlıda çalışmadan GİRMEYİN: girilirse hekimler asistanı açmaya çalışır ve "Eşitlenemedi" görür. OZVELO_API_URL, OZVELO_PARTNER_ANAHTARI, OZVELO_IMZA_SIRRI, OZVELO_SITE_URL.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Canlıda bir hekim profiliyle uçtan uca deneme',
        aciklama: 'Asistanı aç, sitenize ekleme kodu, Ozvelo\'ya giriş, e-posta/randevu/soru-cevap sayfaları, bir deneme randevusu.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Ücretsiz deneme sınırına karar verin',
        aciklama: 'Ozvelo\'da ücretsiz planda toplam 100 yapay zekâ yanıtı var. Hekimhane sayfalarında "ücretsiz deneyin" denirken bu sınırın nasıl anlatılacağı ve Pro üyelerde ne olacağı belli değil.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Hekimlere yönelik ana sayfa',
        aciklama: 'Önce ayrı ve aramada görünmeyen bir adreste; bağlantı canlıda çalışınca ana sayfaya alınır. Hasta araması en alta iner.',
        kim: 'claude', durum: 'sirada',
      },
    ],
  },
  {
    id: 'eposta-kanali',
    baslik: 'E-posta kanalı: Hekimhane adresini Ozvelo\'ya bağlama',
    aciklama: 'Ozvelo gelen maili okur, yanıt hazırlar ve sizin adınızla gönderir. Şu an kurulum yarıda: Ozvelo\'ya henüz hiç mail ulaşmadı ("waiting for the first forwarded email").',
    maddeler: [
      {
        baslik: 'Hangi adresin bağlanacağına karar verin',
        aciklama: 'info@ adresine KVKK başvuruları, abonelik iptali ve erken üye yanıtları da geliyor. Öneri: Ozvelo\'ya ayrı bir adres (ör. randevu@hekimhane.com.tr) bağlayın, info@ sizde kalsın.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Ozvelo\'da insana aktarma kuralı yazın',
        aciklama: '"Personality and rules" bölümüne: KVKK, kişisel veri, iptal, iade, fatura ve hukuki konularda yanıt verme, insana aktar.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'hPanel\'de yönlendirme kurun',
        aciklama: 'Emails → Forwarders → Create forwarder: kaynak bağlanacak adres, hedef Ozvelo\'daki …@mail.ozvelo.com adresi. "This address has no mailbox" anahtarını AÇMAYIN: MX kaydı değişir, Hostinger kutunuz mail almayı bırakır.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Deneme maili gönderin',
        aciklama: 'Gmail gibi başka bir adresten yazın. Ozvelo\'daki "Receiving" adımı yeşile dönmeli.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'Yanıtları kendi alan adınızdan gönderin (isteğe bağlı)',
        aciklama: 'Ozvelo\'nun "Show DNS records" kayıtları. Alan adında yalnız BİR SPF kaydı olabilir: ikincisini eklemeyin, mevcut kayda birleştirin. Eklemeden önce kayıtları Claude\'a gösterin, birleştirilmiş SPF birlikte yazılsın.',
        kim: 'siz', durum: 'sirada',
      },
      {
        baslik: 'KVKK ve hasta aydınlatma metnine e-posta işlemesini ekle',
        aciklama: 'Hostinger (e-posta barındırma) hizmet sağlayıcı listesine girer; Ozvelo\'nun e-postaları yapay zekâyla işlemesi /kvkk ve /aydinlatma/hasta metinlerinde açıklanır.',
        kim: 'claude', durum: 'sirada',
      },
      {
        baslik: 'İlk haftalarda yanıtları kontrol ederek gönderin',
        aciklama: 'Ozvelo onaylı gönderim sunuyorsa ilk 1–2 hafta onu kullanın; yanıtlar yerine oturunca otomatiğe geçin.',
        kim: 'siz', durum: 'sirada',
      },
    ],
  },
  {
    id: 'guvenlik',
    baslik: 'Güvenlik: açık kalanlar',
    aciklama: 'Kodda bilinen ve henüz kapatılmamış açıklar. Önce birinci madde.',
    maddeler: [
      {
        baslik: 'Yorumlar tablosu herkese okunabilir',
        aciklama: 'Veritabanı kuralı herkese okuma izni veriyor: herkese açık anahtarla yorumcuların e-postaları ve onay bekleyen yorumlar okunabiliyor. Panelin yorum okumasını sunucu rotasına taşıyıp kuralı kapatmak gerekiyor (SQL gerekecek).',
        kim: 'claude', durum: 'sirada', oncelikli: true,
      },
      {
        baslik: 'Sahiplik bırakılınca Stripe aboneliği sürüyor',
        aciklama: 'İşletme sahibi sahipliği bıraktığında Pro kapanıyor ama Stripe aboneliği iptal edilmiyor; kart çekilmeye devam edebilir.',
        kim: 'claude', durum: 'sirada', oncelikli: true,
      },
      {
        baslik: 'Son sahip ayrılınca yönetici ve asistanların erişimi sürüyor',
        kim: 'claude', durum: 'sirada',
      },
    ],
  },
  {
    id: 'sql',
    baslik: 'Bekleyen SQL dosyaları: Supabase SQL Editor',
    aciklama: 'Hangilerinin çalıştırıldığını buradan göremiyorum. Çalıştırdıklarınızı söyleyin, listeden çıkarayım. Çalışmayan dosyanın özelliği sitede sessizce kapalı kalır.',
    maddeler: [
      { baslik: '2026-10-26_kaldirma_karari.sql', aciklama: 'Profil kaldırma kararı: 48 saat duraklatma, yedekli kaldırma, geri yükleme. Yoksa "Kaldır" düğmesi yedek yazamadığı için silmez.', kim: 'siz', durum: 'kontrol' },
      { baslik: '2026-10-26_yorum_onay.sql', aciklama: 'Yorumcunun e-postası ve belge isteme kayıtları.', kim: 'siz', durum: 'kontrol' },
      { baslik: '2026-10-26_yorum_kurallari.sql', aciklama: 'Yorum kurallarının kabul zamanı ve "geliştirilebilir noktalar".', kim: 'siz', durum: 'kontrol' },
      { baslik: '2026-10-25_erken_uye_pro.sql', aciklama: 'İlk 150 işletmeye ücretsiz Pro, kutlama penceresi ve ana sayfa bandı.', kim: 'siz', durum: 'kontrol' },
      { baslik: '2026-10-25_web_baglantilari.sql', aciklama: 'Pro\'da 2 web bağlantısı. Yoksa Pro üye bu alanları doldurunca profil kaydı reddedilir.', kim: 'siz', durum: 'kontrol' },
      { baslik: '2026-10-25_sahiplik_duzelt.sql', aciklama: 'Doktor sahiplik kolonu ve sahiplik sayılarının yeniden hesabı.', kim: 'siz', durum: 'kontrol' },
      { baslik: 'add_booking_bekleme.sql (yeniden)', aciklama: 'Başvuru formuna "hangi özellik" kolonu eklendi; daha önce çalıştırıldıysa yeniden çalıştırılmalı.', kim: 'siz', durum: 'kontrol' },
      { baslik: 'add_premium_subscriptions.sql (yeniden)', aciklama: 'Eski sürüm abone e-postalarını herkese açan bir kural içeriyordu; yeni sürüm onu kaldırır.', kim: 'siz', durum: 'kontrol' },
      { baslik: 'add_profil_puani.sql + puan hesaplama betiği', aciklama: 'SQL\'den sonra bir kez: node scripts/profil-puani-hesapla.mjs --commit', kim: 'siz', durum: 'kontrol' },
    ],
  },
  {
    id: 'ozvelo-dogrudan',
    baslik: 'Ozvelo: posta kutusunu doğrudan bağlama',
    aciklama: 'Ozvelo projesinde yapılıyor (Hekimhane kodu değişmez). Yönlendirmeden farkı: Ozvelo tüm kutuyu görür, yanıtlar Gönderilmiş klasöründe durur, siz yanıtladığınız maile ikinci yanıt gitmez.',
    maddeler: [
      {
        baslik: 'IMAP/SMTP ile posta kutusu bağlama',
        aciklama: 'Ozvelo oturumunda yazılıyor: şifreli saklama, gelen postayı düzenli çekme, aynı yazışmanın içinde yanıt. Bitince Hekimhane adresi yönlendirme yerine bununla bağlanabilir.',
        kim: 'ozvelo', durum: 'yapiliyor',
      },
      {
        baslik: 'Hostinger ile bağlan',
        aciklama: 'Kullanıcı hPanel\'den API anahtarı yapıştırır; Ozvelo webhook\'u kendisi kurar, mail anında gelir.',
        kim: 'ozvelo', durum: 'sirada',
      },
      { baslik: 'Microsoft 365 / Outlook ile bağlan', kim: 'ozvelo', durum: 'sirada' },
      {
        baslik: 'Gmail ile bağlan',
        aciklama: 'Google, tüm kutuyu okuma izni için ücretli ve uzun bir güvenlik denetimi istiyor; en sona.',
        kim: 'ozvelo', durum: 'sirada',
      },
    ],
  },
  {
    id: 'canli-test',
    baslik: 'Canlıda denenmemiş özellikler',
    aciklama: 'Yerelde sahte veritabanıyla denendi; gerçek veritabanı ve gerçek e-postayla bir kez denenmeli.',
    maddeler: [
      { baslik: 'Panel → Profil Düzenle → Kaydet (yeni form)', kim: 'siz', durum: 'sirada' },
      { baslik: 'Yorum daveti e-postası (Panel → Yorumlar)', kim: 'siz', durum: 'sirada' },
      { baslik: 'Panelden makale gönderme ve admin onayı', kim: 'siz', durum: 'sirada' },
      { baslik: 'Booking / demo başvuru formu ve bildirim e-postası', kim: 'siz', durum: 'sirada' },
      { baslik: 'Asistan ve yönetici daveti (gerçek hesap oluşturma)', kim: 'siz', durum: 'sirada' },
    ],
  },
  {
    id: 'yasal',
    baslik: 'Yasal ve resmî işler',
    aciklama: 'Kod tarafı hazır; bu maddeler avukat ya da resmî başvuru bekliyor.',
    maddeler: [
      {
        baslik: 'Künye bilgileri',
        aciklama: 'Adres, vergi no, MERSİS, KEP ve telefon boş. Bilgileri verin; sözleşme, KVKK ve footer\'da kendiliğinden görünür.',
        kim: 'siz', durum: 'sirada',
      },
      { baslik: 'İYS kaydı (ticari elektronik ileti)', kim: 'siz', durum: 'sirada' },
      { baslik: 'VERBİS kaydı', kim: 'siz', durum: 'sirada' },
      {
        baslik: 'Aydınlatma metinleri: saklama süreleri ve yurt dışı aktarım',
        aciklama: 'Kaldırılan profil yedeği (30 gün), randevu ve sohbet kayıtlarının saklama süresi, tedarikçi ülkeleri (Supabase bölgesi doğrulanmalı).',
        kim: 'avukat', durum: 'sirada',
      },
      { baslik: 'Yorum Yayınlama Kuralları metni', kim: 'avukat', durum: 'sirada' },
      { baslik: 'Pro sözleşme eki, veri kaynağı ve yurt dışı aktarım envanteri', kim: 'avukat', durum: 'sirada' },
    ],
  },
  {
    id: 'kucuk-eksikler',
    baslik: 'Ürün: küçük eksikler',
    aciklama: 'Acil değil; sırası gelince tek tek.',
    maddeler: [
      { baslik: '/katil\'de "bu işletme zaten listede mi?" kontrolü', aciklama: 'Şu an aynı işletme ikinci kez başvurup mükerrer kayıt açabiliyor.', kim: 'claude', durum: 'sirada' },
      { baslik: '/makale-yayinla\'daki aylık ziyaretçi sayısı yer tutucu', aciklama: 'Vercel Analytics\'ten gerçek değeri verin, sayfaya yazılsın.', kim: 'siz', durum: 'sirada' },
      { baslik: '/randevu-modulu\'ndeki "Google İşletme profili" ifadesi', aciklama: 'Google İşletme profiline randevu modülü gömülemiyor; ifade düzeltilmeli.', kim: 'claude', durum: 'sirada' },
      { baslik: 'Doktor–hastane bağı yalnız ad eşleşmesiyle kuruluyor', aciklama: 'İçe aktarılan listedeki hastane kodu kullanılmamış; adı farklı yazılan hekim kadroda görünmüyor.', kim: 'claude', durum: 'sirada' },
      { baslik: 'Doktor etiketleri arama ve listelere girmiyor', kim: 'claude', durum: 'sirada' },
      { baslik: 'Admin giriş sayfası hâlâ koyu tema', aciklama: 'Panelle uyumlu açık temaya alınmalı.', kim: 'claude', durum: 'sirada' },
    ],
  },
];

/* ───────────────────────── YAPILANLAR ─────────────────────────
   En yeni en üstte. Aynı güne birden çok kayıt girebilir. */
export const YAPILANLAR: Guncelleme[] = [
  // ── Kasım 2026
  { tarih: '2026-11-15', alan: 'Yasal', baslik: 'İşletmesi kaldırılanın HekimKart\'ı da kalkıyor', maddeler: [
    'Bir işletme siteden kaldırıldığında ona bağlı HekimKart da birlikte kalkar. Eskiden kart yayında kalıyor, kişinin adı, fotoğrafı ve telefonu görünmeye devam ediyordu.',
    'Kaldırma talebiyle silinen profillerde kart da yedeğe alınır; profil geri yüklenirse kartı da aynı adresle geri gelir.',
    'İşletmesi artık bulunmayan bir kart açılmak istenirse sayfa gösterilmez; eski silmelerden kalan kart olsa bile görünmez.',
  ]},
  { tarih: '2026-11-04', alan: 'Panel', baslik: 'Yapay zekâ asistanının Hekimhane tarafı', maddeler: [
    'Panelde "Yapay Zekâ Asistanı" sekmesi: hekim onay vererek asistanını açar, sitesine ekleyeceği kodu alır, şifresiz Ozvelo\'ya geçer.',
    'Profil her kaydedildiğinde asistan kendiliğinden güncellenir; her gece de baştan kontrol edilir. Son sahip ayrılınca asistan kapanır.',
    'Asistanın aldığı randevu talepleri paneldeki Randevu Talepleri\'ne düşer. Ozvelo tarafı hazır olunca açılacak.',
    'Panelde "Dijital Asistanlar" başlığı: Yapay Zekâ Asistanı, E-posta Asistanı, Randevu Talebi Asistanı ve Soru-Cevap. İçerikler Ozvelo\'dan anlık gelir; her sayfadan Ozvelo\'ya şifresiz giriş.',
    'Profil düzenleme sayfasında "bu bilgiler yapay zekâ asistanınızı doğrudan bilgilendirir" notu.',
    'Çalışanlarınıza sınırlı erişim verdiğiniz "Asistanlar" sekmesinin adı "Ekip" oldu.',
  ]},
  // ── Ekim 2026
  { tarih: '2026-10-31', alan: 'Admin', baslik: 'Yol Haritası sekmesi', maddeler: [
    'Admin panelinde yapılacaklar (gruplu ve sıralı) ve yapılanlar (tarihli) zaman çizelgesi.',
    'Kenar çubuğunda sizden beklenen iş sayısı rozetle görünür.',
  ]},
  { tarih: '2026-10-31', alan: 'Blog', baslik: 'Diş hekimlerine özel "Dijital Hekimlik" dizisi', maddeler: [
    '10 özgün, kaynaklı yazı ve kendi kapakları.',
  ]},
  { tarih: '2026-10-31', alan: 'Site', baslik: 'Hekimler baktığı hastalıklarla bulunur', maddeler: [
    '"lipödem ankara" gibi aramalar, hekimin panelde seçtiği hastalıklardan sonuç getirir.',
    'Ana sayfadaki şehir alanı da canlı aramaya katılır.',
  ]},
  { tarih: '2026-10-30', alan: 'Site', baslik: 'Hekimhane\'ye katılmamış işletmeye randevu talebi kapandı', maddeler: [
    'Sahiplenilmemiş profilde randevu formu açılmaz; işletmenin kendi telefonu gösterilir.',
    'Yan "Online Randevu" kutusu yalnız bilgi notu gösterir. Sunucu da aynı kuralı uygular.',
  ]},
  { tarih: '2026-10-27', alan: 'Site', baslik: 'Çocuklar için "2 Dakika Fırçala" oyunu', maddeler: [
    '4 bölge × 30 saniye diş fırçalama oyunu; başka sitelere gömme kodu.',
    'Ana sayfa erken üye bandına "tanıdığınız hekime gönderin" düğmeleri (WhatsApp, Instagram, bağlantı).',
  ]},
  { tarih: '2026-10-27', alan: 'Panel', baslik: 'Profil Düzenle formu yenilendi', maddeler: [
    'Apple tarzı seçim kutuları, telefonda alttan açılan listeler, gruplu bölümler.',
    'İlk sekmede büyük profil fotoğrafı kartı; seçilen fotoğraf hemen kaydedilir.',
  ]},
  { tarih: '2026-10-27', alan: 'Panel', baslik: 'Yorum toplama, yorum kuralları, Pro makale hakkı', maddeler: [
    'Ofis için A5/A6 değerlendirme posteri (PDF) ve hastalara e-posta daveti.',
    '/yorum-kurallari sayfası; yorum formlarında kurallar onayı ve en az 50 karakter.',
    'Panelden makale gönderimi Pro\'ya haftada 1 ücretsiz.',
  ]},
  { tarih: '2026-10-27', alan: 'Blog', baslik: 'Yazı düzeni ve hastalık seçici', maddeler: [
    'Kapak görseli yazının içinde; kalın, italik ve site içi bağlantılar.',
    'Doktor panelinde "Baktığınız hastalıklar" seçici; profilde ve yazı sonunda hekim kutusu.',
  ]},
  { tarih: '2026-10-26', alan: 'Admin', baslik: 'Hiçbir yorum onaysız yayınlanmaz', maddeler: [
    'Yeni Yorumlar sekmesi: onayla, reddet, yazandan belge iste.',
    'Yorumcunun e-postası kaydedilir; sayfa kaynağına sızmaz.',
  ]},
  { tarih: '2026-10-26', alan: 'Admin', baslik: 'Profil kaldırma yönetici kararına bağlandı', maddeler: [
    'Talep 48 saat sonra profili duraklatır; kaldırma yedekli yapılır, geri yüklenebilir.',
  ]},
  { tarih: '2026-10-26', alan: 'Yasal', baslik: 'Uyum güncellemeleri', maddeler: [
    'Sahiplenilmemiş profilde "sahiplen / düzelt / kaldırılmasını iste" düğmeleri ve formları.',
    'Profesyoneller ve hastalar için aydınlatma metinleri; footer bildirimi.',
    'Pro sıralamadan çıktı; "Önerilen diş hekimleri" kaldırıldı.',
  ]},
  { tarih: '2026-10-26', alan: 'Blog', baslik: '67 hastalık ve 14 fizik tedavi yazısı', maddeler: [
    'Saatli yayın takvimi: günde 1–3 yazı kendiliğinden yayına girer.',
  ]},
  { tarih: '2026-10-26', alan: 'Site', baslik: 'Ücretsiz Pro kontenjan sayacı tek kaynakta', maddeler: [
    'Kayıt gelmeyen her gün bir yer kapanır; ekrandaki "kalan" verilebilecek Pro sayısına eşit.',
  ]},
  { tarih: '2026-10-26', alan: 'SEO', baslik: 'Yorum yapılandırılmış verisi düzeltildi', maddeler: [
    'Search Console\'daki "aggregateRating eksik" hatası giderildi.',
  ]},
  { tarih: '2026-10-25', alan: 'Site', baslik: 'İlk 150 işletmeye ücretsiz Pro', maddeler: [
    'Ana sayfada canlı kontenjan bandı, panelde kutlama penceresi, yeni onay e-postası.',
  ]},
  { tarih: '2026-10-25', alan: 'Güvenlik', baslik: 'Sahiplik tek kaynaktan, panel oturumu doğrulamalı', maddeler: [
    '"Onaylı" rozeti yalnız gerçek sahiplikte; sahipsiz doktorlara "zaten sahiplenilmiş" denmesi düzeltildi.',
    'Panel rotaları oturumu Supabase\'e doğrulatıyor (13 rota); sahte çerezle işlem yapılamaz.',
  ]},
  { tarih: '2026-10-25', alan: 'Site', baslik: 'Pro\'da 2 web bağlantısı, künye ve başlıklar', maddeler: [
    'Doktorda da web sitesi; bağlantılar Kurum Bilgisi kartında.',
    'Footer: "hekimhane.com.tr bir Doktorio.cz kuruluşudur". Sayfa başlıklarında çift "| Hekimhane" kalktı.',
  ]},
  { tarih: '2026-10-24', alan: 'Site', baslik: 'Hekimhane Booking ve özellik sayfaları', maddeler: [
    'Booking sayfası; tüm özellik sayfaları aynı iskelette, ortak başvuru/demo formu.',
    'Ana sayfa vitrini parmakla kaydırılır; üst menü sadeleşti.',
  ]},
  { tarih: '2026-10-24', alan: 'Tasarım', baslik: 'Kayıt ve sahiplenme formları sadeleşti', maddeler: [
    '/katil ve /sahiplen: dolu alanlar belirgin, hatalı alana odaklanma; canlı altın düğmeler.',
  ]},
  { tarih: '2026-10-22', alan: 'SEO', baslik: 'Arama tüm işletmelerde, canonical düzeltmesi', maddeler: [
    'Ana sayfa araması klinik, hekim, hastane ve eczaneyi birlikte getirir; tür renkle ayrılır.',
    'Canonical, İ harfli adresler, sitemap tarihleri düzeldi; eczane listesi hızlandı.',
  ]},
  { tarih: '2026-10-20', alan: 'Site', baslik: 'Eczane listesi ve yeni işletme onayı', maddeler: [
    'Eczane sayıları doğru (1000 satır sınırı aşıldı); il/ilçe sırası ve ilçe filtresi.',
    'Yeni işletme başvurusu onaylanınca liste kaydı otomatik oluşturulur.',
  ]},
  { tarih: '2026-10-20', alan: 'Ödeme', baslik: 'Abonelik hareketlerinde admin bildirimi', maddeler: [
    'Yeni Pro üye, iptal, iptalin geri alınması ve üyeliğin bitmesi e-postayla bildirilir.',
  ]},
  { tarih: '2026-10-19', alan: 'Ödeme', baslik: 'Pro aylık 290 TL', maddeler: [] },
  { tarih: '2026-10-18', alan: 'Güvenlik', baslik: 'Telefon numaraları açıkta yazmaz', maddeler: [
    'Her yerde yalnız "Ara" düğmesi; basınca numara görünür.',
    'Eczanelerdeki 1.871 kişisel cep numarası kaldırıldı.',
  ]},
  { tarih: '2026-10-17', alan: 'Panel', baslik: 'Onaylı hasta yorumu', maddeler: [
    'Tamamlanan randevuya tek kullanımlık değerlendirme bağlantısı; profilde "Onaylı hasta" rozeti.',
  ]},
  { tarih: '2026-10-14', alan: 'Site', baslik: '"Diğer Branşlar" menüsü', maddeler: [
    'Fizyoterapist, fizik tedavi, psikiyatri, psikolog, hastane ve eczane.',
  ]},
  { tarih: '2026-10-12', alan: 'Tasarım', baslik: 'Vitrin dili', maddeler: [
    '"Neden Hekimhane" baştan yazıldı; ana sayfada renkli sekmeli vitrin ve araç kartları.',
  ]},
  { tarih: '2026-10-11', alan: 'Site', baslik: 'Kayıt adımları ve giriş', maddeler: [
    '/katil adımları geri tuşuyla çalışır; giriş türü rozeti; öne çıkanlar profil puanına göre.',
  ]},
  { tarih: '2026-10-10', alan: 'Tasarım', baslik: 'Yeni logo ve ikon seti', maddeler: [
    '"Akışkan H" logosu, 57 ikonluk set, hareketli logo ve ikonlar.',
  ]},
  { tarih: '2026-10-10', alan: 'Yasal', baslik: 'Çerez onayı ve sözleşme sayfaları', maddeler: [
    'Çerez onayı (istatistik yalnız onayla), mesafeli satış, ön bilgilendirme, iptal-iade sayfaları.',
    'E-posta listesine yalnız açık izinle kayıt.',
  ]},
  { tarih: '2026-10-10', alan: 'Site', baslik: 'Gizli profil puanı ve klinik listesi', maddeler: [
    'Profilini dolduran üst sıraya çıkar; puan yalnız sahibine panelde görünür.',
    '/klinikler varsayılan "Hepsi", Özel/Devlet/Üniversite rozeti, yazdıkça daralan arama.',
  ]},
  { tarih: '2026-10-09', alan: 'Site', baslik: 'Ana sayfa konum seçici', maddeler: ['İl ve ilçe için özel açılır liste.'] },
  { tarih: '2026-10-06', alan: 'Tasarım', baslik: 'Tasarım Sistemi v3', maddeler: ['Renk ve yazı tipi tokenları; üst menü, footer, liste ve ana sayfa yenilendi.'] },
  { tarih: '2026-10-05', alan: 'Site', baslik: 'Randevu talebi notu', maddeler: ['Talebin kesinleşmiş randevu olmadığı açıkça yazılır.'] },
  // ── Eylül 2026
  { tarih: '2026-09-29', alan: 'Site', baslik: 'Kamu hastanelerinde randevu talebi kapalı', maddeler: ['Devlet ve üniversite hastaneleri MHRS\'ye yönlendirilir.'] },
  { tarih: '2026-09-27', alan: 'Panel', baslik: 'Yorum şikayet akışı ve Hesabım sayfası', maddeler: ['İşletme yorumu şikayet eder, son kararı admin verir.'] },
  { tarih: '2026-09-23', alan: 'Güvenlik', baslik: 'Admin API yetki doğrulaması', maddeler: ['8 kritik düzeltme; panel telefonda kullanılabilir.'] },
  { tarih: '2026-09-21', alan: 'Tasarım', baslik: 'Açık tema', maddeler: ['Admin paneli, ana sayfa hero ve liste başlıkları açık ve sade.', 'MCP bağlantısı yalnız Pro işletmelere.'] },
  { tarih: '2026-09-16', alan: 'Panel', baslik: 'Asistanlar, HekimKart ve sahiplik atama', maddeler: [
    'İşletme asistanları: yetki bazlı sınırlı erişim.',
    'HekimKart adresi değişince eski bağlantılar yönlendirilir; tam önizleme ve web sitesi rozeti.',
    'Admin işletme listesinden e-postayla sahiplik atar; Pro\'da 2 randevu bildirim adresi.',
  ]},
  { tarih: '2026-09-14', alan: 'Panel', baslik: 'İşletme yöneticileri ve işletmeye özel MCP anahtarı', maddeler: [] },
  { tarih: '2026-09-13', alan: 'Panel', baslik: 'Hekimhane MCP sunucusu', maddeler: [
    'Yapay zekâ asistanından randevu, takvim, yorum ve hasta e-postası yönetimi.',
    'Randevu takvim görünümü; kenar çubuğunda Aktif İşletme seçici.',
  ]},
  // ── Ağustos 2026
  { tarih: '2026-08-31', alan: 'Ödeme', baslik: 'Abonelik iptal yolu', maddeler: ['Hesabım\'da iptal kartı ve /abonelik-iptali formu.'] },
  { tarih: '2026-08-03', alan: 'Site', baslik: 'Makale sistemi ve randevu modülü', maddeler: [
    'İş ortağı makalesi; panelden gönderim, admin onayı.',
    'Randevu modülünü işletmenin kendi sitesine gömme kodu; doktor mesleki bilgileri.',
  ]},
  { tarih: '2026-08-02', alan: 'Panel', baslik: 'Sahiplenme e-postaları ve hesap aktivasyonu', maddeler: [
    'Onayda kullanıcıya aktivasyon bağlantısı; admin paneline coğrafi kısıt; yorum moderasyonu; WhatsApp alanı.',
  ]},
  { tarih: '2026-08-01', alan: 'Ödeme', baslik: 'Randevu talepleri paneli ve Stripe Pro', maddeler: [
    'İşletme sahibine Randevu Talepleri sekmesi; Stripe ile Pro aboneliği; admin Premium sekmesi.',
  ]},
  // ── Temmuz 2026
  { tarih: '2026-07-27', alan: 'SEO', baslik: 'Devlet diş hastaneleri ve SSS şemaları', maddeler: ['Devlet Ağız ve Diş Sağlığı Hastaneleri kategorisi; profillerde SSS.'] },
  { tarih: '2026-07-26', alan: 'SEO', baslik: 'İl + uzmanlık sayfaları ve site haritası', maddeler: ['Kombinasyon sayfaları, ağaç yapılı sitemap, RSS.'] },
  { tarih: '2026-07-24', alan: 'Site', baslik: 'HekimKart', maddeler: ['Her profil için dijital kartvizit ve baskıya hazır A5 poster.'] },
  { tarih: '2026-07-06', alan: 'Site', baslik: 'Karşılaştırma özelliği', maddeler: [] },
  { tarih: '2026-07-05', alan: 'Site', baslik: 'Randevu talebi ve yakınımdaki eczaneler', maddeler: [] },
  // ── Haziran ve öncesi
  { tarih: '2026-06-29', alan: 'SEO', baslik: 'SEO ve "Şikayetinizi Anlatın" bölümü', maddeler: [] },
  { tarih: '2026-06-24', alan: 'Altyapı', baslik: 'Supabase ve Vercel yayını', maddeler: ['Site canlıya hazırlandı.'] },
  { tarih: '2026-04-15', alan: 'Altyapı', baslik: 'Hekimhane\'nin ilk sürümü', maddeler: ['Next.js projesi, hastalık rehberi, klinik/hastane/doktor/eczane listeleri.'] },
];

/** Kenar çubuğu rozeti ve özet: sizden beklenen açık iş sayısı. */
export function yolHaritasiOzet() {
  const tum = YAPILACAKLAR.flatMap(g => g.maddeler);
  return {
    acik: tum.length,
    sizde: tum.filter(m => m.kim === 'siz').length,
    yapiliyor: tum.filter(m => m.durum === 'yapiliyor').length,
    oncelikli: tum.filter(m => m.oncelikli).length,
    sonGuncelleme: YAPILANLAR[0]?.tarih ?? null,
  };
}
