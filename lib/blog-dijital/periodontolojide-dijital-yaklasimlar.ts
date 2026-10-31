import type { DijitalKaynak } from './tip';

const yazi: DijitalKaynak = {
  slug: 'periodontolojide-dijital-yaklasimlar',
  sira: 5,
  title: 'Periodontolojide Dijital Yaklaşımlar ve Rehberli Cerrahi',
  summary:
    'Ağız içi tarama, KIBT ve dijital gülüş tasarımı periodontal cerrahiye nasıl taşınır? Kron boyu uzatma rehberleri, yumuşak doku grefti şablonları ve kanıtın bugünkü düzeyi.',
  created_at: '2026-10-31T14:25:00+03:00',
  cover_alt: 'Üst ön dişlerin üzerine oturan, dişeti kenarını altın çizgiyle işaretleyen şeffaf cerrahi rehberi ve altında kemik tepesi çizgisini gösteren şematik çizim',
  metin: `
Periodontoloji uzun süre dijital dönüşümün en az etkilediği alanlardan biri olarak görüldü: sondalama derinliği, ataşman kaybı ve kanama gibi temel bulgular hâlâ klinik muayeneyle elde ediliyor. Buna karşın dişeti ile kemiğin birlikte biçimlendirildiği cerrahilerde, özellikle de estetik bölgedeki kron boyu uzatmada, dijital planlama ve bilgisayar destekli üretilen cerrahi rehberler giderek daha sık kullanılıyor.

Bu yazı, periodontal tedavide dijital iş akışının hangi verilere dayandığını, kron boyu uzatma ve yumuşak doku grefti için rehberlerin nasıl planlandığını ve bu yaklaşımların bugün hangi kanıt düzeyinde durduğunu özetliyor. Ortak payda, protetik ya da estetik hedefin cerrahiden **önce** belirlenmesi ve o hedefin ameliyathaneye ölçülebilir bir şablonla taşınmasıdır.

## Periodontolojide Dijital İş Akışı

Dijital periodontal planlamanın üç temel veri kaynağı vardır. **Ağız içi tarama** dişlerin ve dişetinin yüzey geometrisini yüksek çözünürlükte kaydeder; **konik ışınlı bilgisayarlı tomografi** (KIBT) alveol kemiğini ve kök yapısını üç boyutlu gösterir; **klinik fotoğraf ve video** ise dudak hareketini, gülüş hattını ve dişeti görünümünü belgeler. Bu verilerin aynı koordinat sisteminde üst üste getirilmesi, literatürde *sanal hasta* olarak tanımlanan dijital modelin periodontal karşılığıdır (Joda ve Gallucci, 2015). Veri birleştirmenin teknik ayrıntıları [CAD yazısında](/blog/bilgisayar-destekli-tasarim-cad) anlatılıyor.

Burada önemli bir sınır vardır: ağız içi tarayıcı dişetinin yalnız dış yüzeyini görür, sondalama derinliğini ya da kemik tepesinin yerini göremez. KIBT ise yumuşak dokuyu sınırlı biçimde ayırt eder; dişeti kalınlığını değerlendirmek için bazı klinisyenler çekim sırasında dudak ve yanakları dişetinden uzaklaştıran ekartörler kullanır. Bu nedenle dijital kayıtlar periodontal muayenenin yerini almaz, onu tamamlar. Kemik tepesine olan uzaklık gibi kritik ölçümler cerrahi sırasında sondayla yeniden doğrulanmalıdır.

KIBT çekimi her hastada rutin değildir. Avrupa Komisyonu'nun kanıta dayalı kılavuzu, KIBT'nin yalnız klinik soruya yanıt verecek ve tedaviyi değiştirecekse istenmesini, görüntüleme alanının ve dozun gerekenle sınırlı tutulmasını önerir (European Commission, 2012). Periodontal planlamada bu, kemik ile dişeti ilişkisinin klinik muayene ve iki boyutlu radyografiyle yeterince anlaşılamadığı vakalar anlamına gelir.

Dijital kayıtların periodontolojideki bir başka kullanımı izlemdir. Farklı zamanlarda alınan taramalar üst üste getirildiğinde dişeti kenarındaki değişimler görsel olarak karşılaştırılabilir. Bu yöntem hasta iletişimi ve belgeleme için yararlıdır; ancak ölçüm doğruluğu tarayıcıya, tarama tekniğine ve hizalama yöntemine bağlıdır ve klinik sondalama verisinin yerine geçmez.

## Kron Boyu Uzatma için CAD-CAM Cerrahi Rehberler

Kron boyu uzatma iki ayrı amaçla yapılır. **Restoratif** amaçta, subgingival uzanan bir çürük ya da kırık için sağlam diş dokusu açığa çıkarılır ve restorasyon kenarı ile kemik arasında yeterli mesafe oluşturulur. **Estetik** amaçta ise gülüşte fazla dişeti görünümüne ya da kısa klinik kronlara yol açan durumlar, örneğin gecikmiş pasif sürme, düzeltilir. Her iki durumda da hedef, yeni dişeti kenarının ve kemik tepesinin önceden belirlenmiş bir konuma getirilmesidir.

Geleneksel yaklaşımda bu hedef, mum modelajdan elde edilen bir şablonla ya da cerrahın gözüyle aktarılır. Dijital yaklaşımda ise planlanan diş formu ve dişeti kenarı yazılımda belirlenir; hedef dişeti çizgisi dijital gülüş tasarımı ile hastanın yüz ve dudak ilişkisine göre kurulabilir (Coachman ve Calamita, 2012). Ardından bu çizgiyi ağza taşıyan, dişlere oturan bir rehber tasarlanır ve üretilir.

Liu ve ark. (2018), bu fikri **çift rehber** tekniğiyle tanımladılar: dişler, dişeti ve alveol kemiği taranıp hizalandıktan sonra biri dişeti kesisi (*gingivektomi*), diğeri kemik düzeltmesi (*alveolektomi*) için iki ayrı rehber tasarlanır. İlk rehber yeni dişeti kenarını belirler; ikinci rehber, kemik tepesinin planlanan kenardan ne kadar uzakta konumlanacağını gösterir. Böylece hem yumuşak doku hem de sert doku aynı dijital plana göre biçimlendirilir.

**Rehber üretiminin planlanması** birkaç adımda ilerler. Önce ağız içi tarama ve KIBT aynı yazılıma aktarılıp dişler üzerinden hizalanır. Ardından mevcut mine–sement sınırı, dişeti kenarı ve kemik tepesi her diş için incelenir; planlanan diş boyları ve dişeti zenitleri belirlenir. Kemik düzeltmesi planlanırken yeni dişeti kenarı ile kemik tepesi arasında, 2017 Dünya Çalıştayı sınıflandırmasında *supra-krestal doku ataşmanı* olarak adlandırılan yumuşak doku yapısına yer bırakılır; klinikte bu mesafe çoğunlukla yaklaşık 3 mm olarak ele alınır, ancak hastanın periodontal fenotipi ve sondalama bulgularıyla birlikte değerlendirilmelidir.

Tasarım tamamlandığında rehber, dişlere stabil oturacak genişlikte ve cerrahın aleti yönlendirebileceği kenar kalınlığında hazırlanır. Üretimde çoğunlukla biyouyumlu, rijit bir reçineyle üç boyutlu baskı kullanılır; baskı teknolojileri [CAM yazısında](/blog/bilgisayar-destekli-uretim-cam) anlatılıyor. Rehberin ağızda oturması ameliyattan önce denenmeli, temizlik ve sterilizasyon/dezenfeksiyon üretici talimatına göre yapılmalıdır.

## Görüntü Rehberliğinde Periodontal Cerrahi

Rehberli kron boyu uzatmada rehber, cerrahi sırasında bir **ölçü şablonu** gibi çalışır. Dişeti rehberi yerindeyken kesi çizgisi rehber kenarı boyunca işaretlenir ve gingivektomi yapılır. Ardından kemik rehberi yerleştirilir; kemik düzeltmesinin hangi seviyeye kadar yapılacağı rehber üzerinden kontrol edilir.

Kemik düzeltmesinin flep kaldırılarak mı yoksa flepsiz, mikrocerrahi aletlerle mi yapılacağı vakaya ve cerrahın tercihine bağlıdır. Rehber, karar verilmiş bir planı uygulamayı kolaylaştırır; cerrahi tekniğin seçimini ortadan kaldırmaz. Flepsiz yaklaşımda görüş alanı kısıtlı olduğundan kemik seviyesinin sondayla kontrolü daha da önem kazanır.

Rehberli cerrahinin başlıca kazancı **öngörülebilirlik ve iletişimdir**. Hasta ameliyattan önce planlanan sonucu bir dijital simülasyon ya da ağız içi deneme (*mock-up*) ile görebilir; protetik tedaviyi yapacak hekim ile cerrah aynı hedef üzerinde anlaşır. Çok dişin aynı anda düzenlendiği estetik vakalarda simetri ve zenit konumlarının tutarlılığı da rehberle daha kolay sağlanır.

Sınırlar da göz ardı edilmemelidir. Dijital zincirin her halkası, yani tarama, hizalama, tasarım, baskı ve rehberin ağıza oturması, küçük hatalar ekler. KIBT'de ince vestibül kemiği tam izlenemeyebilir; rehberin kenarı dişetine baskı yaparak okumayı yanıltabilir. Bu nedenle rehber bir yol göstericidir: kemik tepesine olan son uzaklık cerrahi alanda yeniden ölçülmeli, plan gerekiyorsa yerinde düzeltilmelidir.

## Yumuşak Doku Grefti için Cerrahi Rehber

Serbest dişeti grefti ve bağ dokusu grefti alınırken cerrahın iki sorusu vardır: alıcı bölge için ne büyüklükte bir greft gerekir ve damak bölgesinden bu greft güvenle nereden alınabilir? Dijital yaklaşımda alıcı bölgenin boyutları ağız içi tarama üzerinde ölçülebilir ve bu ölçüye uygun bir **şablon** tasarlanabilir. Şablon, damakta greftin sınırlarını işaretlemek için kullanılır.

Bu tür şablonların amacı, gereğinden büyük ya da küçük greft alınmasını önlemek, verici bölgedeki yarayı sınırlamak ve işlemi standartlaştırmaktır. Verici bölgenin planlanmasında damak mukozasının kalınlığı ve büyük palatinal damar–sinir paketinin yaklaşık konumu dikkate alınır; KIBT ve yumuşak doku taramaları bu değerlendirmeye yardımcı olabilir, ancak bu yapıların konumu klinik muayene ve anatomik bilgiyle birlikte yorumlanmalıdır.

Yumuşak doku grefti rehberleri bugün daha çok teknik notlar ve vaka raporlarıyla tanımlanmış bir uygulamadır. Klinik sonuçlar üzerindeki etkisi, örneğin greftin tutunması, kök örtülemesi ya da hasta konforu açısından, geleneksel yöntemle karşılaştırmalı çalışmalarla henüz yeterince ortaya konmamıştır. Bu nedenle rehber, deneyimli bir cerrahın elinde planı somutlaştıran bir yardımcı araç olarak görülmelidir.

## Araştırma Kanıtları: Bugün Ne Biliyoruz?

Periodontolojide dijital rehberlerin kanıt tabanı, implant cerrahisine kıyasla oldukça yenidir. Alanın temel yayınlarından biri olan Liu ve ark. (2018) çalışması bir **teknik rapordur**: yöntemi tek bir vaka üzerinden tanımlar ve yazarlar tekniğin öngörülebilirliğinin klinik çalışmalarla doğrulanması gerektiğini açıkça belirtir. Sonraki yıllarda dijital rehberli kron boyu uzatmayı geleneksel yöntemle karşılaştıran klinik çalışmalar da yapılmaya başlanmıştır; ancak hasta sayıları ve takip süreleri hâlâ sınırlıdır.

Bu tablo, dijital periodontal cerrahinin etkisiz olduğu anlamına gelmez; yalnızca üstünlüğünün güçlü kanıtlarla gösterilmediği anlamına gelir. Bugünkü yayınlar daha çok yöntemin uygulanabilirliğini, planla sonuç arasındaki uyumu ve kısa dönem dişeti kenarı stabilitesini ele alır. Uzun dönem dişeti kenarı konumu, hasta memnuniyeti ve maliyet–yarar dengesi gibi sonuçlar için daha fazla veri gerekir.

Klinik açıdan makul yaklaşım, dijital rehberi özellikle **çok dişli estetik vakalarda**, protetik tedaviyle birlikte planlanan kron boyu uzatmalarda ve ekip içi iletişimin kritik olduğu durumlarda düşünmektir. Tek dişlik, basit restoratif kron boyu uzatmada geleneksel yöntem çoğu zaman yeterlidir. Hangi yol seçilirse seçilsin, cerrahi kararı belirleyen yine periodontal tanı, periodontal fenotip ve hastanın beklentileridir.

Son olarak, dijital rehberin başarısı tek bir aşamaya değil, tüm zincirin kalitesine bağlıdır. Doğru endikasyon, kaliteli tarama ve görüntüleme, dikkatli hizalama, uygun malzeme seçimi ve ameliyat sırasında yerinde doğrulama birlikte sağlandığında dijital plan klinik sonuca güvenilir biçimde aktarılabilir. Bu yaklaşımın implant cerrahisindeki karşılığı [implantoloji yazısında](/blog/implantolojide-dijital-planlama-ve-rehberli-cerrahi) ele alınıyor.

## Kaynaklar

- Cortes ARG, editör. Digital Dentistry: A Step-by-Step Guide and Case Atlas. Wiley; 2022. (Bu dizinin konu başlıkları eserin bölüm yapısından esinlenmiştir.)
- Liu X, Yu J, Zhou J, Tan J. A digitally guided dual technique for both gingival and bone resection during crown lengthening surgery. J Prosthet Dent. 2018;119(3):345–349.
- Joda T, Gallucci GO. The virtual patient in dental medicine. Clin Oral Implants Res. 2015;26(6):725–726.
- Coachman C, Calamita MA. Digital Smile Design: a tool for treatment planning and communication in esthetic dentistry. Quintessence Dent Technol. 2012;35:103–111.
- European Commission. Radiation Protection No 172: Cone Beam CT for Dental and Maxillofacial Radiology. Evidence-Based Guidelines. Luxembourg: Publications Office of the European Union; 2012.
`,
};

export default yazi;
