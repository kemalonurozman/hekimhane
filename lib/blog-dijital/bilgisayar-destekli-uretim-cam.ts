import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'bilgisayar-destekli-uretim-cam',
  sira: 3,
  title: 'Bilgisayar Destekli Üretim (CAM): Üç Boyutlu Baskı ve Frezeleme',
  summary:
    'FDM, LCD, SLA ve DLP yazıcılar ile frezeleme cihazları nasıl çalışır? Dosya hazırlığı, dilimleme, son işlem, güvenlik ve bakım adımlarıyla diş hekimleri için CAM özeti.',
  created_at: '2026-10-31T14:35:00+03:00',
  cover_alt: 'Yapı plakasından sarkan, katman katman basılmış bir azı dişi kronu, altında ışık yayan reçine haznesi ve sağda seramik bloğu işleyen freze ucunu gösteren çizim',
  metin: `
Bilgisayar destekli tasarım (CAD) ekranda bir restorasyon, cerrahi rehber ya da model üretir; bu tasarımı elle tutulur bir nesneye dönüştüren aşama ise **bilgisayar destekli üretimdir** (*computer-aided manufacturing*, CAM). Diş hekimliğinde CAM iki ana yoldan ilerler: malzemeyi katman katman ekleyerek nesne oluşturan **eklemeli üretim** (üç boyutlu baskı) ve hazır bir bloktan ya da diskten malzeme kaldırarak şekil veren **eksiltmeli üretim** (frezeleme). Bu iki yol birbirinin rakibi değildir; çoğu klinik ve laboratuvarda birbirini tamamlar.

Bu yazıda FDM, LCD, SLA ve DLP yazıcıların çalışma ilkelerini, dosyanın yazıcıya hazırlanmasından son kürlemeye uzanan pratik adımları, güvenlik ve bakım konularını ve laboratuvar ile hasta başı frezelemenin temel noktalarını özetliyoruz. Tasarım tarafı için dizinin [bilgisayar destekli tasarım yazısına](/blog/bilgisayar-destekli-tasarim-cad) bakabilirsiniz.

## Eklemeli ve Eksiltmeli Üretim: Temel Ayrım

Eklemeli üretim süreçleri ISO/ASTM 52900 standardında yedi süreç ailesine ayrılır. Diş hekimliğinde en sık karşılaşılanlar, sıvı ışıkla sertleşen reçinenin bir haznede katman katman polimerize edildiği **hazne fotopolimerizasyonu** (SLA, DLP ve LCD yazıcılar), eritilmiş termoplastiğin bir nozülden yığıldığı **malzeme ekstrüzyonu** (FDM), damlacık hâlinde reçine püskürten **malzeme püskürtme** ve metal iskeletlerde kullanılan **toz yatağında ergitme** yöntemleridir (Dawood ve ark., 2015; Revilla-León ve Özcan, 2019).

Eklemeli üretimin en büyük avantajı geometrik özgürlüktür: iç boşluklu modeller, karmaşık cerrahi rehberler ya da tek bir baskıda onlarca parça üretilebilir ve malzeme israfı azdır. Buna karşılık katman çizgileri, yöne bağlı mekanik özellikler (anizotropi) ve sonucun büyük ölçüde son işleme bağlı olması bu yöntemin sınırlarıdır. Bir reçinenin kâğıt üzerindeki özellikleri ancak üreticinin öngördüğü yıkama ve son kürleme protokolü eksiksiz uygulandığında elde edilir.

Eksiltmeli üretimde ise endüstriyel koşullarda üretilmiş, homojen yapılı bloklar ya da diskler işlenir: zirkonya, cam seramikler, rezin matriksli seramikler, PMMA, mum ve metal alaşımları. Malzemenin özellikleri üretim sırasında değişmediği için mekanik davranış öngörülebilirdir. Sınırlar ise frezenin geometrisinden (en küçük uç çapı), malzeme kaybından ve uç aşınmasından gelir.

Hangi yolun seçileceği; endikasyona, malzemeye, gereken hassasiyete, üretim hacmine ve toplam maliyete göre değişir. Pratikte modeller, rehberler, splintler ve geçici restorasyonlar daha çok baskıyla; kalıcı seramik restorasyonlar daha çok frezelemeyle üretilir.

## Eriyik Yığma Modellemesi (FDM)

**Temel bilgiler.** FDM (*fused deposition modeling*) yazıcılarda makaraya sarılı termoplastik filament (örneğin PLA, PETG ya da ABS) ısıtılmış bir nozülden eritilerek geçirilir ve tabla üzerine çizgi çizgi, katman katman yığılır. 1980'lerin sonunda geliştirilen bu teknoloji, düşük cihaz ve malzeme maliyeti sayesinde masaüstü baskının en yaygın türü hâline gelmiştir.

Diş hekimliğinde FDM'nin yeri sınırlıdır. Çözünürlük ve yüzey kalitesi hazne fotopolimerizasyonuna göre belirgin biçimde düşüktür, katman çizgileri gözle görülür ve ağız içinde kullanım için uygun biyouyumlu seçenekler kısıtlıdır. Bu nedenle FDM daha çok hasta bilgilendirme ve eğitim modelleri, ön planlama modelleri ve klinik içi yardımcı aparatlar için tercih edilir.

**Kalibrasyon.** Baskı kalitesinin büyük kısmı ilk katmanda belirlenir. Tablanın tesviyesi (elle ya da otomatik), nozül ile tabla arasındaki mesafe, filament üreticisinin önerdiği nozül ve tabla sıcaklıkları ile ekstrüzyon akışının doğru ayarlanması gerekir. Basit bir kalibrasyon küpü basıp kumpasla ölçmek, cihazın boyutsal doğruluğu hakkında hızlı bir fikir verir.

**Baskı ve son işlem.** Dilimleme yazılımında katman yüksekliği, duvar sayısı, iç doluluk oranı ve destek yapıları belirlenir. Parça katmanlar arasında daha zayıf olduğundan yerleştirme yönü dayanıklılığı etkiler. Baskı sonrasında destekler uzaklaştırılır, gerekirse yüzey zımparalanır. Nem çeken filamentlerin kuru ve kapalı ortamda saklanması, baskı hatalarını önlemenin basit ama etkili bir yoludur.

## LCD Yazıcılar: Maskeli Stereolitografi

**Temel bilgiler.** LCD yazıcılarda (*masked stereolithography*, MSLA) haznenin altındaki UV LED ışık kaynağı, bir sıvı kristal ekranın üzerinden geçer. Ekran her katmanın görüntüsünü bir maske gibi oluşturur; ışık yalnız açık piksellerden geçerek o katmanın tamamını aynı anda sertleştirir. Yatay çözünürlüğü piksel boyutu, dikey çözünürlüğü katman kalınlığı belirler. LCD panel ve hazne tabanındaki şeffaf film zamanla yıpranan sarf parçalarıdır; ömürleri ekran tipine ve kullanım yoğunluğuna göre değişir.

**Dosyanın elde edilmesi.** CAD yazılımından STL, OBJ ya da 3MF biçiminde dışa aktarılan dosyanın kapalı (su geçirmez) bir yüzey olduğu, birimlerinin milimetre olarak doğru aktarıldığı ve hatalı üçgen içermediği kontrol edilir. Teşhis ve çalışma modellerinde reçine tasarrufu için modelin içi boşaltılabilir; bu durumda drenaj delikleri unutulmamalıdır.

**CAM yazılımı ayarları.** Dilimleme yazılımında kullanılan reçineye uygun profil seçilir: katman kalınlığı, normal katman ve ilk (taban) katman pozlama süreleri, kaldırma hızı gibi değerler. Tıbbi kullanıma yönelik reçinelerde üreticinin doğruladığı değerlerin dışına çıkılmaması gerekir. Açık sistem cihazlarda pozlama süresinin bir test baskısıyla doğrulanması, yetersiz ya da aşırı kürlenmeye bağlı ölçü hatalarını azaltır.

**Yerleştirme, destek ve dilimleme.** Parça, ayrılma kuvvetlerini azaltacak bir açıyla yerleştirilir. Destekler kron iç yüzeyi, bitim çizgisi ya da rehber kovanları gibi doğruluğu kritik yüzeylere değil, sonradan bitirilebilecek bölgelere konur. Dilimleme işlemi tasarımı yazıcının okuyacağı katman görüntülerine dönüştürür.

**Nesnenin basılması.** Baskıdan önce hazne filminin çizik ve bulanıklık açısından sağlam olduğu, reçinenin üreticinin önerdiği şekilde karıştırıldığı ve yeterli miktarda bulunduğu kontrol edilir. Reçinelerin akışkanlığı sıcaklıkla değiştiği için soğuk ortam baskı hatalarına yol açabilir; çalışma sırasında kapak kapalı tutulur.

**Yıkama ve son kürleme.** Baskı plakasından alınan parça, kürlenmemiş reçineden arındırılmak için izopropil alkol ya da üreticinin belirttiği solventle, belirtilen süre boyunca yıkanır ve kurutulur. Ardından üreticinin tanımladığı dalga boyu, süre ve sıcaklıkta son kürleme yapılır. Bu adım yalnız sertlik için değil, tıbbi cihaz reçinelerinde biyouyumluluk için de belirleyicidir; eksik ya da protokol dışı kürleme parçada artık monomer bırakabilir.

## Stereolitografi (SLA): Kurulumdan Bakıma

**Temel bilgiler.** Stereolitografi, 1980'lerin ortasında Charles Hull tarafından geliştirilip patentlenen ve eklemeli üretimin ilk ticari örneği sayılan teknolojidir. Lazer ışını, aynalar yardımıyla her katmanın kesitini reçine yüzeyinde nokta nokta çizer. Yüksek hassasiyet ve pürüzsüz yüzey sunar; ancak lazer her katmanı taradığı için baskı süresi, plakadaki parçaların toplam kesit alanıyla artar.

**Kurulum, tesviye ve kişisel koruyucu ekipman.** Yazıcı; düz, titreşimsiz, doğrudan güneş ışığı ve ısı kaynaklarından uzak, iyi havalandırılan bir alana yerleştirilir ve üreticinin talimatına göre tesviye edilir. Kürlenmemiş metakrilat reçineler ciltte tahrişe ve alerjik duyarlanmaya yol açabilir. Bu nedenle reçine ve solventle her temas nitril eldiven, göz koruması ve önlükle yapılmalı; kullanılan her ürünün **güvenlik bilgi formu** (SDS) okunmalı ve ekip bu konuda bilgilendirilmelidir.

**Hazne, yapı plakası ve reçine seçimi.** Reçine haznesi ve yapı plakası temiz ve hasarsız olarak yerine takılır. Diş hekimliğinde model, güdük (die), cerrahi rehber, oklüzal splint, geçici kron-köprü, protez kaidesi ve dişleri, döküm/yakma, dişeti maskesi ve indirekt bonding taşıyıcısı gibi amaca özel reçineler bulunur. Ağız içinde kullanılacak ürünlerde reçinenin ilgili endikasyon için tıbbi cihaz olarak sunulmuş olması gerekir. Reçine raf ömrü içinde, ışık geçirmeyen kapalı kabında ve önerilen sıcaklıkta saklanır; kartuş ya da şişe kullanılmadan önce üreticinin önerdiği şekilde karıştırılır.

**Baskı parametreleri ve işin yüklenmesi.** Katman kalınlığı, yerleştirme açısı ve destek yoğunluğu ön hazırlık yazılımında belirlenir; lazere ilişkin değerler genellikle seçilen reçine profiliyle birlikte gelir. İş yazıcıya gönderilmeden önce profildeki reçine ile haznedeki reçinenin aynı olduğu doğrulanır. Bu basit kontrol, en sık yaşanan ve en pahalı hatalardan birini önler.

**Plakanın çıkarılması ve kürlenmemiş reçinenin temizlenmesi.** Baskı bitince yapı plakası eldivenle çıkarılır, parçalar kendi spatulasıyla dikkatlice ayrılır. Yıkama çoğu zaman iki aşamalı yapılır: önce kirli, sonra temiz solvent banyosu. Üreticinin belirttiği süreden uzun bekletmek bazı reçinelerde yumuşama ya da çatlamaya neden olabileceğinden süreye uyulmalı, parça son kürlemeden önce tamamen kurutulmalıdır.

**Son kürleme.** Parça, reçine için tanımlanmış cihazda, belirtilen süre ve sıcaklıkta kürlenir; destekler malzemeye göre son kürlemeden önce ya da sonra uzaklaştırılır ve bitim işlemleri yapılır. Kişiye özel üretilen ürünlerde reçine parti numarası ve son işlem bilgilerinin kaydedilmesi, izlenebilirlik açısından iyi bir uygulamadır.

**Reçine filtrasyonu, atıklar ve önleyici bakım.** Başarısız bir baskıdan sonra haznede kalan sertleşmiş parçacıklar sonraki baskıyı ve hazne filmini bozabileceğinden reçine ince bir filtreden süzülür. Sıvı reçine ve reçine bulaşmış solvent lavaboya dökülmez; güvenlik bilgi formu ve yerel atık mevzuatı doğrultusunda tehlikeli atık olarak yönetilir. Bazı üreticiler küçük miktardaki artığın UV ile tamamen kürlendikten sonra katı atık olarak bertaraf edilmesini önerir. Optik pencerenin temizliği, hazne filminin düzenli kontrolü, yazılım güncellemeleri ve sarf parçalarının zamanında değişimi önleyici bakımın temelidir.

## Dijital Işık İşleme (DLP)

**Temel bilgiler.** DLP (*digital light processing*) yazıcılar ışık kaynağı olarak, Texas Instruments'ın geliştirdiği dijital mikro ayna aygıtını (DMD) kullanan bir projektörden yararlanır. Çok sayıda mikro ayna, her katmanın görüntüsünü reçine yüzeyine tek seferde yansıtır; bu yönüyle DLP, LCD yazıcılara benzer ve SLA'dan ayrılır.

Katmanın tamamı aynı anda pozlandığından katman süresi plakadaki parça sayısından büyük ölçüde bağımsızdır; dolu bir plakada bu durum belirgin hız avantajı sağlar. Yatay çözünürlük, projektör pikselinin yapı alanındaki boyutuyla belirlenir: aynı projektörle yapı alanı büyüdükçe piksel de büyür. Bu nedenle cihaz seçerken yapı alanı ile piksel boyutu birlikte değerlendirilmelidir.

**Adım adım.** İş akışı LCD yazıcılarla büyük ölçüde aynıdır: dosyanın kontrolü, reçineye uygun profilin seçilmesi, yerleştirme ve destek tasarımı, dilimleme, baskı, yıkama, kurutma ve son kürleme. Diş hekimliğine yönelik birçok DLP sistemi, belirli reçinelerle doğrulanmış protokoller sunan **kapalı** ya da yarı kapalı sistemlerdir; bu, esnekliği azaltırken tıbbi cihaz reçinelerinde sonucun tekrarlanabilirliğini artırır.

Üç hazne fotopolimerizasyonu teknolojisini kısaca karşılaştırmak gerekirse:

- **SLA:** lazer, katmanı nokta nokta çizer; hassas ve pürüzsüz, ancak dolu plakada daha yavaş.
- **DLP:** projektör, katmanı tek seferde pozlar; hızlı, çözünürlük projektöre ve yapı alanına bağlı.
- **LCD (MSLA):** LED ışığı LCD maskeden geçer; katman tek seferde pozlanır, maliyeti düşüktür, ekran ve film sarf parçasıdır.

## Frezeleme: Laboratuvarda ve Hasta Başında

**Temel bilgiler.** Frezeleme, bilgisayar kontrollü (CNC) bir cihazın döner kesici uçlarla bir blok ya da diskten malzeme kaldırarak tasarımı ortaya çıkarmasıdır. Cihazlar eksen sayısına göre ayrılır: üç eksenli sistemler basit geometrilerde yeterliyken, dört ve beş eksenli sistemler aşırı eğimli yüzeyleri, andırkatları ve açılı vida kanallarını işleyebilir. Cam seramikler ve rezin matriksli bloklar genellikle sulu (soğutmalı), zirkonya, PMMA ve mum ise genellikle kuru frezelenir; birçok cihaz her iki modu da destekler.

Malzemenin frezelendiği evre sonucu doğrudan etkiler. Ön sinterlenmiş zirkonya, sinterleme sırasında oluşacak yaklaşık yüzde 20–25'lik doğrusal büzülmeyi karşılayacak şekilde yazılım tarafından büyütülerek işlenir ve ardından fırında sinterlenir. Bazı lityum disilikat bloklar ara (ön kristalize) evrede frezelenir, ardından kristalizasyon fırınlaması gerektirir. Kobalt-krom ve titanyum gibi metaller ise sert hâlde ya da üreticiye göre ön sinterlenmiş formda işlenir.

Frezenin geometrisi tasarımın sınırlarını çizer. En küçük uç çapından daha dar iç köşeler birebir işlenemez; yazılım bu bölgeleri fazladan aşındırarak telafi eder ve bu durum uyumu etkileyebilir. Preparasyonlarda keskin iç açılardan kaçınılmasının bir nedeni de budur. Aşınmış uçlar kenar kırılmalarına ve uyum kaybına yol açtığından, üreticinin önerdiği kullanım sayısına göre değiştirilmelidir.

**Laboratuvar frezeleme.** Laboratuvar cihazları genellikle disklerle çalışır: CAM yazılımı birden çok restorasyonu diske yerleştirir (*nesting*), bağlantı çubuklarını konumlandırır ve kesme yollarını hesaplar. Uzun açıklıklı köprü altyapıları, tam ark iskeletler ve çok sayıda birimin tek seferde üretimi bu cihazların alanıdır. Sinterleme ve kristalizasyon fırınları, boyama ve glaze işlemleri laboratuvar iş akışının parçasıdır.

**Kalibrasyon ve test.** Frezeleme cihazı üreticinin öngördüğü aralıklarla, ayrıca bir çarpışma, uç kırılması ya da uyum sorunu fark edildiğinde, üreticiye ait kalibrasyon aparatı ve yazılımıyla kalibre edilir. Kalibrasyondan sonra bir test restorasyonunun frezelenip model üzerinde uyumunun kontrol edilmesi önerilir. Su haznesi ve soğutma sıvısının değişimi, filtrelerin temizliği ve kuru frezelemede emiş sisteminin çalışması düzenli bakımın parçasıdır; zirkonya tozuna karşı emiş ve uygun solunum koruması ihmal edilmemelidir.

**Hasta başı frezeleme.** Optik ölçü ve bilgisayarla restorasyon üretimi fikri 1970'lerde François Duret'nin çalışmalarıyla gündeme gelmiş (Duret ve ark., 1988), ilk hasta başı CAD-CAM restorasyon ise 1985'te Zürih Üniversitesi'nde Werner Mörmann ve Marco Brandestini tarafından CEREC sistemiyle yapılmıştır (Mörmann, 2006). Bugün tek seansta preparasyon, tarama, tasarım, bloğun frezelenmesi, gerekirse kristalizasyon ve glaze, prova ve adeziv simantasyon tamamlanabilir.

Hasta başı frezelemenin avantajları; geçici restorasyon ihtiyacının ve ikinci seansın ortadan kalkması, laboratuvar sürecinin hekimin denetiminde olmasıdır. Sınırları ise koltuk süresinin uzaması, blok seçeneklerinin ve monolitik restorasyonun estetik karakterizasyonunun kısıtlı olması, öğrenme eğrisi ve yatırım maliyetidir. Bu nedenle birçok klinik, tek kron, inley ve onley gibi işleri hasta başında, kapsamlı vakaları laboratuvarda üretmeyi tercih eder.

## Hangi Yöntem, Hangi Endikasyon?

Genel bir çerçeve çizmek gerekirse; teşhis ve çalışma modelleri, cerrahi rehberler, oklüzal splintler, ölçü kaşıkları ve geçici restorasyonlar hazne fotopolimerizasyonuyla verimli biçimde üretilir. Kalıcı seramik restorasyonlar ağırlıklı olarak frezelenir; metal altyapılar frezeleme ya da laboratuvarlarda toz yatağında lazerle ergitme yöntemleriyle elde edilir (Dawood ve ark., 2015).

Cihaz seçiminde yalnız fiyat değil; kullanılacak malzemelerin doğrulanmış iş akışları, üretim hacmi, ekipteki kişinin eğitimi, ayrılabilecek alan, havalandırma, atık yönetimi ve sarf giderleri birlikte değerlendirilmelidir. Az sayıda iş üreten bir klinik için üretimi laboratuvarla paylaşmak, cihaz satın almaktan daha akılcı olabilir.

Hangi yöntem seçilirse seçilsin, CAM'in çıktısı tasarımdan ve ölçüden daha iyi olamaz. Taramanın kalitesi, tasarım parametreleri ve üretim protokolü bir zincirin halkalarıdır; uyum sorunlarının kaynağını ararken bu üç halkanın hepsi gözden geçirilmelidir. Klinik uygulamalar için dizinin [protetik ve restoratif iş akışı yazısı](/blog/protetik-ve-restoratif-tedavilerde-dijital-is-akisi) bu üretim yöntemlerinin hangi restorasyonda nasıl kullanıldığını ele alıyor.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Dawood A, Marti Marti B, Sauret-Jackson V, Darwood A. 3D printing in dentistry. Br Dent J. 2015;219(11):521–529.
- Revilla-León M, Özcan M. Additive manufacturing technologies used for processing polymers: current status and potential application in prosthetic dentistry. J Prosthodont. 2019;28(2):146–158.
- Duret F, Blouin JL, Duret B. CAD-CAM in dentistry. J Am Dent Assoc. 1988;117:715–720.
- Mörmann WH. The evolution of the CEREC system. J Am Dent Assoc. 2006;137 Suppl:7S–13S.
`,
};

export default yazi;
