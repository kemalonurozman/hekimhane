/**
 * Klinikler temizlik:
 *  1) ilce normalizasyonu (İl adını sıyır, "X/Y"→Y, "İl Merkez"→"Merkez") — TÜM klinikler
 *  2) Zonguldak: belirlenen çöp/oda kayıtlarını sil
 *  3) Zonguldak: aynı kişinin iki kaydını birleştir (yorumları taşı)
 * Kullanım: node scripts/cleanup-klinikler.js [--commit]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const COMMIT = process.argv.includes('--commit');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const titleTr = (s = '') => s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1).toLocaleLowerCase('tr') : s;

function normIlce(il, ilce) {
  let c = (ilce || '').trim();
  if (!c) return 'Merkez';
  if (c.includes('/')) c = c.split('/').pop().trim();                 // "Filyos/Çaycuma" → "Çaycuma"
  const ilLow = (il || '').toLocaleLowerCase('tr');
  // "Zonguldak Merkez" / "KDZ. EREĞLİ" gibi önekleri temizle
  if (ilLow && c.toLocaleLowerCase('tr').startsWith(ilLow)) c = c.slice(il.length).trim();
  if (!c || /^merkez$/i.test(c)) return 'Merkez';
  // Çok kelimeli ilçe adlarını olduğu gibi title-case yap
  return c.split(/\s+/).map(titleTr).join(' ');
}

const DELETE_IDS = ['k1083', 'k1070'];  // Oral İnşaat (inşaat firması), Zonguldak Diş Hekimleri Odası (meslek odası)
const MERGE = [{ keep: 'k1073', drop: 'k1078' }]; // İzzet Çığ (tut) ← Dr. Izzet Cig (yorumları taşı, tel kopyala, sil)

(async () => {
  // ── 1) ilce normalizasyonu (tüm klinikler) ──
  let all = []; for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('klinikler').select('id,il,ilce').range(from, from + 999);
    if (error) throw error; if (!data.length) break; all = all.concat(data); if (data.length < 1000) break;
  }
  const fixes = [];
  for (const r of all) { const n = normIlce(r.il, r.ilce); if (n !== (r.ilce || '')) fixes.push({ id: r.id, il: r.il, from: r.ilce, to: n }); }
  console.log(`ilce normalizasyonu: ${fixes.length} kayıt değişecek (toplam ${all.length})`);
  const sample = {}; fixes.forEach(f => { const k = `${f.il}: ${JSON.stringify(f.from)} → ${JSON.stringify(f.to)}`; sample[k] = (sample[k] || 0) + 1; });
  Object.entries(sample).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([k, v]) => console.log('   ', k, `(${v})`));

  // ── 2) silinecekler ──
  const { data: dels } = await sb.from('klinikler').select('id,name').in('id', DELETE_IDS);
  console.log(`\nSilinecek: ${(dels || []).map(d => d.id + ':' + d.name).join(' | ')}`);

  // ── 3) merge ──
  for (const m of MERGE) {
    const { data: kk } = await sb.from('klinikler').select('id,name,tel,website').in('id', [m.keep, m.drop]);
    const keep = (kk || []).find(x => x.id === m.keep), drop = (kk || []).find(x => x.id === m.drop);
    const { count } = await sb.from('yorumlar').select('*', { count: 'exact', head: true }).eq('entity_id', m.drop);
    console.log(`\nBirleştir: TUT ${m.keep}:${keep?.name} ← SİL ${m.drop}:${drop?.name} (${count||0} yorum taşınacak, tel:${keep?.tel?'mevcut':'← '+(drop?.tel||'yok')})`);
  }

  if (!COMMIT) { console.log('\n[DRY-RUN] Uygulamak için --commit'); return; }

  // uygula: ilce
  let done = 0;
  for (const f of fixes) { const { error } = await sb.from('klinikler').update({ ilce: f.to }).eq('id', f.id); if (error) throw error; if (++done % 50 === 0) process.stdout.write(`\r  ilce güncellendi: ${done}/${fixes.length}`); }
  console.log(`\n✓ ilce: ${fixes.length} kayıt güncellendi.`);

  // uygula: merge (önce tel kopyala + yorum taşı, sonra sil)
  for (const m of MERGE) {
    const { data: kk } = await sb.from('klinikler').select('id,tel,website').in('id', [m.keep, m.drop]);
    const keep = (kk || []).find(x => x.id === m.keep), drop = (kk || []).find(x => x.id === m.drop);
    const patch = {}; if (!keep.tel && drop?.tel) patch.tel = drop.tel; if (!keep.website && drop?.website) patch.website = drop.website;
    if (Object.keys(patch).length) await sb.from('klinikler').update(patch).eq('id', m.keep);
    await sb.from('yorumlar').update({ entity_id: m.keep }).eq('entity_id', m.drop).eq('entity_type', 'klinik');
    await sb.from('klinikler').delete().eq('id', m.drop);
    console.log(`✓ ${m.drop} → ${m.keep} birleştirildi.`);
  }

  // uygula: sil
  const { error: de } = await sb.from('klinikler').delete().in('id', DELETE_IDS);
  if (de) throw de;
  console.log(`✓ ${DELETE_IDS.length} kayıt silindi.`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
