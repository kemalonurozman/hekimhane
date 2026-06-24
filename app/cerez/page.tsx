import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Çerez Politikası | Hekimhane',
  description: 'Hekimhane\'nin çerez kullanımı hakkında bilgi edinin: hangi çerezleri kullandığımız, neden kullandığımız ve nasıl yönetebileceğiniz.',
};

const sections = [
  { id: 'cerez-nedir',   title: '1. Çerez Nedir?' },
  { id: 'cerez-turleri', title: '2. Kullandığımız Çerezler' },
  { id: 'amac',          title: '3. Çerez Kullanım Amacı' },
  { id: 'ucuncu-taraf',  title: '4. Üçüncü Taraf Çerezleri' },
  { id: 'yonetim',       title: '5. Çerezleri Yönetme' },
  { id: 'haklariniz',    title: '6. Haklarınız' },
  { id: 'iletisim',      title: '7. İletişim' },
];

export default function CerezPage() {
  return (
    <main style={{ background: 'var(--ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
        padding: '64px 0 48px',
        color: 'white',
      }}>
        <div className="container">
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>Çerez Politikası</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(212,168,67,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🍪</div>
            <div>
              <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, margin: 0 }}>Çerez Politikası</h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,.7)', fontSize: 15 }}>Hekimhane'nin çerez kullanımı hakkında bilgiler</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, margin: 0 }}>Son güncelleme: Ocak 2025</p>
        </div>
      </section>

      <div className="container" style={{ padding: '48px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
        {/* İçerik */}
        <article style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '40px 48px' }}>

          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 36 }}>
            Hekimhane olarak web sitemizde çerezler ve benzer takip teknolojileri kullanmaktayız. Bu politika, hangi çerezleri neden kullandığımızı ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.
          </p>

          {/* 1 */}
          <section id="cerez-nedir" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              1. Çerez Nedir?
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 12 }}>
              Çerezler, ziyaret ettiğiniz web sitesi tarafından bilgisayarınıza, tabletinize veya akıllı telefonunuza yerleştirilen küçük metin dosyalarıdır. Çerezler, web sitesinin düzgün çalışmasını sağlamak, güvenliği artırmak, kullanım deneyimini kişiselleştirmek ve ziyaretçi davranışlarını analiz etmek için kullanılır.
            </p>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>
              Çerezler zararlı değildir; kişisel dosyalarınıza erişemez veya virüs bulaştıramazlar. Çerezler yalnızca onları yerleştiren site tarafından okunabilir.
            </p>
          </section>

          {/* 2 */}
          <section id="cerez-turleri" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              2. Kullandığımız Çerezler
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  tip: 'Zorunlu Çerezler',
                  badge: '#065F46',
                  badgeBg: '#D1FAE5',
                  icon: '🔒',
                  aciklama: 'Bu çerezler sitenin temel işlevleri için gereklidir. Site bu çerezler olmadan çalışamaz. Oturum yönetimi, güvenlik doğrulaması ve tercih kayıtları bu kapsamdadır.',
                  ornekler: ['session_id — oturum yönetimi', 'csrf_token — güvenlik koruması', 'cookie_consent — çerez onayı kaydı'],
                  sure: 'Oturum süresi / 1 yıl',
                  devre: 'Devre dışı bırakılamaz',
                },
                {
                  tip: 'Performans Çerezleri',
                  badge: '#1E40AF',
                  badgeBg: '#DBEAFE',
                  icon: '📊',
                  aciklama: 'Ziyaretçilerin siteyi nasıl kullandığına dair anonim istatistikler toplar. Bu veriler, sitenin performansını iyileştirmek için kullanılır.',
                  ornekler: ['_ga — Google Analytics ziyaretçi tanımlama', '_gid — Günlük oturum tanımlama', '_gat — İstek hızı sınırlama'],
                  sure: '2 yıl',
                  devre: 'Tercihler panelinden devre dışı bırakılabilir',
                },
                {
                  tip: 'İşlevsellik Çerezleri',
                  badge: '#7C3AED',
                  badgeBg: '#EDE9FE',
                  icon: '⚙️',
                  aciklama: 'Dil tercihi, şehir filtresi ve son aramalarınız gibi tercihlerinizi hatırlamak için kullanılır.',
                  ornekler: ['preferred_city — şehir filtresi tercihi', 'search_history — son aramalar (oturum)', 'theme — arayüz tercihi'],
                  sure: '1 yıl',
                  devre: 'Tercihler panelinden devre dışı bırakılabilir',
                },
                {
                  tip: 'Pazarlama / Hedefleme Çerezleri',
                  badge: '#B45309',
                  badgeBg: '#FEF3C7',
                  icon: '🎯',
                  aciklama: 'Reklam ortakları aracılığıyla ilgi alanlarınıza uygun içerikler sunmak için kullanılabilir. Bu çerezler yalnızca açık rızanız ile aktif edilir.',
                  ornekler: ['_fbp — Facebook Pixel', 'ads/ga-audiences — Google Ads', 'IDE — DoubleClick reklam'],
                  sure: 'Değişken (90 gün – 2 yıl)',
                  devre: 'Yalnızca rızanız ile aktif, istediğiniz zaman geri alabilirsiniz',
                },
              ].map(item => (
                <div key={item.tip} style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1F2937' }}>{item.tip}</span>
                    <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: item.badge, background: item.badgeBg }}>
                      {item.devre.includes('bırakılamaz') ? 'Zorunlu' : 'İsteğe Bağlı'}
                    </span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12 }}>{item.aciklama}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {item.ornekler.map(o => (
                        <code key={o} style={{ fontSize: 11, padding: '3px 8px', background: '#F3F4F6', borderRadius: 6, color: '#374151', fontFamily: 'monospace' }}>{o}</code>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6B7280' }}>
                      <span>⏱ Süre: {item.sure}</span>
                      <span>🔧 {item.devre}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section id="amac" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              3. Çerez Kullanım Amacı
            </h2>
            <ul style={{ paddingLeft: 20, color: '#374151', lineHeight: 2, fontSize: 15 }}>
              <li>Güvenli oturum yönetimi ve kimlik doğrulama</li>
              <li>Şehir, uzmanlık ve filtre tercihlerinizin hatırlanması</li>
              <li>Platform güvenliğinin sağlanması ve bot trafiğinin engellenmesi</li>
              <li>Site trafiğinin anonim olarak ölçülmesi ve raporlanması</li>
              <li>Doktor / klinik arama sonuçlarının iyileştirilmesi</li>
              <li>Hata ve performans sorunlarının tespit edilmesi</li>
            </ul>
          </section>

          {/* 4 */}
          <section id="ucuncu-taraf" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              4. Üçüncü Taraf Çerezleri
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              Hekimhane, aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır. Bu hizmetler kendi çerez politikaları çerçevesinde veri işleyebilir:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { ad: 'Google Analytics', amac: 'Ziyaretçi analizi ve trafik ölçümü', link: 'https://policies.google.com/privacy' },
                { ad: 'OpenStreetMap / Leaflet', amac: 'Harita görüntüleme (konum bazlı arama)', link: 'https://wiki.openstreetmap.org/wiki/Privacy_Policy' },
                { ad: 'Supabase', amac: 'Veritabanı altyapısı (sunucu tarafı)', link: 'https://supabase.com/privacy' },
              ].map(item => (
                <div key={item.ad} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>{item.ad}</div>
                    <div style={{ color: '#6B7280', fontSize: 13 }}>{item.amac}</div>
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                    Politika →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section id="yonetim" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              5. Çerezleri Yönetme
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
              Çerezleri aşağıdaki yöntemlerle yönetebilirsiniz:
            </p>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#065F46', marginBottom: 8 }}>🍪 Çerez Tercih Paneli</div>
              <p style={{ fontSize: 14, color: '#065F46', lineHeight: 1.6, margin: 0 }}>
                Sitemizin alt kısmındaki çerez onay bandından veya Ayarlar menüsünden isteğe bağlı çerezleri istediğiniz zaman açıp kapatabilirsiniz.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  tarayici: 'Google Chrome',
                  yol: 'Ayarlar → Gizlilik ve Güvenlik → Çerezler ve diğer site verileri',
                },
                {
                  tarayici: 'Mozilla Firefox',
                  yol: 'Seçenekler → Gizlilik ve Güvenlik → Çerezler ve Site Verileri',
                },
                {
                  tarayici: 'Safari',
                  yol: 'Tercihler → Gizlilik → Çerezler ve web sitesi verileri',
                },
                {
                  tarayici: 'Microsoft Edge',
                  yol: 'Ayarlar → Gizlilik, arama ve hizmetler → Çerezler',
                },
              ].map(item => (
                <div key={item.tarayici} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14 }}>
                  <span style={{ color: 'var(--navy)', fontWeight: 700, minWidth: 130 }}>🌐 {item.tarayici}</span>
                  <span style={{ color: '#374151' }}>{item.yol}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px', marginTop: 16, fontSize: 13, color: '#92400E' }}>
              ⚠️ <strong>Not:</strong> Tüm çerezleri devre dışı bırakmak, sitenin bazı özelliklerinin düzgün çalışmamasına neden olabilir (örn. şehir filtresi tercihlerinin hatırlanmaması).
            </div>
          </section>

          {/* 6 */}
          <section id="haklariniz" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              6. Haklarınız
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>
              6698 sayılı KVKK kapsamında kişisel verilerinizin işlenmesine ilişkin haklarınız mevcuttur. Çerez onayınızı istediğiniz zaman geri alabilir, verilerinizin silinmesini veya aktarılmamasını talep edebilirsiniz. Detaylı bilgi için <Link href="/kvkk" style={{ color: 'var(--navy)', fontWeight: 600 }}>KVKK Aydınlatma Metnimizi</Link> inceleyebilirsiniz.
            </p>
          </section>

          {/* 7 */}
          <section id="iletisim">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
              7. İletişim
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              Çerez politikamız hakkında sorularınız veya talepleriniz için:
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="mailto:gizlilik@hekimhane.com.tr" className="btn btn-navy" style={{ fontSize: 14 }}>
                ✉️ E-posta Gönder
              </a>
              <Link href="/iletisim" className="btn" style={{ fontSize: 14, border: '1px solid var(--border)', color: 'var(--navy)', background: 'white', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
                İletişim Formu →
              </Link>
            </div>
          </section>

        </article>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#1F2937', color: 'white' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>🍪 İçindekiler</div>
            </div>
            <nav style={{ padding: '12px 0' }}>
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} style={{
                  display: 'block', padding: '8px 20px', fontSize: 13,
                  color: '#374151', textDecoration: 'none', lineHeight: 1.4,
                }}>
                  {s.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Çerez özet tablosu */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 12 }}>📊 Çerez Özeti</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { tip: 'Zorunlu',   renk: '#065F46', bg: '#D1FAE5', n: '3' },
                { tip: 'Performans',renk: '#1E40AF', bg: '#DBEAFE', n: '3' },
                { tip: 'İşlevsel',  renk: '#7C3AED', bg: '#EDE9FE', n: '3' },
                { tip: 'Pazarlama', renk: '#B45309', bg: '#FEF3C7', n: '3' },
              ].map(item => (
                <div key={item.tip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#374151' }}>{item.tip}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontWeight: 700, color: item.renk, background: item.bg, fontSize: 12 }}>{item.n} çerez</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 8 }}>📋 İlgili Belgeler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/kvkk" style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'flex', gap: 6 }}>🔒 KVKK Aydınlatma Metni</Link>
              <Link href="/gizlilik" style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'flex', gap: 6 }}>🛡 Gizlilik Politikası</Link>
              <Link href="/kullanim" style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'flex', gap: 6 }}>📄 Kullanım Şartları</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
