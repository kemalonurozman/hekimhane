import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'protetik-ve-restoratif-tedavilerde-dijital-is-akisi',
  sira: 4,
  title: 'Protetik ve Restoratif Diş Hekimliğinde Dijital İş Akışı',
  summary:
    'Preparasyon taramasından sanal artikülatöre, kron ve köprüden tam proteze kadar protetik ve restoratif tedavilerde dijital iş akışının klinik adımları, avantajları ve sınırları.',
  created_at: '2026-10-31T14:30:00+03:00',
  cover_alt: 'Dişetinden yükselen kesilmiş bir diş güdüğü, altın renkli bitim çizgisi ve üzerine inen ağ yüzeyli kron ile arkada tarama ağıyla çizilmiş diş arkını gösteren çizim',
  metin: `
Protetik ve restoratif diş hekimliği, dijital dönüşümün en erken ve en geniş yer bulduğu alandır. Ölçünün ağız içi tarayıcıyla alınması, tasarımın ekranda yapılması ve üretimin frezeleme ya da üç boyutlu baskıyla gerçekleştirilmesi; bugün tek kronlardan tam ark implant destekli protezlere uzanan geniş bir yelpazede rutin hâle gelmiştir. Yine de dijital iş akışı, protezin biyolojik ve mekanik kurallarını değiştirmez; yalnızca bu kuralları uygulamanın araçlarını değiştirir.

Bu yazıda ağız içi taramanın klinik gereklilikleri, sanal hastanın kurulması, estetik ve fonksiyonel analiz, restorasyon türlerine göre dijital akış ve protetik tedavide üç boyutlu baskının yeri özetleniyor. Görüntüleme yöntemleri ve dosya biçimleri için [bilgisayar destekli tasarım](/blog/bilgisayar-destekli-tasarim-cad), üretim teknolojileri için [bilgisayar destekli üretim](/blog/bilgisayar-destekli-uretim-cam) yazılarına bakılabilir.

## Ağız İçi Tarama: Preparasyonlar ve İmplant Tarama Gövdeleri

**Görünmeyen taranamaz.** Ağız içi tarayıcı yalnız optik olarak gördüğü yüzeyi kaydeder; ölçü maddesi gibi dişeti oluğuna akıp bitim çizgisini kendiliğinden ortaya çıkarmaz. Bu nedenle bitim çizgisinin tarama anında açıkta, kuru ve temiz olması gerekir. Retraksiyon ipi ya da retraksiyon patı, kanama ve tükürük kontrolü taramanın başarısını belirler; derin subgingival bitimler dijital ölçünün en zorlandığı durumlardır.

**Dijital iş akışına uygun preparasyon.** Düzgün yüzeyler, yuvarlatılmış iç açılar, belirgin ve kesintisiz bir bitim çizgisi ile seçilen malzemenin gerektirdiği aşındırma miktarı temel ilkelerdir. Keskin iç köşeler hem taramada gürültü üretir hem de frezenin uç çapı nedeniyle birebir işlenemez. Çoğu tarama yazılımı, hasta koltuktan kalkmadan oklüzal mesafeyi, giriş yolunu ve andırkatları ekranda kontrol etmeye olanak tanır.

**Tarama stratejisi ve kontrol.** Üreticinin önerdiği tarama yolunun izlenmesi, gereksiz tekrar taramaların önlenmesi ve preparasyon, komşu dişler, karşıt ark ile bukkal kapanış kaydının eksiksiz alınması gerekir. Tarama bitince bitim çizgisi, temas noktaları ve oklüzal boşluk üç boyutlu olarak incelenmeli; eksik bölge varsa yalnız o bölge yeniden taranmalıdır. Konvansiyonel ölçüye göre en önemli avantajlardan biri, hatanın hasta ayrılmadan fark edilebilmesidir.

**Doğruluk kavramları.** Dijital ölçünün doğruluğu iki bileşenle tanımlanır: ölçünün gerçek geometriye yakınlığı (**gerçeklik**, *trueness*) ve tekrarlanan ölçülerin birbirine yakınlığı (**kesinlik**, *precision*) (Ender ve Mehl, 2013). Kısa açıklıklı restorasyonlar ağız içi taramaya iyi uyum gösterir; tarama mesafesi uzadıkça ve tam ark taramalarda görüntü birleştirme hatalarının birikebileceği göz önünde tutulmalıdır.

**İmplant tarama gövdeleri.** Tarama gövdesi (*scan body*), implantın konumunu ve yönünü CAD yazılımına taşıyan, geometrisi kütüphanede tanımlı bir ara parçadır. Tipik akış şöyledir:

- İyileşme başlığı çıkarılır ve oluşmuş dişeti çıkış profili, dokular çökmeden hızla taranır.
- İmplant sistemi ve CAD kütüphanesiyle uyumlu tarama gövdesi takılır, üreticinin önerdiği şekilde elle sıkılır; subgingival bağlantılarda tam oturma gerekirse radyografiyle doğrulanır.
- Tarama gövdesi, özellikle üst geometrisi eksiksiz olacak şekilde, komşu dişler, karşıt ark ve kapanışla birlikte taranır.
- Yazılımda kütüphane eşleşmesi kontrol edilir, ardından iyileşme başlığı yerine takılır.

Hasarlı ya da üreticinin önerdiği kullanım sayısını aşmış tarama gövdeleri, eksik oturma ve yanlış kütüphane seçimi konum hatasının başlıca nedenleridir. Tam ark çok implantlı vakalarda, ayırt edici yüzey özelliği az olan dişsiz mukoza üzerinde görüntüleri birleştirmek zorlaşır. Bu vakalarda geliştirilen bir alternatif **stereofotogrametridir**: ağız dışı bir kamera sistemi, özel kodlu hedefler taşıyan tarama gövdelerini birden çok açıdan eş zamanlı görüntüleyerek implantların birbirine göre konumunu hesaplar; yumuşak doku ise ayrıca ağız içi tarayıcıyla kaydedilir. Bu yaklaşımın klinik kanıtı gelişmekte olup sisteme özgü bir iş akışı ve ek donanım gerektirir; kesin protez öncesinde basılmış bir prototip ya da doğrulama aparatıyla uyumun kontrol edilmesi iyi bir uygulamadır.

## Sanal Hastanın Kurulumu ve Sanal Artikülatör

Taramalar CAD yazılımına aktarıldığında ilk iş, verilerin doğru adlandırılması ve hizalanmasıdır: üst ve alt ark, kapanış kayıtları, preparasyon taraması, varsa tedavi öncesi ya da geçici restorasyon taraması, yüz taraması ve fotoğraflar. Ağız içi tarama, KIBT ve yüz taramasının tek bir üç boyutlu veri havuzunda birleştirilmesi **sanal hasta** kavramının temelidir (Joda ve Gallucci, 2015).

Arkların birbirine göre konumu çoğunlukla maksimum interkuspidasyonda alınan bukkal taramalarla belirlenir. Yazılımda karşıt dişler arasında olağan dışı penetrasyon ya da boşluk görülmesi kapanış kaydında hataya işaret eder; bu hata fark edilmezse restorasyon ağızda fazla oklüzal düzeltme gerektirir.

**Sanal artikülatör.** Sanal artikülatör, mandibula hareketlerini ekranda taklit ederek restorasyonun yalnız statik kapanışta değil, protrüzyon ve lateral hareketlerde de değerlendirilmesini sağlar. Ortalama değerlerle çalışılabileceği gibi kondil eğimi, Bennett açısı ve kesici rehberliği gibi parametreler hastaya özgü olarak da girilebilir. Arkların artikülatöre referans düzleme göre yerleştirilmesi için dijital yüz arkı yöntemleri, yüz taraması ya da fotoğraf tabanlı aktarım kullanılabilir; çene hareketlerini kaydeden izleme sistemleri ise hastanın gerçek hareket yollarını yazılıma taşıyabilir.

Uygulamada adımlar genellikle şöyle ilerler: arklar artikülatörün koordinat sistemine aktarılır, parametreler belirlenir, eksantrik hareketler simüle edilir, girişimler işaretlenir ve tasarım bu dinamik bilgiye göre düzeltilir. Uzun açıklıklı restorasyonlarda, kesici ve kanin rehberliğinin değiştiği vakalarda ve kapsamlı rehabilitasyonlarda bu adımın klinik değeri daha belirgindir.

Sanal artikülatörün sınırları da bilinmelidir: sonuç, girilen verinin doğruluğuyla sınırlıdır; dokuların esnekliği, kas aktivitesi ve parafonksiyonlar tam olarak modellenemez. Ekrandaki uyum klinik provanın yerini tutmaz; özellikle oklüzyonu değiştiren tedavilerde geçici restorasyonla yapılan fonksiyonel deneme önemini korur.

## Estetik Analiz, Dijital Gülüş Tasarımı ve Dinamik Gülümseme

**Estetik analiz.** Dijital estetik planlama, geleneksel analizin aynı basamaklarını izler: yüz (bipupiller çizgi, yüz orta hattı, dudak desteği), dentofasiyal ilişki (kesici kenar konumu, gülüş eğrisi, bukkal koridorlar) ve diş-dişeti ilişkisi (diş boy-genişlik oranları, dişeti zenit noktaları, dişeti seviyesi simetrisi). Analizin güvenilirliği, standart bir fotoğraf protokolüne ve tekrarlanabilir hasta pozisyonuna bağlıdır.

**Gülüşün iki boyutlu dijital tasarımı.** Dijital Gülüş Tasarımı (*Digital Smile Design*) yaklaşımı, fotoğraflar üzerine çizilen referans çizgileri ve diş formlarıyla tedavi planını görselleştirir; hem hasta hem de ekip içi iletişimde bir araç olarak tanımlanmıştır (Coachman ve Calamita, 2012). İki boyutlu tasarımın sınırı, objektif açısı ve çekim mesafesinin yarattığı perspektif bozulmasıdır; bu nedenle tasarım ağızda ölçülmüş gerçek bir boyutla kalibre edilmelidir.

**Üç boyutlu estetik analiz için veri.** Yüz tarayıcıları, fotoğraflardan üç boyutlu model üreten fotogrametri uygulamaları ya da KIBT'den elde edilen yumuşak doku yüzeyi, yüzün ağız içi taramayla ortak referanslar üzerinden hizalanmasına imkân verir. Böylece dijital mum modelajı yüzün içinde, dudak ve gülüş hattıyla birlikte değerlendirilebilir (Joda ve Gallucci, 2015).

**Dentofasiyal analiz için adımlar.** Pratik bir sıra şöyle özetlenebilir:

- Standart fotoğraf ve video protokolü ile ağız içi taramanın alınması
- Gerekirse yüz taramasının yapılması ve verilerin hizalanması
- Yüz ve dentofasiyal referanslara göre analiz
- Dijital mum modelajı ve basılmış modelden hazırlanan kalıpla ağızda prova (*mock-up*)
- Hasta onayından sonra planın preparasyon rehberlerine ve kalıcı restorasyona aktarılması

**Dinamik gülümseme analizi.** Poz verilmiş statik bir gülüş fotoğrafı, konuşma ve kendiliğinden gülme sırasında ortaya çıkan diş ve dişeti görünümünü tam yansıtmayabilir. Kısa videolar; istirahatte kesici görünürlüğünü, fonetik testler sırasında kesici kenar konumunu ve spontane gülüşte dişeti görünümünü değerlendirmek için kullanılır. Analiz için uygun kareler seçilir ve tasarım bu karelerle karşılaştırılır. Hareket hâlindeki sanal hasta, yani dört boyutlu modelleme, gelecek için işaret edilen bir gelişim alanıdır (Joda ve Gallucci, 2015).

Tüm bu araçlar bir sonuç garantisi değil, bir öngörü ve iletişim aracıdır. Simülasyonun klinik ve biyolojik sınırları hastaya açıkça anlatılmalı; ağızdaki prova, ekrandaki tasarımın gerçek koşullardaki karşılığını görmek için en değerli adım olarak kalmalıdır.

## Tek Kronlar: Diş ve İmplant Destekli Restorasyonlar

**Diş destekli tek kronlar.** Dijital akış tarama verisinin içe aktarılmasıyla başlar; ardından bitim çizgisi işaretlenir, giriş yolu belirlenir, siman aralığı ve minimum kalınlık parametreleri seçilir. Yazılım kütüphanedeki ya da komşu dişlerden türetilen bir anatomi önerir; temas noktaları ve oklüzyon, gerekirse sanal artikülatörle düzenlenir. Tasarım üretime gönderilir, karakterizasyon ve glaze yapılır, ağızda prova edilip malzemeye uygun protokolle simante edilir.

Malzeme seçimi endikasyona göre yapılır: monolitik zirkonya yüksek dayanım gerektiren bölgelerde, lityum disilikat estetik beklentinin yüksek olduğu durumlarda, rezin matriksli seramikler ve PMMA ise belirli endikasyonlarda ve geçici restorasyonlarda kullanılır. Her malzemenin üreticisinin belirttiği minimum kalınlıklara uyulmalıdır. Simantasyon protokolü de malzemeye özgüdür; örneğin lityum disilikatta hidroflorik asitle pürüzlendirme ve silan, zirkonyada kumlama ve MDP içeren primerler yaygın olarak kullanılır.

**Güdüklerle çalışma.** Monolitik restorasyonlar çoğu zaman modelsiz üretilebilir. Ancak katmanlı seramik uygulanacaksa, kenar uyumunun fiziksel olarak kontrol edilmesi isteniyorsa ya da birden çok birim birlikte üretiliyorsa, çıkarılabilir güdüklü basılmış modeller kullanılır. Güdüklerin doğruluğu yazıcıya, reçineye ve son işleme bağlı olduğundan, model üretiminde de doğrulanmış protokoller izlenmelidir.

**İmplant destekli kronlar.** Tarama gövdesi verisi kütüphaneyle eşleştirildikten sonra iki temel tasarım seçeneği vardır: titanyum taban (*Ti-base*) üzerine yapıştırılan vidalı monolitik kron (hibrit abutment kron) ya da kişiye özel abutment üzerine simante edilen kron. Vidalı tasarım, implant çevresinde artık siman riskini ortadan kaldırdığı için birçok klinisyen tarafından tercih edilir. Sistemin izin verdiği sınırlar içinde açılı vida kanalları, vida giriş deliğinin estetik ya da fonksiyonel açıdan daha uygun bir noktaya taşınmasını sağlar.

**CAD-CAM kopingler.** Katmanlı restorasyonlarda zirkonya ya da kobalt-krom kopingler, tam anatomik tasarımdan kontrollü bir küçültmeyle (*cut-back*) elde edilir. Böylece üzerine uygulanacak seramik, desteksiz bölgeler oluşmadan homojen bir kalınlıkta kalır. Bu yaklaşım, desteksiz seramikle ilişkilendirilen kırılma ve parça kopması riskini azaltmayı amaçlar.

**Kişiye özel abutmentler.** Hazır abutmentlerin aksine kişiye özel abutment, geçici restorasyonla şekillendirilmiş dişeti çıkış profiline ve hastanın dişeti seviyesine göre tasarlanır. Bitim çizgisinin, siman artığının temizlenebileceği bir derinlikte konumlandırılması önemlidir. Titanyum ya da titanyum taban üzerine zirkonya gibi seçenekler, bölgenin estetik ve mekanik gereksinimlerine göre seçilir.

## Splintli Kronlar ve Sabit Köprüler

Köprü tasarımında birden çok destek diş için ortak bir giriş yolu belirlenir; yazılımların paralellik araçları andırkatları ve gereken düzeltmeleri gösterir. Bağlantı (konnektör) kesiti, özellikle zirkonya ve lityum disilikatta başarının en kritik parametrelerinden biridir ve üreticinin belirttiği minimum değerlerin altına inilmemelidir. Gövde (pontik) tasarımı ise estetik, fonetik ve hijyen erişimi birlikte düşünülerek yapılır.

**Sabit bir köprüyü tasarlamak ve frezelemek için adımlar** şöyle özetlenebilir:

- Destek dişlerin, dişsiz kretin, karşıt arkın ve kapanışın taranması
- Bitim çizgilerinin işaretlenmesi ve ortak giriş yolunun belirlenmesi
- Anatominin kütüphaneden ya da onaylanmış geçici restorasyonun taramasından aktarılması
- Bağlantıların boyutlandırılması; katmanlı seramik planlanıyorsa kontrollü küçültme
- Diskte yerleştirme, bağlantı çubuklarının konumlandırılması ve frezeleme
- Zirkonyada sinterleme, model ve ağızda uyum kontrolü, bitim işlemleri

**Splintli kronlar**, birbirine bağlanması planlanan kronlarda, örneğin birden çok komşu implant üzerindeki restorasyonlarda ya da protetik gerekçelerle birlikte çalışması istenen dişlerde kullanılır; endikasyon klinik değerlendirmeye bağlıdır. Bağlantı bölgelerinin altında ara yüz fırçasının geçebileceği alan bırakılması uzun dönem periodontal ve peri-implant sağlık için önemlidir.

Dijital akışın köprülerdeki önemli bir katkısı, onaylanmış geçici restorasyonun birebir kopyalanabilmesidir. Hastanın estetik, fonetik ve fonksiyon açısından test ettiği form taranarak kalıcı restorasyona aktarılır; böylece prova sırasında yapılan düzeltmeler kaybolmaz. Uzun açıklıklı zirkonya altyapılarda kalıcı üretimden önce uyum provası yapılması önerilir.

## Laminate Veneer, İnley/Onley ve Dijital Rehberli Kompozit

**Laminate veneer.** Veneer tedavisi, estetik analizden çıkan dijital mum modelajıyla başlar. Basılmış modelden hazırlanan kalıpla ağızda prova yapılır; hasta onay verdikten sonra preparasyon, provanın üzerinden derinlik frezleriyle yapılarak yalnız gereken miktarda aşındırma hedeflenir. Mum modelajından türetilen aşındırma rehberleri, mineyi koruyan kontrollü bir preparasyona yardımcı olur.

Veneer taramasında bitim çizgileri çoğunlukla dişeti seviyesinde ya da üzerindedir ve minede kalır; bu durum taramayı kolaylaştırır. İnce kenarlar frezeleme sırasında kırılmaya açık olduğundan malzemenin minimum kalınlık değerlerine uyulmalı ve kenarlar gerekirse laboratuvarda bitirilmelidir. Feldspatik, lösit ile güçlendirilmiş ya da lityum disilikat seramikler kullanılabilir; renk uyumu prova patlarıyla kontrol edilir ve simantasyon adeziv olarak yapılır.

**İnley ve onley restorasyonlar.** Kayıp tüberkül desteğinin gerektiği, ancak tam kronun gereğinden fazla diş dokusu kaldıracağı durumlarda parsiyel restorasyonlar tercih edilir. Tarihsel olarak ilk hasta başı CAD-CAM restorasyon da 1985'te yapılan seramik bir inleydi (Mörmann, 2006). CAD-CAM için preparasyonda hafif açılı duvarlar, yuvarlatılmış iç açılar, andırkat bulunmaması ve istmus bölgesinde yeterli kalınlık sağlanmalıdır.

Seramik inley ve onleylerde başarı büyük ölçüde adeziv simantasyona bağlıdır. Rubber dam ile izolasyon, malzemeye uygun yüzey işlemi ve diş tarafındaki adeziv protokolün eksiksiz uygulanması gerekir. Hasta başı frezeleme, bu restorasyonların tek seansta tamamlanmasına olanak tanır.

**Dijital rehberli direkt kompozit restorasyonlar.** Dijital mum modelajı yalnız dolaylı restorasyonlarda değil, direkt kompozitte de kullanılabilir. Mum modelajı içeren model basılır, bu modelden şeffaf silikon bir anahtar hazırlanır ve akışkan ya da ısıtılmış kompozit anahtardaki deliklerden enjekte edilip anahtarın içinden ışıkla sertleştirilir. Bu **enjeksiyon kalıplama** yaklaşımı; diastema kapatma, aşınmış dişlerin rehabilitasyonu ve dijital tasarımın ağza düşük invazivlikle aktarılması için kullanılır. Kompozitin aşınma ve renk değişimi açısından düzenli bakım ve cila gerektirdiği hastaya anlatılmalıdır.

Uygulama genel hatlarıyla şu sırayı izler:

- Tarama ve dijital mum modelajı
- Modelin basılması ve şeffaf silikon anahtarın hazırlanması
- Komşu dişlerin izolasyonu (örneğin teflon bant), asitleme ve bonding
- Kompozitin enjekte edilmesi ve anahtar yerindeyken polimerizasyon
- Fazlalıkların uzaklaştırılması, bitim, cila ve oklüzyon kontrolü

## Dijital Tam Protezler ve Tam Ark İmplant Destekli Protezler

**Dijital tam protezler.** Bilgisayar destekli tam protez üretimine ilişkin ilk yayın 1994 yılına aittir; 2013 tarihli sistematik derleme, o tarihte konuya ilişkin klinik çalışma ya da klinik rapor bulunmadığını, ABD'de iki ticari üreticinin bu protezleri üretmeye başladığını bildirmiştir (Bidra ve ark., 2013). O tarihten bu yana sistemler ve klinik yayınlar çoğalmış, dijital tam protez birçok merkezde rutin seçeneklerden biri olmuştur.

İş akışı genel olarak şu basamaklardan oluşur: dişsiz arkların kaydı (kenar şekillendirmeli konvansiyonel ölçünün taranması ya da ağız içi tarama), dikey boyut ve sentrik ilişkinin belirlenmesi, dudak desteği, orta hat ve oklüzal düzlem gibi estetik referansların kaydı, yazılımda diş dizimi, basılmış deneme protezi ile ağızda prova ve kalıcı protezin üretimi. Ağız içi tarayıcı, hareketli mukozayı ve fonksiyonel kenarları kaydetmede sınırlı kaldığından, birçok protokol ölçü aşamasında konvansiyonel yöntemlerle dijital yöntemleri birlikte kullanır.

Kalıcı protez kaidesi endüstriyel olarak polimerize edilmiş PMMA disklerden frezelenebilir ya da protez kaidesi reçinesiyle basılabilir; dişler frezelenebilir, basılabilir ya da hazır dişler kaideye yapıştırılabilir. Dijital protezin önemli avantajları, bazı protokollerde seans sayısının azalması ve dijital arşiv sayesinde kaybolan ya da kırılan protezin yeniden üretilebilmesidir. Kenar ve fonksiyonel ölçü gereksinimi, bireysel estetik karakterizasyon, öğrenme eğrisi ve maliyet ise göz önünde tutulması gereken sınırlardır.

**Tam ark implant destekli protezler.** İmplant konumları tarama gövdeleri, stereofotogrametri ya da doğrulanmış konvansiyonel ölçüyle kaydedilir. Protetik plan, hastanın mevcut protezinin ya da onaylanmış mum modelajının taramasından türetilir. Önce basılmış ya da frezelenmiş bir prototip ile estetik, fonetik, oklüzyon ve pasif uyum test edilir; ardından kalıcı altyapı titanyum, kobalt-krom ya da zirkonyadan frezelenir ve üzerine seramik, kompozit ya da akrilik diş uygulanır veya monolitik zirkonya tercih edilir.

Bu protezlerde **pasif uyum** kritik öneme sahiptir: çok sayıda implantı birleştiren bir altyapıda küçük konum hataları birikerek vida gevşemesi, kırıklar ya da biyolojik komplikasyonlarla sonuçlanabilir. Bu nedenle kalıcı üretim öncesinde doğrulama aparatı ya da prototip ile uyum kontrolü önerilir. Hijyen erişimi, vida giriş deliklerinin konumu ve bakım seansları planlamanın ayrılmaz parçasıdır. Rehberli cerrahi ve anında yükleme ile birlikte planlama, dizinin [implantoloji yazısında](/blog/implantolojide-dijital-planlama-ve-rehberli-cerrahi) ele alınıyor.

Tam ark protezlerin dijital dosyası, bakım ve olası onarım süreçlerinde de değer taşır: kırılan bir protez ya da yıpranan bir prototip aynı tasarımdan yeniden üretilebilir. Bu nedenle tasarım dosyalarının hasta kaydıyla ilişkilendirilerek güvenli biçimde arşivlenmesi önerilir.

## Protetik Tedavide Üç Boyutlu Baskı

**Basılmış reçine restorasyonlar.** Üç boyutlu baskı, protetik tedavide en çok geçici kron ve köprüler, uzun dönem geçici restorasyonlar ve deneme protezleri için kullanılır. Bazı üreticiler belirli seramik dolgulu reçineler için kalıcı kullanım endikasyonu belirtmektedir; ancak bu malzemelerle ilgili uzun dönem klinik veri henüz sınırlıdır. Basılmış restorasyonun mekanik özellikleri ve boyutsal doğruluğu; baskı yönüne, katman kalınlığına ve son işlem protokolüne bağlıdır (Revilla-León ve Özcan, 2019).

Diş hekimliğinde üç boyutlu baskının yerleşik kullanım alanları arasında modeller, cerrahi rehberler ve döküm için modelajlar bulunur (Dawood ve ark., 2015); protetik tedavide bunlara bireysel ölçü kaşıkları, oklüzal splintler, preparasyon ve aşındırma rehberleri ile pres seramik için yakılabilir modelajlar eklenebilir. Bu ürünlerin her biri için amaca uygun ve gerekiyorsa tıbbi cihaz olarak sunulmuş reçine seçilmelidir.

**Basılmış diş modelleri.** Modeller teşhis, hasta iletişimi, güdüklü çalışma ve implant analoglu çalışma modelleri olarak kullanılır. İmplant çalışmalarında dijital analoglar, basılmış modeldeki yuvalara yerleştirilerek implant konumunu fiziksel modele taşır. Tarama dosyasının modele dönüştürülmesi, diş hekimliğine özel model yazılımlarıyla otomatik olarak ya da genel amaçlı mesh yazılımlarıyla elle yapılabilir.

Elle model hazırlığında izlenen temel adımlar şunlardır:

- **İçe aktarma:** STL, PLY ya da OBJ dosyasının yazılıma alınması; birim ve yönelim kontrolü
- **Dosyanın işlenmesi:** modelin yazılımın eksenlerine göre konumlandırılması
- **Mesh temizliği:** tarama artefaktlarının, kopuk parçaların ve hatalı üçgenlerin silinmesi, küçük deliklerin kapatılması
- **Kenarın düzleştirilmesi:** düzensiz tarama sınırının kırpılması ve yumuşatılması
- **Taban oluşturma:** kenarın düz bir tabana doğru uzatılması
- **Katılaştırma:** yüzeyin kapalı (su geçirmez) bir katı modele dönüştürülmesi
- **İçini boşaltma:** reçine tasarrufu için belirli duvar kalınlığıyla oyulması ve drenaj delikleri açılması
- **Düzlem kesimi:** tabanın düz kesilerek yazıcı plakasına uygun hâle getirilmesi
- **Dışa aktarma:** son modelin STL olarak kaydedilip dilimleme yazılımına gönderilmesi

İçi boşaltılmış modellerde duvar kalınlığı çok ince seçilirse model son kürleme ve kullanım sırasında şekil değiştirebilir. Model üzerinde yapılacak işin hassasiyeti arttıkça (güdüklü çalışma, implant analoglu modeller) yazıcı, reçine ve son işlem seçimi de o ölçüde önem kazanır. Her modelin hasta adı ya da kodu ile etiketlenmesi, laboratuvar akışında karışıklıkları önler.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Ender A, Mehl A. Accuracy of complete-arch dental impressions: a new method of measuring trueness and precision. J Prosthet Dent. 2013;109(2):121–128.
- Joda T, Gallucci GO. The virtual patient in dental medicine. Clin Oral Implants Res. 2015;26(6):725–726.
- Coachman C, Calamita MA. Digital Smile Design: a tool for treatment planning and communication in esthetic dentistry. Quintessence Dent Technol. 2012;35:103–111.
- Mörmann WH. The evolution of the CEREC system. J Am Dent Assoc. 2006;137 Suppl:7S–13S.
- Bidra AS, Taylor TD, Agar JR. Computer-aided technology for fabricating complete dentures: systematic review of historical background, current status, and future perspectives. J Prosthet Dent. 2013;109(6):361–366.
- Dawood A, Marti Marti B, Sauret-Jackson V, Darwood A. 3D printing in dentistry. Br Dent J. 2015;219(11):521–529.
- Revilla-León M, Özcan M. Additive manufacturing technologies used for processing polymers: current status and potential application in prosthetic dentistry. J Prosthodont. 2019;28(2):146–158.
`,
};

export default yazi;
