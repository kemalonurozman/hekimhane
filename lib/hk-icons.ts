// Hekimhane ikon seti — tasarım kaynağı: "Healthcare identity system" (hk-icons.js).
// 24px ızgara, 1.5px çizgi, yuvarlak uç ve birleşim. Bu dosya ÜRETİLMİŞTİR; elle düzenleme.
// İstemci ve sunucuda ortak kullanılır — sunucu importu koyma.

export interface HkIkonParca {
  t: 'path' | 'circle' | 'rect';
  a: Record<string, string | number>;
  acc?: 1; body?: 1; dot?: 1; on?: 1; bgfill?: 1; fillAcc?: 1;
  /** Hareket hedefi (draw, pulse, seq, knob, lid, arrow, L, R, ring) ya da durum (morph, hideOnActive). */
  tag?: string;
}
export interface HkIkon {
  tr: string;
  tone?: 'success' | 'warning' | 'info' | 'teal' | 'muted';
  /** Üzerine gelince oynayan hareketler (HK_HAREKET anahtarları). Yoksa 'bounce'. */
  hover?: string[];
  /** Sürekli dönen bekleme hareketi (HK_BEKLEME anahtarı). */
  idle?: string;
  tap?: string;
  origin?: string;
  shine?: 1;
  parts: HkIkonParca[];
}
export interface HkHareket { tgt: string; dur: number; ease: string; stagger?: number; kf: Record<string, string | number>[] }

export const HK_TONLAR = {"success":"#2E8A5F","warning":"#C4721A","error":"#C2413A","info":"#2F6FBF","teal":"#149E9B","muted":"#8B93A1"} as const;

export const HK_HAREKET: Record<string, HkHareket> = {
  "bounce": {"tgt":"root","dur":380,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"scale(1)"},{"transform":"scale(0.82)","offset":0.3},{"transform":"scale(1)"}]},
  "draw": {"tgt":"draw","dur":460,"ease":"cubic-bezier(0.25,0.1,0.25,1)","stagger":70,"kf":[{"strokeDasharray":"1 2","strokeDashoffset":1},{"strokeDasharray":"1 2","strokeDashoffset":0}]},
  "wiggle": {"tgt":"root","dur":480,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"rotate(0deg)"},{"transform":"rotate(-14deg)","offset":0.2},{"transform":"rotate(10deg)","offset":0.45},{"transform":"rotate(-5deg)","offset":0.7},{"transform":"rotate(0deg)"}]},
  "pulse": {"tgt":"pulse","dur":420,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"scale(1)"},{"transform":"scale(1.22)","offset":0.4},{"transform":"scale(1)"}]},
  "breathe": {"tgt":"root","dur":900,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scale(1)"},{"transform":"scale(1.07)","offset":0.45},{"transform":"scale(1)"}]},
  "lift": {"tgt":"arrow","dur":400,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"translateY(0px)"},{"transform":"translateY(-3px)","offset":0.4},{"transform":"translateY(0px)"}]},
  "blink": {"tgt":"lid","dur":300,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scaleY(1)"},{"transform":"scaleY(0.08)","offset":0.45},{"transform":"scaleY(1)"}]},
  "slide": {"tgt":"knob","dur":440,"ease":"cubic-bezier(0.34,1.56,0.64,1)","stagger":50,"kf":[{"transform":"translateX(0px)"},{"transform":"translateX(3px)","offset":0.45},{"transform":"translateX(0px)"}]},
  "variable": {"tgt":"seq","dur":300,"ease":"cubic-bezier(0.25,0.1,0.25,1)","stagger":110,"kf":[{"opacity":0.15},{"opacity":1}]},
  "sway": {"tgt":"root","dur":520,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"rotate(0deg)"},{"transform":"rotate(-9deg)","offset":0.3},{"transform":"rotate(6deg)","offset":0.65},{"transform":"rotate(0deg)"}]},
  "flip": {"tgt":"root","dur":420,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scaleX(1)"},{"transform":"scaleX(0.15)","offset":0.45},{"transform":"scaleX(1)"}]},
  "spin": {"tgt":"root","dur":600,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"rotate(0deg)"},{"transform":"rotate(90deg)"}]},
  "shine": {"tgt":"spark","dur":700,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"opacity":0,"transform":"scale(0) rotate(0deg)"},{"opacity":1,"transform":"scale(1) rotate(45deg)","offset":0.45},{"opacity":0,"transform":"scale(0.2) rotate(90deg)"}]},
  "swapL": {"tgt":"L","dur":420,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"translateX(0px)"},{"transform":"translateX(2.5px)","offset":0.45},{"transform":"translateX(0px)"}]},
  "swapR": {"tgt":"R","dur":420,"ease":"cubic-bezier(0.34,1.56,0.64,1)","kf":[{"transform":"translateX(0px)"},{"transform":"translateX(-2.5px)","offset":0.45},{"transform":"translateX(0px)"}]},
  "beat": {"tgt":"root","dur":620,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scale(1)"},{"transform":"scale(1.12)","offset":0.15},{"transform":"scale(1)","offset":0.32},{"transform":"scale(1.07)","offset":0.47},{"transform":"scale(1)"}]},
};

