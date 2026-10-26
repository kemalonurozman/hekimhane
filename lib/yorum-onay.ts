/**
 * Yorum onay akışı — tek kaynak (client + server ortak, sunucu importu YOK).
 *
 * Kural: ziyaretçinin yazdığı her yorum (profil formu, HekimKart formu, onaylı hasta
 * bağlantısı) önce admin onayına düşer; onaylanmadan hiçbir yerde yayınlanmaz.
 *
 * DDL yok — mevcut moderasyon kolonları kullanılır (add_yorum_moderation.sql):
 *   hidden=true + report_status='onay-bekliyor'  → onay bekliyor (kimse görmez)
 *   hidden=true + report_status='onay-belge'     → admin yorumcudan belge istedi (belge_istendi_at/belge_notu)
 *   hidden=true + report_status='onay-red'       → admin reddetti (kimse görmez, kayıt durur)
 *   hidden=false + report_status=null            → onaylandı / yayında
 * Şikayet akışı (pending/resolved/dismissed) bu değerlerle çakışmaz; admin Şikayetler
 * listesi onay değerlerini dışarıda bırakır.
 */

export const YORUM_ONAY_BEKLIYOR = 'onay-bekliyor';
export const YORUM_ONAY_BELGE = 'onay-belge';      // admin yorumcudan belge istedi, karar bekliyor
export const YORUM_ONAY_RED = 'onay-red';
export const YORUM_ONAY_DURUMLARI = [YORUM_ONAY_BEKLIYOR, YORUM_ONAY_BELGE, YORUM_ONAY_RED] as const;

/** Yorumcu e-postası geçerli mi (kayıt + belge isteği için gerekli). */
export const gecerliYorumcuEposta = (e: unknown) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** Yeni yorum kaydına eklenecek alanlar — onay bekler, gizli. */
export function onayBekleyenAlanlar(simdi = new Date()) {
  return { hidden: true, report_status: YORUM_ONAY_BEKLIYOR, reported_at: simdi.toISOString() };
}

type YorumGibi = { hidden?: boolean | null; report_status?: string | null };

export function onayBekliyorMu(y: YorumGibi): boolean {
  return y.report_status === YORUM_ONAY_BEKLIYOR || y.report_status === YORUM_ONAY_BELGE;
}

/** Onay sürecindeki (bekleyen ya da reddedilen) yorum mu? İşletme sahibi bunları görmez. */
export function onaySurecindeMi(y: YorumGibi): boolean {
  return (YORUM_ONAY_DURUMLARI as readonly string[]).includes(String(y.report_status || ''));
}

/** İşletme sahibine (panel, Yorum Inbox, MCP) gösterilecek yorumlar: onay sürecindekiler elenir. */
export function sahibeGorunenYorumlar<T extends YorumGibi>(rows: T[] | null | undefined): T[] {
  return (rows || []).filter(y => !onaySurecindeMi(y));
}

/** Ziyaretçiye gönderim sonrası gösterilen metin. */
export const YORUM_ONAY_MESAJI = 'Yorumunuz alındı. Yönetici onayından sonra profilde yayınlanacak.';
