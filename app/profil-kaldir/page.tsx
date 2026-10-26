import type { Metadata } from 'next';
import Link from 'next/link';
import ProfilFormSayfasi, { ProfilBulunamadi, YanKart } from '@/components/uyum/ProfilFormSayfasi';
import { profilOzeti, uyumTuru } from '@/lib/profil-ozet';
import { AYDINLATMA_YOL, UYUM_SURE } from '@/lib/uyum';
import KaldirForm from './KaldirForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profilin Kaldırılmasını İste',
  description: 'Hekimhane\'deki profilinizin yayından kaldırılmasını isteyin. Talep anında profil gizlenir, onay bağlantısı e-postanıza gelir.',
  robots: { index: false, follow: false },
};

export default async function ProfilKaldirPage({ searchParams }: { searchParams: Record<string, string> }) {
  const tur = uyumTuru(searchParams.type);
  const id = searchParams.id || '';
  const profil = tur && id ? await profilOzeti(tur, id) : null;
  if (!profil) return <ProfilBulunamadi metin="Kaldırılmasını istediğiniz profil bulunamadı veya bağlantı geçersiz. Lütfen profil sayfasındaki &quot;Kaldırılmasını iste&quot; düğmesini kullanın." />;

  return (
    <ProfilFormSayfasi profil={profil} rozet="Kaldırma" yan={<>
      <YanKart baslik="Nasıl çalışır?" adimlar={[
        'Formu gönderin; profil anında yayından gizlenir',
        'E-postanıza gelen bağlantıyı onaylayın',
        `Kayıt silinir, en geç ${UYUM_SURE.kaldirma_tipik_is_gunu} iş günü içinde size bildirilir`,
      ]} />
      <YanKart baslik="Bilmeniz gerekenler">
        <ul className="kf-sonra">
          <li>Hesap açmanız veya kimlik numarası girmeniz gerekmez.</li>
          <li>Yeniden eklenmemeniz için yalnızca ad, il ve talep tarihi saklanır.</li>
          <li>Kaldırma yerine bilgileri düzeltmek isterseniz <Link href={`/bilgileri-duzelt?id=${profil.id}&type=${profil.tur}`} style={{ color: '#12294D', fontWeight: 600 }}>düzeltme formu</Link>nu kullanabilirsiniz.</li>
        </ul>
      </YanKart>
      <p className="kf-pro" style={{ margin: '0 6px' }}>
        Kişisel verilerinizin nasıl işlendiğini <Link href={AYDINLATMA_YOL.profesyonel} style={{ color: '#12294D', fontWeight: 600 }}>Profesyoneller Aydınlatma Metni</Link>&apos;nde okuyabilirsiniz.
      </p>
    </>}>
      {profil.gizli ? (
        <div className="kf-grup__kutu" style={{ padding: 28 }}>
          <h1 className="kf-baslik" style={{ marginTop: 0 }}>Bu profil şu anda yayında değil</h1>
          <p className="kf-alt">Daha önce alınmış bir kaldırma talebi nedeniyle <strong>{profil.ad}</strong> profili gizlenmiş. Onay bağlantısı e-postanıza gelmediyse yeniden talep oluşturabilirsiniz.</p>
          <KaldirForm entityId={profil.id} entityType={profil.tur} entityName={profil.ad} />
        </div>
      ) : (
        <KaldirForm entityId={profil.id} entityType={profil.tur} entityName={profil.ad} />
      )}
    </ProfilFormSayfasi>
  );
}
