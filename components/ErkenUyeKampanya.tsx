// ─────────────────────────────────────────────────────────────────
//  Ana sayfa — "İlk ERKEN_UYE_KOTA işletmeye ücretsiz Pro" bandı (Eki 2026).
//  Hero ile koyu vitrin arasındaki geçişte durur. Kontenjan ERKEN_UYE_KOTA noktalık
//  bir ızgarada gösterilir: dolu noktalar verilen Pro'lar, nabız atan nokta
//  sıradaki yer. Sayı sunucudan canlı gelir (erken_uye_pro, kaynak='otomatik').
//
//  Vaat sınırı (lib/erken-uye-metin.ts ile aynı): süre yazılmaz, sıralama /
//  görünürlük vaadi yazılmaz; yalnız gerçekten açılan Pro özellikleri sayılır.
//  Hook yok → server bileşeni.
// ─────────────────────────────────────────────────────────────────
import Link from 'next/link';
import { ERKEN_UYE_KOTA, ERKEN_UYE_OZELLIKLER } from '@/lib/erken-uye-metin';

const CSS = `
.euk-bant{background:linear-gradient(180deg,#FBFBFD 0%,#F2F4F8 100%);padding:8px 0 56px}
.euk-kart{position:relative;overflow:hidden;border-radius:28px;background:radial-gradient(120% 140% at 100% 0%,#1E4A82 0%,#12294D 46%,#0B1B35 100%);color:#fff;padding:44px 48px;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:44px;align-items:center;box-shadow:0 24px 60px -28px rgba(18,41,77,.55)}
.euk-kart::before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(222,194,131,.10) 48%,transparent 62%);transform:translateX(-60%);animation:eukIsik 7s ease-in-out infinite;pointer-events:none}
.euk-rozet{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#DEC283;background:rgba(222,194,131,.12);border:1px solid rgba(222,194,131,.35);border-radius:999px;padding:6px 12px}
.euk-rozet i{width:7px;height:7px;border-radius:50%;background:#DEC283;box-shadow:0 0 0 0 rgba(222,194,131,.7);animation:eukNabiz 1.8s ease-out infinite}
.euk-h{font-size:clamp(28px,3.6vw,42px);line-height:1.08;letter-spacing:-1.4px;font-weight:700;margin:16px 0 14px}
.euk-h em{font-style:normal;background:linear-gradient(90deg,#DEC283,#C9A04A 60%,#F3DFA8);-webkit-background-clip:text;background-clip:text;color:transparent}
.euk-p{font-size:16px;line-height:1.6;color:rgba(255,255,255,.78);margin:0 0 20px;max-width:540px}
.euk-ozler{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px;padding:0;list-style:none}
.euk-ozler li{font-size:13px;font-weight:600;color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 12px;display:inline-flex;align-items:center;gap:6px}
.euk-ozler svg{color:#DEC283;flex-shrink:0}
.euk-dugmeler{display:flex;flex-wrap:wrap;gap:10px}
.euk-d{display:inline-flex;align-items:center;gap:8px;min-height:50px;padding:0 22px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;transition:transform .2s ease,background .2s ease}
.euk-d:hover{transform:translateY(-2px)}
.euk-d--altin{color:#12294D}
.euk-d--cerceve{color:#fff;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.04)}
.euk-d--cerceve:hover{background:rgba(255,255,255,.1)}
.euk-guvence{font-size:13px;color:rgba(255,255,255,.6);margin:16px 0 0}
.euk-kont{position:relative;width:100%;max-width:380px;justify-self:end;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:24px}
.euk-kont-ust{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:18px}
.euk-sayi{font-size:52px;font-weight:700;letter-spacing:-2px;line-height:1;font-variant-numeric:tabular-nums;color:#fff}
.euk-sayi small{white-space:nowrap;font-size:15px;font-weight:600;letter-spacing:0;color:rgba(255,255,255,.65);margin-left:8px}
.euk-etiket{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.55);text-align:right}
.euk-izgara{display:grid;grid-template-columns:repeat(15,minmax(0,1fr));gap:5px}
.euk-nokta{aspect-ratio:1;border-radius:50%;border:1.5px solid rgba(255,255,255,.22);opacity:0;animation:eukBelir .5s ease forwards}
.euk-nokta--dolu{background:linear-gradient(135deg,#F3DFA8,#C9A04A);border-color:transparent}
.euk-nokta--sira{border-color:#DEC283;box-shadow:0 0 0 0 rgba(222,194,131,.7);animation:eukBelir .5s ease forwards,eukNabiz 1.8s ease-out 1.2s infinite}
.euk-kont-alt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;font-size:13px;color:rgba(255,255,255,.7)}
.euk-lejant{display:inline-flex;align-items:center;gap:6px}
.euk-lejant b{width:10px;height:10px;border-radius:50%;display:inline-block}
.euk-not{font-size:12px;color:rgba(255,255,255,.5);margin:14px 0 0;line-height:1.5}
@keyframes eukBelir{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes eukNabiz{0%{box-shadow:0 0 0 0 rgba(222,194,131,.7)}100%{box-shadow:0 0 0 9px rgba(222,194,131,0)}}
@keyframes eukIsik{0%,100%{transform:translateX(-60%)}50%{transform:translateX(60%)}}
@media (max-width:900px){.euk-kart{grid-template-columns:minmax(0,1fr);padding:30px 22px;gap:28px;border-radius:22px}.euk-bant{padding:4px 0 40px}.euk-sayi{font-size:44px}.euk-kont{max-width:none;justify-self:stretch}.euk-kont-ust{flex-direction:column;align-items:flex-start;gap:6px}.euk-etiket{text-align:left}.euk-etiket br{display:none}.euk-d{flex:1 1 220px;justify-content:center}}
@media (prefers-reduced-motion:reduce){.euk-kart::before,.euk-rozet i,.euk-nokta,.euk-nokta--sira{animation:none;opacity:1}}
`;

