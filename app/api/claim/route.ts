import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir, satirTel, esc } from '@/lib/email';
import { SAHIPLIK_TABLO, epostaNormal, sahiplikDurumu } from '@/lib/sahiplik';
import { isletmeBilgisi } from '@/lib/entity-link';

const TUR_ETIKET: Record<string, string> = { doktor: 'Doktor', klinik: 'Klinik', hastane: 'Hastane', eczane: 'Eczane' };

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Sahiplenme talebi bildirimleri — admin + talep sahibi. Ana akışı bloklamaz.
async function sendClaimBildirimleri(k: {
  entity_id: string; entity_name: string; entity_type: string; claimant_name: string;
  phone: string; email: string; role: string | null; isDispute: boolean;
  mevcutErisimSayisi?: number; guncelleme?: boolean;
}) {
  try {
    const tur = k.isDispute ? 'Sahiplenme İtirazı' : 'Sahiplenme Talebi';

    // İşletmenin kendisi: doktorda bölüm + kurum, diğerlerinde tür/konum, hepsinde profil linki.
    // Formdan gelen entity_name boş/eksikse DB'deki ad kullanılır.
    const b = await isletmeBilgisi(adminClient(), k.entity_type, k.entity_id);
    const isletmeAdi = k.entity_name || b.ad || '—';
    const turEtiket = TUR_ETIKET[k.entity_type] || k.entity_type;
    const linkSatiri = b.url
      ? `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${esc(b.url)}" style="color:#1A335E;font-weight:600;">${esc(b.url.replace(/^https?:\/\/(www\.)?/, ''))}</a></p>`
      : '';

    const detay =
      satir('İşletme', isletmeAdi) +
      satir('Tür', turEtiket) +
      (k.entity_type === 'doktor' ? satir('Bölüm / Uzmanlık', b.bolum) + satir('Çalıştığı Kurum', b.kurum) : satir(k.entity_type === 'hastane' ? 'Hastane Türü' : 'Uzmanlıklar', b.bolum)) +
      satir('Konum', b.konum) +
      linkSatiri +
      `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">` +
      satir('Ad Soyad', k.claimant_name) +
      satirTel('Telefon', k.phone) +
      satir('E-posta', k.email) +
      satir('Not / Rol', k.role) +
      // E-postalar maile YAZILMAZ: admin maili alıntıyla yanıtlarsa (replyTo = başvuran)
      // mevcut sahiplerin adresleri itiraz edene gider. Ayrıntı admin Talepler sekmesinde.
      (k.isDispute ? satir('Profili şu an yöneten', k.mevcutErisimSayisi
        ? `${k.mevcutErisimSayisi} onaylı hesap (e-postalar admin panelinde, Talepler › detay)`
        : 'kayıtta "sahiplenildi" işareti var, onaylı hesap yok') : '');

    // 1) Admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${k.guncelleme ? 'Güncellenen' : 'Yeni'} ${tur.toLowerCase()} — ${isletmeAdi}${b.bolum && k.entity_type === 'doktor' ? ` (${b.bolum})` : ''}`,
      html: mailShell(`Yeni ${tur}`, detay +
        `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Admin panelindeki Talepler sekmesinden onaylayabilir veya reddedebilirsiniz.</p>`),
      replyTo: k.email || undefined,
    });

    // 2) Talep sahibi
    if (k.email && k.email.includes('@')) {
      await sendEmail({
        to: k.email,
        subject: `${tur}niz alındı — ${isletmeAdi}`,
        html: mailShell(`${tur}niz Alındı`,
          `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${esc(k.claimant_name)}</strong>,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(isletmeAdi)}</strong> için ${tur.toLowerCase()}niz başarıyla alındı. Talebiniz <strong>24 saat içinde</strong> değerlendirilip size geri dönüş yapılacaktır.</p>` +
          (b.url ? `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:8px;">Talep ettiğiniz profil: <a href="${esc(b.url)}" style="color:#1A335E;font-weight:600;">${esc(b.url.replace(/^https?:\/\/(www\.)?/, ''))}</a></p>` : '') +
          `<p style="font-size:13px;color:#6E6E73;line-height:1.6;margin-top:12px;">Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`),
      });
    }
  } catch { /* bildirim hatası ana akışı etkilemez */ }
}

// Basit IP bazlı hız sınırı — instance başına 10 dk'da 6 başvuru.
// (Serverless'ta instance'lar arası paylaşılmaz; mail bombalamaya karşı temel koruma.)
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 6;
const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  if (rateMap.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    Array.from(rateMap.entries()).forEach(([k, v]) => { if (!v.some(t => t > cutoff)) rateMap.delete(k); });
  }
  return false;
}

/* ── POST: sahiplenme / itiraz talebi kaydet (auth gerekmez) ──
   Tarayıcıdan anon key ile doğrudan insert RLS'e (profiles özyineleme
   hatası) takıldığı için yazma işlemi service role ile burada yapılır.

   Ekim 2026: "itiraz mı, normal başvuru mu?" kararını artık SUNUCU verir
   (lib/sahiplik.ts — profil ve /sahiplen ile aynı kaynak). İstemcinin
   gönderdiği status yok sayılır; eskiden doktorlarda verified yüzünden
   sahipsiz profillere "itiraz" yazılıyor ve admin'de işlenemiyordu. */
