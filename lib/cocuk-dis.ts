// ─────────────────────────────────────────────────────────────────
//  Çocuk Diş Sağlığı (Pedodonti) — içerik merkezi veri katmanı
//  Statik içerik; konu kartlı hub (/cocuk-dis-sagligi) + alt sayfalar
//  (/cocuk-dis-sagligi/[slug]). Alt sayfalarda premium öneri hekimleri görünür.
// ─────────────────────────────────────────────────────────────────

export interface CocukKonu {
  slug: string;
  ad: string;
  kisa: string;   // kart alt başlığı
  ozet: string;   // hero paragrafı
  bolumler: { baslik: string; icerik: string[] }[];
  sss: { soru: string; cevap: string }[];
}

/** Pedodonti uzmanlık etiketi — alt sayfalardaki "önerilen hekimler" bu alana göre önceliklenir */
export const COCUK_UZMANLIK = 'Pedodonti (Çocuk Diş Hekimliği)';

export const COCUK_KONULAR: CocukKonu[] = [
  {
    slug: 'cocuk-disi-nedir',
    ad: 'Çocuk Dişi (Süt Dişi) Nedir?',
    kisa: 'Süt dişleri ne zaman çıkar, kaç tanedir ve neden önemlidir?',
    ozet: 'Süt dişleri, bebeklikten ergenliğe kadar çocuğa eşlik eden ilk diş takımıdır. Geçici olmalarına rağmen çiğneme, konuşma, estetik ve kalıcı dişlere yer tutma açısından hayati rol oynarlar.',
    bolumler: [
      { baslik: 'Süt dişleri ne zaman çıkar?', icerik: [
        'İlk süt dişi genellikle 6. ayda alt ön kesici olarak sürer. 2,5–3 yaşına kadar toplam 20 süt dişinin tamamı ağızda tamamlanır: her çenede 4 kesici, 2 köpek ve 4 azı diş.',
        'Diş çıkarma sırasında diş etinde kızarıklık, salya artışı ve huzursuzluk görülebilir; bu normaldir. Temiz bir diş kaşıyıcı veya soğuk halka rahatlama sağlar.',
      ]},
      { baslik: 'Süt dişleri neden önemlidir?', icerik: [
        'Süt dişleri sağlıklı çiğnemeyi, dolayısıyla beslenmeyi ve gelişimi destekler. Konuşma ve doğru ses çıkarmada da rol oynarlar.',
        'En önemlisi: her süt dişi, altından gelecek kalıcı diş için yer tutar. Erken kaybedilen bir süt dişi, komşu dişlerin boşluğa kaymasına ve kalıcı dişin çapraşık çıkmasına yol açabilir.',
      ]},
      { baslik: 'Süt dişleri ne zaman düşer?', icerik: [
        'Süt dişleri yaklaşık 6 yaşından itibaren düşmeye başlar ve 12–13 yaşına kadar yerlerini kalıcı dişlere bırakır. Bu dönemde ağızda hem süt hem kalıcı dişlerin bulunduğu "karışık dişlenme" evresi yaşanır.',
        'Düşecek diye süt dişlerinin çürükleri ihmal edilmemelidir; çürük, alttaki kalıcı diş tomurcuğuna ve çocuğun genel sağlığına zarar verebilir.',
      ]},
    ],
    sss: [
      { soru: 'Süt dişi çürüğü tedavi edilmeli mi, nasılsa düşecek?', cevap: 'Evet, mutlaka tedavi edilmelidir. Süt dişindeki çürük ağrıya, enfeksiyona ve alttaki kalıcı diş tomurcuğunun zarar görmesine yol açabilir; ayrıca erken diş kaybı kalıcı dişlerin çapraşık çıkmasına neden olur.' },
      { soru: 'İlk diş hekimi kontrolü ne zaman olmalı?', cevap: 'İlk diş çıktıktan sonra veya en geç 1 yaşında ilk diş hekimi ziyareti önerilir. Erken kontrol, çürüğü önler ve çocuğun diş hekimine alışmasını sağlar.' },
    ],
  },
  {
    slug: 'arayuz-curukleri',
    ad: 'Arayüz Çürükleri (Dişler Arası Çürük)',
    kisa: 'İki diş arasında oluşan, gözle zor görülen sinsi çürükler',
    ozet: 'Arayüz çürükleri, iki komşu dişin birbirine temas ettiği yüzeylerde oluşur. Gözle doğrudan görülemedikleri için genellikle ilerlemiş dönemde fark edilir; bu yüzden düzenli kontrol ve röntgen büyük önem taşır.',
    bolumler: [
      { baslik: 'Neden oluşur ve neden fark edilmez?', icerik: [
        'Dişler arası bölge, diş fırçasının tam ulaşamadığı ve besin artıklarının sıkıştığı bir alandır. İpek diş (diş ipi) kullanılmadığında bu bölgede plak birikir ve çürük başlar.',
        'Çürük iki dişin arasında, mine altında ilerlediği için ayna ile bakıldığında görünmez. Çoğu zaman ancak ısırma (bite-wing) röntgeni ile erken dönemde saptanır.',
      ]},
      { baslik: 'Belirtileri', icerik: [
        'Erken dönemde belirti vermez. İlerledikçe tatlı, sıcak-soğuk hassasiyeti, iki diş arasına sürekli yemek kaçması ve zamanla ağrı ortaya çıkar.',
        'Süt dişlerinde arayüz çürükleri hızlı ilerler çünkü süt dişi minesi kalıcı dişe göre incedir.',
      ]},
      { baslik: 'Tedavisi', icerik: [
        'Erken yakalanan arayüz çürüğü flor ve koruyucu uygulamalarla durdurulabilir. İlerlemiş çürükte ise temizlenip estetik dolgu ile kapatılır.',
        'Korunmanın en etkili yolu günlük diş ipi kullanımı, düzenli kontrol ve gerektiğinde ısırma röntgenidir.',
      ]},
    ],
    sss: [
      { soru: 'Arayüz çürüğü nasıl anlaşılır?', cevap: 'Gözle görülmesi zordur; en güvenilir yöntem ısırma (bite-wing) röntgenidir. Diş hekimleri düzenli kontrollerde bu röntgenle iki diş arasındaki erken çürükleri yakalar.' },
      { soru: 'Diş ipi çocuklarda gerekli mi?', cevap: 'Evet. Dişler birbirine temas etmeye başladığında (genellikle 2,5–3 yaş) ebeveyn yardımıyla günlük diş ipi kullanımı arayüz çürüklerini önlemede en etkili yöntemdir.' },
    ],
  },
  {
    slug: 'sut-disi-cekimi',
    ad: 'Süt Dişi Çekimi',
    kisa: 'Ne zaman gerekir, erken çekimde yer tutucu neden önemli?',
    ozet: 'Süt dişi çekimi son çare olarak, dişin kurtarılamayacağı durumlarda yapılır. Erken çekilen bir süt dişinin bıraktığı boşluk, kalıcı dişin düzenini bozabileceği için çoğu zaman yer tutucu ile desteklenir.',
    bolumler: [
      { baslik: 'Süt dişi ne zaman çekilir?', icerik: [
        'İleri çürük nedeniyle kurtarılamayan, kök ucunda apse/enfeksiyon oluşan veya travmayla ağır hasar gören süt dişleri çekilebilir.',
        'Bazen de kalıcı diş sürmesine rağmen düşmeyen (sallanmayan) süt dişi, kalıcı dişin doğru konuma geçmesi için çekilir.',
      ]},
      { baslik: 'Erken çekim neden sorun olabilir?', icerik: [
        'Bir süt dişi zamanından önce çekildiğinde komşu dişler boşluğa doğru kayar ve alttan gelecek kalıcı dişin yeri daralır. Bu, ileride çapraşıklık ve ortodonti ihtiyacı doğurabilir.',
        'Bu nedenle erken çekimlerde diş hekimi genellikle "yer tutucu" adı verilen küçük bir apareyle boşluğu korur.',
      ]},
      { baslik: 'İşlem nasıl yapılır?', icerik: [
        'Çekim, bölge uyuşturularak ağrısız şekilde yapılır. Çocuk diş hekimleri işlemi çocuğun korkmayacağı, oyunlaştırılmış bir dille anlatarak gerçekleştirir.',
        'Çekim sonrası birkaç saat ısırmalı gazlı bez, yumuşak-ılık beslenme ve bölgeyi kurcalamama önerilir.',
      ]},
    ],
    sss: [
      { soru: 'Yer tutucu her çekimde gerekir mi?', cevap: 'Hayır. Kalıcı dişin sürmesine çok az kaldıysa gerekmeyebilir. Ancak kalıcı diş için uzun süre varsa, boşluğun korunması ve çapraşıklığın önlenmesi için yer tutucu önerilir.' },
      { soru: 'Süt dişi çekimi ağrılı mı?', cevap: 'Bölge lokal anesteziyle uyuşturulduğu için işlem sırasında ağrı hissedilmez. Çocuk diş hekimleri çocuğu rahatlatmak için özel iletişim yöntemleri kullanır.' },
    ],
  },
  {
    slug: 'koruyucu-dis-tedavisi',
    ad: 'Koruyucu Diş Tedavisi',
    kisa: 'Çürük oluşmadan önce alınan koruyucu önlemler',
    ozet: 'Koruyucu diş tedavisi, çürük ve diş eti hastalıkları daha ortaya çıkmadan önlemeyi hedefler. Çocuklarda en akılcı ve en ekonomik yaklaşım budur: hastalığı tedavi etmek yerine hiç oluşmasına izin vermemek.',
    bolumler: [
      { baslik: 'Koruyucu tedavi neleri kapsar?', icerik: [
        'Düzenli diş hekimi kontrolleri, profesyonel diş temizliği, flor uygulaması, fissür örtücüler, doğru fırçalama-diş ipi eğitimi ve beslenme danışmanlığı koruyucu tedavinin başlıca adımlarıdır.',
        'Amaç; çürük riskini erken belirleyip minenin güçlendirilmesi ve plak birikiminin önlenmesidir.',
      ]},
      { baslik: 'Neden çocuklarda özellikle önemli?', icerik: [
        'Çocukların süt dişi minesi incedir ve çürük daha hızlı ilerler. Ayrıca fırçalama becerileri henüz tam gelişmediğinden ek koruma gerekir.',
        'Erken kazanılan sağlıklı ağız alışkanlıkları ömür boyu sürer; koruyucu tedavi hem dişleri hem de ileride oluşabilecek tedavi maliyetlerini korur.',
      ]},
      { baslik: 'Evde yapılabilecekler', icerik: [
        'Günde iki kez, yaşa uygun florlu diş macunuyla fırçalama; dişler temas ediyorsa diş ipi kullanımı temeldir.',
        'Şekerli-asidik atıştırmalıkların sıklığını azaltmak, gece süt/meyve suyu ile uyutmamak ve düzenli 6 aylık kontroller koruyucu bakımı tamamlar.',
      ]},
    ],
    sss: [
      { soru: 'Koruyucu tedaviye ne zaman başlanmalı?', cevap: 'İlk diş çıktığı andan itibaren. İlk kontrol en geç 1 yaşında yapılmalı; flor ve fissür örtücü gibi uygulamalar diş hekiminin belirlediği uygun yaşta başlar.' },
      { soru: 'Koruyucu tedavi çürüğü tamamen önler mi?', cevap: 'Riski çok büyük ölçüde azaltır ama evdeki bakım ve beslenme de kritiktir. Koruyucu uygulamalar + düzenli fırçalama + dengeli beslenme birlikte en güçlü korumayı sağlar.' },
    ],
  },
  {
    slug: 'fissur-ortucu',
    ad: 'Fissür Örtücüler',
    kisa: 'Azı dişlerinin çukurlarını çürükten koruyan ince tabaka',
    ozet: 'Fissür örtücüler, azı dişlerinin çiğneme yüzeyindeki derin oluk ve çukurları (fissürleri) ince bir koruyucu tabakayla kapatan, ağrısız ve hızlı bir koruyucu uygulamadır. Bu bölgeler fırçanın zor ulaştığı, çürüğün en sık başladığı yerlerdir.',
    bolumler: [
      { baslik: 'Fissür örtücü nedir, neden gerekir?', icerik: [
        'Arka azı dişlerinin yüzeyindeki dar oluklara diş fırçasının kılları giremez; besin ve bakteri burada birikir. Fissür örtücü bu olukları düzleştirerek plak birikimini ve çürük başlangıcını önler.',
        'Özellikle yeni sürmüş kalıcı azı dişlerinde (6 yaş dişi gibi) çürük riskini belirgin biçimde azaltır.',
      ]},
      { baslik: 'Nasıl uygulanır?', icerik: [
        'İşlem ağrısızdır ve tek seansta biter. Diş yüzeyi temizlenir, hazırlanır ve akışkan örtücü olukların içine uygulanıp ışıkla sertleştirilir.',
        'Kesme, uyuşturma veya diş kaybı söz konusu değildir; çocuk için son derece konforlu bir işlemdir.',
      ]},
      { baslik: 'Ne zaman yapılmalı?', icerik: [
        'Kalıcı azı dişleri sürer sürmez (genellikle 6 ve 12 yaş dişleri) uygulanması idealdir. Uygun durumda süt azı dişlerine de yapılabilir.',
        'Örtücüler zamanla aşınabilir; düzenli kontrollerde durumları değerlendirilip gerektiğinde yenilenir.',
      ]},
    ],
    sss: [
      { soru: 'Fissür örtücü dolgudan farkı ne?', cevap: 'Dolgu, oluşmuş bir çürüğü temizleyip doldurur; fissür örtücü ise çürük daha oluşmadan koruma amaçlıdır. Diş dokusu kesilmez, sadece yüzeydeki oluklar kapatılır.' },
      { soru: 'Örtücü uygulanan diş çürümez mi?', cevap: 'Çürük riski büyük ölçüde azalır ama sıfırlanmaz. Fırçalama ve diş ipi yine gereklidir; örtücü, fırçanın ulaşamadığı olukları korur.' },
    ],
  },
  {
    slug: 'flor-uygulamasi',
    ad: 'Flor Uygulaması',
    kisa: 'Diş minesini güçlendirip çürüğe direnç kazandıran uygulama',
    ozet: 'Flor uygulaması, diş minesini güçlendirerek çürüğe karşı direnç kazandıran, hızlı ve ağrısız koruyucu bir işlemdir. Diş hekiminde yapılan profesyonel topikal flor, evdeki florlu macunu tamamlar.',
    bolumler: [
      { baslik: 'Flor mineyi nasıl güçlendirir?', icerik: [
        'Flor, mine yapısına katılarak asitlere karşı daha dayanıklı hâle getirir ve başlangıç hâlindeki (henüz boşluk oluşmamış) çürüklerin onarılmasına (remineralizasyon) yardımcı olur.',
        'Diş hekimindeki uygulama; jel, köpük veya vernik biçiminde, ev tipi macuna göre daha yüksek yoğunlukta floru kısa sürede dişe kazandırır.',
      ]},
      { baslik: 'Nasıl ve ne sıklıkta uygulanır?', icerik: [
        'Dişler temizlendikten sonra flor jeli/verniği fırça veya kaşıkla dişlere uygulanır; birkaç dakika içinde tamamlanır.',
        'Sıklık, çocuğun çürük riskine göre diş hekimi tarafından belirlenir — genellikle 3–6 ayda bir. Yüksek riskli çocuklarda daha sık önerilebilir.',
      ]},
      { baslik: 'Güvenli mi?', icerik: [
        'Diş hekiminde uygulanan topikal flor, doğru dozda ve kontrollü yapıldığı için güvenlidir. Uygulama sonrası kısa süre yeme-içmeme önerilir.',
        'Evde ise yaşa uygun miktarda florlu macun (bezelye tanesi kadar) kullanılmalı ve küçük çocuklarda fırçalama ebeveyn gözetiminde yapılmalıdır.',
      ]},
    ],
    sss: [
      { soru: 'Florlu macun kullanıyorsak ayrıca flor uygulaması gerekir mi?', cevap: 'Evet, ikisi farklıdır. Ev tipi macun günlük düşük doz korumadır; diş hekimindeki profesyonel flor daha yüksek yoğunlukta olup çürük riskine göre periyodik uygulanır.' },
      { soru: 'Flor çocuklara zararlı mı?', cevap: 'Diş hekiminin belirlediği dozda ve gözetimde uygulandığında güvenlidir. Önemli olan yaşa uygun miktar ve yutulmasının önlenmesidir; bu yüzden küçük çocuklarda ebeveyn kontrolü şarttır.' },
    ],
  },
  {
    slug: 'cocuk-dis-dolgusu',
    ad: 'Çocuk Diş Dolgusu',
    kisa: 'Süt dişi çürüğünün temizlenip estetik malzemeyle onarılması',
    ozet: 'Çocuk diş dolgusu, çürüğün temizlenip dişin uygun bir malzemeyle onarılması işlemidir. "Nasılsa düşecek" düşüncesiyle ihmal edilen süt dişi çürükleri ağrı, enfeksiyon ve kalıcı dişe zarar riski taşır; bu yüzden dolgu önemlidir.',
    bolumler: [
      { baslik: 'Süt dişine neden dolgu yapılır?', icerik: [
        'Süt dişindeki çürük tedavi edilmezse ilerleyerek ağrıya, kök enfeksiyonuna ve alttaki kalıcı diş tomurcuğunun zarar görmesine yol açar.',
        'Dolgu; dişin işlevini (çiğneme, konuşma, yer tutma) düşme zamanına kadar korur ve çocuğu ağrıdan uzak tutar.',
      ]},
      { baslik: 'İşlem nasıl yapılır?', icerik: [
        'Çürük dokusu temizlenir, gerekirse bölge uyuşturulur ve boşluk diş rengiyle uyumlu estetik dolgu malzemesiyle doldurulup ışıkla sertleştirilir.',
        'İşlem genellikle tek seansta biter; çocuk diş hekimleri çocuğun konforu için işlemi kısa ve rahatlatıcı tutar.',
      ]},
      { baslik: 'Hangi malzemeler kullanılır?', icerik: [
        'Günümüzde çoğunlukla diş rengiyle uyumlu kompozit dolgular tercih edilir. Bazı durumlarda flor salan cam iyonomer gibi malzemeler de kullanılabilir.',
        'Malzeme seçimi; çürüğün yeri, dişin ömrü ve çocuğun iş birliğine göre diş hekimi tarafından belirlenir.',
      ]},
    ],
    sss: [
      { soru: 'Süt dişi dolgusu yerine çekim daha kolay değil mi?', cevap: 'Hayır. Erken çekim, kalıcı dişin yerini bozarak çapraşıklığa yol açabilir. Kurtarılabilecek her süt dişi, düşme zamanına kadar dolguyla korunmaya çalışılır.' },
      { soru: 'Dolgu ağrılı mı?', cevap: 'Yüzeysel çürüklerde çoğu zaman uyuşturmaya bile gerek kalmaz. Derin çürüklerde bölge uyuşturulduğundan işlem sırasında ağrı hissedilmez.' },
    ],
  },
  {
    slug: 'agiz-ici-dijital-tarama',
    ad: 'Çocuklarda Ağız İçi Dijital Tarama',
    kisa: 'Ölçü macunu olmadan, dijital tarayıcıyla konforlu görüntüleme',
    ozet: 'Ağız içi dijital tarama (intraoral tarayıcı), küçük bir kamera ile dişlerin üç boyutlu dijital modelini çıkarır. Geleneksel ölçü macununun rahatsızlığını ortadan kaldırdığı için özellikle çocuklarda büyük konfor sağlar.',
    bolumler: [
      { baslik: 'Dijital tarama nedir?', icerik: [
        'Kalem büyüklüğünde bir tarayıcı ağız içinde gezdirilir ve dişlerin, diş etlerinin bilgisayarda anlık üç boyutlu modeli oluşur. Bulantı yapan ölçü macununa gerek kalmaz.',
        'Elde edilen dijital model; tedavi planlaması, ortodonti (şeffaf plak/diş teli) ve yer tutucu-apareylerin hazırlanmasında kullanılır.',
      ]},
      { baslik: 'Çocuklar için avantajları', icerik: [
        'Ölçü kaşığı ve macun olmadığı için öğürme refleksini tetiklemez; işlem hızlı ve oyunlaştırılabilir olduğundan çocuk korkmadan iş birliği yapar.',
        'Tarama sonucu ekranda gösterilebildiği için çocuğa ve ebeveyne dişlerin durumu görsel olarak anlatılabilir; bu, motivasyonu artırır.',
      ]},
      { baslik: 'Nerelerde kullanılır?', icerik: [
        'Ortodontik değerlendirme, şeffaf plak tedavisi, yer tutucu ve gece plağı gibi apareylerin dijital hazırlanmasında ve tedavi öncesi-sonrası takibinde kullanılır.',
        'Radyasyon içermez; ışık tabanlı bir görüntüleme olduğu için sık tekrarlanabilir.',
      ]},
    ],
    sss: [
      { soru: 'Dijital tarama röntgen mi, zararlı mı?', cevap: 'Hayır. Dijital ağız içi tarama ışık tabanlı bir görüntülemedir, radyasyon içermez. Röntgenden farklı olarak dişlerin yüzeyinin üç boyutlu modelini çıkarır.' },
      { soru: 'Ölçü macununa göre farkı ne?', cevap: 'Klasik ölçüde ağıza macun dolu kaşık yerleştirilir ve bu çoğu çocukta öğürme yaratır. Dijital taramada böyle bir rahatsızlık olmaz; işlem daha hızlı ve konforludur.' },
    ],
  },
];

export function cocukKonuBySlug(slug: string): CocukKonu | null {
  return COCUK_KONULAR.find(k => k.slug === slug) || null;
}
