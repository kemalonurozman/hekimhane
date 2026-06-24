/**
 * set-passwords.js
 *
 * Supabase Admin API kullanarak kullanıcı şifrelerini ayarlar.
 *
 * Kullanım:
 *   node scripts/set-passwords.js
 *
 * Gereksinimler: .env.local dosyasında SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// .env.local dosyasını oku
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Hata: .env.local dosyası bulunamadı.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env   = {};
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env            = loadEnv();
const SUPABASE_URL   = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY    = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Hata: SUPABASE_URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

// Supabase Admin REST API çağrısı
function supabaseAdminRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path:     `/auth/v1/admin/${endpoint}`,
      method,
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Kullanıcıları listele → id bul
function listUsers() {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path:     '/auth/v1/admin/users?per_page=1000',
      method:   'GET',
      headers:  {
        'apikey':        SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Şifre güncelle (kullanıcı zaten varsa)
async function updatePassword(userId, password) {
  return supabaseAdminRequest('PUT', `users/${userId}`, { password });
}

// Kullanıcı oluştur (yoksa)
async function createUser(email, password) {
  return supabaseAdminRequest('POST', 'users', {
    email,
    password,
    email_confirm: true,
  });
}

// ── Ana mantık ───────────────────────────────────────────────
const USERS = [
  { email: 'kemalonurozman@gmail.com', password: 'hekimhane', label: 'Admin' },
  { email: 'bukalemun7@gmail.com',     password: 'hekimhane', label: 'Panel' },
];

async function main() {
  console.log('Supabase şifre kurulum scripti başlatılıyor...\n');

  // Tüm kullanıcıları çek
  const listRes = await listUsers();
  if (listRes.status !== 200) {
    console.error('Kullanıcı listesi alınamadı:', listRes.body);
    process.exit(1);
  }

  const existingUsers = listRes.body.users || [];

  for (const { email, password, label } of USERS) {
    process.stdout.write(`[${label}] ${email} ... `);

    const existing = existingUsers.find(u => u.email === email);

    if (existing) {
      // Kullanıcı var — şifreyi güncelle
      const res = await updatePassword(existing.id, password);
      if (res.status === 200) {
        console.log('✓ Şifre güncellendi');
      } else {
        console.log('✗ HATA:', JSON.stringify(res.body));
      }
    } else {
      // Kullanıcı yok — oluştur
      const res = await createUser(email, password);
      if (res.status === 201 || res.status === 200) {
        console.log('✓ Kullanıcı oluşturuldu ve şifre ayarlandı');
      } else {
        console.log('✗ HATA:', JSON.stringify(res.body));
      }
    }
  }

  console.log('\nTamamlandı!');
  console.log('─────────────────────────────────────────');
  console.log('Admin Paneli  : kemalonurozman@gmail.com  →  Hkm.Admin.26');
  console.log('Kullanıcı Paneli: bukalemun7@gmail.com     →  Hkm.Panel.26');
  console.log('─────────────────────────────────────────');
}

main().catch(err => {
  console.error('Beklenmeyen hata:', err);
  process.exit(1);
});
