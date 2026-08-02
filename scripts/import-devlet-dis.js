/**
 * Devlet Ağız ve Diş Sağlığı Hastaneleri — doktor rosteri import (CSV)
 * - Hastaneler mevcut `hastaneler` tablosunda (eksikler oluşturulur, type='Devlet')
 * - Doktorlar `doktorlar` tablosuna, tags=['devlet-dis-hastanesi'] (standart aramadan gizli)
 * - clinic_name = hastane adı (hastane sayfasında doktorlar bununla listelenir)
 * Kullanım: node scripts/import-devlet-dis.js [--commit]
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const FILE = process.argv.find(a => a.endsWith('.csv')) || '/Users/onur/Downloads/dis_hekimleri_listesi-v17.csv';
const TAG = 'devlet-dis-hastanesi';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
const slug = (t = '') => t.split('').map(c => TR[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// Türkçe-duyarlı büyük/küçük — toLocaleLowerCase('tr') İ'de combining-dot ürettiği için elle map
const trDown = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ş/g, 'ş').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase();
const trUp1 = c => c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
const titleWord = w => w ? trUp1(trDown(w).charAt(0)) + trDown(w).slice(1) : w;
const titleName = s => (s || '').trim().replace(/\s+/g, ' ').split(' ').map(titleWord).join(' ');

// Basit CSV parse (tırnak içi virgülleri korur)
function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c === '\r') { /* skip */ }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// Bölüm → kanonik diş uzmanlığı
function specFromBolum(b = '') {
  const t = b.toLocaleLowerCase('tr');
  if (t.includes('cerrah') || t.includes('çene cerrah')) return 'Ağız Diş ve Çene Cerrahisi';
  if (t.includes('radyoloji')) return 'Ağız Diş ve Çene Radyolojisi';
  if (t.includes('çocuk') || t.includes('pedodont')) return 'Pedodonti (Çocuk Diş Hekimliği)';
  if (t.includes('endodont') || t.includes('kanal')) return 'Endodonti (Kanal Tedavisi)';
  if (t.includes('ortodont')) return 'Ortodonti (Diş Teli)';
  if (t.includes('periodont') || t.includes('diş eti')) return 'Periodontoloji (Diş Eti)';
  if (t.includes('protez') || t.includes('protetik')) return 'Protez (Diş Protezi)';
  if (t.includes('restoratif') || t.includes('dolgu')) return 'Restoratif Diş Tedavisi (Dolgu)';
  if (t.includes('implant')) return 'İmplantoloji (İmplant)';
  return 'Genel Diş Hekimliği';
}

const normUnvan = u => {
  const t = (u || '').toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim();
  if (t.includes('uzm') && t.includes('dr')) return 'Uzm. Dr. Dt.';
  if (t.includes('uzm')) return 'Uzm. Dt.';
  if (t.includes('dr') && t.includes('dt')) return 'Dr. Dt.';
  if (t.includes('tabib')) return 'Diş Doktoru';
  return 'Dt.';
};

