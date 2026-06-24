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

    const row = {
      email:       email.trim().toLowerCase(),
      isim:        isim?.trim() || null,
      tip,
      kaynak,
      entity_id:   entity_id   || null,
      entity_type: entity_type || null,
      entity_name: entity_name || null,
      aktif:       true,
    };

    // Upsert — aynı email+tip+entity varsa güncelle (kaynak ve isim güncelle)
    const { error } = await (supabase as any)
      .from('email_aboneleri')
      .upsert(row, {
        onConflict: 'email,tip,entity_id',
        ignoreDuplicates: false,
      });

    if (error) {
      // Unique ihlali = zaten kayıtlı, hata değil
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, already: true });
      }
      console.error('email_aboneleri upsert error:', error);
      return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('abone route error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
