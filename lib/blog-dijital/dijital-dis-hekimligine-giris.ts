import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'dijital-dis-hekimligine-giris',
  sira: 1,
  title: 'Dijital Diş Hekimliğine Giriş: Kavramlar, Tarihçe ve Klinikte Dönüşüm',
  summary:
    'Voksel, mesh, hizalama ve çözünürlük gibi temel kavramlardan CAD-CAM tarihçesine, klinik içi ve dış kaynaklı iş akışından yatırım getirisine ve yapay zekâya kısa bir meslek rehberi.',
  created_at: '2026-10-31T14:45:00+03:00',
  cover_alt: 'Üç boyutlu tel kafes ağ olarak çizilmiş diş arkı, koordinat eksenleri ve altın renkli veri akışı çizgileriyle dijital diş hekimliği şeması',
  metin: `
Dijital diş hekimliği, tanı, planlama, üretim ve takip aşamalarında hasta verisinin sayısal ortamda elde edilip işlenmesine dayanan çalışma biçimidir. Ağız içi tarayıcıdan konik ışınlı bilgisayarlı tomografiye (KIBT), tasarım yazılımından üç boyutlu yazıcıya kadar uzanan bu araçlar tek tek yeni değildir; asıl değişim, birbirleriyle konuşabilen bir **iş akışına** dönüşmeleridir. Hasta verisi bir kez doğru elde edildiğinde aynı veri planlamada, hasta iletişiminde, üretimde ve kontrol randevusunda yeniden kullanılabilir.

Bu yazı, diş hekimlerine yönelik dijital hekimlik dizisinin giriş bölümüdür. Önce ortak bir dil kurmak için temel kavramları, ardından teknolojinin kısa tarihini, kliniğe nasıl yerleştirileceğini, ekonomik boyutunu ve yapay zekânın bugünkü yerini özetliyoruz. Görüntüleme ve tasarım ayrıntıları [bilgisayar destekli tasarım yazısında](/blog/bilgisayar-destekli-tasarim-cad), üretim teknolojileri ise [bilgisayar destekli üretim yazısında](/blog/bilgisayar-destekli-uretim-cam) ele alınıyor.

## Temel Kavramlar

**Üç boyutlu görüntüleme.** Dijital iş akışında iki tür üç boyutlu veriyle çalışılır. KIBT gibi yöntemler dokunun iç yapısını *voksel* adı verilen küçük hacim öğeleriyle temsil eder; her voksel bir gri değer taşır ve kesitler bu hacimden üretilir. Ağız içi, masaüstü ve yüz tarayıcıları ise yalnız dış yüzeyi kaydeder; elde edilen nokta bulutu yüzey modeline dönüştürülür. Hacimsel veri kemik, kök ve kanal gibi iç yapıları, yüzey verisi ise diş, dişeti ve yumuşak doku yüzeylerini yüksek ayrıntıyla gösterir. Klinik planlamanın gücü bu iki veri türünün bir araya getirilmesinden doğar.

**Koordinatlar ve düzlemler.** Her dijital model x, y ve z eksenlerinden oluşan bir koordinat sisteminde yer alır. Yazılımlar bu sistemi anatomik düzlemlerle ilişkilendirir: sagital, koronal (frontal) ve aksiyal düzlemler kesit görüntülerin; oklüzal düzlem, Frankfort yatay düzlemi ya da doğal baş pozisyonu ise estetik ve fonksiyonel değerlendirmenin referansıdır. Farklı cihazlardan gelen veriler başlangıçta kendi koordinat sistemlerindedir; doğru yönlendirme yapılmadan yapılan estetik analiz ya da ölçüm yanıltıcı olabilir.

**Bilgisayar destekli tasarım ve üretim (CAD-CAM).** CAD (*computer-aided design*), restorasyonun, rehberin ya da apareyin sanal ortamda tasarlanmasıdır; CAM (*computer-aided manufacturing*) ise bu tasarımın bir makine tarafından üretilmesidir. Üretim, bir bloktan malzeme kaldırarak (eksiltmeli üretim, frezeleme) ya da malzemeyi katman katman ekleyerek (eklemeli üretim, üç boyutlu baskı) yapılır. İki yöntemin malzeme seçenekleri, hassasiyeti ve maliyeti farklıdır.

**Mesh (ağ yüzey).** Tarayıcıların ürettiği yüzey modeli, birbirine kenarlarından bağlı çok sayıda küçük üçgenden oluşan bir ağdır. Her üçgen köşe noktaları (*vertex*), kenarlar ve yüzlerle tanımlanır. Ağdaki delikler, kendisiyle kesişen üçgenler ya da birbirinden kopuk parçalar tasarım ve baskı sırasında sorun yaratır; özellikle baskıya gidecek modellerin kapalı ve tutarlı bir yüzeye (*watertight*) sahip olması gerekir. Bu nedenle mesh temizleme ve onarma, dijital iş akışının rutin adımlarından biridir.

**Görüntü rehberliğinde tedavi.** Tedavinin sanal ortamda planlanıp bu planın klinik uygulamaya aktarılmasıdır. Aktarım iki yolla yapılır: hastaya özel üretilen ve frez ya da enstrümanın konumunu sınırlayan *statik* rehberler (cerrahi şablonlar) veya enstrüman ve hastanın konumunu kameralarla gerçek zamanlı izleyen *dinamik* navigasyon sistemleri. İmplant cerrahisinden rehberli endodontiye kadar pek çok uygulama bu ilkeye dayanır.

**Görüntü hizalama (üst üste bindirme).** Farklı kaynaklardan gelen verilerin aynı koordinat sistemine taşınmasıdır (*registration*, *superimposition*). Hizalama, iki veri setinde de ayırt edilebilen ortak noktalar seçilerek ya da yüzeylerin birbirine en iyi uyduğu konum yazılımla hesaplanarak yapılır. Örneğin KIBT hacmi ile ağız içi tarama, diş yüzeyleri üzerinden eşleştirilir. Hizalamadaki bir hata, sonraki tüm planlama adımlarına taşınır; bu yüzden her hizalamanın kesitler üzerinde gözle doğrulanması gerekir.

**Çözünürlük ve doğruluk.** Çözünürlük, bir sistemin ayırt edebildiği en küçük ayrıntıdır; KIBT'de büyük ölçüde voksel boyutuyla, yüzey taramada nokta yoğunluğuyla ilişkilidir. Daha küçük voksel genellikle daha fazla ayrıntı sağlar, ancak görüntü gürültüsü ve hasta dozu açısından bedeli olabilir; bu nedenle tarama parametreleri klinik soruya göre seçilmelidir (European Commission, 2012). Çözünürlük doğrulukla aynı şey değildir: doğruluk, ölçümün gerçek değere yakınlığını (*trueness*, gerçeklik) ve tekrarlanan ölçümlerin birbirine yakınlığını (*precision*, kesinlik) birlikte ifade eder (Ender ve Mehl, 2013).

## Dijital Diş Hekimliğinin Kısa Tarihi

Diş hekimliğinde CAD-CAM fikrinin kökleri 1970'lere uzanır. François Duret'in optik ölçü ve bilgisayar destekli üretim üzerine çalışmaları, ölçünün kamerayla alınıp restorasyonun makineyle üretilebileceği düşüncesinin ilk sistematik örneklerindendir; Duret ve arkadaşları 1988'de diş hekimliğinde CAD-CAM yaklaşımını ve bu alandaki çalışmalarını ele almıştır (Duret ve ark., 1988).

Klinik pratik açısından dönüm noktası 1985'tir. Zürih Üniversitesi'nde Werner Mörmann ve Marco Brandestini'nin geliştirdiği CEREC sistemiyle ilk kez hasta başında, aynı seansta taranıp frezelenen seramik bir inley yerleştirildi. Sistem sonraki yıllarda tarama, tasarım ve frezeleme birimleri geliştirilerek kuron ve köprü restorasyonlarına kadar genişledi (Mörmann, 2006).

Görüntüleme tarafında 1990'ların sonu önemli bir eşiktir. Mozzo ve arkadaşları 1998'de dental görüntüleme için konik ışın tekniğine dayanan yeni bir hacimsel tomografi cihazının ilk sonuçlarını yayımladı (Mozzo ve ark., 1998). KIBT'nin yaygınlaşması, implant planlamasını ve ardından rehberli cerrahiyi muayenehane ölçeğine taşıdı. Aynı dönemde endüstride geliştirilen stereolitografi ve diğer eklemeli üretim teknikleri de zamanla diş hekimliğine uyarlandı.

2010'lu yıllarda ağız içi tarayıcıların hızlanması ve küçülmesi, açık dosya biçimlerinin yaygınlaşması ve masaüstü üç boyutlu yazıcıların erişilebilir hâle gelmesiyle dijital iş akışı uzman merkezlerin dışına çıktı. Fotoğraf ve videoya dayalı estetik planlama yaklaşımları hasta iletişiminde yeni bir dil sundu (Coachman ve Calamita, 2012); ağız içi tarama, KIBT ve yüz taramasının tek bir üç boyutlu veri havuzunda birleştirildiği "sanal hasta" kavramı tartışılmaya başlandı (Joda ve Gallucci, 2015).

Bugün gündemin merkezinde yapay zekâ destekli görüntü analizi, tasarım otomasyonu ve bulut tabanlı veri paylaşımı var. Teknolojinin hızı, kanıtın birikme hızından yüksek; bu da diş hekiminin yeni bir aracı benimserken bağımsız klinik çalışmalara bakmasını her zamankinden önemli kılıyor.

## Klinik İçi ve Dış Kaynaklı Dijital İş Akışı

Dijital iş akışı üç biçimde kurulabilir. **Klinik içi** (*in-house*, hasta başı) akışta tarama, tasarım ve üretim klinikte yapılır; tek seansta restorasyon ve hızlı revizyon mümkündür, ancak cihaz ve eğitim yatırımı klinikte toplanır. **Dış kaynaklı** (*outsourced*) akışta klinik veriyi toplar, tasarım ve üretimi diş laboratuvarı ya da planlama merkezi üstlenir. Pek çok klinikte görülen **karma** model ise ikisini birleştirir: örneğin geçici restorasyonlar ve modeller klinikte basılırken kalıcı seramik restorasyonlar laboratuvarda üretilir.

**Dijital klinik ve kliniğe etkileri.** Dijital bir klinik yalnız cihazlardan oluşmaz; veri depolama, yedekleme, ağ altyapısı ve dosya paylaşım kuralları da sistemin parçasıdır. Hasta görüntüleri ve taramaları sağlık verisidir ve 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında özel nitelikli kişisel veri olarak korunmalıdır. Klinik işleyişte en belirgin değişiklikler ölçü maddesinin ve kargo sürecinin ortadan kalkması, laboratuvarla iletişimin hızlanması, hastaya planın görsel olarak gösterilebilmesi ve ekip içindeki rollerin yeniden tanımlanmasıdır.

**Dijital diş hekimliği eğitimi.** Her dijital cihazın bir öğrenme eğrisi vardır. Tarama stratejisi, mesh temizliği, hizalama ve tasarım parametreleri pratikle oturur; ilk vakalarda süre ve tekrar oranı yüksek olabilir. Ekibin yalnız hekimden oluşmadığını, asistanların ve teknisyenlerin de eğitim planına dahil edilmesi gerektiğini unutmamak gerekir. Üretici eğitimleri yararlıdır, ancak cihazdan bağımsız temel bilgi (görüntüleme fiziği, malzeme bilgisi, oklüzyon) dijital sonuçların kalitesini belirleyen asıl etkendir.

**Dijitalleşme düzeyleri.** Kliniğin nereden başlayacağını belirlemek için kademeli düşünmek yol gösterir. Aşağıdaki sınıflandırma yaygın uygulamaya dayanan pratik bir çerçevedir:

- **Kayıt düzeyi:** dijital radyografi, standart klinik fotoğraf ve elektronik hasta kaydı.
- **Veri toplama düzeyi:** ağız içi tarayıcı ve gerekirse KIBT; tasarım ve üretim laboratuvarda.
- **Klinik içi üretim düzeyi:** tasarım yazılımı, üç boyutlu yazıcı ve/veya hasta başı frezeleme.
- **Bütünleşik planlama düzeyi:** sanal hasta, rehberli cerrahi, disiplinler arası dijital planlama ve veri analitiği.

Hangi düzeyin doğru olduğu kliniğin vaka profiline bağlıdır. Az sayıda protetik vaka gören bir klinik için veri toplama düzeyi ile güvenilir bir laboratuvar ortaklığı, pahalı bir üretim parkurundan daha verimli olabilir.

**Dijital klinikte iş akışı.** Tipik bir dijital vaka şu sırayı izler: kayıt (fotoğraf, tarama, gerekiyorsa KIBT) → verilerin hizalanması ve sanal hastanın kurulması → tanı ve tedavi planı → planın hastayla paylaşılması ve aydınlatılmış onam → tasarım ve üretim → klinik uygulama → kontrol taraması ve arşiv. Her adımın sonunda bir kontrol noktası tanımlamak (tarama tam mı, hizalama doğru mu, tasarım onaylandı mı) hatanın bir sonraki aşamaya taşınmasını önler.

## Dijital Kliniğin Ekonomisi ve Yatırım Getirisi

**Klinik türleri ve iş modelleri.** Tek hekimli muayenehane, çok hekimli poliklinik, belirli alanlarda (implant, ortodonti, estetik) uzmanlaşmış merkez ve laboratuvarla entegre çalışan klinik aynı dijital yatırımdan aynı faydayı görmez. Tek hekimli bir muayenehanede cihazın kullanım oranı belirleyici olurken, çok hekimli bir yapıda ortak kullanım, randevu planlaması ve personel eğitimi öne çıkar. Yatırım kararını teknoloji değil, kliniğin vaka karması ve hasta profili yönlendirmelidir.

**Maliyet kalemleri.** Satın alma bedeli toplam maliyetin yalnız bir parçasıdır. Yazılım lisansları ve abonelikler, tarama başına ücretler, sarf malzemeleri (reçine, blok, frez, filtre), bakım ve kalibrasyon, yedek parça, yazılım güncellemeleri, eğitim süresi ve öğrenme döneminde kaybedilen koltuk zamanı da hesaba katılmalıdır. Karşı tarafta ölçü maddesi, kargo, laboratuvar ücreti, tekrar seansı ve yeniden üretim gibi kalemlerde tasarruf ile yeni tedavi hizmetlerinden doğabilecek gelir yer alır.

**Yatırım getirisi (ROI) nasıl hesaplanır?** Temel formül şudur: ROI = (yatırımın sağladığı net kazanç − yatırım maliyeti) ÷ yatırım maliyeti × 100. Burada net kazanç, belirlenen dönemde yatırım sayesinde elde edilen ek gelir ile sağlanan tasarrufun toplamından, cihazın işletme giderlerinin düşülmesiyle bulunur. Varsayımsal bir örnekle: toplam maliyeti 1.000.000 TL olan bir tarama ve üretim yatırımı üç yılda toplam 1.300.000 TL net kazanç sağlıyorsa ROI = (1.300.000 − 1.000.000) ÷ 1.000.000 × 100 = %30 olur. Rakamlar yalnız hesabı göstermek içindir; gerçek değerler cihaz, malzeme ve vaka sayısına göre büyük farklılık gösterir.

ROI hesabında sık yapılan hatalar, kullanım oranını iyimser tahmin etmek, abonelik ve sarf giderlerini unutmak ve geri ödeme süresini (yatırımın kendini amorti ettiği süre) göz ardı etmektir. Gerçekçi bir hesap için önceki yılın vaka sayılarından yola çıkılması, iyimser ve kötümser iki senaryonun birlikte hazırlanması önerilir.

**Klinik açısından avantajlar.** İyi kurulmuş bir dijital akış; tekrarlanabilir kayıt, kalıcı ve aranabilir arşiv, laboratuvarla hızlı iletişim, hastaya görsel açıklama imkânı ve planın öngörülebilir biçimde uygulamaya aktarılması gibi kazanımlar sağlar. Ancak bu avantajlar cihazın varlığından kendiliğinden doğmaz; standart protokoller, eğitimli ekip ve düzenli kalite kontrolle ortaya çıkar.

## Diş Hekimliğinde Yapay Zekâ

Yapay zekâ, insan bilişine benzeyen görevleri yerine getiren yazılımların genel adıdır. Diş hekimliğindeki uygulamaların büyük kısmı *makine öğrenmesi*, özellikle de çok katmanlı yapay sinir ağlarına dayanan *derin öğrenme* yöntemlerini kullanır. Görüntü analizi için yaygın kullanılan evrişimli sinir ağları (*convolutional neural networks*), etiketlenmiş çok sayıda örnekten öğrenerek yeni görüntülerde benzer örüntüleri tanır (Hwang ve ark., 2019).

Araştırmaların büyük bölümü görüntü analizine odaklanır: radyograflarda çürük ve lezyon tespiti, periodontal kemik kaybının değerlendirilmesi ve sefalometrik nokta tespiti bunların başında gelir (Hwang ve ark., 2019). KIBT'de anatomik yapıların otomatik segmentasyonu ve restorasyon tasarımının otomasyonu da hızla gelişen uygulama alanlarıdır. Bazı ticari tasarım ve görüntüleme yazılımları otomatik segmentasyon ya da öneri niteliğinde tasarım gibi işlevleri halihazırda sunmaktadır.

Bununla birlikte önemli sınırlılıklar vardır. Modellerin başarısı eğitildikleri veri setinin büyüklüğüne, çeşitliliğine ve etiketleme kalitesine bağlıdır; bir merkezde iyi sonuç veren model başka bir cihaz ya da hasta grubunda aynı başarıyı göstermeyebilir. Kararın nasıl verildiğinin açıklanabilirliği, veri gizliliği, yanlılık ve sonuçların klinik fayda açısından değerlendirilmesi alanın başlıca sorunları olarak tartışılmaktadır (Schwendicke ve ark., 2020).

Bugünkü haliyle yapay zekâ, diş hekiminin yerini alan değil, onun kararını destekleyen bir araç olarak görülmelidir. Tanı ve tedavi sorumluluğu hekimdedir; yapay zekâ çıktısı klinik muayene ve diğer bulgularla birlikte yorumlanmalıdır. Bir yazılımı klinikte kullanmadan önce bağımsız doğrulama çalışmalarına, yasal onay durumuna ve hasta verisinin nerede ve nasıl işlendiğine bakmak gerekir.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Duret F, Blouin JL, Duret B. CAD-CAM in dentistry. J Am Dent Assoc. 1988;117:715–720.
- Mörmann WH. The evolution of the CEREC system. J Am Dent Assoc. 2006;137 Suppl:7S–13S.
- Mozzo P, Procacci C, Tacconi A, Martini PT, Andreis IA. A new volumetric CT machine for dental imaging based on the cone-beam technique: preliminary results. Eur Radiol. 1998;8(9):1558–1564.
- European Commission. Radiation Protection No 172: Cone Beam CT for Dental and Maxillofacial Radiology. Evidence-Based Guidelines. Luxembourg: Publications Office of the European Union; 2012.
- Ender A, Mehl A. Accuracy of complete-arch dental impressions: a new method of measuring trueness and precision. J Prosthet Dent. 2013;109(2):121–128.
- Coachman C, Calamita MA. Digital Smile Design: a tool for treatment planning and communication in esthetic dentistry. Quintessence Dent Technol. 2012;35:103–111.
- Joda T, Gallucci GO. The virtual patient in dental medicine. Clin Oral Implants Res. 2015;26(6):725–726.
- Hwang JJ, Jung YH, Cho BH, Heo MS. An overview of deep learning in the field of dentistry. Imaging Sci Dent. 2019;49(1):1–7.
- Schwendicke F, Samek W, Krois J. Artificial intelligence in dentistry: chances and challenges. J Dent Res. 2020;99(7):769–774.
`,
};

export default yazi;
