// "Diş Doktorlarına Özel Setler — Dijital Hekimlik" dizisi (10 yazı, diş hekimlerine).
// Yeni yazı: <slug>.ts ekle (biçim: ./tip.ts) ve aşağıdaki listeye koy.
// Her yazının sonuna dizinin tüm bölümlerine giden liste eklenir.
import type { BlogBlok, BlogYazi } from '../blog-data';
import { parseGovde, okumaSuresi } from '../makale-icerik';
import type { DijitalKaynak } from './tip';

import y01 from './dijital-dis-hekimligine-giris';
import y02 from './bilgisayar-destekli-tasarim-cad';
import y03 from './bilgisayar-destekli-uretim-cam';
import y04 from './protetik-ve-restoratif-tedavilerde-dijital-is-akisi';
import y05 from './periodontolojide-dijital-yaklasimlar';
import y06 from './implantolojide-dijital-planlama-ve-rehberli-cerrahi';
import y07 from './agiz-dis-ve-cene-cerrahisinde-dijital-planlama';
import y08 from './endodontide-dijital-teknolojiler';
import y09 from './ortodontide-dijital-is-akisi';
import y10 from './halk-sagligi-koruyucu-dis-hekimligi-ve-egitimde-dijitallesme';

export const DIJITAL_KATEGORI = 'Dijital Hekimlik';
export const DIJITAL_SET_ADI = 'Diş Doktorlarına Özel Setler: Dijital Hekimlik';

const UYARI =
  'Bu içerik diş hekimlerine yönelik genel mesleki bilgilendirme amaçlıdır; belirli bir cihaz, yazılım ya da marka önerisi değildir. Klinik kararlar hastaya özgü değerlendirme, güncel kılavuzlar ve üretici talimatları doğrultusunda verilmelidir.';

const KAYNAKLAR: DijitalKaynak[] = [y01, y02, y03, y04, y05, y06, y07, y08, y09, y10]
  .sort((a, b) => a.sira - b.sira);

/** Yazının sonundaki dizi listesi; bulunulan bölüm bağlantısız ve kalın. */
function diziListesi(aktif: string): BlogBlok[] {
  return [
    { tip: 'h', metin: DIJITAL_SET_ADI },
    { tip: 'p', metin: 'Bu yazı, diş hekimlerine yönelik dijital hekimlik dizisinin bir bölümüdür. Dizinin diğer yazıları:' },
    { tip: 'liste', ogeler: KAYNAKLAR.map(k => k.slug === aktif ? `**${k.title}** (bu yazı)` : `[${k.title}](/blog/${k.slug})`) },
  ];
}

export const DIJITAL_YAZILARI: BlogYazi[] = KAYNAKLAR.map(k => ({
  slug: k.slug,
  title: k.title,
  summary: k.summary,
  category: DIJITAL_KATEGORI,
  author: 'Hekimhane Editör',
  created_at: k.created_at,
  okumaDk: okumaSuresi(k.metin),
  cover_image: `/blog/${k.slug}.svg`,
  cover_alt: k.cover_alt,
  views: 0,
  govde: [...parseGovde(k.metin), ...diziListesi(k.slug), { tip: 'p', metin: UYARI }],
}));
