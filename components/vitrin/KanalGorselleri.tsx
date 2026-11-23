// Hekim kanalları vitrini — telefon, Instagram/Facebook mesajları, web sitesi sohbet balonu ve
// e-posta için temsili ekran çizimleri (ana sayfa hero vitrini). Tümü HTML/CSS/SVG, görsel dosyası
// yok; kişi adları baş harf, numaralar maskeli, alan adı yok. Hook yok (server/client ortak).
//
// Instagram, Facebook ve telefon işaretleri YALNIZ kanalı belirtmek için çizildi: renk ve oranları
// değiştirilmez, yanlarına Hekimhane işareti konmaz (ortaklık izlenimi verilmez).
//
// Ölçek: her çizim 440×400 birimlik tuvalde tasarlandı. `u(n)` → calc(n × --u); --u kapsayıcı
// genişliğinden gelir (app/globals.css → .vt-kn__sahne), çizim telefonda orantılı küçülür, taşmaz.
// Hareketler: .vt-h-belir (sırayla belirme, animationDelay), .vt-kn-dalga, .vt-kn-sec, .vt-kn-nabiz;
// "hareketi azalt"ta hepsi durur ve son hâl görünür.

const u = (n: number) => `calc(${n} * var(--u))`;
const gecikme = (sn: number): React.CSSProperties => ({ animationDelay: `${sn}s` });

// ── Kanal işaretleri ─────────────────────────────────────────────────────────

/** Instagram uygulama işareti (resmî degrade). `id` sayfada tekil olmalı. */
export function InstagramIsaret({ boyut, id }: { boyut: string | number; id: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: boyut, height: boyut, flex: 'none', display: 'block' }}>
      <defs>
        <radialGradient id={id} cx="0.3" cy="1.07" r="1.5">
          <stop offset="0" stopColor="#FDF497" />
          <stop offset="0.05" stopColor="#FDF497" />
          <stop offset="0.45" stopColor="#FD5949" />
          <stop offset="0.6" stopColor="#D6249F" />
          <stop offset="0.9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6.6" fill={`url(#${id})`} />
      <rect x="5.4" y="5.4" width="13.2" height="13.2" rx="3.9" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.15" cy="7.85" r="1" fill="#fff" />
    </svg>
  );
}

/** Facebook işareti (mavi daire + f). */
export function FacebookIsaret({ boyut }: { boyut: string | number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: boyut, height: boyut, flex: 'none', display: 'block' }}>
      <circle cx="12" cy="12" r="12" fill="#0866FF" />
      <path fill="#fff" d="M10.2 23.7V15.4H7.35v-3.27H10.2V9.7c0-2.85 1.73-4.4 4.27-4.4 1.21 0 2.26.09 2.56.13v2.97h-1.76c-1.38 0-1.65.66-1.65 1.62v2.11h3.29l-.43 3.27H13.6v8.3z" />
    </svg>
  );
}

const AHIZE = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';

/** Telefon: yeşil daire içinde ahize (gelen arama düğmesi). */
export function TelefonIsaret({ boyut, renk = '#34C759' }: { boyut: string | number; renk?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: boyut, height: boyut, flex: 'none', display: 'block' }}>
      <circle cx="12" cy="12" r="12" fill={renk} />
      <path fill="#fff" transform="translate(5.16 5.16) scale(.57)" d={AHIZE} />
    </svg>
  );
}

/** Yapay zekâ yanıtı işareti (küçük kıvılcım). */
function Kivilcim({ boyut, renk = 'currentColor' }: { boyut: string; renk?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: boyut, height: boyut, flex: 'none', display: 'block' }}>
      <path fill={renk} d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5zM19 15.5c.25 2 1.25 3 3.25 3.25-2 .25-3 1.25-3.25 3.25-.25-2-1.25-3-3.25-3.25 2-.25 3-1.25 3.25-3.25z" />
    </svg>
  );
}

