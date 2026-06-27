import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Hekimhane',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Hekimhane kullanıcılarına yönelik aydınlatma metni.',
};

const sections = [
  { id: 'veri-sorumlusu',  title: '1. Veri Sorumlusu' },
  { id: 'kisisel-veriler', title: '2. İşlenen Kişisel Veriler' },
  { id: 'isleme-amaci',    title: '3. Kişisel Verilerin İşlenme Amacı' },
  { id: 'hukuki-sebep',    title: '4. Hukuki Dayanak' },
  { id: 'aktarim',         title: '5. Kişisel Verilerin Aktarımı' },
  { id: 'sure',            title: '6. Saklama Süresi' },
  { id: 'haklar',          title: '7. İlgili Kişi Hakları' },
  { id: 'basvuru',         title: '8. Başvuru Yöntemi' },
];

export default function KVKKPage() {
  return (
    <main style={{ background: 'var(--ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2,#1e4a8c) 100%)',
        padding: '64px 0 48px',
        color: 'white',
      }}>
        <div className="container">
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>KVKK</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(212,168,67,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🔒</div>
            <div>
              <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, margin: 0 }}>KVKK Aydınlatma Metni</h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,.7)', fontSize: 15 }}>6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, margin: 0 }}>Son güncelleme: Ocak 2025</p>
        </div>
      </section>

      <div className="container hastalik-content-grid" style={{ padding: '48px 20px' }}>
        {/* İçerik */}
        <article style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '40px 48px' }}>

          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px 20px', marginBottom: 36, fontSize: 14, color: '#1E40AF', lineHeight: 1.6 }}>
            <strong>Önemli Bilgi:</strong> Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
          </div>

          {/* 1 */}
          <section id="veri-sorumlusu" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              1. Veri Sorumlusu
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>
              Hekimhane platformu (<strong>hekimhane.com.tr</strong>) bünyesinde kişisel verileriniz, KVKK kapsamında <strong>veri sorumlusu</strong> sıfatıyla işlenmektedir. Platform, Türkiye'de faaliyet gösteren ve doktor, klinik, hastane ile eczane bilgilerini kullanıcılara sunan bir sağlık rehberi hizmetidir.
            </p>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginTop: 12 }}>
              İletişim: <a href="mailto:kvkk@hekimhane.com.tr" style={{ color: 'var(--navy)', fontWeight: 600 }}>kvkk@hekimhane.com.tr</a>
            </p>
          </section>

          {/* 2 */}
          <section id="kisisel-veriler" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              2. İşlenen Kişisel Veriler
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>Platform kullanımı sırasında aşağıdaki kişisel veriler işlenebilir:</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '👤', title: 'Kimlik Verileri', desc: 'Ad, soyad (üye girişi varsa)' },
                { icon: '📧', title: 'İletişim Verileri', desc: 'E-posta adresi (bülten aboneliği)' },
                { icon: '📍', title: 'Konum Verileri', desc: 'IP adresi, tarayıcı konum izni (yakın klinik araması)' },
                { icon: '🌐', title: 'Teknik Veriler', desc: 'IP adresi, tarayıcı türü, cihaz bilgisi, çerezler' },
                { icon: '🔍', title: 'Kullanım Verileri', desc: 'Ziyaret edilen sayfalar, arama terimleri' },
                { icon: '📊', title: 'Analitik Veriler', desc: 'Anonim / takma adlı istatistiksel veriler' },
              ].map(item => (
                <div key={item.title} style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1F2937', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section id="isleme-amaci" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              3. Kişisel Verilerin İşlenme Amacı
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul style={{ paddingLeft: 20, color: '#374151', lineHeight: 2, fontSize: 15 }}>
              <li>Hekimhane platformunun işletilmesi ve hizmetlerin sunulması</li>
              <li>Doktor, klinik, hastane ve eczane arama sonuçlarının kişiselleştirilmesi</li>
              <li>Bülten aboneliği kapsamında e-posta iletişimi yapılması</li>
              <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
              <li>Platform performansının ölçülmesi ve iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>İşletme sahiplerine yönelik hizmet bildirimleri (B2B)</li>
            </ul>
          </section>

          {/* 4 */}
          <section id="hukuki-sebep" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              4. Hukuki Dayanak
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>Kişisel verileriniz KVKK Madde 5 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'KVKK m.5/2-a', text: 'Kanunlarda açıkça öngörülmesi (vergi, ticaret mevzuatı)' },
                { label: 'KVKK m.5/2-c', text: 'Sözleşmenin kurulması veya ifası (üyelik, iş birliği sözleşmeleri)' },
                { label: 'KVKK m.5/2-e', text: 'Bir hakkın tesisi veya korunması için zorunlu olması' },
                { label: 'KVKK m.5/2-f', text: 'Meşru menfaatlerimiz (platform güvenliği, analitik)' },
                { label: 'KVKK m.5/1',   text: 'Açık rıza (bülten aboneliği, pazarlama çerezleri)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: 'var(--navy)', minWidth: 100 }}>{item.label}</span>
                  <span style={{ color: '#374151' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section id="aktarim" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              5. Kişisel Verilerin Aktarımı
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>Kişisel verileriniz; KVKK'nın 8. ve 9. maddeleri uyarınca aşağıdaki alıcı gruplarına aktarılabilir:</p>
            <ul style={{ paddingLeft: 20, color: '#374151', lineHeight: 2, fontSize: 15 }}>
              <li><strong>Hizmet sağlayıcılar:</strong> Barındırma (hosting), veritabanı ve analitik hizmetleri (Supabase/AWS altyapısı)</li>
              <li><strong>Ödeme altyapısı:</strong> İşletmelere yönelik ödeme işlemlerinde ödeme aracıları</li>
              <li><strong>Yetkili kurum ve kuruluşlar:</strong> Yasal zorunluluk halinde kamu kurumları ve mahkemeler</li>
              <li><strong>İş ortakları:</strong> Platform entegrasyonları için gerekli üçüncü taraflar (açık rıza ile)</li>
            </ul>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginTop: 12 }}>
              Yurt dışı aktarım söz konusu olduğunda KVKK Madde 9 kapsamındaki güvenceler sağlanmaktadır.
            </p>
          </section>

          {/* 6 */}
          <section id="sure" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              6. Saklama Süresi
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili yasal mevzuatta öngörülen süreler dikkate alınarak saklanmaktadır:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { cat: 'Üyelik verileri',      sure: 'Üyelik sona erince + 3 yıl' },
                { cat: 'İşlem kayıtları',       sure: '10 yıl (TTK gereği)' },
                { cat: 'Bülten aboneliği',      sure: 'Abonelik iptali + 1 yıl' },
                { cat: 'Log / erişim kayıtları',sure: '2 yıl (5651 SK gereği)' },
                { cat: 'Analitik veriler',       sure: '26 ay (anonim)' },
                { cat: 'Çerez verileri',         sure: 'Çerez politikasına göre' },
              ].map(item => (
                <div key={item.cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}>
                  <span style={{ color: '#374151', fontWeight: 600 }}>{item.cat}</span>
                  <span style={{ color: '#6B7280' }}>{item.sure}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 7 */}
          <section id="haklar" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              7. İlgili Kişi Hakları
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { emoji: '📋', hak: 'Bilgi alma',         aciklama: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme' },
                { emoji: '🔍', hak: 'Bilgiye erişim',     aciklama: 'İşlenen veriler hakkında bilgi talep etme' },
                { emoji: '✏️', hak: 'Düzeltme',           aciklama: 'Eksik veya yanlış verilerin düzeltilmesini isteme' },
                { emoji: '🗑️', hak: 'Silme',             aciklama: 'Koşulların oluşması halinde verilerin silinmesini isteme' },
                { emoji: '📣', hak: 'Aktarım bildirimi',  aciklama: 'Düzeltme/silme işleminin üçüncü kişilere bildirilmesini isteme' },
                { emoji: '🚫', hak: 'İtiraz',             aciklama: 'Otomatik sistemlere dayalı aleyhte sonuçlara itiraz etme' },
                { emoji: '⛔', hak: 'İşlemeyi durdurma', aciklama: 'Belirli durumlarda veri işlemenin durdurulmasını talep etme' },
                { emoji: '⚖️', hak: 'Tazminat',          aciklama: 'Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme' },
              ].map(item => (
                <div key={item.hak} style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{item.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1F2937', marginBottom: 4 }}>{item.hak}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{item.aciklama}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 8 */}
          <section id="basvuru">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              8. Başvuru Yöntemi
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              Yukarıdaki haklarınızı kullanmak için aşağıdaki yollardan bize ulaşabilirsiniz. Başvurularınız yasal süre içinde (en geç 30 gün) yanıtlanacaktır:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📧', label: 'E-posta', value: 'kvkk@hekimhane.com.tr', note: 'Kayıtlı e-posta veya noter onaylı imza gerekebilir' },
                { icon: '📬', label: 'Posta', value: 'Hekimhane, [Adres]', note: 'Kimlik fotokopisi ile birlikte' },
                { icon: '📝', label: 'Online Form', value: 'iletisim@hekimhane.com.tr', note: 'KVKK başvuru formu ile' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: 'white', borderRadius: 10, border: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.7, marginTop: 20 }}>
              Başvurunuzun yanıtsız kalması veya yetersiz bulmanız durumunda <strong>Kişisel Verileri Koruma Kurumu</strong>'na (<a href="https://www.kvkk.gov.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>kvkk.gov.tr</a>) şikâyette bulunma hakkınız saklıdır.
            </p>
          </section>

        </article>

        {/* Sidebar TOC */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'var(--navy)', color: 'white' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>📑 İçindekiler</div>
            </div>
            <nav style={{ padding: '12px 0' }}>
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} style={{
                  display: 'block', padding: '8px 20px', fontSize: 13,
                  color: '#374151', textDecoration: 'none', lineHeight: 1.4,
                  borderLeft: '3px solid transparent',
                  transition: 'all .15s',
                }}>
                  {s.title}
                </a>
              ))}
            </nav>
          </div>

          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px', marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 8 }}>📋 İlgili Belgeler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/gizlilik" style={{ fontSize: 13, color: '#92400E', textDecoration: 'none', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>🔒</span> Gizlilik Politikası
              </Link>
              <Link href="/cerez" style={{ fontSize: 13, color: '#92400E', textDecoration: 'none', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>🍪</span> Çerez Politikası
              </Link>
              <Link href="/kullanim" style={{ fontSize: 13, color: '#92400E', textDecoration: 'none', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>📄</span> Kullanım Şartları
              </Link>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 6 }}>KVKK Başvurusu</div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>Haklarınızı kullanmak için bizimle iletişime geçin.</p>
            <a href="mailto:kvkk@hekimhane.com.tr" className="btn btn-navy" style={{ fontSize: 13, display: 'block', textAlign: 'center' }}>
              Başvuru Yap
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
