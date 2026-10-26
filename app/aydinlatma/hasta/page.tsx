import type { Metadata } from 'next';
import Link from 'next/link';
import YasalSayfa, { KunyeKutusu, type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET, sirketKunyesi } from '@/lib/sirket';
import { AYDINLATMA_YOL, UYUM_GUNCELLEME, UYUM_SURE, saglikRizaMetni } from '@/lib/uyum';

// Hasta ve Ziyaretçi Aydınlatma Metni — uyum belgesi taslağı. Açık rıza metni
// ayrı bölümde; randevu formunda yalnız hasta not yazdığında görünen kutu ile aynı
// cümle (lib/uyum.ts → saglikRizaMetni).
const URL_ = `https://www.hekimhane.com.tr${AYDINLATMA_YOL.hasta}`;

export const metadata: Metadata = {
  title: 'Hasta ve Ziyaretçi Aydınlatma Metni',
  description: 'Hekimhane\'yi ziyaret eden, randevu talebi ileten, görüş yazan veya yapay zekâ asistanını kullanan kişiler için KVKK aydınlatma metni ve sağlık verisi açık rıza metni.',
  alternates: { canonical: URL_ },
};

const kunyeCumlesi = () => {
  const adres = [SIRKET.adres, SIRKET.ulke].filter(Boolean).join(', ');
  const c = [
    adres ? `Adresimiz ${adres}` : '',
    SIRKET.mersis ? `MERSİS numaramız ${SIRKET.mersis}` : '',
    `e-posta adresimiz ${SIRKET.kvkkEposta}`,
    SIRKET.kep ? `KEP adresimiz ${SIRKET.kep}` : '',
  ].filter(Boolean).join(', ') + '\'dir.';
  return c.charAt(0).toLocaleUpperCase('tr') + c.slice(1);
};

