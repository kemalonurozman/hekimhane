'use client';

import HkIcon from '@/components/HkIcon';
import HkIconAnim from '@/components/HkIconAnim';
import type { HkIkonAdi } from '@/lib/hk-icons';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ILCELER } from '@/lib/tr-il-ilce';
import { DOKTOR_BRANSLARI } from '@/lib/doktor-branslari';

/* ── SVG ikonlar ─────────────────────────────────────────── */
function IcTooth() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7C7 4.5 8.5 2.5 10 2.5Q11 4 12 5Q13 4 14 2.5C15.5 2.5 17 4.5 17 7C17 8.5 16.5 10 16 11.5C15.5 13 15.5 16 16 18.5C16.5 21 16 22 14.5 22C13.5 22 13 20.5 12.5 19L12 17L11.5 19C11 20.5 10.5 22 9.5 22C8 22 7.5 21 8 18.5C8.5 16 8.5 13 8 11.5C7.5 10 7 8.5 7 7Z"/>
    </svg>
  );
}
function IcHospital() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  );
}
function IcDoctor() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M5 21v-1a7 7 0 0 1 7-7 7 7 0 0 1 7 7v1"/>
      <path d="M16 11h3M17.5 9.5v3"/>
    </svg>
  );
}
function IcPill() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  );
}
function IcCheck() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="24" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2"/>
      <path d="M16 26l7 7 13-14" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcChevLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 4 6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function Ic360() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8c-2.2 0-4 .9-4 2s1.8 2 4 2 4-.9 4-2-1.8-2-4-2z"/>
      <path d="M8 12v2c0 1.1 1.8 2 4 2s4-.9 4-2v-2"/>
      <path d="M17 7l2-2M7 7L5 5M17 17l2 2M7 17l-2 2"/>
    </svg>
  );
}

/* ── Tipler ──────────────────────────────────────────────── */
type BusinessType = 'klinik' | 'hastane' | 'doktor' | 'eczane';

interface FormData {
  isletme_adi: string;
  ad_soyad:    string;
  unvan:       string;
  brans:       string;   // yalnız doktor: uzmanlık
  tel:         string;
  email:       string;
  il:          string;
  ilce:        string;
  adres:       string;
  mesaj:       string;
}

// Yerleşim: diş kliniği üstte tam genişlik, altında hastane + doktor yan yana, en altta eczane tam genişlik
const KATEGORILER: { type: BusinessType; label: string; desc: string; renk: string; bg: string; icon: React.ReactNode; soon?: boolean; tamGenislik?: boolean }[] = [
  { type: 'klinik',  label: 'Diş Kliniği / Diş Hekimi', desc: 'Muayenehane, poliklinik, ağız ve diş sağlığı merkezi', renk: '#12294D', bg: '#F1F4F9', icon: <IcTooth />, tamGenislik: true },
  { type: 'hastane', label: 'Hastane',      desc: 'Özel, devlet veya dal hastanesi',       renk: '#12294D', bg: '#F1F4F9', icon: <IcHospital /> },
  { type: 'doktor',  label: 'Doktor',       desc: 'Her uzmanlık dalından bireysel hekim', renk: '#12294D', bg: '#F1F4F9', icon: <IcDoctor /> },
  { type: 'eczane',  label: 'Eczane',       desc: 'Eczane ve nöbetçi eczane bilgisi',     renk: '#12294D', bg: '#F1F4F9', icon: <IcPill />,     tamGenislik: true },
];

const ILLER = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin',
  'Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur',
  'Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan',
  'Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta',
  'İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale',
  'Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin',
  'Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Şanlıurfa',
  'Şırnak','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van',
  'Yalova','Yozgat','Zonguldak',
];

// Yalnız gerçekten sunulan özellikler — vaat içermez
const AVANTAJLAR: { ikon: HkIkonAdi; title: string; desc: string }[] = [
  { ikon: 'verified',    title: 'Ücretsiz profil',      desc: 'Listeleme ücretsizdir. Bilgilerinizi dilediğiniz an kendiniz güncellersiniz.' },
  { ikon: 'appointment', title: 'Randevu talepleri',    desc: 'Hastaların randevu talepleri panelinize ve e-postanıza düşer.' },
  { ikon: 'review',      title: 'Yorumlara yanıt',      desc: 'Hasta değerlendirmelerini görür, her birine yanıt yazabilirsiniz.' },
  { ikon: 'hekimkart',   title: 'Dijital kartvizit',    desc: 'HekimKart ile profilinizi tek bağlantı ya da QR kodla paylaşırsınız.' },
];
// Tür satırlarındaki ikonlar — marka ikon setinden, tek renk
const TUR_IKON: Record<string, HkIkonAdi> = { klinik: 'dentistry', hastane: 'hospital', doktor: 'doctor-profile', eczane: 'pharmacy' };

