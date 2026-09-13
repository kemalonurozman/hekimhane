import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ARACLAR, MCP_SUNUCU_ADI } from '@/lib/mcp/araclar';
import { anahtarDogrula } from '@/lib/mcp/anahtar';
import { aracCalistir, mcpErisimiVar } from '@/lib/mcp/sunucu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/*
 * Hekimhane MCP sunucusu — Streamable HTTP (JSON yanıt, oturumsuz).
 * Kimlik: "Authorization: Bearer hkm_…" (önerilen) veya yalnız header
 * desteklemeyen istemciler için ?key=hkm_… . Erişim Hekimhane-Pro'ya bağlı.
 */

const SURUMLER = ['2025-06-18', '2025-03-26', '2024-11-05'];
const TALIMAT = [
  'Hekimhane işletme paneli: randevu talepleri, takvim, yorumlar ve hasta e-postaları.',
  'Önce isletmelerim ile işletme kimliklerini ve bugünün tarihini al.',
  'Tarihler YYYY-MM-DD, saatler HH:MM — hepsi Türkiye saati (Europe/Istanbul).',
  'Veri değiştiren veya e-posta gönderen araçlardan (randevu_guncelle, randevu_ekle, takvim_kapat_ac, yoruma_yanit_ver, hastaya_eposta_gonder) önce kullanıcıya ne yapacağını özetleyip açık onay al.',
  'Hasta bilgileri kişisel sağlık verisidir: gereksiz yere tekrarlama, yorum yanıtlarında asla paylaşma.',
].join('\n');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
};

// Anahtar başına dakikada 120 çağrı
const pencere = new Map<string, number[]>();
function limitAsildi(k: string): boolean {
  const now = Date.now();
  const g = (pencere.get(k) || []).filter(t => now - t < 60_000);
  if (g.length >= 120) { pencere.set(k, g); return true; }
  g.push(now); pencere.set(k, g); return false;
}

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: any };
const sonuc = (id: Rpc['id'], result: unknown) => ({ jsonrpc: '2.0', id: id ?? null, result });
const hataYanit = (id: Rpc['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
export function GET() {
  // Sunucu-başlatımlı SSE akışı yok — Streamable HTTP'de izinli (405)
  return new NextResponse('Bu MCP sunucusu yalnız POST kabul eder.', { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } });
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const token = (auth.match(/^Bearer\s+(.+)$/i)?.[1] || request.nextUrl.searchParams.get('key') || '').trim();
  if (!token) {
    return NextResponse.json(hataYanit(null, -32001, 'Kimlik gerekli: "Authorization: Bearer hkm_…" başlığı ekleyin. Anahtar: hekimhane.com.tr/panel → MCP Bağlantısı.'),
      { status: 401, headers: { ...CORS, 'WWW-Authenticate': 'Bearer realm="hekimhane-mcp"' } });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
  const kim = await anahtarDogrula(admin, token);
  if (!kim) {
    return NextResponse.json(hataYanit(null, -32001, 'Geçersiz veya iptal edilmiş MCP anahtarı.'),
      { status: 401, headers: { ...CORS, 'WWW-Authenticate': 'Bearer error="invalid_token"' } });
  }
  if (limitAsildi(kim.userId)) {
    return NextResponse.json(hataYanit(null, -32002, 'Çok fazla istek (dakikada 120). Biraz sonra tekrar deneyin.'), { status: 429, headers: CORS });
  }

  let govde: Rpc | Rpc[];
  try { govde = await request.json(); }
  catch { return NextResponse.json(hataYanit(null, -32700, 'Geçersiz JSON'), { status: 400, headers: CORS }); }

  const email = kim.email;   // kapanış içinde null-daraltma kaybolmasın
  const kapsam = kim.kapsam;
  let proKontrol: boolean | null = null;
  const proMu = async () => (proKontrol ??= await mcpErisimiVar(email));

  async function isle(m: Rpc): Promise<object | null> {
    const id = m.id;
    const bildirim = id === undefined || id === null;
    switch (m.method) {
      case 'initialize': {
        const istenen = m.params?.protocolVersion;
        return sonuc(id, {
          protocolVersion: SURUMLER.includes(istenen) ? istenen : SURUMLER[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: MCP_SUNUCU_ADI, title: 'Hekimhane İşletme Paneli', version: '1.0.0' },
          instructions: TALIMAT,
        });
      }
      case 'ping':
        return sonuc(id, {});
      case 'tools/list':
        return sonuc(id, {
          tools: ARACLAR.map(a => ({ name: a.name, title: a.title, description: a.description, inputSchema: a.inputSchema, annotations: { title: a.title, ...a.annotations } })),
        });
      case 'tools/call': {
        const ad = String(m.params?.name || '');
        if (!ARACLAR.some(a => a.name === ad)) return hataYanit(id, -32602, `Bilinmeyen araç: ${ad}`);
        if (!(await proMu())) {
          return sonuc(id, { content: [{ type: 'text', text: 'MCP erişimi Hekimhane-Pro üyeliği gerektirir; hesabınızda aktif Pro işletme bulunamadı. https://www.hekimhane.com.tr/pro' }], isError: true });
        }
        try {
          const r = await aracCalistir(ad, (m.params?.arguments || {}) as Record<string, any>, email, kapsam);
          return sonuc(id, { content: [{ type: 'text', text: r.text }], ...(r.isError ? { isError: true } : {}) });
        } catch (e: any) {
          console.error('mcp araç hatası:', ad, e?.message || e);
          return sonuc(id, { content: [{ type: 'text', text: 'Araç çalıştırılırken beklenmeyen bir hata oluştu.' }], isError: true });
        }
      }
      default:
        if (bildirim) return null; // notifications/initialized vb. — yanıt yok
        return hataYanit(id, -32601, `Desteklenmeyen yöntem: ${m.method}`);
    }
  }

  if (Array.isArray(govde)) {
    const yanitlar = (await Promise.all(govde.map(isle))).filter(Boolean);
    return yanitlar.length ? NextResponse.json(yanitlar, { headers: CORS }) : new NextResponse(null, { status: 202, headers: CORS });
  }
  const y = await isle(govde);
  return y ? NextResponse.json(y, { headers: CORS }) : new NextResponse(null, { status: 202, headers: CORS });
}
