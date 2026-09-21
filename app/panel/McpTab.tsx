'use client';

import { useEffect, useState } from 'react';
import { ARACLAR, kurulumKodu, ISTEMCI_BILGI, YER_TUTUCU, type Istemci } from '@/lib/mcp/araclar';

const NAVY = '#1B3A69', GOLD = '#D4A843', MUTED = '#6E6E73', BORDER = '#E5E5EA', TEXT = '#1D1D1F';

interface Anahtar { id: string; ad: string; onek: string; olusturma: string; son_kullanim: string | null; isletme_id: string | null; isletme_ad: string | null }
function Kopyala({ metin, etiket = 'Kopyala' }: { metin: string; etiket?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { try { navigator.clipboard.writeText(metin); setOk(true); setTimeout(() => setOk(false), 1800); } catch {} }}
      style={{ padding: '7px 13px', borderRadius: 9, border: `1px solid ${BORDER}`, background: ok ? '#F0FDF4' : 'white', color: ok ? '#166534' : NAVY, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {ok ? 'Kopyalandı' : etiket}
    </button>
  );
}

const tarih = (s: string | null) => s ? new Date(s).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Henüz kullanılmadı';

export default function McpTab({ aktifIsletme, isletmeSayisi }: { aktifIsletme: { id: string; ad: string } | null; isletmeSayisi: number }) {
  // Birden çok işletmede anahtar varsayılan olarak sol menüde seçili işletmeye özeldir
  const [tumIsletmeler, setTumIsletmeler] = useState(false);
  const kapsamli = isletmeSayisi > 1 && !!aktifIsletme && !tumIsletmeler;
  const [yukleniyor, setYukleniyor] = useState(true);
  const [pro, setPro] = useState(false);
  const [proIds, setProIds] = useState<string[]>([]);
  // Anahtarın hedefi Pro mu? İşletmeye özel anahtarda o işletme Pro olmalı;
  // "tüm işletmeler" anahtarı yalnız Pro olanlara erişir (sunucu da aynı kuralı uygular).
  const hedefPro = kapsamli ? proIds.includes(aktifIsletme!.id) : pro;
  const [anahtarlar, setAnahtarlar] = useState<Anahtar[]>([]);
  const [maks, setMaks] = useState(5);
  const [ad, setAd] = useState('');
  const [calisiyor, setCalisiyor] = useState(false);
  const [hata, setHata] = useState('');
  const [yeniToken, setYeniToken] = useState<string | null>(null);
  const [istemci, setIstemci] = useState<Istemci>('claude-desktop');

  async function yukle() {
    try {
      const r = await fetch('/api/panel/mcp-anahtar');
      const j = await r.json();
      if (r.ok) { setPro(!!j.pro); setProIds(j.pro_isletmeler || []); setAnahtarlar(j.anahtarlar || []); setMaks(j.maks || 5); }
      else setHata(j.error || 'Bilgiler alınamadı.');
    } catch { setHata('Bağlantı hatası.'); }
    setYukleniyor(false);
  }
  useEffect(() => { yukle(); }, []);

  async function olustur() {
    setCalisiyor(true); setHata('');
    try {
      const r = await fetch('/api/panel/mcp-anahtar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ad, isletme_id: kapsamli ? aktifIsletme!.id : undefined }) });
      const j = await r.json();
      if (r.ok && j.anahtar) { setYeniToken(j.anahtar); setAnahtarlar(p => [...p, j.kayit]); setAd(''); }
      else setHata(j.error || 'Anahtar oluşturulamadı.');
    } catch { setHata('Bağlantı hatası.'); }
    setCalisiyor(false);
  }

  async function iptal(a: Anahtar) {
    if (!window.confirm(`"${a.ad}" anahtarı iptal edilsin mi?\n\nBu anahtarı kullanan asistan bağlantıları hemen çalışmayı durdurur. Geri alınamaz.`)) return;
    try {
      const r = await fetch('/api/panel/mcp-anahtar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id }) });
      if (r.ok) setAnahtarlar(p => p.filter(x => x.id !== a.id));
      else { const j = await r.json().catch(() => ({})); alert(j.error || 'İptal edilemedi.'); }
    } catch { alert('Bağlantı hatası.'); }
  }

  const kart: React.CSSProperties = { background: 'white', borderRadius: 16, border: `1px solid ${BORDER}`, padding: '20px 22px', marginBottom: 16 };
  const kod = kurulumKodu(istemci, yeniToken || YER_TUTUCU);

  const anahtarKarti = (
    <div style={kart}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>Anahtarlarım ({anahtarlar.length}/{maks})</div>
      {anahtarlar.length === 0 ? (
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Henüz anahtar yok.</p>
      ) : anahtarlar.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: `1px solid #F1F1F4`, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 999, marginBottom: 4, background: a.isletme_id ? '#EEF4FF' : '#FDF6E3', color: a.isletme_id ? NAVY : '#9A742A', fontSize: 11, fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M6 21V7l6-4 6 4v14"/></svg>
              {a.isletme_ad || 'Tüm işletmeler'}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
              {a.ad}
              {a.isletme_id && !proIds.includes(a.isletme_id) && (
                <span title="Bu işletme Pro değil; anahtar çalışmaz" style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, letterSpacing: '.4px', textTransform: 'uppercase', background: '#F1F5F9', color: '#6B7A99', border: '1px solid #D9E2EC', verticalAlign: 'middle' }}>Kapalı</span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: MUTED }}><code>{a.onek}</code> · oluşturma {tarih(a.olusturma)} · son kullanım {tarih(a.son_kullanim)}</div>
          </div>
          <button type="button" onClick={() => iptal(a)}
            style={{ padding: '7px 13px', borderRadius: 9, border: '1px solid #FCA5A5', background: 'white', color: '#B91C1C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>İptal et</button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.6px' }}>MCP Bağlantısı</h1>
        {!yukleniyor && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: '.3px', background: hedefPro ? '#F0FDF4' : '#F1F1F4', color: hedefPro ? '#166534' : MUTED, border: `1px solid ${hedefPro ? '#86EFAC' : BORDER}` }}>
            {!hedefPro && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            {hedefPro ? 'Açık' : 'Kapalı'}
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, color: MUTED, margin: '6px 0 16px', lineHeight: 1.6 }}>
        Yapay zeka entegrasyonu · <a href="/mcp" target="_blank" rel="noopener" style={{ color: NAVY, fontWeight: 700 }}>Detaylı rehber</a>
      </p>

      {/* Tanıtım — herkes görür: özelliğin ne işe yaradığını panele girenlere anlatır */}
      <div style={{ ...kart, background: 'linear-gradient(135deg,#F5F8FF 0%,#FFFFFF 70%)', border: '1px solid #DCE5F5' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: NAVY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>
          </div>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 4 }}>Yapay Zeka Entegrasyonu</div>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.65, margin: 0 }}>
              ChatGPT, Claude, Cursor gibi yapay zeka platformlarıyla <strong style={{ color: TEXT }}>sohbet ederek</strong> randevu takviminizi,
              randevu taleplerinizi, yorumlarınızı ve hasta e-postalarınızı yönetebilirsiniz. Panele girmenize gerek kalmaz, ne istediğinizi yazmanız yeterli.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8, marginTop: 14 }}>
          {['Yarınki randevularımı listele', 'Cuma öğleden sonrayı kapat', 'Yarın 13:00’e Ahmet Yılmaz için randevu oluştur'].map(o => (
            <div key={o} style={{ padding: '9px 12px', borderRadius: 10, background: 'white', border: `1px solid ${BORDER}`, fontSize: 12.5, color: '#475569', fontStyle: 'italic', lineHeight: 1.45 }}>&quot;{o}&quot;</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 12, fontSize: 12, color: MUTED }}>
          <span style={{ fontWeight: 700 }}>Nasıl çalışır:</span>
          <span>1. Anahtar oluşturun</span><span aria-hidden="true">→</span>
          <span>2. Asistanınıza bağlayın</span><span aria-hidden="true">→</span>
          <span>3. Sohbet ederek yönetin</span>
        </div>
      </div>

      {yukleniyor ? (
        <div style={{ ...kart, textAlign: 'center', color: MUTED }}>Yükleniyor…</div>
      ) : !hedefPro ? (
        <>
          <div style={{ border: `1.5px dashed ${GOLD}`, borderRadius: 14, background: 'linear-gradient(135deg,#FDFAF3,#FBF6E9)', padding: '26px 24px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(145deg,${GOLD},#BE8F2C)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 3px 10px rgba(190,143,44,.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 6 }}>MCP Bağlantısı kilitli</div>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 auto 14px', maxWidth: 460 }}>
              {pro && aktifIsletme
                ? <><strong style={{ color: TEXT }}>{aktifIsletme.ad}</strong> Hekimhane-Pro değil. Yapay zeka entegrasyonu yalnız Pro işletmelerde açılır. Pro işletmeniz için sol menüdeki <strong style={{ color: TEXT }}>Aktif İşletme</strong> seçimini değiştirin ya da bu işletmeyi Pro&apos;ya yükseltin.</>
                : <>Yapay zeka entegrasyonu Hekimhane-Pro&apos;ya dahildir. Pro&apos;ya geçtiğinizde anahtarınızı oluşturup ChatGPT, Claude gibi asistanlara bağlayabilirsiniz.</>}
            </p>
            <a href="/pro" style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 10, background: `linear-gradient(135deg,${GOLD},#BE8F2C)`, color: 'white', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Pro&apos;yu incele</a>
            {pro && isletmeSayisi > 1 && (
              <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12.5, color: MUTED, cursor: 'pointer' }}>
                <input type="checkbox" checked={tumIsletmeler} onChange={e => setTumIsletmeler(e.target.checked)} />
                Bunun yerine tüm Pro işletmelerime erişen anahtar oluştur
              </label>
            )}
          </div>
          {/* Kilitli önizleme — adımlar görünür ama kullanılamaz */}
          <div aria-disabled="true" style={{ ...kart, opacity: .5, pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>1 · Anahtar oluşturun</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input disabled tabIndex={-1} placeholder="Anahtara bir ad verin (ör. Claude — ofis bilgisayarı)"
                style={{ flex: '1 1 220px', minWidth: 0, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13.5, fontFamily: 'inherit', background: '#F8FAFC' }} />
              <button type="button" disabled tabIndex={-1}
                style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#9CA3AF', color: 'white', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit' }}>Kilitli</button>
            </div>
          </div>
          {/* Eski anahtarlar kilitli görünümde de listelenir — iptal edilebilsinler */}
          {anahtarlar.length > 0 && anahtarKarti}
        </>
      ) : (
        <>
          {/* 1) Anahtar oluştur */}
          <div style={kart}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>1 · Anahtar oluşturun</div>
            {yeniToken ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#166534', marginBottom: 4 }}>Anahtarınız hazır. Şimdi kopyalayın, bir daha gösterilmeyecek.</div>
                <div style={{ fontSize: 12, color: '#166534', marginBottom: 10 }}>Güvenliğiniz için anahtarın yalnızca şifrelenmiş özetini saklıyoruz. Kaybederseniz iptal edip yenisini oluşturun.</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <code style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 9, background: 'white', border: '1px solid #BBF7D0', fontSize: 12, wordBreak: 'break-all', color: TEXT }}>{yeniToken}</code>
                  <Kopyala metin={yeniToken} />
                </div>
                <button type="button" onClick={() => setYeniToken(null)} style={{ marginTop: 10, background: 'none', border: 'none', padding: 0, color: '#166534', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kopyaladım, gizle</button>
              </div>
            ) : anahtarlar.length >= maks ? (
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>En fazla {maks} anahtar oluşturabilirsiniz. Yeni anahtar için aşağıdan kullanmadığınız birini iptal edin.</p>
            ) : (
              <>
              {/* Kapsam: hangi işletmeye erişecek */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 11, background: kapsamli ? '#EEF4FF' : '#F8FAFC', border: `1px solid ${kapsamli ? '#C7D7F0' : BORDER}`, marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, color: MUTED }}>Bu anahtar erişecek:</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: NAVY }}>
                  {kapsamli ? aktifIsletme!.ad : isletmeSayisi > 1 ? `Tüm Pro işletmelerim (${proIds.length})` : (aktifIsletme?.ad || 'İşletmem')}
                </span>
                {kapsamli && (
                  <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, letterSpacing: '.4px', textTransform: 'uppercase', background: hedefPro ? '#FDF6E3' : '#F1F5F9', color: hedefPro ? '#8A6100' : '#6B7A99', border: `1px solid ${hedefPro ? '#EBD9A8' : '#D9E2EC'}` }}>{hedefPro ? 'Pro' : 'Ücretsiz'}</span>
                )}
                {isletmeSayisi > 1 && (
                  <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: MUTED, cursor: 'pointer' }}>
                    <input type="checkbox" checked={tumIsletmeler} onChange={e => setTumIsletmeler(e.target.checked)} />
                    Tüm Pro işletmelerime erişsin
                  </label>
                )}
                {kapsamli && <span style={{ flexBasis: '100%', fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>Başka işletme için anahtar oluşturmak isterseniz sol menüdeki <strong>Aktif İşletme</strong> seçimini değiştirin.</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input value={ad} onChange={e => setAd(e.target.value)} maxLength={40} placeholder="Anahtara bir ad verin (ör. Claude — ofis bilgisayarı)"
                  style={{ flex: '1 1 220px', minWidth: 0, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
                <button type="button" onClick={olustur} disabled={calisiyor}
                  style={{ flex: '0 0 auto', padding: '10px 18px', borderRadius: 10, border: 'none', background: NAVY, color: 'white', fontSize: 13.5, fontWeight: 700, cursor: calisiyor ? 'default' : 'pointer', opacity: calisiyor ? .6 : 1, fontFamily: 'inherit' }}>
                  {calisiyor ? 'Oluşturuluyor…' : 'Anahtar oluştur'}
                </button>
              </div>
              </>
            )}
            {hata && <p style={{ fontSize: 12.5, color: '#B91C1C', fontWeight: 600, margin: '10px 0 0' }}>{hata}</p>}
          </div>

          {/* 2) Asistana bağla */}
          <div style={kart}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>2 · Asistanınıza bağlayın</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {(Object.keys(ISTEMCI_BILGI) as Istemci[]).map(k => (
                <button key={k} type="button" onClick={() => setIstemci(k)}
                  style={{ padding: '7px 13px', borderRadius: 999, border: `1.5px solid ${istemci === k ? NAVY : BORDER}`, background: istemci === k ? '#EEF4FF' : 'white', color: istemci === k ? NAVY : MUTED, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {ISTEMCI_BILGI[k].ad}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: '0 0 10px' }}>{ISTEMCI_BILGI[istemci].nereye}</p>
            {/* Kod satır sonunda sarılır: yatay kaydırma çubuğu alttaki metnin üstüne binmesin,
                kopyala butonu kodu örtmesin (telefon genişliğinde de okunur kalsın). */}
            <div style={{ borderRadius: 12, background: '#0F172A', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 8px 8px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.4px', textTransform: 'uppercase' }}>{ISTEMCI_BILGI[istemci].ad}</span>
                <Kopyala metin={kod} />
              </div>
              <pre style={{ margin: 0, padding: '12px 16px 14px', color: '#E2E8F0', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{kod}</pre>
            </div>
            {!yeniToken && <p style={{ fontSize: 11.5, color: MUTED, margin: '10px 0 0', lineHeight: 1.5, wordBreak: 'break-word' }}>Kodda <code>{YER_TUTUCU}</code> yerine anahtarınızı yazın. Yeni anahtar oluşturduğunuzda kod otomatik doldurulur.</p>}
            <div style={{ marginTop: 12, padding: '11px 13px', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${BORDER}`, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
              <strong style={{ color: TEXT }}>Deneyin:</strong> bağlandıktan sonra asistanınıza <em>&quot;Hekimhane&apos;deki işletmelerimi ve bu haftaki randevularımı göster&quot;</em> yazın.
            </div>
          </div>

          {/* 3) Anahtarlarım */}
          {anahtarKarti}
        </>
      )}

      {/* Araçlar — herkes görür (Pro olmayanlar için de tanıtım) */}
      <div style={!yukleniyor && !hedefPro ? { ...kart, opacity: .6 } : kart}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Asistanınızın yapabildikleri ({ARACLAR.length} araç)</div>
        <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 8px', lineHeight: 1.6 }}>
          <strong style={{ color: '#9A742A' }}>İşlem</strong> etiketli araçlar veri değiştirir veya e-posta gönderir. Asistanınız bunları çalıştırmadan önce sizden onay ister.
        </p>
        {ARACLAR.map(a => (
          <div key={a.name} style={{ padding: '10px 0', borderTop: `1px solid #F1F1F4` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{a.title}</span>
              <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '.4px', textTransform: 'uppercase', background: a.yazma ? '#FDF6E3' : '#EEF4FF', color: a.yazma ? '#9A742A' : NAVY }}>{a.yazma ? 'İşlem' : 'Okuma'}</span>
              <span style={{ fontSize: 11, color: MUTED }}>{a.grup}</span>
            </div>
            <div style={{ fontSize: 12.5, color: '#475569', marginTop: 3, fontStyle: 'italic' }}>&quot;{a.ornek}&quot;</div>
          </div>
        ))}
      </div>
    </div>
  );
}
