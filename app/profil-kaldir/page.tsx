import type { Metadata } from 'next';
import Link from 'next/link';
import ProfilFormSayfasi, { ProfilBulunamadi, YanKart } from '@/components/uyum/ProfilFormSayfasi';
import { profilOzeti, uyumTuru } from '@/lib/profil-ozet';
import { AYDINLATMA_YOL, UYUM_SURE } from '@/lib/uyum';
import KaldirForm from './KaldirForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profilin Kaldırılmasını İste',
  description: 'Hekimhane\'deki profilinizin yayından kaldırılmasını isteyin. Talebiniz yönetici tarafından incelenir; 48 saat içinde karar verilmezse profil geçici olarak yayından alınır.',
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
        'Formu gönderin; kaldırma nedenini ve cep telefonunuzu yazın',
        'E-postanıza gelen bağlantıyla adresinizi doğrulayın',
        `Yönetici ${UYUM_SURE.kaldirma_duraklatma_saat} saat içinde karar verir; verilmezse profil geçici olarak yayından alınır`,
      ]} />
      <YanKart baslik="Bilmeniz gerekenler">
        <ul className="kf-sonra">
          <li>Hesap açmanız veya kimlik numarası girmeniz gerekmez.</li>
          <li>Kaldırılan profil {UYUM_SURE.kaldirma_yedek_gun} gün geri yüklenebilir tutulur; sonra yalnızca ad, il ve talep tarihi kalır.</li>
          {/* li flex olduğu için metin + bağlantı tek span'de — yoksa parçalar sütunlara bölünür */}
          <li><span>Kaldırma yerine bilgileri düzeltmek isterseniz <Link href={`/bilgileri-duzelt?id=${profil.id}&type=${profil.tur}`} style={{ color: '#12294D', fontWeight: 600 }}>düzeltme formu</Link>nu kullanabilirsiniz.</span></li>
        </ul>
      </YanKart>
      <p className="kf-pro" style={{ margin: '0 6px' }}>
        Kişisel verilerinizin nasıl işlendiğini <Link href={AYDINLATMA_YOL.profesyonel} style={{ color: '#12294D', fontWeight: 600 }}>Profesyoneller Aydınlatma Metni</Link>&apos;nde okuyabilirsiniz.
      </p>
    </>}>
      {profil.gizli ? (
        <div className="kf-grup__kutu" style={{ padding: 28 }}>
          <h1 className="kf-baslik" style={{ marginTop: 0 }}>Bu profil şu anda yayında değil</h1>
          <p className="kf-alt">Daha önce alınmış bir kaldırma talebi nedeniyle <strong>{profil.ad}</strong> profili geçici olarak yayından alındı ve yönetici kararı bekleniyor. Ek bilgi vermek için yeniden talep gönderebilirsiniz.</p>
          <KaldirForm entityId={profil.id} entityType={profil.tur} entityName={profil.ad} />
        </div>
      ) : (
        <KaldirForm entityId={profil.id} entityType={profil.tur} entityName={profil.ad} />
      )}
    </ProfilFormSayfasi>
  );
}