const basvuruYollari = () => [
  `**${SIRKET.kvkkEposta}** adresine`,
  SIRKET.adres ? `**${[SIRKET.adres, SIRKET.ulke].filter(Boolean).join(', ')}** adresine yazılı olarak` : '',
  SIRKET.kep ? `**${SIRKET.kep}** KEP adresine` : '',
].filter(Boolean).join(', ');

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. Veri sorumlusu',
    icerik: [
      `**${SIRKET.unvan}** ("Hekimhane"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusudur. ${kunyeCumlesi()}`,
      'Bu metin, hekimhane.com.tr\'yi ziyaret eden, yapay zekâ asistanını kullanan, randevu talebi ileten, görüş yazan veya hatalı bilgi bildiren kişileri kapsar.',
    ],
  },
  {
    baslik: '2. Hangi verileri, hangi amaçla ve hangi hukuki sebeple işliyoruz',
    icerik: [
      { tablo: {
        baslik: ['Faaliyet', 'İşlenen veriler', 'Hukuki sebep'],
        satirlar: [
          ['Sitenin çalışması ve güvenliği', 'IP adresi, cihaz ve tarayıcı bilgisi, zorunlu çerezler', 'm.5/2-ç hukuki yükümlülük (5651 sayılı Kanun), m.5/2-f meşru menfaat'],
          ['İstatistik ve zorunlu olmayan çerezler', 'Çerez tanımlayıcıları, sayfa kullanım bilgisi', 'Çerez panelinde verdiğiniz açık rıza'],
          ['Yapay zekâ asistanıyla sohbet', 'Sohbet içeriği', 'm.5/2-c sözleşmenin kurulması ve ifası'],
          ['Randevu talebinizi seçtiğiniz doktora iletmek', 'Ad soyad, telefon, e-posta, seçtiğiniz doktor, uygun zaman', 'm.5/2-c sözleşmenin kurulması ve ifası'],
          ['Randevu talebinize eklemek istediğiniz sağlık bilgisi', 'Şikâyet, bölüm, sağlık durumu', 'Yalnızca KVKK m.6 kapsamında ayrıca verdiğiniz açık rıza'],
          ['Görüşlerin yayınlanması', 'Ad veya rumuz, görüşün içeriği, randevu doğrulama bilgisi', 'm.5/2-c sözleşmenin ifası'],
          ['Hatalı bilgi bildirimleri', 'E-posta, bildirimin içeriği', 'm.5/2-f meşru menfaat'],
          ['Hak başvurularının yanıtlanması', 'Kimlik ve iletişim bilgileri, talebin içeriği', 'm.5/2-ç hukuki yükümlülük'],
        ],
      } },
      '**Asistan sizden sağlık bilgisi istemez ve tıbbi tavsiye vermez.** Görüşlerinizde sağlık durumunuzla ilgili ayrıntı yazmamanızı rica ederiz. Bu tür ayrıntılar yayından önce çıkarılır.',
    ],
  },
  {
    baslik: '3. Verilerinizi kimlere aktarıyoruz',
    icerik: [
      'Randevu talebiniz, seçtiğiniz doktora veya sağlık kuruluşuna e-postayla iletilir. Hizmetimizi sunabilmek için verileriniz barındırma, e-posta gönderimi ve yapay zekâ asistanı hizmeti aldığımız tedarikçilerle paylaşılır:',
      [
        '**Barındırma ve veritabanı:** Vercel Inc. (ABD) ve Supabase Inc. (ABD; veritabanı bölgesi AB)',
        '**E-posta gönderimi:** Resend (ABD)',
        '**Yapay zekâ asistanı ve destek sohbeti:** Ozvelo',
      ],
      'Yurt dışında bulunan tedarikçilere aktarım, KVKK m.9 uyarınca standart sözleşme imzalanarak ve Kişisel Verileri Koruma Kurumu\'na bildirilerek yapılır. Kanunen yetkili kamu kurumları ve mahkemeler talep ettiğinde verileriniz bu kurumlarla paylaşılır.',
    ],
  },
  {
    baslik: '4. Saklama süreleri',
    icerik: [
      'Randevu talepleri, talebin sonuçlandırılması ve olası uyuşmazlıkların çözümü için gerekli süre boyunca; asistan sohbet kayıtları hizmetin sunulması için gerekli süre boyunca saklanır. Görüşler yayında kaldığı sürece saklanır. Erişim kayıtları ilgili mevzuatta öngörülen süre boyunca tutulur. Süre sonunda veriler silinir veya anonim hale getirilir.',
    ],
  },
  {
    baslik: '5. Haklarınız ve başvuru yolları',
    icerik: [
      'KVKK\'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme haklarına sahipsiniz. Verileriniz eksik veya yanlış işlenmişse düzeltilmesini, KVKK m.7 çerçevesinde silinmesini veya yok edilmesini ve bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteyebilirsiniz. Verilerinizin münhasıran otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz edebilir, kanuna aykırı işleme nedeniyle zarara uğrarsanız zararınızın giderilmesini talep edebilirsiniz.',
      `Başvurunuzu ${basvuruYollari()} iletebilirsiniz. Başvurunuz en geç ${UYUM_SURE.kaldirma_ust_gun} gün içinde ücretsiz olarak sonuçlandırılır. Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi halinde KVKK m.14 uyarınca Kişisel Verileri Koruma Kurulu\'na şikâyette bulunabilirsiniz.`,
    ],
  },
  {
    baslik: 'Sağlık verisi açık rıza metni',
    icerik: [
      'Randevu formunda, yalnızca not alanına bir şey yazdığınızda görünen ve önceden işaretlenmemiş kutunun metni şudur:',
      [`${saglikRizaMetni('[doktor veya kurum adı]')} Rızamı istediğim zaman ${SIRKET.kvkkEposta} adresine yazarak geri alabilirim.`],
      'Kutu işaretlenmezse not alanına yazdıklarınız doktora giden e-postaya eklenmez ve kaydedilmez; randevu talebiniz sağlık bilgisi olmadan iletilir.',
    ],
  },
];

export default function HastaAydinlatmaPage() {
  return (
    <YasalSayfa
      baslik="Hasta ve Ziyaretçi Aydınlatma Metni"
      ozet="Hekimhane'yi ziyaret eden, randevu talebi ileten, görüş yazan veya asistanı kullanan kişiler için: hangi verileriniz hangi amaçla işlenir, kimlere aktarılır, haklarınız nelerdir."
      bolumler={BOLUMLER}
      yol={AYDINLATMA_YOL.hasta}
      guncelleme={UYUM_GUNCELLEME}
    >
      <KunyeKutusu baslik="Veri sorumlusu" satirlar={sirketKunyesi()} />
      <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-secondary)' }}>
        Doktorlar ve sağlık kuruluşları için ayrı metin:{' '}
        <Link href={AYDINLATMA_YOL.profesyonel} style={{ color: 'var(--brand)', fontWeight: 600 }}>Profesyoneller Aydınlatma Metni</Link>.
        Çerezler için <Link href="/cerez" style={{ color: 'var(--brand)', fontWeight: 600 }}>Çerez Politikası</Link>.
      </p>
    </YasalSayfa>
  );
}
