import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'bilgisayar-destekli-tasarim-cad',
  sira: 2,
  title: 'Bilgisayar Destekli Tasarım (CAD): Dijital Görüntülemeden Sanal Hastaya',
  summary:
    'KIBT, ağız içi, masaüstü ve yüz tarayıcıları, klinik fotoğraf ve MRG ile veri elde etme; CAD yazılımları, DICOM, STL, PLY ve OBJ dosyaları ve verilerin sanal hastada birleştirilmesi.',
  created_at: '2026-10-31T14:40:00+03:00',
  cover_alt: 'Kesit katmanları hâlinde çizilmiş tomografi hacmi ile tel kafes ağ yüzey modelinin altın renkli hizalama çizgileriyle üst üste bindirildiği şema',
  metin: `
Bilgisayar destekli tasarım (CAD), dijital iş akışının "düşünme" aşamasıdır: restorasyon, cerrahi rehber, ortodontik aparey ya da protez, üretilmeden önce sanal ortamda tasarlanır. Ancak tasarımın kalitesi, ona temel olan verinin kalitesini aşamaz. Bu nedenle CAD'i anlamak, önce verinin nasıl elde edildiğini, hangi dosya biçimlerinde taşındığını ve farklı kaynaklardan gelen verilerin nasıl birleştirildiğini anlamakla başlar.

Bu yazıda diş hekimliğinde kullanılan başlıca dijital görüntüleme yöntemlerini, her birinin temel ilkesi ve uygulama adımlarının özüyle birlikte ele alıyor; ardından tasarım yazılımlarını, dosya türlerini ve "sanal hasta" kavramını özetliyoruz. Kavramların genel çerçevesi için dizinin [giriş yazısına](/blog/dijital-dis-hekimligine-giris), tasarımın üretime dönüştürülmesi için [bilgisayar destekli üretim yazısına](/blog/bilgisayar-destekli-uretim-cam) bakabilirsiniz.

## Konik Işınlı Bilgisayarlı Tomografi (KIBT)

**Temel bilgiler.** KIBT, koni biçimli bir X-ışını demetinin hastanın çevresinde tek bir dönüş yaptığı sırada çok sayıda iki boyutlu projeksiyon kaydedip bunlardan hacimsel bir veri seti oluşturduğu yöntemdir. Dental kullanım için geliştirilen ilk cihazlardan birinin sonuçları 1998'de yayımlanmıştır (Mozzo ve ark., 1998). Oluşan hacim voksellerden oluşur ve her düzlemde kesit alınabilir. Kemik, diş ve kanal gibi sert dokuların üç boyutlu değerlendirmesinde güçlüdür; buna karşılık yumuşak doku kontrastı sınırlıdır, metal restorasyonlar ve implantlar çizgi ve gölge artefaktlarına yol açar ve gri değerler tıbbi BT'deki Hounsfield birimleri gibi güvenilir bir yoğunluk ölçüsü olarak kullanılmamalıdır (European Commission, 2012).

**Uygulamanın özü.** KIBT, iyonlaştırıcı radyasyon içerdiği için her çekimin klinik gerekçesi olmalıdır; iki boyutlu görüntülemenin soruyu yanıtlayamadığı durumlarda tercih edilmesi ve dozun "makul olarak ulaşılabilecek en düşük" düzeyde tutulması temel ilkedir (European Commission, 2012). Uygulamada sıralama şöyledir: klinik soruyu tanımla → soruyu yanıtlayan en küçük görüntüleme alanını (*field of view*, FOV) ve uygun voksel boyutunu seç → metal takı ve hareketli protezleri çıkar → hastayı cihazın referans ışıklarıyla konumlandır ve tarama boyunca hareketsiz kalmasını sağla → yumuşak doku değerlendirilecekse dudak ve yanağı pamuk rulo ya da ayırıcıyla dişlerden uzaklaştır → görüntüyü kalite açısından kontrol et → veriyi DICOM biçiminde dışa aktar.

**Yorumlama sorumluluğu.** Çekilen hacmin yalnız ilgilenilen bölgesi değil, tamamı değerlendirilmeli ve raporlanmalıdır; görüntüleme alanına giren beklenmedik bulgular da hekimin sorumluluğundadır (European Commission, 2012). İmplant ve cerrahi planlamada kullanılacak KIBT verisinde kesit kalınlığı, artefaktlar ve hasta hareketi, planın güvenilirliğini doğrudan etkiler.

## Ağız İçi Tarayıcılar

**Temel bilgiler.** Ağız içi tarayıcılar, diş ve yumuşak doku yüzeyini optik olarak kaydeden el tipi cihazlardır. Üretici ve modele göre üçgenleme, konfokal görüntüleme gibi farklı optik ilkeler kullanılır; ortak nokta, saniyede çok sayıda görüntünün yazılım tarafından birleştirilerek bir nokta bulutuna, ardından mesh yüzeye dönüştürülmesidir. Çoğu güncel tarayıcı renkli yüzey kaydı da yapar; çıktı genellikle STL, PLY ya da üreticiye özgü bir biçimde alınır.

**Uygulamanın özü.** Taramadan önce cihazın üretici önerisine göre kalibre edildiği ve ucun uygun şekilde dezenfekte edildiği kontrol edilir. Alan kuru tutulmalı, tükürük ve kan kontrol edilmeli; preparasyon sınırları subgingival ise retraksiyon ipi ya da benzeri yöntemlerle sınır görünür hâle getirilmelidir. Tarama, üreticinin önerdiği stratejiye bağlı kalınarak (genellikle oklüzal yüzeyden başlayıp bukkal ve lingual yüzeylere geçen, kesintisiz bir yolla) yapılır. Ardından kapanışta bukkal kayıt alınır; tarama boşluk, bozulma ve sınır netliği açısından ekranda incelenir, eksik bölgeler tamamlanır.

**Doğruluk.** Ağız içi taramanın doğruluğu gerçeklik ve kesinlik olarak iki bileşenle değerlendirilir; tam ark ölçülerinde bu iki bileşenin yönteme ve cihaza göre farklılık gösterdiği ve karşılaştırmaların standart bir yöntemle yapılması gerektiği bildirilmiştir (Ender ve Mehl, 2013). Klinik pratikte uzun açıklıklı ve tam ark taramalarda görüntülerin art arda birleştirilmesinden kaynaklanan hata birikimi, yansıtıcı metal yüzeyler, hareketli mukoza ve dişsiz kretler zorluk yaratan başlıca durumlardır.

Kısa açıklıklı restorasyonlarda ve tek dişlerde ağız içi tarayıcı bugün rutin bir araçtır. Tam ark implant vakaları gibi zorlu durumlarda ise ek doğrulama yöntemleri (kontrol anahtarı, prova yapısı, alternatif kayıt teknikleri) planlamaya dahil edilmelidir.

## Masaüstü Tarayıcılar

**Temel bilgiler.** Laboratuvar ya da model tarayıcısı olarak da bilinen masaüstü tarayıcılar, alçı modelleri, ölçüleri, mum modelajları ve artikülatöre alınmış model çiftlerini kapalı bir hazne içinde tarar. Genellikle yapılandırılmış ışık ya da lazer projeksiyonu ve birden fazla kamerayla çalışırlar. Ortam ışığının, hareketin ve nemin kontrol altında olması, model taramasında tutarlı sonuç alınmasını kolaylaştırır.

**Uygulamanın özü.** Model temiz, kuru ve kabarcıksız olmalı; taşmalar ve keskin artıklar temizlenmelidir. Çok parlak ya da şeffaf yüzeylerde üreticinin önerdiği tarama spreyi gerekebilir. Model tablaya sabitlenir; önce ark, sonra güdükler (*die*) ayrı ayrı taranır ve yazılım bunları birleştirir. Kapanış ilişkisi, modellerin birlikte taranmasıyla ya da artikülatör aktarım sistemiyle kaydedilir. Tarama sonrasında kenar netliği, güdük sınırları ve kapanış kontrol edilir.

**Klinik yeri.** Masaüstü tarayıcı, analog ölçüyle çalışmaya devam eden kliniklerin laboratuvarla dijital çalışmasını sağlar, eski modellerin dijital arşive alınmasına olanak tanır ve mum modelajların tasarım yazılımına aktarılmasında kullanılır. Ölçünün doğrudan taranması da mümkündür; ancak derin ve dar bölgelerde ışığın ulaşamadığı alanlar eksik kalabilir.

## Yüz Tarayıcıları ve Mobil Uygulamalar

**Temel bilgiler.** Yüz tarayıcıları, yüzün üç boyutlu yüzey modelini renk ve dokusuyla birlikte kaydeder. Yapılandırılmış ışık, stereofotogrametri (birden çok kameradan eş zamanlı görüntüyle derinlik hesaplama) ve lazer tabanlı sistemler kullanılır. Bazı akıllı telefon ve tabletlerin derinlik sensörleriyle çalışan uygulamalar da yüz taraması üretebilir. Çıktı, renk ve doku bilgisini taşıyabildiği için genellikle OBJ ya da PLY biçimindedir.

**Uygulamanın özü.** Işık yüzü eşit aydınlatmalı, arka plan sade olmalıdır. Hasta doğal baş pozisyonunda konumlandırılır; dinlenme, geniş gülümseme ve gerekiyorsa dudak ayırıcı takılıyken olmak üzere farklı ifadeler ayrı ayrı kaydedilir. Ayırıcılı tarama ya da ağız içine yerleştirilen bir referans aparatı, yüz modelinin ağız içi taramayla hizalanmasını kolaylaştırır. Mobil uygulamalarda telefon, uygulamanın yönlendirmesine göre yüzün çevresinde sabit bir hızla hareket ettirilir.

**Sınırlılıklar.** Tarama sırasında mimik ya da baş hareketi, saç, sakal, gözlük ve parlak cilt yüzeyi modelde bozulmaya yol açabilir. Mobil cihazlarla elde edilen modellerin doğruluğu cihaza ve uygulamaya göre değişir; estetik değerlendirme ve hasta iletişimi için yararlı olsalar da milimetrik ölçüm gerektiren planlamada sonuçlar dikkatle yorumlanmalıdır.

## Klinik Fotoğraflar

Klinik fotoğraf, dijital iş akışının en eski ve hâlâ en değerli araçlarından biridir: başlangıç durumunu belgeler, estetik analizin temelini oluşturur, laboratuvarla renk ve biçim iletişimini sağlar ve hukuki kayıt işlevi görür. Standart bir dijital dental fotoğrafın amacı ve ideal bir ağız içi görüntünün özellikleri literatürde ayrıntılı biçimde tanımlanmıştır (Ahmad, 2009). Fotoğraf ve videoya dayalı gülüş tasarımı yaklaşımları da bu kayıtları planlama ve iletişim aracına dönüştürmüştür (Coachman ve Calamita, 2012).

**Uygulamanın özü.** Tekrarlanabilir sonuç için makro objektifli bir fotoğraf makinesi, uygun flaş düzeni (halka ya da çift flaş) ve her seferinde aynı ayarlar kullanılır. Temel seri; yüz (dinlenme ve gülümseme, önden ve yandan), dudaklar ve dişler, ağız içi önden ve yanlardan görünüm ile aynayla alınan oklüzal görünümleri içerir. Renk değerlendirmesi için gri kart ya da renk referansı, gerektiğinde çapraz polarizasyon filtresi kullanılabilir; renk anahtarı tabları fotoğrafa dişle aynı düzlemde dahil edilir.

**Kayıt ve gizlilik.** Mümkünse ham (RAW) biçimde çekim yapmak sonradan renk ve pozlama düzeltmesine olanak tanır; arşiv ve paylaşım için JPEG ya da TIFF gibi yaygın biçimler kullanılır. Fotoğraflar hasta kaydının parçasıdır: çekim ve özellikle eğitim ya da tanıtım amaçlı kullanım için hastanın yazılı onamı alınmalı, dosyalar kişisel sağlık verisi olarak korunmalıdır.

## Manyetik Rezonans Görüntüleme

**Temel bilgiler.** Manyetik rezonans görüntüleme (MRG), güçlü bir manyetik alan ve radyofrekans sinyalleriyle dokulardaki hidrojen çekirdeklerinin davranışından görüntü üretir; iyonlaştırıcı radyasyon içermez ve yumuşak doku kontrastı yüksektir. Temporomandibular eklem (TME) diskinin konumu ve yapısı, tükürük bezleri ve yumuşak doku lezyonlarının değerlendirilmesinde yerleşik bir yöntemdir. Son yıllarda diş ve çevre dokulara odaklanan "dental MRG" uygulamaları üzerine çalışmalar artmaktadır; ancak bu uygulamaların önemli bir kısmı hâlâ araştırma aşamasındadır (Flügge ve ark., 2023).

**Kaliteyi etkileyen faktörler.** Manyetik alan gücü, kullanılan alıcı sargının (*coil*) türü ve bölgeye yakınlığı, seçilen sekanslar (örneğin T1 ve T2 ağırlıklı görüntüler), çekim süresi ve bu süre boyunca hastanın hareketsiz kalabilmesi görüntü kalitesini belirler. Metal restorasyonlar, ortodontik apareyler ve bazı implant malzemeleri görüntüde bozulma ya da sinyal kaybı oluşturabilir. Kalp pili ve bazı implante elektronik cihazlar gibi durumlar MRG için kontrendikasyon ya da özel değerlendirme gerektirir; bu karar radyoloji ekibince verilir.

**Klinik ve dijital kullanım alanları.** MRG; yumuşak doku lezyonlarının sınırlarını ve iç yapısını, TME'de disk yer değiştirmesi ve eklem içi sıvı gibi bulguları, kemik iliğindeki değişiklikleri göstermede değerlidir. Araştırmalarda pulpa ve periapikal dokuların değerlendirilmesi, alt çene kanalının izlenmesi ve implant planlaması gibi radyasyonsuz dental uygulamalar incelenmektedir (Flügge ve ark., 2023). MRG verisi de DICOM biçimindedir; segmentasyonla üç boyutlu modele dönüştürülebilir ve diğer verilerle hizalanabilir. Ancak bu tür birleştirilmiş iş akışları henüz rutin klinik pratiğin parçası değildir.

## CAD'de Kullanılan Yazılımlar

**Dental olmayan, genel amaçlı yazılımlar.** Blender, MeshLab ve 3D Slicer gibi açık kaynak kodlu programlar mesh düzenleme, onarma, ölçüm, DICOM verisinden segmentasyon ve basit model hazırlığı için yaygın biçimde kullanılır. Meshmixer gibi bazı araçlar ücretsizdir ancak açık kaynak değildir. Bu yazılımlar esnek ve maliyetsizdir, fakat dental iş akışına özgü kütüphaneler ve otomasyonlar sunmazlar; öğrenme eğrileri de daha diktir.

**Ticari dental yazılımlar.** Restorasyon tasarımı, implant planlama ve rehber tasarımı, ortodontik kurulum ve protez tasarımı gibi modüller içeren ticari yazılımlar; diş ve implant kütüphaneleri, sanal artikülatör, malzemeye göre minimum kalınlık uyarıları ve üretim cihazlarıyla doğrudan bağlantı gibi işlevler sağlar. exocad, 3Shape ve inLab bu gruba verilebilecek örneklerdendir. Lisanslama satın alma, modül bazlı ya da abonelik şeklinde olabilir.

**Seçim ölçütleri.** Yazılım seçerken açık veri alışverişine (yaygın biçimlerde içe ve dışa aktarma) izin verip vermediği, mevcut tarayıcı ve üretim cihazlarıyla uyumu, güncelleme ve destek politikası ve kullanım amacına uygun yasal onay durumu sorgulanmalıdır. Genel amaçlı yazılımlar tıbbi cihaz olarak onaylı değildir; klinik karar ve cerrahi rehber tasarımı gibi işlerde bu yazılımlarla çalışıldığında sonucun doğrulanması tamamen kullanıcının sorumluluğundadır.

## Dosya Türleri

**DICOM.** *Digital Imaging and Communications in Medicine*, tıbbi görüntülerin saklanması ve iletilmesi için kullanılan uluslararası standarttır (NEMA). Bir DICOM dosyası görüntünün yanında hasta, cihaz, çekim tarihi, kesit kalınlığı ve piksel boyutu gibi üst verileri de taşır. KIBT ve MRG verileri bu biçimde dışa aktarılır; üçüncü taraflarla paylaşılırken kimlik bilgilerinin gerekmedikçe anonimleştirilmesi uygun olur.

**STL.** Standart mozaikleme dili ya da stereolitografi biçimi olarak bilinen STL, 1980'lerin sonunda stereolitografi için geliştirilmiştir. Yüzeyi yalnız üçgenlerin geometrisiyle tanımlar; renk, doku ya da ölçü birimi bilgisi taşımaz. Bu sadeliği nedeniyle hemen her tasarım ve üretim yazılımı tarafından okunur ve dijital diş hekimliğinde en yaygın değişim biçimidir. Birim bilgisi olmadığı için farklı yazılımlar arasında aktarımda ölçeğin (dental uygulamalarda genellikle milimetre) korunduğu kontrol edilmelidir.

**PLY ve OBJ.** Stanford Üniversitesi'nde geliştirilen PLY (*Polygon File Format*), geometrinin yanında köşe başına renk gibi ek özellikleri de taşıyabilir; renkli ağız içi taramalarda sık kullanılır. Wavefront tarafından geliştirilen OBJ biçimi ise geometriyi bir malzeme dosyası ve doku görüntüsüyle birlikte saklayabildiği için yüz taramalarında yaygındır. Renk bilgisinin korunması, estetik değerlendirme ve hasta iletişimi açısından önemlidir.

**Fotoğraf ve video dosyaları.** Klinik fotoğraflar JPEG, TIFF, PNG ya da ham (RAW) biçimlerde, videolar ise yaygın olarak MP4 gibi sıkıştırılmış biçimlerde saklanır. Video, konuşma ve gülme sırasında diş ve dudak ilişkisinin değerlendirildiği dinamik estetik analizde kullanılır. Üreticiye özgü kapalı biçimler veri taşınabilirliğini sınırlayabilir; arşivleme stratejisinde yaygın biçimlerde kopya tutmak uzun vadede güvence sağlar.

## Verilerin Birleştirilmesi: Sanal Hasta

Sanal hasta, ağız içi tarama, KIBT ve yüz taraması gibi farklı kaynaklardan elde edilen verilerin tek bir üç boyutlu veri havuzunda birleştirilmesidir. Bu yaklaşımın tedavi planlamasının simülasyonuna, hasta beklentisinin anlaşılmasına ve hasta ile meslektaşlarla daha etkili iletişime olanak tanıdığı vurgulanmıştır (Joda ve Gallucci, 2015).

Birleştirme, ortak referanslar üzerinden yapılan hizalamaya dayanır. KIBT hacmi ile ağız içi tarama genellikle diş yüzeyleri üzerinden, önce elle seçilen eş noktalarla kabaca, ardından yazılımın yüzey eşleştirmesiyle hassas biçimde hizalanır. Metal restorasyonların artefaktları bu eşleştirmeyi zorlaştırabilir; dişsiz ya da çok sayıda metal restorasyonu olan vakalarda radyoopak işaretleyiciler veya hastaya özel referans apareyleri kullanılır. Yüz taraması ile ağız içi tarama ise dudak ayırıcılı yüz taraması ya da ağız içi referans aparatı aracılığıyla eşleştirilir.

Her hizalama, kesitler ve yüzey üst üste bindirme görüntüleri üzerinde kontrol edilmelidir; küçük bir kayma, implant ya da rehber planlamasında klinik olarak anlamlı sapmaya dönüşebilir. Sanal hasta bir kez doğru kurulduğunda protetik tasarım, cerrahi planlama ve ortodontik simülasyon aynı veri üzerinde yapılabilir. Bu kullanımların ayrıntıları dizinin [protetik ve restoratif iş akışı](/blog/protetik-ve-restoratif-tedavilerde-dijital-is-akisi) ve [implant planlama](/blog/implantolojide-dijital-planlama-ve-rehberli-cerrahi) yazılarında ele alınıyor.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Mozzo P, Procacci C, Tacconi A, Martini PT, Andreis IA. A new volumetric CT machine for dental imaging based on the cone-beam technique: preliminary results. Eur Radiol. 1998;8(9):1558–1564.
- European Commission. Radiation Protection No 172: Cone Beam CT for Dental and Maxillofacial Radiology. Evidence-Based Guidelines. Luxembourg: Publications Office of the European Union; 2012.
- Ender A, Mehl A. Accuracy of complete-arch dental impressions: a new method of measuring trueness and precision. J Prosthet Dent. 2013;109(2):121–128.
- Ahmad I. Digital dental photography. Part 1: an overview. Br Dent J. 2009;206(8):403–407.
- Coachman C, Calamita MA. Digital Smile Design: a tool for treatment planning and communication in esthetic dentistry. Quintessence Dent Technol. 2012;35:103–111.
- Flügge T, Gross C, Ludwig U, ve ark. Dental MRI—only a future vision or standard of care? A literature review on current indications and applications of MRI in dentistry. Dentomaxillofac Radiol. 2023;52(4):20220333.
- NEMA. Digital Imaging and Communications in Medicine (DICOM) Standard. https://www.dicomstandard.org
- Joda T, Gallucci GO. The virtual patient in dental medicine. Clin Oral Implants Res. 2015;26(6):725–726.
`,
};

export default yazi;
