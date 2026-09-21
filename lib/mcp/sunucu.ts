// ─────────────────────────────────────────────────────────────────
//  Hekimhane MCP araçlarının uygulaması (yalnız sunucu).
//
//  Yazma işlemleri panel rotalarını SÜREÇ İÇİNDE çağırır (mcpIcBasliklari
//  ile imzalı) — sahiplik, Pro kilidi, çakışma kontrolü ve hastaya giden
//  otomatik mailler panelle birebir aynı kalır; iş kuralı kopyalanmaz.
//  Okuma araçları doğrudan service-role sorgusu yapar, ama yalnız
//  anahtar sahibinin onaylı işletmeleri kapsamında.
// ─────────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mcpIcBasliklari } from '@/lib/panel-oturum';
import { gunSlotlari } from '@/lib/takvim-slot';
import { isletmeBilgisi } from '@/lib/entity-link';
import { sahipIsletmeleri, type SahipIsletme } from '@/lib/mcp/anahtar';
import { GET as talepleriGetir, POST as talepGuncelle } from '@/app/api/panel/randevu-talepleri/route';
import { POST as randevuEklePost } from '@/app/api/panel/randevu-ekle/route';
import { POST as yorumYanitPost } from '@/app/api/panel/reply-yorum/route';
import { POST as hastaMailPost } from '@/app/api/panel/hasta-mail/route';
import { POST as isletmeGuncellePost } from '@/app/api/panel/update-entity/route';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';
const TABLO: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
const TARIH_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAAT_RE = /^\d{2}:\d{2}$/;

export type AracSonucu = { text: string; isError?: boolean };

