// ─────────────────────────────────────────────────────────────────
//  İlk kullanıcılara ücretsiz Pro — SUNUCU (Eki 2026).
//  Sahiplenme onayı (/api/admin/claim-action) ve admin sahiplik ataması
//  (/api/admin/sahiplik) sahibi olan işletmeyi bununla Pro'ya geçirir.
//  Kural: ilk ERKEN_UYE_KOTA (150) işletme; işletme başına bir kez; zaten
//  Pro olan (ör. Stripe ile ödeyen) işletmeye dokunulmaz. Stripe kaydı
//  açılmaz → admin Premium listesinde "elle açılmış premium" olarak görünür.
//  Migration: supabase/migrations/2026-10-25_erken_uye_pro.sql
//  Yoksa hiçbir şey verilmez (fail-closed) ve admin'e uyarı döner.
// ─────────────────────────────────────────────────────────────────
import type { SupabaseClient } from '@supabase/supabase-js';
import { ERKEN_UYE_KOTA, ERKEN_UYE_METIN, ERKEN_UYE_OZELLIKLER } from '@/lib/erken-uye-metin';
import { kontenjanOku } from '@/lib/erken-uye-sayac';
import { esc } from '@/lib/email';

const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };

export type ErkenUyeSonuc = {
  /** Bu çağrıda Pro verildi mi */
  verildi: boolean;
  /** İşletmenin erken üye kaydı var mı (önceden ya da şimdi) — e-postada Pro bölümü buna bakar */
  kayitli: boolean;
  sira: number | null;
  kalan: number | null;
  /** Admin'e gösterilecek kısa not ("Ücretsiz Pro verildi (3/150)" vb.) */
  not: string | null;
  uyari: string | null;
};

const tabloYok = (m: string) => /erken_uye_pro/i.test(m) && /(does not exist|could not find|schema cache|relation)/i.test(m);

export async function erkenUyeProVer(
  db: SupabaseClient,
  o: { entityType: string; entityId: string; entityName?: string | null; email?: string | null },
): Promise<ErkenUyeSonuc> {
  const bos: ErkenUyeSonuc = { verildi: false, kayitli: false, sira: null, kalan: null, not: null, uyari: null };
  const tablo = TABLO[o.entityType];
  if (!tablo || !o.entityId || o.entityId === 'new') return bos;
  const d = db as any;
  try {
    // 1) İşletme zaten kayıtlı mı (işletme başına bir kez)
    const { data: var_, error: e1 } = await d.from('erken_uye_pro')
      .select('sira,kaynak').eq('entity_type', o.entityType).eq('entity_id', o.entityId).maybeSingle();
    if (e1) {
      const m = String(e1.message || e1);
      return { ...bos, uyari: tabloYok(m)
        ? 'Ücretsiz Pro verilmedi: erken_uye_pro tablosu yok — supabase/migrations/2026-10-25_erken_uye_pro.sql çalıştırılmalı.'
        : `Ücretsiz Pro kontrol edilemedi: ${m}` };
    }
    if (var_) return { ...bos, kayitli: true, sira: var_.sira ?? null, not: 'İşletme zaten ilk kullanıcı Pro kaydına sahip.' };

    // 2) Zaten Pro ise (ödeyen abone ya da elle açılmış) dokunma
    const { data: ent } = await d.from(tablo).select('premium').eq('id', o.entityId).maybeSingle();
    if (!ent) return { ...bos, uyari: 'Ücretsiz Pro verilmedi: işletme kaydı bulunamadı.' };
    if (ent.premium === true) return { ...bos, not: 'İşletme zaten Pro; ücretsiz Pro kotası kullanılmadı.' };

    // 3) Kota
    // Ana sayfa bandıyla aynı hesap: başlangıç dolgusu + gerçek kayıtlar + kayıtsız geçen günler.
    const { hata: e2, sonuc: kont } = await kontenjanOku(db);
    if (e2 || !kont) return { ...bos, uyari: `Ücretsiz Pro kotası okunamadı: ${e2}` };
    const kullanilan = kont.dolu;
    if (kullanilan >= ERKEN_UYE_KOTA) return { ...bos, kalan: 0, not: `İlk ${ERKEN_UYE_KOTA} üye kotası doldu; ücretsiz Pro verilmedi.` };

    // 4) Önce kayıt (benzersiz indeks çift vermeyi engeller), sonra premium
    const sira = kullanilan + 1;
    const { error: e3 } = await d.from('erken_uye_pro').insert({
      entity_type: o.entityType, entity_id: o.entityId,
      entity_name: o.entityName || null, email: o.email || null, sira, kaynak: 'otomatik',
    });
    if (e3) {
      if (/duplicate|unique/i.test(String(e3.message))) return { ...bos, kayitli: true, not: 'İşletme zaten ilk kullanıcı Pro kaydına sahip.' };
      return { ...bos, uyari: `Ücretsiz Pro kaydı yazılamadı: ${e3.message}` };
    }
    const { error: e4 } = await d.from(tablo).update({ premium: true }).eq('id', o.entityId);
    if (e4) {
      await d.from('erken_uye_pro').delete().eq('entity_type', o.entityType).eq('entity_id', o.entityId);
      return { ...bos, uyari: `Ücretsiz Pro açılamadı (premium yazılamadı): ${e4.message}` };
    }
    const kalan = Math.max(0, ERKEN_UYE_KOTA - sira);
    return { verildi: true, kayitli: true, sira, kalan, not: `Ücretsiz Pro verildi (${sira}/${ERKEN_UYE_KOTA}, kalan ${kalan}).`, uyari: null };
  } catch (e) {
    return { ...bos, uyari: `Ücretsiz Pro verilemedi: ${(e as Error)?.message || e}` };
  }
}

/** Onay / atama e-postalarına eklenen Pro bölümü (HTML). Yalnız erken üye kaydı varsa kullanılır. */
export function erkenUyeMailBolumu(isletme: string, site = 'https://www.hekimhane.com.tr'): string {
  const m = ERKEN_UYE_METIN;
  const liste = ERKEN_UYE_OZELLIKLER.map(o =>
    `<tr><td style="padding:6px 0;vertical-align:top;width:18px;color:#B8892F;font-weight:700;">&#10003;</td>` +
    `<td style="padding:6px 0;font-size:13.5px;color:#1c1c1e;line-height:1.5;"><strong>${esc(o.baslik)}</strong> — ${esc(o.aciklama)}</td></tr>`).join('');
  return `
  <div style="margin:20px 0 6px;border:1px solid #EAD9AE;background:#FFFBF0;border-radius:14px;padding:18px 18px 14px;">
    <div style="font-size:10.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A6A1F;margin:0 0 6px;">${esc(m.rozet)}</div>
    <div style="font-size:16px;font-weight:700;color:#12294D;margin:0 0 8px;letter-spacing:-.2px;">Hesabınız ücretsiz olarak Hekimhane-Pro'ya geçirildi</div>
    <p style="font-size:13.5px;color:#1c1c1e;line-height:1.6;margin:0 0 10px;">Hekimhane'nin ilk kullanıcılarına özel politikası kapsamında <strong>${esc(isletme)}</strong> için Pro üyeliği ücretsiz tanımlandı. ${esc(m.takvim)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 8px;">${liste}</table>
    <p style="font-size:12px;color:#6E6E73;line-height:1.6;margin:8px 0 0;">${esc(m.guvence)} Takvimi panelinizdeki <a href="${site}/panel" style="color:#1A335E;font-weight:700;">Randevu Takvimi</a> sekmesinden açabilirsiniz.</p>
  </div>`;
}
