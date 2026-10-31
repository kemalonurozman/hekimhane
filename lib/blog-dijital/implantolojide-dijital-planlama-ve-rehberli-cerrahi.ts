import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'implantolojide-dijital-planlama-ve-rehberli-cerrahi',
  sira: 6,
  title: 'İmplantolojide Dijital Planlama ve Rehberli Cerrahi',
  summary:
    'Protetik yönlendirmeli planlama, çift tarama tekniği, statik rehberler, tam ark ve zigomatik implantlar, dinamik navigasyon ve kemik greftlerinde hacimsel planlama: kanıtlarıyla bir özet.',
  created_at: '2026-10-31T14:20:00+03:00',
  cover_alt: 'Alt çene kemiği kesitinde planlanan implant silueti, üzerinde metal kılıflı cerrahi rehber ve altın renkli sanal kron gösteren şematik çizim',
  metin: `
Dijital teknolojilerin klinik etkisinin en net görüldüğü alanlardan biri implant cerrahisidir. Üç boyutlu görüntüleme, ağız içi tarama ve planlama yazılımları bir araya geldiğinde implantın konumu, kemik hacmi ve gelecekteki restorasyon aynı ekranda değerlendirilebilir; bu plan statik bir cerrahi rehberle ya da gerçek zamanlı navigasyonla ameliyata taşınabilir.

Bu yazı, protetik yönlendirmeli planlama kavramından başlayarak statik rehberli cerrahinin iki ana iş akışını, tam ark ve zigomatik implant uygulamalarını, dinamik navigasyonu ve kemik greftlerinin hacimsel planlamasını özetliyor. Ayrıntıların büyük kısmı kullanılan yazılıma ve implant sistemine göre değişir; burada ortak ilkeler ve kanıtın genel tablosu ele alınıyor.

## Protetik Olarak Yönlendirilen Cerrahi Planlama

Protetik yönlendirmeli planlama, implantın konumunun önce mevcut kemiğe göre değil, **gelecekteki restorasyona** göre belirlenmesi ilkesidir. Önce ideal diş formu ve konumu tasarlanır, ardından bu restorasyonu en iyi destekleyecek implant konumu kemik ve yumuşak doku koşullarıyla birlikte aranır. Kemik yetersizse bu kez soru, implantı uygun olmayan bir yere yerleştirmek değil, kemiği planlanan konuma uygun hâle getirmenin yollarıdır.

Bu yaklaşımın dijital karşılığı, restorasyon tasarımının KIBT görüntüsüyle aynı ekranda görülmesidir. Ağız içi tarama ve sanal diş tasarımı, kemiği gösteren tomografi verisiyle hizalandığında implant ekseni, vida giriş kanalının konumu, çıkış profili ve komşu yapılara olan mesafeler birlikte değerlendirilebilir. Joda ve Gallucci'nin (2015) *sanal hasta* olarak tanımladığı bu veri birleşimi, protetik ve cerrahi kararların aynı model üzerinde verilmesini sağlar.

Planlama yalnız cerrahın işi değildir. Restorasyonu yapacak hekim, diş teknisyeni ve cerrah aynı plan üzerinde anlaştığında; vida tutuculu mu simante mi bir restorasyon yapılacağı, abutment seçimi ve geçici restorasyon stratejisi cerrahiden önce netleşir. Dijital plan, ekip içi iletişimi ve hastaya yapılan bilgilendirmeyi somutlaştırır.

Planlamanın ön koşulu, klinik soruya uygun bir görüntülemedir. Avrupa Komisyonu'nun KIBT kılavuzu, görüntülemenin gerekçelendirilmesini, görüntüleme alanının ilgili bölgeyle sınırlı tutulmasını ve dozun tanısal kaliteyi koruyacak en düşük düzeyde olmasını önerir (European Commission, 2012). İmplant planlamasında bu, çoğu vakada küçük ya da orta boy görüntüleme alanı anlamına gelir.

## Statik Görüntü Rehberliğinde İmplant Cerrahisi

Statik rehberli cerrahide dijital plan, hastanın ağzına oturan ve frezleri planlanan eksene yönlendiren bir rehberle aktarılır. Rehberler destek aldıkları yapıya göre **diş destekli**, **mukoza destekli** ya da **kemik destekli** olarak sınıflandırılır. Freze yönlendirmesi çoğunlukla rehbere yerleştirilmiş metal kılıflar (*sleeve*) ve implant sistemine özgü rehberli cerrahi setleriyle sağlanır.

**Çift KIBT tarama tekniği.** Özellikle dişsiz hastalarda kullanılan bu yöntemde hastanın mevcut protezi ya da ondan çoğaltılmış bir **radyografik (tomografik) rehber** üzerine radyoopak işaretler yerleştirilir. Önce hasta bu rehberi ağzındayken, sonra rehber tek başına taranır. Yazılım iki görüntüyü işaretler üzerinden hizalar; böylece protezin diş dizimi ve mukozaya oturan iç yüzü, kemikle birlikte görülür. Mukoza destekli cerrahi rehber de bu bilgiye göre tasarlanır.

**KIBT ve ağız içi taramanın birleştirilmesi.** Dişli ya da kısmi dişsiz hastalarda daha yaygın kullanılan yöntemde KIBT verisi (DICOM) ile ağız içi tarama ya da model taraması (çoğunlukla STL) yazılımda, diş yüzeyleri üzerinden hizalanır. Metal restorasyonlar KIBT'de saçılma artefaktı oluşturduğundan, hizalama noktalarının artefakttan etkilenmeyen dişlerden seçilmesi ve hizalamanın kesit kesit kontrol edilmesi gerekir. Dosya biçimleri ve hizalama ayrıntıları [CAD yazısında](/blog/bilgisayar-destekli-tasarim-cad) anlatılıyor.

**Sanal mumlama ve planlama yazılımı.** Eksik dişlerin yerine sanal diş tasarımı (*sanal mumlama*) eklenir; implant kütüphanesinden seçilen implant, bu tasarıma ve kemiğe göre konumlandırılır. Alt çene kanalı ve mental foramen gibi yapılar işaretlenir, implant ile bu yapılar ve komşu kökler arasındaki mesafe ölçülür. Plan onaylandığında yazılım, seçilen cerrahi sete uygun kılıf ölçüleriyle rehberi tasarlar; rehber genellikle üç boyutlu baskıyla üretilir.

Statik rehberli cerrahinin doğruluğu üzerine en çok başvurulan kaynaklardan biri Tahmaseb ve ark. (2018) sistematik derleme ve meta-analizidir. Yirmi klinik çalışmanın verisine göre planlanan ile uygulanan konum arasındaki ortalama sapma implant giriş noktasında yaklaşık **1,2 mm**, apekste yaklaşık **1,4 mm**, açısal olarak yaklaşık **3,5°** bulunmuştur. Kısmi dişsiz vakalarda doğruluk tam dişsiz vakalara göre anlamlı ölçüde daha iyidir. Yazarlar doğruluğu çoğu klinik durumda kabul edilebilir aralıkta değerlendirmiş, ancak planlamada **en az 2 mm güvenlik payı** bırakılmasını önermiştir.

Bu sapmanın kaynakları zincirin her halkasına dağılır: görüntüleme ve hizalama hatası, rehberin üretim toleransı, kılıf ile freze arasındaki boşluk, rehberin ağıza tam oturmaması ve mukoza destekli rehberlerde dokunun esnekliği. Ağız açıklığı sınırlı hastalarda arka bölgede rehber ve uzun frezlerin birlikte kullanılması güçleşebilir. Bu nedenle rehberin oturması cerrahiden önce kontrol edilmeli, kritik anatomik yapılara yakın planlarda güvenlik payından ödün verilmemelidir.

## Tam Ark Rehabilitasyonlarda Rehberli Cerrahi

Tam dişsiz bir çenede birden çok implantla sabit ya da hareketli protez planlanırken dijital rehberlik özellikle değerlidir. Kavram aynıdır: önce protez planlanır, implantlar bu protezi destekleyecek şekilde dağıtılır. Ancak burada dişler gibi sabit referanslar olmadığından rehberin konumlandırılması ve sabitlenmesi kendi başına bir planlama konusudur.

**Rehberli cerrahinin avantajları** tam arkta belirginleşir: implantların protetik açıdan uygun konumlara dağıtılması, uygun vakalarda flepsiz ya da sınırlı flepli cerrahi, planla uyumlu önceden hazırlanmış bir geçici protezle uygun vakalarda erken veya hemen yükleme seçeneği ve hastaya sonucun önceden gösterilebilmesi. Bununla birlikte Tahmaseb ve ark. (2018) bulgularının da gösterdiği gibi, tam dişsiz vakalarda doğruluk kısmi dişsizlere göre daha düşüktür; avantajlar ancak dikkatli bir iş akışıyla gerçekleşir.

**Ekip ve teknik gereksinimler.** Tam ark rehberli cerrahi; cerrah, protetik tedaviyi yapacak hekim ve diş teknisyeninin ortak çalışmasını gerektirir. Uygun bir protez ya da radyografik rehber, kaliteli KIBT, doğru hizalama, rehberin dengeli oturmasını sağlayan bir kapanış kaydı ve rehberi kemiğe sabitleyen sabitleme pinleri iş akışının temel parçalarıdır. Kemik düzeltmesi gerekecekse bazı sistemlerde önce kemik düzeltme rehberi, ardından bunun üzerine oturan implant rehberi kullanılır.

**Planlamadan ameliyata adımlar** genel hatlarıyla şöyledir:

- Mevcut protezin değerlendirilmesi; gerekiyorsa estetik ve fonksiyonel açıdan uygun yeni bir protez ya da radyografik rehber hazırlanması.
- KIBT çekimi (çift tarama ya da ağız içi/model taramasıyla birleştirme) ve verilerin yazılımda hizalanması.
- Protez dizimine göre implant sayısı, konumu ve açılarının planlanması; anatomik yapılara mesafelerin ölçülmesi.
- Rehberin, sabitleme pini konumlarının ve gerekiyorsa kemik düzeltme rehberinin tasarlanması ve üretimi; geçici protezin plana göre hazırlanması.
- Cerrahide rehberin kapanış kaydıyla konumlandırılması, sabitlenmesi, kılıflar üzerinden yuva hazırlığı ve implantların yerleştirilmesi.
- Uygunsa geçici protezin bağlanması, kapanışın kontrolü ve iyileşme sürecinin izlenmesi.

**Ek açıklamalar.** Rehber ağza oturmuyorsa ya da oturduğundan emin olunamıyorsa cerrahiye o rehberle devam edilmemelidir; ekip, gerekirse serbest el cerrahiye geçebilecek hazırlıkta olmalıdır. Hemen yükleme kararı yalnız rehberli cerrahi yapıldığı için değil, primer stabilite ve hasta koşulları uygun olduğu için verilir.

## Zigomatik İmplantlarda Dijital Planlama

Zigomatik implantlar, alveol kemiği ileri derecede rezorbe olmuş üst çenede zigoma kemiğinden destek alan uzun implantlardır. Brånemark ve ark. (2004), bu yaklaşımın tekniğini ve uzun dönem sonuçlarını bildirmiş ve yöntemi atrofik üst çenenin tedavisinde değerli bir seçenek olarak değerlendirmiştir.

Zigomatik implantın izlediği yol maksiller sinüs, orbita ve infratemporal fossa gibi kritik yapılara yakındır. Bu nedenle üç boyutlu görüntüleme ve sanal planlama burada özellikle önemlidir: implantın giriş noktası, zigomaya ulaşan ekseni, sinüse göre konumu (sinüs içinden ya da dışından geçişi) ve ağız içindeki çıkış noktası, gelecekteki protezle birlikte değerlendirilir.

Planın ameliyata aktarılmasında hastaya özgü rehberler ve navigasyon sistemleri kullanılabilmektedir; ancak implantın uzunluğu ve izlediği yolun karmaşıklığı nedeniyle bu uygulamalar, geleneksel implant rehberlerine göre daha sınırlı bir kanıta dayanır. Zigomatik implant cerrahisi, dijital planlamadan bağımsız olarak, bu alanda eğitim almış ve deneyimli bir cerrahi ekip gerektirir.

## Dinamik Rehberli İmplant Cerrahisi

Dinamik navigasyonda fiziksel bir rehber yerine optik izleme sistemi kullanılır. Hastanın çenesine ve cerrahi başlığa (*handpiece*) yerleştirilen işaretleyiciler kameralarca izlenir; frezin planlanan eksene göre konumu, açısı ve derinliği ekranda gerçek zamanlı gösterilir. Cerrah, ekrandaki göstergeyi izleyerek frezi plana göre yönlendirir.

**Cerrahi teknik** sistemden sisteme değişse de ortak adımlar vardır: planlama, hastaya izleme işaretleyicisinin sabitlenmesi, aletlerin kalibrasyonu, hastanın görüntü verisiyle kayıt (*registration*) eşlemesi, doğruluğun anatomik bir noktada kontrol edilmesi ve ardından yuva hazırlığı. Kayıt adımındaki hata tüm cerrahiye yansıyacağından bu doğrulama atlanmamalıdır.

Dinamik navigasyonun avantajları rehber üretimine gerek olmaması, plan ameliyat sırasında değiştirildiğinde yeni bir rehber gerekmemesi, irrigasyonun rehberle engellenmemesi ve ağız açıklığı sınırlı hastalarda kullanılabilmesidir. Dezavantajları ise ekipman maliyeti, kurulum süresi ve bir **öğrenme eğrisi** gerektirmesidir. Block ve ark. (2017), dinamik navigasyonla yerleştirilen implantların serbest el yöntemine göre plana daha yakın konumlandığını bildirmiştir.

## Kemik Grefti için Hacimsel Planlama

Dijital planlama, implantın yerleştirilebileceği hacmin yeterli olup olmadığını da ortaya koyar. Sanal implant protetik açıdan ideal konuma yerleştirildiğinde, kemiğin dışında kalan bölüm ya da gerekli kemik genişliği ile mevcut genişlik arasındaki fark, greft gereksinimini görünür kılar. Birçok planlama yazılımı bu farkı hacim olarak ölçmeye olanak tanır.

**Soket koruma.** Diş çekiminden sonra alveol kemiğinde boyutsal değişim beklenir. Çekim öncesi KIBT ve taramalar, vestibül kemik duvarının durumu ve soketin boyutları hakkında bilgi verir; bu bilgi soket koruma işleminin ve gelecekteki implant konumunun birlikte planlanmasına yardımcı olur. Çekim sonrası farklı zamanlarda alınan taramalar üst üste getirilerek doku değişimi izlenebilir.

**Sinüs tabanı yükseltme.** KIBT; kalan kemik yüksekliğini, sinüs tabanının şeklini, sinüs septumlarını, sinüs mukozasının durumunu ve lateral duvardaki damar kanalını gösterebilir. Lateral pencere tekniğinde pencerenin konumu ve boyutu bu bilgilere göre planlanabilir; gerekli greft hacmi yazılımda yaklaşık olarak hesaplanabilir. Sinüs patolojisi şüphesinde, cerrahiden önce ilgili hekimle değerlendirme yapılması gerekir.

**Onley blok greftler.** Yatay ya da dikey kemik eksikliğinde, blok greftin alıcı bölgede ne biçimde ve ne büyüklükte olması gerektiği dijital olarak planlanabilir; verici bölgenin hacmi de aynı görüntüler üzerinde değerlendirilebilir. Basılmış çene modelleri, greftin ve sabitleme vidalarının konumunu cerrahiden önce prova etmeyi kolaylaştırır. Hastaya özgü titanyum ağ gibi bilgisayar destekli tasarlanan çözümler de kullanılmaktadır; bu yöntemlerin seçimi kemik eksikliğinin tipine ve cerrahın deneyimine bağlıdır.

Hacimsel planlama, greft miktarını ve cerrahi yaklaşımı önceden öngörmeye yardımcı olur; ancak greftin iyileşme sürecindeki hacim kaybı, yumuşak doku kapanışı ve hasta faktörleri plana dahil edilemeyen değişkenlerdir. Bu nedenle sanal hesaplar bir başlangıç noktasıdır ve cerrahi sırasında klinik değerlendirmeyle tamamlanır. Rehberlerin ve modellerin üretim teknolojileri [CAM yazısında](/blog/bilgisayar-destekli-uretim-cam) ele alınıyor.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Tahmaseb A, Wu V, Wismeijer D, Coucke W, Evans C. The accuracy of static computer-aided implant surgery: a systematic review and meta-analysis. Clin Oral Implants Res. 2018;29(Suppl 16):416–435.
- Block MS, Emery RW, Cullum DR, Sheikh A. Implant placement is more accurate using dynamic navigation. J Oral Maxillofac Surg. 2017;75(7):1377–1386.
- Brånemark PI, Gröndahl K, Ohrnell LO, ve ark. Zygoma fixture in the management of advanced atrophy of the maxilla: technique and long-term results. Scand J Plast Reconstr Surg Hand Surg. 2004;38(2):70–85.
- Joda T, Gallucci GO. The virtual patient in dental medicine. Clin Oral Implants Res. 2015;26(6):725–726.
- European Commission. Radiation Protection No 172: Cone Beam CT for Dental and Maxillofacial Radiology. Evidence-Based Guidelines. Luxembourg: Publications Office of the European Union; 2012.
`,
};

export default yazi;
