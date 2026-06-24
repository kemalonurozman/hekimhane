const fs=require('fs'),path=require('path');
require('dotenv').config({path:path.join(__dirname,'../.env.local')});
const {createClient}=require('@supabase/supabase-js');
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const TR={ş:'s',Ş:'s',ı:'i',İ:'i',ğ:'g',Ğ:'g',ü:'u',Ü:'u',ö:'o',Ö:'o',ç:'c',Ç:'c'};
function slug(t=''){return t.split('').map(c=>TR[c]||c).join('').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
function uslug(map,base){if(!map[base]){map[base]=1;return base;}return base+'-'+(++map[base]);}
function getIl(k){return k.state||k.city||null;}
function getIlce(k){return k.state?(k.city||k.district||null):(k.district||null);}
async function upsert(table,rows,bs=500){let n=0;for(let i=0;i<rows.length;i+=bs){const{error}=await supabase.from(table).upsert(rows.slice(i,i+bs),{onConflict:'id'});if(error)console.error('❌',error.message);else{n+=Math.min(bs,rows.length-i);process.stdout.write('\r  '+table+': '+n+'/'+rows.length);}}console.log('\n  ✅ '+table+': '+n+' kayıt');}
async function main(){
console.log('🚀 Migration başlıyor...');
const{error:e}=await supabase.from('klinikler').select('id').limit(1);
if(e){console.error('❌ Bağlantı hatası:',e.message);process.exit(1);}
console.log('✅ Supabase bağlantısı başarılı\n');
const DATA='/Users/onur/Documents/Claude/eski docs /Listing Restaurants & Hotels & Doctors/data';
const D=p=>DATA+'/'+p;

// Klinikler
let raw=fs.readFileSync(D('klinikler_data.js'),'utf8');
raw=raw.replace(/^var ALL_KLINIKLER\s*=\s*/,'global.__D__=');eval(raw);
const KL=global.__D__;delete global.__D__;
const km={};
await upsert('klinikler',KL.map(k=>({id:k.id,name:k.name,type:k.type||null,il:getIl(k),ilce:getIlce(k),adres:k.adres||null,lat:k.lat||0,lng:k.lng||0,tel:k.tel?String(k.tel):null,website:k.website||null,maps_url:k.maps||null,specs:k.specs||[],rat:k.rat||4.5,rev:k.rev||0,online:k.online||false,acil:k.acil||false,claimed:k.claimed||false,slug:uslug(km,[getIl(k),getIlce(k),k.name].filter(Boolean).map(slug).join('-')),logo:k.logo||null,cover:k.cover||null})));

// Hastaneler
console.log('\n🏥 Hastaneler aktarılıyor...');
let raw2=fs.readFileSync(D('hastaneler_data.js'),'utf8');
raw2=raw2.replace(/^(?:var|const|let)\s+\w+\s*=\s*\[/m,'global.__D__=[');eval(raw2);
const HS=global.__D__;delete global.__D__;
console.log('  Toplam '+HS.length+' kayıt hazır');
const hm={};
await upsert('hastaneler',HS.map(h=>({id:h.id,name:h.name,type:h.type||null,il:h.city||h.il||null,ilce:h.district||h.ilce||null,adres:h.adres||null,lat:h.lat||0,lng:h.lng||0,tel:h.tel?String(h.tel):null,website:h.website||null,maps_url:h.maps||null,specs:h.specs||[],rat:h.rat||4.5,rev:h.rev||0,docs:h.docs||0,beds:h.beds||0,founded:h.founded||null,claimed:h.claimed||false,slug:uslug(hm,[h.city||h.il,h.district||h.ilce,h.name].filter(Boolean).map(slug).join('-')),logo:h.logo||null,cover:h.cover||null})));

// Doktorlar
console.log('\n👨‍⚕️ Doktorlar aktarılıyor...');
let raw3=fs.readFileSync(D('doktorlar_data.js'),'utf8');
raw3=raw3.replace(/^(?:var|const|let)\s+\w+\s*=\s*\[/m,'global.__D__=[');eval(raw3);
const DR=global.__D__;delete global.__D__;
console.log('  Toplam '+DR.length+' kayıt hazır');
const dm={};
await upsert('doktorlar',DR.map(d=>({id:d.id,ad:d.f||'',soyad:d.l||'',spec:d.spec||null,il:d.city||null,ilce:d.district||null,clinic_name:d.clinic||null,rat:d.rat||4.5,rev:d.rev||0,fee:d.fee||0,premium:d.premium||false,online:d.online||false,verified:d.verified||false,tel:d.tel?String(d.tel):null,tags:d.tags||[],exp:d.exp||0,lat:d.lat||0,lng:d.lng||0,slug:uslug(dm,slug((d.spec||'doktor')+' '+(d.f||'')+' '+(d.l||'')+' '+(d.city||''))),photo:d.photo||null})));

// Eczaneler
console.log('\n💊 Eczaneler aktarılıyor...');
let raw4=fs.readFileSync(D('eczaneler_data.js'),'utf8');
raw4=raw4.replace(/^(?:var|const|let)\s+\w+\s*=\s*\[/m,'global.__D__=[');eval(raw4);
const EC=global.__D__;delete global.__D__;
console.log('  Toplam '+EC.length+' kayıt hazır');
const em={};
await upsert('eczaneler',EC.map(e=>({id:e.id,name:e.name,pharmacist:e.pharmacist||null,il:e.city||null,ilce:e.district||null,address:e.address||null,tel:e.tel?String(e.tel):null,nobetci:e.nobetci||false,chamber:e.chamber||null,slug:uslug(em,slug('eczane '+e.name+' '+(e.city||''))),lat:e.lat||0,lng:e.lng||0})));

// Yorumlar
console.log('\n💬 Yorumlar aktarılıyor...');
let raw5=fs.readFileSync(D('reviews_db.js'),'utf8');
raw5=raw5.replace(/^(?:var|const|let)\s+\w+\s*=\s*\{/m,'global.__D__={');eval(raw5);
const DB=global.__D__;delete global.__D__;
const YR=[];
for(const[id,revs]of Object.entries(DB)){const t=id.startsWith('h')?'hastane':id.startsWith('d')?'doktor':id.startsWith('e')?'eczane':'klinik';for(const r of(revs||[]))YR.push({entity_type:t,entity_id:id,author:r.author||'Anonim',rating:r.rating||5,text:r.text||null,date:r.date||null,helpful:r.helpful||0,verified:r.verified||false});}
console.log('  Toplam '+YR.length+' yorum hazır');
await upsert('yorumlar',YR);

console.log('\n✅ Migration tamamlandı!');
}
main();
