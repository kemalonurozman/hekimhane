// ─────────────────────────────────────────────────────────────────
//  Kaldırma talebi sahibine yöneticinin elle gönderdiği e-postalar — ŞABLONLAR (Kas 2026).
//  İstemci + sunucu ortak (admin penceresi önizlemesi = giden e-posta): sunucu importu KOYMA.
//  Akış: app/admin/KaldirmaMailPenceresi.tsx → /api/admin/kaldirma/eposta → lib/kaldirma-eposta.ts
//
//  Metin kuralı: yalnız kodda GERÇEKTEN var olan özellikler yazılır (2026-11-22 doğrulandı):
//    · randevu talebi doğrudan e-postaya — yalnız SAHİPLENİLMİŞ profilde (app/api/randevu-talebi)
//    · profil/ekip düzenleme, yorum yanıtı, HekimKart — ücretsiz (/neden-hekimhane)
//    · Instagram/Facebook/LinkedIn/web bağlantıları ve saat seçmeli takvim — PRO (PRO_FIELDS).
//      "Ücretsiz" yalnız ilk kullanıcı kontenjanı sürerken (lib/erken-uye*) ve kontenjan
//      okunabiliyorsa yazılır; dolunca cümle şablondan kendiliğinden düşer.
//  Yeni özellik cümlesi eklerken önce kodda doğrula. "Öne çıkma / sıralama / daha çok hasta"
//  vaadi YAZILMAZ (Pro sıralamayı etkilemez).
//  Alt not (tek seferlik + başka e-posta gönderilmeyecek + RET satırı) düzenlenemez; sunucu her e-postaya ekler.
//  Ret bildiren adrese (kaldirma_eposta_ret) elle e-posta gitmez; otomatik kaldırma e-postasında tanıtım çıkmaz.
// ─────────────────────────────────────────────────────────────────
import { AYDINLATMA_YOL } from '@/lib/uyum';

const SITE = 'https://www.hekimhane.com.tr';

/** Talebin durumuna göre e-postanın bağlamı. */
export type KaldirmaBaglam = 'acik' | 'yayinda' | 'kaldirildi';

/** Talep durumu → bağlam. Geri yüklenen profilin talebi 'reddedildi' olur → 'yayinda'. */
export function baglamBul(status: string): KaldirmaBaglam {
  if (status === 'bekliyor' || status === 'duraklatildi') return 'acik';
  if (status === 'kaldirildi') return 'kaldirildi';
  return 'yayinda';
}

export const BAGLAM_ETIKET: Record<KaldirmaBaglam, string> = {
  acik: 'Talep açık · profil yayında',
  yayinda: 'Talep sonuçlandı · profil yayında',
  kaldirildi: 'Profil kaldırıldı',
};

/**
 * Ret satırı — tanıtım içeren her e-postada (6563 sayılı Kanun: alıcının ret hakkı).
 * Yanıt yöneticiye gelir; yönetici admin'de "e-posta istemiyor" diye işaretler.
 */
export const RET_SATIRI = 'Bu tür e-postaları almak istemiyorsanız bu e-postayı yanıtlamanız yeterli; size bir daha bu tür e-posta göndermeyiz.';

/**
 * Hekimhane Booking (Ozvelo.com ortaklığı) — otomatik "profil kaldırıldı" e-postasındaki kısa bilgi.
 * İddialar /booking sayfasındaki ürün metniyle aynı (app/booking/page.tsx → KANALLAR, FAYDALAR, ADIMLAR).
 * Booking ücretli ve başvuruyla kurulur: "ücretsiz" YAZMA. Sayfa değişirse burayı da güncelle.
 * Instagram/Facebook yanıtlama: sahibi 2026-11-22'de "şu an çalışıyor" dedi (panelde Yapay Zekâ Asistanı
 * sayfasındaki "Yakında" etiketi Hekimhane paneli içindeki gelen kutusuyla ilgili).
 */
export const BOOKING_MADDELERI = [
  'Telefonlarınızı 7/24, doğal bir sesle yanıtlar; çalışma saatlerinize göre davranır, gerektiğinde çağrıyı ekibinize aktarır.',
  'Instagram ve Facebook hesaplarınıza gelen mesajları yanıtlar, randevu taleplerini toplar.',
  'Sizin çalışma saatleriniz ve hizmetlerinizle kurulur; hastaya uygun saati sunar, randevuyu oluşturur ve size bildirir.',
];

