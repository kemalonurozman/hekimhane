// ─────────────────────────────────────────────────────────────────
//  Monetra.cz fatura entegrasyonu — Stripe'tan gelen her abonelik
//  ödemesi (ilk ödeme + aylık yenilemeler) Monetra'da faturalandırılır
//  ve müşteriye e-posta ile gönderilir.
//
//  Graceful: MONETRA_API_KEY yoksa sessizce atlanır — ödeme/premium
//  akışı hiçbir koşulda faturalama yüzünden bozulmaz.
//
//  DİKKAT: API anahtarı Monetra'da HANGİ işletmede üretildiyse fatura
//  o işletmenin ünvanıyla kesilir. Vercel'e Hekimhane işletmesinin
//  anahtarı konmalı (başka işletmenin anahtarı yanlış ünvanla fatura
//  keser).
// ─────────────────────────────────────────────────────────────────

const MCP_URL = process.env.MONETRA_MCP_URL || 'https://monetra.cz/api/mcp';
const KEY = process.env.MONETRA_API_KEY;
/** Fatura kaleminde uygulanacak KDV yüzdesi (muhasebe kararı; varsayılan 0). */
const VAT = Number(process.env.MONETRA_VAT_RATE || '0') || 0;

type CallResult = { ok: boolean; skipped?: boolean; data?: any; error?: string };

/** Monetra MCP endpoint'ine tek JSON-RPC tools/call isteği. */
async function monetraCall(tool: string, args: Record<string, unknown>): Promise<CallResult> {
  if (!KEY) return { ok: false, skipped: true };
  try {
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j) return { ok: false, error: `HTTP ${res.status}` };
    if (j.error) return { ok: false, error: j.error.message || 'rpc error' };
    // Araç çıktısı content[0].text içinde JSON string olarak gelir
    const text = j.result?.content?.[0]?.text;
    let data: any = text;
    try { data = JSON.parse(text); } catch { /* düz metin de olabilir */ }
    if (j.result?.isError) return { ok: false, error: typeof data === 'string' ? data : JSON.stringify(data) };
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'fetch failed' };
  }
}

/**
 * Stripe'tan gelen bir abonelik ödemesini Monetra'da faturala ve müşteriye
 * e-posta ile gönder. Best-effort: hata fırlatmaz, sonucu döndürür —
 * webhook akışı fatura yüzünden asla 500 dönmemeli.
 */
export async function faturalaVeGonder(opts: {
  musteriAd: string;        // işletme adı (fatura müşterisi)
  musteriEmail: string | null;
  tutar: number;            // Stripe'ın fiilen tahsil ettiği tutar (KDV dahil kabul edilir)
  paraBirimi: string;       // 'TRY' vb.
  donem: string;            // "1 Eyl – 1 Eki 2026" gibi
  stripeInvoiceId: string;  // notlarda iz için
}): Promise<CallResult> {
  const { musteriAd, musteriEmail, tutar, paraBirimi, donem, stripeInvoiceId } = opts;
  if (!(tutar > 0)) return { ok: false, error: 'geçersiz tutar' };

  // KDV dahil tutardan net birim fiyat (Monetra toplamı net+KDV olarak hesaplar)
  const net = VAT > 0 ? Number((tutar / (1 + VAT / 100)).toFixed(2)) : tutar;

  const olustur = await monetraCall('create_invoice', {
    client_name: musteriAd,
    ...(musteriEmail ? { client_email: musteriEmail } : {}),
    currency: paraBirimi.toUpperCase(),
    status: 'paid', // Stripe zaten tahsil etti
    items: [{
      description: `Hekimhane-Pro aylık üyelik (${donem})`,
      quantity: 1,
      unit_price: net,
      vat_rate: VAT,
    }],
    notes: `Stripe aboneliği üzerinden otomatik faturalandı. Stripe fatura no: ${stripeInvoiceId}`,
  });
  if (!olustur.ok) return olustur;

  const invoiceId = olustur.data?.invoice_id || olustur.data?.id;
  if (musteriEmail && invoiceId) {
    const gonder = await monetraCall('send_invoice_email', {
      invoice_id: String(invoiceId),
      to: musteriEmail,
      subject: 'Hekimhane-Pro — Aylık Üyelik Faturanız',
      message: 'Hekimhane-Pro üyeliğinizin bu döneme ait faturası ektedir. Bizi tercih ettiğiniz için teşekkür ederiz.',
    });
    if (!gonder.ok) return { ok: true, data: olustur.data, error: `fatura kesildi ama mail gönderilemedi: ${gonder.error}` };
  }
  return { ok: true, data: olustur.data };
}
