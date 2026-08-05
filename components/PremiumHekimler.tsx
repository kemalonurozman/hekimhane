import { supabase } from '@/lib/supabase';
import type { Klinik } from '@/lib/types';
import KlinikCard from '@/components/KlinikCard';

/**
 * Hastalık/tedavi sayfalarının altında gösterilen "Önerilen Diş Hekimleri" bölümü.
 * Premium ekipteki klinikleri, sayfanın uzmanlık alanına göre önceliklendirir ve
 * ziyaretçinin doğrudan iletişime geçebileceğini belirtir. Premium yoksa hiçbir şey render etmez.
 */
export default async function PremiumHekimler({ uzmanlik, limit = 3 }: { uzmanlik?: string; limit?: number }) {
  let klinikler: Klinik[] = [];
  try {
    const { data } = await supabase.from('klinikler').select('*').eq('premium', true).limit(24);
    klinikler = (data || []) as Klinik[];
  } catch {
    return null;
  }
  if (!klinikler.length) return null;

  // Uzmanlığa göre önceliklendir (specs örtüşmesi), sonra yorum sayısına göre
  const uz = (uzmanlik || '').toLowerCase();
  const rank = (k: Klinik) => {
    const specs = (k.specs || []).map(s => s.toLowerCase());
    if (uz && specs.some(s => s.includes(uz) || uz.includes(s))) return 0;
    return 1;
  };
  const secili = [...klinikler]
    .sort((a, b) => rank(a) - rank(b) || (b.rev || 0) - (a.rev || 0))
    .slice(0, limit);

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ background: 'linear-gradient(135deg,#FBF4DD,#FDF9EE)', border: '1px solid #E9CE7E', borderRadius: 16, padding: '18px 20px' }}>
        <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', color: '#8A6A16', background: 'rgba(255,255,255,.7)', border: '1px solid #E9CE7E', borderRadius: 20, padding: '3px 10px', marginBottom: 10 }}>
          Premium Ekip
        </span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', margin: '0 0 6px' }}>Önerilen Diş Hekimleri</h2>
        <p style={{ fontSize: 13.5, color: '#6B5B2E', lineHeight: 1.6, margin: 0 }}>
          Hekimhane premium ekibinden, bu konuda deneyimli hekimler. Profillerinden telefon, WhatsApp veya randevu ile
          <strong> doğrudan iletişime geçebilirsiniz</strong>.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
        {secili.map(k => <KlinikCard key={k.id} klinik={k} />)}
      </div>
    </section>
  );
}
