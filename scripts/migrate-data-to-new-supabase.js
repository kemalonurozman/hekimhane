#!/usr/bin/env node
/**
 * Hekimhane — Eski Supabase'den Yeni Supabase'e Veri Taşıma
 * Çalıştır: node scripts/migrate-data-to-new-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

const OLD_URL  = 'https://zwabwprzewfpkiztqfgj.supabase.co';
const OLD_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YWJ3cHJ6ZXdmcGtpenRxZmdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NzcwOCwiZXhwIjoyMDkxODUzNzA4fQ.XnumwtcrlGApjHZLS_T6s72Bu3_kmVoK1bTigFQ76aA';

const NEW_URL  = 'https://zdjncjenoxnnrkbwcfjw.supabase.co';
const NEW_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkam5jamVub3hubnJrYndjZmp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI5MTIxOCwiZXhwIjoyMDk3ODY3MjE4fQ.nbLNDJuW72MoUI5XnoavxbuQ0_VdCiVgEZy5RG1o25w';

const oldDb = createClient(OLD_URL, OLD_KEY);
const newDb = createClient(NEW_URL, NEW_KEY);

const TABLES = [
  'klinikler',
  'hastaneler',
  'doktorlar',
  'eczaneler',
  'yorumlar',
  'blog_posts',
  'claim_requests',
  'hekimkartlar',
  'email_aboneleri',
  'cekim_talepleri',
];

const BATCH_SIZE = 500;

async function fetchAll(table) {
  let rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await oldDb
      .from(table)
      .select('*')
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(`[${table}] okuma hatası: ${error.message}`);
    if (!data || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }
  return rows;
}

async function insertBatch(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await newDb
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw new Error(`[${table}] yazma hatası (satır ${i}): ${error.message}`);
    process.stdout.write(`  ${i + batch.length}/${rows.length} satır eklendi\r`);
  }
}

async function migrateTable(table) {
  process.stdout.write(`\n[${table}] okunuyor...`);
  let rows;
  try {
    rows = await fetchAll(table);
  } catch (e) {
    console.log(` ATILDI — ${e.message}`);
    return { table, status: 'skip', count: 0 };
  }

  if (rows.length === 0) {
    console.log(` boş tablo, atlanıyor`);
    return { table, status: 'empty', count: 0 };
  }

  console.log(` ${rows.length} satır bulundu, yazılıyor...`);
  try {
    await insertBatch(table, rows);
    console.log(`  ✓ ${rows.length} satır aktarıldı`);
    return { table, status: 'ok', count: rows.length };
  } catch (e) {
    console.log(`  ✗ HATA — ${e.message}`);
    return { table, status: 'error', count: 0, error: e.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Hekimhane — Supabase Veri Taşıma');
  console.log(`  Kaynak: ${OLD_URL}`);
  console.log(`  Hedef:  ${NEW_URL}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\nNOT: Önce yeni Supabase\'de şemayı oluşturduğunuzdan');
  console.log('emin olun (full_schema_new.sql çalıştırılmış olmalı)\n');

  // Bağlantı testi
  const { error: testErr } = await newDb.from('klinikler').select('id').limit(1);
  if (testErr && testErr.code !== 'PGRST116') {
    console.error('❌ Yeni Supabase bağlantı hatası:', testErr.message);
    console.error('   Önce full_schema_new.sql dosyasını SQL Editor\'da çalıştırın!');
    process.exit(1);
  }

  const results = [];
  for (const table of TABLES) {
    const result = await migrateTable(table);
    results.push(result);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ÖZET');
  console.log('═══════════════════════════════════════════════════');
  let total = 0;
  for (const r of results) {
    const icon = r.status === 'ok' ? '✓' : r.status === 'empty' ? '○' : '✗';
    console.log(`  ${icon} ${r.table.padEnd(20)} ${r.count} satır`);
    if (r.error) console.log(`    └─ ${r.error}`);
    total += r.count;
  }
  console.log(`\n  Toplam aktarılan: ${total} satır`);
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Beklenmeyen hata:', err.message);
  process.exit(1);
});
