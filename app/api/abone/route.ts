import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      isim,
      tip = 'hasta',          // 'isletme' | 'hasta'
      kaynak = 'form',        // 'kayit' | 'giris' | 'sahiplenme' | 'form' | 'profil'
      entity_id,
      entity_type,
      entity_name,
    } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    }

    const emailN = email.trim().toLowerCase();
    const eid = entity_id || null;

    // email_aboneleri'nde 'email,tip,entity_id' unique constraint'i yok →
    // upsert onConflict çalışmıyordu. Elle kontrol edip yoksa ekliyoruz.
    let q = (supabase as any).from('email_aboneleri').select('id')
      .eq('email', emailN).eq('tip', tip);
    q = eid ? q.eq('entity_id', eid) : q.is('entity_id', null);
    const { data: existing } = await q.limit(1);

    if (existing && existing.length) {
      return NextResponse.json({ ok: true, already: true });
    }

    const { error } = await (supabase as any).from('email_aboneleri').insert({
      email:       emailN,
      isim:        isim?.trim() || null,
      tip,
      kaynak,
      entity_id:   eid,
      entity_type: entity_type || null,
      entity_name: entity_name || null,
      aktif:       true,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, already: true });
      }
      console.error('email_aboneleri insert error:', error);
      return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('abone route error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
