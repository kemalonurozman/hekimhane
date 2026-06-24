/**
 * HEKİMHANE — Blog Migration
 * HTML blog dosyalarını okur, içerikleri ayrıştırır ve Supabase'e aktarır.
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Türkçe slug
const TR = { ş:'s',Ş:'s',ı:'i',İ:'i',ğ:'g',Ğ:'g',ü:'u',Ü:'u',ö:'o',Ö:'o',ç:'c',Ç:'c' };
function toSlug(t=''){
  return t.split('').map(c=>TR[c]||c).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

// HTML tag temizle
function stripTags(html=''){
  return html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

// Regex ile HTML alanı çek
function extract(html, re, group=1){
  const m = html.match(re);
  return m ? m[group].trim() : '';
}

const DATA_DIR = path.join(__dirname, '../../Listing Restaurants & Hotels & Doctors');

async function migrateBlog(){
  console.log('📝 Blog yazıları aktarılıyor...\n');

  const posts = [];

  for(let i = 1; i <= 17; i++){
    const file = path.join(DATA_DIR, `blog-${i}.html`);
    if(!fs.existsSync(file)){ console.warn(`  ⚠️  blog-${i}.html bulunamadı`); continue; }

    const html = fs.readFileSync(file, 'utf8');

    // Başlık
    const title = extract(html, /<title>([^<]+)<\/title>/)
      .replace(/\s*—\s*Hekimhane\s*/i,'').trim();

    // Açıklama
    const summary = extract(html, /<meta name="description" content="([^"]+)"/);

    // Kapak görseli
    const cover_image = extract(html, /src="(https:\/\/images\.pexels\.com[^"]+)"/);

    // Kategori — kategori badge'inden çek
    const catMatch = html.match(/border-radius:20px;border:[^>]+>([^<]+)</);
    const category = catMatch ? catMatch[1].trim() : 'Genel';

    // Tarih
    const dateMatch = html.match(/(\d{1,2}\s+\w+\s+202\d)/);
    const dateStr   = dateMatch ? dateMatch[1] : null;

    // İçerik — post-body div
    const bodyMatch = html.match(/<div class="post-body">([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/article>|<div style="background:#[EF][EF][F2][2F][2F][0-9A-F])/i);
    let content = bodyMatch ? bodyMatch[1].trim() : '';

    // Eğer çekilemezse article içeriğini al
    if(!content){
      const artMatch = html.match(/<div style="padding:36px 40px;">([\s\S]*?)<\/article>/i);
      content = artMatch ? artMatch[1].trim() : '';
    }

    const slug = toSlug(title);

    posts.push({
      title,
      slug,
      summary: summary || null,
      content: content || null,
      category: category || 'Genel',
      cover_image: cover_image || null,
      author: 'Hekimhane Editör',
      published: true,
      views: 0,
      tags: [category],
      created_at: dateStr ? parseDate(dateStr) : new Date().toISOString(),
    });

    console.log(`  ✅ blog-${i}: ${title.slice(0,55)}...`);
  }

  console.log(`\n📤 ${posts.length} yazı Supabase'e aktarılıyor...`);

  const { error } = await supabase
    .from('blog_posts')
    .upsert(posts, { onConflict: 'slug' });

  if(error){
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ ${posts.length} blog yazısı başarıyla aktarıldı!`);
}

// "5 Nisan 2026" → ISO string
function parseDate(str){
  const MONTHS = {
    'Ocak':1,'Şubat':2,'Mart':3,'Nisan':4,'Mayıs':5,'Haziran':6,
    'Temmuz':7,'Ağustos':8,'Eylül':9,'Ekim':10,'Kasım':11,'Aralık':12
  };
  const m = str.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if(!m) return new Date().toISOString();
  const [,day,mon,year] = m;
  const month = MONTHS[mon] || 1;
  return new Date(parseInt(year), month-1, parseInt(day)).toISOString();
}

migrateBlog().catch(e=>{ console.error(e); process.exit(1); });
