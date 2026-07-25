/**
 * klinikler.rev / rat değerlerini GERÇEK yorumlardan yeniden hesaplar.
 * Kart ve profil aynı sayıyı gösterir (yalnızca Hekimhane'deki gerçek yorumlar).
 * Kullanım: node scripts/recompute-review-stats.js [--commit]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const COMMIT = process.argv.includes('--commit');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function all(build) { let o = [], f = 0; for (;;) { const { data, error } = await build().range(f, f + 999); if (error) throw error; if (!data || !data.length) break; o = o.concat(data); if (data.length < 1000) break; f += 1000; } return o; }

(async () => {
  const kl = await all(() => sb.from('klinikler').select('id,rat,rev'));
  const yo = await all(() => sb.from('yorumlar').select('entity_id,rating').eq('entity_type', 'klinik'));

  const agg = {}; // entity_id → {n, sum}
  yo.forEach(r => { const a = agg[r.entity_id] || (agg[r.entity_id] = { n: 0, sum: 0 }); a.n++; a.sum += (r.rating || 0); });

  const updates = [];
  for (const k of kl) {
    const a = agg[k.id];
    const rev = a ? a.n : 0;
    const rat = a && a.n ? +(a.sum / a.n).toFixed(1) : 0;
    if (rev !== (k.rev || 0) || Math.abs(rat - (k.rat || 0)) > 0.05) updates.push({ id: k.id, rev, rat });
  }

  console.log(`Toplam klinik: ${kl.length} | güncellenecek: ${updates.length}`);
  console.log('Örnekler:', updates.slice(0, 8).map(u => `${u.id}:★${u.rat}(${u.rev})`).join('  '));
  const zeroed = updates.filter(u => u.rev === 0).length;
  console.log(`Sıfırlanacak (yorumu olmayan): ${zeroed}`);

  if (!COMMIT) { console.log('\n[DRY-RUN] Uygulamak için --commit'); return; }

  let done = 0;
  for (const u of updates) {
    const { error } = await sb.from('klinikler').update({ rev: u.rev, rat: u.rat }).eq('id', u.id);
    if (error) throw error;
    if (++done % 100 === 0) process.stdout.write(`\r  ${done}/${updates.length}`);
  }
  console.log(`\n✓ ${updates.length} klinik güncellendi (rev+rat gerçek yorumlara eşitlendi).`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