/* ─────────────────────────────────────────────────────────── */
export default function KatilPage() {
  const [step,        setStep]       = useState<'kategori' | 'form' | 'tamam'>('kategori');
  const [seciliType,  setSeciliType] = useState<BusinessType | null>(null);
  const [saving,      setSaving]     = useState(false);
  const [saveError,   setSaveError]  = useState('');

  const [form, setForm] = useState<FormData>({
    isletme_adi: '', ad_soyad: '', unvan: '', brans: '', tel: '',
    email: '', il: '', ilce: '', adres: '', mesaj: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Arama kutusundan "ekleme talebi" ile gelindiyse işletme adını önceden doldur
  useEffect(() => {
    const oneri = new URLSearchParams(window.location.search).get('oneri');
    if (oneri) {
      setForm(f => ({ ...f, isletme_adi: oneri, mesaj: `"${oneri}" araması sonucunda bulunamadı — ekleme talebi.` }));
    }
  }, []);

  /* ── Fotoğraflar, 360° ─────────── */
  const [tour360url, setTour360url]   = useState('');

  const seciliKat = KATEGORILER.find(k => k.type === seciliType);

  function resetAll() {
    setForm({ isletme_adi:'',ad_soyad:'',unvan:'',brans:'',tel:'',email:'',il:'',ilce:'',adres:'',mesaj:'' });
    setErrors({});
    setSaveError('');
    setTour360url('');
  }

  // ── Adımlar tarayıcı geçmişine bağlı ──────────────────────────────────
  // Tür seçimi ayrı bir geçmiş kaydıdır (/katil?tur=klinik). Böylece tarayıcının
  // geri tuşu forma girmeden önceki sayfaya değil, tür seçimine döner; ileri tuşu
  // forma geri getirir; sayfa yenilenince seçilen tür korunur.
  const turGecerli = (t: string | null): t is BusinessType => !!t && KATEGORILER.some(k => k.type === t && !k.soon);

  useEffect(() => {
    const urldenOku = () => {
      const tur = new URLSearchParams(window.location.search).get('tur');
      if (turGecerli(tur)) { setSeciliType(tur); setStep('form'); }
      else { setStep('kategori'); }
      window.scrollTo({ top: 0 });
    };
    // İlk açılış: bağlantıda tür varsa doğrudan forma
    const ilk = new URLSearchParams(window.location.search).get('tur');
    if (turGecerli(ilk)) { setSeciliType(ilk); setStep('form'); }
    window.addEventListener('popstate', urldenOku);
    return () => window.removeEventListener('popstate', urldenOku);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTypeSelect(type: BusinessType) {
    setSeciliType(type);
    setStep('form');
    const ps = new URLSearchParams(window.location.search);
    ps.set('tur', type);
    window.history.pushState({ hkKatil: 'form' }, '', `/katil?${ps.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Formdan tür seçimine dönüş — geçmişte kendi kaydımız varsa onu geri alır (çift kayıt oluşmaz). */
  function tureDon() {
    if (window.history.state?.hkKatil === 'form') { window.history.back(); return; }
    const ps = new URLSearchParams(window.location.search); ps.delete('tur');
    window.history.replaceState(null, '', ps.toString() ? `/katil?${ps.toString()}` : '/katil');
    setStep('kategori');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.isletme_adi.trim()) e.isletme_adi = seciliType === 'doktor' ? 'Hekimin adı zorunludur' : 'İşletme adı zorunludur';
    if (!form.ad_soyad.trim())    e.ad_soyad    = 'Ad soyad zorunludur';
    if (!form.tel.trim())         e.tel         = 'Telefon zorunludur';
    if (!form.email.trim())       e.email       = 'E-posta zorunludur';
    if (!form.il)                 e.il          = 'Şehir seçin';
    if (seciliType === 'doktor' && !form.brans.trim()) e.brans = 'Uzmanlık zorunludur';
    setErrors(e);
    if (Object.keys(e).length) setTimeout(() => { const el = document.querySelector<HTMLElement>('.kf-in.hata'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.focus({ preventScroll: true }); }, 60);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    /* Ek bilgileri role alanına ekle */
    // Biçim lib/yeni-isletme.ts → basvuruBilgisi() ile çözülür (onayda kayıt buradan oluşur)
    const extraNotes  = [
      form.unvan.trim() || null,
      seciliType === 'doktor' && form.brans.trim() ? `Uzmanlık: ${form.brans.trim()}` : null,
      form.il ? (form.ilce ? `${form.il} / ${form.ilce}` : form.il) : null,
      form.adres ? `Adres: ${form.adres}` : null,
      form.mesaj ? form.mesaj.replace(/\s*\|\s*/g, ' / ') : null,
      tour360url.trim() ? `360° tur linki: ${tour360url.trim()}` : null,
      'YENİ İŞLETME BAŞVURUSU',
    ].filter(Boolean).join(' | ');

    // /api/claim (service-role) — anon insert RLS'e takıldığı için + admin ve
    // talep sahibine bildirim maili göndermek için API üzerinden.
    try {
      const res = await fetch('/api/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id:     'new',
          entity_type:   seciliType,
          entity_name:   form.isletme_adi.trim(),
          claimant_name: form.ad_soyad.trim(),
          phone:         form.tel.trim(),
          email:         form.email.trim(),
          role:          extraNotes,
          status: 'pending',
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setSaveError(data.error || 'Bir hata oluştu, lütfen tekrar deneyin.');
      } else {
        setStep('tamam');
        // Form kaydı geçmişten çıkar: geri tuşu gönderilmiş forma değil tür seçimine döner
        window.history.replaceState(null, '', '/katil');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setSaving(false);
      setSaveError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  }

  // ── Form yardımcıları ─────────────────────────────────────────────
  // Zorunlu alanlar ve doluluk oranı (üstteki ilerleme çubuğu)
  const zorunlu: (keyof FormData)[] = ['isletme_adi', 'ad_soyad', 'tel', 'email', 'il', ...(seciliType === 'doktor' ? ['brans' as const] : [])];
  const doluSayi = zorunlu.filter(k => form[k].trim()).length;
  const oran = Math.round((doluSayi / zorunlu.length) * 100);
  // kf-in: boş = gri dolgu; dolu = beyaz + belirgin çerçeve + kalın yazı + yeşil onay işareti
  const sinif = (f: keyof FormData) => `kf-in${form[f].trim() ? ' dolu' : ''}${errors[f] ? ' hata' : ''}`;
  // Yazarken o alanın hatası kalkar
  const yaz = (f: keyof FormData, v: string) => {
    setForm(o => ({ ...o, [f]: v }));
    if (errors[f]) setErrors(o => { const n = { ...o }; delete n[f]; return n; });
  };
  const err = (f: keyof FormData) => errors[f] ? <p className="kf-hata" role="alert">{errors[f]}</p> : null;

  /* ── RENDER ─────────────────────────────────────────────── */
  const formAdimi = step === 'form' && !!seciliKat;
  return (
    <div className={formAdimi ? 'kf-sayfa' : undefined} style={formAdimi ? undefined : { paddingTop: 66, background: 'var(--canvas)', minHeight: '100vh' }}>

      {/* Tür seçimi / onay: açık, sade üst bölüm */}
      {!formAdimi && (
        <div className="katil-ust">
          <div className="container">
            <span className="katil-ust__etiket">Ücretsiz listeleme</span>
            <h1 className="katil-ust__baslik">
              {step === 'tamam' ? 'Başvurunuz bize ulaştı' : 'İşletmenizi Hekimhane\'ye ekleyin'}
            </h1>
            <p className="katil-ust__alt">
              {step === 'kategori' ? 'Üç kısa adımda profilinizi oluşturun. Önce işletmenizin türünü seçin.'
                : 'İncelemenin ardından sizi e-posta ile bilgilendireceğiz.'}
            </p>
            <div className="katil-adimlar" aria-label="Başvuru adımları">
              <span className={step === 'kategori' ? 'is-aktif' : undefined}><b>1</b>Tür</span><i />
              <span><b>2</b>Bilgiler</span><i />
              <span className={step === 'tamam' ? 'is-aktif' : undefined}><b>3</b>Onay</span>
            </div>
          </div>
        </div>
      )}

      {!formAdimi && (
      <div className="container" style={{ padding: '40px 32px', maxWidth: 900 }}>
        {/* ── ADIM: Tamamlandı ───────────────────────────── */}
        {step === 'tamam' && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '44px 32px', textAlign: 'center', maxWidth: 540, margin: '0 auto', boxShadow: '0 1px 2px rgba(14,26,44,.04), 0 14px 34px -22px rgba(18,41,77,.28)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><HkIconAnim name="success" size={52} playOnView /></div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 10px' }}>Teşekkürler</h2>
            <p style={{ color: 'var(--ink-secondary)', fontSize: 15, lineHeight: 1.7, margin: '0 0 26px' }}>
              <strong style={{ color: 'var(--ink)' }}>{form.isletme_adi}</strong> için başvurunuz kaydedildi.
              Çoğu başvuruyu birkaç saat içinde, en geç 24 saatte yanıtlıyoruz; sonucu <strong style={{ color: 'var(--ink)' }}>{form.email}</strong> adresine yazacağız.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="vt-dugme oz-dugme--altin hk-cta-isik">
                Ana sayfaya dön
              </Link>
              <button type="button" onClick={() => { resetAll(); setSeciliType(null); setStep('kategori'); window.scrollTo({ top: 0 }); }}
                style={{ padding: '12px 22px', border: '1.5px solid var(--border)', background: 'white', color: '#12294D', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Başka bir işletme ekle
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM: Kategori Seçimi ───────────────────────── */}
        {step === 'kategori' && (
          <>
            {/* Tür seçimi — tek gruplu liste (iOS ayarlar düzeni): ikon · ad · açıklama · ok */}
            <div className="katil-liste" role="list">
              {KATEGORILER.map(k => (
                <button key={k.type} type="button" role="listitem" className="katil-satir"
                  onClick={() => { if (!k.soon) handleTypeSelect(k.type); }} disabled={k.soon} aria-disabled={k.soon}>
                  <span className="katil-satir__ikon"><HkIconAnim name={TUR_IKON[k.type] || 'clinic'} size={26} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="katil-satir__ad">{k.label}</span>
                    <span className="katil-satir__alt">{k.soon ? 'Çok yakında' : k.desc}</span>
                  </span>
                  <svg className="katil-satir__ok" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                </button>
              ))}
            </div>
            <p className="katil-not">
              İşletmeniz zaten listede mi? <Link href="/klinikler">Profilinizi bulun ve sahiplenin →</Link>
            </p>

            {/* Sunulanlar — dört sade sütun, vaat içermez */}
            <div className="katil-fayda">
              {AVANTAJLAR.map(a => (
                <div key={a.title}>
                  <HkIcon name={a.ikon} size={26} color="#12294D" />
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
      )}

      {/* ── ADIM: Başvuru Formu — kompakt üst bar + büyük, belirgin alanlar ── */}
      {formAdimi && seciliKat && (
        <>
          <div className="kf-ust">
            <div className="kf-ust__ic">
              <button type="button" className="kf-geri" onClick={tureDon} aria-label="Tür seçimine dön"><IcChevLeft />Tür</button>
              <div className="kf-ust__tur">
                <span className="kf-ust__ikon"><HkIcon name={TUR_IKON[seciliKat.type] || 'clinic'} size={20} color="#fff" accent="#DEC283" /></span>
                <span className="kf-ust__ad">{seciliKat.label}<small>Adım 2 / 3 · Bilgiler</small></span>
              </div>
              <div className={`kf-ilerleme${oran === 100 ? ' tamam' : ''}`} aria-live="polite">
                <span>{doluSayi}/{zorunlu.length} zorunlu alan</span>
                <div className="kf-ilerleme__cubuk" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={oran}><i style={{ width: `${oran}%` }} /></div>
              </div>
            </div>
          </div>

          <div className="kf-izgara">
            <div>
              <h1 className="kf-baslik">{seciliType === 'doktor' ? 'Hekim bilgileri' : seciliType === 'eczane' ? 'Eczane bilgileri' : seciliType === 'hastane' ? 'Hastane bilgileri' : 'Klinik bilgileri'}</h1>
              <p className="kf-alt">Başvurunuzu inceleyip size e-posta ile dönelim. Yıldızlı alanlar zorunludur.</p>

              <form onSubmit={handleSubmit} noValidate>

                <section className="kf-grup">
                  <h2 className="kf-grup__baslik">İşletme</h2>
                  <div className="kf-grup__kutu">
                    <div className="kf-alan">
                      <label htmlFor="kf-isletme">{seciliType === 'doktor' ? 'Hekimin adı soyadı' : 'İşletme adı'}<span className="z">*</span></label>
                      <div className="kf-giris">
                        <input id="kf-isletme" type="text" className={sinif('isletme_adi')} value={form.isletme_adi} autoComplete="organization"
                          placeholder={seciliType === 'doktor' ? 'Örn. Dr. Ayşe Yılmaz' : seciliType === 'klinik' ? 'Kliniğinizin ya da muayenehanenizin adı' : `${seciliKat.label} adı`}
                          onChange={e => yaz('isletme_adi', e.target.value)} />
                        <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                      </div>
                      {err('isletme_adi')}
                    </div>

                    {seciliType === 'doktor' && (
                      <div className="kf-alan">
                        <label htmlFor="kf-brans">Uzmanlık<span className="z">*</span></label>
                        <div className="kf-giris">
                          <input id="kf-brans" type="text" list="katil-branslar" className={sinif('brans')} value={form.brans} placeholder="Örn. Kardiyoloji"
                            onChange={e => yaz('brans', e.target.value)} />
                          <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                        </div>
                        <datalist id="katil-branslar">
                          {DOKTOR_BRANSLARI.map(b => <option key={b} value={b} />)}
                        </datalist>
                        {err('brans')}
                        <p className="kf-ipucu"><span>Diş hekimiyseniz geri dönüp <strong>Diş Kliniği / Diş Hekimi</strong> türünü seçin.</span></p>
                      </div>
                    )}

                    <div className="kf-iki">
                      <div className="kf-alan">
                        <label htmlFor="kf-il">Şehir<span className="z">*</span></label>
                        <select id="kf-il" className={sinif('il')} value={form.il} autoComplete="address-level1"
                          onChange={e => { setForm(f => ({ ...f, il: e.target.value, ilce: '' })); if (errors.il) setErrors(o => { const n = { ...o }; delete n.il; return n; }); }}>
                          <option value="">Şehir seçin</option>
                          {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                        </select>
                        {err('il')}
                      </div>
                      <div className="kf-alan">
                        <label htmlFor="kf-ilce">İlçe<span className="o">isteğe bağlı</span></label>
                        <select id="kf-ilce" className={sinif('ilce')} value={form.ilce} disabled={!form.il} onChange={e => yaz('ilce', e.target.value)}>
                          <option value="">{form.il ? 'İlçe seçin' : 'Önce şehir seçin'}</option>
                          {form.ilce && !ILCELER(form.il).includes(form.ilce) && <option value={form.ilce}>{form.ilce}</option>}
                          {ILCELER(form.il).map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="kf-grup">
                  <h2 className="kf-grup__baslik">Başvuran kişi</h2>
                  <div className="kf-grup__kutu">
                    <div className="kf-iki">
                      <div className="kf-alan">
                        <label htmlFor="kf-ad">Ad soyad<span className="z">*</span></label>
                        <div className="kf-giris">
                          <input id="kf-ad" type="text" className={sinif('ad_soyad')} value={form.ad_soyad} autoComplete="name" placeholder="Adınız soyadınız"
                            onChange={e => yaz('ad_soyad', e.target.value)} />
                          <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                        </div>
                        {err('ad_soyad')}
                      </div>
                      <div className="kf-alan">
                        <label htmlFor="kf-unvan">Ünvan<span className="o">isteğe bağlı</span></label>
                        <div className="kf-giris">
                          <input id="kf-unvan" type="text" className={sinif('unvan')} value={form.unvan} autoComplete="organization-title" placeholder="Sahip, yönetici…"
                            onChange={e => yaz('unvan', e.target.value)} />
                          <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                        </div>
                      </div>
                    </div>
                    <div className="kf-iki">
                      <div className="kf-alan">
                        <label htmlFor="kf-tel">İşletme telefonu<span className="z">*</span></label>
                        <div className="kf-giris">
                          <input id="kf-tel" type="tel" inputMode="tel" className={sinif('tel')} value={form.tel} autoComplete="tel" placeholder="0500 000 00 00"
                            onChange={e => yaz('tel', e.target.value)} />
                          <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                        </div>
                        {err('tel')}
                        <p className="kf-ipucu">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          İşletmenizde kullandığınız numarayı yazın; başvurunuzu doğrulamak için aranacaksınız.
                        </p>
                      </div>
                      <div className="kf-alan">
                        <label htmlFor="kf-email">E-posta<span className="z">*</span></label>
                        <div className="kf-giris">
                          <input id="kf-email" type="email" inputMode="email" className={sinif('email')} value={form.email} autoComplete="email" placeholder="ornek@email.com"
                            onChange={e => yaz('email', e.target.value)} />
                          <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                        </div>
                        {err('email')}
                      </div>
                    </div>
                  </div>
                </section>

                {/* İsteğe bağlı bilgiler — varsayılan kapalı; formu kısa tutar */}
                <details className="kf-ek">
                  <summary>
                    <span>İsteğe bağlı bilgiler<small>Adres, not ve 360° sanal tur</small></span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </summary>
                  <div className="kf-ek__ic">
                    <div className="kf-alan">
                      <label htmlFor="kf-adres">Adres</label>
                      <div className="kf-giris">
                        <input id="kf-adres" type="text" className={sinif('adres')} value={form.adres} autoComplete="street-address" placeholder="Cadde, sokak, bina no…"
                          onChange={e => yaz('adres', e.target.value)} />
                        <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                      </div>
                    </div>
                    <div className="kf-alan">
                      <label htmlFor="kf-mesaj">Ek bilgi</label>
                      <textarea id="kf-mesaj" className={sinif('mesaj')} value={form.mesaj} rows={3} placeholder="İşletmenizle ilgili eklemek istedikleriniz…"
                        onChange={e => yaz('mesaj', e.target.value)} />
                    </div>
                    <div className="kf-alan">
                      <label htmlFor="kf-tur360">360° sanal tur bağlantısı</label>
                      <div className="kf-giris">
                        <input id="kf-tur360" type="url" className={`kf-in${tour360url.trim() ? ' dolu' : ''}`} value={tour360url} placeholder="https://my.matterport.com/show/?m=…"
                          onChange={e => setTour360url(e.target.value)} />
                        <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                      </div>
                      <p className="kf-ipucu">Matterport, Google Sokak Görünümü, YouTube 360° gibi platformların bağlantısını yapıştırabilirsiniz.</p>
                    </div>
                    <p className="kf-ipucu">
                      <HkIcon name="info" size={16} />
                      <span><strong>Fotoğraflar:</strong> başvurunuz onaylandığında panelinizdeki <strong>Profilimi Düzenle → Fotoğraflar</strong> bölümünden kapak ve galeri fotoğraflarınızı yüklersiniz.</span>
                    </p>
                  </div>
                </details>

                {saveError && <div className="kf-hatakutu" role="alert" style={{ marginBottom: 14 }}>{saveError}</div>}

                <button type="submit" disabled={saving} className="kf-gonder hk-cta-isik">
                  {saving ? 'Gönderiliyor…' : 'Başvuruyu gönder'}
                </button>

                <p className="kf-not">
                  İşletme adı, şehir ve adres onaydan sonra profilinizde yayımlanır. Telefon ve yetkili bilgileri yalnızca başvurunuzu doğrulamak için kullanılır, profilde gösterilmez; profilde görünecek iletişim bilgilerini onaydan sonra panelden siz eklersiniz.
                  Başvuruyu göndererek <Link href="/kvkk" target="_blank">KVKK Aydınlatma Metni</Link>&apos;ni okuduğunuzu kabul edersiniz.
                </p>
              </form>
            </div>

            {/* Yan bilgi — küçük ve sakin */}
            <aside className="kf-yan">
              <div className="kf-yan__kart">
                <h3>Sonra ne olur?</h3>
                {[
                  'Başvurunuzu inceler, işletme telefonunuzdan doğrularız. Çoğu başvuru birkaç saat içinde, en geç 24 saatte yanıtlanır.',
                  'İşletmeniz sistemde zaten kayıtlıysa kayıtlar birleştirilir; güncel hesabınız size gönderilir.',
                  'Sonucu e-posta ile bildiririz; panelden profilinizi yönetmeye başlarsınız.',
                ].map((t, i) => (
                  <div key={i} className="kf-adim"><b>{i + 1}</b><span>{t}</span></div>
                ))}
              </div>
              <div className="kf-yan__kart">
                <h3>Onaydan sonra</h3>
                <ul className="kf-sonra">
                  {['Profil bilgilerinizi düzenlersiniz', 'Logo ve fotoğraf eklersiniz', 'Randevu taleplerini yönetirsiniz', 'Yorumlara yanıt verirsiniz'].map(x => (
                    <li key={x}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>{x}</li>
                  ))}
                </ul>
              </div>
              <p className="kf-pro">
                Pro üyelik mi düşünüyorsunuz? <a href="mailto:info@hekimhane.com.tr">info@hekimhane.com.tr</a> adresine yazın ya da sağ alttaki sohbet balonunu kullanın. <Link href="/pro">Pro özellikleri →</Link>
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