const Tik = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);

export default function ErkenUyeKampanya({ kullanilan }: { kullanilan: number }) {
  const dolu = Math.min(ERKEN_UYE_KOTA, Math.max(0, kullanilan));
  const kalan = ERKEN_UYE_KOTA - dolu;
  if (kalan <= 0) return null;

  return (
    <section className="euk-bant" aria-labelledby="euk-baslik">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <div className="euk-kart">
          <div>
            <span className="euk-rozet"><i aria-hidden="true" />İlk {ERKEN_UYE_KOTA} işletmeye özel</span>
            <h2 id="euk-baslik" className="euk-h">
              Hekimhane-Pro, ilk {ERKEN_UYE_KOTA} işletmeye <em>ücretsiz.</em>
            </h2>
            <p className="euk-p">
              Profilinizi sahiplenin ya da işletmenizi ekleyin. Başvurunuz onaylandığı anda hesabınız
              Pro&apos;ya geçer ve randevu takvimi dahil tüm Pro araçları açılır. Kontenjan sınırlı;
              yerler onay sırasına göre dolar.
            </p>
            <ul className="euk-ozler">
              {ERKEN_UYE_OZELLIKLER.map(o => <li key={o.baslik}><Tik />{o.baslik}</li>)}
            </ul>
            <div className="euk-dugmeler">
              <Link href="/klinikler" className="euk-d euk-d--altin hk-cta-isik">İşletmemi bulup sahipleneyim →</Link>
              <Link href="/katil" className="euk-d euk-d--cerceve">Listede yoksa ekleyin</Link>
            </div>
            <p className="euk-guvence">Kart bilgisi istenmez, hiçbir ücret alınmaz.</p>
          </div>

          <div className="euk-kont" role="img" aria-label={`${ERKEN_UYE_KOTA} yerlik kontenjanın ${dolu} yeri doldu, ${kalan} yer kaldı`}>
            <div className="euk-kont-ust">
              <div className="euk-sayi">{kalan}<small>yer kaldı</small></div>
              <div className="euk-etiket">Ücretsiz Pro{' '}<br />kontenjanı</div>
            </div>
            <div className="euk-izgara" aria-hidden="true">
              {Array.from({ length: ERKEN_UYE_KOTA }, (_, i) => (
                <span key={i}
                  className={`euk-nokta${i < dolu ? ' euk-nokta--dolu' : ''}${i === dolu ? ' euk-nokta--sira' : ''}`}
                  style={{ animationDelay: `${Math.round(i * 6)}ms` }} />
              ))}
            </div>
            <div className="euk-kont-alt" aria-hidden="true">
              <span className="euk-lejant"><b style={{ background: 'linear-gradient(135deg,#F3DFA8,#C9A04A)' }} />Dolu: {dolu}</span>
              <span className="euk-lejant"><b style={{ border: '1.5px solid #DEC283' }} />Sıradaki yer sizin olabilir</span>
            </div>
            <p className="euk-not">Kontenjan, sahipliği onaylanan ilk {ERKEN_UYE_KOTA} işletmeyle dolar. Sayı canlıdır.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
