import type { Metadata } from 'next';
import Link from 'next/link';
import YasalSayfa, { type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET } from '@/lib/sirket';

export const metadata: Metadata = {
  title: 'İptal ve İade Koşulları',
  description: 'Hekimhane-Pro üyeliği nasıl iptal edilir, hangi durumlarda iade yapılır ve iade ne kadar sürede hesabınıza geçer.',
  alternates: { canonical: `${SIRKET.site}/iptal-iade` },
};

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. İptal',
    icerik: [
      'Hekimhane-Pro üyeliğinizi **dilediğiniz an** iptal edebilirsiniz. Taahhüt, cayma bedeli ya da iptal ücreti yoktur.',
      [
        '**Panelden:** İşletme paneli → Hesabım → "Aboneliği Yönet · İptal". İptal anında işlenir.',
        '**Form ile:** hekimhane.com.tr/abonelik-iptali sayfasındaki iptal talep formu.',
        `**E-posta ile:** ${SIRKET.eposta}`,
      ],
      'İptalden sonra yeni dönem için ücret alınmaz. Pro özellikleri, ödemesini yaptığınız dönemin sonuna kadar açık kalır. Profiliniz silinmez; ücretsiz üyelik olarak yayında kalır.',
    ],
  },
  {
    baslik: '2. İade yapılan durumlar',
    icerik: [
      [
        '**Mükerrer tahsilat:** aynı dönem için birden fazla çekim yapıldıysa fazla tutar iade edilir.',
        '**İptalden sonra tahsilat:** iptal ettiğiniz hâlde yeni dönem ücreti çekildiyse tümüyle iade edilir.',
      ],
    ],
  },
  {
    baslik: '3. İade yapılmayan durumlar',
    icerik: [
      'Yukarıdaki durumların dışında, dönem ortasında yapılan iptallerde kalan günler için kısmi iade yapılmaz; üyelik dönem sonuna kadar kullanılabilir.',
    ],
  },
  {
    baslik: '4. İade süreci',
    icerik: [
      `İade talebinizi ${SIRKET.eposta} adresine, işletme adınızı ve ödeme tarihini belirterek iletin.`,
      'Onaylanan iadeler ödemenin yapıldığı karta gönderilir. Tutarın ekstrenize yansıması bankanıza bağlı olarak birkaç iş günü sürebilir.',
    ],
  },
];

export default function IptalIadePage() {
  return (
    <YasalSayfa
      baslik="İptal ve İade Koşulları" yol="/iptal-iade" bolumler={BOLUMLER}
      ozet="Pro üyeliğin iptali ve iade koşulları, kısa ve açık biçimde."
    >
      <div style={{ background: 'var(--tint-50)', border: '1px solid var(--tint-200)', borderRadius: 16, padding: '16px 22px', marginBottom: 14, fontSize: 14.5, color: 'var(--ink-secondary)' }}>
        Hemen iptal etmek mi istiyorsunuz? <Link href="/abonelik-iptali" style={{ color: 'var(--brand)', fontWeight: 700 }}>Abonelik iptali sayfasına gidin →</Link>
      </div>
    </YasalSayfa>
  );
}