export const KALDIRMA_EPOSTA_SINIR = { konuMin: 3, konuMax: 150, metinMin: 20, metinMax: 5000 } as const;

export type SablonKod = 'veda' | 'ozellik' | 'davet' | 'alternatif' | 'serbest';

export interface SablonDegerleri {
  ad: string;
  profil: string;
  /** Profil yayındaysa sahiplenme bağlantısı */
  sahiplenUrl: string | null;
  /** Yedekten geri yüklenebilecekse son gün (okunur tarih) */
  yedekSon: string | null;
  /** İlk kullanıcı ücretsiz Pro kontenjanı açık ve okunabildiyse true */
  kontenjanAcik: boolean;
}

export interface KaldirmaSablonu {
  kod: SablonKod;
  ad: string;
  aciklama: string;
  baglamlar: KaldirmaBaglam[];
  konu: (v: SablonDegerleri) => string;
  metin: (v: SablonDegerleri, b: KaldirmaBaglam) => string;
}

export const sahiplenAdresi = (tip: string, id: string) =>
  `${SITE}/sahiplen?id=${encodeURIComponent(id)}&type=${encodeURIComponent(tip)}`;

const UCRETSIZ_MADDELER = [
  '• Profilinizi sahiplendiğinizde, hastaların profilinizden bıraktığı randevu talepleri doğrudan e-posta adresinize gelir; panelden arandı, ertelendi, tamamlandı diye izlersiniz.',
  '• Adres, çalışma saatleri, uzmanlık, logo ve fotoğraflarınızı dilediğiniz an kendiniz güncellersiniz.',
  '• Hasta değerlendirmelerinin her birine kendi sözlerinizle yanıt verirsiniz.',
  '• HekimKart ile tüm iletişim bilgileriniz tek bağlantıda; karekodla paylaşırsınız.',
];

const proCumlesi = (v: SablonDegerleri) => v.kontenjanAcik
  ? 'İlk kullanıcılara özel kontenjan sürerken Hekimhane\'ye katılıp profilini sahiplenen işletmelere Hekimhane-Pro ücretsiz tanımlanıyor; sizden kart ya da ödeme bilgisi istenmiyor. Pro ile Instagram, Facebook, LinkedIn ve web sitesi bağlantılarınızı profilinize ekleyebilir, saat seçmeli randevu takvimini kullanabilirsiniz.'
  : '';

/** Geri dönüş yolu: kaldırılmışsa yedek ya da yeni başvuru; yayındaysa sahiplenme. */
function donusCumlesi(v: SablonDegerleri, b: KaldirmaBaglam): string {
  if (b === 'kaldirildi') {
    return v.yedekSon
      ? `Profiliniz ${v.yedekSon} tarihine kadar yorumlarıyla birlikte saklanıyor. Geri gelmek isterseniz bu e-postayı yanıtlamanız yeterli; profilinizi yorumlarıyla birlikte geri yükleriz.`
      : `Yeniden yer almak isterseniz ${SITE}/katil adresinden birkaç dakikada başvurabilirsiniz.`;
  }
  return v.sahiplenUrl ? `Profili sahiplenmek için: ${v.sahiplenUrl}` : `Profilinizi sahiplenmek için ${SITE}/katil adresinden başvurabilirsiniz.`;
}

const satirlar = (...parcalar: (string | false | null | undefined)[]) => parcalar.filter(Boolean).join('\n\n');

