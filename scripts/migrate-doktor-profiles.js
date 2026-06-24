#!/usr/bin/env node
/**
 * migrate-doktor-profiles.js
 * ---------------------------
 * doktor_profiles.js içindeki 295 doktor profilini (bio, okul, sigorta, conditions, unvan, tags)
 * Supabase doktorlar tablosuna upsert eder.
 *
 * Kullanım:
 *   node scripts/migrate-doktor-profiles.js
 *   node scripts/migrate-doktor-profiles.js --dry-run
 *
 * Gereksinimler:
 *   npm install @supabase/supabase-js dotenv   (veya proje kökündeki package.json'da zaten var)
 *
 * .env dosyasında şu değişkenler olmalı:
 *   NEXT_PUBLIC_SUPABASE_URL=https://...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=... (veya SUPABASE_SERVICE_ROLE_KEY — önerilir)
 */

const path  = require('path');
const fs    = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL veya Supabase key eksik. .env.local dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DRY_RUN  = process.argv.includes('--dry-run');

// ─── doktor_profiles.js yükle ────────────────────────────────────────────────
// Dosya var DOKTOR_PROFILES = { ... }; şeklinde; global context'e eval ediyoruz.
const profilesPath = path.join(__dirname, '../../Listing Restaurants & Hotels & Doctors/data/doktor_profiles.js');

if (!fs.existsSync(profilesPath)) {
  console.error('❌  doktor_profiles.js bulunamadı:', profilesPath);
  process.exit(1);
}

const src = fs.readFileSync(profilesPath, 'utf8');

// "var DOKTOR_PROFILES = { ... };" → objeyi çıkar
let DOKTOR_PROFILES = {};
try {
  // Node global'e atar; sonra okuyoruz
  const fn = new Function('var DOKTOR_PROFILES={}; ' + src + '; return DOKTOR_PROFILES;');
  DOKTOR_PROFILES = fn();
} catch (e) {
  console.error('❌  doktor_profiles.js parse hatası:', e.message);
  process.exit(1);
}

const ids = Object.keys(DOKTOR_PROFILES);
console.log(`📋  ${ids.length} doktor profili yüklendu.`);

if (DRY_RUN) {
  console.log('🔍  Dry-run modu: veritabanına yazılmıyor.\n');
  console.log('İlk 3 kayıt önizleme:');
  ids.slice(0, 3).forEach(id => {
    const p = DOKTOR_PROFILES[id];
    console.log(`  ${id}: ${p.unvan || ''} ${p.ad} ${p.soyad} — ${p.brans}`);
  });
  process.exit(0);
}

// ─── Upsert ──────────────────────────────────────────────────────────────────
const BATCH = 50;
let ok = 0, skipped = 0, errors = 0;

async function run() {
  // Batch'lere böl
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);

    const rows = batch.map(id => {
      const p = DOKTOR_PROFILES[id];
      return {
        id,
        unvan:      p.unvan      || null,
        bio:        p.bio        || null,
        okul:       p.okul       || null,
        sigorta:    Array.isArray(p.sigorta)    ? p.sigorta    : null,
        conditions: Array.isArray(p.conditions) ? p.conditions : null,
        tags:       Array.isArray(p.tags)       ? p.tags       : null,
        verified:   p.verified === true,
      };
    });

    const { data, error } = await supabase
      .from('doktorlar')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error(`  ❌  Batch ${i}–${i + batch.length - 1} hatası:`, error.message);
      errors += batch.length;
    } else {
      ok += batch.length;
      const names = batch.slice(0, 3).map(id => {
        const p = DOKTOR_PROFILES[id];
        return `${p.ad} ${p.soyad}`;
      }).join(', ');
      console.log(`  ✅  ${i + 1}–${i + batch.length}: ${names}${batch.length > 3 ? ' …' : ''}`);
    }

    // Rate limit aralığı
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\n🎉  Tamamlandı: ${ok} güncellendi, ${skipped} atlandı, ${errors} hata.`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
