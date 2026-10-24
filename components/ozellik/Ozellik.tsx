// Özellik sayfası dili (Eki 2026) — "Özellikler" menüsündeki tüm tanıtım sayfaları
// bu bölüm bileşenleriyle kurulur; görünüm Booking sayfasından türedi.
// Stiller app/globals.css → "Özellik sayfası dili" (oz- öneki). Hook yok → server bileşeni.
//
// Sayfa iskeleti (öneri sırası):
//   <OzSayfa> → <OzHero> → <OzBant> → <OzIzgara> → <OzAdimlar> → <OzKartlar> → (sayfaya özel bölüm) → <OzKapanis> → <OzSss>
// Kurallar: doğrulanamayan sayı/oran yazma; ikon yalnız HkIcon; birincil düğme altın ışıklı (OzDugme tur="altin").
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import NoktaGrafik from '@/components/vitrin/NoktaGrafik';

export type OzBaglanti = { ad: string; href: string };

/** Düğme: altin = hareketli ışıklı ana düğme; koyu; acik; cerceve (açık zeminde); cerceveAcik (koyu zeminde) */
export function OzDugme({ ad, href, tur = 'altin' }: OzBaglanti & { tur?: 'altin' | 'koyu' | 'acik' | 'cerceve' | 'cerceveAcik' }) {
  const sinif = {
    altin: 'vt-dugme oz-dugme--altin hk-cta-isik',
    koyu: 'vt-dugme vt-dugme--koyu',
    acik: 'vt-dugme vt-dugme--acik',
    cerceve: 'vt-dugme oz-dugme--cerceve',
    cerceveAcik: 'vt-dugme oz-dugme--cerceve-acik',
  }[tur];
  const dis = /^https?:/.test(href);
  // Altın ve çerçeveli düğmelerde sağda kayan ok (Apple tarzı) — hover'da hafifçe ilerler
  const ic = (tur === 'altin' || tur === 'cerceve' || tur === 'cerceveAcik')
    ? <><span className="oz-dugme__yazi">{ad}</span><svg className="oz-dugme__ok" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
    : ad;
  if (href.startsWith('#') || dis) return <a href={href} className={sinif} {...(dis ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{ic}</a>;
  return <Link href={href} className={sinif}>{ic}</Link>;
}

export function OzSayfa({ children, jsonLd }: { children: React.ReactNode; jsonLd?: object }) {
  return (
    <div className="oz">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {children}
    </div>
  );
}

/** Açık zeminli giriş: rozet + iri başlık (ikinci parça vurgulu) + metin + iki düğme + sağda çizim */
export function OzHero({ rozet, urun, baslik, govde, birincil, birincilOzel, ikincil, sahne, alt }: {
  rozet?: 'Yeni' | 'Pro' | 'Ücretsiz';
  urun: string;
  baslik: [string, string];
  govde: React.ReactNode;
  birincil?: OzBaglanti;
  /** birincil yerine istemci düğmesi (ör. /pro'daki Stripe düğmesi) */
  birincilOzel?: React.ReactNode;
  ikincil?: OzBaglanti;
  sahne: React.ReactNode;
  alt?: React.ReactNode;
}) {
  return (
    <section className="oz-hero">
      <div className="container oz-hero__izgara">
        <div className="oz-hero__metin">
          <div className="oz-rozetler">
            {rozet && <span className={rozet === 'Ücretsiz' ? 'oz-yeni oz-yeni--ucretsiz' : 'oz-yeni'}>{rozet}</span>}
            <span className="oz-urun">{urun}</span>
          </div>
          <h1 className="vt-h1 oz-h1">{baslik[0]} <em>{baslik[1]}</em></h1>
          <p className="vt-govde">{govde}</p>
          <div className="oz-cta">
            {birincilOzel ?? (birincil && <OzDugme {...birincil} tur="altin" />)}
            {ikincil && <OzDugme {...ikincil} tur="cerceve" />}
          </div>
          {alt}
        </div>
        {sahne}
      </div>
    </section>
  );
}

/** Sağdaki çizim çerçevesi: beyaz kart + köşede noktalı ikon silueti. İçine oz-cagri / oz-b / oz-onaykart vb. koy. */
export function OzSahne({ ikon, children }: { ikon: HkIkonAdi; children: React.ReactNode }) {
  return (
    <div className="oz-sahne" aria-hidden="true">
      <NoktaGrafik ikon={ikon} size={520} renk="rgba(26,51,94,.16)" />
      {children}
    </div>
  );
}

/** Sahne içi koyu başlık kartı (ör. "Gelen çağrı", "Yeni randevu") */
export function OzSahneBaslik({ ikon, baslik, alt, durum }: { ikon: HkIkonAdi; baslik: string; alt?: string; durum?: string }) {
  return (
    <div className="oz-cagri">
      <span className="oz-cagri__ikon"><span className="oz-halka" /><HkIcon name={ikon} size={20} color="#fff" accent="#DEC283" /></span>
      <div>
        <strong>{baslik}</strong>
        {alt && <small>{alt}</small>}
      </div>
      {durum && <span className="oz-canli"><i />{durum}</span>}
    </div>
  );
}

/** Sohbet balonları: kim = 'asistan' (beyaz, sol) | 'kisi' (altın, sağ). Sırayla belirir. */
export function OzBalonlar({ balonlar }: { balonlar: { kim: 'asistan' | 'kisi'; metin: string }[] }) {
  return (
    <div className="oz-sohbet">
      {balonlar.map((b, i) => (
        <p key={i} className={`oz-b ${b.kim === 'asistan' ? 'oz-b--asistan' : 'oz-b--hasta'}`} style={{ animationDelay: `${0.2 + i * 0.9}s` }}>{b.metin}</p>
      ))}
    </div>
  );
}

/** Sahne içi teal onay kartı */
export function OzOnayKart({ ust, baslik, alt, gecikme = 3.6 }: { ust: string; baslik: string; alt?: string; gecikme?: number }) {
  return (
    <div className="oz-onaykart" style={{ animationDelay: `${gecikme}s` }}>
      <span className="oz-onaykart__tik">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      <div>
        <small>{ust}</small>
        <strong>{baslik}</strong>
        {alt && <span>{alt}</span>}
      </div>
    </div>
  );
}

/** Koyu lacivert bant + 2–4 fayda kartı (üstte küçük çizim alanı) */
export function OzBant({ baslik, alt, kartlar, cta }: {
  baslik: string; alt?: string;
  kartlar: { baslik: string; metin: string; gorsel?: React.ReactNode; ikon?: HkIkonAdi }[];
  cta?: OzBaglanti;
}) {
  return (
    <section className="oz-bant">
      <div className="container">
        <h2 className="vt-h2 oz-bant__baslik">{baslik}</h2>
        {alt && <p className="oz-bant__alt">{alt}</p>}
        <div className="oz-faydalar" style={{ ['--oz-sutun' as string]: Math.min(kartlar.length, 4) } as React.CSSProperties}>
          {kartlar.map(k => (
            <article key={k.baslik} className="oz-fayda">
              <div className="oz-fayda__gorsel" aria-hidden="true">
                {k.gorsel ?? (k.ikon && <span className="oz-fayda__ikon"><HkIcon name={k.ikon} size={40} color="#12294D" /></span>)}
              </div>
              <div className="oz-fayda__metin">
                <h3>{k.baslik}</h3>
                <p>{k.metin}</p>
              </div>
            </article>
          ))}
        </div>
        {cta && <div style={{ textAlign: 'center', marginTop: 40 }}><OzDugme {...cta} tur="altin" /></div>}
      </div>
    </section>
  );
}

/** Açık gri zeminde büyük kart ızgarası: etiket + ad + madde listesi ya da metin; köşede noktalı ikon */
export function OzIzgara({ id, ustyazi, baslik, govde, ogeler, zemin = 'gri' }: {
  id?: string; ustyazi?: string; baslik: string; govde?: string; zemin?: 'gri' | 'beyaz';
  ogeler: { etiket: string; ad: string; ikon: HkIkonAdi; renk?: string; maddeler?: string[]; metin?: string; href?: string; rozet?: 'Pro' | 'Yeni' | 'Ücretsiz' }[];
}) {
  return (
    <section id={id} className={zemin === 'gri' ? 'vt-zemin vt-bolum' : 'vt-bolum'} style={{ scrollMarginTop: 64, ...(zemin === 'beyaz' ? { background: '#fff' } : null) }}>
      <div className="container">
        {ustyazi && <p className="vt-ustyazi">{ustyazi}</p>}
        <h2 className="vt-h2">{baslik}</h2>
        {govde && <p className="vt-govde">{govde}</p>}
        <div className="vt-izgara oz-kanal-izgara">
          {ogeler.map(o => {
            const ic = (
              <>
                <NoktaGrafik ikon={o.ikon} size={200} renk={o.renk || 'rgba(26,95,208,.4)'} />
                <span className="vt-oz__etiket">{o.etiket}{o.rozet && <span className={o.rozet === 'Yeni' ? 'vt-yeni' : o.rozet === 'Ücretsiz' ? 'vt-ucretsiz' : 'vt-pro'} style={{ marginLeft: 8, verticalAlign: 'middle' }}>{o.rozet}</span>}</span>
                <h3 className="vt-oz__ad">{o.ad}</h3>
                {o.metin && <p className="vt-oz__metin">{o.metin}</p>}
                {o.maddeler && (
                  <ul className="oz-madde">
                    {o.maddeler.map(m => (
                      <li key={m}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E8E5A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            );
            return o.href
              ? <Link key={o.ad} href={o.href} className="vt-oz">{ic}</Link>
              : <article key={o.ad} className="vt-oz">{ic}</article>;
          })}
        </div>
      </div>
    </section>
  );
}

/** Numaralı adımlar (2–4) */
export function OzAdimlar({ id, ustyazi = 'Nasıl çalışır?', baslik, adimlar }: {
  id?: string; ustyazi?: string; baslik: string; adimlar: { baslik: string; metin: string }[];
}) {
  return (
    <section id={id} className="vt-bolum oz-nasil">
      <div className="container">
        <p className="vt-ustyazi">{ustyazi}</p>
        <h2 className="vt-h2">{baslik}</h2>
        <ol className="oz-adimlar" style={{ ['--oz-sutun' as string]: Math.min(adimlar.length, 4) } as React.CSSProperties}>
          {adimlar.map((a, i) => (
            <li key={a.baslik}>
              <span className="oz-adim__no">{i + 1}</span>
              <h3>{a.baslik}</h3>
              <p>{a.metin}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** İkonlu küçük kartlar (güven, özellik listesi) — 4'lü ızgara */
export function OzKartlar({ ustyazi, baslik, govde, ogeler, zemin = 'gri' }: {
  ustyazi?: string; baslik: string; govde?: string; zemin?: 'gri' | 'beyaz';
  ogeler: { ikon: HkIkonAdi; baslik: string; metin: string }[];
}) {
  return (
    <section className={zemin === 'gri' ? 'vt-zemin vt-bolum' : 'vt-bolum'} style={zemin === 'beyaz' ? { background: '#fff' } : undefined}>
      <div className="container">
        {ustyazi && <p className="vt-ustyazi">{ustyazi}</p>}
        <h2 className="vt-h2">{baslik}</h2>
        {govde && <p className="vt-govde">{govde}</p>}
        <div className="oz-guven">
          {ogeler.map(g => (
            <div key={g.baslik} className="oz-guven__kart">
              <span className="oz-guven__ikon"><HkIcon name={g.ikon} size={26} color="#12294D" /></span>
              <h3>{g.baslik}</h3>
              <p>{g.metin}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Koyu kapanış bandı + düğmeler */
export function OzKapanis({ baslik, metin, birincil, birincilOzel, ikincil, id }: { baslik: string; metin?: string; birincil?: OzBaglanti; birincilOzel?: React.ReactNode; ikincil?: OzBaglanti; id?: string }) {
  return (
    <section id={id} className="oz-kapanis">
      <div className="container">
        <h2 className="vt-h2">{baslik}</h2>
        {metin && <p>{metin}</p>}
        <div className="oz-cta">
          {birincilOzel ?? (birincil && <OzDugme {...birincil} tur="altin" />)}
          {ikincil && <OzDugme {...ikincil} tur="cerceveAcik" />}
        </div>
      </div>
    </section>
  );
}

/** Sık sorulan sorular (details/summary) */
export function OzSss({ sorular, baslik = 'Sık sorulan sorular', alt }: { sorular: { s: string; c: string }[]; baslik?: string; alt?: React.ReactNode }) {
  return (
    <section className="vt-zemin vt-bolum">
      <div className="container oz-sss">
        <h2 className="vt-h2">{baslik}</h2>
        <div className="oz-sss__liste">
          {sorular.map(x => (
            <details key={x.s}>
              <summary>{x.s}</summary>
              <p>{x.c}</p>
            </details>
          ))}
        </div>
        {alt && <div className="oz-sss__alt">{alt}</div>}
      </div>
    </section>
  );
}

/** SSS için FAQPage JSON-LD parçası */
export const sssJsonLd = (sorular: { s: string; c: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: sorular.map(x => ({ '@type': 'Question', name: x.s, acceptedAnswer: { '@type': 'Answer', text: x.c } })),
});
