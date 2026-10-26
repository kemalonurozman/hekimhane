import type { Metadata } from 'next';
import Link from 'next/link';
import ProfilFormSayfasi, { ProfilBulunamadi, YanKart } from '@/components/uyum/ProfilFormSayfasi';
import BildirimForm from '@/components/uyum/BildirimForm';
import { profilOzeti, uyumTuru } from '@/lib/profil-ozet';
import { AYDINLATMA_YOL, YORUM_NOTU } from '@/lib/uyum';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hatalı Bilgi Bildir',
  description: 'Bir profilde yanlış veya güncel olmayan bilgi gördüyseniz editörlerimize bildirin.',
  robots: { index: false, follow: false },
};

export default async function HataliBilgiPage({ searchParams }: { searchParams: Record<string, string> }) {
  const tur = uyumTuru(searchParams.type);
  const id = searchParams.id || '';
  const profil = tur && id ? await profilOzeti(tur, id) : null;
  if (!profil) return <ProfilBulunamadi metin="Bildirmek istediğiniz profil bulunamadı veya bağlantı geçersiz. Lütfen profil sayfasındaki &quot;Bildirin&quot; bağlantısını kullanın." />;

  return (
    <ProfilFormSayfasi profil={profil} yan={<>
      <YanKart baslik="Ne olur?" adimlar={[
        'Bildiriminiz editörlerimize ulaşır',
        'Bilgi kaynağından kontrol edilir',
        'Gerekirse profil düzeltilir; e-posta bıraktıysanız sonucu yazarız',
      ]} />
      <YanKart baslik="Görüşler hakkında">
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#586273' }}>{YORUM_NOTU} Kurallara aykırı bir görüş gördüyseniz konu olarak &quot;Kurallara aykırı görüş&quot; seçin.</p>
      </YanKart>
      <p className="kf-pro" style={{ margin: '0 6px' }}>
        Verilerinizin nasıl işlendiğini <Link href={AYDINLATMA_YOL.hasta} style={{ color: '#12294D', fontWeight: 600 }}>Hasta ve Ziyaretçi Aydınlatma Metni</Link>&apos;nde okuyabilirsiniz.
      </p>
    </>}>
      <BildirimForm mod="hatali" entityId={profil.id} entityType={profil.tur} entityName={profil.ad} baslangicKonu={searchParams.konu} />
    </ProfilFormSayfasi>
  );
}
