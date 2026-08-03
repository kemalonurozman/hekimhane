// ─────────────────────────────────────────────────────────────────
//  Makale içeriği — düz metin biçimi.
//
//  Panelden/adminden yazılan makaleler `blog_posts.content` alanında
//  DÜZ METİN olarak saklanır (HTML değil — XSS yüzeyi açmamak için).
//  Biçimlendirme kuralları, editördeki ipucu metniyle birebir aynı:
//
//    ## Başlık        → ara başlık (h2)
//    - Madde          → madde işaretli liste
//    boş satır        → yeni paragraf
//
//  Render tarafı `parseGovde()` çıktısını `BlogBlok[]` olarak alır ve
//  statik blog yazılarıyla aynı bileşenlerle basar.
// ─────────────────────────────────────────────────────────────────
import type { BlogBlok } from './blog-data';

export const MAKALE_KATEGORILERI = [
  'Diş Sağlığı',
  'Tedaviler',
  'Estetik',
  'Çocuk Diş Sağlığı',
  'Hasta Rehberi',
  'İşletmeler İçin',
];

export const ICERIK_IPUCU =
  'Biçimlendirme: ## Başlık · - Madde · **kalın** · [bağlantı](https://...) · > Alıntı · ![görsel](https://...). Paragrafları boş satırla ayırın.';

/** Başlıktan URL slug'ı üretir (Türkçe karakter uyumlu). */
export function makaleSlug(text: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return String(text || '')
    .split('').map(ch => map[ch] ?? ch).join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
    .replace(/^-|-$/g, '');
}

/** Düz metni blog bloklarına çevirir. */
export function parseGovde(text: string): BlogBlok[] {
  const bloklar: BlogBlok[] = [];
  let liste: string[] = [];
  let paragraf: string[] = [];

  const listeyiKapat = () => {
    if (liste.length) { bloklar.push({ tip: 'liste', ogeler: liste }); liste = []; }
  };
  const paragrafiKapat = () => {
    if (paragraf.length) { bloklar.push({ tip: 'p', metin: paragraf.join(' ') }); paragraf = []; }
  };

  for (const ham of String(text || '').split(/\r?\n/)) {
    const satir = ham.trim();

    if (!satir) { paragrafiKapat(); listeyiKapat(); continue; }

    if (satir.startsWith('##')) {
      paragrafiKapat(); listeyiKapat();
      const baslik = satir.replace(/^#+\s*/, '').trim();
      if (baslik) bloklar.push({ tip: 'h', metin: baslik });
      continue;
    }

    // Görsel: ![alt](https://...)
    const gorsel = satir.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
    if (gorsel) {
      paragrafiKapat(); listeyiKapat();
      bloklar.push({ tip: 'gorsel', url: gorsel[2], alt: gorsel[1] || '' });
      continue;
    }

    // Alıntı: > metin
    if (/^>\s+/.test(satir)) {
      paragrafiKapat(); listeyiKapat();
      bloklar.push({ tip: 'alinti', metin: satir.replace(/^>\s+/, '').trim() });
      continue;
    }

    if (/^[-*•]\s+/.test(satir)) {
      paragrafiKapat();
      liste.push(satir.replace(/^[-*•]\s+/, '').trim());
      continue;
    }

    listeyiKapat();
    paragraf.push(satir);
  }

  paragrafiKapat(); listeyiKapat();
  return bloklar;
}

/** Kabaca 200 kelime/dakika — en az 1 dk. */
export function okumaSuresi(text: string): number {
  const kelime = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(kelime / 200));
}

/** Editörden gelen içerik yeterli mi? */
export function icerikGecerli(text: string): boolean {
  return String(text || '').trim().length >= 300;
}
