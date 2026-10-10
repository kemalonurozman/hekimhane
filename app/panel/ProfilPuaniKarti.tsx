'use client';

// Profil Puanı — işletme sahibine özel. Puan ziyaretçiye hiçbir yerde gösterilmez;
// yalnız arama sonuçlarındaki sırayı ve ana sayfa öne çıkanlarını etkiler.
// Kalem kalem neyin tamam, neyin eksik olduğunu ve eksiğin kaç puan getireceğini gösterir.
import { useEffect, useState } from 'react';
import { puanSeviyesi, type PuanKalemi } from '@/lib/profil-puani';

interface Profil { entity_id: string; entity_type: string; entity_name: string; puan: number; kalemler: PuanKalemi[] }

const HEDEF: Record<PuanKalemi['hedef'], { tab: string; ad: string }> = {
  profil:    { tab: 'edit',         ad: 'Profili düzenle' },
  medya:     { tab: 'edit',         ad: 'Fotoğraf ekle' },
  meslek:    { tab: 'edit',         ad: 'Mesleki bilgiler' },
  takvim:    { tab: 'randevumodul', ad: 'Takvimi aç' },
  yorumlar:  { tab: 'yorumlar',     ad: 'Yorumlara git' },
  hekimkart: { tab: 'hekimkart',    ad: 'HekimKart' },
};

export default function ProfilPuaniKarti({ aktifEntityId, onGit }: { aktifEntityId?: string | null; onGit: (tab: string, entityId: string) => void }) {
  const [profiller, setProfiller] = useState<Profil[] | null>(null);
  const [acik, setAcik] = useState(true);

  useEffect(() => {
    let iptal = false;
    fetch('/api/panel/profil-puani', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { profiller: [] })
      .then(d => { if (!iptal) setProfiller(d.profiller || []); })
      .catch(() => { if (!iptal) setProfiller([]); });
    return () => { iptal = true; };
  }, []);

  if (!profiller || profiller.length === 0) return null;   // yüklenirken / klinik-doktor profili yoksa kart yok
  const p = profiller.find(x => x.entity_id === String(aktifEntityId || '')) || profiller[0];
  const sev = puanSeviyesi(p.puan);
  const gorselVar = (p.kalemler.find(k => k.anahtar === 'ana-gorsel')?.puan || 0) > 0;
  const eksikler = p.kalemler.filter(k => k.puan < k.max).sort((a, b) => (b.max - b.puan) - (a.max - a.puan));
  const tamamlar = p.kalemler.filter(k => k.puan >= k.max);
  const R = 34, CEVRE = 2 * Math.PI * R;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E5EA', marginBottom: 20, overflow: 'hidden' }}>
      <div className="pp-ust" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', flexWrap: 'wrap' }}>
        {/* Halka gösterge */}
        <div style={{ position: 'relative', width: 84, height: 84, flex: 'none' }}>
          <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
            <circle cx="42" cy="42" r={R} fill="none" stroke="#EEF1F6" strokeWidth="8" />
            <circle cx="42" cy="42" r={R} fill="none" stroke={sev.renk} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CEVRE} strokeDashoffset={CEVRE * (1 - p.puan / 100)} transform="rotate(-90 42 42)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{p.puan}</span>
          </div>
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1D1D1F' }}>Profil Puanı</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: sev.renk, background: `${sev.renk}14`, borderRadius: 999, padding: '3px 9px' }}>{sev.ad}</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#6E6E73', marginTop: 4, lineHeight: 1.55 }}>
            <b style={{ color: '#1D1D1F', fontWeight: 600 }}>{p.entity_name}</b> · 100 üzerinden. Puanınız yükseldikçe arama sonuçlarında daha üst sıralarda görünürsünüz
            {gorselVar ? '. Ana sayfadaki öne çıkanlar bölümüne adaysınız; oradaki sıranız da bu puana göre belirlenir.' : '. Logonuzu veya profil fotoğrafınızı yükleyince ana sayfadaki öne çıkanlar bölümüne aday olursunuz.'}
          </div>
          <div style={{ fontSize: 11.5, color: '#8E8E93', marginTop: 5 }}>Bu puanı yalnızca siz görürsünüz; ziyaretçilere gösterilmez.</div>
        </div>
        <button type="button" onClick={() => setAcik(a => !a)}
          style={{ flex: 'none', padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E5EA', background: '#fff', color: '#1A335E', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {acik ? 'Ayrıntıları gizle' : 'Nasıl puan toplarım?'}
        </button>
      </div>

      {acik && (
        <div style={{ borderTop: '1px solid #E5E5EA' }}>
          {eksikler.length > 0 && (
            <div style={{ padding: '6px 22px 4px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#8E8E93', padding: '12px 0 4px' }}>Puan kazanabileceğiniz alanlar</div>
              {eksikler.map(k => (
                <div key={k.anahtar} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid #F2F2F7', flexWrap: 'wrap' }}>
                  <span style={{ flex: 'none', minWidth: 46, textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#1F7A4F', background: '#E8F5EE', borderRadius: 8, padding: '4px 6px', fontVariantNumeric: 'tabular-nums' }}>+{k.max - k.puan}</span>
                  <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1D1D1F' }}>{k.baslik} <span style={{ fontWeight: 500, color: '#AEAEB2', fontVariantNumeric: 'tabular-nums' }}>{k.puan}/{k.max}</span></div>
                    <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2, lineHeight: 1.5 }}>{k.ipucu}</div>
                  </div>
                  <button type="button" onClick={() => onGit(HEDEF[k.hedef].tab, p.entity_id)}
                    style={{ flex: 'none', padding: '7px 12px', borderRadius: 9, border: 'none', background: '#1A335E', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    {HEDEF[k.hedef].ad} →
                  </button>
                </div>
              ))}
            </div>
          )}
          {tamamlar.length > 0 && (
            <div style={{ padding: '4px 22px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#8E8E93', padding: '12px 0 8px' }}>Tamamlananlar</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tamamlar.map(k => (
                  <span key={k.anahtar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#1F7A4F', background: '#F2FAF5', border: '1px solid #D5EEDF', borderRadius: 999, padding: '5px 11px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {k.baslik} · {k.max}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
