// Popüler diş tedavileri — detaylı bilgi sayfaları (/tedavi-ucretleri/[slug]).
// İçerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Fiyat = TDB 2026 taban tarifesi (tarifeKod ile eşleşir).

export interface TedaviDetay {
  slug: string;
  ad: string;
  kategori: string;
  tarifeKod: string;          // lib/ucret-tarifesi-2026 içindeki ilgili işlem kodu (fiyat için)
  ozet: string;               // meta description / hero alt metin
  nedir: string;              // 1-2 paragraf
  neZaman: string[];          // ne zaman gerekir
  surec: { baslik: string; aciklama: string }[];
  sure: string;
  sonrasi: string[];
  sss: { soru: string; cevap: string }[];
  ilgili: string[];           // ilgili tedavi slug'ları
}

export const TEDAVI_DETAYLARI: TedaviDetay[] = [
  {
    slug: 'kanal-tedavisi',
    ad: 'Kanal Tedavisi',
    kategori: 'Endodonti',
    tarifeKod: '2-27',
    ozet: 'Dişin sinir ve damarını içeren pulpa iltihaplandığında dişi çekmeden kurtaran tedavi. 2026 taban fiyatları ve tüm merak edilenler.',
    nedir: 'Kanal tedavisi (endodonti), dişin içindeki iltihaplanmış veya ölmüş sinir-damar dokusunun (pulpa) temizlenip, kanalların doldurulmasıyla dişin ağızda tutulmasını sağlayan tedavidir. Derin çürük, kırık veya travma pulpaya ulaştığında uygulanır; amaç dişi çekmeden ağrıyı gidermek ve dişi işlevsel tutmaktır.',
    neZaman: [
      'Sıcak/soğuğa uzun süren, kendiliğinden gelen zonklayıcı diş ağrısı',
      'Derin çürüğün sinire ulaşması',
      'Dişte apse (iltihap kesesi) veya diş etinde şişlik',
      'Kırık/çatlak sonrası pulpanın açığa çıkması',
      'Dişin renginin kararması (sinir ölümü)',
    ],
    surec: [
      { baslik: 'Muayene ve röntgen', aciklama: 'Dişin durumu ve kanal sayısı periapikal/panoramik film ile değerlendirilir.' },
      { baslik: 'Uyuşturma', aciklama: 'Lokal anestezi ile bölge uyuşturulur; işlem ağrısızdır.' },
      { baslik: 'Kanalların temizlenmesi', aciklama: 'Pulpa çıkarılır, kanallar eğelerle şekillendirilip dezenfekte edilir.' },
      { baslik: 'Dolum', aciklama: 'Temizlenen kanallar özel bir dolgu maddesiyle (genellikle güta-perka) doldurulur.' },
      { baslik: 'Üst yapı', aciklama: 'Diş dolgu ya da çok madde kaybı varsa kron ile restore edilir.' },
    ],
    sure: 'Tek seansta ya da 1-3 seansta tamamlanabilir; her seans 30-60 dakika sürer.',
    sonrasi: [
      'İlk birkaç gün hafif hassasiyet normaldir, genelde ağrı kesiciyle geçer.',
      'Tedavi biten diş kırılgan olabilir; hekiminiz kron öneriyorsa yaptırın.',
      'Şiddetli/artan ağrı veya şişlikte hekiminize başvurun.',
    ],
    sss: [
      { soru: 'Kanal tedavisi ağrılı mıdır?', cevap: 'Lokal anestezi ile işlem sırasında ağrı hissedilmez. Sonrasında birkaç gün hafif hassasiyet olabilir.' },
      { soru: 'Kanal tedavili diş ne kadar dayanır?', cevap: 'Uygun restorasyon (özellikle kron) ve ağız bakımı ile diş uzun yıllar, çoğu zaman ömür boyu kullanılabilir.' },
      { soru: 'Kanal tedavisi mi, çekim mi?', cevap: 'Mümkünse doğal diş korunur; kanal tedavisi çekime göre çiğneme ve estetik açısından daha iyi bir seçenektir.' },
    ],
    ilgili: ['dis-dolgusu', 'zirkonyum-kron', 'dis-cekimi'],
  },
  {
    slug: 'dis-dolgusu',
    ad: 'Diş Dolgusu (Kompozit)',
    kategori: 'Restoratif Tedavi',
    tarifeKod: '2-4',
    ozet: 'Çürüyen dişin temizlenip diş rengiyle uyumlu kompozit malzemeyle doldurulması. 2026 taban fiyatları ve süreç.',
    nedir: 'Dolgu, çürükten etkilenen diş dokusunun temizlenip boşluğun uygun malzemeyle doldurulmasıdır. Günümüzde en sık diş rengindeki kompozit (beyaz) dolgu kullanılır; estetik ve dişe yapışarak sağlam bir restorasyon sağlar.',
    neZaman: [
      'Diş çürüğü',
      'Kırık veya aşınmış diş kenarları',
      'Eski/sızdıran dolgunun yenilenmesi',
      'Küçük estetik düzeltmeler (diş rengi dolgu)',
    ],
    surec: [
      { baslik: 'Muayene', aciklama: 'Çürüğün derinliği belirlenir; gerekirse röntgen çekilir.' },
      { baslik: 'Temizlik', aciklama: 'Çürük doku uzaklaştırılır, kavite hazırlanır.' },
      { baslik: 'Dolum', aciklama: 'Kompozit katmanlar halinde yerleştirilip ışıkla sertleştirilir.' },
      { baslik: 'Cila ve kontrol', aciklama: 'Kapanış (oklüzyon) ayarlanır, yüzey cilalanır.' },
    ],
    sure: 'Tek seans, dişe göre 20-45 dakika.',
    sonrasi: [
      'Kısa süre soğuk/sıcak hassasiyeti olabilir.',
      'Çok yüzlü büyük dolgularda hekiminiz inley/onley veya kron önerebilir.',
    ],
    sss: [
      { soru: 'Dolgu ne kadar dayanır?', cevap: 'Kompozit dolgular ağız bakımına bağlı olarak ortalama 5-10 yıl dayanır.' },
      { soru: 'Amalgam mı kompozit mi?', cevap: 'Kompozit diş rengindedir ve estetiktir; günümüzde ön ve arka dişlerde yaygın tercih edilir.' },
    ],
    ilgili: ['kanal-tedavisi', 'dis-tasi-temizligi', 'zirkonyum-kron'],
  },
  {
    slug: 'dis-implanti',
    ad: 'Diş İmplantı',
    kategori: 'Ağız-Diş ve Çene Cerrahisi',
    tarifeKod: '5-34',
    ozet: 'Eksik dişin yerine çeneye yerleştirilen titanyum vida ile kalıcı, doğala en yakın çözüm. 2026 taban fiyatları.',
    nedir: 'İmplant, kaybedilen dişin kökü yerine çene kemiğine yerleştirilen titanyum bir vidadır. Kemikle kaynaştıktan sonra üzerine kron, köprü veya protez yapılarak eksik diş(ler) tamamlanır. Komşu dişlere dokunmadan tek diş eksikliğinden tam dişsizliğe kadar uygulanabilir.',
    neZaman: [
      'Tek veya çok diş eksikliği',
      'Köprü için komşu dişlerin kesilmesini istememe',
      'Tam/bölümlü protez tutuculuğunu artırma',
      'Diş kaybına bağlı kemik erimesini yavaşlatma isteği',
    ],
    surec: [
      { baslik: 'Değerlendirme', aciklama: 'Kemik miktarı tomografi ile ölçülür, tedavi planlanır.' },
      { baslik: 'Cerrahi yerleştirme', aciklama: 'Lokal anestezi ile implant çeneye yerleştirilir.' },
      { baslik: 'İyileşme (osseointegrasyon)', aciklama: 'İmplantın kemikle kaynaması için genellikle 2-4 ay beklenir.' },
      { baslik: 'Üst yapı', aciklama: 'Kaynaşma tamamlanınca ölçü alınıp kron/köprü/protez yapılır.' },
    ],
    sure: 'Cerrahi işlem 30-60 dk; toplam süreç kemik durumuna göre 2-6 ay.',
    sonrasi: [
      'İlk günler hafif şişlik/hassasiyet olabilir; hekiminizin önerilerine uyun.',
      'İmplant çevresinin bakımı (fırça + arayüz fırçası) uzun ömür için kritiktir.',
    ],
    sss: [
      { soru: 'İmplant ağrılı mı?', cevap: 'Lokal anestezi ile işlem sırasında ağrı olmaz; sonrası genellikle basit ağrı kesiciyle rahatlar.' },
      { soru: 'İmplant ne kadar dayanır?', cevap: 'İyi bakımla implantlar 20 yıl ve üzeri, çoğu zaman ömür boyu kullanılabilir.' },
      { soru: 'Herkese implant yapılır mı?', cevap: 'Kemik miktarı ve genel sağlık uygunsa çoğu kişide yapılabilir; yetersiz kemikte greft gerekebilir.' },
    ],
    ilgili: ['zirkonyum-kron', 'dis-cekimi', 'tam-protez'],
  },
  {
    slug: 'dis-cekimi',
    ad: 'Diş Çekimi',
    kategori: 'Ağız-Diş ve Çene Cerrahisi',
    tarifeKod: '5-1',
    ozet: 'Kurtarılamayan dişin ağızdan alınması işlemi. Basit ve komplikasyonlu çekim 2026 taban fiyatları.',
    nedir: 'Diş çekimi, ileri çürük, kırık, ileri diş eti hastalığı veya ortodontik gereklilik nedeniyle kurtarılamayan bir dişin lokal anestezi altında ağızdan alınmasıdır. Mümkün olduğunda diş korunmaya çalışılır; çekim son seçenektir.',
    neZaman: [
      'İleri çürük veya kırık nedeniyle kurtarılamayan diş',
      'İleri diş eti hastalığıyla sallanan dişler',
      'Ortodonti için yer açma',
      'Gömülü veya sorun çıkaran 20 yaş dişleri',
    ],
    surec: [
      { baslik: 'Değerlendirme', aciklama: 'Röntgenle kök yapısı ve komşu dokular incelenir.' },
      { baslik: 'Uyuşturma', aciklama: 'Lokal anestezi uygulanır.' },
      { baslik: 'Çekim', aciklama: 'Diş özel aletlerle gevşetilip alınır; gerekirse dikiş atılır.' },
    ],
    sure: 'Basit çekim 10-20 dk; komplikasyonlu/cerrahi çekim daha uzun.',
    sonrasi: [
      'Gazlı bezi 30 dk ısırın, ilk gün sıcak/asitli gıdalardan kaçının.',
      'Pıhtıyı korumak için ilk 24 saat çalkalama ve sigaradan kaçının.',
      'Artan ağrı, kanama veya kötü kokuda hekiminize başvurun.',
    ],
    sss: [
      { soru: 'Çekim ağrılı mı?', cevap: 'Anestezi ile çekim sırasında ağrı hissedilmez; sonrasında basit ağrı kesici yeterlidir.' },
      { soru: 'Çekilen dişin yeri boş kalır mı?', cevap: 'Boşluğun implant, köprü veya protez ile tamamlanması önerilir; aksi halde komşu dişler kayabilir.' },
    ],
    ilgili: ['gomulu-dis-operasyonu', 'dis-implanti', 'kanal-tedavisi'],
  },
  {
    slug: 'gomulu-dis-operasyonu',
    ad: 'Gömülü Diş (20 Yaş) Operasyonu',
    kategori: 'Ağız-Diş ve Çene Cerrahisi',
    tarifeKod: '5-3',
    ozet: 'Çene kemiği veya diş eti içinde kalan gömülü dişin cerrahi çekimi. 20 yaş dişi 2026 taban fiyatları.',
    nedir: 'Gömülü diş operasyonu, tam sürememiş ve kemik/diş eti içinde kalmış dişin (çoğunlukla 20 yaş dişi) cerrahi olarak çıkarılmasıdır. Ağrı, enfeksiyon, kist veya komşu dişe baskı yapan gömülü dişlerde uygulanır.',
    neZaman: [
      'Tekrarlayan ağrı, şişlik ve enfeksiyon',
      'Komşu dişe baskı ve çürük riski',
      'Kist veya diş eti kapağı (perikoronit) sorunları',
      'Ortodontik nedenler',
    ],
    surec: [
      { baslik: 'Planlama', aciklama: 'Panoramik/tomografi ile dişin konumu ve sinire yakınlığı değerlendirilir.' },
      { baslik: 'Cerrahi çekim', aciklama: 'Lokal anestezi ile diş eti açılır, gerekirse kemik/dişte bölme yapılıp diş alınır.' },
      { baslik: 'Dikiş', aciklama: 'Bölge dikilir; genellikle 7-10 gün sonra dikişler alınır.' },
    ],
    sure: '20-45 dakika (dişin gömülülük derecesine göre).',
    sonrasi: [
      'İlk 2-3 gün şişlik ve hassasiyet olabilir; buz kompresi yardımcı olur.',
      'Hekiminizin verdiği ilaçları düzenli kullanın, sert/sıcak gıdadan kaçının.',
    ],
    sss: [
      { soru: 'Her 20 yaş dişi çekilmeli mi?', cevap: 'Hayır. Sorun çıkarmayan, düzgün süren dişler takip edilebilir; karar hekim değerlendirmesine bağlıdır.' },
      { soru: 'İyileşme ne kadar sürer?', cevap: 'İlk iyileşme birkaç gün, tam iyileşme birkaç haftadır.' },
    ],
    ilgili: ['dis-cekimi', 'dis-implanti', 'dis-eti-tedavisi'],
  },
  {
    slug: 'dis-beyazlatma',
    ad: 'Diş Beyazlatma (Ağartma)',
    kategori: 'Estetik Diş Hekimliği',
    tarifeKod: '2-47',
    ozet: 'Renklenmiş dişleri güvenli şekilde birkaç ton açan estetik işlem. Ofis ve ev tipi beyazlatma 2026 fiyatları.',
    nedir: 'Diş beyazlatma, diş minesindeki renklenmeleri özel jellerle (genellikle karbamid/hidrojen peroksit) açan estetik bir işlemdir. Klinikte (ofis tipi) tek seansta ya da hekim kontrolünde ev tipi plaklarla uygulanabilir.',
    neZaman: [
      'Çay, kahve, sigara vb. dış kaynaklı renklenmeler',
      'Yaşa bağlı sararma',
      'Özel günler öncesi estetik istek',
    ],
    surec: [
      { baslik: 'Ön hazırlık', aciklama: 'Diş taşı temizliği ve renk tespiti yapılır; uygunluk değerlendirilir.' },
      { baslik: 'Uygulama', aciklama: 'Diş etleri korunur, beyazlatma jeli uygulanır; ofis tipinde ışıkla aktive edilebilir.' },
      { baslik: 'Kontrol', aciklama: 'Sonuç değerlendirilir; ev tipi için plak ve jel verilir.' },
    ],
    sure: 'Ofis tipi 30-60 dk; ev tipi 1-2 hafta günlük uygulama.',
    sonrasi: [
      'İlk günler geçici hassasiyet olabilir.',
      'İlk 24-48 saat koyu renkli yiyecek/içeceklerden kaçının.',
      'Dolgu ve kaplamalar beyazlamaz; renk uyumu için hekiminize danışın.',
    ],
    sss: [
      { soru: 'Beyazlatma dişe zarar verir mi?', cevap: 'Hekim kontrolünde yapıldığında güvenlidir; geçici hassasiyet dışında kalıcı zarar beklenmez.' },
      { soru: 'Kalıcılığı ne kadar?', cevap: 'Beslenme ve alışkanlıklara göre 6 ay-2 yıl; periyodik tazeleme gerekebilir.' },
    ],
    ilgili: ['dis-tasi-temizligi', 'laminate-veneer', 'zirkonyum-kron'],
  },
  {
    slug: 'ortodonti-dis-teli',
    ad: 'Ortodonti (Diş Teli)',
    kategori: 'Ortodonti',
    tarifeKod: '7-11',
    ozet: 'Çapraşık ve düzensiz dişleri braket/tel ile düzelten tedavi. Sınıf I-II-III 2026 taban fiyatları.',
    nedir: 'Ortodontik tedavi, çapraşıklık, boşluk, kapanış bozukluğu gibi diş ve çene düzensizliklerini braket ve tellerle (ya da şeffaf plakla) düzelten tedavidir. Hem estetik hem de çiğneme ve ağız sağlığı için önemlidir.',
    neZaman: [
      'Çapraşık veya dönük dişler',
      'Dişler arası boşluklar (diastema)',
      'Alt-üst çene kapanış uyumsuzluğu',
      'Çiğneme ve konuşma güçlüğü yaratan düzensizlikler',
    ],
    surec: [
      { baslik: 'Analiz', aciklama: 'Film, fotoğraf ve model ile ayrıntılı planlama yapılır.' },
      { baslik: 'Braketleme', aciklama: 'Braketler dişlere yapıştırılır, tel takılır.' },
      { baslik: 'Periyodik kontrol', aciklama: '4-6 haftada bir tel ayarları yapılır.' },
      { baslik: 'Pekiştirme', aciklama: 'Tedavi sonrası sonucun korunması için pekiştirme aygıtı kullanılır.' },
    ],
    sure: 'Vakaya göre genellikle 12-30 ay.',
    sonrasi: [
      'Braketle ağız bakımı önemlidir; arayüz fırçası kullanın.',
      'Sert/yapışkan gıdalardan kaçının.',
      'Pekiştirme aygıtını hekiminizin dediği süre kullanın (nüksü önler).',
    ],
    sss: [
      { soru: 'Diş teli ağrı yapar mı?', cevap: 'İlk günlerde ve tel ayarlarından sonra birkaç gün hafif basınç/hassasiyet olabilir.' },
      { soru: 'Yetişkinlerde de olur mu?', cevap: 'Evet, ortodontik tedavinin yaş sınırı yoktur; diş ve diş eti sağlığı uygunsa her yaşta uygulanır.' },
    ],
    ilgili: ['seffaf-plak', 'dis-tasi-temizligi', 'zirkonyum-kron'],
  },
  {
    slug: 'seffaf-plak',
    ad: 'Şeffaf Plak ile Ortodonti',
    kategori: 'Ortodonti',
    tarifeKod: '7-63',
    ozet: 'Braket kullanmadan, çıkarılabilir şeffaf plaklarla diş düzeltme. Görünmez ortodonti 2026 fiyatları.',
    nedir: 'Şeffaf plak tedavisi, kişiye özel üretilen şeffaf, çıkarılabilir plaklarla dişleri kademeli olarak hizalayan modern bir ortodonti yöntemidir. Estetik olması ve yemek/temizlikte çıkarılabilmesi başlıca avantajlarıdır.',
    neZaman: [
      'Hafif-orta çapraşıklık ve boşluklar',
      'Braketi estetik nedenle istemeyenler',
      'Ağız bakımına düşkün, düzenli plak kullanabilecek kişiler',
    ],
    surec: [
      { baslik: 'Dijital tarama', aciklama: 'Ağız içi tarama ile tedavi dijital planlanır.' },
      { baslik: 'Plak serisi', aciklama: 'Her plak dişleri bir miktar hareket ettirir; genelde 1-2 haftada bir değiştirilir.' },
      { baslik: 'Kontrol', aciklama: 'Belirli aralıklarla ilerleme kontrol edilir.' },
    ],
    sure: 'Vakaya göre 6-24 ay.',
    sonrasi: [
      'Plakları günde ~20-22 saat takmak sonucu belirler.',
      'Tedavi sonrası pekiştirme gerekir.',
    ],
    sss: [
      { soru: 'Şeffaf plak braketten iyi mi?', cevap: 'Hafif-orta vakalarda konfor ve estetik sağlar; karmaşık vakalarda braket daha etkili olabilir. Hekiminiz karar verir.' },
      { soru: 'Plakla yemek yenir mi?', cevap: 'Yemek ve diş fırçalarken plak çıkarılır, sonra tekrar takılır.' },
    ],
    ilgili: ['ortodonti-dis-teli', 'dis-beyazlatma', 'laminate-veneer'],
  },
  {
    slug: 'zirkonyum-kron',
    ad: 'Zirkonyum Kron',
    kategori: 'Protez',
    tarifeKod: '4-51',
    ozet: 'Metal desteksiz, doğal görünümlü ve dayanıklı diş kaplaması. Zirkonyum kaplama 2026 taban fiyatı.',
    nedir: 'Zirkonyum kron, metal altyapı yerine beyaz zirkonyum kullanılan, ışık geçirgenliği doğal dişe yakın estetik bir kaplamadır. Aşırı madde kaybı, kanal tedavili diş, renklenme veya estetik amaçla tercih edilir.',
    neZaman: [
      'Aşırı madde kaybı olan veya kanal tedavili dişler',
      'Renklenmiş, şekli bozuk ön dişler',
      'Metal kaplamada diş eti kararması istenmeyen durumlar',
      'Köprü ve implant üstü estetik restorasyon',
    ],
    surec: [
      { baslik: 'Hazırlık', aciklama: 'Diş kaplama için uygun şekilde aşındırılır, ölçü alınır.' },
      { baslik: 'Geçici kron', aciklama: 'Kalıcı kron hazırlanana kadar geçici kron takılır.' },
      { baslik: 'Prova ve yapıştırma', aciklama: 'Renk-uyum kontrol edilir, kron simante edilir.' },
    ],
    sure: 'Genellikle 2-4 seans, birkaç gün-1 hafta.',
    sonrasi: [
      'Kısa süreli hassasiyet olabilir.',
      'Sert cisim ısırmaktan kaçının; düzenli bakım ömrünü uzatır.',
    ],
    sss: [
      { soru: 'Zirkonyum mu porselen mi?', cevap: 'Zirkonyum metal desteksiz ve daha estetiktir; arka dişlerde dayanıklılık için de tercih edilir.' },
      { soru: 'Ne kadar dayanır?', cevap: 'İyi bakımla 10-15 yıl ve üzeri kullanılabilir.' },
    ],
    ilgili: ['laminate-veneer', 'kanal-tedavisi', 'dis-implanti'],
  },
  {
    slug: 'laminate-veneer',
    ad: 'Laminate Veneer (Yaprak Porselen)',
    kategori: 'Estetik Diş Hekimliği',
    tarifeKod: '4-26',
    ozet: 'Dişin ön yüzüne yapıştırılan ince porselen yapraklarla gülüş tasarımı. 2026 taban fiyatları.',
    nedir: 'Laminate veneer, ön dişlerin yüzeyine yapıştırılan çok ince porselen (ya da kompozit) yapraklardır. Minimal aşındırmayla renk, şekil ve boşluk sorunlarını düzeltir; doğal ve estetik bir gülüş sağlar.',
    neZaman: [
      'Kalıcı renklenme (beyazlatmanın yetmediği)',
      'Dişler arası küçük boşluklar',
      'Kırık, aşınmış veya şekli bozuk ön dişler',
      'Gülüş tasarımı isteği',
    ],
    surec: [
      { baslik: 'Planlama', aciklama: 'Gülüş tasarımı ve prova (mock-up) yapılır.' },
      { baslik: 'Hazırlık ve ölçü', aciklama: 'Diş yüzeyi minimal aşındırılır, ölçü alınır.' },
      { baslik: 'Yapıştırma', aciklama: 'Hazırlanan veneerler dişlere yapıştırılır.' },
    ],
    sure: 'Genellikle 2-3 seans, 1-2 hafta.',
    sonrasi: [
      'Çok sert gıdaları ön dişlerle ısırmaktan kaçının.',
      'Düzenli fırçalama ve kontrol ömrünü uzatır.',
    ],
    sss: [
      { soru: 'Veneer için diş çok kesilir mi?', cevap: 'Hayır, laminate veneer minimal aşındırma gerektirir; bazı vakalarda hiç kesmeden de uygulanabilir.' },
      { soru: 'Doğal görünür mü?', cevap: 'Işık geçirgenliği doğal dişe yakındır; doğru planlamayla oldukça doğal sonuç verir.' },
    ],
    ilgili: ['dis-beyazlatma', 'zirkonyum-kron', 'ortodonti-dis-teli'],
  },
  {
    slug: 'dis-tasi-temizligi',
    ad: 'Diş Taşı Temizliği (Detartraj)',
    kategori: 'Periodontoloji',
    tarifeKod: '6-1',
    ozet: 'Diş eti hastalıklarını önleyen, diş taşı ve plağı temizleyen koruyucu işlem. 2026 taban fiyatları.',
    nedir: 'Detartraj, diş ve diş eti sınırında biriken plak ve diş taşının (kalkülüs) özel cihazlarla temizlenmesidir. Diş eti iltihabı, kanama ve kötü ağız kokusunu önlemede temel koruyucu işlemdir.',
    neZaman: [
      'Diş eti kanaması ve kızarıklık',
      'Diş taşı birikimi',
      'Ağız kokusu',
      'Rutin koruyucu bakım (6-12 ayda bir önerilir)',
    ],
    surec: [
      { baslik: 'Muayene', aciklama: 'Diş eti ve taş miktarı değerlendirilir.' },
      { baslik: 'Temizlik', aciklama: 'Ultrasonik cihaz ve el aletleriyle taş ve plak temizlenir.' },
      { baslik: 'Cila', aciklama: 'Diş yüzeyleri cilalanır; yeni taş birikimi zorlaşır.' },
    ],
    sure: 'Genellikle tek seans, 20-40 dk.',
    sonrasi: [
      'İlk günler hafif diş eti hassasiyeti/geçici hassasiyet olabilir.',
      'Günde iki kez fırçalama ve diş ipi ile birikimi önleyin.',
    ],
    sss: [
      { soru: 'Diş taşı temizliği dişe zarar verir mi?', cevap: 'Hayır; aksine diş eti sağlığını korur. Dişler arasının açıldığı hissi, taşın kapattığı boşluğun ortaya çıkmasıdır.' },
      { soru: 'Ne sıklıkla yaptırmalıyım?', cevap: 'Genellikle 6-12 ayda bir; diş eti durumuna göre hekiminiz sıklığı belirler.' },
    ],
    ilgili: ['dis-eti-tedavisi', 'dis-beyazlatma', 'dis-dolgusu'],
  },
  {
    slug: 'dis-eti-tedavisi',
    ad: 'Diş Eti Tedavisi (Periodontoloji)',
    kategori: 'Periodontoloji',
    tarifeKod: '6-6',
    ozet: 'Diş eti çekilmesi, kanama ve dişleri tutan dokunun kaybını durduran tedaviler. Flap ve küretaj 2026 fiyatları.',
    nedir: 'Diş eti (periodontal) tedavisi, dişleri destekleyen diş eti ve kemik dokusundaki iltihabı durdurmayı amaçlar. Yüzeyel küretajdan cerrahi flep operasyonuna kadar hastalığın derecesine göre farklı yöntemler uygulanır.',
    neZaman: [
      'Diş eti kanaması, kızarıklık ve şişlik',
      'Diş eti çekilmesi ve dişlerde uzama hissi',
      'Dişlerde sallanma',
      'Derin diş eti cepleri',
    ],
    surec: [
      { baslik: 'Değerlendirme', aciklama: 'Cep derinlikleri ölçülür, röntgenle kemik seviyesi incelenir.' },
      { baslik: 'Başlangıç tedavisi', aciklama: 'Detartraj ve kök yüzeyi düzleştirme (küretaj) yapılır.' },
      { baslik: 'Cerrahi (gerekirse)', aciklama: 'İlerlemiş vakalarda flep operasyonu ile derin temizlik yapılır.' },
    ],
    sure: 'Vakaya göre değişir; başlangıç tedavisi birkaç seans olabilir.',
    sonrasi: [
      'Titiz ağız bakımı tedavinin başarısını belirler.',
      'Düzenli kontrol ve idame temizlikleri önemlidir.',
    ],
    sss: [
      { soru: 'Diş eti çekilmesi geri gelir mi?', cevap: 'Çekilen diş eti kendiliğinden tam geri gelmez; ilerlemeyi durdurmak ve bazı vakalarda greftle düzeltmek mümkündür.' },
      { soru: 'Sallanan diş kurtarılır mı?', cevap: 'Erken evrede tedavi ve gerekirse splintleme ile birçok diş kurtarılabilir.' },
    ],
    ilgili: ['dis-tasi-temizligi', 'dis-cekimi', 'dis-implanti'],
  },
  {
    slug: 'tam-protez',
    ad: 'Tam Protez (Total Damak)',
    kategori: 'Protez',
    tarifeKod: '4-1',
    ozet: 'Tüm dişleri eksik hastalar için çıkarılabilir tam protez. 2026 taban fiyatları ve alternatifler.',
    nedir: 'Tam protez, bir çenedeki tüm dişleri eksik olan hastalarda çiğneme, konuşma ve estetiği yeniden sağlayan çıkarılabilir bir protezdir. İmplant destekli seçeneklerle tutuculuk önemli ölçüde artırılabilir.',
    neZaman: [
      'Bir çenede tüm dişlerin kaybı',
      'Mevcut protezin uyumsuz/eskimiş olması',
    ],
    surec: [
      { baslik: 'Ölçü ve planlama', aciklama: 'Çeneden ölçü alınır, kapanış ilişkileri belirlenir.' },
      { baslik: 'Prova', aciklama: 'Diş dizimi ve estetik provalarla ayarlanır.' },
      { baslik: 'Teslim ve uyum', aciklama: 'Protez teslim edilir; ilk günlerde küçük düzeltmeler yapılabilir.' },
    ],
    sure: 'Genellikle birkaç seans, 2-4 hafta.',
    sonrasi: [
      'İlk günler konuşma ve yemekte alışma süreci normaldir.',
      'Protezi günlük temizleyin; vuruk/yara olursa hekiminize başvurun.',
    ],
    sss: [
      { soru: 'Protez düşer mi?', cevap: 'İyi uyumlu protez tutunur; tutuculuk sorununda implant destekli protez çözüm olabilir.' },
      { soru: 'Ömrü ne kadar?', cevap: 'Ortalama 5-8 yıl; çene yapısı değiştikçe yenileme veya besleme gerekebilir.' },
    ],
    ilgili: ['dis-implanti', 'dis-cekimi', 'zirkonyum-kron'],
  },
  {
    slug: 'dis-muayenesi',
    ad: 'Diş Hekimi Muayenesi',
    kategori: 'Teşhis ve Planlama',
    tarifeKod: '1-1',
    ozet: 'Ağız-diş sağlığının değerlendirildiği, sorunların erken yakalandığı ilk adım. 2026 taban muayene ücreti.',
    nedir: 'Muayene, diş hekiminin ağız içini, dişleri ve diş etlerini kontrol ederek çürük, diş eti hastalığı ve diğer sorunları erken tespit ettiği ve tedavi planı çıkardığı temel adımdır. Gerektiğinde röntgenle desteklenir.',
    neZaman: [
      'Rutin kontrol (6 ayda bir önerilir)',
      'Diş ağrısı, hassasiyet veya diş eti kanaması',
      'Tedavi planı ve fiyat bilgisi almak',
    ],
    surec: [
      { baslik: 'Öykü', aciklama: 'Şikayet ve genel sağlık durumu sorgulanır.' },
      { baslik: 'Klinik muayene', aciklama: 'Dişler, diş etleri ve yumuşak dokular kontrol edilir.' },
      { baslik: 'Planlama', aciklama: 'Gerekirse röntgen çekilir, tedavi planı ve öncelikler belirlenir.' },
    ],
    sure: '15-30 dakika.',
    sonrasi: [
      'Tedavi gerekiyorsa öncelik sırasına göre randevu planlanır.',
      'Koruyucu öneriler (fırçalama, diş ipi, beslenme) verilir.',
    ],
    sss: [
      { soru: 'Ne sıklıkla muayene olmalıyım?', cevap: 'Genellikle 6 ayda bir; risk durumuna göre hekiminiz sıklığı ayarlar.' },
      { soru: 'Muayenede röntgen şart mı?', cevap: 'Her zaman değil; çürük veya kemik durumunu görmek gerektiğinde çekilir.' },
    ],
    ilgili: ['dis-tasi-temizligi', 'dis-dolgusu', 'kanal-tedavisi'],
  },
  {
    slug: 'cocuk-dis-tedavisi',
    ad: 'Çocuk Diş Tedavisi (Pedodonti)',
    kategori: 'Pedodonti',
    tarifeKod: '3-2',
    ozet: 'Süt ve daimi dişlerin korunması, çürük tedavisi ve fissür örtme. Çocuklara özel diş bakımı 2026 fiyatları.',
    nedir: 'Pedodonti, çocukların ağız-diş sağlığıyla ilgilenen alandır. Süt dişi çürüklerinin tedavisi, koruyucu uygulamalar (fissür örtücü, flor), yer tutucular ve çocuğa uygun yaklaşımla diş hekimi korkusunu azaltmayı içerir.',
    neZaman: [
      'İlk diş çıktıktan sonra ilk kontrol',
      'Süt dişi çürüğü ve ağrı',
      'Çürük riskini azaltmak için koruyucu uygulamalar',
      'Erken diş kaybında yer tutucu ihtiyacı',
    ],
    surec: [
      { baslik: 'Tanışma', aciklama: 'Çocuğun uyumu gözetilerek muayene yapılır.' },
      { baslik: 'Koruyucu uygulama', aciklama: 'Fissür örtücü ve flor ile çürük önlenir.' },
      { baslik: 'Tedavi', aciklama: 'Gerekirse dolgu, amputasyon/kanal veya yer tutucu uygulanır.' },
    ],
    sure: 'İşleme göre 15-40 dakika.',
    sonrasi: [
      'Şekerli gıdaların sınırlanması ve düzenli fırçalama önemlidir.',
      'Kontroller aksatılmamalıdır.',
    ],
    sss: [
      { soru: 'Süt dişi çürüğü tedavi edilmeli mi?', cevap: 'Evet; süt dişleri daimi dişlerin sağlığı ve yer korunması için önemlidir, tedavi edilmelidir.' },
      { soru: 'Fissür örtücü nedir?', cevap: 'Arka dişlerin çukurlarını kapatarak çürüğü önleyen, ağrısız koruyucu bir uygulamadır.' },
    ],
    ilgili: ['dis-muayenesi', 'dis-dolgusu', 'dis-tasi-temizligi'],
  },
];

export const TEDAVI_SLUGS = TEDAVI_DETAYLARI.map(t => t.slug);
export const tedaviBySlug = (slug: string) => TEDAVI_DETAYLARI.find(t => t.slug === slug) || null;
// tarifeKod → tedavi slug (fiyat listesinden detay sayfasına link için)
export const TEDAVI_BY_TARIFE_KOD: Record<string, string> = Object.fromEntries(TEDAVI_DETAYLARI.map(t => [t.tarifeKod, t.slug]));
