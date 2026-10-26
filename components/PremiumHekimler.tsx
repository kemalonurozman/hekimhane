import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Klinik } from '@/lib/types';
import HkAvatar from '@/components/HkAvatar';
import AraDugmesi from '@/components/AraDugmesi';
import { puanYaz } from '@/lib/hk';
import { urlParca } from '@/lib/entity-link';

/**
 * Hastalık/tedavi sayfalarının altındaki "bu alanda hizmet veren Pro üyeler" bölümü.
 *
 * Yasal çerçeve (Eki 2026): sitede hiçbir hekim "önerilen / tavsiye edilen" diye
 * sunulmaz. Bu bölüm yalnız **profilinde sayfanın uzmanlığını belirten** Hekimhane
 * Pro üyesi klinikleri listeler; başlık ve açıklama bunun bir öneri ya da nitelik
 * değerlendirmesi olmadığını söyler. Uzmanlığı eşleşen üye yoksa başlık genel olur
 * ("Hekimhane Pro üyesi diş hekimleri") — eşleşmeyen klinik, eşleşiyormuş gibi
 * gösterilmez. Pro üye hiç yoksa bölüm hiç çizilmez.
 */
export default async function PremiumHekimler({ uzmanlik, limit = 3 }: { uzmanlik?: string; limit?: number }) {
  let klinikler: Klinik[] = [];
  try {
    const { data } = await supabase.from('klinikler').select('*').eq('premium', true).limit(24);
    klinikler = (data || []) as Klinik[];
  } catch {
    return null;
  }
  if (!klinikler.length) return null;

  // Uzmanlık eşleşmesi: klinik, sayfanın uzmanlığını profilinde belirtmiş mi?
  const uz = (uzmanlik || '').trim().toLowerCase();
  const eslesir = (k: Klinik) => {
    if (!uz) return false;
    const specs = (k.specs || []).map(s => s.toLowerCase());
    return specs.some(s => s.includes(uz) || uz.includes(s));
  };
  const eslesenler = klinikler.filter(eslesir);
  const havuz = eslesenler.length ? eslesenler : klinikler;
  const secili = [...havuz].sort((a, b) => (b.rev || 0) - (a.rev || 0)).slice(0, limit);

  // Başlık: genel "Diş Hekimliği" uzmanlığı kendi adıyla tekrarlanınca anlamsız olur.
  const genelDis = /^diş hekimliği$/i.test((uzmanlik || '').trim());
  const baslik = eslesenler.length
    ? (genelDis ? 'Bu konuda hizmet veren diş hekimleri' : `${uzmanlik} alanında hizmet veren diş hekimleri`)
    : 'Hekimhane Pro üyesi diş hekimleri';
  const aciklama = eslesenler.length
    ? (genelDis
        ? 'Profilinde diş hekimliği hizmetlerini belirten Hekimhane Pro üyesi klinikler.'
        : `Profilinde ${uzmanlik} uzmanlığını belirten Hekimhane Pro üyesi klinikler.`)
    : 'Hekimhane Pro üyesi diş klinikleri.';

  return (
    <section className="pk-bolum" aria-label={baslik}>
      <div className="pk-ust">
        <span className="pk-etiket">Hekimhane Pro üyeleri</span>
        <h2 className="pk-baslik">{baslik}</h2>
        <p className="pk-aciklama">
          {aciklama} Liste bir öneri, tavsiye ya da nitelik değerlendirmesi değildir; profilden telefon veya randevu
          ile iletişime geçebilirsiniz.
        </p>
      </div>
      <div className="pk-izgara">
        {secili.map(k => <KompaktKart key={k.id} k={k} />)}
      </div>
    </section>
  );
}

/** Kompakt klinik kartı — tek yükseklik: ad 2 satır, uzmanlık ve konum 1 satır, iki küçük düğme. */
function KompaktKart({ k }: { k: Klinik }) {
  const profil = k.slug
    ? `/klinikler/${urlParca(k.il || 'turkiye')}/${urlParca(k.ilce || 'merkez')}/${k.slug}`
    : `/klinikler/${k.id}`;
  const specs = (k.specs || []).filter(Boolean);
  const konum = [k.ilce, k.il].filter(Boolean).join(', ');
  const ad = k.name.split('/')[0].trim() || k.name; // "Ad / Kanal Tedavisi / İmplant …" → yalnız ad

  return (
    <article className="pk-kart">
      <div className="pk-kart__ust">
        <HkAvatar src={k.logo} name={ad} size={44} />
        <div className="pk-kart__kimlik">
          <h3 className="pk-kart__ad" title={k.name}>
            <Link href={profil}>{ad}</Link>
          </h3>
          {specs.length > 0 && (
            <div className="pk-kart__uzmanlik" title={specs.join(' · ')}>
              <span>{specs[0]}</span>
              {specs.length > 1 && <span className="pk-kart__arti">+{specs.length - 1}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="pk-kart__meta">
        {konum && (
          <span className="pk-kart__konum" title={konum}>
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> {konum}
          </span>
        )}
        {k.rev > 0 ? (
          <span className="pk-kart__puan">
            <i className="fa-solid fa-star" aria-hidden="true" /> <b>{puanYaz(k.rat)}</b> ({k.rev})
          </span>
        ) : (
          <span className="pk-kart__puan pk-kart__puan--yok">Henüz değerlendirme yok</span>
        )}
      </div>
      <div className="pk-kart__act">
        <Link href={profil} className="hk-btn hk-btn--sm hk-btn--primary">Profili gör</Link>
        {k.tel && (
          <AraDugmesi tel={k.tel} className="hk-btn hk-btn--sm hk-btn--secondary" ariaLabel={`${ad} — telefonla ara`}
            ikon={<i className="fa-solid fa-phone" aria-hidden="true" style={{ fontSize: 12 }} />} />
        )}
      </div>
    </article>
  );
}
