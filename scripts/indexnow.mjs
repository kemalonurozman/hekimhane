#!/usr/bin/env node
// IndexNow: yeni, metni değişen ya da kaldırılan sayfaları Bing (ChatGPT arama ve Copilot da bunu kullanır),
// Seznam, Yandex, Naver ve Yep'e bildirir. Google IndexNow kullanmaz.
//
//   npm run indexnow                        kuru çalışma: neyin gönderileceğini listeler, hiçbir şey göndermez
//   npm run indexnow -- --send              yeni / değişen / kaldırılan adresleri bildirir (ilk seferde hepsi)
//   npm run indexnow -- --send --all        sitemap'teki her adresi yeniden bildirir
//   npm run indexnow -- --send /blog/yazi   yalnızca verilen adresleri bildirir (yol ya da tam adres)
//
// Yayından SONRA çalıştırın: betik canlı sitemap'i ve canlı sayfaları okur. Anahtar herkese açıktır;
// public/<anahtar>.txt dosyasının adı ve içeriği aynıdır. Son gönderilen sayfaların metin özeti (TRUST_LASTMOD
// açıksa lastmod tarihi) .indexnow-state.json'da durur; yalnızca değişen sayfalar yeniden bildirilir.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = (process.env.INDEXNOW_SITE_URL || "https://www.hekimhane.com.tr").replace(/\/$/, "");
// Sitemap'teki lastmod gerçek değişiklik tarihiyse true: lastmod'u olan sayfalar indirilmez, tarihleri karşılaştırılır
// (binlerce sayfalık siteler için). false: her sayfa indirilir ve görünen metni karşılaştırılır.
const TRUST_LASTMOD = true;
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = path.join(ROOT, ".indexnow-state.json");
const HOST = new URL(SITE_URL).host;
const UA = "Mozilla/5.0 (compatible; IndexNowScript/1.0)";
const ANSWERS = { 200: "kabul edildi", 202: "kabul edildi, anahtar doğrulanıyor", 400: "istek hatalı", 403: "anahtar geçersiz", 422: "adresler bu alan adına ya da anahtara uymuyor", 429: "çok sık gönderim, sonra yeniden deneyin" };

const fail = (msg) => { console.error(`HATA: ${msg}`); process.exit(1); };
const get = (url) => fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(30000) });

const KEY = readdirSync(path.join(ROOT, "public"))
  .map((f) => f.match(/^([a-zA-Z0-9-]{8,128})\.txt$/)?.[1])
  .find((k) => k && readFileSync(path.join(ROOT, "public", `${k}.txt`), "utf8").trim() === k);
if (!KEY) fail("public/ içinde anahtar dosyası yok (adı ve içeriği aynı olan <anahtar>.txt).");

const args = process.argv.slice(2);
const send = args.includes("--send");
const all = args.includes("--all");
const given = args.filter((a) => !a.startsWith("--")).map((a) => (/^https?:\/\//.test(a) ? a : `${SITE_URL}${a.startsWith("/") ? "" : "/"}${a}`));

/** Sitemap'teki (ya da sitemap dizinindeki) her adres ve varsa lastmod'u. */
async function sitemapEntries(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const res = await get(url);
  if (!res.ok) { console.warn(`! ${url} → HTTP ${res.status}`); return []; }
  const xml = await res.text();
  const entries = [...xml.matchAll(/<(url|sitemap)>([\s\S]*?)<\/\1>/g)]
    .map((m) => ({ loc: m[2].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1]?.replace(/&amp;/g, "&"), lastmod: m[2].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] }))
    .filter((e) => e.loc);
  if (!/<sitemapindex/.test(xml)) return entries;
  const nested = [];
  for (const e of entries) nested.push(...(await sitemapEntries(e.loc, seen)));
  return nested;
}

/** Sayfanın görünen metninin özeti: betikler, stiller ve etiketler atılır, böylece yalnızca içerik değişince özet değişir. */
function textHash(html) {
  const text = html
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

async function pool(items, size, fn) {
  const out = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i]); } }));
  return out;
}

const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { pages: {} };
let pages = null;
let toSend;

if (given.length) {
  toSend = given;
} else {
  const listed = [...new Map((await sitemapEntries(`${SITE_URL}/sitemap.xml`)).map((e) => [e.loc, e])).values()];
  if (!listed.length) fail(`${SITE_URL}/sitemap.xml boş ya da okunamadı.`);
  pages = {};
  const results = await pool(listed, 6, async ({ loc: u, lastmod }) => {
    if (TRUST_LASTMOD && lastmod) return { url: u, hash: `lastmod:${lastmod}` };
    try {
      const res = await get(u);
      // Yönlendirme varsa (ör. www'ya) asıl adres bildirilir.
      return res.ok ? { url: res.url, hash: textHash(await res.text()) } : { url: u, note: `HTTP ${res.status}` };
    } catch (e) {
      return { url: u, note: e.message };
    }
  });
  for (const r of results) {
    if (r.hash && new URL(r.url).host === HOST) pages[r.url] = r.hash;
    else console.warn(`! ${r.url} — ${r.note || `başka alan adı (${HOST} değil)`}, atlandı`);
  }
  const changed = Object.keys(pages).filter((u) => all || state.pages[u] !== pages[u]);
  const removed = all ? [] : Object.keys(state.pages).filter((u) => !(u in pages));
  toSend = [...changed, ...removed];
  console.log(`${Object.keys(pages).length} sayfa incelendi (${HOST}): ${changed.length} yeni ya da değişmiş, ${removed.length} kaldırılmış.`);
}

toSend = [...new Set(toSend)].filter((u) => new URL(u).host === HOST);
for (const u of toSend.slice(0, 15)) console.log(`  ${u}`);
if (toSend.length > 15) console.log(`  … ve ${toSend.length - 15} adres daha`);

if (!send) { console.log("Kuru çalışma; hiçbir şey gönderilmedi. Göndermek için --send ekleyin."); process.exit(0); }
if (!toSend.length) { console.log("Gönderilecek adres yok."); process.exit(0); }

// Arama motorları gönderimi kabul etmeden önce anahtar dosyasını canlı sitede arar.
const keyLocation = `${SITE_URL}/${KEY}.txt`;
const keyRes = await get(keyLocation);
if (!keyRes.ok || new URL(keyRes.url).host !== HOST || (await keyRes.text()).trim() !== KEY) fail(`Anahtar dosyası canlıda yok: ${keyLocation}. Önce siteyi yayına alın.`);

for (let i = 0; i < toSend.length; i += 10000) {
  const part = toSend.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList: part }),
  });
  console.log(`${part.length} adres → HTTP ${res.status} (${ANSWERS[res.status] || "beklenmeyen yanıt"})`);
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}

if (pages) writeFileSync(STATE_FILE, JSON.stringify({ sentAt: new Date().toISOString(), pages }, null, 1) + "\n");
