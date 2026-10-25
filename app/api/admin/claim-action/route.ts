import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendEmail, mailShell, esc } from '@/lib/email';
import { yeniIsletmeOlustur } from '@/lib/yeni-isletme';
import { claimedEsitle, epostaNormal } from '@/lib/sahiplik';
import { yoneticiMi } from '@/lib/yonetici';
import { erkenUyeProVer, erkenUyeMailBolumu, type ErkenUyeSonuc } from '@/lib/erken-uye';
import { ERKEN_UYE_METIN } from '@/lib/erken-uye-metin';

// Güçlü, okunabilir geçici şifre (harf + rakam, 12 karakter)
function genPassword(): string {
  const base = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return (base + 'Hk9').slice(0, 12);
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}


const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  doktor:  'doktorlar',
  eczane:  'eczaneler',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum doğrula
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { claimId, action, notify } = await request.json();
    if (!claimId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. Talebi bul
    const { data: claim, error: fetchErr } = await admin
      .from('claim_requests')
      .select('*')
      .eq('id', claimId)
      .single();

    if (fetchErr || !claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 3. Talep durumunu güncelle. E-posta küçük harfe çekilir: panel erişimi
    //    Auth e-postasıyla (küçük harf) birebir eşleşir; "Ali@x.com" yazan
    //    sahip onaylansa da paneline erişemiyordu.
    const normalEposta = epostaNormal(claim.email);
    const { error: updateErr } = await admin
      .from('claim_requests')
      .update(normalEposta && normalEposta !== claim.email ? { status: newStatus, email: normalEposta } : { status: newStatus })
      .eq('id', claimId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 4. "claimed" önbelleğini claim_requests'e göre yeniden hesapla (lib/sahiplik.ts).
    //    Onayda true olur; "Onayı Kaldır"da başka onaylı erişim kalmadıysa false olur
    //    (eskiden redde dokunulmuyordu → sahipsiz kayıt "Sahiplenildi" kalıyordu).
    //    Hata yutulmaz: kolon yoksa admin uyarıyı görür.
    let warning: string | null = null;
    let olusturulan: { id: string; slug: string; entityType: string } | null = null;
    let erken: ErkenUyeSonuc | null = null;
    const sahipOnayi = action === 'approve' && !yoneticiMi(claim.role);
    if (action === 'approve' && claim.entity_id === 'new') {
      // "Yeni işletme" başvurusu: listede kayıt yok → şimdi oluştur ve talebi ona bağla.
      // (Eskiden onay yalnız durumu değiştiriyordu; sahibi panelde "onaylı" görüp
      // düzenleyecek bir kayıt bulamıyordu.) Başvurandaki telefon kayda yazılmaz.
      try {
        const y = await yeniIsletmeOlustur(admin, claim);
        // Diş hekimi "doktor" başvurusu klinik olarak açılır → talebin türü de güncellenir
        const { error: bagErr } = await admin.from('claim_requests')
          .update({ entity_id: y.id, entity_type: y.entityType }).eq('id', claimId);
        if (bagErr) throw new Error(`kayıt oluştu (${y.id}) ama talebe bağlanamadı: ${bagErr.message}`);
        claim.entity_id = y.id;
        claim.entity_type = y.entityType;
        olusturulan = { id: y.id, slug: y.slug, entityType: y.entityType };
        if (y.uyari) warning = y.uyari;
        // Yeni doktor kaydı claimed'sız oluşturuluyordu (diğer türler claimed:true ile)
        const es = await claimedEsitle(admin, y.entityType, y.id);
        if (es.uyari) warning = [warning, es.uyari].filter(Boolean).join(' · ');
        // İlk 150 işletmeye ücretsiz Pro (lib/erken-uye.ts)
        if (sahipOnayi) erken = await erkenUyeProVer(admin, { entityType: y.entityType, entityId: y.id, entityName: claim.entity_name, email: normalEposta });
        try { revalidatePath(`/${y.tablo}`); revalidatePath('/'); revalidateTag('facets'); } catch { /* build dışı */ }
      } catch (e) {
        warning = `Talep onaylandı ama işletme kaydı oluşturulamadı: ${(e as Error).message}`;
      }
    } else if (action === 'approve' && claim.entity_id) {
      const table = TABLE_MAP[claim.entity_type];
      if (table) {
        const { data: mevcut } = await admin.from(table).select('id').eq('id', claim.entity_id).maybeSingle();
        if (!mevcut) {
          warning = `Talep onaylandı ama bağlı işletme kaydı (${claim.entity_id}) listede yok — silinmiş olabilir. Sahibi panelde düzenleyecek kayıt bulamaz.`;
        } else {
          const es = await claimedEsitle(admin, claim.entity_type, claim.entity_id);
          if (es.uyari) warning = `Talep onaylandı. ${es.uyari}`;
          // İlk 150 işletmeye ücretsiz Pro (lib/erken-uye.ts) — yalnız gerçekten sahip varsa
          if (sahipOnayi && es.sahipVar !== false) erken = await erkenUyeProVer(admin, { entityType: claim.entity_type, entityId: claim.entity_id, entityName: claim.entity_name, email: normalEposta });
          // Doktor sahiplenince gizli iletişimi (Bobath vb.) otomatik aç — best-effort
          if (claim.entity_type === 'doktor') {
            try { await admin.from(table).update({ contact_hidden: false }).eq('id', claim.entity_id); }
            catch { /* contact_hidden kolonu yoksa sessizce geç */ }
          }
        }
      }
    } else if (action === 'reject' && claim.entity_id && claim.entity_id !== 'new' && TABLE_MAP[claim.entity_type]) {
      // Onaylı bir erişim geri alındıysa işaret yeniden hesaplanır; bekleyen bir
      // başvurunun reddi sonucu değiştirmez (aynı hesap, zararsız).
      const es = await claimedEsitle(admin, claim.entity_type, claim.entity_id);
      if (es.uyari) warning = `Talep reddedildi. ${es.uyari}`;
    }

    if (erken?.uyari) warning = [warning, erken.uyari].filter(Boolean).join(' · ');

    // 5. Bildirim: admin "mail gönder" dediyse (notify) kullanıcıya mail at.
    //    Onayda hesap oluştur/varsa bildir; redde kısa bilgilendirme.
    let mail: { sent: boolean; accountCreated: boolean; tempPassword?: string } = { sent: false, accountCreated: false };
    const email = (claim.email || '').trim().toLowerCase();
    if (notify && email && email.includes('@')) {
      try {
        if (action === 'approve') {
          // 1) Auth kullanıcısını garanti et + user_id al (yeni ya da mevcut)
          let userId: string | null = null;
          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email, password: genPassword(), email_confirm: true,
            user_metadata: { source: 'claim_approval', entity_name: claim.entity_name },
          });
          if (created?.user) userId = created.user.id;
          if (!userId) {
            // Zaten var → user_id'yi generateLink ile al (mail göndermez, sadece user döner)
            try {
              const { data: gl } = await admin.auth.admin.generateLink({ type: 'recovery', email } as any);
              userId = (gl as any)?.user?.id ?? null;
            } catch { /* geç */ }
          }

          // 2) Hesaba özel aktivasyon token'ı üret + sakla
          const token = crypto.randomUUID();
          await (admin as any).from('account_activations').insert({
            token, email, user_id: userId, entity_name: claim.entity_name,
          });

          // 3) Aktivasyon linkli (e-posta gömülü, şifre belirleme) markalı mail
          const aktivUrl = `https://www.hekimhane.com.tr/hesap-aktivasyon?token=${token}`;
          const pro = !!erken?.verildi;
          const html = mailShell(pro ? 'Sahipliğiniz onaylandı — Hekimhane-Pro hediyemiz' : 'Sahipliğiniz onaylandı',
            `<p style="font-size:14px;color:#1c1c1e;margin:0 0 12px;">Sayın <strong>${esc(claim.claimant_name || '')}</strong>,</p>` +
            `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 12px;"><strong>${esc(claim.entity_name)}</strong> profilinin sahiplik talebi incelendi ve <strong style="color:#067647;">onaylandı</strong>. Hekimhane'ye hoş geldiniz.</p>` +
            (pro ? erkenUyeMailBolumu(claim.entity_name || 'İşletmeniz') : '') +
            `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin:18px 0 0;"><strong>Hesabınızı etkinleştirin.</strong> Aşağıdaki düğme e-posta adresinizi (<strong>${esc(email)}</strong>) hazır getirir; şifrenizi iki kez girip doğrudan panelinize geçersiniz.</p>` +
            `<p style="margin:16px 0;"><a href="${aktivUrl}" style="display:inline-block;background:#1A335E;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-weight:700;font-size:14px;">Hesabımı Etkinleştir</a></p>` +
            `<p style="font-size:13px;color:#1c1c1e;line-height:1.6;margin:0 0 6px;">Panelinizden profil bilgilerinizi, fotoğraflarınızı, randevu taleplerinizi ve hasta yorumlarını yönetebilirsiniz.</p>` +
            `<p style="font-size:12px;color:#6E6E73;line-height:1.6;margin:14px 0 0;">Bu bağlantı yalnızca size özeldir ve 7 gün geçerlidir. Düğme çalışmazsa şu adresi tarayıcınıza yapıştırın:<br><span style="color:#1A335E;word-break:break-all;">${aktivUrl}</span></p>` +
            `<p style="font-size:12px;color:#6E6E73;line-height:1.6;margin:10px 0 0;">Sorularınız için bu e-postayı yanıtlayabilirsiniz.<br>Hekimhane Ekibi</p>`);

          await sendEmail({ to: email, replyTo: 'info@hekimhane.com.tr', subject: pro ? `${claim.entity_name} — sahipliğiniz onaylandı, ${ERKEN_UYE_METIN.konuEki}` : `Sahipliğiniz onaylandı — ${claim.entity_name}`, html });
          mail = { sent: true, accountCreated: !!created?.user };
        } else {
          // Reddedildi bilgisi
          await sendEmail({
            to: email,
            subject: `Sahiplenme talebiniz hakkında — ${claim.entity_name}`,
            html: mailShell('Sahiplenme Talebiniz Değerlendirildi',
              `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${esc(claim.claimant_name)}</strong>,</p>` +
              `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(claim.entity_name)}</strong> için sahiplenme talebiniz şu an için onaylanamadı. Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`),
          });
          mail = { sent: true, accountCreated: false };
        }
      } catch (e) {
        console.error('claim-action mail error:', e);
      }
    }

    return NextResponse.json({ success: true, status: newStatus, mail, warning, created: olusturulan, erkenUye: erken ? { verildi: erken.verildi, sira: erken.sira, kalan: erken.kalan, not: erken.not } : null });
  } catch (err) {
    console.error('claim-action error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
