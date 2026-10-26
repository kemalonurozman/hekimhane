import type { Metadata } from 'next';
import Link from 'next/link';
import YasalSayfa, { KunyeKutusu, type YasalBolum } from '@/components/YasalSayfa';
import { SIRKET, sirketKunyesi } from '@/lib/sirket';
import { AYDINLATMA_YOL, UYUM_GUNCELLEME, UYUM_SURE } from '@/lib/uyum';

// Profesyoneller Aydınlatma Metni — uyum belgesi taslağı. Künye alanları lib/sirket.ts'ten;
// boş olan alan yazılmaz. Saklama sürelerinde avukat kararı bekleyen değerler
// amaçla sınırlı genel ifadeyle verildi (bkz. CLAUDE.md "Uyum").
const URL_ = `https://www.hekimhane.com.tr${AYDINLATMA_YOL.profesyonel}`;

export const metadata: Metadata = {
  title: 'Profesyoneller Aydınlatma Metni',
  description: 'Hekimhane\'de profili bulunan doktor ve sağlık meslek mensupları için KVKK aydınlatma metni: veriler nasıl toplanır, hangi amaçla işlenir, kimlere aktarılır, haklarınız.',
  alternates: { canonical: URL_ },
};

const kunyeCumlesi = () => {
  const adres = [SIRKET.adres, SIRKET.ulke].filter(Boolean).join(', ');
  const parcalar = [
    adres ? `Adresimiz ${adres}` : '',
    SIRKET.mersis ? `MERSİS numaramız ${SIRKET.mersis}` : '',
    `e-posta adresimiz ${SIRKET.kvkkEposta}`,
    SIRKET.kep ? `KEP adresimiz ${SIRKET.kep}` : '',
  ].filter(Boolean);
  const c = parcalar.join(', ') + '\'dir.';
  return c.charAt(0).toLocaleUpperCase('tr') + c.slice(1);
};

const basvuruYollari = () => [
  'profil sayfanızdaki "Bu profil size mi ait?" kutusundan',
  `sistemimizde kayıtlı e-posta adresinizden **${SIRKET.kvkkEposta}** adresine yazarak`,
  SIRKET.adres ? `**${[SIRKET.adres, SIRKET.ulke].filter(Boolean).join(', ')}** adresine yazılı olarak` : '',
  SIRKET.kep ? `**${SIRKET.kep}** KEP adresine` : '',
].filter(Boolean).join(', ');