export const KALDIRMA_SABLONLARI: KaldirmaSablonu[] = [
  {
    kod: 'veda',
    ad: 'Dostça son mesaj',
    aciklama: 'Kaldırma sonrası teşekkür; ücretsiz olanları ve geri dönüş yolunu kısaca bırakır.',
    baglamlar: ['kaldirildi'],
    konu: () => 'Hekimhane\'den kısa bir teşekkür',
    metin: (v, b) => satirlar(
      `Merhaba ${v.ad},`,
      `${v.profil} profilini talebiniz üzerine Hekimhane'den kaldırdık. Bize zaman ayırdığınız için teşekkür ederiz.`,
      'Bir gün fikriniz değişirse diye, Hekimhane\'de ücretsiz olanları kısaca bırakmak istedik:\n' + UCRETSIZ_MADDELER.slice(0, 3).join('\n'),
      proCumlesi(v),
      donusCumlesi(v, b),
      'Sağlıklı günler dileriz.\nHekimhane Ekibi',
    ),
  },
  {
    kod: 'ozellik',
    ad: 'Ücretsiz özellik hatırlatması',
    aciklama: 'Ücretsiz olanların listesi; kontenjan açıksa ücretsiz Pro ile sosyal medya bağlantıları.',
    baglamlar: ['kaldirildi', 'yayinda', 'acik'],
    konu: () => 'Hekimhane\'de ücretsiz olanlar: kısa bir hatırlatma',
    metin: (v, b) => satirlar(
      `Merhaba ${v.ad},`,
      b === 'acik'
        ? `${v.profil} profilinin kaldırılması talebinizi aldık ve inceliyoruz. Karar vermeden önce, profili kaldırmak yerine kendiniz yönetmek isteyebileceğinizi düşündük.`
        : b === 'kaldirildi'
          ? `${v.profil} profilinin kaldırılmasından sonra, Hekimhane'de ücretsiz olanları kısaca hatırlatmak istedik.`
          : `${v.profil} profili hakkındaki talebinizden sonra, Hekimhane'de ücretsiz olanları kısaca paylaşmak istedik.`,
      'Hekimhane\'de listelenmek ücretsizdir; profili sahiplenmek, bilgileri güncellemek ve yorumlara yanıt vermek için ücret alınmaz:\n' + UCRETSIZ_MADDELER.join('\n'),
      proCumlesi(v),
      donusCumlesi(v, b),
      b === 'acik' && 'Yine de kaldırılmasını istiyorsanız hiçbir şey yapmanız gerekmez; talebiniz geçerli, kararımızı size bildireceğiz.',
      'Sorunuz olursa bu e-postayı yanıtlamanız yeterli.',
      'Saygılarımızla,\nHekimhane Ekibi',
    ),
  },
  {
    kod: 'davet',
    ad: 'Geri dönüş daveti',
    aciklama: 'Kısa ve sade: kapımız açık, geri dönmek isterseniz yolu bu.',
    baglamlar: ['kaldirildi'],
    konu: () => 'Kapımız her zaman açık',
    metin: (v, b) => satirlar(
      `Merhaba ${v.ad},`,
      `${v.profil} profilini talebiniz doğrultusunda kaldırmıştık. Kararınıza saygı duyuyoruz; bu e-postayı yalnızca kapımızın açık olduğunu söylemek için yazıyoruz.`,
      'Profilinizi kendiniz yönettiğinizde bilgileriniz sizin elinizde olur: düzeltir, günceller, hasta yorumlarına yanıt verirsiniz. Hastaların bıraktığı randevu talepleri de doğrudan e-posta adresinize gelir.',
      donusCumlesi(v, b),
      'Görüşmek dileğiyle,\nHekimhane Ekibi',
    ),
  },
  {
    kod: 'alternatif',
    ad: 'Kaldırmak yerine yönetmek',
    aciklama: 'Profil yayındayken: ücretsiz sahiplenip bilgileri kendisi düzeltebileceğini anlatır.',
    baglamlar: ['acik', 'yayinda'],
    konu: (v) => `${v.profil} profili hakkında: bir seçenek daha`,
    metin: (v, b) => satirlar(
      `Merhaba ${v.ad},`,
      b === 'acik'
        ? `${v.profil} profilinin kaldırılması talebinizi aldık ve inceliyoruz. Talebiniz geçerli; bu e-posta yalnızca bilginiz için.`
        : `${v.profil} profili hakkındaki talebiniz için tekrar teşekkür ederiz.`,
      'Profildeki bilgilerden memnun değilseniz, profili ücretsiz sahiplenip kendiniz yönetebilirsiniz. Sahiplendiğinizde yanlış ya da eksik bilgileri düzeltir, hasta yorumlarına yanıt verirsiniz; hastaların bıraktığı randevu talepleri de doğrudan e-posta adresinize gelir.',
      donusCumlesi(v, b),
      b === 'acik' && 'Yine de kaldırılmasını istiyorsanız hiçbir şey yapmanız gerekmez; kararımızı size bildireceğiz.',
      'Sorunuz olursa bu e-postayı yanıtlamanız yeterli.',
      'Saygılarımızla,\nHekimhane Ekibi',
    ),
  },
  {
    kod: 'serbest',
    ad: 'Kendi metniniz',
    aciklama: 'Boş şablon: selam ve imza hazır, gerisini siz yazarsınız.',
    baglamlar: ['acik', 'yayinda', 'kaldirildi'],
    konu: () => 'Hekimhane\'den bir not',
    metin: (v) => `Merhaba ${v.ad},\n\n\n\nSaygılarımızla,\nHekimhane Ekibi`,
  },
];

