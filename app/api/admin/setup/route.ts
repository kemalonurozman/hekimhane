/**
 * GEÇİCİ kurulum endpoint'i — şifreleri ayarlamak için.
 * Kullanım sonrası bu dosyayı SİLİN.
 *
 * GET /api/admin/setup
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const USERS = [
  { email: 'kemalonurozman@gmail.com', password: 'Hkm.Admin.26' },
  { email: 'bukalemun7@gmail.com',     password: 'Hkm.Panel.26' },
];

export async function GET(request: NextRequest) {
  // Sadece localhost'tan erişilebilir
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return NextResponse.json({ error: 'Sadece localhost\'tan erişilebilir.' }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: { email: string; status: string; detail?: string }[] = [];

  // Tüm kullanıcıları listele
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  for (const { email, password } of USERS) {
    const existing = list.users.find(u => u.email === email);
    if (existing) {
      // Var — şifreyi güncelle + email_confirm zorla
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      results.push({ email, status: error ? 'HATA' : 'Güncellendi', detail: error?.message, id: existing.id, confirmed: existing.email_confirmed_at ?? 'YOK' });
    } else {
      // Yok — oluştur
      const { error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      results.push({ email, status: error ? 'HATA' : 'Oluşturuldu', detail: error?.message });
    }
  }

  const allOk = results.every(r => r.status !== 'HATA');

  return NextResponse.json({
    ok: allOk,
    message: allOk
      ? 'Şifreler başarıyla ayarlandı! Bu sayfayı kapatın ve /api/admin/setup/route.ts dosyasını silin.'
      : 'Bazı işlemler başarısız oldu.',
    results,
  }, { status: allOk ? 200 : 500 });
}
