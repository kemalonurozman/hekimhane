// ─────────────────────────────────────────────────────────────────
//  İlk kullanıcılara ücretsiz Pro — METİNLER (tek kaynak, Eki 2026).
//  Panel kutlama penceresi, onay e-postaları ve admin bildirimleri buradan okur.
//  İstemci + sunucu ortak: sunucu importu KOYMA.
//
//  Süre bilerek yazılmadı: ücretsiz Pro'nun ne kadar süreceği sahibinin kararı.
//  "Ömür boyu", "12 ay" gibi bir taahhüt buraya onaysız EKLENMEZ.
//  Pro sıralamayı etkilemez → "öne çıkma / görünürlük" vaadi de yazılmaz.
// ─────────────────────────────────────────────────────────────────

/** Otomatik ücretsiz Pro verilecek işletme sayısı (kontenjanın tamamı). */
export const ERKEN_UYE_KOTA = 150;

/**
 * Kontenjanın başlangıç dolgusu: bu sistem kurulmadan önce sahiplenen
 * işletmeler `erken_uye_pro` tablosunda yok. Sahibinin bilgisiyle sayaç
 * 52'den başlar (2026-10-26: 52 dolu, 98 yer kaldı); ana sayfa bandı, kota hesabı ve admin notu
 * hepsi `ERKEN_UYE_BASLANGIC + otomatik kayıt` sayar. Otomatik verilecek
 * Pro sayısı = ERKEN_UYE_KOTA − ERKEN_UYE_BASLANGIC (98).
 */
export const ERKEN_UYE_BASLANGIC = 52;

/**
 * Günlük azalmanın başladığı Türkiye takvim günü. Bu günden itibaren gerçek
 * kayıt olmadan biten her gün kontenjandan bir yer kapatır (lib/erken-uye-sayac.ts).
 */
export const ERKEN_UYE_SAYAC_TARIH = '2026-10-26';

/** Pro ile açılan, gerçekten var olan özellikler (panel + e-posta aynı liste). */
export const ERKEN_UYE_OZELLIKLER: { baslik: string; aciklama: string }[] = [
  { baslik: 'Randevu takvimi', aciklama: 'Çalışma saatlerinize göre online randevu alın; talepleri takvimde yönetin.' },
  { baslik: 'Web sitesi ve sosyal medya', aciklama: 'İki web bağlantısı ile Instagram, Facebook ve LinkedIn hesaplarınız profilinizde.' },
  { baslik: 'İki bildirim adresi', aciklama: 'Randevu bildirimleri iki ayrı e-posta adresine gider.' },
  { baslik: 'Yapay zekâ ile yönetim', aciklama: 'Randevularınızı ve yorumlarınızı yapay zekâ asistanınızdan yönetin (MCP).' },
];

export const ERKEN_UYE_METIN = {
  rozet: 'İlk kullanıcılara özel',
  baslik: 'Tebrikler, Hekimhane-Pro üyesisiniz',
  giris: (isletme: string) =>
    `${isletme} profilinin sahipliği onaylandı. Hekimhane'nin ilk kullanıcılarına özel politikası kapsamında hesabınız ücretsiz olarak Hekimhane-Pro'ya geçirildi.`,
  takvim: 'Randevu takvimini ücretsiz kullanabilirsiniz: takvimi açtığınız anda hastalarınız profilinizden uygun saati seçerek randevu talebi bırakabilir.',
  guvence: 'Sizden kart ya da ödeme bilgisi istenmez; hesabınızdan herhangi bir ücret tahsil edilmez.',
  birincil: 'Randevu takvimini açın',
  ikincil: 'Daha sonra',
  /** Panel Hesabım / Genel Bakış satırındaki kısa durum. */
  durum: 'Ücretsiz Pro · İlk kullanıcılara özel',
  /** E-posta konu satırı ekleri */
  konuEki: 'Hekimhane-Pro hesabınız ücretsiz tanımlandı',
};
