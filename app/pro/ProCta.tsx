'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';

/**
 * Pro sayfasındaki yükseltme butonu.
 * Giriş yoksa → /giris (dönüşte /pro). Girişliyse → /api/stripe/checkout
 * işletme belirtmeden çağrılır; sunucu ilk onaylı işletmeyi kendisi bulur.
 */
export default function ProCta({ boyut = 'md' }: { boyut?: 'md' | 'lg' }) {
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
  return (
    <div>
      <button onClick={tikla} disabled={durum === 'calisiyor'}
        style={{
          padding: lg ? '15px 34px' : '13px 28px', borderRadius: 13, border: 'none',
          background: 'linear-gradient(135deg, #D4A843, #BE8F2C)', color: 'white',
          fontSize: lg ? 16 : 14.5, fontWeight: 800, letterSpacing: '.2px',
          cursor: durum === 'calisiyor' ? 'default' : 'pointer',
          opacity: durum === 'calisiyor' ? 0.7 : 1,
          boxShadow: '0 4px 16px rgba(190,143,44,.35)', fontFamily: 'inherit',
        }}>
        {durum === 'calisiyor' ? 'Yönlendiriliyor…' : `Pro'ya Yükselt — Aylık ${PRO_AYLIK_TL} TL`}
      </button>
      {mesaj && (
        <p style={{ marginTop: 10, fontSize: 13, color: '#B45309', fontWeight: 600 }}>{mesaj}</p>
      )}
    </div>
  );
}
