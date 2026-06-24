/**
 * /api/ai-yardim — Hekimhane AI Sağlık Asistanı
 *
 * 3 katmanlı akıllı sistem:
 * 1. Kullanıcı sorgusuna göre hastalık-data'dan ilgili içerik bulunur
 * 2. Supabase'den şehre göre gerçek doktor/klinik/hastane çekilir
 * 3. Tüm bağlam Claude API'ye gönderilir → streaming yanıt
 */

import Anthropic from '@anthropic-ai/sdk';
import { HASTALIKLAR, KATEGORILER } from '@/lib/hastaliklar-data';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Türkçe anahtar kelimeden ilgili hastalıkları bul ─────────────
function ilgiliHastaliklariCek(sorgu: string): string {
  const q = sorgu.toLowerCase();
  const ilgili = HASTALIKLAR.filter(h => {
    const metinler = [
      h.ad.toLowerCase(),
      h.ozet.toLowerCase(),
      h.uzmanlik.toLowerCase(),
      ...h.belirtiler.map(b => b.baslik.toLowerCase()),
      ...h.riskFaktorleri.map(r => r.toLowerCase()),
    ].join(' ');
    // Sorgunun kelimelerinden en az biri eşleşsin
    return q.split(/\s+/).some(kelime =>
      kelime.length > 3 && metinler.includes(kelime)
    );
  }).slice(0, 4);

  if (ilgili.length === 0) return '';

  return ilgili.map(h => {
    const belirtiler = h.belirtiler.slice(0, 3).map(b => `- ${b.baslik}: ${b.aciklama}`).join('\n');
    const tedaviler = h.tedaviSecenekleri.slice(0, 2).map(t => t.tip).join(', ');
    return `
HASTALIK: ${h.ad}
Kategori: ${h.kategoriSlug} | Uzman: ${h.uzmanlik}
Özet: ${h.ozet}
Başlıca belirtiler:
${belirtiler}
Tedavi seçenekleri: ${tedaviler}
Görülme oranı: ${h.gorulmeOrani}`;
  }).join('\n\n---\n');
}

