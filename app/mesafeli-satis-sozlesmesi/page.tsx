import type { Metadata } from 'next';
import YasalSayfa, { KunyeKutusu, type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET, sirketKunyesi } from '@/lib/sirket';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi',
  description: 'Hekimhane-Pro üyeliğine ilişkin mesafeli satış sözleşmesi: taraflar, hizmetin kapsamı, ücret, yenileme, iptal ve iade koşulları.',
  alternates: { canonical: `${SIRKET.site}/mesafeli-satis-sozlesmesi` },
};

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. Taraflar',
    icerik: [
      `**Satıcı:** ${SIRKET.unvan} ("Hekimhane"). İletişim bilgileri yukarıdaki künyede yer alır.`,
      '**Alıcı:** Hekimhane üzerinde profilini sahiplenmiş ve Pro üyelik satın alan klinik, muayenehane, hekim veya diğer sağlık işletmesi. Alıcının kimlik ve iletişim bilgileri, üyelik sırasında kendisinin beyan ettiği bilgilerdir.',
    ],
  },
  {
    baslik: '2. Konu',
    icerik: [
      'Bu sözleşme, Alıcı\'nın hekimhane.com.tr üzerinden elektronik ortamda satın aldığı **Hekimhane-Pro** üyeliğinin kapsamını, ücretini ve tarafların hak ve yükümlülüklerini düzenler.',
    ],
  },
  {
    baslik: '3. Hizmetin kapsamı',
    icerik: [
      'Hekimhane-Pro, Alıcı\'nın Hekimhane profilinde ve işletme panelinde aşağıdaki ek özellikleri açan, aylık yenilenen bir dijital hizmet aboneliğidir:',
      [
        'Profilde web sitesi ve sosyal medya bağlantılarının gösterilmesi',
        'Saat seçmeli online randevu takvimi ve Alıcı\'nın kendi web sitesine eklenebilen randevu modülü',
        'Randevu bildirimleri için ikinci e-posta adresi',
        'Liste ve arama sonuçlarında Pro üyelere tanınan öncelikli sıralama',
        'Yapay zekâ asistanı bağlantısı (MCP) ile randevu ve yorum yönetimi',
      ],
      'Özelliklerin güncel listesi Pro sayfasında yer alır. Hekimhane, hizmeti geliştirmek amacıyla özelliklerde değişiklik yapabilir.',
      'Hekimhane bir **rehber ve yazılım hizmetidir**; sağlık hizmeti sunmaz, hasta ile hekim arasındaki tedavi ilişkisinin tarafı değildir ve Alıcı\'ya belirli sayıda hasta ya da randevu taahhüt etmez.',
    ],
  },
  {
    baslik: '4. Ücret ve ödeme',
    icerik: [
      `Üyelik ücreti **aylık ${PRO_AYLIK_TL} TL**'dir. Ödeme sayfasında gösterilen tutar, tahsil edilecek nihai tutardır; varsa vergiler ödeme adımında ayrıca belirtilir.`,
      'Ödeme, Stripe\'ın güvenli ödeme sayfası üzerinden kredi kartı veya banka kartı ile alınır. Kart bilgileri Hekimhane tarafından görülmez ve saklanmaz.',
      'Üyelik, Alıcı iptal edene kadar **her ay kendiliğinden yenilenir** ve yenileme tarihinde aynı karttan tahsil edilir. Ücrette değişiklik olursa Alıcı\'ya önceden e-posta ile bildirilir; Alıcı yeni ücret yürürlüğe girmeden üyeliğini iptal edebilir.',
    ],
  },
  {
    baslik: '5. Hizmetin başlaması',
    icerik: [
      'Pro özellikleri, ödemenin onaylanmasının hemen ardından Alıcı\'nın hesabında açılır. Alıcı, satın alma işlemini tamamlayarak hizmetin derhal başlamasını talep etmiş olur.',
    ],
  },
  {
    baslik: '6. İptal',
    icerik: [
      'Alıcı üyeliğini **dilediği an, taahhüt ve cayma bedeli olmadan** iptal edebilir. İptal yolları:',
      [
        'İşletme paneli → Hesabım → "Aboneliği Yönet · İptal"',
        'hekimhane.com.tr/abonelik-iptali sayfasındaki iptal talep formu',
        `${SIRKET.eposta} adresine e-posta`,
      ],
      'İptal edildiğinde yeni dönem için ücret alınmaz; Pro özellikleri, ödemesi yapılmış dönemin sonuna kadar açık kalır. Profil silinmez, ücretsiz üyelik olarak yayında kalmaya devam eder.',
    ],
  },
  {
    baslik: '7. Cayma hakkı ve iade',
    icerik: [
      'Hekimhane-Pro, klinik ve hekimlerin **mesleki faaliyetleri için** satın aldığı bir hizmettir. Mesleki veya ticari amaçla hareket eden alıcılar, 6502 sayılı Tüketicinin Korunması Hakkında Kanun anlamında tüketici sayılmadığından, bu Kanun\'daki 14 günlük cayma hakkı kural olarak uygulanmaz.',
      'İade koşulları şöyledir:',
      [
        '**Hatalı tahsilat:** mükerrer ya da iptalden sonra yapılan tahsilat, talep üzerine tümüyle iade edilir.',
        '**Dönem ortasında iptal:** dönem ortasında yapılan iptallerde kalan günler için kısmi iade yapılmaz; üyelik dönem sonuna kadar kullanılabilir.',
      ],
      'Yasal olarak tüketici sayılan alıcıların kanundan doğan hakları saklıdır. İadeler ödemenin yapıldığı karta gönderilir; tutarın hesaba yansıma süresi bankaya göre değişebilir.',
    ],
  },
  {
    baslik: '8. Alıcının yükümlülükleri',
    icerik: [
      [
        'Profilinde yayımladığı bilgilerin doğru, güncel ve kendi sorumluluğunda olduğunu,',
        'Profil içeriğinin ve Hekimhane üzerinden yaptığı tanıtımın, sağlık hizmetlerinde tanıtım ve bilgilendirmeye ilişkin mevzuata ve meslek kurallarına uygun olmasından kendisinin sorumlu olduğunu,',
        'Randevu talepleriyle kendisine ulaşan hasta bilgilerini yalnızca randevu amacıyla ve kişisel verilerin korunması mevzuatına uygun biçimde kullanacağını',
        'kabul eder.',
      ],
    ],
  },
  {
    baslik: '9. Uyuşmazlık',
    icerik: [
      'Bu sözleşmeden doğan uyuşmazlıklarda taraflar öncelikle iyi niyetle çözüm arar. Tüketici sıfatını taşıyan alıcılar, yasal parasal sınırlar içinde Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurabilir.',
      'Alıcı, ödemeyi tamamlamadan önce Ön Bilgilendirme Formu\'nu ve bu sözleşmeyi okuduğunu, elektronik ortamda onayladığını kabul eder.',
    ],
  },
];

export default function MesafeliSatisPage() {
  return (
    <YasalSayfa
      baslik="Mesafeli Satış Sözleşmesi" yol="/mesafeli-satis-sozlesmesi" bolumler={BOLUMLER}
      ozet="Hekimhane-Pro üyeliğini satın alırken taraflar arasında kurulan sözleşmenin tam metni."
    >
      <KunyeKutusu baslik="Satıcı" satirlar={sirketKunyesi()} />
    </YasalSayfa>
  );
}
