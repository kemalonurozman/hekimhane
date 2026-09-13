// ─────────────────────────────────────────────────────────────────
//  Panel API'lerinin ortak oturum çözümü.
//  1) Normal yol: Supabase oturum çerezi (tarayıcıdaki panel).
//  2) MCP yolu: /api/mcp, doğrulanmış anahtarın sahibi adına panel
//     rotalarını SÜREÇ İÇİNDE çağırır ve istek imzalı iç başlık taşır.
//     Böylece MCP araçları panelle birebir aynı yetki/iş kuralını kullanır
//     (sahiplik, Pro kilidi, çakışma kontrolü, hastaya giden mailler).
//
//  İç başlık dışarıdan taklit edilemez: HMAC-SHA256 (sunucu sırrı) + 60 sn
//  geçerlilik. Başlık varsa ama imza geçersizse çereze DÜŞÜLMEZ (fail-closed).
// ─────────────────────────────────────────────────────────────────
import { createHmac, timingSafeEqual } from 'crypto';
import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const icSir = () => process.env.MCP_INTERNAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function icImza(email: string, ts: string): string {
  return createHmac('sha256', icSir()).update(`hk-mcp-ic.${email}.${ts}`).digest('hex');
}

/** MCP sunucusunun panel rotalarını çağırırken eklediği imzalı başlıklar. */
export function mcpIcBasliklari(email: string): Record<string, string> {
  const ts = String(Date.now());
  return { 'x-hk-mcp-email': email, 'x-hk-mcp-ts': ts, 'x-hk-mcp-sig': icImza(email, ts) };
}

export type PanelOturum = { user: { email: string } } | null;

export async function panelOturum(request: NextRequest): Promise<PanelOturum> {
  const email = request.headers.get('x-hk-mcp-email');
  const ts = request.headers.get('x-hk-mcp-ts');
  const sig = request.headers.get('x-hk-mcp-sig');

  if (email || ts || sig) {
    if (!email || !ts || !sig || !icSir()) return null;
    if (!/^\d{13}$/.test(ts) || Math.abs(Date.now() - Number(ts)) > 60_000) return null;
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(icImza(email, ts), 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { user: { email } };
  }

  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} },
  });
  const { data: { session } } = await sb.auth.getSession();
  return session?.user?.email ? { user: { email: session.user.email } } : null;
}