function Onay({ boyut, renk = 'currentColor' }: { boyut: string; renk?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: boyut, height: boyut, flex: 'none', display: 'block' }}>
      <circle cx="12" cy="12" r="11" fill={renk} />
      <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#0A0D12" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cizgi({ w, o = 0.18, h = 7, renk }: { w: number | string; o?: number; h?: number; renk?: string }) {
  return <span style={{ display: 'block', height: u(h), width: typeof w === 'number' ? u(w) : w, borderRadius: 999, background: renk || `rgba(255,255,255,${o})` }} />;
}

function Rozet({ metin, ton }: { metin: string; ton: 'yeni' | 'yesil' | 'kirmizi' | 'sari' | 'vurgu' }) {
  const t = {
    yeni: { background: 'var(--vt-vurgu)', color: '#0A0D12' },
    vurgu: { background: 'color-mix(in srgb, var(--vt-vurgu) 22%, transparent)', color: 'var(--vt-vurgu)' },
    yesil: { background: 'rgba(52,199,89,.16)', color: '#6EE39A' },
    kirmizi: { background: 'rgba(255,99,99,.15)', color: '#FF9A9A' },
    sari: { background: 'rgba(255,196,0,.14)', color: '#FFD466' },
  }[ton];
  return <span className="vt-kn-rozet" style={t}>{metin}</span>;
}

// ── 1. Telefon: asistan aramayı yanıtlar, takvimdeki boş saate randevu ekler ──