export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Çok fazla başvuru gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const {
    entity_id, entity_type, entity_name,
    claimant_name, phone, email, role,
  } = body as {
    entity_id?: string;
    entity_type?: string;
    entity_name?: string;
    claimant_name?: string;
    phone?: string;
    email?: string;
    role?: string | null;
  };

  // Zorunlu alanlar
  if (!entity_id || !entity_type) {
    return NextResponse.json({ error: 'İşletme bilgisi eksik.' }, { status: 400 });
  }
  if (!SAHIPLIK_TABLO[String(entity_type)]) {
    return NextResponse.json({ error: 'Geçersiz işletme türü.' }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: 'Telefon zorunludur.' }, { status: 400 });
  }
  const eposta = epostaNormal(email);
  if (!eposta || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) {
    return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  const tip = String(entity_type);
  const eid = String(entity_id).slice(0, 100);
  const yeni = eid === 'new';
  const admin = adminClient();

  let durum: 'pending' | 'dispute' = 'pending';
  let mevcutErisimSayisi = 0;
  let isletmeAdi = (entity_name || '').toString().slice(0, 200);

  if (!yeni) {
    // İşletme gerçekten var mı? (select('*'): claimed kolonu olmayan tabloda düşmesin)
    const { data: row, error: rowErr } = await (admin as any).from(SAHIPLIK_TABLO[tip])
      .select('*').eq('id', eid).maybeSingle();
    if (rowErr) {
      console.error('claim entity lookup error:', rowErr.message);
      return NextResponse.json({ error: 'İşletme doğrulanamadı, lütfen tekrar deneyin.' }, { status: 500 });
    }
    if (!row) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 });
    const r = row as any;
    const dbAdi = tip === 'doktor' ? [r.unvan, r.ad, r.soyad].filter(Boolean).join(' ').trim() : String(r.name || '');
    if (dbAdi) isletmeAdi = dbAdi; // admin istemcinin yazdığı adı değil, kayıttaki adı görsün

    const { sahipli, erisimler, sahipler } = await sahiplikDurumu(admin, eid, r.claimed);
    // Zaten sahip ya da sahipli işletmenin yöneticisi → yeni başvuru gereksiz. (Sahibi
    // ayrılmış işletmede kalan yönetici ise normal başvuru yapabilir — sahip olmak için.)
    if (sahipler.includes(eposta) || (sahipli && erisimler.includes(eposta))) {
      return NextResponse.json({
        error: 'Bu e-posta adresi bu profili zaten yönetiyor. Giriş yapıp panelden düzenleyebilirsiniz.',
        zatenErisim: true,
      }, { status: 409 });
    }
    durum = sahipli ? 'dispute' : 'pending';
    mevcutErisimSayisi = erisimler.filter(e => e !== eposta).length;

    // Mükerrer koruması: aynı kişinin bu işletme için bekleyen başvurusu varsa yenisini açma.
    const { data: bekleyen } = await (admin as any).from('claim_requests')
      .select('id,status,email')
      .eq('entity_id', eid)
      .in('status', ['pending', 'dispute'])
      .limit(50);
    const ayni = ((bekleyen as any[]) || []).find(b => epostaNormal(b.email) === eposta);
    if (ayni) {
      // Yeni satır açılmaz ama yeni bilgiler (düzeltilmiş telefon, belge notu) kaybolmasın:
      // bekleyen satır güncellenir ve admin "güncellenen talep" bildirimi alır.
      // Durum da güncel karara çekilir (ör. eski hatayla "itiraz" yazılmış sahipsiz profil → normal).
      const { error: guncErr } = await (admin as any).from('claim_requests').update({
        status:        durum,
        phone:         phone.trim().slice(0, 40),
        ...(claimant_name ? { claimant_name: String(claimant_name).slice(0, 120) } : {}),
        ...(role ? { role: String(role).slice(0, 300) } : {}),
      }).eq('id', ayni.id);
      if (guncErr) console.error('claim tekrar update error:', guncErr.message);
      await sendClaimBildirimleri({
        entity_id: eid, entity_name: isletmeAdi, entity_type: tip,
        claimant_name: (claimant_name || '').toString(), phone: phone.trim(), email: eposta,
        role: role ? String(role) : null, isDispute: durum === 'dispute',
        mevcutErisimSayisi, guncelleme: true,
      });
      return NextResponse.json({ ok: true, status: durum, tekrar: true });
    }
  }

  const { data, error } = await admin
    .from('claim_requests')
    .insert({
      entity_id:     eid,
      entity_type:   tip.slice(0, 40),
      entity_name:   isletmeAdi || null,
      claimant_name: (claimant_name || '').slice(0, 120) || null,
      phone:         phone.trim().slice(0, 40),
      email:         eposta.slice(0, 160),
      role:          role ? String(role).slice(0, 300) : null,
      status:        durum,
    })
    .select()
    .single();

  if (error) {
    console.error('claim insert error:', error);
    return NextResponse.json({ error: 'Başvuru kaydedilemedi, lütfen tekrar deneyin.' }, { status: 500 });
  }

  await sendClaimBildirimleri({
    entity_id: eid,
    entity_name: isletmeAdi,
    entity_type: tip,
    claimant_name: (claimant_name || '').toString(),
    phone: phone.trim(),
    email: eposta,
    role: role ? String(role) : null,
    isDispute: durum === 'dispute',
    mevcutErisimSayisi,
  });

  return NextResponse.json({ ok: true, id: data.id, status: durum });
}
