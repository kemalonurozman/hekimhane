/**
 * Randevu bildirim adresleri — TEK KAYNAK (panel, update-entity, bildirim).
 *
 * DDL yok: `randevu_email` kolonu tek metin; birden çok adres virgülle
 * saklanır ("a@x.com, b@y.com"). Tek adresli eski kayıtlar olduğu gibi çalışır.
 * Bu dosyaya sunucu import'u koyma — panel (tarayıcı) de kullanıyor.
 */

/** Pro işletmede en fazla kaç bildirim adresi. Ücretsizde 1. */
export const RANDEVU_EMAIL_MAX_PRO = 2;

const EPOSTA_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

export function gecerliEposta(s: string): boolean {
  return EPOSTA_RE.test((s || '').trim());
}

/** Saklanan metni adres listesine çevirir (geçersizleri ve tekrarları atar). */
export function epostaListesi(v: unknown): string[] {
  const parcalar = String(v ?? '').split(/[,;\s]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set(parcalar.filter(gecerliEposta)));
}

/** Listeyi kolona yazılacak metne çevirir; boşsa null. */
export function epostaListesiYaz(liste: string[]): string | null {
  return liste.length ? liste.join(', ') : null;
}
