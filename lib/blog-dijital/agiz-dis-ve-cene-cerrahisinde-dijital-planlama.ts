import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'agiz-dis-ve-cene-cerrahisinde-dijital-planlama',
  sira: 7,
  title: 'Ağız, Diş ve Çene Cerrahisinde Dijital Planlama',
  summary:
    'Gömülü diş çekiminden ortognatik cerrahiye ve travmaya: sanal kafatası, segmentasyon, osteotomi tasarımı, cerrahi splintler, rehber türleri ve planla sonucun karşılaştırılması.',
  created_at: '2026-10-31T14:15:00+03:00',
  cover_alt: 'Yandan görülen kafatası ve alt çene modelinde altın kesik çizgilerle işaretlenmiş osteotomi hatları ve dişler arasına yerleşen şeffaf cerrahi splint çizimi',
  metin: `
Ağız, diş ve çene cerrahisi, üç boyutlu planlamanın diş hekimliğine en erken girdiği alanlardan biridir. Kemik yapıların karmaşık geometrisi, sinir ve damar gibi kritik yapıların yakınlığı ve cerrahinin yüz estetiğine doğrudan etkisi, ameliyat öncesi sanal provayı özellikle değerli kılar.

Bu yazı; gömülü dişlerin görüntü rehberliğinde çıkarılmasını, ortognatik cerrahinin sanal planlamasını adım adım, cerrahi splint tasarımını, planlanan ve elde edilen sonucun karşılaştırılmasını, cerrahi rehberlerin sınıflandırılmasını ve travma cerrahisinde sanal planlamayı özetliyor. Yazılımlar ve iş akışları merkezden merkeze değişir; burada ortak ilkeler ele alınıyor.

## Gömülü Dişlerin Görüntü Rehberliğinde Çıkarılması

Gömülü dişlerin çoğu iki boyutlu radyografiyle planlanabilir. Ancak dişin alt çene kanalı ya da komşu köklerle ilişkisi panoramik görüntüde belirsizse, ya da diş alışılmadık bir konumdaysa, KIBT üç boyutlu konumu netleştirir. Avrupa Komisyonu'nun kılavuzu bu kararın gerekçelendirilmesini, yani KIBT'nin yalnız iki boyutlu görüntülemenin yanıt veremediği bir soru varsa istenmesini önerir (European Commission, 2012).

Üç boyutlu görüntü, dişin vestibül mü palatinal/lingual mı yerleştiğini, kronun ve köklerin hangi yöne uzandığını ve kemik örtüsünün kalınlığını gösterir. Bu bilgi cerrahi yaklaşımın seçilmesine, kemik kaldırma alanının en aza indirilmesine ve sinir ya da komşu köklerle ilişkinin değerlendirilmesine yardımcı olur.

Derin yerleşimli ya da ektopik dişlerde, ve bazı odontoma vakalarında, KIBT üzerinde planlanan kemik penceresini ağza taşıyan diş destekli rehberler kullanılabilmektedir. Rehber, osteotominin yerini ve sınırlarını gösterir; amaç gereksiz kemik kaldırmayı önlemek ve komşu yapıları korumaktır. Bu uygulamalar bugün daha çok vaka raporları ve küçük serilerle tanımlanmıştır.

Rehber, cerrahın anatomi bilgisinin ve klinik değerlendirmesinin yerini almaz. Kemik penceresinin yeri doğru belirlense bile dişin çıkarılması sırasında kök biçimi, ankiloz ya da kemik yoğunluğu gibi faktörler cerrahi planı değiştirebilir; ekip buna hazırlıklı olmalıdır.

## Ortognatik Cerrahide Sanal Kafatasının Oluşturulması

Ortognatik cerrahinin sanal planlaması, hastanın kafa ve yüz yapısının üç boyutlu dijital bir kopyasının oluşturulmasıyla başlar. Swennen ve ark. (2009), bu süreci veri toplama, veri işleme, sanal tanı ve tedavi planlaması, hastayla iletişim, cerrahi splintin üretimi, cerrahi ve sonucun değerlendirilmesi aşamalarıyla tanımlamıştır. Sanal kafatası bu zincirin temelidir.

**Veri toplama.** Geniş görüntüleme alanlı bir BT ya da KIBT çekimi, planlanan kapanış ilişkisinde (çoğunlukla bir kapanış kaydıyla), yüz kasları gevşek ve baş mümkün olduğunca doğal pozisyondayken yapılır. Dişlerin ayrıntısı için ağız içi tarama ya da model taraması eklenir; bazı iş akışlarında yüzün yüzey taraması ya da fotoğrafları da kullanılır.

**Rekonstrüksiyon ve segmentasyon.** Tomografi verisinden yoğunluk eşiğine göre kemik yüzeyi üretilir; üst çene, alt çene ve kafatasının geri kalanı ayrı parçalar (*segment*) olarak ayrılır. **Koronal ve panoramik yeniden yapılandırılmış görüntüler**, alt çene kanalının seyrini, diş köklerinin konumunu ve kemik kalınlığını değerlendirmek için kullanılır; bu bilgi osteotomi hatlarının planlanmasında kritik önemdedir.

**Dental taramanın içe aktarılması ve mesh temizliği.** BT ve KIBT, dişlerin oklüzal yüzeylerini yeterli ayrıntıda göstermez; metal restorasyon ve braketler artefakt oluşturur. Bu nedenle diş taraması sanal kafatasına aktarılır, diş yüzeyleri üzerinden hizalanır ve tomografideki diş bölgesinin yerini alır. Taramadaki fazla bölümler kesilir, delikler kapatılır ve gereksiz üçgenler temizlenir; bu adıma *mesh temizliği* denir.

**Osteotomi tasarımı.** Planlanan cerrahiye göre, örneğin Le Fort I, bilateral sagital split ve genioplasti, kemik üzerinde sanal kesiler yapılır ve her kemik parçası bağımsız hareket ettirilebilecek hâle getirilir. Kesi hatları, kök uçlarına ve alt çene kanalına olan mesafe gözetilerek ayarlanır.

**Doğal baş pozisyonuna göre yönlendirme ve sefalometrik noktalar.** Sanal kafatası, hastanın doğal baş pozisyonuna ya da tanımlanmış referans düzlemlerine göre yönlendirilir; aksi hâlde simetri ve eğim değerlendirmeleri yanıltıcı olabilir. Ardından nasion, sella, A ve B noktası, pogonion, menton ve gonion gibi sefalometrik noktalar üç boyutlu olarak işaretlenir. Üç boyutlu sefalometri, iki boyutlu analizin alışılmış ölçümlerini yeni bir boyutla birlikte sunar; ancak noktaların üç boyutta tutarlı işaretlenmesi deneyim gerektirir.

## Sanal Planlama: Kemik Hareketleri

Kemik parçaları hazırlandıktan sonra cerrahi plan sanal olarak uygulanır. Üst çene ve alt çene ileri–geri, aşağı–yukarı ve sağa–sola hareket ettirilebilir; ayrıca üç eksen etrafında döndürülebilir. Hedef, planlanan kapanış ilişkisini sağlarken yüz orta hattını, kapanış düzlemini ve profil dengesini düzeltmektir.

Son kapanış ilişkisi çoğu iş akışında dişlerin birbirine göre ideal konumu belirlenerek kurulur; bu, el ile oturtulmuş modellerin taranmasıyla ya da yazılım içinde sanal kapanışla yapılabilir. Ardından alt çenenin yeni konumu bu kapanışa göre belirlenir ve iki çenenin birlikte hareketi değerlendirilir.

Sanal planlamanın önemli bir katkısı, bilateral sagital split sonrasında proksimal ve distal parçalar arasında oluşabilecek kemik çakışmalarını ve asimetrileri ameliyattan önce görünür kılmasıdır. Kemik temasları, boşluklar ve sabitleme plaklarının olası konumları önceden değerlendirilebilir.

Yumuşak doku simülasyonu da birçok yazılımda sunulur ve hasta iletişiminde yararlıdır. Ancak yumuşak dokunun kemik hareketine yanıtı bireyler arasında farklılık gösterir; simülasyon bir öngörüdür, kesin sonuç değildir. Hastaya gösterilen görüntülerin bu sınırla birlikte açıklanması gerekir.

## Cerrahi Splint (Atel) Oluşturma

Plan onaylandığında, ameliyatta çenelerin planlanan konuma getirilmesini sağlayan **cerrahi splintler** tasarlanır. Çift çene cerrahisinde genellikle bir **ara splint** (ilk hareket ettirilen çenenin diğer çeneye göre yeni konumunu belirleyen) ve bir **son splint** (son kapanış ilişkisini belirleyen) kullanılır. Hangi çenenin önce hareket ettirileceği cerrahın planına göre değişir.

Splint, iki diş arkının planlanan konumdaki taramaları arasında kalan boşluğu dolduran bir yapı olarak dijital ortamda tasarlanır ve çoğunlukla üç boyutlu baskıyla üretilir. Tasarım sırasında splint kalınlığı, kenar uzantısı ve gerekirse tel geçişleri için yuvalar ayarlanır. Baskı teknolojileri [CAM yazısında](/blog/bilgisayar-destekli-uretim-cam) anlatılıyor.

Bazı merkezlerde splint yerine ya da onunla birlikte, hastaya özgü kesi rehberleri ve önceden şekillendirilmiş ya da hastaya özel üretilmiş sabitleme plakları kullanılır. Bu yaklaşımda kemik parçasının konumu kapanıştan bağımsız olarak, plakların ve vida deliklerinin planlanan yerine göre belirlenir. Seçim; vakaya, merkezin olanaklarına ve maliyete göre yapılır.

## Planlanan ve Elde Edilen Sonucun Karşılaştırılması

Sanal planlamanın değeri, ancak planın ne ölçüde uygulandığı ölçülürse anlaşılır. Ameliyat sonrası tomografi, değişmeyen bir yapı (örneğin kafa tabanı) üzerinden ameliyat öncesi görüntüyle ve sanal planla hizalanır. Kemik parçalarının planlanan ve gerçekleşen konumları arasındaki fark milimetre ve derece olarak ölçülür ya da renkli sapma haritalarıyla gösterilir.

Alkhayer ve ark. (2020), ortognatik cerrahide sanal planlamanın doğruluğunu değerlendiren sistematik derlemelerinde, 2 mm ya da 2°'nin altındaki farkı kabul edilebilir doğruluk ölçütü olarak almış ve sanal planlamanın doğru ve tekrarlanabilir bir yöntem gibi göründüğünü bildirmiştir. Aynı yazarlar, doğruluğun net biçimde ortaya konması için daha fazla klinik çalışmaya ihtiyaç olduğunu da vurgulamıştır.

Bu karşılaştırma yalnız araştırma için değil, klinik öğrenme için de değerlidir. Sistematik sapmalar, örneğin belirli bir hareket yönünde tekrarlayan farklar, merkezin iş akışındaki bir adımın (kapanış kaydı, kondil konumu, splint üretimi ya da sabitleme tekniği) gözden geçirilmesi gerektiğini gösterebilir.

## Cerrahi Rehberler: Türler ve Sınıflandırma

Cerrahi rehberler farklı ölçütlere göre sınıflandırılabilir. **Destek aldıkları yapıya göre** diş destekli, mukoza destekli, kemik destekli ya da bunların birleşimi olan rehberler vardır. Destek ne kadar sabit ve tekrarlanabilir bir yüzeyse rehberin konumlandırılması o kadar güvenilirdir.

**İşlevlerine göre** rehberler şöyle gruplanabilir:

- Delme rehberleri: implant, mini vida ya da plak vidası yuvalarının yerini ve yönünü belirleyen, çoğunlukla kılıflı rehberler.
- Kesi (osteotomi) rehberleri: kemik kesisinin yerini, yönünü ve bazen derinliğini sınırlayan rehberler.
- Konumlandırma rehberleri: kemik parçasının yeni konuma getirilmesine yardımcı olan rehberler ve splintler.
- Rezeksiyon ve rekonstrüksiyon rehberleri: tümör cerrahisinde güvenli sınırla rezeksiyonu ve verici kemiğin (örneğin fibula) şekillendirilmesini yönlendiren rehberler.

**Yönlendirme biçimine göre** ise iki temel yaklaşım vardır: fiziksel bir rehberle yapılan **statik** yönlendirme ve optik izleme sistemleriyle yapılan **dinamik** yönlendirme (navigasyon). İmplant cerrahisindeki karşılıkları [implantoloji yazısında](/blog/implantolojide-dijital-planlama-ve-rehberli-cerrahi) ele alınıyor.

Hangi tür seçilirse seçilsin, rehberin doğruluğu tasarımın oturduğu yüzeyin kalitesine, üretim toleransına ve cerrahi sırasında rehberin doğru konumlandırılmasına bağlıdır. Rehberin ağızda ya da cerrahi alanda tam oturduğundan emin olunmadan kullanılmaması temel kuraldır.

## Travma Ameliyatlarının Sanal Planlaması

Yüz kırıklarında sanal planlama, kırık parçalarının sanal olarak yerine getirilmesine (*sanal redüksiyon*) ve gerekli sabitleme ya da rekonstrüksiyon materyalinin önceden hazırlanmasına olanak tanır. Özellikle orbita duvarları gibi ince ve karmaşık yapılarda üç boyutlu değerlendirme, hasarın boyutunu iki boyutlu kesitlere göre daha anlaşılır kılar.

Tek taraflı yaralanmalarda sık kullanılan bir yöntem **ayna görüntüleme**dir: sağlam tarafın orta hatta göre yansıması alınarak yaralı taraf için hedef anatomi oluşturulur. Bu hedef model basılarak sabitleme plakları ya da orbita ağları ameliyattan önce şekillendirilebilir; bazı vakalarda hastaya özgü implantlar tasarlanıp üretilir. Ameliyat sırasında navigasyon, yerleştirilen materyalin konumunu plana göre kontrol etmek için kullanılabilir.

Bu yöntemlerin sınırları da vardır. Ayna görüntüleme, yüzün doğal asimetrisini tam yansıtmayabilir; her iki tarafın etkilendiği yaralanmalarda kullanılamaz. Hastaya özgü implantların tasarım ve üretim süresi, acil girişim gerektiren durumlarla bağdaşmayabilir. Bu nedenle sanal planlama, travmada daha çok ertelenebilir rekonstrüksiyonlarda ve karmaşık kırıklarda öne çıkar.

Ortak payda, tüm bu iş akışlarının bir cerrahi ekip ve teknik destek gerektirmesidir. Dijital planlama, cerrahın kararını ve deneyimini somutlaştıran güçlü bir araçtır; ancak sonucu belirleyen yine doğru endikasyon, iyi kurgulanmış bir iş akışı ve ameliyat sırasında yerinde yapılan değerlendirmedir.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Swennen GRJ, Mollemans W, Schutyser F. Three-dimensional treatment planning of orthognathic surgery in the era of virtual imaging. J Oral Maxillofac Surg. 2009;67(10):2080–2092.
- Alkhayer A, Piffkó J, Lippold C, Segatto E. Accuracy of virtual planning in orthognathic surgery: a systematic review. Head Face Med. 2020;16:34.
- European Commission. Radiation Protection No 172: Cone Beam CT for Dental and Maxillofacial Radiology. Evidence-Based Guidelines. Luxembourg: Publications Office of the European Union; 2012.
`,
};

export default yazi;
