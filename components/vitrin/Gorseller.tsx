// Vitrin kartlarındaki örnek arayüz çizimleri — tümü HTML/CSS, görsel dosyası yok.
// İçerik temsilidir (gerçek kişi/işletme adı kullanılmaz). Hook yok.
import HkIcon from '@/components/HkIcon';

const cizgi = (w: string, o = 0.22): React.CSSProperties => ({ display: 'block', height: 8, width: w, borderRadius: 4, background: `rgba(255,255,255,${o})` });

/** Haftalık randevu takvimi */
export function TakvimGorsel() {
  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
  const dolu = new Set(['0-1', '1-0', '1-2', '2-3', '3-1', '4-0', '4-2']);
  return (
    <div className="vt-cihaz vt-cihaz--genis">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Bu hafta</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>7 randevu</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {gunler.map((g, gi) => (
          <div key={g} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.55)', textAlign: 'center' }}>{g}</span>
            {[0, 1, 2, 3].map(s => {
              const d = dolu.has(`${gi}-${s}`), secili = gi === 2 && s === 3;
              return <span key={s} style={{
                height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600,
                background: secili ? '#DEC283' : d ? 'rgba(222,194,131,.18)' : 'rgba(255,255,255,.06)',
                color: secili ? '#12294D' : d ? '#DEC283' : 'rgba(255,255,255,.32)',
              }}>{9 + s * 2}:00</span>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Hasta yorumu + işletme yanıtı */
export function YorumGorsel() {
  return (
    <div className="vt-cihaz vt-cihaz--genis">
      <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
          {[0, 1, 2, 3, 4].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#DEC283"><path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" /></svg>)}
        </div>
        <span style={cizgi('92%')} /><span style={{ ...cizgi('78%'), marginTop: 8 }} /><span style={{ ...cizgi('46%'), marginTop: 8 }} />
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.45)', marginTop: 12 }}>E. K. · 2 gün önce</div>
      </div>
      <div style={{ margin: '12px 0 0 28px', padding: 16, borderRadius: 16, background: 'rgba(222,194,131,.14)', boxShadow: 'inset 0 0 0 1px rgba(222,194,131,.3)' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#DEC283', marginBottom: 10 }}>Yanıtınız</div>
        <span style={cizgi('88%', 0.3)} /><span style={{ ...cizgi('54%', 0.3), marginTop: 8 }} />
      </div>
    </div>
  );
}

/** HekimKart — dijital kartvizit */
export function KartGorsel() {
  return (
    <div className="vt-cihaz">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 12 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'grid', placeItems: 'center' }}>
          <HkIcon name="doctor-profile" size={32} color="#FFFFFF" accent="#DEC283" bg="#1B1C1F" />
        </span>
        <span style={cizgi('58%', 0.5)} /><span style={cizgi('38%')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', marginTop: 8 }}>
          {(['phone', 'location-pin', 'appointment'] as const).map(i => (
            <span key={i} style={{ height: 44, borderRadius: 12, background: 'rgba(255,255,255,.07)', display: 'grid', placeItems: 'center' }}>
              <HkIcon name={i} size={20} color="#FFFFFF" accent="#DEC283" bg="#1B1C1F" />
            </span>
          ))}
        </div>
        {/* Karekod temsili — nokta deseni */}
        <span style={{ width: 96, height: 96, marginTop: 6, borderRadius: 12, backgroundColor: '#fff', backgroundImage: 'radial-gradient(circle, #12294D 2.4px, transparent 2.7px)', backgroundSize: '9px 9px', backgroundPosition: '5px 5px', boxShadow: 'inset 0 0 0 8px #fff' }} />
      </div>
    </div>
  );
}

/** Yapay zekâ asistanı ile yönetim (MCP) */
export function AsistanGorsel() {
  const balon = (metin: string, sag: boolean) => (
    <div style={{ display: 'flex', justifyContent: sag ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <span style={{
        maxWidth: '82%', padding: '10px 14px', borderRadius: sag ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.45,
        background: sag ? '#DEC283' : 'rgba(255,255,255,.08)', color: sag ? '#12294D' : 'rgba(255,255,255,.9)', fontWeight: sag ? 600 : 400,
      }}>{metin}</span>
    </div>
  );
  return (
    <div className="vt-cihaz vt-cihaz--genis">
      {balon('Yarın 15:00 ile 17:00 arasını kapat.', true)}
      {balon('Kapatıldı. Yarın için 3 randevunuz var; ilki 09:30’da.', false)}
      {balon('Bekleyen talepleri göster.', true)}
      {balon('2 yeni randevu talebi var. İkisi de perşembe öğleden sonrayı tercih ediyor.', false)}
    </div>
  );
}

/** Koyu bento: bölge sayfaları — nokta haritası üzerinde konum işaretleri */
export function BolgeGorsel() {
  const pinler = [[18, 34], [34, 62], [52, 28], [66, 66], [82, 44], [46, 84], [74, 20]];
  return (
    <div style={{ position: 'relative', height: 420, margin: '0 -40px', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.2) 1.3px, transparent 1.6px)', backgroundSize: '9px 9px', WebkitMaskImage: 'linear-gradient(to top, #000 60%, transparent)', maskImage: 'linear-gradient(to top, #000 60%, transparent)' }}>
      {pinler.map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: '50%', background: i % 2 ? 'rgba(222,194,131,.16)' : 'rgba(120,160,220,.16)', display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: i % 2 ? '#DEC283' : '#7FA6E0' }} />
        </span>
      ))}
    </div>
  );
}

/** Koyu bento: profil doluluğu — yükselen çubuklar */
export function PuanGorsel() {
  const h = [14, 18, 22, 28, 34, 42, 52, 62, 74, 88];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 190, padding: '0 6px' }}>
      {h.map((x, i) => (
        <span key={i} style={{ flex: 1, height: `${x}%`, borderRadius: 6, background: i < 7 ? `rgba(222,194,131,${0.25 + i * 0.1})` : 'rgba(255,255,255,.12)' }} />
      ))}
    </div>
  );
}

/** Koyu bento: ekip — yönetici ve asistan çipleri */
export function EkipGorsel() {
  const cip = (ad: string, rol: string, altin: boolean) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px 10px', borderRadius: 999, background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.09)' }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', background: altin ? '#DEC283' : '#2B4B7E', color: altin ? '#12294D' : '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>{ad}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{rol}</span>
    </span>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 40 }}>
      {cip('S', 'Sahip', true)}{cip('Y', 'Yönetici', false)}{cip('A', 'Asistan · randevu', false)}{cip('A', 'Asistan · yorumlar', false)}
    </div>
  );
}

/** Koyu bento: üç adım */
export function AdimGorsel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 40 }}>
      {['Türünüzü seçin', 'Bilgilerinizi girin', 'Onay e-postasını alın'].map((x, i) => (
        <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,.05)' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#DEC283' : 'rgba(255,255,255,.1)', color: i === 0 ? '#12294D' : '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>{i + 1}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{x}</span>
        </div>
      ))}
    </div>
  );
}
