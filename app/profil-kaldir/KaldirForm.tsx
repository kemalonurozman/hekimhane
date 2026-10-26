'use client';

// "Kaldırılmasını iste" formu — kısa tutulur: hesap açılmaz, kimlik numarası
// istenmez (uyum belgesi, Form metinleri §3). Kaldırma nedeni ve cep telefonu zorunlu.
// Gönderince talep yönetici paneline düşer; profil yayında kalır, 48 saat içinde
// karar verilmezse duraklatılır. E-postaya yalnız doğrulama bağlantısı gider.
import { useState } from 'react';
import Link from 'next/link';
import HkIcon from '@/components/HkIcon';
import { SIRKET } from '@/lib/sirket';
import { AYDINLATMA_YOL, UYUM_SURE, cepTelefonu } from '@/lib/uyum';

interface Props { entityId: string; entityType: string; entityName: string }

function Alan({ id, label, zorunlu, opsiyonel, hata, children }: { id: string; label: string; zorunlu?: boolean; opsiyonel?: boolean; hata?: string; children: React.ReactNode }) {
  return (
    <div className="kf-alan">
      <label htmlFor={id}>{label}{zorunlu && <span className="z" aria-hidden="true">*</span>}{opsiyonel && <span className="o">isteğe bağlı</span>}</label>
      {children}
      {hata && <p className="kf-hata" id={`${id}-h`} role="alert">{hata}</p>}
    </div>
  );
}

