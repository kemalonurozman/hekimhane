// ================================================================
// Yorum → schema.org (Review + AggregateRating) — tek kaynak.
// Dört profil sayfası (klinik / hastane / doktor / eczane) buradan okur.
//
// Google kuralı: bir işletmede birden çok `review` varsa `aggregateRating`
// ZORUNLU ("Multiple reviews without aggregateRating object" → geçersiz).
// Eskiden aggregateRating işletme satırındaki `rat && rev` kolonlarına
// bağlıydı; yorum yazılınca bu kolonlar değişmediği için yorumu olan ama
// kolonu boş işletmelerde review var, aggregateRating yoktu.
//
// Artık ikisi de aynı kaynaktan — sayfada gösterilen (gizli olmayan)
// yorumlardan — üretilir; puan da profil hero'sundaki değerle aynı hesap
// (`yorumOrtalama`). Yorum yoksa ikisi de yazılmaz (sayfa "Henüz
// değerlendirme yok" der; markup da öyle). Sunucu importu KOYMA —
// ProfilSayfasi (client) de kullanıyor.
// ================================================================

export interface YorumPuanli {
  rating: number;
}

/** Profil hero'sundaki puan: küçük örneklemde 4,2'ye doğru yumuşatılmış ortalama. */
export function yorumOrtalama(reviews: YorumPuanli[]): number {
  const C = 4.2, m = 8;
  if (!reviews.length) return C;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const w = (m * C + reviews.length * avg) / (m + reviews.length);
  return +w.toFixed(1);
}

interface YorumGirdi {
  author?: string | null;
  rating?: number | null;
  text?: string | null;
  date?: string | null;
  created_at?: string | null;
}

function gecerliPuan(r: unknown): r is number {
  return typeof r === 'number' && Number.isFinite(r) && r >= 1 && r <= 5;
}

/** "2025-03" ya da tam ISO tarih; ikisi de schema.org Date için geçerli. */
function yayinTarihi(y: YorumGirdi): string | undefined {
  const c = (y.created_at || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(c)) return c.slice(0, 10);
  const d = (y.date || '').trim();
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(d)) return d;
  return undefined;
}

/**
 * JSON-LD'ye yayılacak alanlar: `{ aggregateRating, review }` ya da boş nesne.
 * - aggregateRating: puanı geçerli (1–5) tüm görünür yorumlardan.
 * - review: metni olan ilk `limit` yorum (puanı geçersiz olan markup'a girmez).
 * aggregateRating olmadan review asla yazılmaz.
 */
export function yorumJsonLd(
  yorumlar: YorumGirdi[],
  maskName: (n?: string | null) => string,
  limit = 5,
): Record<string, unknown> {
  const puanli = yorumlar.filter(y => gecerliPuan(y.rating)) as (YorumGirdi & { rating: number })[];
  if (!puanli.length) return {};

  const out: Record<string, unknown> = {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: yorumOrtalama(puanli),
      ratingCount: puanli.length,
      reviewCount: puanli.length,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const metinli = puanli.filter(y => (y.text || '').trim()).slice(0, limit);
  if (metinli.length) {
    out.review = metinli.map(y => {
      const tarih = yayinTarihi(y);
      return {
        '@type': 'Review',
        author: { '@type': 'Person', name: maskName(y.author) },
        reviewRating: { '@type': 'Rating', ratingValue: y.rating, bestRating: 5, worstRating: 1 },
        reviewBody: (y.text || '').trim(),
        ...(tarih ? { datePublished: tarih } : {}),
      };
    });
  }
  return out;
}