export const HK_BEKLEME: Record<string, HkHareket> = {
  "pulse": {"tgt":"pulse","dur":1600,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scale(1)","opacity":1},{"transform":"scale(1.2)","opacity":0.55,"offset":0.5},{"transform":"scale(1)","opacity":1}]},
  "ring": {"tgt":"ring","dur":1600,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scale(0.6)","opacity":0.8},{"transform":"scale(1.5)","opacity":0}]},
  "beat": {"tgt":"root","dur":1300,"ease":"cubic-bezier(0.25,0.1,0.25,1)","kf":[{"transform":"scale(1)"},{"transform":"scale(1.08)","offset":0.14},{"transform":"scale(1)","offset":0.28},{"transform":"scale(1.05)","offset":0.42},{"transform":"scale(1)","offset":0.6},{"transform":"scale(1)"}]},
};

/** Parlama yıldızı (shine hareketi olan ikonlarda). */
export const HK_KIVILCIM = 'M19.5 0.5Q19.5 4.5 23.5 4.5Q19.5 4.5 19.5 8.5Q19.5 4.5 15.5 4.5Q19.5 4.5 19.5 0.5Z';

export type HkIkonAdi =
  | "search"
  | "location-pin"
  | "nearby-map"
  | "filter"
  | "city"
  | "compare"
  | "favorite"
  | "share"
  | "family-medicine"
  | "internal-medicine"
  | "cardiology"
  | "neurology"
  | "pediatrics"
  | "gynecology-obstetrics"
  | "orthopedics"
  | "ophthalmology"
  | "ent"
  | "dermatology"
  | "urology"
  | "general-surgery"
  | "oncology"
  | "endocrinology"
  | "pulmonology"
  | "gastroenterology"
  | "physical-medicine-rehabilitation"
  | "physiotherapy"
  | "psychiatry"
  | "psychology"
  | "dentistry"
  | "nutrition-dietetics"
  | "hospital"
  | "clinic"
  | "private-practice"
  | "pharmacy"
  | "on-duty-pharmacy"
  | "laboratory"
  | "emergency"
  | "appointment"
  | "doctor-profile"
  | "verified"
  | "premium"
  | "star-rating"
  | "review"
  | "phone"
  | "message"
  | "price-guide"
  | "health-info"
  | "blog"
  | "hekimkart"
  | "notification"
  | "user-account"
  | "settings"
  | "success"
  | "warning"
  | "info"
  | "open-now"
  | "closed";

export const HK_IKONLAR: Record<HkIkonAdi, HkIkon> = {
  "search": {"tr":"Ara","hover":["draw"],"parts":[{"t":"circle","a":{"cx":10.5,"cy":10.5,"r":6.5},"body":1,"tag":"draw"},{"t":"path","a":{"d":"M15.4 15.4 20 20"},"tag":"draw"},{"t":"path","a":{"d":"M7.7 9.3a3.2 3.2 0 0 1 2.4-2"},"acc":1}]},
  "location-pin": {"tr":"Konum","hover":["lift"],"idle":"pulse","parts":[{"t":"path","a":{"d":"M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z"},"body":1},{"t":"circle","a":{"cx":12,"cy":9.8,"r":2.4},"acc":1,"tag":"pulse"}]},
  "nearby-map": {"tr":"Yakınımda","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"},"body":1},{"t":"path","a":{"d":"M9 4.5v13M15 6.5v13"},"on":1},{"t":"circle","a":{"cx":15,"cy":11,"r":1.7},"acc":1,"dot":1,"tag":"pulse"}]},
  "filter": {"tr":"Filtrele","hover":["slide"],"parts":[{"t":"path","a":{"d":"M4 7h16M4 12h16M4 17h16"}},{"t":"circle","a":{"cx":9,"cy":7,"r":2},"body":1,"bgfill":1,"tag":"knob"},{"t":"circle","a":{"cx":15,"cy":12,"r":2},"acc":1,"body":1,"bgfill":1,"tag":"knob"},{"t":"circle","a":{"cx":8,"cy":17,"r":2},"body":1,"bgfill":1,"tag":"knob"}]},
  "city": {"tr":"Şehir","hover":["variable"],"parts":[{"t":"path","a":{"d":"M3.5 20.5h17"}},{"t":"path","a":{"d":"M5.5 20.5V10l5-2.5v13"},"body":1},{"t":"path","a":{"d":"M10.5 20.5V4.5l8 3v13"},"body":1},{"t":"circle","a":{"cx":8,"cy":13.5,"r":0.9},"acc":1,"dot":1,"tag":"seq"},{"t":"path","a":{"d":"M13.5 10.5h2"},"on":1,"tag":"seq"},{"t":"path","a":{"d":"M13.5 14h2"},"on":1,"tag":"seq"}]},
  "compare": {"tr":"Karşılaştır","hover":["swapL","swapR"],"parts":[{"t":"rect","a":{"x":3.5,"y":5,"width":6.5,"height":14,"rx":2},"body":1,"tag":"L"},{"t":"rect","a":{"x":14,"y":5,"width":6.5,"height":14,"rx":2},"body":1,"tag":"R"},{"t":"path","a":{"d":"M12 3v18"},"acc":1}]},
  "favorite": {"tr":"Favori","hover":["draw"],"tap":"bounce","parts":[{"t":"path","a":{"d":"M12 19.6s-7.6-4.5-7.6-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.6 2.6c0 5.5-7.6 10-7.6 10z"},"body":1,"fillAcc":1,"tag":"draw"}]},
  "share": {"tr":"Paylaş","hover":["lift"],"parts":[{"t":"path","a":{"d":"M8.5 9.5H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5"}},{"t":"path","a":{"d":"M12 14V3.5"},"tag":"arrow"},{"t":"path","a":{"d":"M8.5 7 12 3.5 15.5 7"},"acc":1,"tag":"arrow"}]},
  "family-medicine": {"tr":"Aile Hekimliği","hover":["bounce"],"parts":[{"t":"circle","a":{"cx":9,"cy":7,"r":2.8},"body":1},{"t":"path","a":{"d":"M3.5 19.5a5.5 5.5 0 0 1 11 0"},"body":1},{"t":"circle","a":{"cx":17.5,"cy":10.5,"r":2.1},"acc":1,"body":1},{"t":"path","a":{"d":"M14.8 19.5a2.7 2.7 0 0 1 5.4 0"},"body":1}]},
  "internal-medicine": {"tr":"Dahiliye","hover":["draw"],"parts":[{"t":"path","a":{"d":"M5.5 3.5h1.4M14.1 3.5h1.4"}},{"t":"path","a":{"d":"M6.2 3.5v5a4.3 4.3 0 0 0 8.6 0v-5"}},{"t":"path","a":{"d":"M10.5 12.8v2.7a4 4 0 0 0 8 0v-2"},"tag":"draw"},{"t":"circle","a":{"cx":18.5,"cy":11.5,"r":2},"acc":1,"body":1}]},
  "cardiology": {"tr":"Kardiyoloji","hover":["draw"],"idle":"beat","parts":[{"t":"path","a":{"d":"M12 19.6s-7.6-4.5-7.6-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.6 2.6c0 5.5-7.6 10-7.6 10z"},"body":1},{"t":"path","a":{"d":"M5 12h3.2l1.6-2.8 2.4 5.2 1.9-4 1.2 1.6H19"},"acc":1,"on":1,"tag":"draw"}]},
  "neurology": {"tr":"Nöroloji","hover":["variable"],"parts":[{"t":"path","a":{"d":"M12 5.6A3.4 3.4 0 0 0 5.8 7.3 3.4 3.4 0 0 0 4.6 13a3.4 3.4 0 0 0 3 5.6A3 3 0 0 0 12 19.5z"},"body":1,"tag":"seq"},{"t":"path","a":{"d":"M12 5.6A3.4 3.4 0 0 1 18.2 7.3 3.4 3.4 0 0 1 19.4 13a3.4 3.4 0 0 1-3 5.6A3 3 0 0 1 12 19.5z"},"body":1,"tag":"seq"},{"t":"path","a":{"d":"M8 11.5h1.8M14.2 13.5H16"},"on":1,"tag":"seq"},{"t":"path","a":{"d":"M12 6v13"},"acc":1,"on":1}]},
  "pediatrics": {"tr":"Çocuk Sağlığı","hover":["bounce"],"parts":[{"t":"circle","a":{"cx":12,"cy":13,"r":7.5},"body":1},{"t":"path","a":{"d":"M12 5.5c0-1.6 1.6-2.4 2.8-1.6"}},{"t":"circle","a":{"cx":9.3,"cy":12,"r":0.9},"dot":1,"on":1},{"t":"circle","a":{"cx":14.7,"cy":12,"r":0.9},"dot":1,"on":1},{"t":"path","a":{"d":"M9.6 15.4a3 3 0 0 0 4.8 0"},"acc":1}]},
  "gynecology-obstetrics": {"tr":"Kadın Hastalıkları ve Doğum","hover":["pulse"],"parts":[{"t":"circle","a":{"cx":12,"cy":9,"r":5.5},"body":1},{"t":"path","a":{"d":"M12 14.5V21M9 18h6"}},{"t":"circle","a":{"cx":12,"cy":9,"r":1.8},"acc":1,"dot":1,"tag":"pulse"}]},
  "orthopedics": {"tr":"Ortopedi","hover":["bounce"],"parts":[{"t":"path","a":{"d":"M8.43 10.8H15.57A2 2 0 1 1 17.4 12 2 2 0 1 1 15.57 13.2H8.43A2 2 0 1 1 6.6 12 2 2 0 1 1 8.43 10.8Z","transform":"rotate(-45 12 12)"},"body":1},{"t":"path","a":{"d":"M10.5 12h3","transform":"rotate(-45 12 12)"},"acc":1,"on":1}]},
  "ophthalmology": {"tr":"Göz Hastalıkları","hover":["blink"],"parts":[{"t":"path","a":{"d":"M2.5 12C4.5 8 8 5.5 12 5.5s7.5 2.5 9.5 6.5c-2 4-5.5 6.5-9.5 6.5S4.5 16 2.5 12z"},"body":1,"tag":"lid"},{"t":"circle","a":{"cx":12,"cy":12,"r":3},"on":1,"tag":"lid"},{"t":"circle","a":{"cx":12,"cy":12,"r":1.1},"acc":1,"dot":1,"tag":"lid"}]},
  "ent": {"tr":"Kulak Burun Boğaz","hover":["variable"],"parts":[{"t":"path","a":{"d":"M8 9a5 5 0 0 1 10 0c0 2.6-1.5 3.7-2.7 4.8-1 .9-1.3 1.8-1.3 3.2a3 3 0 0 1-5.6 1.5"}},{"t":"path","a":{"d":"M10.8 9.3a2.2 2.2 0 0 1 4.4 0c0 1.2-1 1.6-1.6 2.4"}},{"t":"path","a":{"d":"M5 7.5a7 7 0 0 0 0 6"},"acc":1,"tag":"seq"}]},
  "dermatology": {"tr":"Dermatoloji","hover":["variable"],"parts":[{"t":"path","a":{"d":"M3.5 8c2.1-1.6 3.6-1.6 5.7 0s3.6 1.6 5.7 0 3.6-1.6 5.6 0"}},{"t":"path","a":{"d":"M3.5 13h17"},"tag":"seq"},{"t":"path","a":{"d":"M3.5 18h17"},"tag":"seq"},{"t":"circle","a":{"cx":8,"cy":15.5,"r":1},"acc":1,"dot":1,"tag":"seq"},{"t":"circle","a":{"cx":15.5,"cy":10.5,"r":1},"dot":1,"tag":"seq"}]},
  "urology": {"tr":"Üroloji","hover":["draw"],"parts":[{"t":"path","a":{"d":"M14 5.2c-3.9-1.6-8.5 1-8.5 6.8s4.6 8.4 8.5 6.8c1.8-.8 2.1-2.9 1-4.4-.8-1.1-.8-2.3 0-3.4 1.1-1.5.8-3.9-1-5.8z"},"body":1},{"t":"path","a":{"d":"M15.5 12h1.5a2 2 0 0 1 2 2v6.5"},"acc":1,"tag":"draw"}]},
  "general-surgery": {"tr":"Genel Cerrahi","hover":["sway"],"origin":"0% 100%","parts":[{"t":"path","a":{"d":"M4.5 19.5l8-8"}},{"t":"path","a":{"d":"M12.5 11.5l6.1-6.1a1.6 1.6 0 0 1 2.3 2.2c-1.6 3.8-4.3 6.3-7 6.9z"},"acc":1,"body":1}]},
  "oncology": {"tr":"Onkoloji","hover":["draw"],"parts":[{"t":"path","a":{"d":"M9 21l6.3-9c1.6-2.3 2-4 1.3-5.6A3.3 3.3 0 0 0 12 4.6a3.3 3.3 0 0 0-4.6 1.8c-.7 1.6-.3 3.3 1.3 5.6L15 21"},"tag":"draw"},{"t":"circle","a":{"cx":12,"cy":8,"r":0.9},"acc":1,"dot":1}]},
  "endocrinology": {"tr":"Endokrinoloji","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M11 7.5c-3 0-5 3-5 7 0 2.5 1.2 4.5 3 4.5 1.5 0 2-1.5 2-3.5z"},"body":1},{"t":"path","a":{"d":"M13 7.5c3 0 5 3 5 7 0 2.5-1.2 4.5-3 4.5-1.5 0-2-1.5-2-3.5z"},"body":1},{"t":"path","a":{"d":"M11 13.5h2"}},{"t":"circle","a":{"cx":12,"cy":4.2,"r":1.2},"acc":1,"dot":1,"tag":"pulse"}]},
  "pulmonology": {"tr":"Göğüs Hastalıkları","hover":["breathe"],"parts":[{"t":"path","a":{"d":"M12 3.5v8"}},{"t":"path","a":{"d":"M12 11.5l-2.5 2M12 11.5l2.5 2"},"acc":1},{"t":"path","a":{"d":"M9.5 7.5C6.3 7.5 3.5 12 3.5 17c0 2 1 3 2.5 3 2 0 4-1.2 4-3.5V8.5a1 1 0 0 0-.5-1z"},"body":1},{"t":"path","a":{"d":"M14.5 7.5c3.2 0 6 4.5 6 9.5 0 2-1 3-2.5 3-2 0-4-1.2-4-3.5V8.5a1 1 0 0 1 .5-1z"},"body":1}]},
  "gastroenterology": {"tr":"Gastroenteroloji","hover":["draw"],"parts":[{"t":"path","a":{"d":"M10 3.5V7a3 3 0 0 1-1.5 2.6C6 11 4.5 12.8 4.5 15.5a5 5 0 0 0 9 3c1.3-1.7 2.5-2.5 4.5-2.5a2.5 2.5 0 0 0 2.5-2.5V11a4.5 4.5 0 0 0-8-2.8"},"tag":"draw"},{"t":"path","a":{"d":"M18 16v4.5"},"acc":1}]},
  "physical-medicine-rehabilitation": {"tr":"Fiziksel Tıp ve Rehabilitasyon","hover":["draw"],"parts":[{"t":"circle","a":{"cx":10.5,"cy":4.6,"r":1.9},"body":1},{"t":"path","a":{"d":"M10.5 7.5V13H16l2.2 5.5"}},{"t":"path","a":{"d":"M7.5 11.2a5 5 0 1 0 7.3 6.3"},"acc":1,"tag":"draw"}]},
  "physiotherapy": {"tr":"Fizyoterapi","hover":["lift","variable"],"parts":[{"t":"circle","a":{"cx":14.5,"cy":4.5,"r":1.9},"body":1},{"t":"path","a":{"d":"M7.5 20.5l3-5.5 3 2.2v3.8"}},{"t":"path","a":{"d":"M10.5 15l2.3-6.5 3.5 3.2 3 .3"}},{"t":"path","a":{"d":"M12.8 8.5 9 9.8l-1.8 3"}},{"t":"path","a":{"d":"M3.5 10H6"},"acc":1,"tag":"seq"},{"t":"path","a":{"d":"M2.5 13.5H5"},"acc":1,"tag":"seq"}]},
  "psychiatry": {"tr":"Psikiyatri","hover":["draw"],"parts":[{"t":"path","a":{"d":"M14.5 20.5v-3h2a2 2 0 0 0 2-2V13l1.6-.6-1.6-3.2A7 7 0 1 0 8 15.5v5"}},{"t":"path","a":{"d":"M10 9.8a2.2 2.2 0 1 1 2.6 2.2c-.4.1-.6.4-.6.8v.9"},"acc":1,"tag":"draw"}]},
  "psychology": {"tr":"Psikoloji","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"path","a":{"d":"M12 13.8s-3.2-1.9-3.2-4.2A1.7 1.7 0 0 1 12 8.8a1.7 1.7 0 0 1 3.2.8c0 2.3-3.2 4.2-3.2 4.2z"},"acc":1,"on":1,"tag":"pulse"}]},
  "dentistry": {"tr":"Diş Hekimliği","hover":["bounce"],"parts":[{"t":"path","a":{"d":"M8 4C5.6 4 4.5 5.8 4.5 8c0 2.8 1.4 4.3 1.9 7.2.4 2.7.9 4.8 2.2 4.8 1.6 0 1.4-5 3.4-5s1.8 5 3.4 5c1.3 0 1.8-2.1 2.2-4.8.5-2.9 1.9-4.4 1.9-7.2 0-2.2-1.1-4-3.5-4-1.9 0-2.6 1-4 1S9.9 4 8 4z"},"body":1},{"t":"path","a":{"d":"M8.3 7.4c1.1.4 2.1.4 3.4-.1"},"acc":1,"on":1}]},
  "nutrition-dietetics": {"tr":"Beslenme ve Diyet","hover":["sway"],"origin":"50% 100%","parts":[{"t":"path","a":{"d":"M12 7.5c-1.5-1-5.5-1.5-7 2-1.4 3.4.5 8.2 2.5 9.8 1.5 1.2 3 .7 4.5 0 1.5.7 3 1.2 4.5 0 2-1.6 3.9-6.4 2.5-9.8-1.5-3.5-5.5-3-7-2z"},"body":1},{"t":"path","a":{"d":"M12 7.5c0-1.5.5-3 2-4"}},{"t":"path","a":{"d":"M12.6 5.6c1.5-1.8 3.5-2 4.5-1.5-.4 1.4-2 2.8-4.5 1.5z"},"acc":1,"body":1}]},
  "hospital": {"tr":"Hastane","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M7 20.5v-16h10v16"},"body":1},{"t":"path","a":{"d":"M3.5 20.5V11H7M20.5 20.5V11H17"}},{"t":"path","a":{"d":"M2.5 20.5h19"}},{"t":"path","a":{"d":"M12 7.5v4M10 9.5h4"},"acc":1,"on":1,"tag":"pulse"},{"t":"path","a":{"d":"M10.5 20.5V17h3v3.5"},"on":1}]},
  "clinic": {"tr":"Klinik","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M4.5 20.5v-10L12 5l7.5 5.5v10"},"body":1},{"t":"path","a":{"d":"M3 20.5h18"}},{"t":"path","a":{"d":"M12 10.2v4.6M9.7 12.5h4.6"},"acc":1,"on":1,"tag":"pulse"}]},
  "private-practice": {"tr":"Muayenehane","hover":["flip"],"origin":"25% 50%","parts":[{"t":"path","a":{"d":"M6 20.5v-16a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"},"body":1},{"t":"path","a":{"d":"M3.5 20.5h17"}},{"t":"path","a":{"d":"M9 7.5h6"},"on":1},{"t":"circle","a":{"cx":15,"cy":13,"r":1},"acc":1,"dot":1}]},
  "pharmacy": {"tr":"Eczane","hover":["pulse"],"parts":[{"t":"rect","a":{"x":4,"y":4,"width":16,"height":16,"rx":4.5},"body":1},{"t":"path","a":{"d":"M12 8.5v7M8.5 12h7"},"acc":1,"on":1,"tag":"pulse"}]},
  "on-duty-pharmacy": {"tr":"Nöbetçi Eczane","hover":["pulse"],"idle":"pulse","parts":[{"t":"path","a":{"d":"M15 6.07A8 8 0 1 0 18.73 15.07 6.5 6.5 0 0 1 15 6.07z"},"body":1},{"t":"path","a":{"d":"M18.5 3.5v4M16.5 5.5h4"},"acc":1,"tag":"pulse"}]},
  "laboratory": {"tr":"Laboratuvar","hover":["variable"],"parts":[{"t":"path","a":{"d":"M9.5 3.5h5"}},{"t":"path","a":{"d":"M10.5 3.5v5.3L5.3 17.5a2 2 0 0 0 1.7 3h10a2 2 0 0 0 1.7-3l-5.2-8.7V3.5"},"body":1},{"t":"path","a":{"d":"M7.4 15h9.2"},"acc":1,"on":1,"tag":"seq"},{"t":"circle","a":{"cx":11,"cy":12.3,"r":0.8},"dot":1,"on":1,"tag":"seq"},{"t":"circle","a":{"cx":13.2,"cy":10.6,"r":0.7},"dot":1,"on":1,"tag":"seq"}]},
  "emergency": {"tr":"Acil","hover":["variable"],"parts":[{"t":"path","a":{"d":"M6.5 18v-5a5.5 5.5 0 0 1 11 0v5"},"body":1},{"t":"rect","a":{"x":4.5,"y":18,"width":15,"height":2.5,"rx":1.2},"body":1},{"t":"path","a":{"d":"M12 2.5v1.8"},"acc":1,"tag":"seq"},{"t":"path","a":{"d":"M5.2 5.3l1.3 1.3"},"acc":1,"tag":"seq"},{"t":"path","a":{"d":"M18.8 5.3l-1.3 1.3"},"acc":1,"tag":"seq"},{"t":"path","a":{"d":"M12 11.5v3.5"},"on":1}]},
  "appointment": {"tr":"Randevu","hover":["draw"],"parts":[{"t":"rect","a":{"x":3.5,"y":5,"width":17,"height":15.5,"rx":3},"body":1},{"t":"path","a":{"d":"M3.5 10h17"},"on":1},{"t":"path","a":{"d":"M8 3v4M16 3v4"}},{"t":"circle","a":{"cx":8.5,"cy":14.5,"r":0.9},"dot":1,"on":1,"tag":"hideOnActive"},{"t":"circle","a":{"cx":12,"cy":14.5,"r":0.9},"dot":1,"on":1,"tag":"hideOnActive"},{"t":"circle","a":{"cx":15.5,"cy":14.5,"r":0.9},"acc":1,"dot":1,"tag":"hideOnActive"},{"t":"path","a":{"d":"M9 15.2l2 2 4-4"},"acc":1,"tag":"morph"}]},
  "doctor-profile": {"tr":"Hekim Profili","hover":["pulse"],"parts":[{"t":"circle","a":{"cx":12,"cy":7.5,"r":3.5},"body":1},{"t":"path","a":{"d":"M5 20.5a7 7 0 0 1 14 0"},"body":1},{"t":"path","a":{"d":"M15 15.5v3M13.5 17h3"},"acc":1,"on":1,"tag":"pulse"}]},
  "verified": {"tr":"Onaylı Hekim","hover":["draw","shine"],"shine":1,"parts":[{"t":"path","a":{"d":"M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6z"},"body":1},{"t":"path","a":{"d":"M8.8 12.2l2.2 2.2 4.3-4.6"},"acc":1,"on":1,"tag":"draw"}]},
  "premium": {"tr":"Pro Üyelik","hover":["shine","bounce"],"shine":1,"parts":[{"t":"path","a":{"d":"M4.5 17 3.5 8l4.8 3.6L12 5.5l3.7 6.1L20.5 8l-1 9z"},"acc":1,"body":1},{"t":"path","a":{"d":"M5.5 20h13"},"acc":1}]},
  "star-rating": {"tr":"Puan","hover":["bounce"],"parts":[{"t":"path","a":{"d":"M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"},"body":1,"fillAcc":1}]},
  "review": {"tr":"Yorum","hover":["variable"],"parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"path","a":{"d":"M7.5 9h9"},"on":1,"tag":"seq"},{"t":"path","a":{"d":"M7.5 12.5h5.5"},"acc":1,"on":1,"tag":"seq"}]},
  "phone": {"tr":"Telefon","hover":["wiggle","variable"],"parts":[{"t":"path","a":{"d":"M7 3.5h2.4l1.4 3.8-2 1.5a10.5 10.5 0 0 0 6.4 6.4l1.5-2 3.8 1.4V17a2 2 0 0 1-2 2.2A15.5 15.5 0 0 1 4.8 5.6 2 2 0 0 1 7 3.5z"},"body":1},{"t":"path","a":{"d":"M14.5 7a2.5 2.5 0 0 1 2.5 2.5"},"acc":1,"tag":"seq"},{"t":"path","a":{"d":"M14.5 3.5a6 6 0 0 1 6 6"},"acc":1,"tag":"seq"}]},
  "message": {"tr":"Mesaj","hover":["variable"],"parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"circle","a":{"cx":8.5,"cy":10.8,"r":1},"dot":1,"on":1,"tag":"seq"},{"t":"circle","a":{"cx":12,"cy":10.8,"r":1},"dot":1,"on":1,"tag":"seq"},{"t":"circle","a":{"cx":15.5,"cy":10.8,"r":1},"acc":1,"dot":1,"tag":"seq"}]},
  "price-guide": {"tr":"Fiyat Rehberi","hover":["sway"],"origin":"20% 20%","parts":[{"t":"path","a":{"d":"M3.5 12.4V5A1.5 1.5 0 0 1 5 3.5h7.4l8.1 8.1a1.5 1.5 0 0 1 0 2.1l-6.8 6.8a1.5 1.5 0 0 1-2.1 0z"},"body":1},{"t":"circle","a":{"cx":8,"cy":8,"r":1.6},"acc":1}]},
  "health-info": {"tr":"Sağlık Rehberi","hover":["pulse"],"parts":[{"t":"path","a":{"d":"M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"},"body":1},{"t":"path","a":{"d":"M12 6.5V20"},"on":1},{"t":"path","a":{"d":"M16 8.8v3.4M14.3 10.5h3.4"},"acc":1,"on":1,"tag":"pulse"}]},
  "blog": {"tr":"Blog","hover":["draw"],"parts":[{"t":"path","a":{"d":"M4 20l1-4.5L15.5 5a2 2 0 0 1 2.9 0l.6.6a2 2 0 0 1 0 2.9L8.5 19z"},"body":1},{"t":"path","a":{"d":"M13.5 7l3.5 3.5"},"on":1},{"t":"path","a":{"d":"M13 20h7"},"acc":1,"tag":"draw"}]},
  "hekimkart": {"tr":"HekimKart","hover":["flip","shine"],"shine":1,"parts":[{"t":"rect","a":{"x":2.5,"y":6,"width":19,"height":12.5,"rx":2.5},"body":1},{"t":"rect","a":{"x":5.5,"y":9,"width":4,"height":3,"rx":0.8},"acc":1},{"t":"path","a":{"d":"M5.5 15.3h6"},"on":1},{"t":"path","a":{"d":"M15 15.3h3.5"},"on":1}]},
  "notification": {"tr":"Bildirim","hover":["wiggle"],"tap":"bounce","origin":"50% 10%","parts":[{"t":"path","a":{"d":"M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"},"body":1},{"t":"path","a":{"d":"M10 20.8a2 2 0 0 0 4 0"}},{"t":"circle","a":{"cx":18,"cy":5.5,"r":2.3},"acc":1,"dot":1,"tag":"pulse"}]},
  "user-account": {"tr":"Hesabım","hover":["bounce"],"parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"circle","a":{"cx":12,"cy":10,"r":3},"on":1},{"t":"path","a":{"d":"M6.6 18.3a6.5 6.5 0 0 1 10.8 0"},"on":1}]},
  "settings": {"tr":"Ayarlar","hover":["spin"],"parts":[{"t":"path","a":{"d":"M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"}},{"t":"circle","a":{"cx":12,"cy":12,"r":6},"body":1},{"t":"circle","a":{"cx":12,"cy":12,"r":2.4},"acc":1,"on":1}]},
  "success": {"tr":"Başarılı","tone":"success","hover":["draw"],"parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M8.5 12.2l2.4 2.4 4.6-4.8"},"on":1,"tag":"draw"}]},
  "warning": {"tr":"Uyarı","tone":"warning","hover":["wiggle"],"parts":[{"t":"path","a":{"d":"M10.3 4.5a2 2 0 0 1 3.4 0l7 12a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3z"},"body":1},{"t":"path","a":{"d":"M12 9.5v4"},"on":1},{"t":"circle","a":{"cx":12,"cy":16.6,"r":0.9},"dot":1,"on":1}]},
  "info": {"tr":"Bilgi","tone":"info","hover":["bounce"],"parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M12 11v5.5"},"on":1},{"t":"circle","a":{"cx":12,"cy":7.8,"r":0.9},"dot":1,"on":1}]},
  "open-now": {"tr":"Şimdi Açık","tone":"teal","hover":["pulse"],"idle":"ring","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":7},"tag":"ring"},{"t":"circle","a":{"cx":12,"cy":12,"r":3.2},"dot":1,"tag":"pulse"}]},
  "closed": {"tr":"Kapalı","tone":"muted","hover":["bounce"],"parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M12 7.5V12l3 2"},"on":1}]},
};
