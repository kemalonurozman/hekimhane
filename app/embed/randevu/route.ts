import { type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const VALID = ['klinik', 'hastane', 'doktor', 'eczane'] as const;
type EntityType = (typeof VALID)[number];

const TABLE: Record<EntityType, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};

function esc(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** İşletme adını türüne göre çözer (doktorda unvan + ad + soyad). */
async function entityAdi(type: EntityType, id: string): Promise<string | null> {
  try {
    if (type === 'doktor') {
      const { data } = await supabase.from('doktorlar').select('ad,soyad,unvan').eq('id', id).maybeSingle();
      const d = data as any;
      if (!d) return null;
      return [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim() || null;
    }
    const { data } = await supabase.from(TABLE[type]).select('name').eq('id', id).maybeSingle();
    return (data as any)?.name || null;
  } catch { return null; }
}

/** İsim + randevu takvim ayarlarını çeker. Kolonlar yoksa (migration yok) → free mode. */
async function getCfg(type: EntityType, id: string) {
  const tbl = TABLE[type];
  const nameCol = type === 'doktor' ? 'ad,soyad,unvan' : 'name';
  try {
    // select('*') → eksik kolonlarda (migration öncesi) hata vermez, graceful
    const { data, error } = await supabase.from(tbl).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    const d = data as any;
    if (!d) return null;
    const ad = type === 'doktor' ? [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim() : d.name;
    if (!ad) return null;
    const bloke = Array.isArray(d.randevu_bloke) ? d.randevu_bloke.map(String) : [];
    return { ad, pro: d.premium === true, aktif: d.randevu_aktif === true, slotDk: Number(d.randevu_slot_dk) || 30, ch: String(d.calisma_saatleri || ''), acik24: d.acik_24_saat === true, bloke };
  } catch {
    // Premium durumu doğrulanamıyorsa modül kapalı kalır (fail-closed).
    const ad = await entityAdi(type, id);
    return ad ? { ad, pro: false, aktif: false, slotDk: 30, ch: '', acik24: false, bloke: [] as string[] } : null;
  }
}

/** Dış sitelere gömülen modül — Pro üyelik yoksa kilit ekranı. */
function proKilitHtml(ad: string, accent: string): Response {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Randevu</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#FBF8F2;">
<div style="text-align:center;padding:32px 24px;max-width:340px;">
  <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#D4A843,#BE8F2C);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  </div>
  <div style="font-size:15px;font-weight:700;color:#1D1D1F;margin-bottom:6px;">${esc(ad)}</div>
  <p style="font-size:13px;color:#6E6E73;line-height:1.6;margin:0 0 16px;">Online randevu modülü şu an aktif değil. İşletme sahibiyseniz Hekimhane-Pro ile aktifleştirebilirsiniz.</p>
  <a href="https://www.hekimhane.com.tr/pro" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;border-radius:11px;background:${esc(accent)};color:#fff;font-size:13px;font-weight:700;text-decoration:none;">Hekimhane-Pro</a>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function hata(mesaj: string): Response {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Randevu</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#FBF8F2;color:#6E6E73;">
<div style="text-align:center;padding:24px;font-size:14px;">${esc(mesaj)}</div></body></html>`;
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = String(sp.get('type') || '') as EntityType;
  const id = String(sp.get('id') || '').trim();
  // İsteğe bağlı görünüm ayarları
  const accent = /^#?[0-9a-fA-F]{6}$/.test(sp.get('accent') || '') ? ('#' + (sp.get('accent') as string).replace('#', '')) : '#1B3A69';

  if (!VALID.includes(type) || !id) return hata('Geçersiz randevu bağlantısı. type ve id gereklidir.');

  const konf = await getCfg(type, id);
  if (!konf) return hata('İşletme bulunamadı. Bağlantıyı kontrol edin.');
  const ad = konf.ad;

  // Rezervasyon modülü Pro üyeliğe kilitli — ücretsiz hesapta kilit ekranı.
  if (!konf.pro) return proKilitHtml(ad, accent);

  // Slot bazlı ise: dolu slotları çek (çakışmayı engellemek için)
  let booked: string[] = [];
  if (konf.aktif) {
    try {
      const { data } = await (supabase as any).from('randevu_talepleri')
        .select('randevu_slot').eq('entity_id', id).not('randevu_slot', 'is', null).neq('status', 'iptal');
      booked = ((data as any[]) || []).map(r => String(r.randevu_slot)).filter(Boolean);
    } catch { booked = []; }
    booked = booked.concat(konf.bloke || []);   // elle kapatılan gün/slotları da ekle
  }

  // Serbest (free) mod için sabit saat listesi
  const saatler: string[] = [];
  for (let h = 8; h <= 20; h++) { saatler.push(`${String(h).padStart(2, '0')}:00`); saatler.push(`${String(h).padStart(2, '0')}:30`); }
  const saatOpts = saatler.map(s => `<option value="${s}">${s}</option>`).join('');
  const saatInit = konf.aktif ? '<option value="">Önce tarih seçin</option>' : `<option value="">Farketmez</option>${saatOpts}`;

  const cfg = JSON.stringify({
    entity_type: type, entity_id: id, entity_name: ad,
    mode: konf.aktif ? 'slot' : 'free', slotDk: konf.slotDk, ch: konf.aktif ? konf.ch : '', acik24: konf.acik24, booked,
  });

  const html = `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Randevu Al — ${esc(ad)}</title>
<style>
  :root{--acc:${accent};--bd:#E5E5EA;--muted:#6E6E73;--text:#1c1c1e;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;background:#fff;color:var(--text);padding:16px;}
  .hk-embed{max-width:460px;margin:0 auto;}
  .hk-hd{display:flex;align-items:center;gap:10px;margin-bottom:4px;}
  .hk-dot{width:34px;height:34px;border-radius:10px;background:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hk-name{font-size:16px;font-weight:800;letter-spacing:-.3px;line-height:1.2;}
  .hk-sub{font-size:12px;color:var(--muted);margin:2px 0 16px;}
  label{display:block;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 5px;}
  input,select,textarea{width:100%;padding:11px 13px;border:1.5px solid var(--bd);border-radius:11px;font-size:14px;font-family:inherit;color:var(--text);outline:none;background:#fff;}
  input:focus,select:focus,textarea:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(27,58,105,.08);}
  .hk-row{display:flex;gap:8px;}
  .hk-row>div{flex:1;}
  .hk-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}
  button{width:100%;margin-top:18px;padding:13px;border:0;border-radius:12px;background:var(--acc);color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .15s;}
  button:disabled{opacity:.6;cursor:default;}
  .hk-note{font-size:11px;color:var(--muted);text-align:center;margin-top:12px;line-height:1.5;}
  .hk-msg{padding:12px 14px;border-radius:11px;font-size:13.5px;line-height:1.5;margin-top:12px;display:none;}
  .hk-ok{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;}
  .hk-err{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;}
  .hk-brand{text-align:center;margin-top:16px;font-size:11px;color:var(--muted);}
  .hk-brand a{color:var(--acc);text-decoration:none;font-weight:700;}
  .hk-success{display:none;text-align:center;padding:24px 8px;}
  .hk-success .ic{width:52px;height:52px;border-radius:50%;background:#ECFDF5;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
</style>
</head>
<body>
<div class="hk-embed">
  <div id="hkForm">
    <div class="hk-hd">
      <span class="hk-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
      <div><div class="hk-name">${esc(ad)}</div></div>
    </div>
    <div class="hk-sub">Randevu talebinizi bırakın; işletme sizinle iletişime geçsin.</div>

    <label>Ad Soyad *</label>
    <input id="ad" type="text" autocomplete="name" placeholder="Adınız Soyadınız" maxlength="100">

    <label>Telefon *</label>
    <input id="tel" type="tel" autocomplete="tel" placeholder="05xx xxx xx xx" maxlength="20">

    <label>E-posta (isteğe bağlı)</label>
    <input id="email" type="email" autocomplete="email" placeholder="ornek@mail.com" maxlength="150">

    <div class="hk-row">
      <div><label>Tarih</label><input id="tarih" type="date"></div>
      <div><label>Saat</label><select id="saat">${saatInit}</select></div>
    </div>

    <label>Mesaj (isteğe bağlı)</label>
    <textarea id="mesaj" rows="2" placeholder="Şikayetiniz veya notunuz" maxlength="1000"></textarea>

    <input class="hk-hp" id="website" tabindex="-1" autocomplete="off" aria-hidden="true">

    <button id="hkBtn" type="button">Randevu Talebi Gönder</button>
    <div id="hkMsg" class="hk-msg"></div>
    <div class="hk-note">Talebiniz Hekimhane üzerinden işletmeye iletilir.</div>
  </div>

  <div id="hkDone" class="hk-success">
    <div class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
    <div style="font-size:17px;font-weight:800;margin-bottom:6px;">Talebiniz alındı</div>
    <div style="font-size:13.5px;color:var(--muted);line-height:1.6;">İşletme en kısa sürede sizinle iletişime geçecek.</div>
  </div>

  <div class="hk-brand">Powered by <a href="https://www.hekimhane.com.tr" target="_blank" rel="noopener">Hekimhane</a></div>
</div>

<script>
(function(){
  var CFG = ${cfg};
  var btn = document.getElementById('hkBtn');
  var msg = document.getElementById('hkMsg');
  var tarih = document.getElementById('tarih');
  var saatEl = document.getElementById('saat');
  function pad(n){ return (n<10?'0':'')+n; }
  var td = new Date(); var todayStr = td.getFullYear()+'-'+pad(td.getMonth()+1)+'-'+pad(td.getDate());
  try { tarih.min = todayStr; } catch(e){}
  var GUN = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  function showMsg(t, ok){ msg.textContent = t; msg.className = 'hk-msg ' + (ok ? 'hk-ok' : 'hk-err'); msg.style.display = 'block'; }

  // Slot bazlı: seçilen günün çalışma saatlerinden uygun saatleri üret
  function gunSlotlari(dateStr){
    if (!dateStr) return [];
    var dt = new Date(dateStr+'T00:00:00'); var gun = GUN[dt.getDay()];
    var open='09:00', close='18:00', acik=true;
    if (CFG.acik24){ open='08:00'; close='22:00'; }
    else {
      var sch={}; try{ sch = CFG.ch ? JSON.parse(CFG.ch) : {}; }catch(e){}
      if (sch && sch[gun]){ acik = sch[gun].acik!==false; open=sch[gun].baslangic||'09:00'; close=sch[gun].bitis||'18:00'; }
      else if (CFG.ch){ acik=false; }
      else { acik = dt.getDay()!==0; }  // çalışma saati tanımsız → Pzt-Cmt 09-18
    }
    if (!acik) return [];
    if (CFG.booked.indexOf(dateStr)>=0) return [];  // tüm gün kapalı/bloke
    var t=(+open.split(':')[0])*60+(+open.split(':')[1]);
    var end=(+close.split(':')[0])*60+(+close.split(':')[1]);
    var dk=CFG.slotDk||30, out=[];
    var isToday = dateStr===todayStr; var nowMin = td.getHours()*60+td.getMinutes();
    while (t+dk<=end){
      var lbl=pad(Math.floor(t/60))+':'+pad(t%60);
      var taken = CFG.booked.indexOf(dateStr+' '+lbl)>=0;
      var past = isToday && t<=nowMin+15;
      if (!taken && !past) out.push(lbl);
      t+=dk;
    }
    return out;
  }
  function tarihDegisti(){
    if (CFG.mode!=='slot') return;
    if (!tarih.value){ saatEl.innerHTML='<option value="">Önce tarih seçin</option>'; return; }
    var arr = gunSlotlari(tarih.value);
    if (!arr.length){ saatEl.innerHTML='<option value="">Bu gün uygun saat yok</option>'; return; }
    saatEl.innerHTML = '<option value="">Saat seçin</option>' + arr.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join('');
  }
  if (CFG.mode==='slot'){ tarih.addEventListener('change', tarihDegisti); }

  btn.addEventListener('click', function(){
    var ad = document.getElementById('ad').value.trim();
    var tel = document.getElementById('tel').value.trim();
    var email = document.getElementById('email').value.trim();
    var d = tarih.value;
    var s = saatEl.value;
    var mesaj = document.getElementById('mesaj').value.trim();
    var website = document.getElementById('website').value;
    if (ad.length < 3) { showMsg('Lütfen ad soyad girin.', false); return; }
    if (tel.replace(/\\D/g,'').length < 10) { showMsg('Geçerli bir telefon numarası girin.', false); return; }
    var payload = {
      entity_type: CFG.entity_type, entity_id: CFG.entity_id, entity_name: CFG.entity_name,
      ad_soyad: ad, tel: tel, email: email || null, mesaj: mesaj || null, website: website
    };
    if (CFG.mode==='slot'){
      if (!d){ showMsg('Lütfen tarih seçin.', false); return; }
      if (!s){ showMsg('Lütfen uygun bir saat seçin.', false); return; }
      payload.randevu_slot = d+' '+s;
      payload.tercih = d+' '+s;
    } else {
      payload.tercih = [d, s].filter(Boolean).join(' ') || null;
    }
    btn.disabled = true; btn.textContent = 'Gönderiliyor…'; msg.style.display = 'none';
    fetch('/api/randevu-talebi', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(res){
        if (res.ok && res.j && res.j.ok) {
          document.getElementById('hkForm').style.display = 'none';
          document.getElementById('hkDone').style.display = 'block';
        } else {
          showMsg((res.j && res.j.error) || 'Talep gönderilemedi. Lütfen tekrar deneyin.', false);
          btn.disabled = false; btn.textContent = 'Randevu Talebi Gönder';
        }
      }).catch(function(){
        showMsg('Bağlantı hatası. Lütfen tekrar deneyin.', false);
        btn.disabled = false; btn.textContent = 'Randevu Talebi Gönder';
      });
  });
})();
</script>
</body></html>`;

  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