// ── Uzmanlık alanına göre Supabase'den gerçek listeleri çek ──────
async function gercekListeleriCek(sorgu: string, il?: string): Promise<string> {
  const q = sorgu.toLowerCase();

  // Sorgudan uzmanlık tahmini
  const uzmanlikMap: Record<string, string[]> = {
    'diş': ['diş', 'dişçi', 'dental', 'ortodonti', 'implant', 'diş hekimi', 'dişler', 'çene', 'protez diş'],
    'kardiyoloji': ['kardiyoloji', 'kalp', 'koroner', 'hipertansiyon', 'çarpıntı'],
    'nöroloji': ['nöroloji', 'beyin', 'baş ağrısı', 'felç', 'epilepsi', 'migren'],
    'endokrinoloji': ['endokrinoloji', 'diyabet', 'şeker', 'tiroit', 'hormon'],
    'ortopedi': ['ortopedi', 'kırık', 'eklem', 'omurga', 'diz', 'bel'],
    'göz': ['göz', 'görme', 'katarakt', 'glokom'],
    'kbb': ['kbb', 'kulak', 'burun', 'boğaz', 'ses kısıklığı'],
    'onkoloji': ['onkoloji', 'kanser', 'tümör'],
    'gastroenteroloji': ['gastroenteroloji', 'mide', 'bağırsak', 'karaciğer'],
    'dermatoloji': ['cilt', 'deri', 'egzama'],
    'psikiyatri': ['psikiyatri', 'depresyon', 'anksiyete', 'ruh'],
    'üroloji': ['üroloji', 'böbrek', 'mesane', 'prostat'],
    'jinekolog': ['kadın', 'jinekoloji', 'rahim', 'over', 'gebelik'],
    'genel cerrahi': ['cerrahi', 'ameliyat', 'apandisit', 'safra'],
    'göğüs hastalıkları': ['akciğer', 'nefes darlığı', 'astım', 'koah', 'öksürük'],
    'iç hastalıkları': ['dahiliye', 'iç hastalıkları', 'genel muayene'],
    'fizik tedavi': ['fizik tedavi', 'rehabilitasyon', 'fizyoterapi', 'fizyo'],
  };

  let uzmanlik = '';
  for (const [uz, kelimeler] of Object.entries(uzmanlikMap)) {
    if (kelimeler.some(k => q.includes(k))) {
      uzmanlik = uz;
      break;
    }
  }

  const sonuclar: string[] = [];

  try {
    // Doktorlar — tel dahil
    let doktorQuery = supabase
      .from('doktorlar')
      .select('ad, soyad, spec, il, ilce, fee, slug, tel')
      .limit(4);

    if (uzmanlik) doktorQuery = doktorQuery.ilike('spec', `%${uzmanlik}%`);
    if (il) doktorQuery = doktorQuery.ilike('il', `%${il}%`);

    const { data: doktorlar } = await doktorQuery;
    if (doktorlar && doktorlar.length > 0) {
      const liste = doktorlar.map((d: { ad: string; soyad: string; spec: string; il: string; ilce?: string; fee?: number; slug?: string; tel?: string }) => {
        const link = d.slug ? `/doktorlar/${d.slug}` : null;
        const ucret = d.fee ? ` — ${d.fee}₺` : '';
        const sehir = d.il ? `, ${d.il}` : '';
        const tel = d.tel ? ` 📞 ${d.tel}` : '';
        return link
          ? `  • [Dr. ${d.ad} ${d.soyad}](${link}) — ${d.spec}${sehir}${ucret}${tel}`
          : `  • Dr. ${d.ad} ${d.soyad} — ${d.spec}${sehir}${ucret}${tel}`;
      }).join('\n');
      sonuclar.push(`Hekimhane\'de bu doktorlar mevcut:\n${liste}`);
    }

    // Klinikler — tel dahil
    let klinikQuery = supabase
      .from('klinikler')
      .select('name, il, ilce, slug, tel')
      .limit(4);

    if (uzmanlik) {
      klinikQuery = klinikQuery.or(`name.ilike.%${uzmanlik}%,specs.ilike.%${uzmanlik}%`);
    }
    if (il) klinikQuery = klinikQuery.ilike('il', `%${il}%`);

    const { data: klinikler } = await klinikQuery;
    if (klinikler && klinikler.length > 0) {
      const liste = klinikler.map((k: { name: string; il?: string; ilce?: string; slug?: string; tel?: string }) => {
        const link = (k.slug && k.il && k.ilce)
          ? `/klinikler/${encodeURIComponent(k.il.toLowerCase())}/${encodeURIComponent(k.ilce.toLowerCase())}/${k.slug}`
          : null;
        const konum = `${k.il ?? ''}${k.ilce ? `/${k.ilce}` : ''}`;
        const tel = k.tel ? ` 📞 ${k.tel}` : '';
        return link
          ? `  • [${k.name}](${link})${konum ? `, ${konum}` : ''}${tel}`
          : `  • ${k.name}${konum ? `, ${konum}` : ''}${tel}`;
      }).join('\n');
      sonuclar.push(`Hekimhane\'de bu klinikler mevcut:\n${liste}`);
    }

    // Hastaneler — tel dahil
    if (il) {
      const { data: hastaneler } = await supabase
        .from('hastaneler')
        .select('name, type, il, ilce, slug, tel')
        .ilike('il', `%${il}%`)
        .limit(3);

      if (hastaneler && hastaneler.length > 0) {
        const liste = hastaneler.map((h: { name: string; type?: string; il?: string; ilce?: string; slug?: string; tel?: string }) => {
          const link = (h.slug && h.il && h.ilce)
            ? `/hastaneler/${encodeURIComponent((h.il ?? '').toLowerCase())}/${encodeURIComponent((h.ilce ?? '').toLowerCase())}/${h.slug}`
            : null;
          const tip = h.type ? ` (${h.type})` : '';
          const tel = h.tel ? ` 📞 ${h.tel}` : '';
          return link
            ? `  • [${h.name}](${link})${tip}${tel}`
            : `  • ${h.name}${tip}${tel}`;
        }).join('\n');
        sonuclar.push(`Hekimhane\'de bu hastaneler mevcut:\n${liste}`);
      }
    }
  } catch {
    // Supabase hatası sessizce geç
  }

  return sonuclar.length > 0
    ? `\nHEKİMHANE VERİTABANI — GERÇEK LİSTELEMELER:\n${sonuclar.join('\n\n')}`
    : '';
}

// ── Acil durum tespiti ───────────────────────────────────────────
function acilDurumMu(sorgu: string): boolean {
  const acilKelimeler = [
    'göğüs ağrısı', 'nefes alamıyorum', 'bayıldım', 'bilinç kaybı',
    'felç', 'inme', 'yüz düştü', 'kol tutmuyor', 'kan kusuyorum',
    'ağır kanama', 'zehirlendim', 'kazaya uğradım', 'kalp krizi',
    'ölüyorum', 'acil',
  ];
  const q = sorgu.toLowerCase();
  return acilKelimeler.some(k => q.includes(k));
}

