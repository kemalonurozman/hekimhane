import type { Metadata } from 'next';
import Link from 'next/link';
import ProfilFormSayfasi, { ProfilBulunamadi, YanKart } from '@/components/uyum/ProfilFormSayfasi';
import BildirimForm from '@/components/uyum/BildirimForm';
import { profilOzeti, uyumTuru } from '@/lib/profil-ozet';
import { AYDINLATMA_YOL, UYUM_SURE } from '@/lib/uyum';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Bilgilerini Düzelt',
  description: 'Hekimhane profilinizdeki yanlış veya eski bilgiyi bildirin; düzeltmeler editör kontrolünden sonra yayına alınır.',
  robots: { index: false, follow: false },
};

export default async function BilgileriDuzeltPage({ searchParams }: { searchParams: Record<string, string> }) {
  const tur = uyumTuru(searchParams.type);
  const id = searchParams.id || '';
  const profil = tur && id ? await profilOzeti(tur, id) : null;
  if (!profil) return <ProfilBulunamadi metin="Düzeltmek istediğiniz profil bulunamadı veya bağlantı geçersiz. Lütfen profil sayfasındaki &quot;Bilgileri düzelt&quot; düğmesini kullanın." />;

  return (
    <ProfilFormSayfasi profil={profil} rozet="Ücretsiz" yan={<>
      <YanKart baslik="Nasıl çalışır?" adimlar={[
        'Hangi bilginin yanlış olduğunu seçin, doğrusunu yazın',
        'Editörlerimiz kaynağı kontrol eder',
        `Düzeltme en geç ${UYUM_SURE.inceleme_is_gunu} iş günü içinde yayına alınır`,
      ]} />
      <YanKart baslik="Kendiniz yönetmek ister misiniz?">
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#586273' }}>
          Profili <Link href={`/sahiplen?id=${profil.id}&type=${profil.tur}`} style={{ color: '#12294D', fontWeight: 600 }}>ücretsiz sahiplenirseniz</Link> bilgilerinizi panelden kendiniz güncelleyebilir, hasta görüşlerine yanıt verebilirsiniz.
        </p>
      </YanKart>
      <p className="kf-pro" style={{ margin: '0 6px' }}>
        Kişisel verilerinizin nasıl işlendiğini <Link href={AYDINLATMA_YOL.profesyonel} style={{ color: '#12294D', fontWeight: 600 }}>Profesyoneller Aydınlatma Metni</Link>&apos;nde okuyabilirsiniz.
      </p>
    </>}>
      <BildirimForm mod="duzelt" entityId={profil.id} entityType={profil.tur} entityName={profil.ad} baslangicKonu={searchParams.konu} />
    </ProfilFormSayfasi>
  );
}
