// "Sizce hangi noktalar geliştirilebilir?" seçimlerini gösterir — yalnız işletme sahibi paneli.
// Hook yok → server ve client bileşenlerinde kullanılabilir. Profilde YAYINLANMAZ.
import { gelistirmeAdi } from '@/lib/yorum-kurallari';

export default function GelistirmeEtiketleri({ secimler }: { secimler?: string[] | null }) {
  if (!secimler?.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '8px 0 0' }}>
      <span style={{ fontSize: 11.5, color: '#6E6E73' }}>Hastanın geliştirilebilir bulduğu noktalar (yalnız siz görürsünüz):</span>
      {secimler.map(g => (
        <span key={g} style={{ fontSize: 11.5, fontWeight: 600, color: '#9A4A12', background: 'rgba(217,96,26,.08)', border: '1px solid rgba(217,96,26,.2)', borderRadius: 8, padding: '2px 8px' }}>{gelistirmeAdi(g)}</span>
      ))}
    </div>
  );
}