const BOLUMLER: YasalBolum[] = [
  {
    baslik: '1. Veri sorumlusu',
    icerik: [
      `**${SIRKET.unvan}** ("Hekimhane"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusudur. ${kunyeCumlesi()}`,
      'Bu metin, hekimhane.com.tr\'de profili bulunan doktorları ve diğer sağlık meslek mensuplarını kapsar. Hekimhane ile bir sözleşmeniz olmasa da, profilinizi sahiplenmemiş olsanız da bu metin sizin için geçerlidir.',
    ],
  },
  {
    baslik: '2. Verilerinizi nasıl topluyoruz',
    icerik: [
      'Profillerdeki bilgileri, sizin veya çalıştığınız kurumun kamuya açık olarak yayımladığı kaynaklardan derleyebiliriz. Bu kaynaklar muayenehanenizin veya çalıştığınız kurumun internet sitesi, hastane ve klinik sayfaları, Google İşletme Profili gibi herkese açık harita ve rehber kayıtları ile kamu kurumlarının yayımladığı hekim listeleridir.',
      'Profilinizi sahiplendiğinizde, formları doldurduğunuzda, panelimizi kullandığınızda veya bizimle yazıştığınızda verilerinizi doğrudan sizden alırız. Panelin kullanımı sırasında bazı teknik veriler çerezler aracılığıyla otomatik olarak toplanır.',
      '**Kamuya açık kaynaklardan derlediğimiz iletişim bilgilerinizi pazarlama amacıyla kullanmayız.** Size ticari ileti yalnızca açık onayınız varsa gönderilir.',
    ],
  },
  {
    baslik: '3. Hangi verileri, hangi amaçla ve hangi hukuki sebeple işliyoruz',
    icerik: [
      { tablo: {
        baslik: ['Faaliyet', 'İşlenen veriler', 'Hukuki sebep'],
        satirlar: [
          ['Rehberde profilinizi yayınlamak ve hastaların size ulaşabilmesini sağlamak', 'Ad soyad, unvan, uzmanlık, muayenehane veya kurum adı, adresi, telefonu, e-postası, çalışma saatleri', 'KVKK m.5/2-f meşru menfaat. Kamuya kendi açıkladığınız mesleki iletişim bilgileri için ayrıca m.5/2-d, yalnızca açıklanma amacıyla sınırlı'],
          ['Hasta adaylarının randevu taleplerini size iletmek', 'Profil iletişim bilgileriniz, talebin içeriği', 'm.5/2-f meşru menfaat. Profilinizi sahiplendiyseniz m.5/2-c sözleşmenin ifası'],
          ['Profil sahiplenme ve kimlik doğrulama', 'Ad soyad, iletişim bilgileri, doğrulama kodu, yüklediğiniz belge', 'm.5/2-c sözleşmenin kurulması'],
          ['Panel, Pro paket ve faturalandırma', 'Kimlik ve iletişim bilgileri, fatura bilgileri, vergi numarası', 'm.5/2-c sözleşmenin ifası, m.5/2-ç hukuki yükümlülük'],
          ['Sahiplenme, düzeltme ve kaldırma başvurularını yönetmek', 'Ad soyad, il, talep tarihi, yazışmalar', 'm.5/2-ç hukuki yükümlülük, m.5/2-e hakkın korunması'],
          ['Kaldırılan profillerin yeniden eklenmesini önlemek', 'Ad soyad, il, kaldırma tarihi', 'm.5/2-f meşru menfaat'],
          ['Hasta görüşlerine verdiğiniz yanıtları yayınlamak', 'Ad soyad, yanıtın içeriği', 'm.5/2-c sözleşmenin ifası'],
          ['Ticari elektronik ileti göndermek', 'Ad soyad, e-posta, telefon', 'Açık rıza ve 6563 sayılı Kanun kapsamında onay'],
          ['Onay ve ret kayıtlarını İleti Yönetim Sistemi\'ne (İYS) bildirmek', 'Ad soyad, e-posta, telefon, onay ve ret kayıtları', 'm.5/2-ç hukuki yükümlülük'],
          ['Bilgi güvenliği ve erişim kayıtları', 'IP adresi, giriş kayıtları, cihaz bilgisi', 'm.5/2-ç hukuki yükümlülük (5651 sayılı Kanun), m.5/2-f meşru menfaat'],
        ],
      } },
    ],
  },
  {
    baslik: '4. Verilerinizi kimlere aktarıyoruz',
    icerik: [
      'Profil bilgileriniz, hastaların size ulaşabilmesi için sitede herkese açık olarak yayınlanır.',
      'Hizmetimizi sunabilmek için verileriniz barındırma, e-posta gönderimi, yapay zekâ asistanı, ödeme ve muhasebe hizmeti aldığımız tedarikçilerle paylaşılır:',
      [
        '**Barındırma ve veritabanı:** Vercel Inc. (ABD) ve Supabase Inc. (ABD; veritabanı bölgesi AB)',
        '**E-posta gönderimi:** Resend (ABD) — randevu, onay ve bildirim e-postaları',
        '**Yapay zekâ asistanı ve destek sohbeti:** Ozvelo',
        '**Ödeme altyapısı:** Stripe (ABD / İrlanda) — Pro üyelik ödemeleri; kart bilgileri Hekimhane\'ye ulaşmaz',
        '**Giriş:** Google ile giriş yapmayı seçen kullanıcılar için Google LLC (ABD)',
      ],
      'Yurt dışında bulunan tedarikçilere aktarım, KVKK m.9 uyarınca standart sözleşme imzalanarak ve Kişisel Verileri Koruma Kurumu\'na bildirilerek yapılır. Ticari ileti onay ve ret kayıtlarınız İYS\'ye aktarılır ve bu aktarım yurt içinde gerçekleşir. Kanunen yetkili kamu kurumları ve mahkemeler talep ettiğinde verileriniz bu kurumlarla paylaşılır.',
    ],
  },
  {
    baslik: '5. Saklama süreleri',
    icerik: [
      'Profil verileriniz profil yayında kaldığı sürece saklanır. Kaldırma talebiniz onaylandığı anda profil kaydınız silinir; talep bize ulaştığı anda ise profil yayından çekilir.',
      'Kaldırılanlar listesindeki adınız, iliniz ve talep tarihiniz, profilinizin yeniden eklenmesini önleme amacı sürdüğü sürece tutulur. Kimlik doğrulama için yüklediğiniz belgeler doğrulama tamamlandıktan sonra silinir.',
      'Fatura ve muhasebe kayıtları ilgili mevzuatta öngörülen süreler boyunca saklanır. Bu süre Türk Ticaret Kanunu uyarınca 10 yıldır.',
    ],
  },
  {
    baslik: '6. Haklarınız ve başvuru yolları',
    icerik: [
      'KVKK\'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme haklarına sahipsiniz.',
      'Verileriniz eksik veya yanlış işlenmişse düzeltilmesini, KVKK m.7 çerçevesinde silinmesini veya yok edilmesini ve bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteyebilirsiniz. Verilerinizin münhasıran otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz edebilir, kanuna aykırı işleme nedeniyle zarara uğrarsanız zararınızın giderilmesini talep edebilirsiniz.',
      `Başvurunuzu ${basvuruYollari()} iletebilirsiniz. Başvurunuz en geç ${UYUM_SURE.kaldirma_ust_gun} gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu\'nun belirlediği tarifedeki ücret alınabilir.`,
      'Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi halinde, KVKK m.14 uyarınca cevabı öğrendiğiniz tarihten itibaren 30 gün ve her halde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu\'na şikâyette bulunabilirsiniz.',
    ],
  },
];

export default function ProfesyonellerAydinlatmaPage() {
  return (
    <YasalSayfa
      baslik="Profesyoneller Aydınlatma Metni"
      ozet="Hekimhane'de profili bulunan doktorlar ve sağlık meslek mensupları için: verileriniz nasıl toplanır, hangi amaçla işlenir, kimlere aktarılır ve haklarınızı nasıl kullanırsınız."
      bolumler={BOLUMLER}
      yol={AYDINLATMA_YOL.profesyonel}
      guncelleme={UYUM_GUNCELLEME}
    >
      <KunyeKutusu baslik="Veri sorumlusu" satirlar={sirketKunyesi()} />
      <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-secondary)' }}>
        Profilinizi sahiplenmek, bilgilerinizi düzeltmek veya profilinizin kaldırılmasını istemek için profil sayfanızdaki
        &quot;Bu profil size mi ait?&quot; kutusunu kullanabilirsiniz. Hasta ve ziyaretçiler için ayrı metin:{' '}
        <Link href={AYDINLATMA_YOL.hasta} style={{ color: 'var(--brand)', fontWeight: 600 }}>Hasta ve Ziyaretçi Aydınlatma Metni</Link>.
      </p>
    </YasalSayfa>
  );
}