// ── Şehir tespiti — Türkiye'nin 81 ili ──────────────────────────
function sehirTespit(sorgu: string): string | undefined {
  const iller = [
    // Büyük şehirler
    'istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana',
    'konya', 'gaziantep', 'kocaeli', 'mersin', 'diyarbakır',
    'eskişehir', 'samsun', 'trabzon', 'muğla', 'malatya',
    // Diğer iller (alfabetik)
    'adıyaman', 'afyon', 'afyonkarahisar', 'ağrı', 'aksaray',
    'amasya', 'ardahan', 'artvin', 'aydın', 'balıkesir',
    'bartın', 'batman', 'bayburt', 'bilecik', 'bingöl',
    'bitlis', 'bolu', 'burdur', 'çanakkale', 'çankırı',
    'çorum', 'denizli', 'düzce', 'edirne', 'elazığ',
    'erzincan', 'erzurum', 'giresun', 'gümüşhane', 'hakkari',
    'hatay', 'ığdır', 'isparta', 'kahramanmaraş', 'karabük',
    'karaman', 'kars', 'kastamonu', 'kayseri', 'kilis',
    'kırıkkale', 'kırklareli', 'kırşehir', 'kütahya', 'manisa',
    'mardin', 'muş', 'nevşehir', 'niğde', 'ordu',
    'osmaniye', 'rize', 'sakarya', 'şanlıurfa', 'urfa',
    'şırnak', 'sinop', 'sivas', 'tekirdağ', 'tokat',
    'tunceli', 'uşak', 'van', 'yalova', 'yozgat', 'zonguldak',
  ];
  const q = sorgu.toLowerCase();
  // Önce tam eşleşme, sonra içeren
  return iller.find(il => q.includes(il));
}

export async function POST(req: Request) {
  try {
    const { mesaj, gecmis = [] } = await req.json();

    if (!mesaj || typeof mesaj !== 'string' || mesaj.trim().length === 0) {
      return new Response('Mesaj boş olamaz', { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
      return new Response(
        JSON.stringify({ hata: 'ANTHROPIC_API_KEY henüz ayarlanmamış. .env.local dosyasına ekleyin.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Acil durum kontrolü
    if (acilDurumMu(mesaj)) {
      const acilMesaj = `🚨 **ACİL DURUM TESPİT EDİLDİ**

Belirttiğiniz semptomlar acil tıbbi müdahale gerektirebilir.

**Hemen 112'yi arayın.**

Beklerken:
- Sakin kalmaya çalışın
- Hareket etmeyin
- Yanınızdaki birisinden yardım isteyin

---
*Bu sistem acil tıbbi yardım yerine geçmez. Lütfen 112'yi arayın.*`;

      return new Response(acilMesaj, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Paralel veri toplama
    const il = sehirTespit(mesaj);
    const [hastalikBilgisi, gercekListeler] = await Promise.all([
      Promise.resolve(ilgiliHastaliklariCek(mesaj)),
      gercekListeleriCek(mesaj, il),
    ]);

    // Kategori listesi (kısa)
    const kategoriOzet = KATEGORILER.map(k => `${k.ad} (${k.slug})`).join(', ');

    // System prompt — Hekimhane'ye özgü
    const systemPrompt = `Sen Hekimhane'nin yapay zeka sağlık asistanısın. Hekimhane, Türkiye'nin kapsamlı sağlık rehberidir: klinik, hastane, doktor ve eczane listelemeleri ile hastalık bilgi bankası içerir.

GÖREVLER:
1. Hasta belirtilerini dinle, olası hastalıkları ve hangi uzmanın gerektiğini açıkla
2. Sistemdeki gerçek doktor/klinik/hastane önerilerini yanıta entegre et
3. Hastalık bilgi bankasındaki verileri kullanarak doğru, kapsamlı bilgi ver
4. Randevu öncesi hazırlık, tedavi süreci, ilaç kullanımı hakkında yol göster

KURAL:
- Her zaman Türkçe yanıt ver
- Tıbbi teşhis koyma — "bu hastalıktır" deme; "bu belirtiler X'e işaret edebilir" de
- Yanıtın sonunda her zaman doktor görüşmesi öner
- Kısa ve net ol, aşırı teknik terim kullanma
- Gerçek listeleme varsa doğrudan listele; [Dr. Ad Soyad](/doktorlar/slug) formatındaki linkleri ve 📞 telefon numaralarını AYNEN koru, değiştirme veya çevirme
- Telefon numarası olan listeleme satırında 📞 numarasını mutlaka bırak; kullanıcı tıklayarak arayabilsin
- Sistematik ol: önce belirti analizi → uzman önerisi → Hekimhane listesi → öneri

HEKİMHANE KATEGORİLERİ: ${kategoriOzet}

${hastalikBilgisi ? `İLGİLİ HASTALIK VERİTABANI BİLGİSİ:\n${hastalikBilgisi}` : ''}
${gercekListeler}`;

    // Konuşma geçmişini hazırla
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mesajlar: any[] = [
      ...gecmis.slice(-6), // son 3 çift mesaj
      { role: 'user', content: mesaj },
    ];

    // Claude streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: mesajlar,
    });

    // ReadableStream olarak döndür
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (err) {
    console.error('[AI Yardım] Hata:', err);
    return new Response(
      JSON.stringify({ hata: 'Şu an yanıt verilemiyor. Lütfen tekrar deneyin.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
