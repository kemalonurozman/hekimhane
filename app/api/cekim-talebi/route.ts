import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { isletme_adi, isletme_turu, entity_id, il, ilce, ad_soyad, tel, email, notlar } = body;

    if (!isletme_adi || !ad_soyad || !tel) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const { error } = await (supabase as any).from('cekim_talepleri').insert([{
      isletme_adi: isletme_adi.trim(),
      isletme_turu: isletme_turu || null,
      entity_id:    entity_id || null,
      il:           il?.trim() || null,
      ilce:         ilce?.trim() || null,
      ad_soyad:     ad_soyad.trim(),
      tel:          tel.trim(),
      email:        email?.trim() || null,
      notlar:       notlar?.trim() || null,
      durum:        'beklemede',
    }]);

    if (error) {
      console.error('cekim_talebi insert error:', error);
      return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('cekim_talebi route error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