// CSV hastane adı → { arama substring, il, ilce (eksikse oluşturmak için) }
const HOSP = {
  'Fatma Kemal Timuçin Ağız ve Diş Sağlığı Hastanesi':          { q: 'Fatma Kemal Timuçin', il: 'Adana', ilce: 'Seyhan' },
  'Adana Karşıyaka Ağız ve Diş Sağlığı Hastanesi':              { q: 'Karşıyaka Ağız ve Diş', il: 'Adana', ilce: 'Yüreğir' },
  'Ankara Osmanlı Ağız ve Diş Sağlığı Hastanesi':              { q: 'Osmanlı Ağız ve Diş', il: 'Ankara', ilce: 'Altındağ' },
  'Tepebaşı Ağız ve Diş Sağlığı Hastanesi':                    { q: 'Tepebaşı Ağız ve Diş', il: 'Ankara', ilce: 'Tepebaşı' },
  'Sincan Ağız ve Diş Sağlığı Hastanesi':                      { q: 'Sincan Ağız ve Diş', il: 'Ankara', ilce: 'Sincan' },
  'Antalya Ağız ve Diş Sağlığı Hastanesi':                     { q: 'Antalya Ağız ve Diş', il: 'Antalya', ilce: 'Muratpaşa' },
  'Balıkesir Ağız ve Diş Sağlığı Hastanesi':                   { q: 'Balıkesir Ağız ve Diş', il: 'Balıkesir', ilce: 'Altıeylül' },
  'Ankara Ağız ve Diş Sağlığı Merkezi':                        { q: 'Ankara Ağız ve Diş Sağlığı Merkezi', il: 'Ankara', ilce: 'Altındağ', create: true },
  'Bartın Şehit Cem Kanbur Ağız ve Diş Sağlığı Merkezi':        { q: 'Cem Kanbur', il: 'Bartın', ilce: 'Merkez', create: true },
  // ── Bolu'dan itibaren (v30 CSV) — hastaneler zaten mevcut (h745–h753), q ile eşleşir ──
  'Bolu İzzet Baysal Ağız ve Diş Sağlığı Hastanesi':                                    { q: 'Bolu İzzet Baysal Ağız ve Diş', il: 'Bolu', ilce: 'Merkez' },
  'İnegöl Ağız ve Diş Sağlığı Hastanesi':                                               { q: 'İnegöl Ağız ve Diş', il: 'Bursa', ilce: 'İnegöl' },
  'Bursa Nilüfer Ağız ve Diş Sağlığı Hastanesi':                                        { q: 'Nilüfer Ağız ve Diş', il: 'Bursa', ilce: 'Nilüfer' },
  'Çorum Şehit Ömer Emiroğlu Ağız ve Diş Sağlığı Hastanesi':                            { q: 'Şehit Ömer Emiroğlu', il: 'Çorum', ilce: 'Merkez' },
  'Denizli Ağız ve Diş Sağlığı Hastanesi':                                              { q: 'Denizli Ağız ve Diş', il: 'Denizli', ilce: 'Merkezefendi' },
  // Diyarbakır — 4 birim, tek mevcut kayda (h750) bağlanır; VARDİYA dedup ile elenir
  'Diyarbakır Ağız ve Diş Sağlığı Hastanesi (DAĞKAPI DİŞ TEDAVİ VE PROTEZ MERKEZİ)':    { q: 'Diyarbakır Ağız ve Diş', il: 'Diyarbakır', ilce: 'Kayapınar' },
  'Diyarbakır Ağız ve Diş Sağlığı Hastanesi (DİCLEKENT DİŞ TEDAVİ VE PROTEZ MERKEZİ)':  { q: 'Diyarbakır Ağız ve Diş', il: 'Diyarbakır', ilce: 'Kayapınar' },
  'Diyarbakır Ağız ve Diş Sağlığı Hastanesi (BAĞLAR DİŞ TEDAVİ VE PROTEZ MERKEZİ)':     { q: 'Diyarbakır Ağız ve Diş', il: 'Diyarbakır', ilce: 'Kayapınar' },
  'Diyarbakır Ağız ve Diş Sağlığı Hastanesi (VARDİYA)':                                 { q: 'Diyarbakır Ağız ve Diş', il: 'Diyarbakır', ilce: 'Kayapınar' },
  // Düzce — ana + 5 semt kliniği, tek mevcut kayda (h751) bağlanır
  'Düzce Ağız ve Diş Sağlığı Hastanesi':                                                { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Düzce Ağız ve Diş Sağlığı Hastanesi (Bahçeşehir Kliniği)':                           { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Düzce Ağız ve Diş Sağlığı Hastanesi (Çilimli Kliniği)':                              { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Düzce Ağız ve Diş Sağlığı Hastanesi (Gümüşova Kliniği)':                             { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Düzce Ağız ve Diş Sağlığı Hastanesi (Kaynaşlı Kliniği)':                             { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Düzce Ağız ve Diş Sağlığı Hastanesi (Yığılca Kliniği)':                              { q: 'Düzce Ağız ve Diş', il: 'Düzce', ilce: 'Merkez' },
  'Elazığ Ağız ve Diş Sağlığı Hastanesi':                                               { q: 'Elazığ Ağız ve Diş', il: 'Elazığ', ilce: 'Merkez' },
  'Eskişehir Ağız ve Diş Sağlığı Hastanesi':                                            { q: 'Eskişehir Ağız ve Diş', il: 'Eskişehir', ilce: 'Odunpazarı' },

  // v52 — mevcut hastaneler tablosunda (h754+) zaten var, q ile eşleşir
  'Kayseri Nimet Bayraktar Ağız ve Diş Sağlığı Hastanesi':                              { q: 'Nimet Bayraktar', il: 'Kayseri', ilce: 'Kocasinan' },
  'Samsun Ağız ve Diş Sağlığı Hastanesi':                                               { q: 'Samsun Ağız ve Diş', il: 'Samsun', ilce: 'İlkadım' },
  'Samsun Bafra Ağız ve Diş Sağlığı Hastanesi':                                         { q: 'Bafra Ağız ve Diş', il: 'Samsun', ilce: 'Bafra' },
  'İzmir Eğitim Diş Hastanesi (Merkez)':                                                { q: 'İzmir Eğitim Diş', il: 'İzmir', ilce: 'Konak' },
  'İzmir Eğitim Diş Hastanesi (Gaziemir Semt Polikliniği)':                             { q: 'İzmir Eğitim Diş', il: 'İzmir', ilce: 'Konak' },
  'İzmir Eğitim Diş Hastanesi (Menderes Semt Polikliniği)':                             { q: 'İzmir Eğitim Diş', il: 'İzmir', ilce: 'Konak' },
  'Konya Ağız ve Diş Sağlığı Hastanesi':                                                { q: 'Konya Ağız ve Diş Sağlığı Hastanesi', il: 'Konya', ilce: 'Selçuklu' },
  'Okmeydanı Ağız ve Diş Sağlığı Hastanesi':                                            { q: 'Okmeydanı Ağız', il: 'İstanbul', ilce: 'Kağıthane' },
  'Gaziantep Şahinbey Ağız ve Diş Sağlığı Hastanesi':                                   { q: 'Şahinbey Ağız ve Diş', il: 'Gaziantep', ilce: 'Şahinbey' },
  'Gaziantep Şahinbey Ağız ve Diş Sağlığı Hastanesi (Perilikaya Semt Polikliniği)':     { q: 'Şahinbey Ağız ve Diş', il: 'Gaziantep', ilce: 'Şahinbey' },
  'Sakarya Ağız ve Diş Sağlığı Hastanesi':                                              { q: 'Sakarya Ağız ve Diş', il: 'Sakarya', ilce: 'Serdivan' },
  'Kahramanmaraş Ağız ve Diş Sağlığı Hastanesi':                                        { q: 'Kahramanmaraş Ağız ve Diş', il: 'Kahramanmaraş', ilce: 'Dulkadiroğlu' },
  'Malatya Şehit Mehmet Kılınç Ağız ve Diş Sağlığı Hastanesi':                          { q: 'Mehmet Kılınç', il: 'Malatya', ilce: 'Yeşilyurt' },
  'Kütahya Ağız ve Diş Sağlığı Hastanesi':                                              { q: 'Kütahya Ağız ve Diş', il: 'Kütahya', ilce: 'Merkez' },
  'İstanbul Ataşehir Ağız ve Diş Sağlığı Hastanesi':                                    { q: 'İstanbul Ataşehir Ağız ve Diş', il: 'İstanbul', ilce: 'Ataşehir' },
  'Küçükçekmece Ağız ve Diş Sağlığı Hastanesi':                                         { q: 'Küçükçekmece Ağız ve Diş', il: 'İstanbul', ilce: 'Küçükçekmece' },
  'Sultangazi Ağız ve Diş Sağlığı Hastanesi':                                           { q: 'Sultangazi Ağız ve Diş', il: 'İstanbul', ilce: 'Sultangazi' },
  'Bağcılar Ağız ve Diş Sağlığı Hastanesi':                                             { q: 'Bağcılar Ağız ve Diş', il: 'İstanbul', ilce: 'Bağcılar' },
  // v52 — tabloda yok, oluşturulacak
  'Konya Ağız ve Diş Sağlığı Merkezi (Meram)':                                          { q: 'Konya Ağız ve Diş Sağlığı Merkezi', il: 'Konya', ilce: 'Meram', create: true },
  'Mersin Ağız ve Diş Sağlığı Merkezi':                                                 { q: 'Mersin Ağız ve Diş Sağlığı Merkezi', il: 'Mersin', ilce: 'Yenişehir', create: true },
};

(async () => {
  const rows = parseCSV(fs.readFileSync(FILE, 'utf8')).filter(r => r.length >= 4 && r[0].trim());
  const header = rows.shift();
  console.log(`CSV: ${rows.length} doktor satırı\n`);

  // Mevcut doktorlar: max id + name+clinic dedup + slug seti
  let all = [], from = 0;
  for (;;) { const { data } = await sb.from('doktorlar').select('id,slug,ad,soyad,clinic_name').range(from, from + 999); if (!data || !data.length) break; all = all.concat(data); if (data.length < 1000) break; from += 1000; }
  let maxD = 0; const usedSlugs = new Set(); const existKey = new Set();
  all.forEach(d => { const m = /^d(\d+)$/.exec(d.id); if (m) maxD = Math.max(maxD, +m[1]); if (d.slug) usedSlugs.add(d.slug); existKey.add(slug(`${d.ad} ${d.soyad} ${d.clinic_name || ''}`)); });
  const uslug = base => { let s = base || 'dr'; let i = 1; while (usedSlugs.has(s)) s = `${base}-${++i}`; usedSlugs.add(s); return s; };

  // Hastaneleri çöz / oluştur
  let maxH = 0; { const { data } = await sb.from('hastaneler').select('id'); (data || []).forEach(h => { const m = /^h(\d+)$/.exec(h.id); if (m) maxH = Math.max(maxH, +m[1]); }); }
  const hospMap = {}; const newHosp = [];
  for (const [csvName, cfg] of Object.entries(HOSP)) {
    const { data } = await sb.from('hastaneler').select('id,name,il,ilce,slug').ilike('name', `%${cfg.q}%`).limit(1);
    if (data && data[0]) { hospMap[csvName] = data[0]; }
    else {
      maxH += 1; const id = `h${maxH}`;
      const s = uslugH([cfg.il, cfg.ilce, csvName].map(slug).join('-'));
      const rec = { id, name: csvName, type: 'Devlet', il: cfg.il, ilce: cfg.ilce, slug: s, claimed: false, rat: 0, rev: 0 };
      hospMap[csvName] = rec; newHosp.push(rec);
    }
  }
  function uslugH(base) { return base; } // hastane slug'ları benzersiz varsayılıyor (yeni 2 tane)

  // Doktor satırlarını kur
  const IDX = { hosp: header.indexOf('Hastane Adı'), name: header.indexOf('Doktor Adı Soyadı'), unvan: header.indexOf('Ünvan'), bolum: header.indexOf('Bölüm'), tel: header.indexOf('İletişim') };
  const doktorlar = []; const atlanan = []; let n = maxD;
  for (const r of rows) {
    const hName = r[IDX.hosp].trim();
    const fullName = titleName(r[IDX.name]);
    if (!fullName || fullName.length < 3) { atlanan.push('(isimsiz)'); continue; }
    const hosp = hospMap[hName];
    if (!hosp) { atlanan.push(`(hastane eşleşmedi: ${hName})`); continue; }
    const key = slug(`${fullName} ${hosp.name}`);
    if (existKey.has(key)) { atlanan.push(fullName); continue; }
    existKey.add(key);

    const parts = fullName.split(' ');
    const soyad = parts.length > 1 ? parts.pop() : '';
    const ad = parts.join(' ');
    const spec = specFromBolum(r[IDX.bolum] || '');
    const tel = (r[IDX.tel] || '').replace(/\s+/g, ' ').trim() || null;
    n += 1; const id = `d${n}`;
    const s = uslug(slug(`${ad} ${soyad} ${hosp.il}`));
    doktorlar.push({
      id, ad, soyad, unvan: normUnvan(r[IDX.unvan]), spec,
      il: hosp.il, ilce: hosp.ilce, clinic_name: hosp.name,
      tel, tags: [TAG, spec], verified: false, rat: 0, rev: 0, fee: 0,
      slug: s,
    });
  }

  console.log(`Oluşturulacak hastane: ${newHosp.length}`, newHosp.map(h => h.id + ':' + h.name).join(', '));
  console.log(`Eklenecek doktor: ${doktorlar.length} | atlanan: ${atlanan.length}`);
  const byHosp = {}; doktorlar.forEach(d => byHosp[d.clinic_name] = (byHosp[d.clinic_name] || 0) + 1);
  Object.entries(byHosp).forEach(([h, c]) => console.log(`   ${c}  ${h}`));

  if (!COMMIT) { console.log('\n[DRY-RUN] --commit ile yaz'); return; }

  if (newHosp.length) { const { error } = await sb.from('hastaneler').upsert(newHosp, { onConflict: 'id' }); if (error) throw error; console.log(`✓ ${newHosp.length} hastane oluşturuldu.`); }
  // type='Devlet' işaretle (kategori filtresi için) — eşleşen mevcut hastaneler
  for (const h of Object.values(hospMap)) { if (!newHosp.includes(h)) await sb.from('hastaneler').update({ type: 'Devlet' }).eq('id', h.id); }
  for (let i = 0; i < doktorlar.length; i += 500) {
    const { error } = await sb.from('doktorlar').upsert(doktorlar.slice(i, i + 500), { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`✓ ${doktorlar.length} doktor eklendi (tags: ${TAG}).`);
})().catch(e => { console.error('HATA:', e.message || e); process.exit(1); });