export function TelefonGorsel() {
  const dalga = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.85, 0.6, 1, 0.5, 0.75, 0.4, 0.65, 0.3];
  const saatler: { saat: string; durum: 'dolu' | 'yeni' | 'bos' }[] = [
    { saat: '09:30', durum: 'dolu' }, { saat: '10:00', durum: 'dolu' }, { saat: '10:30', durum: 'yeni' }, { saat: '11:00', durum: 'bos' },
  ];
  return (
    <div className="vt-kn" role="img" aria-label="Örnek ekran: asistan gelen aramayı yanıtlıyor ve takvimdeki boş saate randevu ekliyor">
      <div className="vt-kn__sahne">
        {/* Telefon — görüşme ekranı */}
        <div className="vt-kn-tel" style={{ left: u(14), top: u(6), width: u(196), height: u(388) }}>
          <div className="vt-kn-tel__ekran">
            <span className="vt-kn-tel__ada" />
            <div style={{ paddingTop: u(48), textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: u(5), padding: `${u(3)} ${u(9)}`, borderRadius: 999, background: 'rgba(255,255,255,.08)', fontSize: u(10), color: 'rgba(255,255,255,.75)' }}>
                <span className="vt-h-nabiz" style={{ width: u(6), height: u(6), borderRadius: '50%', background: '#34C759' }} />
                Asistan yanıtlıyor
              </div>
              <div style={{ width: u(62), height: u(62), margin: `${u(16)} auto 0`, borderRadius: '50%', background: 'linear-gradient(160deg,#6B7381,#3A414D)', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(34), height: u(34) }}><circle cx="12" cy="9" r="4.2" fill="rgba(255,255,255,.85)" /><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5z" fill="rgba(255,255,255,.85)" /></svg>
              </div>
              <div style={{ marginTop: u(10), fontSize: u(18), fontWeight: 600, letterSpacing: '-0.01em' }}>Yeni hasta</div>
              <div style={{ marginTop: u(2), fontSize: u(11), color: 'rgba(255,255,255,.55)', letterSpacing: '.04em' }}>0 5•• ••• •• 18 · 00:42</div>
            </div>
            <div className="vt-kn-dalga" style={{ marginTop: u(22) }}>
              {dalga.map((y, k) => <i key={k} style={{ ['--y' as string]: y, animationDelay: `${k * 0.07}s`, animationDuration: `${0.9 + (k % 4) * 0.15}s` } as React.CSSProperties} />)}
            </div>
            {/* Görüşme düğmeleri */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: u(22), display: 'grid', justifyItems: 'center', rowGap: u(14) }}>
              <div style={{ display: 'flex', gap: u(16) }}>
                {['M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4', 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01', 'M4 10v4h4l5 4V6L8 10zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12'].map((d, k) => (
                  <span key={k} style={{ width: u(40), height: u(40), borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center' }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(18), height: u(18) }}><path d={d} fill="none" stroke="#fff" strokeWidth={k === 1 ? 3 : 1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                ))}
              </div>
              <span style={{ width: u(48), height: u(48), borderRadius: '50%', background: '#FF3B30', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(24), height: u(24), transform: 'rotate(135deg)' }}><path fill="#fff" d={AHIZE} /></svg>
              </span>
            </div>
          </div>
        </div>

        {/* Görüşme dökümü */}
        <div className="vt-kn-kart" style={{ left: u(222), top: u(8), width: u(208), padding: u(12) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(7), marginBottom: u(10), fontSize: u(11), color: 'rgba(255,255,255,.6)' }}>
            <TelefonIsaret boyut={u(18)} />
            <span style={{ fontWeight: 600, color: '#fff' }}>Görüşme</span>
            <span style={{ marginLeft: 'auto' }}>Mesai dışı · 21:40</span>
          </div>
          <div style={{ display: 'grid', rowGap: u(6) }}>
            <div className="vt-kn-balon vt-kn-balon--o vt-h-belir" style={gecikme(0.3)}>Salı sabah randevu alabilir miyim?</div>
            <div className="vt-kn-balon vt-kn-balon--b vt-h-belir" style={gecikme(1.3)}>Salı 10:30 boş. Sizin için ayırıyorum.</div>
            <div className="vt-kn-balon vt-kn-balon--o vt-h-belir" style={gecikme(2.3)}>Çok iyi, teşekkürler.</div>
          </div>
        </div>

        {/* Takvim — boş saate yeni randevu düşer */}
        <div className="vt-kn-kart" style={{ left: u(206), top: u(208), width: u(224), padding: u(12) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(7), marginBottom: u(9) }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(16), height: u(16) }}><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="var(--vt-vurgu)" strokeWidth="1.8" /><path d="M3.5 10h17M8 3v4M16 3v4" stroke="var(--vt-vurgu)" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <span style={{ fontSize: u(12), fontWeight: 600 }}>Takviminiz · Salı</span>
          </div>
          <div style={{ display: 'grid', rowGap: u(5) }}>
            {saatler.map(x => (
              <div key={x.saat} style={{ display: 'flex', alignItems: 'center', gap: u(8), height: u(26) }}>
                <span style={{ width: u(34), fontSize: u(10.5), color: 'rgba(255,255,255,.5)', fontVariantNumeric: 'tabular-nums' }}>{x.saat}</span>
                {x.durum === 'dolu' && <span style={{ flex: 1, height: '100%', borderRadius: u(7), background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', paddingLeft: u(9) }}><Cizgi w={70} o={0.2} h={6} /></span>}
                {x.durum === 'bos' && <span style={{ flex: 1, height: '100%', borderRadius: u(7), border: `1px dashed rgba(255,255,255,.18)`, display: 'flex', alignItems: 'center', paddingLeft: u(9), fontSize: u(10), color: 'rgba(255,255,255,.4)' }}>Boş</span>}
                {x.durum === 'yeni' && (
                  <span style={{ flex: 1, height: '100%', position: 'relative', borderRadius: u(7), border: '1px dashed rgba(255,255,255,.18)' }}>
                    <span className="vt-kn-yeni" style={{ ...gecikme(3.1), position: 'absolute', inset: -1, borderRadius: u(7), background: 'var(--vt-vurgu)', color: '#0A0D12', display: 'flex', alignItems: 'center', gap: u(6), padding: `0 ${u(8)}`, fontSize: u(10.5), fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Yeni hasta
                      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: u(3), fontSize: u(9), fontWeight: 500, opacity: .8 }}><Kivilcim boyut={u(10)} />Asistan ekledi</span>
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="vt-h-belir" style={{ ...gecikme(3.9), display: 'flex', alignItems: 'center', gap: u(6), marginTop: u(10), paddingTop: u(9), borderTop: '1px solid rgba(255,255,255,.08)', fontSize: u(10.5), color: 'rgba(255,255,255,.7)' }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(14), height: u(14), flex: 'none' }}><rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            Görüşme özeti e-postanıza gönderildi
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Instagram ve Facebook: mesajı yanıtlar, talepler tek gelen kutusunda ──

export function MesajGorsel() {
  const gelen: { kanal: 'ig' | 'fb'; ad: string; konu: string; rozet: React.ReactNode }[] = [
    { kanal: 'fb', ad: 'M. T.', konu: 'Çalışma saatleri', rozet: <Rozet metin="Yanıtlandı" ton="yesil" /> },
    { kanal: 'ig', ad: 'S. K.', konu: 'Adres soruldu', rozet: <Rozet metin="Yanıtlandı" ton="yesil" /> },
    { kanal: 'fb', ad: 'E. Y.', konu: 'Tedavi sorusu', rozet: <Rozet metin="Size aktarıldı" ton="kirmizi" /> },
  ];
  const giden = (metin: string, sn: number, not?: boolean) => (
    <div className="vt-h-belir" style={{ ...gecikme(sn), display: 'grid', justifyItems: 'end', rowGap: u(3) }}>
      <div className="vt-kn-balon" style={{ maxWidth: '84%', justifySelf: 'end', background: 'linear-gradient(160deg,#A033FF 0%,#5F5BFF 55%,#3797F0 100%)', color: '#fff', borderBottomRightRadius: u(4) }}>{metin}</div>
      {not && <span style={{ display: 'inline-flex', alignItems: 'center', gap: u(3), marginRight: u(28), fontSize: u(9), color: 'rgba(255,255,255,.45)' }}><Kivilcim boyut={u(9)} />Asistan yanıtladı</span>}
    </div>
  );
  return (
    <div className="vt-kn" role="img" aria-label="Örnek ekran: asistan Instagram mesajını yanıtlıyor, Instagram ve Facebook konuşmaları tek gelen kutusunda">
      <div className="vt-kn__sahne">
        {/* Mesaj ekranı */}
        <div className="vt-kn-tel" style={{ left: u(8), top: u(4), width: u(234), height: u(392) }}>
          <div className="vt-kn-tel__ekran" style={{ background: '#000', display: 'flex', flexDirection: 'column' }}>
            <span className="vt-kn-tel__ada" />
            <div style={{ display: 'flex', alignItems: 'center', gap: u(8), padding: `${u(36)} ${u(12)} ${u(10)}`, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(14), height: u(14), flex: 'none' }}><path d="m15 5-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ width: u(28), height: u(28), borderRadius: '50%', background: 'linear-gradient(160deg,#7C8594,#434A57)', display: 'grid', placeItems: 'center', fontSize: u(10.5), fontWeight: 600, flex: 'none' }}>ZA</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: u(12), fontWeight: 600 }}>Z. A.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: u(4), fontSize: u(9.5), color: 'rgba(255,255,255,.5)' }}><InstagramIsaret boyut={u(11)} id="vt-kn-ig-ust" />Instagram</span>
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', rowGap: u(7), padding: u(10) }}>
              <div className="vt-kn-balon vt-h-belir" style={{ ...gecikme(0.3), background: '#262626', color: '#fff', borderBottomLeftRadius: u(4) }}>Merhaba, kontrol için randevu alabilir miyim?</div>
              {giden('Merhaba! Perşembe 14:00 ya da 16:30 uygun. Hangisini ayıralım?', 1.3, true)}
              <div className="vt-kn-balon vt-h-belir" style={{ ...gecikme(2.4), background: '#262626', color: '#fff', borderBottomLeftRadius: u(4) }}>14:00 olsun.</div>
              {giden('Talebinizi aldım. Klinik onaylayınca size buradan yazacağız.', 3.3)}
            </div>
            <div style={{ margin: `0 ${u(10)} ${u(12)}`, display: 'flex', alignItems: 'center', gap: u(8), height: u(34), padding: `0 ${u(6)}`, borderRadius: 999, background: '#262626' }}>
              <span style={{ width: u(24), height: u(24), borderRadius: '50%', background: '#3797F0', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(13), height: u(13) }}><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="12" cy="12.5" r="3.2" fill="none" stroke="#fff" strokeWidth="1.8" /></svg>
              </span>
              <span style={{ fontSize: u(11), color: 'rgba(255,255,255,.45)' }}>Mesaj gönder…</span>
            </div>
          </div>
        </div>

        {/* Tek gelen kutusu */}
        <div className="vt-kn-kart" style={{ left: u(208), top: u(118), width: u(224), padding: u(12) }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: u(6), marginBottom: u(8) }}>
            <span style={{ fontSize: u(12.5), fontWeight: 600 }}>Gelen kutusu</span>
            <span style={{ marginLeft: 'auto', fontSize: u(10), color: 'rgba(255,255,255,.5)' }}>Tüm kanallar</span>
          </div>
          <div className="vt-h-belir" style={{ ...gecikme(3.9), display: 'flex', alignItems: 'center', gap: u(8), padding: `${u(7)} ${u(6)}`, margin: `0 ${u(-6)}`, borderRadius: u(10), background: 'color-mix(in srgb, var(--vt-vurgu) 14%, transparent)' }}>
            <InstagramIsaret boyut={u(22)} id="vt-kn-ig-kutu1" />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: u(11.5), fontWeight: 600 }}>Z. A.</span>
              <span style={{ display: 'block', fontSize: u(10), color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap' }}>Randevu talebi · Per 14:00</span>
            </span>
            <Rozet metin="Yeni" ton="yeni" />
          </div>
          {gelen.map((g, k) => (
            <div key={g.ad} style={{ display: 'flex', alignItems: 'center', gap: u(8), padding: `${u(7)} 0`, borderTop: k === 0 ? 'none' : '1px solid rgba(255,255,255,.07)' }}>
              {g.kanal === 'ig' ? <InstagramIsaret boyut={u(22)} id={`vt-kn-ig-kutu-${k}`} /> : <FacebookIsaret boyut={u(22)} />}
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: u(11.5), fontWeight: 600 }}>{g.ad}</span>
                <span style={{ display: 'block', fontSize: u(10), color: 'rgba(255,255,255,.55)', whiteSpace: 'nowrap' }}>{g.konu}</span>
              </span>
              {g.rozet}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 3. Web sitesi sohbet balonu: soruyu yanıtlar, uygun saati gösterir, randevuyu alır ──

export function SiteSohbetGorsel() {
  const LACI = '#12294D';
  return (
    <div className="vt-kn" role="img" aria-label="Örnek ekran: web sitesindeki sohbet balonu ziyaretçiye uygun saatleri gösteriyor ve randevuyu alıyor">
      <div className="vt-kn__sahne">
        {/* Tarayıcı — hekimin kendi web sitesi */}
        <div style={{ left: 0, top: u(10), width: u(396), height: u(300), borderRadius: u(14), overflow: 'hidden', background: '#F4F5F7', boxShadow: '0 0 0 1px rgba(255,255,255,.16), 0 30px 70px -24px color-mix(in srgb, var(--vt-vurgu) 45%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(6), height: u(30), padding: `0 ${u(10)}`, background: '#E2E4E9' }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(r => <span key={r} style={{ width: u(9), height: u(9), borderRadius: '50%', background: r }} />)}
            <span style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: u(5), height: u(18), padding: `0 ${u(14)}`, borderRadius: u(6), background: '#F7F8FA', fontSize: u(9.5), color: '#5B6270' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(9), height: u(9) }}><rect x="5" y="10.5" width="14" height="10" rx="2" fill="#5B6270" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#5B6270" strokeWidth="2.2" /></svg>
              Web siteniz
            </span>
          </div>
          <div style={{ padding: u(16) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: u(8), marginBottom: u(22) }}>
              <span style={{ width: u(16), height: u(16), borderRadius: u(5), background: LACI }} />
              <Cizgi w={52} renk="#C9CED8" />
              <span style={{ marginLeft: 'auto', display: 'flex', gap: u(10) }}><Cizgi w={26} renk="#D5D9E0" /><Cizgi w={26} renk="#D5D9E0" /><Cizgi w={26} renk="#D5D9E0" /></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: u(14) }}>
              <div style={{ display: 'grid', rowGap: u(8), alignContent: 'start' }}>
                <Cizgi w="92%" h={12} renk="#2B3546" /><Cizgi w="70%" h={12} renk="#2B3546" />
                <span style={{ marginTop: u(4) }}><Cizgi w="88%" renk="#CDD2DA" /></span><Cizgi w="64%" renk="#CDD2DA" />
                <span style={{ marginTop: u(6), width: u(74), height: u(22), borderRadius: u(7), background: LACI }} />
              </div>
              <div style={{ height: u(118), borderRadius: u(12), background: 'linear-gradient(140deg,#DCE6F5,#B9CBE6)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: u(10), marginTop: u(16) }}>
              {[0, 1, 2].map(k => <span key={k} style={{ height: u(58), borderRadius: u(10), background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.06)' }} />)}
            </div>
          </div>
        </div>

        {/* Tek satır kod */}
        <div style={{ left: u(10), top: u(330), display: 'flex', alignItems: 'center', gap: u(7), height: u(30), padding: `0 ${u(12)}`, borderRadius: u(9), background: 'rgba(23,25,30,.94)', boxShadow: '0 0 0 1px rgba(255,255,255,.1)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: u(9.5), color: 'rgba(255,255,255,.78)', whiteSpace: 'nowrap' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(13), height: u(13), flex: 'none' }}><path d="m8 7-5 5 5 5M16 7l5 5-5 5" fill="none" stroke="var(--vt-vurgu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {'<script src="…/widget.js">'}
        </div>

        {/* Açık sohbet balonu */}
        <div style={{ left: u(218), top: u(62), width: u(214), height: u(330), borderRadius: u(18), overflow: 'hidden', background: '#F6F7F9', display: 'flex', flexDirection: 'column', color: '#1D2430', boxShadow: '0 0 0 1px rgba(255,255,255,.2), 0 28px 60px -16px rgba(0,0,0,.65), 0 30px 70px -26px color-mix(in srgb, var(--vt-vurgu) 60%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(8), padding: `${u(11)} ${u(12)}`, background: LACI, color: '#fff' }}>
            <span style={{ width: u(28), height: u(28), borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', color: 'var(--vt-vurgu)' }}><Kivilcim boyut={u(15)} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: u(12), fontWeight: 600 }}>Asistan</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: u(4), fontSize: u(9.5), color: 'rgba(255,255,255,.7)' }}><span style={{ width: u(6), height: u(6), borderRadius: '50%', background: '#34C759' }} />Çevrimiçi</span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(13), height: u(13), marginLeft: 'auto', opacity: .7 }}><path d="M6 6l12 12M18 6 6 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', rowGap: u(7), padding: u(10) }}>
            <div className="vt-kn-balon vt-h-belir" style={{ ...gecikme(0.2), background: '#fff', color: '#1D2430', boxShadow: '0 1px 2px rgba(0,0,0,.06)', borderBottomLeftRadius: u(4) }}>Merhaba! Size nasıl yardımcı olabilirim?</div>
            <div className="vt-kn-balon vt-h-belir" style={{ ...gecikme(1.1), marginLeft: 'auto', background: LACI, color: '#fff', borderBottomRightRadius: u(4) }}>Yarın için yer var mı?</div>
            <div className="vt-h-belir" style={{ ...gecikme(2), display: 'grid', rowGap: u(6) }}>
              <div className="vt-kn-balon" style={{ background: '#fff', color: '#1D2430', boxShadow: '0 1px 2px rgba(0,0,0,.06)', borderBottomLeftRadius: u(4) }}>Yarın şu saatler uygun:</div>
              <div style={{ display: 'flex', gap: u(5) }}>
                {['09:30', '11:00', '15:30'].map(s => (
                  <span key={s} className={s === '11:00' ? 'vt-kn-sec' : undefined}
                    style={{ ...(s === '11:00' ? gecikme(2.9) : {}), padding: `${u(5)} ${u(9)}`, borderRadius: 999, background: '#fff', boxShadow: `inset 0 0 0 1px ${LACI}33`, color: LACI, fontSize: u(10.5), fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s}</span>
                ))}
              </div>
            </div>
            <div className="vt-kn-balon vt-h-belir" style={{ ...gecikme(3.7), display: 'flex', alignItems: 'center', gap: u(6), background: '#fff', color: '#1D2430', boxShadow: '0 1px 2px rgba(0,0,0,.06)', borderBottomLeftRadius: u(4) }}>
              <Onay boyut={u(15)} renk="#34C759" />11:00 için randevunuz alındı.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(8), margin: `0 ${u(10)} ${u(10)}`, height: u(32), padding: `0 ${u(4)} 0 ${u(12)}`, borderRadius: 999, background: '#fff', boxShadow: '0 0 0 1px #E1E4EA' }}>
            <span style={{ fontSize: u(10.5), color: '#8B93A1' }}>Mesajınızı yazın…</span>
            <span style={{ marginLeft: 'auto', width: u(24), height: u(24), borderRadius: '50%', background: LACI, display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(12), height: u(12) }}><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. E-posta: gelen kutusu + asistanın yanıt taslağı (onaysız gönderilmez) ──

export function EpostaGorsel() {
  const liste: { bas: string; ad: string; zaman: string; konu: string; rozet: React.ReactNode; secili?: boolean }[] = [
    { bas: 'AK', ad: 'A. K.', zaman: '09:12', konu: 'Cumartesi açık mısınız?', rozet: <Rozet metin="Taslak hazır" ton="vurgu" />, secili: true },
    { bas: 'MÖ', ad: 'M. Ö.', zaman: 'Dün', konu: 'Otopark var mı?', rozet: <Rozet metin="Yanıtlandı" ton="yesil" /> },
    { bas: 'ST', ad: 'S. T.', zaman: 'Dün', konu: 'Fatura talebi', rozet: <Rozet metin="Bekliyor" ton="sari" /> },
    { bas: 'BY', ad: 'B. Y.', zaman: 'Pzt', konu: 'Randevu değişikliği', rozet: <Rozet metin="Yanıtlandı" ton="yesil" /> },
  ];
  return (
    <div className="vt-kn" role="img" aria-label="Örnek ekran: gelen e-postaya asistanın hazırladığı yanıt taslağı, onayınızı bekliyor">
      <div className="vt-kn__sahne">
        <div className="vt-kn-kart" style={{ left: 0, top: u(14), width: u(440), height: u(372), overflow: 'hidden', borderRadius: u(16), background: '#121317', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: u(6), height: u(32), padding: `0 ${u(12)}`, borderBottom: '1px solid rgba(255,255,255,.08)', background: '#18191E' }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(r => <span key={r} style={{ width: u(9), height: u(9), borderRadius: '50%', background: r }} />)}
            <span style={{ margin: '0 auto', fontSize: u(11), fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>Gelen kutusu</span>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `${u(164)} 1fr`, minHeight: 0 }}>
            {/* Liste */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,.08)', padding: u(6) }}>
              {liste.map((m, k) => (
                <div key={m.bas} className="vt-h-belir" style={{ ...gecikme(k * 0.12), padding: u(8), borderRadius: u(10), background: m.secili ? 'rgba(255,255,255,.08)' : 'transparent', marginBottom: u(2) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: u(6) }}>
                    <span style={{ width: u(20), height: u(20), borderRadius: '50%', background: m.secili ? 'var(--vt-vurgu)' : 'rgba(255,255,255,.14)', color: m.secili ? '#0A0D12' : '#fff', display: 'grid', placeItems: 'center', fontSize: u(8.5), fontWeight: 600, flex: 'none' }}>{m.bas}</span>
                    <span style={{ fontSize: u(11), fontWeight: 600 }}>{m.ad}</span>
                    <span style={{ marginLeft: 'auto', fontSize: u(9.5), color: 'rgba(255,255,255,.45)' }}>{m.zaman}</span>
                  </div>
                  <div style={{ marginTop: u(4), fontSize: u(10.5), color: 'rgba(255,255,255,.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.konu}</div>
                  <div style={{ marginTop: u(5) }}>{m.rozet}</div>
                </div>
              ))}
            </div>
            {/* Okuma bölmesi */}
            <div style={{ padding: u(14), display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ fontSize: u(14), fontWeight: 600, letterSpacing: '-0.01em' }}>Cumartesi açık mısınız?</div>
              <div style={{ marginTop: u(3), fontSize: u(10), color: 'rgba(255,255,255,.5)' }}>A. K. · bugün 09:12</div>
              <div style={{ marginTop: u(10), fontSize: u(11.5), lineHeight: 1.45, color: 'rgba(255,255,255,.82)' }}>Merhaba, cumartesi günleri açık mısınız? Kontrol için gelmek istiyorum.</div>
              <div className="vt-h-belir" style={{ ...gecikme(0.9), marginTop: u(14), padding: u(11), borderRadius: u(12), background: 'color-mix(in srgb, var(--vt-vurgu) 10%, #16171C)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--vt-vurgu) 45%, transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: u(5), fontSize: u(10), fontWeight: 600, color: 'var(--vt-vurgu)' }}><Kivilcim boyut={u(11)} />Asistanın yanıt taslağı</div>
                <div className="vt-h-belir" style={{ ...gecikme(1.7), marginTop: u(7), fontSize: u(11), lineHeight: 1.45, color: 'rgba(255,255,255,.9)' }}>Merhaba, cumartesi 10:00–14:00 arası açığız. Randevu için bu e-postayı yanıtlamanız yeterli.</div>
                <div className="vt-h-belir" style={{ ...gecikme(2.6), display: 'flex', gap: u(6), marginTop: u(11) }}>
                  <span className="vt-kn-nabiz" style={{ display: 'inline-flex', alignItems: 'center', height: u(26), padding: `0 ${u(10)}`, borderRadius: u(8), background: 'var(--vt-vurgu)', color: '#0A0D12', fontSize: u(10.5), fontWeight: 600, whiteSpace: 'nowrap' }}>Onayla ve gönder</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: u(26), padding: `0 ${u(10)}`, borderRadius: u(8), boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.22)', fontSize: u(10.5), fontWeight: 600 }}>Düzenle</span>
                </div>
              </div>
              <div className="vt-h-belir" style={{ ...gecikme(3.2), display: 'flex', alignItems: 'center', gap: u(5), marginTop: u(10), fontSize: u(10), color: 'rgba(255,255,255,.55)' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: u(12), height: u(12), flex: 'none' }}><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                Siz onaylamadan gönderilmez
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
