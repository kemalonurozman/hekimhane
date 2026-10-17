'use client';

// Tamamlanmış randevu kartında: hastaya onaylı yorum bağlantısını iletme düğmesi.
// E-postası olan hastaya bağlantı "Tamamlandı" anında kendiliğinden gider; bu düğme
// e-postasız hastalar (ya da tekrar göndermek) içindir: bağlantıyı kopyalar ya da WhatsApp'ta açar.
import { useState } from 'react';

export default function OnayliYorumDugmesi({ talepId, tel, ad, isletme }: { talepId: string; tel?: string | null; ad?: string | null; isletme?: string | null }) {
  const [durum, setDurum] = useState<'bos' | 'yukleniyor' | 'hazir' | 'kopyalandi' | 'yazildi' | 'hata'>('bos');
  const [link, setLink] = useState('');
  const [mesaj, setMesaj] = useState('');

  async function al(): Promise<string | null> {
    if (link) return link;
    setDurum('yukleniyor');
    try {
      const r = await fetch(`/api/panel/yorum-baglantisi?talep=${encodeURIComponent(talepId)}`, { cache: 'no-store' });
      const d = await r.json();
      if (d.yazildi) { setDurum('yazildi'); return null; }
      if (!r.ok || !d.baglanti) { setDurum('hata'); setMesaj(d.error || 'Bağlantı alınamadı'); return null; }
      setLink(d.baglanti); setDurum('hazir'); return d.baglanti;
    } catch { setDurum('hata'); setMesaj('Bağlantı alınamadı'); return null; }
  }
  async function kopyala() {
    const l = await al(); if (!l) return;
    try { await navigator.clipboard.writeText(l); setDurum('kopyalandi'); } catch { setDurum('hazir'); }
  }
  async function whatsapp() {
    const l = await al(); if (!l) return;
    const no = String(tel || '').replace(/\D/g, '').replace(/^0/, '90');
    const metin = `Merhaba ${ad || ''}, ${isletme || 'kliniğimizdeki'} randevunuz tamamlandı. Deneyiminizi değerlendirmek isterseniz: ${l}`;
    window.open(`https://wa.me/${no}?text=${encodeURIComponent(metin)}`, '_blank', 'noopener');
  }

  if (durum === 'yazildi') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '0 12px', borderRadius: 10, background: '#F0FDF4', color: '#166534', fontSize: 12.5, fontWeight: 700 }}>Hasta onaylı yorumunu yazdı</span>;
  }
  const dugme: React.CSSProperties = { padding: '10px 15px', minHeight: 40, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', color: '#12294D', border: '1px solid #C1CEE2' };
  return (
    <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" onClick={kopyala} disabled={durum === 'yukleniyor'} style={dugme} title="Hastaya özel, tek kullanımlık onaylı yorum bağlantısı">
        {durum === 'kopyalandi' ? 'Bağlantı kopyalandı' : 'Yorum bağlantısını kopyala'}
      </button>
      {tel && <button type="button" onClick={whatsapp} disabled={durum === 'yukleniyor'} style={dugme}>WhatsApp ile gönder</button>}
      {durum === 'hata' && <span style={{ fontSize: 12, color: '#C0392B' }}>{mesaj}</span>}
    </span>
  );
}
