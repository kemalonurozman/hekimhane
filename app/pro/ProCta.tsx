'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';

/**
 * Pro sayfasındaki yükseltme butonu.
 * Giriş yoksa → /giris (dönüşte /pro). Girişliyse → /api/stripe/checkout
 * işletme belirtmeden çağrılır; sunucu ilk onaylı işletmeyi kendisi bulur.
 *
 * `koyu` — lacivert zemin üzerinde kullanıldığında (hero) alt metin ve
 * bağlantılar açık renk olur. Eskiden `color: inherit` sayfa gövdesinin koyu
 * rengini alıyordu ve yazı koyu zeminde siyah görünüyordu.
 */
export default function ProCta({ boyut = 'md', koyu = false }: { boyut?: 'md' | 'lg'; koyu?: boolean }) {
  const router = useRouter();
  const [durum, setDurum] = useState<'bekliyor' | 'calisiyor'>('bekliyor');
  const [mesaj, setMesaj] = useState<string | null>(null);

  async function tikla() {
    setDurum('calisiyor');
    setMesaj(null);
    try {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/giris?redirect=/pro'); return; }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      const j = await res.json();
      if (j.url) { window.location.href = j.url; return; }
      if (j.error === 'no_claim') {
        setMesaj('Önce işletmenizi sahiplenmeniz gerekiyor — birkaç dakika sürer.');
        setTimeout(() => router.push('/sahiplen'), 1800);
        return;
      }
      if (j.error === 'already_pro') {
        setMesaj('Bu işletme zaten Pro üye. Panele yönlendiriliyorsunuz…');
        setTimeout(() => router.push('/panel'), 1500);
        return;
      }
      setMesaj(j.message || j.error || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
    } catch {
      setMesaj('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
    }
    setDurum('bekliyor');
  }

  const lg = boyut === 'lg';
  const notRenk = koyu ? 'rgba(255,255,255,.78)' : '#6E6E73';
  const linkRenk = koyu ? '#FFFFFF' : '#1B3A69';
  return (
    <div>
      {/* Görünüm: özellik sayfası dilinin altın, ışıklı ana düğmesi (vt-dugme oz-dugme--altin hk-cta-isik) */}
      <button type="button" onClick={tikla} disabled={durum === 'calisiyor'}
        className="vt-dugme oz-dugme--altin hk-cta-isik"
        style={{
          border: 'none', fontFamily: 'inherit', fontWeight: 800, letterSpacing: '.2px',
          ...(lg ? { minHeight: 58, padding: '0 34px', fontSize: 17 } : {}),
          cursor: durum === 'calisiyor' ? 'default' : 'pointer',
          opacity: durum === 'calisiyor' ? 0.7 : 1,
        }}>
        {durum === 'calisiyor' ? 'Yönlendiriliyor…' : `Pro'ya Yükselt — Aylık ${PRO_AYLIK_TL} TL`}
      </button>
      {mesaj && (
        <p style={{ marginTop: 10, fontSize: 13, color: '#B45309', fontWeight: 600 }}>{mesaj}</p>
      )}
      {/* Ödemeden önce sözleşme ve ön bilgilendirme — satın alma düğmesinin hemen altında */}
      <p style={{ margin: '12px 0 0', maxWidth: 440, fontSize: 12, lineHeight: 1.6, color: notRenk }}>
        Üyelik her ay kendiliğinden yenilenir; dilediğiniz an iptal edebilirsiniz. Devam ederek{' '}
        <a href="/on-bilgilendirme-formu" target="_blank" rel="noopener" style={{ color: linkRenk, textDecoration: 'underline' }}>Ön Bilgilendirme Formu</a>{' '}ve{' '}
        <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener" style={{ color: linkRenk, textDecoration: 'underline' }}>Mesafeli Satış Sözleşmesi</a>&apos;ni kabul etmiş olursunuz.
      </p>
    </div>
  );
}
