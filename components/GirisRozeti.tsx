// Giriş türü rozeti — Doktor/İşletme ve Hasta/Ziyaretçi için ortak dil.
// Aynı biçim, aynı ikon ailesi, markanın iki rengi ters çevrilmiş:
//   • isletme → lacivert zemin, beyaz çizgi, altın detay   (kurumsal, "içeri")
//   • hasta   → şampanya zemin, lacivert çizgi, altın detay (açık, "ziyaretçi")
// Hook yok: server ve client bileşenlerde ortak. İkonlar HkIcon setinden.
import HkIcon from '@/components/HkIcon';

export type GirisTip = 'isletme' | 'hasta';

export const GIRIS_TON = {
  isletme: { zemin: '#12294D', kenar: '#12294D', cizgi: '#FFFFFF', detay: '#DEC283', ikon: 'doctor-profile' as const },
  hasta:   { zemin: '#F7F0DE', kenar: '#EAD9AE', cizgi: '#12294D', detay: '#B8892F', ikon: 'user-account' as const },
};

export default function GirisRozeti({ tip, size = 44, soluk = false }: { tip: GirisTip; size?: number; soluk?: boolean }) {
  const t = GIRIS_TON[tip];
  return (
    <span aria-hidden="true" style={{
      flex: 'none', display: 'grid', placeItems: 'center', width: size, height: size,
      borderRadius: Math.round(size * 0.3), background: t.zemin, boxShadow: `inset 0 0 0 1px ${t.kenar}`,
      opacity: soluk ? 0.55 : 1, filter: soluk ? 'grayscale(.35)' : undefined, transition: 'opacity .16s, filter .16s',
    }}>
      <HkIcon name={t.ikon} size={Math.round(size * 0.55)} color={t.cizgi} accent={t.detay} bg={t.zemin} strokeWidth={1.6} />
    </span>
  );
}