function admin(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

const hata = (text: string): AracSonucu => ({ text, isError: true });
const json = (v: unknown): AracSonucu => ({ text: JSON.stringify(v, null, 2) });

/** Türkiye saatine göre bugünün YYYY-MM-DD'si. */
function bugunTR(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function gunEkle(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function dkEkle(saat: string, dk: number): string {
  const [h, m] = saat.split(':').map(Number); const t = h * 60 + m + dk;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Panel rotasını imzalı iç oturumla süreç içinde çağırır. */
async function rota(handler: (r: NextRequest) => Promise<Response>, email: string, yol: string, method: 'GET' | 'POST', govde?: unknown) {
  const req = new NextRequest(new URL(yol, SITE), {
    method,
    headers: { 'content-type': 'application/json', ...mcpIcBasliklari(email) },
    body: govde === undefined ? undefined : JSON.stringify(govde),
  });
  const res = await handler(req);
  const veri: any = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, veri };
}

function isletmeCoz(liste: SahipIsletme[], id: unknown): SahipIsletme | string {
  if (!liste.length) return 'Bu hesaba bağlı onaylı işletme yok.';
  if (typeof id === 'string' && id.trim()) {
    const b = liste.find(i => i.entity_id === id.trim());
    return b || `isletme_id "${id}" bu hesaba ait değil. Geçerli işletmeler: ${liste.map(i => `${i.entity_id} (${i.entity_name})`).join(', ')}`;
  }
  if (liste.length === 1) return liste[0];
  return `Birden çok işletme var; isletme_id belirtin: ${liste.map(i => `${i.entity_id} (${i.entity_name})`).join(', ')}`;
}

async function takvimAyari(db: SupabaseClient, isl: SahipIsletme) {
  const { data } = await (db as any).from(TABLO[isl.entity_type]).select('*').eq('id', isl.entity_id).maybeSingle();
  const d = data || {};
  return {
    ayar: { calisma: d.calisma_saatleri ? String(d.calisma_saatleri) : null, acik24: d.acik_24_saat === true, slotDk: Number(d.randevu_slot_dk) || 30 },
    bloke: Array.isArray(d.randevu_bloke) ? (d.randevu_bloke as unknown[]).map(String) : [],
    randevuAktif: d.randevu_aktif === true,
  };
}

export async function aracCalistir(ad: string, args: Record<string, any>, email: string, kapsam: string | null = null): Promise<AracSonucu> {
  const db = admin();
  // MCP yalnız Pro işletmeleri yönetir — "tüm işletmeler" anahtarı da ücretsiz işletmelere erişemez
  const tumu = (await sahipIsletmeleri(db, email)).filter(i => i.premium);
  // İşletmeye özel anahtar: araçlar yalnız o işletmeyi görür
  const isletmeler = kapsam ? tumu.filter(i => i.entity_id === kapsam) : tumu;
  if (kapsam && !isletmeler.length) return hata(`Bu anahtarın bağlı olduğu işletme onaylı bir Hekimhane-Pro işletmesi değil. Pro'ya geçin veya Pro işletmeniz için yeni anahtar oluşturun (${SITE}/pro).`);

  // Panel rotaları hesabın TÜM işletmelerine yetki verir; kimlikle (talep/yorum id) çalışan araçlarda
  // kaydın işletmesi bu anahtarın erişebildiği (Pro + kapsam) işletmelerden mi ayrıca doğrulanır.
  const izinli = new Set(isletmeler.map(i => i.entity_id));
  const kapsamda = async (tablo: 'randevu_talepleri' | 'yorumlar', id: unknown): Promise<boolean> => {
    const { data } = await (db as any).from(tablo).select('entity_id').eq('id', String(id)).maybeSingle();
    return !!data && izinli.has(String(data.entity_id));
  };
  const kapsamDisi = () => hata('Bu kayıt, bu anahtarın bağlı olduğu işletmeye ait değil.');

  switch (ad) {
    // ── GENEL ──────────────────────────────────────────────
    case 'isletmelerim': {
      if (!isletmeler.length) return json({ isletmeler: [], not: `Bu hesapta MCP ile yönetilebilecek Hekimhane-Pro işletme yok (${SITE}/pro).` });
      const sonuc = await Promise.all(isletmeler.map(async i => {
        const b = await isletmeBilgisi(db, i.entity_type, i.entity_id);
        const t = await takvimAyari(db, i);
        return {
          isletme_id: i.entity_id, tur: i.entity_type, ad: b.ad || i.entity_name, konum: b.konum,
          pro: i.premium, online_randevu_acik: t.randevuAktif, slot_dakika: t.ayar.slotDk, profil: b.url,
        };
      }));
      return json({ bugun: bugunTR(), isletmeler: sonuc });
    }

    // ── RANDEVU ────────────────────────────────────────────
    case 'randevu_talepleri_listele': {
      let hedefIds = isletmeler.map(i => i.entity_id);
      if (args.isletme_id) {
        const i = isletmeCoz(isletmeler, args.isletme_id); if (typeof i === 'string') return hata(i);
        hedefIds = [i.entity_id];
      }
      if (args.baslangic && !TARIH_RE.test(args.baslangic)) return hata('baslangic YYYY-MM-DD olmalı.');
      if (args.bitis && !TARIH_RE.test(args.bitis)) return hata('bitis YYYY-MM-DD olmalı.');
      const r = await rota(talepleriGetir, email, '/api/panel/randevu-talepleri', 'GET');
      if (!r.ok) return hata(r.veri?.error || `Talepler alınamadı (HTTP ${r.status}).`);
      const q = String(args.arama || '').toLocaleLowerCase('tr').trim();
      const qTel = q.replace(/\D/g, '');
      const limit = Math.min(Math.max(Number(args.limit) || 30, 1), 200);
      const liste = (r.veri.talepler || [] as any[])
        .filter((t: any) => hedefIds.includes(String(t.entity_id)))
        .filter((t: any) => !args.durum || t.status === args.durum)
        .filter((t: any) => {
          const tarih = String(t.randevu_slot || '').slice(0, 10);
          if (args.baslangic && (!tarih || tarih < args.baslangic)) return false;
          if (args.bitis && (!tarih || tarih > args.bitis)) return false;
          return true;
        })
        .filter((t: any) => !q || String(t.ad_soyad || '').toLocaleLowerCase('tr').includes(q) || (qTel.length >= 3 && String(t.tel || '').includes(qTel)))
        .slice(0, limit)
        .map((t: any) => ({
          talep_id: t.id, isletme: t.entity_name, isletme_id: t.entity_id, ad_soyad: t.ad_soyad, telefon: t.tel,
          eposta: t.email || null, durum: t.status, randevu: t.randevu_slot || null,
          tercih: t.randevu_slot ? undefined : (t.tercih || null), mesaj: t.mesaj || null,
          sahip_notu: t.sahip_notu || null, olusturma: t.created_at,
        }));
      return json({ adet: liste.length, talepler: liste });
    }

    case 'randevu_guncelle': {
      if (!args.talep_id) return hata('talep_id gerekli.');
      if (!(await kapsamda('randevu_talepleri', args.talep_id))) return kapsamDisi();
      const govde: Record<string, unknown> = { id: String(args.talep_id) };
      if (args.durum) govde.status = args.durum;
      if (typeof args.not === 'string') govde.sahip_notu = args.not;
      if (args.yeni_tarih || args.yeni_saat) {
        if (!TARIH_RE.test(args.yeni_tarih || '') || !SAAT_RE.test(args.yeni_saat || '')) return hata('Taşıma için yeni_tarih (YYYY-MM-DD) ve yeni_saat (HH:MM) birlikte verilmeli.');
        govde.randevu_slot = `${args.yeni_tarih} ${args.yeni_saat}`;
      }
      if (Object.keys(govde).length === 1) return hata('Değiştirilecek bir şey yok: durum, not veya yeni_tarih+yeni_saat verin.');
      const r = await rota(talepGuncelle, email, '/api/panel/randevu-talepleri', 'POST', govde);
      if (!r.ok) return hata(r.veri?.error || `Güncellenemedi (HTTP ${r.status}).`);
      return json({ basarili: true, guncellenen: govde, not: govde.randevu_slot || govde.status === 'iptal' ? 'Hasta e-posta bıraktıysa bilgilendirme maili gönderildi.' : undefined });
    }

    case 'randevu_ekle': {
      const i = isletmeCoz(isletmeler, args.isletme_id); if (typeof i === 'string') return hata(i);
      if (!TARIH_RE.test(args.tarih || '') || !SAAT_RE.test(args.saat || '')) return hata('tarih (YYYY-MM-DD) ve saat (HH:MM) gerekli.');
      const n = Math.min(Math.max(Number(args.sure_slot) || 1, 1), 8);
      const t = await takvimAyari(db, i);
      const calisma = gunSlotlari(t.ayar, args.tarih);
      const gunKapali = t.bloke.includes(args.tarih);
      const saatler = Array.from({ length: n }, (_, k) => dkEkle(args.saat, k * t.ayar.slotDk));
      const uygunDegil = saatler.filter(s => gunKapali || !calisma.includes(s) || t.bloke.includes(`${args.tarih} ${s}`));
      if (uygunDegil.length) {
        const bos = gunKapali ? [] : calisma.filter(s => !t.bloke.includes(`${args.tarih} ${s}`));
        return hata(`${args.tarih} ${uygunDegil.join(', ')} çalışma saati dışında veya kapalı (slot ${t.ayar.slotDk} dk). O günün açık slotları: ${bos.length ? bos.join(', ') : 'yok (gün kapalı)'}. Doluluk için takvim_durumu kullanın.`);
      }
      const bitis = dkEkle(saatler[n - 1], t.ayar.slotDk);
      const eklenen: string[] = [];
      for (let k = 0; k < n; k++) {
        const not = n > 1 ? `MCP · Uzun işlem ${k + 1}/${n} (${saatler[0]}–${bitis})` : 'MCP ile eklendi';
        const r = await rota(randevuEklePost, email, '/api/panel/randevu-ekle', 'POST', {
          entityId: i.entity_id, entityType: i.entity_type, entityName: i.entity_name,
          ad_soyad: args.ad_soyad, tel: args.telefon, email: args.eposta || undefined,
          randevu_slot: `${args.tarih} ${saatler[k]}`, mesaj: not,
        });
        if (!r.ok) {
          return hata(`${args.tarih} ${saatler[k]} eklenemedi: ${String(r.veri?.error || `HTTP ${r.status}`).replace(/[.\s]+$/, '')}.` + (eklenen.length ? ` Önceki slotlar eklendi: ${eklenen.join(', ')} — gerekirse randevu_guncelle ile iptal edin.` : ''));
        }
        eklenen.push(saatler[k]);
      }
      return json({ basarili: true, isletme: i.entity_name, tarih: args.tarih, aralik: `${saatler[0]}–${bitis}`, slotlar: eklenen });
    }

    // ── TAKVİM ─────────────────────────────────────────────
    case 'takvim_durumu': {
      const i = isletmeCoz(isletmeler, args.isletme_id); if (typeof i === 'string') return hata(i);
      const bas = args.baslangic || bugunTR();
      if (!TARIH_RE.test(bas)) return hata('baslangic YYYY-MM-DD olmalı.');
      const gunSayisi = Math.min(Math.max(Number(args.gun_sayisi) || 7, 1), 31);
      const son = gunEkle(bas, gunSayisi - 1);
      const t = await takvimAyari(db, i);
      const { data: doluRows } = await (db as any).from('randevu_talepleri')
        .select('randevu_slot,ad_soyad').eq('entity_id', i.entity_id).neq('status', 'iptal')
        .gte('randevu_slot', `${bas} 00:00`).lte('randevu_slot', `${son} 23:59`);
      const dolu: Record<string, string> = {};
      for (const r of (doluRows || [])) if (r.randevu_slot) dolu[String(r.randevu_slot)] = String(r.ad_soyad || '');
      const gunler = Array.from({ length: gunSayisi }, (_, k) => {
        const iso = gunEkle(bas, k);
        const slotlar = gunSlotlari(t.ayar, iso);
        const gunKapali = t.bloke.includes(iso);
        const d: { saat: string; hasta: string }[] = [], kapali: string[] = [], bos: string[] = [];
        for (const s of slotlar) {
          const key = `${iso} ${s}`;
          if (dolu[key]) d.push({ saat: s, hasta: dolu[key] });
          else if (gunKapali || t.bloke.includes(key)) kapali.push(s);
          else bos.push(s);
        }
        // Çalışma saati dışına elle girilmiş randevular da görünsün
        for (const [key, hasta] of Object.entries(dolu)) {
          if (key.startsWith(iso + ' ') && !slotlar.includes(key.slice(11))) d.push({ saat: key.slice(11), hasta });
        }
        d.sort((a, b) => a.saat.localeCompare(b.saat));
        const gunAdi = new Date(iso + 'T12:00:00Z').toLocaleDateString('tr-TR', { weekday: 'long', timeZone: 'UTC' });
        return { tarih: iso, gun: gunAdi, calisma_gunu: slotlar.length > 0, tum_gun_kapali: gunKapali, dolu: d, kapali, bos };
      });
      return json({ isletme: i.entity_name, slot_dakika: t.ayar.slotDk, online_randevu_acik: t.randevuAktif, gunler });
    }

    case 'takvim_kapat_ac': {
      const i = isletmeCoz(isletmeler, args.isletme_id); if (typeof i === 'string') return hata(i);
      if (!i.premium) return hata(`${i.entity_name} Hekimhane-Pro değil; gün/saat kapatma Pro özelliğidir (${SITE}/pro).`);
      if (!['kapat', 'ac'].includes(args.islem)) return hata('islem "kapat" veya "ac" olmalı.');
      if (!TARIH_RE.test(args.tarih || '')) return hata('tarih YYYY-MM-DD olmalı.');
      const saatler: string[] = Array.isArray(args.saatler) ? args.saatler.map(String) : [];
      if (saatler.some(s => !SAAT_RE.test(s))) return hata('saatler HH:MM biçiminde olmalı.');
      const t = await takvimAyari(db, i);
      let yeni = t.bloke.slice();
      const g = args.tarih as string;
      if (args.islem === 'kapat') {
        if (!saatler.length) yeni = [...yeni.filter(x => x !== g && !x.startsWith(g + ' ')), g];
        else for (const s of saatler) if (!yeni.includes(`${g} ${s}`)) yeni.push(`${g} ${s}`);
      } else {
        if (!saatler.length) yeni = yeni.filter(x => x !== g && !x.startsWith(g + ' '));
        else yeni = yeni.filter(x => !saatler.map(s => `${g} ${s}`).includes(x));
      }
      const r = await rota(isletmeGuncellePost, email, '/api/panel/update-entity', 'POST', {
        entityType: i.entity_type, entityId: i.entity_id, fields: { randevu_bloke: yeni },
      });
      if (!r.ok) return hata(r.veri?.error || `Kaydedilemedi (HTTP ${r.status}).`);
      const guncel = (await takvimAyari(db, i)).bloke.filter(x => x === g || x.startsWith(g + ' '));
      return json({ basarili: true, isletme: i.entity_name, tarih: g, islem: args.islem, bu_gunun_kapali_kayitlari: guncel });
    }

    // ── YORUMLAR ───────────────────────────────────────────
    case 'yorumlari_listele': {
      let hedefIds = isletmeler.map(x => x.entity_id);
      if (args.isletme_id) {
        const i = isletmeCoz(isletmeler, args.isletme_id); if (typeof i === 'string') return hata(i);
        hedefIds = [i.entity_id];
      }
      if (!hedefIds.length) return json({ adet: 0, yorumlar: [] });
      const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
      let sorgu = (db as any).from('yorumlar').select('*').in('entity_id', hedefIds).order('created_at', { ascending: false }).limit(limit);
      if (args.sadece_yanitsiz) sorgu = sorgu.is('reply_text', null);
      const { data, error } = await sorgu;
      if (error) return hata('Yorumlar alınamadı.');
      const ad = Object.fromEntries(isletmeler.map(x => [x.entity_id, x.entity_name]));
      return json({
        adet: (data || []).length,
        yorumlar: (data || []).map((y: any) => ({
          yorum_id: y.id, isletme: ad[y.entity_id] || y.entity_id, yazar: y.author, puan: y.rating,
          metin: y.text || '(yalnız puan)', tarih: y.created_at, yanit: y.reply_text || null,
          gizli: y.hidden === true || undefined,
        })),
      });
    }

    case 'yoruma_yanit_ver': {
      if (!args.yorum_id) return hata('yorum_id gerekli.');
      if (!args.sil && !String(args.yanit || '').trim()) return hata('yanit metni gerekli (veya sil=true).');
      if (!(await kapsamda('yorumlar', args.yorum_id))) return kapsamDisi();
      const r = await rota(yorumYanitPost, email, '/api/panel/reply-yorum', 'POST', {
        yorumId: String(args.yorum_id), replyText: String(args.yanit || ''), deleteReply: args.sil === true,
      });
      if (!r.ok) return hata(r.veri?.error || `Yanıt kaydedilemedi (HTTP ${r.status}).`);
      return json({ basarili: true, islem: args.sil ? 'yanıt kaldırıldı' : 'yanıt yayınlandı' });
    }

    // ── İLETİŞİM ───────────────────────────────────────────
    case 'hastaya_eposta_gonder': {
      if (!args.talep_id || !args.mesaj) return hata('talep_id ve mesaj gerekli.');
      if (!(await kapsamda('randevu_talepleri', args.talep_id))) return kapsamDisi();
      const r = await rota(hastaMailPost, email, '/api/panel/hasta-mail', 'POST', {
        talepId: String(args.talep_id), konu: args.konu, mesaj: String(args.mesaj),
      });
      if (!r.ok) return hata(r.veri?.error || `E-posta gönderilemedi (HTTP ${r.status}).`);
      return json({ basarili: true, gonderildi: true });
    }

    default:
      return hata(`Bilinmeyen araç: ${ad}`);
  }
}

/** Anahtar sahibinin en az bir Pro işletmesi var mı (MCP erişim şartı). */
export async function mcpErisimiVar(email: string): Promise<boolean> {
  const liste = await sahipIsletmeleri(admin(), email);
  return liste.some(i => i.premium);
}
