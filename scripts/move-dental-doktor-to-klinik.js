/**
 * Yanlış tabloya (doktorlar) düşen ÖZEL diş hekimlerini klinikler tablosuna taşır.
 * - Kriter: dental spec + devlet/universite ETİKETİ YOK.
 * - klinikler'e type='Diş Hekimi' olarak eklenir (özel), doktorlar'dan silinir.
 * Kullanım: node scripts/move-dental-doktor-to-klinik.js [--commit]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const COMMIT = process.argv.includes('--commit');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slugify = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const trDown = s => s.replace(/İ/g,'i').replace(/I/g,'ı').replace(/Ğ/g,'ğ').replace(/Ü/g,'ü').replace(/Ş/g,'ş').replace(/Ö/g,'ö').replace(/Ç/g,'ç').toLowerCase();
const trUp1 = c => c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
const titleWord = w => w ? trUp1(trDown(w).charAt(0)) + trDown(w).slice(1) : w;
const titleName = s => (s || '').trim().replace(/\s+/g, ' ').split(' ').map(titleWord).join(' ');

// Dental spec mi? (tıbbi branşları KESİNLİKLE dışla)
const DENTAL_EXACT = new Set([
  'Diş Hekimi','Diş Hekimliği','Dişçi','Ağız','Ağız ve Diş Sağlığı','Genel Diş Hekimliği','Genel Diş Hekimi',
]);
function isDental(spec = '') {
  if (DENTAL_EXACT.has(spec)) return true;
  const t = trDown(spec);
  return /diş|ağız|ortodont|endodont|periodont|pedodont|protez|protetik|restoratif|implant/.test(t);
}

(async () => {
  // Tüm doktorlar
  let dk = [], f = 0;
  for (;;) { const { data } = await s.from('doktorlar').select('*').range(f, f + 999); if (!data || !data.length) break; dk = dk.concat(data); if (data.length < 1000) break; f += 1000; }
  const targets = dk.filter(d => {
    const tagged = (d.tags || []).some(x => x === 'devlet-dis-hastanesi' || x === 'universite-dis-hastanesi');
    return !tagged && isDental(d.spec);
  });

  // Mevcut klinikler: max id + slug seti
  let kl = [], g = 0;
  for (;;) { const { data } = await s.from('klinikler').select('id,slug').range(g, g + 999); if (!data || !data.length) break; kl = kl.concat(data); if (data.length < 1000) break; g += 1000; }
  let maxK = 0; const usedSlugs = new Set();
  kl.forEach(k => { const m = /^k(\d+)$/.exec(k.id); if (m) maxK = Math.max(maxK, +m[1]); if (k.slug) usedSlugs.add(k.slug); });
  const uslug = base => { let s2 = base || 'dis-hekimi'; let i = 1; while (usedSlugs.has(s2)) s2 = `${base}-${++i}`; usedSlugs.add(s2); return s2; };

  const newKlinik = []; const delIds = [];
  for (const d of targets) {
    maxK += 1; const id = `k${maxK}`;
    const nm = titleName(`${d.ad || ''} ${d.soyad || ''}`).trim() || 'Diş Hekimi';
    const spec = (d.spec && d.spec !== 'Diş Hekimi') ? d.spec : 'Genel Diş Hekimliği';
    const sl = uslug(slugify(`${nm} ${d.il || ''}`));
    newKlinik.push({
      id, name: nm, type: 'Diş Hekimi',
      il: d.il || null, ilce: d.ilce || null,
      adres: d.clinic_name || null, tel: d.tel || null,
      specs: [spec], slug: sl,
      claimed: false, online: false, acil: false, premium: false, rat: 0, rev: 0,
    });
    delIds.push(d.id);
  }

  console.log(`Taşınacak diş hekimi: ${newKlinik.length}`);
  const ilMap = {}; newKlinik.forEach(k => { if (k.il) ilMap[k.il] = (ilMap[k.il] || 0) + 1; });
  console.log('il dağılımı:', JSON.stringify(ilMap));
  console.log('örnek:', JSON.stringify(newKlinik.slice(0, 3).map(k => ({ name: k.name, il: k.il, ilce: k.ilce, adres: k.adres, slug: k.slug })), null, 1));

  if (!COMMIT) { console.log('\n[DRY-RUN] --commit ile taşı'); return; }
  for (let i = 0; i < newKlinik.length; i += 300) {
    const { error } = await s.from('klinikler').insert(newKlinik.slice(i, i + 300));
    if (error) throw error;
  }
  console.log(`✓ ${newKlinik.length} klinikler'e eklendi.`);
  for (let i = 0; i < delIds.length; i += 300) {
    const { error } = await s.from('doktorlar').delete().in('id', delIds.slice(i, i + 300));
    if (error) throw error;
  }
  console.log(`✓ ${delIds.length} doktorlar'dan silindi.`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
