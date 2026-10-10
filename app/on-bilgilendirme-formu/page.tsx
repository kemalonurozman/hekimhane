import type { Metadata } from 'next';
import YasalSayfa, { KunyeKutusu, type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET, sirketKunyesi } from '@/lib/sirket';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu',
  description: 'Hekimhane-Pro üyeliğini satın almadan önce bilmeniz gerekenler: satıcı, hizmet, ücret, yenileme, iptal ve iade.',
  alternates: { canonical: `${SIRKET.site}/on-bilgilendirme-formu` },
};

const BOLUMLER: YasalBolum[] = [
  {
    baslik: 'Satın almadan önce bilmeniz gerekenler',
    icerik: [
      { tablo: {
        baslik: ['Konu', 'Bilgi'],
        satirlar: [
          ['Hizmet', 'Hekimhane-Pro üyeliği: profilde web sitesi ve sosyal medya bağlantıları, online randevu takvimi ve siteye eklenebilen randevu modülü, ikinci bildirim adresi, listelerde öncelikli sıralama, yapay zekâ asistanı bağlantısı.'],
          ['Ücret', `Aylık ${PRO_AYLIK_TL} TL. Ödeme sayfasında gösterilen tutar tahsil edilecek nihai tutardır.`],
          ['Ödeme', 'Stripe güvenli ödeme sayfası üzerinden kredi kartı veya banka kartı ile. Kart bilgileri Hekimhane\'ye ulaşmaz.'],
          ['Süre ve yenileme', 'Belirsiz süreli aboneliktir; siz iptal edene kadar her ay kendiliğinden yenilenir ve aynı karttan tahsil edilir.'],
          ['Başlangıç', 'Ödeme onaylanır onaylanmaz Pro özellikleri açılır.'],
          ['İptal', 'Dilediğiniz an, taahhüt ve cayma bedeli olmadan. Panel → Hesabım → "Aboneliği Yönet · İptal", iptal formu ya da e-posta ile. İptalden sonra dönem sonuna kadar kullanmaya devam edersiniz.'],
          ['İade', 'Hatalı veya mükerrer tahsilat tümüyle iade edilir. Dönem ortasında iptalde kalan günler için kısmi iade yapılmaz; üyelik dönem sonuna kadar kullanılabilir.'],
          ['Cayma hakkı', 'Hizmet mesleki faaliyet için satın alındığından tüketiciye özgü yasal cayma hakkı kural olarak uygulanmaz. Tüketici sayılan alıcıların yasal hakları saklıdır.'],
          ['Şikâyet ve başvuru', `${SIRKET.eposta} adresine yazabilirsiniz. Tüketici sıfatını taşıyanlar Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurabilir.`],
        ],
      } },
      'Ödemeyi tamamlayarak bu formu ve Mesafeli Satış Sözleşmesi\'ni okuyup kabul ettiğinizi beyan etmiş olursunuz. Her iki metnin güncel hâline bu sayfalardan her zaman ulaşabilirsiniz.',
    ],
  },
];

export default function OnBilgilendirmePage() {
  return (
    <YasalSayfa
      baslik="Ön Bilgilendirme Formu" yol="/on-bilgilendirme-formu" bolumler={BOLUMLER}
      ozet="Pro üyelik satın almadan önce sunulan zorunlu bilgiler, tek sayfada."
    >
      <KunyeKutusu baslik="Satıcı" satirlar={sirketKunyesi()} />
    </YasalSayfa>
  );
}
