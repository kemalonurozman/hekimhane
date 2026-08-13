// ─────────────────────────────────────────────────────────────────
//  Çocuk Diş Sağlığı (Pedodonti) — içerik merkezi veri katmanı
//  Statik içerik; konu kartlı hub (/cocuk-dis-sagligi) + alt sayfalar
//  (/cocuk-dis-sagligi/[slug]). Alt sayfalarda premium öneri hekimleri görünür.
// ─────────────────────────────────────────────────────────────────

import { UCRET_TARIFESI_2026, type TarifeItem } from './ucret-tarifesi-2026';

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

// Her konunun ilgili TDB 2026 tarife kalem kodları — alt sayfada "yaklaşık ücret"
// olarak sistemdeki asgari (taban) fiyatlarla gösterilir.
export const KONU_FIYAT_KODLARI: Record<string, string[]> = {
  'cocuk-disi-nedir': ['1-1'],
  'arayuz-curukleri': ['1-16', '2-4'],
  'sut-disi-cekimi': ['5-1', '3-10'],
  'koruyucu-dis-tedavisi': ['3-2', '3-3', '1-9'],
  'fissur-ortucu': ['3-2'],
  'flor-uygulamasi': ['3-3'],
  'cocuk-dis-dolgusu': ['2-4', '3-4', '2-9'],
  'agiz-ici-dijital-tarama': ['1-34'],
  'cocuklarda-dis-travmasi': ['3-14', '3-18', '1-14'],
  'sut-disi-kanal-tedavisi': ['3-6', '3-7', '3-12'],
  'yer-tutucular': ['3-10', '3-11'],
  'biberon-curugu': ['3-3', '2-4'],
  'cocuklarda-dis-hekimi-korkusu': ['1-1'],
};

// Kod → tarife kalemi (tek seferde düz harita)
const TARIFE_MAP: Record<string, TarifeItem> = (() => {
  const m: Record<string, TarifeItem> = {};
  for (const kat of UCRET_TARIFESI_2026) for (const it of kat.items) m[it.kod] = it;
  return m;
})();

