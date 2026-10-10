import type { Metadata } from 'next';
import YasalSayfa, { type YasalBolum } from '@/components/YasalSayfa';
import { CerezTercihBaglantisi } from '@/components/CerezOnay';
import { SIRKET } from '@/lib/sirket';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'Hekimhane hangi çerezleri ve benzeri kayıtları kullanır, neden kullanır ve tercihinizi nasıl değiştirirsiniz.',
  alternates: { canonical: `${SIRKET.site}/cerez` },
};

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. Kısaca',
    icerik: [
      'Hekimhane reklam çerezi kullanmaz ve sizi başka sitelerde izlemez. Sitenin çalışması için gereken kayıtlar her zaman açıktır. Ziyaret istatistikleri ise **yalnızca siz izin verirseniz** tutulur.',
      'Bu sayfa, tarayıcınıza kaydedilen çerezleri ve çerez benzeri kayıtları (tarayıcı yerel deposu) birlikte anlatır.',
    ],
  },
  {
    baslik: '2. Zorunlu kayıtlar',
    icerik: [
      'Bunlar olmadan site çalışmaz; bu nedenle onay gerektirmez ve kapatılamaz.',
      { tablo: {
        baslik: ['Kayıt', 'Tür', 'Amaç', 'Süre'],
        satirlar: [
          ['sb-…-auth-token', 'Çerez (birinci taraf)', 'Giriş yaptığınızda oturumunuzu açık tutar. Yalnızca giriş yapan işletme sahiplerinde oluşur.', 'Oturum süresince, en fazla 1 yıl'],
          ['hk_cerez_tercih', 'Yerel depo', 'Çerez tercihinizi hatırlar; size tekrar tekrar sorulmaz.', 'Siz silene kadar'],
          ['hk_panel_aktif, hk_panel_theme', 'Yerel depo', 'İşletme panelinde seçtiğiniz işletmeyi ve görünümü hatırlar.', 'Siz silene kadar'],
          ['Karşılaştırma listesi', 'Yerel depo', 'Karşılaştırmak için seçtiğiniz klinikleri sayfalar arasında taşır.', 'Siz silene kadar'],
        ],
      } },
    ],
  },
  {
    baslik: '3. İzninize bağlı: ziyaret istatistikleri',
    icerik: [
      'İzin verirseniz, hangi sayfaların ne kadar ziyaret edildiğini ve sayfaların ne kadar hızlı açıldığını ölçeriz. Bu ölçüm **çerez bırakmaz**, adınızı ya da e-postanızı içermez ve reklam amacıyla kullanılmaz.',
      { tablo: {
        baslik: ['Hizmet', 'Sağlayıcı', 'Ne toplar'],
        satirlar: [
          ['Vercel Web Analytics', 'Vercel Inc. (ABD)', 'Ziyaret edilen sayfa, yönlendiren site, tarayıcı ve cihaz türü, ülke. Ziyaretçi, günlük değişen anonim bir özetle sayılır.'],
          ['Vercel Speed Insights', 'Vercel Inc. (ABD)', 'Sayfa yüklenme ve tepki süreleri.'],
        ],
      } },
      'İzin vermezseniz bu iki hizmet tarayıcınıza hiç yüklenmez.',
    ],
  },
  {
    baslik: '4. Siz kullandığınızda çalışan hizmetler',
    icerik: [
      'Aşağıdaki hizmetler yalnızca ilgili özelliği kullandığınızda devreye girer ve kendi kayıtlarını oluşturabilir:',
      [
        '**Sohbet balonu (Ozvelo):** sayfadaki destek balonu. Yazışmayı sürdürebilmek için tarayıcınızın yerel deposunda bir kayıt tutar; yazdığınız mesajlar Ozvelo üzerinden bize ulaşır.',
        '**Google ile giriş:** işletme sahipleri Google hesabıyla giriş yapmayı seçerse Google kendi çerezlerini kullanır.',
        '**Ödeme (Stripe):** Pro üyelik ödemesi Stripe\'ın güvenli ödeme sayfasında yapılır; Stripe dolandırıcılığı önlemek için kendi çerezlerini kullanır. Kart bilgileriniz Hekimhane\'ye ulaşmaz.',
        '**Harita ve gömülü içerik:** profil sayfalarındaki Google Haritalar, video ve 360° tur içerikleri, açtığınızda ilgili sağlayıcıdan yüklenir.',
      ],
      'Ayrıca sitedeki ikonlar Cloudflare (cdnjs) üzerinden yüklenir; bu sırada IP adresiniz teknik olarak bu sağlayıcıya iletilir, çerez bırakılmaz.',
    ],
  },
  {
    baslik: '5. Tercihinizi değiştirme',
    icerik: [
      'Tercihinizi dilediğiniz an değiştirebilirsiniz: bu sayfanın başındaki **Çerez tercihleri** bağlantısını ya da sitenin en altındaki aynı bağlantıyı kullanın. İzni geri aldığınızda istatistik hizmetleri bir sonraki sayfa açılışında yüklenmez.',
      'Tarayıcınızın ayarlarından da çerezleri ve site verilerini silebilir ya da engelleyebilirsiniz. Zorunlu kayıtları engellerseniz giriş yapma gibi özellikler çalışmayabilir.',
    ],
  },
  {
    baslik: '6. İletişim',
    icerik: [
      `Çerezler ve kişisel verilerinizle ilgili sorularınız için: **${SIRKET.kvkkEposta}**. Kişisel verilerinizin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni'nde yer alır.`,
    ],
  },
];

export default function CerezPage() {
  return (
    <YasalSayfa
      baslik="Çerez Politikası" yol="/cerez" bolumler={BOLUMLER}
      ozet="Hangi kayıtları neden kullandığımızı ve tercihinizi nasıl değiştireceğinizi açıklar."
    >
      <div style={{ background: 'var(--tint-50)', border: '1px solid var(--tint-200)', borderRadius: 16, padding: '16px 22px', marginBottom: 14, fontSize: 14.5, color: 'var(--brand)', fontWeight: 600 }}>
        <CerezTercihBaglantisi style={{ textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 700 }} /> — izninizi buradan verebilir ya da geri alabilirsiniz.
      </div>
    </YasalSayfa>
  );
}