export default function KaldirForm({ entityId, entityType, entityName }: Props) {
  const [f, setF] = useState({ ad_soyad: '', talep_eden: 'sahip', email: '', tel: '', aciklama: '' });
  const [hatalar, setHatalar] = useState<Partial<Record<keyof typeof f, string>>>({});
  const [saving, setSaving] = useState(false);
  const [hata, setHata] = useState('');
  const [sonuc, setSonuc] = useState<{ kayitli: boolean } | null>(null);
  const [hp, setHp] = useState('');

  const degis = (k: keyof typeof f) => (v: string) => {
    setF(x => ({ ...x, [k]: v }));
    setHatalar(h => (h[k] ? { ...h, [k]: undefined } : h));
  };
  const cls = (k: keyof typeof f) => 'kf-in' + (hatalar[k] ? ' hata' : f[k].trim() ? ' dolu' : '');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const h: typeof hatalar = {};
    if (f.ad_soyad.trim().length < 3) h.ad_soyad = 'Ad soyad zorunludur';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) h.email = 'Geçerli bir e-posta girin';
    if (!cepTelefonu(f.tel)) h.tel = 'Geçerli bir cep telefonu girin (05XX XXX XX XX)';
    if (f.aciklama.trim().length < 10) h.aciklama = 'Profilin neden kaldırılması gerektiğini yazın (en az 10 karakter)';
    setHatalar(h);
    if (Object.keys(h).length) {
      const ilk = h.ad_soyad ? 'pk-ad' : h.email ? 'pk-email' : h.tel ? 'pk-tel' : 'pk-aciklama';
      document.getElementById(ilk)?.focus();
      return;
    }
    setSaving(true); setHata('');
    try {
      const r = await fetch('/api/profil/kaldir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, entity_type: entityType, ...f, website: hp }),
      });
      const j = await r.json();
      setSaving(false);
      if (!r.ok) {
        if (j.alan === 'tel' || j.alan === 'aciklama') setHatalar(x => ({ ...x, [j.alan]: j.error }));
        setHata(j.error || 'Talep gönderilemedi.'); return;
      }
      setSonuc({ kayitli: j.kayitli !== false });
    } catch {
      setSaving(false); setHata('Bağlantı hatası, lütfen tekrar deneyin.');
    }
  }

  if (sonuc) {
    return (
      <div className="kf-grup__kutu" style={{ padding: 'clamp(28px,5vw,44px) 24px' }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center' }}>
          <HkIcon name="success" size={56} />
          <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>Talebinizi aldık</h2>
          <p style={{ margin: 0, maxWidth: 460, fontSize: 15, lineHeight: 1.65, color: '#586273' }}>
            <strong style={{ color: '#0E1A2C' }}>{entityName}</strong> profili için talebiniz yönetici incelemesine alındı.
            Karar en geç {UYUM_SURE.kaldirma_duraklatma_saat} saat içinde verilir; verilmezse profil geçici olarak yayından alınır.{' '}
            {sonuc.kayitli && <>Lütfen e-postanıza gönderdiğimiz bağlantıyla adresinizi doğrulayın. </>}
            E-posta gelmezse <a href={`mailto:${SIRKET.eposta}`} style={{ color: '#12294D', fontWeight: 600 }}>{SIRKET.eposta}</a> adresine yazabilirsiniz.
          </p>
          <Link href="/" className="kf-geri" style={{ marginTop: 10, padding: '10px 18px' }}>Ana sayfa</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} style={{ display: 'block' }} noValidate>
      <h1 className="kf-baslik">Profilin kaldırılmasını isteyin</h1>
      <p className="kf-alt">Profilinizin Hekimhane&apos;den kaldırılmasını isteyebilirsiniz. Talebiniz yönetici tarafından incelenir; {UYUM_SURE.kaldirma_duraklatma_saat} saat içinde karar verilmezse profil geçici olarak yayından alınır.</p>

      <section className="kf-grup">
        <h2 className="kf-grup__baslik">Talep</h2>
        <div className="kf-grup__kutu">
          <div className="kf-alan">
            <label>Hangi profil</label>
            <div className="kf-giris"><input className="kf-in dolu" value={entityName} readOnly aria-readonly="true" /></div>
          </div>
          <div className="kf-iki">
            <Alan id="pk-ad" label="Ad soyad" zorunlu hata={hatalar.ad_soyad}>
              <div className="kf-giris">
                <input id="pk-ad" className={cls('ad_soyad')} value={f.ad_soyad} autoComplete="name" placeholder="Adınız Soyadınız"
                  aria-invalid={!!hatalar.ad_soyad} onChange={e => degis('ad_soyad')(e.target.value)} />
                <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
              </div>
            </Alan>
            <Alan id="pk-eden" label="Talebi yapan" zorunlu>
              <select id="pk-eden" className="kf-in dolu" value={f.talep_eden} onChange={e => degis('talep_eden')(e.target.value)}>
                <option value="sahip">Profilin sahibi (doktor / işletme)</option>
                <option value="yetkili">Doktor veya işletme adına yetkili kişi</option>
              </select>
            </Alan>
          </div>
          <div className="kf-iki">
            <Alan id="pk-email" label="E-posta" zorunlu hata={hatalar.email}>
              <div className="kf-giris">
                <input id="pk-email" type="email" className={cls('email')} value={f.email} autoComplete="email" placeholder="ornek@email.com"
                  aria-invalid={!!hatalar.email} onChange={e => degis('email')(e.target.value)} />
                <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
              </div>
              <p className="kf-not" style={{ margin: '6px 0 0', textAlign: 'left' }}>Doğrulama bağlantısı ve sonuç bu adrese gönderilir.</p>
            </Alan>
            <Alan id="pk-tel" label="Cep telefonu" zorunlu hata={hatalar.tel}>
              <div className="kf-giris">
                <input id="pk-tel" type="tel" inputMode="tel" className={cls('tel')} value={f.tel} autoComplete="tel" placeholder="05XX XXX XX XX"
                  aria-invalid={!!hatalar.tel} onChange={e => degis('tel')(e.target.value)} />
                <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
              </div>
              <p className="kf-not" style={{ margin: '6px 0 0', textAlign: 'left' }}>Yönetici talebi doğrulamak için arayabilir. Sitede yayımlanmaz.</p>
            </Alan>
          </div>
          <Alan id="pk-aciklama" label="Kaldırma nedeni" zorunlu hata={hatalar.aciklama}>
            <textarea id="pk-aciklama" rows={3} className={cls('aciklama')} value={f.aciklama}
              placeholder="Profilin neden kaldırılması gerektiğini kısaca yazın. Örn. artık bu kurumda çalışmıyorum, mesleği bıraktım, bilgiler bana ait değil."
              aria-invalid={!!hatalar.aciklama} onChange={e => degis('aciklama')(e.target.value)} />
          </Alan>
          {/* bot tuzağı */}
          <input type="text" name="website" value={hp} onChange={e => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
        </div>
      </section>

      <p className="kf-ipucu" style={{ marginBottom: 14 }}>
        <HkIcon name="info" size={16} accent={false} />
        <span>
          Talebin size ait olduğunu doğrulamak için e-posta adresinize bir doğrulama bağlantısı göndeririz; yönetici gerekirse sizi arar ya da ek bilgi ve yetki belgesi ister.
          Talebiniz en geç {UYUM_SURE.kaldirma_ust_gun} gün içinde sonuçlandırılır; {UYUM_SURE.kaldirma_duraklatma_saat} saat içinde karar verilmezse profil geçici olarak yayından alınır.
          Kaldırılan profil, yanlış ya da yetkisiz taleplere karşı {UYUM_SURE.kaldirma_yedek_gun} gün geri yüklenebilir biçimde saklanır; sonrasında yeniden eklenmemesi için yalnız adınız, iliniz ve talep tarihiniz tutulur.{' '}
          <Link href={AYDINLATMA_YOL.profesyonel} style={{ color: '#12294D', fontWeight: 600 }}>Kişisel verileriniz nasıl işleniyor?</Link>
        </span>
      </p>

      {hata && <div className="kf-hatakutu" role="alert"><strong style={{ display: 'block', marginBottom: 2 }}>Gönderim başarısız</strong>{hata}</div>}
      <button type="submit" disabled={saving} className="kf-gonder hk-cta-isik">
        {saving ? 'Gönderiliyor…' : 'Kaldırma talebini gönder'}
      </button>
    </form>
  );
}