/** Bir konuya karşılık gelen TDB 2026 tarife kalemleri (asgari ücret gösterimi için) */
export function tarifeForKonu(slug: string): TarifeItem[] {
  return (KONU_FIYAT_KODLARI[slug] || []).map(k => TARIFE_MAP[k]).filter(Boolean);
}

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
  {
    slug: 'cocuklarda-dis-travmasi',
    ad: 'Çocuklarda Diş Travması (Düşme ve Darbeler)',
    kisa: 'Kırılan, yerinden oynayan veya düşen dişte ilk 30 dakika kritiktir',
    ozet: 'Çocuklarda düşme ve darbeler sonucu diş kırıkları, yerinden oynama veya dişin tamamen yerinden çıkması (avülsiyon) sık görülür. Diş travmasında ilk müdahale ve hızlı diş hekimi başvurusu, dişin kurtarılma şansını doğrudan belirler.',
    bolumler: [
      { baslik: 'Travma türleri', icerik: [
        'En sık ön dişlerde görülür: mine-dentin kırığı, dişin sarsılıp gevşemesi (subluksasyon), çeneye doğru gömülmesi (intrüzyon) veya tamamen yerinden çıkması (avülsiyon).',
        'Süt dişi travmalarında öncelik, alttaki kalıcı diş tomurcuğunu korumaktır; bu yüzden değerlendirme mutlaka diş hekimince yapılmalıdır.',
      ]},
      { baslik: 'Yerinden çıkan kalıcı dişte ne yapmalı?', icerik: [
        'Kalıcı diş tamamen çıktıysa dişi taç (üst) kısmından tutun, köküne dokunmayın. Kirliyse süt veya serum fizyolojikle nazikçe durulayın; ovmayın.',
        'Mümkünse dişi yuvasına geri yerleştirin; olmuyorsa süt ya da çocuğun tükürüğü içinde saklayıp 30 dakika içinde diş hekimine ulaşın. Süt dişi ise yerine takılmaya çalışılmaz.',
      ]},
      { baslik: 'Tedavi', icerik: [
        'Gevşeyen dişler komşu dişlere splint ile sabitlenir; kırıklarda kompozit onarım veya kanal tedavisi gerekebilir.',
        'Travma sonrası dişin rengi zamanla değişebilir; bu yüzden birkaç ay boyunca kontrol ve gerektiğinde röntgen takibi önemlidir.',
      ]},
    ],
    sss: [
      { soru: 'Yerinden çıkan dişi suyla yıkayabilir miyim?', cevap: 'Musluk suyu kök yüzeyindeki canlı hücrelere zarar verebilir. Diş çok kirliyse yalnızca süt veya serum fizyolojikle kısa bir durulama yapın, kökünü ovmayın ve dişi süt/tükürük içinde diş hekimine götürün.' },
      { soru: 'Süt dişi yerinden çıktı, geri takılır mı?', cevap: 'Hayır. Süt dişleri, alttaki kalıcı diş tomurcuğuna zarar vermemek için yerine geri takılmaz. Yine de kanama ve keskin kenar kontrolü için diş hekimine başvurulmalıdır.' },
    ],
  },
  {
    slug: 'sut-disi-kanal-tedavisi',
    ad: 'Süt Dişi Kanal Tedavisi ve Amputasyon',
    kisa: 'Derin çürükte süt dişini düşene kadar kurtaran tedavi',
    ozet: 'Çürük dişin sinirine (pulpa) ulaştığında, süt dişini çekmek yerine düşme zamanına kadar korumak için amputasyon veya süt dişi kanal tedavisi uygulanır. Böylece ağrı ve enfeksiyon giderilir, diş yerini korur.',
    bolumler: [
      { baslik: 'Amputasyon ile kanal tedavisi farkı', icerik: [
        'Amputasyonda dişin yalnızca taç kısmındaki iltihaplı pulpa alınır, kök pulpası korunur; erken-orta düzey pulpa tutulumunda tercih edilir.',
        'Süt dişi kanal tedavisinde ise enfeksiyon köke ilerlemişse kök kanalları da temizlenip özel, emilebilen bir dolgu malzemesiyle doldurulur.',
      ]},
      { baslik: 'Ne zaman gerekir?', icerik: [
        'Derin çürük nedeniyle gece ağrısı, sıcak-soğukta geçmeyen ağrı, diş etinde şişlik/apse veya röntgende kök ucu enfeksiyonu varsa uygulanır.',
        'İşlem, dişin kalıcı diş sürene kadar sağlıklı kalmasını ve erken çekimin yer kaybı sorununu önler.',
      ]},
      { baslik: 'İşlem sonrası', icerik: [
        'Tedavi sonrası diş çoğunlukla prefabrik (paslanmaz çelik) kron ya da uygun dolguyla üstten korunur; böylece kırılmadan işlevini sürdürür.',
        'İşlem lokal anesteziyle ağrısız yapılır ve genellikle tek-iki seansta tamamlanır.',
      ]},
    ],
    sss: [
      { soru: 'Süt dişine kanal tedavisi mantıklı mı, nasılsa düşecek?', cevap: 'Evet. Kalıcı dişin sürmesine yıllar varsa, süt dişini korumak yer kaybını ve kalıcı dişlerin çapraşık çıkmasını önler; ayrıca çocuğu ağrı ve enfeksiyondan kurtarır.' },
      { soru: 'Amputasyon ağrılı mı?', cevap: 'Hayır. İşlem lokal anesteziyle bölge uyuşturularak yapılır, çocuk ağrı hissetmez. Çocuk diş hekimleri süreci çocuğun korkmayacağı biçimde yönetir.' },
    ],
  },
  {
    slug: 'yer-tutucular',
    ad: 'Yer Tutucular',
    kisa: 'Erken kaybedilen süt dişinin boşluğunu koruyan küçük apareyler',
    ozet: 'Yer tutucular, bir süt dişi erken kaybedildiğinde komşu dişlerin boşluğa kaymasını önleyen apareylerdir. Alttan gelecek kalıcı dişe yer açık tutulur; böylece ileride çapraşıklık ve ortodonti ihtiyacı azalır.',
    bolumler: [
      { baslik: 'Neden gerekir?', icerik: [
        'Bir süt dişi zamanından önce düştüğünde, komşu dişler boşluğa doğru kayar ve kalıcı dişin süreceği alan daralır. Bu, kalıcı dişin gömülü kalmasına veya çapraşık çıkmasına yol açar.',
        'Yer tutucu bu boşluğu koruyarak kalıcı dişin doğru konumda sürmesini sağlar.',
      ]},
      { baslik: 'Türleri', icerik: [
        'Sabit yer tutucular komşu dişe bantla tutturulur ve çıkarılmaz; tek diş boşluklarında sık kullanılır.',
        'Hareketli yer tutucular takılıp çıkarılabilir; birden fazla diş eksikliğinde veya estetik gereken bölgelerde tercih edilebilir.',
      ]},
      { baslik: 'Bakımı', icerik: [
        'Yer tutucu takılan çocukta düzenli kontrol önemlidir; kalıcı diş sürmeye başlayınca aparey diş hekimince çıkarılır.',
        'Aparey bölgesinin iyi temizlenmesi, çürük ve diş eti sorunlarını önler.',
      ]},
    ],
    sss: [
      { soru: 'Yer tutucu ne kadar süre kalır?', cevap: 'Alttaki kalıcı diş sürmeye başlayana kadar kalır. Bu süre boşluğun yerine ve çocuğun yaşına göre değişir; diş hekimi kontrollerle takip eder ve zamanı gelince çıkarır.' },
      { soru: 'Her erken diş kaybında gerekir mi?', cevap: 'Kalıcı dişin sürmesine çok az kaldıysa gerekmeyebilir. Karar; boşluğun yeri, kalıcı dişin durumu ve röntgen değerlendirmesiyle diş hekimince verilir.' },
    ],
  },
  {
    slug: 'biberon-curugu',
    ad: 'Biberon (Gece Şişesi) Çürüğü',
    kisa: 'Bebeklerde ön dişleri hızla etkileyen erken çocukluk çürüğü',
    ozet: 'Biberon çürüğü (erken çocukluk çürüğü), özellikle gece biberonla süt, meyve suyu veya şekerli içecek verilen bebeklerde ön dişlerde hızla ilerleyen çürüktür. Önlenebilir bir durumdur; erken fark edilmezse ağrı ve erken diş kaybına yol açar.',
    bolumler: [
      { baslik: 'Neden oluşur?', icerik: [
        'Uyurken ağızda kalan şekerli sıvı (süt dâhil) dişlerin çevresinde uzun süre bekler; tükürük akışı gece azaldığından bakteriler bu şekeri aside çevirip mineyi hızla çürütür.',
        'İlk olarak üst ön dişlerde tebeşirimsi beyaz lekeler, ardından kahverengi çürükler görülür.',
      ]},
      { baslik: 'Nasıl önlenir?', icerik: [
        'Bebeği biberonla (özellikle süt/meyve suyuyla) uyutmayın; gece susarsa yalnızca su verin. Emzirme sonrası da dişleri nemli bezle silin.',
        'İlk diş çıktığında yaşa uygun florlu macunla (pirinç tanesi kadar) fırçalamaya başlayın ve şekerli içecek sıklığını azaltın.',
      ]},
      { baslik: 'Tedavisi', icerik: [
        'Erken (beyaz leke) dönemde flor uygulaması ile durdurulabilir. İlerlemiş çürüklerde dolgu, prefabrik kron veya gerekirse kanal tedavisi uygulanır.',
        'Erken teşhis için ilk diş hekimi ziyareti en geç 1 yaşında yapılmalıdır.',
      ]},
    ],
    sss: [
      { soru: 'Gece emzirmek de çürük yapar mı?', cevap: 'Anne sütü tek başına en sağlıklı besindir; ancak gece boyunca sık sık ve dişler silinmeden emzirme, ağızda kalan sütle çürük riskini artırabilir. Emzirme sonrası dişleri temizlemek önemlidir.' },
      { soru: 'Beyaz lekeler çürük mü?', cevap: 'Dişteki tebeşirimsi beyaz lekeler çürüğün ilk (başlangıç) belirtisidir. Bu dönemde flor ve bakım ile ilerlemesi durdurulabilir; bu yüzden erken diş hekimi kontrolü önemlidir.' },
    ],
  },
  {
    slug: 'cocuklarda-dis-hekimi-korkusu',
    ad: 'Çocuklarda Diş Hekimi Korkusu ve Davranış Yönlendirme',
    kisa: 'Çocuğu korkutmadan diş hekimine alıştırmanın yolları',
    ozet: 'Diş hekimi korkusu çocuklarda yaygındır ve çoğu zaman önlenebilir. Çocuk diş hekimleri, korkuyu azaltan davranış yönlendirme teknikleriyle çocuğun tedaviye uyumunu sağlar; ebeveynin tutumu da bu süreçte kritiktir.',
    bolumler: [
      { baslik: 'Korku neden oluşur?', icerik: [
        'Bilinmeyenden çekinme, ağrılı bir ilk deneyim ya da ailenin (farkında olmadan) aktardığı kaygı çocukta diş hekimi korkusunu besler.',
        'Erken yaşta, çürük oluşmadan yapılan tanışma ziyaretleri korkuyu büyük ölçüde önler.',
      ]},
      { baslik: 'Davranış yönlendirme yöntemleri', icerik: [
        'Çocuk diş hekimleri "anlat-göster-uygula" (tell-show-do) yöntemiyle işlemi çocuğun anlayacağı dille, korkutmadan tanıtır; olumlu pekiştirme kullanır.',
        'Gerekli durumlarda ağrısız tedavi için lokal anestezi, bazı vakalarda sedasyon veya genel anestezi seçenekleri değerlendirilebilir.',
      ]},
      { baslik: 'Ebeveyne düşenler', icerik: [
        'Çocuğa "acımayacak", "iğne yok" gibi korku çağrıştıran sözler kurmayın; ziyareti olumlu ve sıradan bir olay gibi anlatın.',
        'İlk ziyareti bir sorun çıkmadan, tanışma amaçlı planlayın; düzenli kontroller çocuğun ortama alışmasını kolaylaştırır.',
      ]},
    ],
    sss: [
      { soru: 'İlk diş hekimi ziyareti nasıl olmalı?', cevap: 'En geç 1 yaşında, bir sorun oluşmadan yapılan kısa bir tanışma ziyareti idealdir. Çocuk ortama, hekime ve koltuğa alışır; bu, ileride tedavi gerektiğinde korkuyu azaltır.' },
      { soru: 'Çocuğum çok korkuyor, tedavi nasıl yapılır?', cevap: 'Çocuk diş hekimleri davranış yönlendirme teknikleriyle çoğu çocuğu tedaviye kazandırır. Şiddetli kaygı veya kapsamlı tedavi gereken durumlarda sedasyon ya da genel anestezi güvenli seçeneklerdir.' },
    ],
  },
];

export function cocukKonuBySlug(slug: string): CocukKonu | null {
  return COCUK_KONULAR.find(k => k.slug === slug) || null;
}
