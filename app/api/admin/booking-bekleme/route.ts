import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/admin-auth';
import { BOOKING_DURUMLAR } from '@/lib/booking';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* Admin › Booking Bekleme — liste (GET) ve durum/not güncelleme (PATCH). */

const DURUMLAR = new Set(BOOKING_DURUMLAR.map(d => d.id));

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  const db = supabaseAdmin() as any;
  const { data, error } = await db.from('booking_bekleme').select('*').order('created_at', { ascending: false }).limit(2000);
  if (error) {
    const tabloYok = error.code === '42P01' || error.code === 'PGRST205';
    return NextResponse.json({ error: tabloYok ? 'booking_bekleme tablosu yok — supabase/migrations/add_booking_bekleme.sql çalıştırılmalı.' : error.message, tabloYok }, { status: tabloYok ? 200 : 500 });
  }
  return NextResponse.json({ kayitlar: data || [] });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 }); }
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  const guncel: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.durum !== undefined) {
    if (!DURUMLAR.has(body.durum)) return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    guncel.durum = body.durum;
  }
  if (body.admin_notu !== undefined) guncel.admin_notu = String(body.admin_notu || '').slice(0, 2000) || null;

  const db = supabaseAdmin() as any;
  const { error } = await db.from('booking_bekleme').update(guncel).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
