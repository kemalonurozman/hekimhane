import type { Metadata } from 'next';
import Link from 'next/link';
import YasalSayfa, { type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET } from '@/lib/sirket';
import { AYDINLATMA_YOL } from '@/lib/uyum';
import { YORUM_KURALLARI_YOL, YORUM_KURALLARI_GUNCELLEME, YORUM_KURALLARI_SURUM, YORUM_MIN_KARAKTER, GELISTIRME_NOKTALARI } from '@/lib/yorum-kurallari';

// Yorum Yayınlama Kuralları — yorum formlarındaki zorunlu onay kutusu bu sayfaya bağlanır.
// Metin değişince lib/yorum-kurallari.ts → YORUM_KURALLARI_SURUM + _GUNCELLEME güncellenmeli.
const URL_ = `https://www.hekimhane.com.tr${YORUM_KURALLARI_YOL}`;

export const metadata: Metadata = {
  title: 'Yorum Yayınlama Kuralları',
  description: 'Hekimhane\'de doktor, klinik, hastane ve eczaneler hakkında yazılan görüşlerin hangi kurallarla incelendiği, yayınlandığı ve kaldırıldığı.',
  alternates: { canonical: URL_ },
};

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. Amaç ve kapsam',
    icerik: [
      `Hekimhane, hastaların ve ziyaretçilerin sağlık kuruluşları ve sağlık profesyonelleriyle yaşadıkları deneyimi dürüst ve saygılı biçimde paylaşabildiği bir ortam sunmayı amaçlar. Bu kurallar; profillerdeki yorum formu, HekimKart üzerindeki yorum formu ve randevu sonrası gönderilen değerlendirme bağlantısı dahil, hekimhane.com.tr üzerinden gönderilen **tüm görüşler** için geçerlidir.`,
      'Yorum gönderirken bu kuralları okuduğunuzu ve kabul ettiğinizi onaylarsınız. Kabulünüz, gönderim zamanı ve kuralların o anki sürümüyle birlikte kaydedilir.',
    ],
  },
  {
    baslik: '2. Kimler görüş yazabilir',
    icerik: [
      [
        'Görüş, yalnızca ilgili doktor, klinik, hastane veya eczaneyle **bizzat yaşadığınız ya da yakınınız adına tanık olduğunuz** bir deneyime dayanmalıdır.',
        'İşletme sahipleri, çalışanları, aileleri veya onların yönlendirdiği kişiler kendi işletmeleri hakkında; rakip işletmeler ve temsilcileri ise rakipleri hakkında görüş yazamaz.',
        'Para, indirim, hediye veya başka bir menfaat karşılığında yazılan ya da yazdırılan görüşler yayınlanmaz.',
        'Aynı deneyim için birden fazla görüş gönderilmemelidir; farklı adlar veya e-posta adresleriyle tekrar eden görüşler birlikte değerlendirilir.',
        'Gönderim için ad, soyad ve geçerli bir e-posta adresi gerekir. Bu bilgiler görüşün gerçek bir kişiden geldiğini doğrulamak içindir.',
      ],
    ],
  },
  {
    baslik: '3. Yayınlanmayan içerikler',
    icerik: [
      'Aşağıdaki unsurları içeren görüşler yayınlanmaz; yayınlanmışsa kaldırılır:',
      [
        '**Tıbbi hüküm:** Uygulanan tanı veya tedavi yönteminin tıbben doğru ya da yanlış olduğuna, doktorun mesleki yeterliliğine veya bir tedavinin sonucuna dair kesin hükümler. Deneyiminizi ve hissettiklerinizi anlatabilirsiniz; tıbbi değerlendirme yalnızca yetkili sağlık kurumlarınca yapılabilir.',
        '**Saldırgan dil:** Hakaret, küfür, tehdit, aşağılama, nefret söylemi, ayrımcılık, müstehcenlik.',
        '**Kanıtlanmamış suç isnadı:** Bir kişiyi suç işlemekle, dolandırıcılıkla veya yasa dışı davranışla itham eden ifadeler. Bu tür şikâyetler için yetkili mercilere (ör. İl Sağlık Müdürlüğü, CİMER, savcılık) başvurulmalıdır.',
        '**Kişisel veriler:** Kendinize veya başkalarına ait ayrıntılı sağlık bilgisi, telefon numarası, adres, T.C. kimlik numarası; yorumla ilgisi olmayan personelin veya üçüncü kişilerin adları ve özel hayatlarına ilişkin bilgiler.',
        '**Reklam ve yönlendirme:** Bağlantı (link), başka bir siteye veya işletmeye yönlendirme, kampanya, fiyat karşılaştırması, başka bir doktor ya da kurumu öven veya kötüleyen karşılaştırmalar.',
        '**Konu dışı içerik:** Değerlendirilen kişi veya işletmeyle ilgisi olmayan; siyasi, dini ya da genel tartışma niteliğindeki yazılar, başka yorumlara verilen cevaplar.',
        '**Hukuka aykırılık:** Kişilik haklarını, fikri ve sınai hakları ihlal eden; 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği, Sağlık Hizmetlerinde Tanıtım ve Bilgilendirme Faaliyetleri Hakkında Yönetmelik ve diğer mevzuata aykırı; haksız rekabet doğuran ya da hukuka aykırılığı teşvik eden içerikler.',
        '**Yanıltıcı veya anlamsız içerik:** Gerçeğe aykırı olduğu anlaşılan, tekrar eden, rastgele karakterlerden oluşan ya da en az ' + YORUM_MIN_KARAKTER + ' karakterlik anlamlı bir anlatım içermeyen görüşler.',
      ],
    ],
  },
  {
    baslik: '4. İnceleme ve yayın süreci',
    icerik: [
      [
        'Gönderilen **her görüş yayından önce Hekimhane yöneticileri tarafından incelenir**. Onaylanmayan görüş hiçbir yerde görünmez; değerlendirilen doktor veya işletme de onaydan önce görmez.',
        'Gerekli gördüğümüzde, ziyaretinizi doğrulayan bir belge (ör. randevu mesajı, fiş veya muayene kaydı — kişisel bilgileri kapatılmış olarak) e-posta adresinizden istenebilir. Belge sağlanmazsa görüş yayınlanmayabilir.',
        'Görüşün anlamını değiştirmeyiz. Yalnızca kişisel veri, iletişim bilgisi veya bağlantı gibi kurallara aykırı küçük bölümleri çıkarabilir ya da görüşü bütünüyle yayınlamayabiliriz.',
        'Randevusu tamamlanan hastalara gönderilen değerlendirme bağlantısıyla yazılan görüşler "Onaylı hasta" işaretiyle yayınlanır; bu işaret görüşün içeriğinin doğrulandığı anlamına gelmez.',
      ],
    ],
  },
  {
    baslik: '5. Profilde nasıl görünür',
    icerik: [
      [
        'Adınız profilde kısaltılmış olarak (ör. "Elif K.") gösterilir. Değerlendirme bağlantısıyla yazılan görüşlerde görünecek adı siz belirleyebilirsiniz; bu ad bir rumuz olabilir ancak hakaret, aşağılama içeremez ve başka bir kişiyi taklit edemez.',
        'E-posta adresiniz hiçbir zaman yayınlanmaz ve değerlendirdiğiniz işletmeyle paylaşılmaz.',
        `"Sizce hangi noktalar geliştirilebilir?" bölümündeki seçimleriniz (${GELISTIRME_NOKTALARI.map(g => g.ad.toLocaleLowerCase('tr')).join(', ')}) profilde yayınlanmaz; yalnızca yöneticiler ve ilgili işletme tarafından iyileştirme amacıyla görülür.`,
        'Puanlar ve görüşler bir kalite değerlendirmesi, sıralama veya tavsiye değildir; yalnızca yazanın kişisel deneyimini yansıtır.',
      ],
    ],
  },
  {
    baslik: '6. İşletmelerin yanıt hakkı',
    icerik: [
      'Doktorlar ve işletmeler görüşleri **silemez, düzenleyemez veya seçemez**; yalnızca herkese açık bir yanıt yazabilir. Yanıtlar da bu kurallara tabidir ve hastaya ait sağlık bilgisi içeremez.',
      'Kurallara aykırı olduğunu düşündükleri bir görüşü profil sayfasındaki "bildirin" bağlantısıyla ya da yönetim panelinden şikâyet edebilirler. Görüşün yayında kalmasına veya kaldırılmasına yalnızca Hekimhane karar verir.',
    ],
  },
  {
    baslik: '7. Kaldırma ve itiraz',
    icerik: [
      [
        'Hekimhane, yayınlanmış bir görüşü kurallara aykırı olduğu sonradan anlaşılırsa, hukuka aykırılığı bildirilirse veya yetkili bir merciden karar gelirse yayından kaldırabilir.',
        'Kendi görüşünüzün kaldırılmasını veya düzeltilmesini istediğinizde ya da görüşünüzün haksız yere yayınlanmadığını veya kaldırıldığını düşündüğünüzde ' + SIRKET.eposta + ' adresine yazabilirsiniz. Başvurunuz incelenir ve sonucu size bildirilir.',
        'Hakkınızda yazılmış bir görüşün kişilik haklarınızı ihlal ettiğini düşünüyorsanız, 5651 sayılı Kanun kapsamındaki haklarınız saklıdır; profil sayfasındaki bildirim bağlantısını kullanabilir veya bize e-postayla ulaşabilirsiniz.',
      ],
    ],
  },
  {
    baslik: '8. Sorumluluk',
    icerik: [
      'Hekimhane, görüşler için yer sağlayıcıdır; görüşleri kendisi yazmaz ve içeriğini benimsemez. **Görüşün içeriğinden ve doğruluğundan onu yazan kişi sorumludur.**',
      'Bu kurallara aykırı bir görüş nedeniyle Hekimhane\'ye üçüncü kişilerce talep yöneltilir veya Hekimhane bir zarara uğrarsa, kanunun izin verdiği ölçüde görüşü yazan kişiye rücu hakkı saklıdır.',
    ],
  },
  {
    baslik: '9. Kullanım izni',
    icerik: [
      'Görüşünüz size aittir. Göndererek, görüşünüzün hekimhane.com.tr\'de ilgili profilde ve HekimKart\'ta yayınlanması, arama motorları için yapılandırılmış veri olarak işaretlenmesi ve hizmetlerimizin iyileştirilmesi amacıyla kullanılması için Hekimhane\'ye **ücretsiz, münhasır olmayan ve süresiz** bir kullanım izni vermiş olursunuz. Görüşünüz kaldırıldığında bu yayın sona erer.',
    ],
  },
  {
    baslik: '10. Kişisel verileriniz',
    icerik: [
      'Görüş gönderirken paylaştığınız ad, soyad, e-posta, puan, görüş metni, ziyaret tarihi ve onay kaydı, Hasta ve Ziyaretçi Aydınlatma Metni\'nde açıklanan amaçlar ve hukuki sebeplerle işlenir. KVKK kapsamındaki haklarınızı kullanmak için ' + SIRKET.kvkkEposta + ' adresine yazabilirsiniz.',
    ],
  },
  {
    baslik: '11. Değişiklikler',
    icerik: [
      `Bu kurallar gerektiğinde güncellenebilir. Güncel metin her zaman bu sayfadadır; bir görüş, gönderildiği andaki sürüme göre değerlendirilir. Yürürlükteki sürüm: ${YORUM_KURALLARI_SURUM}.`,
    ],
  },
];

export default function YorumKurallariPage() {
  return (
    <YasalSayfa
      baslik="Yorum Yayınlama Kuralları"
      ozet="Hekimhane'de yazılan görüşler yayından önce incelenir. Hangi görüşlerin yayınlandığı, hangilerinin yayınlanmadığı ve kaldırma ile itiraz süreci."
      bolumler={BOLUMLER}
      yol={YORUM_KURALLARI_YOL}
      guncelleme={YORUM_KURALLARI_GUNCELLEME}
    >
      <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-secondary)' }}>
        Kişisel verilerinizin nasıl işlendiği için{' '}
        <Link href={AYDINLATMA_YOL.hasta} style={{ color: 'var(--brand)', fontWeight: 600 }}>Hasta ve Ziyaretçi Aydınlatma Metni</Link>,
        çerezler için <Link href="/cerez" style={{ color: 'var(--brand)', fontWeight: 600 }}>Çerez Politikası</Link>.
      </p>
    </YasalSayfa>
  );
}
