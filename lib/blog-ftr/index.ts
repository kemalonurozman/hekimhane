// Fizik Tedavi ve Rehabilitasyon yazı dizisi — 14 yazı, 26 Ekim–8 Kasım 2026,
// her gün 09:00'da (TR) bir yazı yayına girer (zamanlama: lib/blog-data.ts).
// Yeni yazı: NN-slug.ts ekle (biçim: ./tip.ts) ve aşağıdaki listeye koy.
import type { BlogYazi } from '../blog-data';
import { parseGovde, okumaSuresi } from '../makale-icerik';
import type { FtrKaynak } from './tip';

import y01 from './01-kas-iskelet-sistemi-hastaliklari-tani-ve-tedavi';
import y02 from './02-emg-elektromiyografi-nedir';
import y03 from './03-kinezyo-bant-uygulamalari';
import y04 from './04-fibromiyalji-ve-kronik-agri-sendromlari';
import y05 from './05-dry-needling-kuru-igneleme';
import y06 from './06-kas-iskelet-ultrasonu-ve-ultrason-esliginde-tedavi';
import y07 from './07-norolojik-rehabilitasyon-inme-parkinson-serebral-palsi';
import y08 from './08-eklem-ici-enjeksiyonlar';
import y09 from './09-el-rehabilitasyonu-tendon-sinir-yaralanmalari';
import y10 from './10-osteoporoz-tedavisi-ve-mbst';
import y11 from './11-geriatrik-rehabilitasyon';
import y12 from './12-romatolojik-hastaliklarda-rehabilitasyon';
import y13 from './13-spor-yaralanmalari-ve-mbst';
import y14 from './14-ortopedik-rehabilitasyon-ameliyat-sonrasi';

export const FTR_KATEGORI = 'Fizik Tedavi ve Rehabilitasyon';

const UYARI =
  'Bu içerik yalnızca genel bilgilendirme amaçlıdır; hekim muayenesinin, tanı ve tedavinin yerini tutmaz. Şikâyetleriniz için bir fiziksel tıp ve rehabilitasyon uzmanına ya da ilgili hekime başvurun.';

const KAYNAKLAR: FtrKaynak[] = [y01, y02, y03, y04, y05, y06, y07, y08, y09, y10, y11, y12, y13, y14];

export const FTR_YAZILARI: BlogYazi[] = KAYNAKLAR.map(k => ({
  slug: k.slug,
  title: k.title,
  summary: k.summary,
  category: FTR_KATEGORI,
  author: 'Hekimhane Editör',
  created_at: k.created_at,
  okumaDk: okumaSuresi(k.metin),
  cover_image: `/blog/${k.slug}.svg`,
  cover_alt: k.cover_alt,
  views: 0,
  govde: [...parseGovde(k.metin), { tip: 'p', metin: UYARI }],
}));
