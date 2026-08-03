// Diş odaklı blog makaleleri — statik veri.
// blog_posts tablosu boş olduğunda bu içerikler gösterilir ve
// /blog/[slug] detay sayfası bunları render eder.

export type BlogBlok =
  | { tip: 'p'; metin: string }
  | { tip: 'h'; metin: string }
  | { tip: 'liste'; ogeler: string[] };

export interface BlogYazi {
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  created_at: string;   // YYYY-MM-DD
  okumaDk: number;
  cover_image: string | null;
  views: number;
  govde: BlogBlok[];
}

const UYARI =
  'Bu içerik yalnızca genel bilgilendirme amaçlıdır ve diş hekimi muayenesinin yerini tutmaz. Şikâyetiniz için mutlaka bir diş hekimine başvurun.';

export const BLOG_YAZILARI: BlogYazi[] = [
  {
    slug: 'dis-hekimi-secerken-dikkat-edilmesi-gerekenler',
    title: 'Diş Hekimi Seçerken Dikkat Edilmesi Gereken 7 Kriter',
    summary: 'Doğru diş hekimini bulmak, ağız sağlığınızı korumanın ilk adımıdır. Klinik, hijyen ve iletişim açısından nelere bakmalısınız?',
    category: 'Hasta Rehberi',
    author: 'Hekimhane Editör',
    created_at: '2026-06-02',
    okumaDk: 5,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Diş tedavileri çoğu zaman tek seferlik değildir; dolgudan kanal tedavisine, implanttan ortodontiye kadar birçok işlem süreklilik ve güven ister. Bu yüzden doğru diş hekimini seçmek, tedavinin kendisi kadar önemlidir.' },
      { tip: 'h', metin: '1. Diploma ve uzmanlık alanı' },
      { tip: 'p', metin: 'Hekimin diploması ve varsa uzmanlık belgesi (ortodonti, cerrahi, protez vb.) klinikte görünür olmalıdır. İhtiyacınız implant ya da tel tedavisi gibi özel bir alandaysa, o konuda deneyimli bir hekimi tercih edin.' },
      { tip: 'h', metin: '2. Klinik hijyeni ve sterilizasyon' },
      { tip: 'p', metin: 'Aletlerin paketli şekilde açılması, tek kullanımlık malzeme kullanımı ve otoklav sterilizasyonu enfeksiyon riski açısından kritiktir. Bekleme salonunun ve muayene odasının temizliği genel özenin göstergesidir.' },
      { tip: 'h', metin: '3. Hasta yorumları ve puanlar' },
      { tip: 'p', metin: 'Daha önce tedavi olmuş hastaların deneyimleri; randevuya uyum, ağrısız işlem ve sonrası iletişim hakkında fikir verir. Hekimhane üzerinde her klinik ve hekim için puan ve yorumları inceleyebilirsiniz.' },
      { tip: 'h', metin: '4. Tedavi öncesi bilgilendirme' },
      { tip: 'p', metin: 'İyi bir hekim tedaviyi, süresini, alternatiflerini ve maliyetini anlaşılır biçimde açıklar. Muayene sonrası size yazılı bir tedavi planı sunulması güven vericidir.' },
      { tip: 'h', metin: '5. Konum ve ulaşılabilirlik' },
      { tip: 'p', metin: 'Uzun tedavilerde kliniğe kolay ulaşmak devamlılığı artırır. Ev veya işyerinize yakın, randevu esnekliği olan bir klinik süreci kolaylaştırır.' },
      { tip: 'h', metin: '6. Fiyat şeffaflığı' },
      { tip: 'p', metin: 'Sürpriz ek ücretlerden kaçınmak için işlem başına fiyatı ve ödeme seçeneklerini önceden netleştirin. Çok düşük fiyatlar kadar aşırı yüksek fiyatlar da sorgulanmalıdır.' },
      { tip: 'h', metin: '7. Acil durum desteği' },
      { tip: 'p', metin: 'Tedavi sonrası ağrı veya sorun olduğunda hekime ulaşabilmek önemlidir. Kliniğin acil durumlarda nasıl bir yol izlediğini önceden sorun.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'implant-tedavisi-hakkinda-merak-edilenler',
    title: 'İmplant Tedavisi Hakkında Merak Edilen Her Şey',
    summary: 'İmplant nedir, kimlere uygulanır, süreç ne kadar sürer ve ne kadar dayanır? Sık sorulan soruları yanıtladık.',
    category: 'Tedaviler',
    author: 'Hekimhane Editör',
    created_at: '2026-05-20',
    okumaDk: 6,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Diş implantı, kaybedilen bir dişin yerine çene kemiğine yerleştirilen titanyum bir vida ve üzerine yapılan protez dişten oluşur. Doğal dişe en yakın çözüm olarak kabul edilir.' },
      { tip: 'h', metin: 'İmplant kimlere uygulanır?' },
      { tip: 'p', metin: 'Bir veya birden fazla dişini kaybetmiş, çene kemiği yapısı uygun ve genel sağlığı iyi olan yetişkinlere uygulanabilir. Kemik yetersizse önce kemik güçlendirme (greftleme) gerekebilir.' },
      { tip: 'h', metin: 'Süreç nasıl işler?' },
      { tip: 'liste', ogeler: [
        'Muayene ve röntgen ile kemik değerlendirmesi',
        'İmplantın cerrahi olarak yerleştirilmesi (genellikle lokal anestezi ile)',
        'Kemiğe kaynaması için 2–4 aylık iyileşme dönemi',
        'Üzerine protez dişin (kron) yapılması',
      ] },
      { tip: 'h', metin: 'Ağrılı mıdır?' },
      { tip: 'p', metin: 'İşlem lokal anestezi altında yapıldığı için sırasında ağrı hissedilmez. Sonrasında birkaç gün sürebilen hafif şişlik ve hassasiyet normaldir ve ağrı kesicilerle kontrol edilebilir.' },
      { tip: 'h', metin: 'Ne kadar dayanır?' },
      { tip: 'p', metin: 'Düzenli ağız bakımı ve diş hekimi kontrolleriyle implantlar 15–25 yıl, çoğu zaman ömür boyu kullanılabilir. Sigara ve kötü ağız hijyeni ömrünü kısaltan başlıca faktörlerdir.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'dis-eti-kanamasi-nedenleri',
    title: 'Diş Eti Kanaması: Nedenleri ve Ne Zaman Doktora Gidilmeli?',
    summary: 'Fırçalarken diş etiniz kanıyorsa bunu görmezden gelmeyin. Diş eti kanamasının nedenleri ve alınabilecek önlemler.',
    category: 'Diş Sağlığı',
    author: 'Hekimhane Editör',
    created_at: '2026-05-08',
    okumaDk: 4,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Diş eti kanaması genellikle diş etinin iltihaplanması (gingivit) belirtisidir. En sık nedeni, diş yüzeyinde biriken ve zamanla sertleşen bakteri plağıdır.' },
      { tip: 'h', metin: 'Başlıca nedenleri' },
      { tip: 'liste', ogeler: [
        'Yetersiz veya hatalı diş fırçalama',
        'Diş taşı (tartar) birikimi',
        'Sert fırça veya agresif fırçalama',
        'Sigara kullanımı',
        'Hamilelik gibi hormonal değişiklikler',
        'Bazı ilaçlar ve vitamin eksiklikleri',
      ] },
      { tip: 'h', metin: 'Evde ne yapabilirsiniz?' },
      { tip: 'p', metin: 'Günde iki kez yumuşak fırçayla nazikçe fırçalayın, diş ipi kullanın ve fırçanızı 3 ayda bir yenileyin. Kanama birkaç günde geçmezse mutlaka bir diş hekimine başvurun.' },
      { tip: 'h', metin: 'Ne zaman doktora gitmeli?' },
      { tip: 'p', metin: 'Kanama iki haftadan uzun sürüyorsa, diş etleri kızarık ve şişse, ağız kokusu veya dişlerde sallanma eşlik ediyorsa bu durum periodontit (ileri diş eti hastalığı) işareti olabilir ve profesyonel tedavi gerektirir.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'cocuklarda-ilk-dis-hekimi-ziyareti',
    title: 'Çocuklarda İlk Diş Hekimi Ziyareti Ne Zaman Olmalı?',
    summary: 'İlk diş çıktığında mı, okul çağında mı? Çocuğunuzun diş sağlığı için doğru zamanlama ve ipuçları.',
    category: 'Çocuk Diş Sağlığı',
    author: 'Hekimhane Editör',
    created_at: '2026-04-25',
    okumaDk: 4,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Uzmanlar, çocuğun ilk dişinin çıkmasından sonra veya en geç 1 yaşına kadar ilk diş hekimi ziyaretinin yapılmasını önerir. Erken tanışma, çürükleri önlemenin ve çocuğun hekim korkusu geliştirmemesinin anahtarıdır.' },
      { tip: 'h', metin: 'Neden bu kadar erken?' },
      { tip: 'p', metin: 'Süt dişleri çürükleri, kalıcı dişlerin sağlığını ve çene gelişimini etkileyebilir. Erken kontrolle beslenme, biberon çürüğü ve fırçalama alışkanlıkları hakkında bilgi alınır.' },
      { tip: 'h', metin: 'Ziyareti kolaylaştıran ipuçları' },
      { tip: 'liste', ogeler: [
        'Randevuyu çocuğun dinlenmiş ve tok olduğu bir saate alın',
        'Diş hekimini korkutucu değil, dişleri sayan bir "dost" olarak anlatın',
        'İlk ziyaretin kısa ve tanışma amaçlı olduğunu bilin',
        'Kendi kontrollerinizi çocuğunuza örnek gösterin',
      ] },
      { tip: 'p', metin: 'Sonrasında 6 ayda bir düzenli kontroller, sorunları büyümeden yakalamanın en etkili yoludur.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'dis-beyazlatma-yontemleri-guvenli-mi',
    title: 'Diş Beyazlatma Yöntemleri: Güvenli mi, Kalıcı mı?',
    summary: 'Klinikte beyazlatma, evde jel, beyazlatıcı diş macunu... Hangisi işe yarar, hangisi zararlı? Kısa bir rehber.',
    category: 'Estetik',
    author: 'Hekimhane Editör',
    created_at: '2026-04-10',
    okumaDk: 5,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Dişler; kahve, çay, sigara ve yaşlanmayla zamanla sararır. Beyazlatma, bu renklenmeleri açmayı hedefler; ancak her yöntem aynı derecede güvenli ve etkili değildir.' },
      { tip: 'h', metin: 'Klinikte beyazlatma' },
      { tip: 'p', metin: 'Diş hekimi kontrolünde yapılan ofis tipi beyazlatma en hızlı ve güvenli yöntemdir. Diş eti korunarak yüksek konsantrasyonlu jel uygulanır; tek seansta belirgin sonuç alınabilir.' },
      { tip: 'h', metin: 'Evde (hekim gözetiminde) beyazlatma' },
      { tip: 'p', metin: 'Hekimin size özel hazırladığı plak ve jel ile evde uygulanır. Daha yavaştır ama kontrollüdür. Reçetesiz internetten alınan yüksek dozlu ürünler diş minesine ve diş etine zarar verebilir.' },
      { tip: 'h', metin: 'Beyazlatıcı diş macunları' },
      { tip: 'p', metin: 'Yüzeydeki lekeleri hafifçe azaltır ama dişin gerçek rengini birkaç ton açamaz. Aşındırıcı olanların uzun süreli kullanımı mineyi yıpratabilir.' },
      { tip: 'h', metin: 'Kalıcı mı?' },
      { tip: 'p', metin: 'Beyazlatma kalıcı değildir; beslenme ve alışkanlıklara göre 6 ay–2 yıl arası etkisini korur. Sigara ve koyu içeceklerden kaçınmak sonucun ömrünü uzatır. Beyazlatma öncesi mutlaka bir diş hekimine danışın.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'agiz-kokusu-halitozis-neden-olur',
    title: 'Ağız Kokusu (Halitozis) Neden Olur, Nasıl Geçer?',
    summary: 'Ağız kokusunun ardında çoğu zaman basit bir neden yatar. Kaynakları ve kalıcı çözüm için yapılması gerekenler.',
    category: 'Diş Sağlığı',
    author: 'Hekimhane Editör',
    created_at: '2026-03-28',
    okumaDk: 4,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Ağız kokusunun (halitozis) yaklaşık %85–90\'ı ağız kaynaklıdır. Dilin arka bölgesinde ve dişler arasında biriken bakteriler, kötü kokulu bileşikler üretir.' },
      { tip: 'h', metin: 'En sık nedenler' },
      { tip: 'liste', ogeler: [
        'Dil temizliğinin ihmal edilmesi',
        'Diş çürükleri ve diş eti hastalıkları',
        'Ağız kuruluğu (tükürük azlığı)',
        'Sigara ve bazı besinler (sarımsak, soğan)',
        'Nadiren sindirim veya sinüs kaynaklı sorunlar',
      ] },
      { tip: 'h', metin: 'Kalıcı çözüm için' },
      { tip: 'p', metin: 'Günde iki kez diş fırçalamak, diş ipi ve dil temizleyici kullanmak, bol su içmek çoğu durumu düzeltir. Düzenli diş taşı temizliği de önemlidir.' },
      { tip: 'h', metin: 'Ne zaman diş hekimine gidilmeli?' },
      { tip: 'p', metin: 'İyi ağız bakımına rağmen koku geçmiyorsa, altta yatan bir çürük, diş eti hastalığı veya başka bir sorun olabilir. Diş hekimi kaynağı tespit edip uygun tedaviyi planlar.' },
      { tip: 'p', metin: UYARI },
    ],
  },
  {
    slug: 'neden-hekimhaneye-kayit-olmalisiniz',
    title: 'İşletmeniz İçin Hekimhane: Neden Kayıt Olmalısınız?',
    summary: 'Klinik, hastane, muayenehane ve eczaneler için Hekimhane; görünürlükten hasta yönetimine kadar somut avantajlar sunar. Kayıt olmanın işletmenize kattıklarını derledik.',
    category: 'İşletmeler İçin',
    author: 'Hekimhane Editör',
    created_at: '2026-08-02',
    okumaDk: 7,
    cover_image: null,
    views: 0,
    govde: [
      { tip: 'p', metin: 'Hastalar bugün bir hekim, klinik ya da eczane ararken önce internete bakıyor; konum, uzmanlık, yorum ve güven işaretlerini karşılaştırarak karar veriyor. Hekimhane, Türkiye genelindeki sağlık işletmelerini tek çatı altında toplayan bir rehber olarak tam da bu karar anında sizi doğru hastayla buluşturur. İşletmenizi sahiplenip (claim) profilinizi yönettiğinizde, sıradan bir listelemenin çok ötesinde araçlara kavuşursunuz.' },
      { tip: 'p', metin: 'Bu yazıda, Hekimhane\'ye kayıtlı bir işletme olmanın size sağladığı somut avantajları başlıklar hâlinde topladık.' },

      { tip: 'h', metin: 'Görünürlük: Doğru hastanın karşısına çıkın' },
      { tip: 'p', metin: 'Hekimhane\'de aramalar il, ilçe ve uzmanlık alanına göre yapılır. Profilinizi tamamladığınızda, aradığı hizmeti tam olarak sunan hastaların önüne çıkarsınız; genel bir listede kaybolmazsınız.' },
      { tip: 'liste', ogeler: [
        'Karşılaştırmalı sıralama: Puan, yorum ve profil bütünlüğüne göre en iyi işletmeler arama sonuçlarında öne çıkar. Eksiksiz ve güncel bir profil, sizi rakiplerinizin önüne taşır.',
        'İl ve ilçe bazında öne çıkma: Bulunduğunuz bölgede ve uzmanlık alanınızda görünürlüğünüz yükseltilir; kendi çevrenizdeki hastalar sizi ilk sıralarda görür.',
        'Karşılaştırma araçları: Ziyaretçiler işletmeleri yan yana kıyaslarken; şeffaf, doğru ve zengin bir profil güven verir ve tercih edilme oranınızı artırır.',
      ] },

      { tip: 'h', metin: 'Güven: Onay ve doğrulama işaretleri' },
      { tip: 'p', metin: 'Sağlık sektöründe tercih, her şeyden önce güvenle başlar. Hekimhane, hastalara doğru ve doğrulanmış bilgi sunmayı önceler; bu da doğrudan sizin lehinize çalışır.' },
      { tip: 'liste', ogeler: [
        'Onaylı hekim rozeti: Doğrulanan hekimler profilinde onay işaretiyle gösterilir. Bu rozet, hastanın gözünde güvenilirliğinizi anında artırır.',
        'Bilgi güvenliği ve güncelliği: İşletme bilgileriniz kayıt altına alınır; adres, telefon, çalışma saatleri ve uzmanlık gibi ayrıntıları her zaman güncel ve doğru tutabilirsiniz. Yanlış veya eski bilgi yüzünden hasta kaybetmezsiniz.',
        'Sahiplenilmiş profil: Profilini sahiplenen işletmeler, "sahiplenilmemiş" kayıtlardan ayrışır ve daha güvenilir görünür.',
      ] },

      { tip: 'h', metin: 'İzlenim: Profesyonel görsellerle fark yaratın' },
      { tip: 'p', metin: 'İlk izlenim çoğu zaman bir fotoğrafla oluşur. İyi çekilmiş görseller, kliniğinizin hijyenini, ferahlığını ve profesyonelliğini anlatır.' },
      { tip: 'liste', ogeler: [
        'Profesyonel fotoğraf desteği: Fotoğraf çekimi yardımı ile işletmeniz büyük oranda daha ilgi çekici ve güven verici hâle gelir.',
        '360° sanal tur: İsterseniz profilinize sanal tur ekleyerek hastaların kliniğinizi ziyaret etmeden gezmesini sağlayabilirsiniz.',
      ] },

      { tip: 'h', metin: 'Hasta yönetimi: Randevudan takibe kadar tek panel' },
      { tip: 'p', metin: 'Hekimhane yalnızca bir vitrin değildir; işletmenizi yönetmenize yardımcı araçlar da sunar. Kayıtlı işletmeler panel üzerinden hasta ilişkilerini düzenli biçimde yürütür.' },
      { tip: 'liste', ogeler: [
        'Online randevu sistemi: Hastalar profiliniz üzerinden doğrudan randevu talebi oluşturur; talepler panelinize düşer, telefon trafiği azalır.',
        'Özel hasta notları: Sistemde kaydettiğiniz, yalnızca sizin görebileceğiniz notlarla her hastanın geçmişini ve tedavi sürecini kolayca takip edersiniz.',
        'Uzun süreli iletişim: Hasta iletişim bilgileriyle kalıcı bir bağ kurar; kontrol randevusu, bilgilendirme ve hatırlatmalarla ilişkiyi canlı tutarsınız.',
      ] },

      { tip: 'h', metin: 'Ayrıcalık: Yeniliklerden ilk siz haberdar olun' },
      { tip: 'p', metin: 'Hekimhane sürekli gelişen bir platform. Kayıtlı işletme olarak yeni özellikleri, kampanyaları ve fırsatları öncelikli olarak öğrenir; rakiplerinizden bir adım önde başlarsınız.' },

      { tip: 'h', metin: 'Özetle' },
      { tip: 'p', metin: 'Hekimhane\'ye kayıt olmak; daha fazla görünürlük, daha güçlü güven işaretleri, profesyonel bir profil ve hasta yönetimini kolaylaştıran araçlar demektir. İl ve ilçenizde uzmanlık alanınızda öne çıkmak, onaylı bir işletme olarak hastalarla uzun soluklu bir bağ kurmak elinizin altında.' },
      { tip: 'p', metin: 'İşletmenizi sahiplenmek ve profilinizi oluşturmak için Katıl sayfasından başvurunuzu iletebilir; kısa sürede değerlendirilip panelinize erişim kazanabilirsiniz.' },
    ],
  },
];

export const getBlogYazi = (slug: string) => BLOG_YAZILARI.find(y => y.slug === slug);
