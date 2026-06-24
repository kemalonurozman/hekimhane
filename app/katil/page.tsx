'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

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
function IcFile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
  );
}
function IcImage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}
function IcX() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
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
  tel:         string;
  email:       string;
  il:          string;
  ilce:        string;
  adres:       string;
  mesaj:       string;
}

const KATEGORILER: { type: BusinessType; label: string; desc: string; renk: string; bg: string; icon: React.ReactNode }[] = [
  { type: 'klinik',  label: 'Diş Kliniği', desc: 'Diş hekimi, ortodontist, implant',     renk: '#1B3A69', bg: '#EEF2FF', icon: <IcTooth /> },
  { type: 'hastane', label: 'Hastane',      desc: 'Özel, devlet veya dal hastanesi',       renk: '#065F46', bg: '#ECFDF5', icon: <IcHospital /> },
  { type: 'doktor',  label: 'Doktor',       desc: 'Her uzmanlık dalından bireysel hekim', renk: '#92400E', bg: '#FEF3C7', icon: <IcDoctor /> },
  { type: 'eczane',  label: 'Eczane',       desc: 'Eczane ve nöbetçi eczane bilgisi',     renk: '#6D28D9', bg: '#F5F3FF', icon: <IcPill /> },
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

const AVANTAJLAR = [
  { icon: '🔍', title: 'Daha Fazla Görünürlük', desc: 'Binlerce hasta her gün sağlık hizmeti ararken işletmeniz öne çıkar.' },
  { icon: '⭐', title: 'Yorum Yönetimi',         desc: 'Hastalarınızın yorumlarına yanıt verin, itibarınızı yönetin.' },
  { icon: '📊', title: 'İstatistikler',           desc: 'Profilinizin kaç kişi tarafından görüntülendiğini takip edin.' },
  { icon: '✅', title: 'Ücretsiz Listeleme',      desc: 'Temel listeleme tamamen ücretsiz. Premium özellikler için esnek planlar.' },
];

const DOC_SLOTS = [
  { key: 'vergi',  label: 'Vergi Levhası',          sub: 'PDF veya görsel',           required: false },
  { key: 'sicil',  label: 'Ticaret Sicil Belgesi',   sub: 'PDF veya görsel',           required: false },
  { key: 'imza',   label: 'İmza Sirküleri',           sub: 'PDF veya görsel',           required: false },
  { key: 'kimlik', label: 'Kimlik / Pasaport',        sub: 'Yetkili kişiye ait',        required: false },
];

/* ── Belge Slot Bileşeni ────────────────────────────────── */
function DocSlot({ slotKey, label, sub, file, onFile }: { slotKey: string; label: string; sub: string; file: File | null; onFile: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const loaded = !!file;

  return (
    <div
      onClick={() => ref.current?.click()}
      style={{
        border: `2px dashed ${loaded ? '#22C55E' : '#C7DCFF'}`,
        borderStyle: loaded ? 'solid' : 'dashed',
        borderRadius: 12,
        padding: '16px 12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all .18s',
        background: loaded ? '#F0FDF4' : 'white',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!loaded) { (e.currentTarget as HTMLDivElement).style.borderColor = '#1B3A69'; (e.currentTarget as HTMLDivElement).style.background = '#F0F7FF'; }}}
      onMouseLeave={e => { if (!loaded) { (e.currentTarget as HTMLDivElement).style.borderColor = '#C7DCFF'; (e.currentTarget as HTMLDivElement).style.background = 'white'; }}}
    >
      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={ev => {
          const f = ev.target.files?.[0];
          if (!f) return;
          if (f.size > 6 * 1024 * 1024) { alert('Dosya boyutu 6 MB\'dan büyük olamaz.'); return; }
          onFile(f);
        }}
      />
      {loaded && (
        <button
          onClick={ev => { ev.stopPropagation(); onFile(null); if (ref.current) ref.current.value = ''; }}
          style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <IcX />
        </button>
      )}
      <div style={{ color: loaded ? '#16A34A' : '#9CA3AF', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
        {loaded
          ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5"/><path d="M7 11l3 3 5-6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : <IcFile />
        }
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: loaded ? '#15803D' : '#1A2744', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: loaded ? '#16A34A' : '#6B7A99' }}>
        {loaded ? (file!.name.length > 22 ? file!.name.slice(0, 20) + '…' : file!.name) : sub}
      </div>
    </div>
  );
}

/* ── Fotoğraf Slot Bileşeni ─────────────────────────────── */
function PhotoSlot({ index, preview, onFile, onRemove }: { index: number; preview: string | null; onFile: (f: File, prev: string) => void; onRemove: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files?.[0]) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) { alert('Lütfen bir görsel dosyası seçin.'); return; }
    if (f.size > 8 * 1024 * 1024) { alert('Dosya 8 MB\'dan büyük olamaz.'); return; }
    const url = URL.createObjectURL(f);
    onFile(f, url);
  }

  return (
    <div
      onClick={() => !preview && ref.current?.click()}
      onDragOver={ev => { ev.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={ev => { ev.preventDefault(); setDrag(false); handleFiles(ev.dataTransfer.files); }}
      style={{
        aspectRatio: '1',
        borderRadius: 12,
        border: `2px ${preview ? 'solid #BBF7D0' : 'dashed #C7DCFF'}`,
        background: drag ? '#E8F0FE' : preview ? '#F0FDF4' : '#FAFBFF',
        cursor: preview ? 'default' : 'pointer',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        transition: 'all .18s',
      }}
      onMouseEnter={e => { if (!preview) { (e.currentTarget as HTMLDivElement).style.borderColor = '#1B3A69'; }}}
      onMouseLeave={e => { if (!preview) { (e.currentTarget as HTMLDivElement).style.borderColor = '#C7DCFF'; }}}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={ev => handleFiles(ev.target.files)}
      />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}>
            <button
              onClick={ev => { ev.stopPropagation(); onRemove(); }}
              style={{ padding: '7px 14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Kaldır
            </button>
          </div>
          <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,.5)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
            {index + 1}
          </div>
        </>
      ) : (
        <>
          <div style={{ color: '#9CA3AF' }}><IcImage /></div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{index === 0 ? 'Kapak' : `Fotoğraf ${index + 1}`}</div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function KatilPage() {
  const [step,        setStep]       = useState<'kategori' | 'form' | 'tamam'>('kategori');
  const [seciliType,  setSeciliType] = useState<BusinessType | null>(null);
  const [saving,      setSaving]     = useState(false);
  const [saveError,   setSaveError]  = useState('');

  const [form, setForm] = useState<FormData>({
    isletme_adi: '', ad_soyad: '', unvan: '', tel: '',
    email: '', il: '', ilce: '', adres: '', mesaj: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  /* ── Fotoğraflar, 360° ─────────── */
  const [photoSlots, setPhotoSlots]   = useState<(string | null)[]>(Array(6).fill(null));
  const [photoFiles, setPhotoFiles]   = useState<(File | null)[]>(Array(6).fill(null));
  const [tour360url, setTour360url]   = useState('');
  const [tour360prev, setTour360prev] = useState(false);

  const seciliKat = KATEGORILER.find(k => k.type === seciliType);

  function resetAll() {
    setForm({ isletme_adi:'',ad_soyad:'',unvan:'',tel:'',email:'',il:'',ilce:'',adres:'',mesaj:'' });
    setErrors({});
    setSaveError('');
    setPhotoSlots(Array(6).fill(null));
    setPhotoFiles(Array(6).fill(null));
    setTour360url('');
    setTour360prev(false);
  }

  function handleTypeSelect(type: BusinessType) {
    setSeciliType(type);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.isletme_adi.trim()) e.isletme_adi = 'İşletme adı zorunludur';
    if (!form.ad_soyad.trim())    e.ad_soyad    = 'Ad soyad zorunludur';
    if (!form.tel.trim())         e.tel         = 'Telefon zorunludur';
    if (!form.email.trim())       e.email       = 'E-posta zorunludur';
    if (!form.il)                 e.il          = 'Şehir seçin';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    const supabase = createSupabaseBrowser();

    /* Ek bilgileri role alanına ekle */
    const photoCount  = photoFiles.filter(Boolean).length;
    const extraNotes  = [
      form.unvan.trim() || null,
      form.il ? (form.ilce ? `${form.il} / ${form.ilce}` : form.il) : null,
      form.adres ? `Adres: ${form.adres}` : null,
      form.mesaj || null,
      photoCount   ? `Yüklenen fotoğraf sayısı: ${photoCount}` : null,
      tour360url   ? `360° tur linki: ${tour360url}`           : null,
      'YENİ İŞLETME BAŞVURUSU',
    ].filter(Boolean).join(' | ');

    const { error } = await (supabase as any).from('claim_requests').insert({
      entity_id:     'new',
      entity_type:   seciliType,
      entity_name:   form.isletme_adi.trim(),
      claimant_name: form.ad_soyad.trim(),
      phone:         form.tel.trim(),
      email:         form.email.trim(),
      role:          extraNotes,
      status: 'pending',
    });

    setSaving(false);
    if (error) {
      setSaveError('Bir hata oluştu, lütfen tekrar deneyin.');
    } else {
      setStep('tamam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const inp = (field: keyof FormData): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', borderRadius: 10, fontFamily: 'inherit',
    border: `1.5px solid ${errors[field] ? '#FCA5A5' : '#E5E7EB'}`,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .15s',
  });
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 };
  const secTitle = (renk: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 800, color: renk, textTransform: 'uppercase', letterSpacing: '0.8px',
    paddingBottom: 10, borderBottom: `2px solid ${renk}22`, marginBottom: 14, marginTop: 6,
    display: 'flex', alignItems: 'center', gap: 7,
  });
  const err = (field: keyof FormData) => errors[field]
    ? <span style={{ fontSize: 11, color: '#DC2626', marginTop: 3, display: 'block' }}>{errors[field]}</span>
    : null;

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '48px 0 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'rgba(212,168,67,.2)', border: '1px solid rgba(212,168,67,.35)', fontSize: 12, fontWeight: 700, color: '#F0C060', marginBottom: 16 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1 3h3l-2.5 1.8 1 3L5 7l-2.5 1.8 1-3L1 4h3z" fill="#F0C060"/></svg>
            ÜCRETSİZ LİSTELEME
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            {step === 'form' && seciliKat
              ? `${seciliKat.label} Ekle`
              : 'İşletmenizi Hekimhane\'ye Ekleyin'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Türkiye'nin sağlık rehberinde yerinizi alın. Binlerce hastaya ulaşın.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 32px', maxWidth: 900 }}>

        {/* ── ADIM: Tamamlandı ───────────────────────────── */}
        {step === 'tamam' && (
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border)', padding: '56px 40px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><IcCheck /></div>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: '#166534', marginBottom: 10 }}>Başvurunuz Alındı!</h2>
            <p style={{ color: '#15803D', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              <strong>{form.isletme_adi}</strong> için başvurunuz alındı.
              Ekibimiz en kısa sürede{' '}
              <strong>{form.email}</strong> adresine dönüş yapacaktır.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '11px 22px', background: 'var(--navy)', color: 'white', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Ana Sayfaya Dön
              </Link>
              <button onClick={() => { setStep('kategori'); resetAll(); }}
                style={{ padding: '11px 22px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--navy)', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Yeni Başvuru
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM: Kategori Seçimi ───────────────────────── */}
        {step === 'kategori' && (
          <>
            {/* Kategori kartları — ÖNCE */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                İşletme Türünüzü Seçin
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>Hangi türde işletme listelemek istiyorsunuz?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18, maxWidth: 720, margin: '0 auto 56px' }}>
              {KATEGORILER.map(k => (
                <button key={k.type} onClick={() => handleTypeSelect(k.type)}
                  style={{
                    background: 'white', borderRadius: 22, border: `2px solid ${k.renk}20`,
                    padding: '30px 26px', display: 'flex', alignItems: 'flex-start', gap: 18,
                    cursor: 'pointer', textAlign: 'left', transition: 'all .18s',
                    boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = k.renk; el.style.boxShadow = `0 10px 36px ${k.renk}22`; el.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = `${k.renk}20`; el.style.boxShadow = '0 2px 12px rgba(0,0,0,.05)'; el.style.transform = 'none'; }}
                >
                  <div style={{ width: 62, height: 62, borderRadius: 18, background: k.bg, color: k.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${k.renk}18` }}>
                    {k.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 18, color: k.renk, marginBottom: 5 }}>{k.label}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{k.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: k.renk }}>
                      Başla <IcArrow />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Avantajlar — ARKA PLANDA, ALTTA */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 8 }}>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.2 3.6H11l-3 2.1 1.2 3.6L6 8.4l-3.2 1.9 1.2-3.6-3-2.1h3.8z" fill="currentColor"/></svg>
                  Neden Hekimhane?
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {AVANTAJLAR.map(a => (
                  <div key={a.title} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{a.icon}</div>
                    <h3 style={{ fontWeight: 700, fontSize: 13, marginBottom: 5, color: 'var(--navy)' }}>{a.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── ADIM: Başvuru Formu ─────────────────────────── */}
        {step === 'form' && seciliKat && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px' }}>
              {/* Geri butonu */}
              <button onClick={() => setStep('kategori')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
                <IcChevLeft />Kategori Seçimine Dön
              </button>

              {/* Seçili tür */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: `${seciliKat.bg}`, border: `1.5px solid ${seciliKat.renk}30`, marginBottom: 28 }}>
                <div style={{ color: seciliKat.renk }}>{seciliKat.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: seciliKat.renk, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Başvuru Türü</div>
                  <div style={{ fontWeight: 800, color: seciliKat.renk, fontSize: 16 }}>{seciliKat.label}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* ─── İŞLETME BİLGİLERİ ─── */}
                <div style={secTitle(seciliKat.renk)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2zM9 22V12h6v10M9 6h1M14 6h1M9 10h1M14 10h1"/></svg>
                  İşletme Bilgileri
                </div>

                {/* İşletme adı */}
                <div>
                  <label style={lbl}>İşletme Adı <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" value={form.isletme_adi} placeholder={`${seciliKat.label} adı`}
                    onChange={e => setForm(f => ({ ...f, isletme_adi: e.target.value }))}
                    onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.isletme_adi ? '#FCA5A5' : '#E5E7EB')}
                    style={inp('isletme_adi')} />
                  {err('isletme_adi')}
                </div>

                {/* Ad Soyad + Ünvan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Ad Soyad <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={form.ad_soyad} placeholder="Adınız Soyadınız"
                      onChange={e => setForm(f => ({ ...f, ad_soyad: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.ad_soyad ? '#FCA5A5' : '#E5E7EB')}
                      style={inp('ad_soyad')} />
                    {err('ad_soyad')}
                  </div>
                  <div>
                    <label style={lbl}>Ünvan</label>
                    <input type="text" value={form.unvan} placeholder="Sahip, Yönetici..."
                      onChange={e => setForm(f => ({ ...f, unvan: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                      style={inp('unvan')} />
                  </div>
                </div>

                {/* Tel + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>İşletme Telefonu <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="tel" value={form.tel} placeholder="0500 000 00 00"
                      onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.tel ? '#FCA5A5' : '#E5E7EB')}
                      style={inp('tel')} />
                    {err('tel')}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 7, padding: '7px 10px', background: '#FFF7ED', borderRadius: 8, border: '1px solid #FED7AA' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span style={{ fontSize: 11, color: '#9A3412', lineHeight: 1.5 }}>
                        İşletmenizde kullandığınız telefonu girin — başvurunuzu doğrulamak için aranacaksınız.
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>E-posta <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="email" value={form.email} placeholder="ornek@email.com"
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.email ? '#FCA5A5' : '#E5E7EB')}
                      style={inp('email')} />
                    {err('email')}
                  </div>
                </div>

                {/* İl + İlçe */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Şehir <span style={{ color: '#EF4444' }}>*</span></label>
                    <select value={form.il} onChange={e => setForm(f => ({ ...f, il: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.il ? '#FCA5A5' : '#E5E7EB')}
                      style={{ ...inp('il'), background: 'white', cursor: 'pointer' }}>
                      <option value="">Şehir seçin...</option>
                      {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                    </select>
                    {err('il')}
                  </div>
                  <div>
                    <label style={lbl}>İlçe</label>
                    <input type="text" value={form.ilce} placeholder="İlçe (isteğe bağlı)"
                      onChange={e => setForm(f => ({ ...f, ilce: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                      style={inp('ilce')} />
                  </div>
                </div>

                {/* Adres */}
                <div>
                  <label style={lbl}>Adres</label>
                  <input type="text" value={form.adres} placeholder="Cadde, sokak, bina no..."
                    onChange={e => setForm(f => ({ ...f, adres: e.target.value }))}
                    onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                    style={inp('adres')} />
                </div>

                {/* Ek mesaj */}
                <div>
                  <label style={lbl}>Ek Bilgi</label>
                  <textarea value={form.mesaj} rows={3}
                    placeholder="İşletmenizle ilgili eklemek istedikleriniz..."
                    onChange={e => setForm(f => ({ ...f, mesaj: e.target.value }))}
                    onFocus={e => (e.currentTarget.style.borderColor = seciliKat.renk)}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                    style={{ ...inp('mesaj'), resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                {/* ─── FOTOĞRAFLAR ─── */}
                <div>
                  <div style={secTitle(seciliKat.renk)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                    Fotoğraflar
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0, marginLeft: 2 }}>(isteğe bağlı, maks. 6)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8 }}>
                    {photoSlots.map((preview, i) => (
                      <PhotoSlot
                        key={i}
                        index={i}
                        preview={preview}
                        onFile={(file, prev) => {
                          const ns = [...photoSlots]; ns[i] = prev; setPhotoSlots(ns);
                          const nf = [...photoFiles]; nf[i] = file; setPhotoFiles(nf);
                        }}
                        onRemove={() => {
                          const ns = [...photoSlots]; if (ns[i]) URL.revokeObjectURL(ns[i]!); ns[i] = null; setPhotoSlots(ns);
                          const nf = [...photoFiles]; nf[i] = null; setPhotoFiles(nf);
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                    İlk fotoğraf kapak olarak kullanılır. Sürükle-bırak veya tıklayarak yükleyebilirsiniz. Maks. 8 MB/adet.
                  </p>
                </div>

                {/* ─── 360° TUR ─── */}
                <div>
                  <div style={secTitle(seciliKat.renk)}>
                    <Ic360 />
                    360° Sanal Tur
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0, marginLeft: 2 }}>(isteğe bağlı)</span>
                  </div>

                  {/* Tab: URL giriş veya bilgi */}
                  <div style={{ border: `1.5px solid #E5E7EB`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    {/* Sekmeler */}
                    <div style={{ display: 'flex', background: '#F8FAFF', borderBottom: '1px solid #E5E7EB' }}>
                      {[
                        { id: false, label: 'Link / Embed Kodu' },
                        { id: true,  label: 'Önizleme' },
                      ].map(tab => (
                        <button
                          key={String(tab.id)}
                          type="button"
                          onClick={() => setTour360prev(tab.id)}
                          style={{
                            flex: 1, padding: '10px', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                            background: tour360prev === tab.id ? 'white' : 'none', border: 'none',
                            borderBottom: tour360prev === tab.id ? `2px solid ${seciliKat.renk}` : '2px solid transparent',
                            color: tour360prev === tab.id ? seciliKat.renk : 'var(--muted)',
                            cursor: 'pointer', transition: 'all .15s', marginBottom: -1,
                          }}>
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: 16 }}>
                      {!tour360prev ? (
                        <>
                          <input
                            type="url"
                            value={tour360url}
                            onChange={e => setTour360url(e.target.value)}
                            onFocus={e => { e.currentTarget.style.borderColor = seciliKat.renk; e.currentTarget.style.boxShadow = `0 0 0 3px ${seciliKat.renk}15`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                            placeholder="https://my.matterport.com/show/?m=... veya Google Maps 360° linki"
                            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'all .15s' }}
                          />
                          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                              { label: 'Matterport', bg: '#EEF2FF', color: '#4F46E5', hint: 'my.matterport.com' },
                              { label: 'Google Sokak Görünümü', bg: '#FEF3C7', color: '#D97706', hint: 'google.com/maps' },
                              { label: 'YouTube 360°', bg: '#FEE2E2', color: '#DC2626', hint: 'youtube.com' },
                              { label: 'Kuulamotion', bg: '#ECFDF5', color: '#059669', hint: 'kuulamotion.com' },
                            ].map(p => (
                              <span key={p.label} style={{ padding: '4px 10px', background: p.bg, color: p.color, borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${p.bg}` }}>
                                {p.label}
                              </span>
                            ))}
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                            Matterport, Google Sokak Görünümü, YouTube 360° veya diğer sanal tur platformlarının embed linkini yapıştırın.
                          </p>
                        </>
                      ) : (
                        <div>
                          {tour360url ? (
                            <iframe
                              src={tour360url}
                              title="360° Tur Önizleme"
                              style={{ width: '100%', height: 220, borderRadius: 10, border: 'none' }}
                              allowFullScreen
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)' }}>
                              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>
                                <Ic360 />
                              </div>
                              <p style={{ fontSize: 13 }}>Önizleme için önce "Link / Embed Kodu" sekmesine bir URL girin.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── HATA & GÖNDER ─── */}
                {saveError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', color: '#DC2626', fontSize: 13 }}>
                    {saveError}
                  </div>
                )}

                <button type="submit" disabled={saving}
                  style={{
                    padding: '14px', borderRadius: 13, border: 'none',
                    background: seciliKat.renk, color: 'white',
                    fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {saving ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </button>

                <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                  Bilgileriniz yalnızca doğrulama amacıyla kullanılacak ve üçüncü taraflarla paylaşılmayacaktır.
                </p>
              </form>
            </div>

            {/* Yan bilgi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 90 }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>Nasıl Çalışır?</h3>
                {['Formu doldurup gönderin', 'Ekibimiz talebinizi inceler (1-2 iş günü)', 'E-posta ile bildirim alırsınız', 'Profilinizi yönetmeye başlayın'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${seciliKat.renk}15`, color: seciliKat.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#FFFBEB', borderRadius: 16, border: '1px solid #FDE68A', padding: '18px 20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 10 }}>Sahiplenme Avantajları</h3>
                {['Profil bilgilerini düzenle', 'Fotoğraf ve logo ekle', 'Yorumlara yanıt ver', 'Ziyaret istatistiklerini gör'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#92400E' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {s}
                  </div>
                ))}
              </div>

              {/* Eklenenler özet */}
              {(photoFiles.some(Boolean) || tour360url) && (
                <div style={{ background: '#F0FDF4', borderRadius: 16, border: '1px solid #86EFAC', padding: '18px 20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 13, color: '#166534', marginBottom: 10 }}>Eklenenler</h3>
                  {photoFiles.filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: '#15803D' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#DCFCE7" stroke="#86EFAC"/><path d="M3.5 6l2 2 3-3" stroke="#16A34A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {photoFiles.filter(Boolean).length} fotoğraf eklendi
                    </div>
                  )}
                  {tour360url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#15803D' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#DCFCE7" stroke="#86EFAC"/><path d="M3.5 6l2 2 3-3" stroke="#16A34A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      360° tur linki eklendi
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
