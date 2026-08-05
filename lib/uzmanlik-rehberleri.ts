// ─────────────────────────────────────────────────────────────
// Uzmanlık Rehberleri — her diş uzmanlığı için derinlemesine bilgi sayfası.
// /uzmanlik/[slug]. spec değeri klinik filtresiyle (specs) eşleşir.
// ─────────────────────────────────────────────────────────────

export interface UzmanlikRehber {
  slug: string;
  ad: string;        // Sayfa başlığı
  kisaAd: string;    // Kısa etiket
  spec: string;      // DENTAL_SPECIALTIES ile eşleşir (klinik listeleme için)
  ozet: string;
  nedir: string;
  neZaman: string[];
  surec: { baslik: string; aciklama: string }[];
  fiyatNot: string;
  sss: { soru: string; cevap: string }[];
  ilgiliProblemler?: string[];   // dis problemi slug'ları
}

export const UZMANLIK_REHBERLERI: UzmanlikRehber[] = [
  {
    slug: 'ortodonti',
    ad: 'Ortodonti (Diş Teli) Rehberi',
    kisaAd: 'Ortodonti',
    spec: 'Ortodonti (Diş Teli)',
    ozet: 'Çapraşık, düzensiz veya kapanış bozukluğu olan dişleri diş teli ve şeffaf plaklarla düzelten diş hekimliği dalı.',
    nedir: 'Ortodonti; dişlerin ve çenelerin duruş, dizilim ve kapanış bozukluklarını inceleyen ve tedavi eden uzmanlık alanıdır. Metal/şeffaf braketler (diş teli) veya şeffaf plaklar (Invisalign benzeri) ile dişler kademeli olarak doğru konuma getirilir. Amaç hem estetik hem de sağlıklı bir çiğneme fonksiyonudur.',
    neZaman: [
      'Çapraşık, dönük veya aralıklı dişler',
      'Üst-alt çene kapanış bozukluğu (open bite, cross bite, derin kapanış)',
      'Çene darlığı ve sıkışıklık',
      'Estetik gülüş kaygısı',
      'Çocuklarda erken dönem çene yönlendirmesi',
    ],
    surec: [
      { baslik: 'Muayene ve film', aciklama: 'Panoramik/sefalometrik röntgen ve ölçü ile tedavi planı çıkarılır.' },
      { baslik: 'Aparey uygulaması', aciklama: 'Diş teli takılır veya şeffaf plak seti hazırlanır.' },
      { baslik: 'Periyodik kontroller', aciklama: '4–8 haftada bir tel ayarı yapılır; süreç ortalama 1–2 yıl sürer.' },
      { baslik: 'Pekiştirme (retainer)', aciklama: 'Tedavi sonrası dişlerin geri kaçmaması için pekiştirme apareyi kullanılır.' },
    ],
    fiyatNot: 'Fiyat; tedavi türüne (metal/şeffaf braket, şeffaf plak), vaka zorluğuna ve süreye göre değişir. Kesin bilgi için klinikten muayene sonrası teklif alın.',
    sss: [
      { soru: 'Ortodonti tedavisi ne kadar sürer?', cevap: 'Vakaya göre değişmekle birlikte ortalama 12–24 ay sürer. Basit vakalarda daha kısadır.' },
      { soru: 'Diş teli ağrır mı?', cevap: 'İlk günlerde ve her tel sıkımından sonra birkaç gün hafif hassasiyet olabilir; kısa sürede geçer.' },
      { soru: 'Yetişkinler diş teli taktırabilir mi?', cevap: 'Evet. Diş ve diş eti sağlığı uygunsa her yaşta ortodontik tedavi mümkündür.' },
    ],
    ilgiliProblemler: ['carpik-dis'],
  },
  {
    slug: 'implant',
    ad: 'Diş İmplantı Rehberi',
    kisaAd: 'İmplant',
    spec: 'İmplantoloji (İmplant)',
    ozet: 'Kaybedilen dişlerin yerine çene kemiğine yerleştirilen titanyum vida ve üzerine yapılan protez ile kalıcı çözüm.',
    nedir: 'Diş implantı; eksik dişin kök işlevini görecek şekilde çene kemiğine yerleştirilen titanyum bir vidadır. Kemiğe kaynadıktan sonra üzerine kron (protez diş) yapılır. Doğal dişe en yakın estetik ve fonksiyonel çözüm olarak kabul edilir; komşu dişlere zarar vermeden tek diş, birkaç diş veya tam çene tedavisi yapılabilir.',
    neZaman: [
      'Bir veya birden fazla eksik diş',
      'Hareketli protez yerine sabit çözüm isteği',
      'Köprü için komşu dişlerin kesilmesini istememe',
      'Tam dişsizlikte sabit/implant destekli protez',
    ],
    surec: [
      { baslik: 'Değerlendirme', aciklama: 'Röntgen/tomografi ile kemik miktarı ve yoğunluğu ölçülür.' },
      { baslik: 'Cerrahi yerleştirme', aciklama: 'Lokal anestezi ile implant çene kemiğine yerleştirilir.' },
      { baslik: 'İyileşme (osseointegrasyon)', aciklama: 'İmplantın kemiğe kaynaması için 2–4 ay beklenir; gerekirse greft yapılır.' },
      { baslik: 'Protez', aciklama: 'İyileşme sonrası üzerine kron/köprü yapılır.' },
    ],
    fiyatNot: 'İmplant fiyatı; markaya, greft ihtiyacına ve protez türüne göre değişir. Muayene sonrası kişiye özel plan ve fiyat için klinikle görüşün.',
    sss: [
      { soru: 'İmplant kaç yıl dayanır?', cevap: 'Ağız bakımı iyi olduğunda implant onlarca yıl, hatta ömür boyu kullanılabilir.' },
      { soru: 'İmplant ağrılı mıdır?', cevap: 'İşlem lokal anestezi altında yapılır, sırasında ağrı hissedilmez. Sonrasında birkaç gün hafif şişlik olabilir.' },
      { soru: 'Her hastaya implant uygulanır mı?', cevap: 'Genel sağlık ve kemik yapısı uygun yetişkinlere uygulanır; yetersiz kemikte önce greft gerekebilir.' },
    ],
    ilgiliProblemler: ['eksik-dis'],
  },
  {
    slug: 'kanal-tedavisi',
    ad: 'Kanal Tedavisi (Endodonti) Rehberi',
    kisaAd: 'Kanal Tedavisi',
    spec: 'Endodonti (Kanal Tedavisi)',
    ozet: 'İltihaplanan veya enfekte olan diş sinirinin temizlenip kanalın doldurulmasıyla dişin çekilmeden kurtarılması.',
    nedir: 'Endodonti; diş sinirini (pulpa) ve kök kanallarını ilgilendiren hastalıkların tedavisiyle ilgilenir. İlerlemiş çürük, travma veya enfeksiyon nedeniyle iltihaplanan sinir dokusu temizlenir, kanallar doldurulur ve diş korunur. Kanal tedavisi, çekim yerine dişi kurtaran koruyucu bir işlemdir.',
    neZaman: [
      'Şiddetli, zonklayan diş ağrısı',
      'Soğuk-sıcağa uzun süren hassasiyet',
      'Diş kökünde apse/iltihap',
      'İlerlemiş çürük veya diş kırığında sinir açığa çıkması',
    ],
    surec: [
      { baslik: 'Teşhis', aciklama: 'Röntgenle enfeksiyonun boyutu değerlendirilir.' },
      { baslik: 'Kanal temizliği', aciklama: 'Lokal anestezi altında sinir dokusu temizlenir, kanallar şekillendirilir.' },
      { baslik: 'Dolum', aciklama: 'Kanallar özel dolgu maddesiyle doldurulur.' },
      { baslik: 'Üst restorasyon', aciklama: 'Diş dolgu veya kron ile güçlendirilir.' },
    ],
    fiyatNot: 'Fiyat; dişin kanal sayısına ve vakanın zorluğuna göre değişir. Net bilgi için muayene sonrası klinikten teklif alın.',
    sss: [
      { soru: 'Kanal tedavisi acı verir mi?', cevap: 'Lokal anestezi sayesinde işlem sırasında ağrı hissedilmez. Sonrasında birkaç gün hafif hassasiyet normaldir.' },
      { soru: 'Kaç seansta biter?', cevap: 'Çoğu vaka 1–2 seansta tamamlanır; enfeksiyon durumuna göre değişebilir.' },
      { soru: 'Kanal tedavili diş çürür mü?', cevap: 'Sinir alınsa da diş yeniden çürüyebilir; düzenli bakım ve kontrol önemlidir.' },
    ],
    ilgiliProblemler: ['dis-agrisi', 'dis-apsesi'],
  },
  {
    slug: 'dis-eti-tedavisi',
    ad: 'Diş Eti Tedavisi (Periodontoloji) Rehberi',
    kisaAd: 'Periodontoloji',
    spec: 'Periodontoloji (Diş Eti)',
    ozet: 'Diş eti ve dişi çevreleyen dokuların hastalıklarını (gingivit, periodontit) önleyen ve tedavi eden dal.',
    nedir: 'Periodontoloji; diş etleri ve dişi destekleyen kemik dokusunun sağlığıyla ilgilenir. Diş taşı ve bakteri plağına bağlı diş eti iltihabı (gingivit) ilerlerse kemik kaybına (periodontit) ve diş kaybına yol açabilir. Erken tedavi ile süreç durdurulabilir ve dişler korunur.',
    neZaman: [
      'Diş eti kanaması ve kızarıklık',
      'Diş eti çekilmesi ve hassasiyet',
      'Ağız kokusu',
      'Dişlerde sallanma',
      'Yoğun diş taşı birikimi',
    ],
    surec: [
      { baslik: 'Muayene', aciklama: 'Diş eti cepleri ölçülür, röntgenle kemik seviyesi değerlendirilir.' },
      { baslik: 'Diş taşı temizliği', aciklama: 'Detartraj ile plak ve taş temizlenir.' },
      { baslik: 'Kök yüzeyi düzleştirme', aciklama: 'İlerlemiş vakalarda diş eti altındaki yüzeyler temizlenir.' },
      { baslik: 'Bakım programı', aciklama: 'Düzenli kontrol ve doğru fırçalama ile sonuç korunur.' },
    ],
    fiyatNot: 'Fiyat; işlemin kapsamına (temizlik, cerrahi vb.) göre değişir. Muayene sonrası klinikten bilgi alın.',
    sss: [
      { soru: 'Diş eti kanaması normal mi?', cevap: 'Hayır. Sağlıklı diş etleri kanamaz; kanama çoğunlukla iltihabın (gingivit) belirtisidir.' },
      { soru: 'Diş taşı temizliği dişe zarar verir mi?', cevap: 'Hayır, profesyonel temizlik mineye zarar vermez; aksine diş eti sağlığını korur.' },
      { soru: 'Çeken diş eti geri gelir mi?', cevap: 'Çekilen diş eti kendiliğinden tam gelmez; ilerlemesini durdurmak ve gerektiğinde cerrahi ile düzeltmek mümkündür.' },
    ],
    ilgiliProblemler: ['dis-eti-kanamasi', 'dis-eti-cekilmesi', 'agiz-kokusu'],
  },
  {
    slug: 'cocuk-dis-hekimligi',
    ad: 'Çocuk Diş Hekimliği (Pedodonti) Rehberi',
    kisaAd: 'Pedodonti',
    spec: 'Pedodonti (Çocuk Diş Hekimliği)',
    ozet: 'Bebek ve çocuklarda ağız-diş sağlığı, koruyucu uygulamalar ve çocuğa uygun tedavi yaklaşımları.',
    nedir: 'Pedodonti; süt dişlerinden kalıcı dişlere geçiş dönemindeki çocukların ağız-diş sağlığıyla ilgilenir. Çürük tedavisi, koruyucu uygulamalar (flor, fissür örtücü) ve çocuğun diş hekimi korkusunu azaltan yaklaşımlar bu alanın içindedir. Erken alışkanlıklar, ömür boyu sağlıklı dişlerin temelidir.',
    neZaman: [
      'İlk diş çıktıktan sonra (ilk kontrol ~1 yaş)',
      'Süt dişi çürükleri',
      'Fissür örtücü / flor uygulaması ihtiyacı',
      'Parmak emme, gece şişesi gibi alışkanlıklar',
      'Diş travması (düşme, çarpma)',
    ],
    surec: [
      { baslik: 'Tanışma muayenesi', aciklama: 'Çocuğun güven kazanması için nazik bir ilk muayene yapılır.' },
      { baslik: 'Koruyucu uygulama', aciklama: 'Flor ve fissür örtücü ile çürük riski azaltılır.' },
      { baslik: 'Gerekirse tedavi', aciklama: 'Çürük varsa çocuğa uygun yöntemlerle tedavi edilir.' },
      { baslik: 'Takip', aciklama: '6 ayda bir kontrolle diş gelişimi izlenir.' },
    ],
    fiyatNot: 'Fiyat; uygulanan koruyucu işlem veya tedaviye göre değişir. Klinikten bilgi alabilirsiniz.',
    sss: [
      { soru: 'Süt dişi çürüğü tedavi edilmeli mi?', cevap: 'Evet. Süt dişleri hem çiğneme hem de kalıcı dişlere yer tutması açısından önemlidir; çürükleri tedavi edilmelidir.' },
      { soru: 'Çocuğum diş hekiminden korkuyor, ne yapmalıyım?', cevap: 'Pedodontistler çocuk psikolojisine uygun yaklaşımlarla korkuyu azaltır; ilk ziyaretleri olumlu tutmak önemlidir.' },
      { soru: 'Flor uygulaması güvenli mi?', cevap: 'Diş hekimi kontrolünde uygulanan flor, çürük önlemede güvenli ve etkilidir.' },
    ],
  },
  {
    slug: 'agiz-dis-cene-cerrahisi',
    ad: 'Ağız, Diş ve Çene Cerrahisi Rehberi',
    kisaAd: 'Çene Cerrahisi',
    spec: 'Ağız Diş ve Çene Cerrahisi',
    ozet: 'Gömülü diş çekimi, implant cerrahisi, çene kistleri ve çene eklemi sorunlarını kapsayan cerrahi uzmanlık.',
    nedir: 'Ağız, diş ve çene cerrahisi; basit diş çekiminden ileri cerrahi işlemlere kadar geniş bir alanı kapsar. Gömülü 20 yaş dişleri, çene kistleri, implant öncesi kemik işlemleri (greft, sinüs lifting) ve çene eklemi (TME) sorunları bu uzmanlık dalında değerlendirilir.',
    neZaman: [
      'Gömülü veya ağrı yapan 20 yaş dişi',
      'Zor/kırık diş çekimleri',
      'İmplant öncesi kemik yetersizliği (greft)',
      'Çene kisti veya lezyonları',
      'Çene eklemi (TME) ağrı ve kilitlenmeleri',
    ],
    surec: [
      { baslik: 'Görüntüleme', aciklama: 'Panoramik röntgen/tomografi ile durum değerlendirilir.' },
      { baslik: 'Cerrahi planlama', aciklama: 'İşlemin türü ve anestezi yöntemi belirlenir.' },
      { baslik: 'Cerrahi işlem', aciklama: 'Lokal (gerekirse sedasyon) anestezi ile işlem yapılır.' },
      { baslik: 'İyileşme takibi', aciklama: 'Dikiş ve pansuman kontrolüyle iyileşme izlenir.' },
    ],
    fiyatNot: 'Fiyat; işlemin zorluğuna ve türüne göre değişir. Muayene sonrası klinikten teklif alın.',
    sss: [
      { soru: '20 yaş dişi mutlaka çekilmeli mi?', cevap: 'Ağrı, enfeksiyon, çürük veya komşu dişe baskı varsa çekim önerilir; sorunsuz ve doğru konumdaysa takip edilebilir.' },
      { soru: 'Çene cerrahisi genel anestezi gerektirir mi?', cevap: 'Çoğu işlem lokal anestezi ile yapılır; kapsamlı vakalarda sedasyon veya genel anestezi tercih edilebilir.' },
      { soru: 'İyileşme ne kadar sürer?', cevap: 'Basit çekimlerde birkaç gün, cerrahi işlemlerde 1–2 hafta içinde belirgin iyileşme görülür.' },
    ],
    ilgiliProblemler: ['20-yas-disi-agrisi', 'gomulu-dis'],
  },
  {
    slug: 'estetik-dis-hekimligi',
    ad: 'Estetik Diş Hekimliği Rehberi',
    kisaAd: 'Estetik Diş',
    spec: 'Estetik Diş Hekimliği',
    ozet: 'Gülüş tasarımı, lamina, zirkonyum ve beyazlatma gibi uygulamalarla dişlerin görünümünü iyileştiren alan.',
    nedir: 'Estetik diş hekimliği; dişlerin rengi, şekli, dizilimi ve gülüş uyumunu iyileştirmeyi amaçlar. Diş beyazlatma, zirkonyum kaplama, laminate veneer (yaprak porselen) ve gülüş tasarımı bu alanın başlıca uygulamalarıdır. Hem estetik hem de fonksiyonel bir gülüş hedeflenir.',
    neZaman: [
      'Diş renklenmesi / sararması',
      'Şekil bozukluğu, kırık veya aşınmış dişler',
      'Dişler arası boşluklar',
      'Gülüş estetiği kaygısı',
    ],
    surec: [
      { baslik: 'Gülüş analizi', aciklama: 'Yüz hatları ve diş yapısına göre kişiye özel plan çıkarılır.' },
      { baslik: 'Uygulama seçimi', aciklama: 'Beyazlatma, lamina veya zirkonyumdan uygun olan belirlenir.' },
      { baslik: 'Prova ve uygulama', aciklama: 'Gerekli ölçüler alınır, kaplamalar prova edilip yapıştırılır.' },
      { baslik: 'Bakım önerileri', aciklama: 'Kalıcılık için bakım ve kontrol önerileri verilir.' },
    ],
    fiyatNot: 'Fiyat; seçilen uygulamaya ve diş sayısına göre değişir. Muayene sonrası klinikten bilgi alın.',
    sss: [
      { soru: 'Diş beyazlatma zararlı mı?', cevap: 'Diş hekimi kontrolünde yapılan beyazlatma güvenlidir; kısa süreli hassasiyet olabilir.' },
      { soru: 'Lamina mı zirkonyum mu?', cevap: 'Diş yapısına ve beklentiye göre değişir; lamina daha az aşındırma gerektirir, zirkonyum daha dayanıklıdır. Hekiminiz uygun olanı önerir.' },
      { soru: 'Sonuçlar ne kadar kalıcı?', cevap: 'Kaplamalar bakımla uzun yıllar dayanır; beyazlatma zamanla tazeleme gerektirebilir.' },
    ],
    ilgiliProblemler: ['dis-sararmasi'],
  },
  {
    slug: 'protez',
    ad: 'Diş Protezi Rehberi',
    kisaAd: 'Protez',
    spec: 'Protez (Diş Protezi)',
    ozet: 'Eksik dişlerin yerine sabit (köprü, kron) veya hareketli protezlerle fonksiyon ve estetiğin geri kazandırılması.',
    nedir: 'Protetik diş tedavisi; eksik veya hasarlı dişlerin yerine yapay dişlerle fonksiyon ve estetiğin sağlanmasıdır. Sabit protezler (kron, köprü) ve hareketli protezler (tam/parsiyel) ile çiğneme, konuşma ve gülüş yeniden kazandırılır. İmplant destekli protezler de bu alanda değerlendirilir.',
    neZaman: [
      'Bir veya birden fazla eksik diş',
      'Aşırı madde kaybı olan dişlerde kron ihtiyacı',
      'Tam dişsizlikte total protez',
      'İmplant üstü sabit protez isteği',
    ],
    surec: [
      { baslik: 'Muayene ve ölçü', aciklama: 'Ağız içi ölçü alınır, protez türü planlanır.' },
      { baslik: 'Hazırlık', aciklama: 'Gerekiyorsa dişler prepare edilir veya implant beklenir.' },
      { baslik: 'Prova', aciklama: 'Protezin uyumu ve estetiği prova edilir.' },
      { baslik: 'Teslim ve uyum', aciklama: 'Protez yerleştirilir; uyum kontrolleri yapılır.' },
    ],
    fiyatNot: 'Fiyat; protez türü ve malzemesine göre değişir. Klinikten muayene sonrası bilgi alın.',
    sss: [
      { soru: 'Sabit mi hareketli protez mi daha iyi?', cevap: 'Ağız yapısı, eksik diş sayısı ve bütçeye göre değişir; hekiminiz size en uygun seçeneği önerir.' },
      { soru: 'Protez alışması ne kadar sürer?', cevap: 'Hareketli protezlerde birkaç haftalık alışma dönemi olabilir; sabit protezlerde uyum daha hızlıdır.' },
      { soru: 'Protez ömrü ne kadardır?', cevap: 'Bakım ve kullanıma göre yıllarca kullanılabilir; periyodik kontrol önerilir.' },
    ],
    ilgiliProblemler: ['eksik-dis'],
  },
  {
    slug: 'dolgu-restoratif',
    ad: 'Dolgu (Restoratif Diş Tedavisi) Rehberi',
    kisaAd: 'Dolgu',
    spec: 'Restoratif Diş Tedavisi (Dolgu)',
    ozet: 'Çürük, kırık veya aşınmış dişlerin dolgu malzemeleriyle onarılıp fonksiyon ve estetiğinin geri kazandırılması.',
    nedir: 'Restoratif diş tedavisi; çürük, kırık veya aşınma nedeniyle madde kaybı olan dişlerin onarımıyla ilgilenir. Çürük temizlenip diş rengine uygun kompozit (beyaz) dolgu ile diş yeniden şekillendirilir. Erken tedavi, dişin daha büyük hasarlardan (kanal, çekim) korunmasını sağlar.',
    neZaman: [
      'Diş çürüğü',
      'Kırık veya çatlak diş',
      'Eski dolgunun yenilenmesi',
      'Diş hassasiyeti (çürüğe bağlı)',
    ],
    surec: [
      { baslik: 'Muayene', aciklama: 'Çürüğün derinliği ve dişin durumu değerlendirilir.' },
      { baslik: 'Çürük temizliği', aciklama: 'Gerekirse lokal anestezi ile çürük dokusu temizlenir.' },
      { baslik: 'Dolgu', aciklama: 'Diş rengine uygun kompozit ile diş doldurulup şekillendirilir.' },
      { baslik: 'Cila', aciklama: 'Dolgu parlatılır ve kapanış kontrol edilir.' },
    ],
    fiyatNot: 'Fiyat; dolgunun boyutu ve dişin durumuna göre değişir. Muayene sonrası klinikten bilgi alın.',
    sss: [
      { soru: 'Dolgu ne kadar dayanır?', cevap: 'Ağız bakımı ve dolgunun büyüklüğüne göre yıllarca dayanabilir; periyodik kontrol önerilir.' },
      { soru: 'Dolgu sonrası hassasiyet normal mi?', cevap: 'Birkaç gün süren hafif hassasiyet olabilir; uzun sürerse hekiminize başvurun.' },
      { soru: 'Beyaz dolgu mu amalgam mı?', cevap: 'Günümüzde diş rengine uygun kompozit (beyaz) dolgular estetik nedenle tercih edilir.' },
    ],
    ilgiliProblemler: ['dis-curugu', 'dis-hassasiyeti', 'dis-kirigi'],
  },
  {
    slug: 'dis-beyazlatma',
    ad: 'Diş Beyazlatma Rehberi',
    kisaAd: 'Diş Beyazlatma',
    spec: 'Diş Beyazlatma',
    ozet: 'Dişlerin renk tonunu güvenli şekilde açan ofis tipi ve ev tipi profesyonel beyazlatma uygulamaları.',
    nedir: 'Diş beyazlatma; kahve, çay, sigara ve yaşa bağlı renklenmeleri açan estetik bir uygulamadır. Klinikte yapılan ofis tipi beyazlatma daha hızlı sonuç verirken, hekim kontrolünde hazırlanan kişiye özel plaklarla ev tipi beyazlatma da uygulanabilir. İşlem, diş hekimi kontrolünde güvenlidir.',
    neZaman: [
      'Diş sararması / renklenmesi',
      'Özel gün öncesi estetik istek',
      'Yaşa bağlı renk koyulaşması',
    ],
    surec: [
      { baslik: 'Muayene', aciklama: 'Diş ve diş eti sağlığı kontrol edilir, uygunluk değerlendirilir.' },
      { baslik: 'Temizlik', aciklama: 'Gerekirse önce diş taşı temizliği yapılır.' },
      { baslik: 'Beyazlatma', aciklama: 'Ofis tipi jel + ışık veya ev tipi plak uygulanır.' },
      { baslik: 'Bakım', aciklama: 'Renk veren gıdalardan kaçınma ve bakım önerileri verilir.' },
    ],
    fiyatNot: 'Fiyat; ofis/ev tipi yönteme ve seans sayısına göre değişir. Klinikten bilgi alabilirsiniz.',
    sss: [
      { soru: 'Beyazlatma dişe zarar verir mi?', cevap: 'Diş hekimi kontrolünde yapıldığında güvenlidir; geçici hassasiyet olabilir.' },
      { soru: 'Sonuç ne kadar kalıcı?', cevap: 'Beslenme ve alışkanlıklara göre değişir; zamanla tazeleme gerekebilir.' },
      { soru: 'Evde satılan ürünler etkili mi?', cevap: 'Hekim kontrolü olmadan kullanılan ürünler diş etine zarar verebilir; profesyonel uygulama önerilir.' },
    ],
    ilgiliProblemler: ['dis-sararmasi'],
  },
];

export function rehberBySlug(slug: string): UzmanlikRehber | null {
  return UZMANLIK_REHBERLERI.find(r => r.slug === slug) || null;
}
/** Bir uzmanlık (spec) etiketine karşılık gelen rehber — dis-tedavileri sayfasından bağlanmak için */
export function rehberBySpec(spec: string): UzmanlikRehber | null {
  return UZMANLIK_REHBERLERI.find(r => r.spec === spec) || null;
}