export const SABLON_KODLARI = KALDIRMA_SABLONLARI.map(s => s.kod);
export const sablonAdi = (kod: string) => KALDIRMA_SABLONLARI.find(s => s.kod === kod)?.ad || kod;

/* ─────────────────────── Düz metin → e-posta HTML ─────────────────────── */

const kacis = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c));
const P = 'font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 12px;';
const UL = 'font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 12px;padding-left:20px;';
const MADDE = /^\s*[•\-*]\s+/;

/** Satır içi: http(s) bağlantıları ham metinde ayrılır, her parça AYRI kaçışlanır (tırnak/açı ayraç adrese girmez). */
function satirIci(s: string): string {
  const re = /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)]/g;
  let out = '', son = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    out += kacis(s.slice(son, m.index)) + `<a href="${kacis(m[0])}" style="color:#1A335E;">${kacis(m[0])}</a>`;
    son = m.index + m[0].length;
  }
  return out + kacis(s.slice(son));
}

/** Yöneticinin yazdığı düz metin → HTML. Boş satır = paragraf, "• " / "- " = madde. */
export function metinHtml(metin: string): string {
  const bloklar = metin.replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  const out: string[] = [];
  for (const blok of bloklar) {
    const satirlar_ = blok.split('\n');
    let duz: string[] = [], madde: string[] = [];
    const duzBosalt = () => { if (duz.length) out.push(`<p style="${P}">${duz.map(satirIci).join('<br>')}</p>`); duz = []; };
    const maddeBosalt = () => { if (madde.length) out.push(`<ul style="${UL}">${madde.map(m => `<li style="margin:0 0 4px;">${satirIci(m)}</li>`).join('')}</ul>`); madde = []; };
    for (const s of satirlar_) {
      if (!s.trim()) continue;
      if (MADDE.test(s)) { duzBosalt(); madde.push(s.replace(MADDE, '')); }
      else { maddeBosalt(); duz.push(s.trim()); }
    }
    duzBosalt(); maddeBosalt();
  }
  return out.join('');
}

/** Düzenlenemeyen alt not: tek seferlik olduğu, başka e-posta gönderilmeyeceği, aydınlatma bağlantısı. */
export function altNotMetni(b: KaldirmaBaglam): string {
  const giris = 'Bu e-postayı, Hekimhane\'deki profil kaldırma talebinizde verdiğiniz adrese yalnızca bir kez gönderiyoruz.';
  return b === 'acik'
    ? `${giris} Talebiniz geçerliliğini koruyor; kararımızı ayrıca bildireceğiz, bunun dışında size e-posta göndermeyeceğiz. ${RET_SATIRI}`
    : `${giris} Size başka e-posta göndermeyeceğiz; yanıt vermeniz gerekmez. ${RET_SATIRI}`;
}

/** mailShell içine girecek gövde: metin + alt not. Admin önizlemesi ve giden e-posta aynı fonksiyonu kullanır. */
export function epostaGovdesi(metin: string, b: KaldirmaBaglam): string {
  return metinHtml(metin) +
    `<p style="margin:18px 0 0;padding-top:12px;border-top:1px solid #E5E5EA;font-size:11.5px;line-height:1.6;color:#6E6E73;">${kacis(altNotMetni(b))} Kişisel verilerinizin nasıl işlendiğini <a href="${SITE}${AYDINLATMA_YOL.profesyonel}" style="color:#1A335E;">Profesyoneller Aydınlatma Metni</a>'nde okuyabilirsiniz.</p>`;
}
