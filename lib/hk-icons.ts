// Hekimhane ikon seti — tasarım kaynağı: "Healthcare identity system" (hk-icons.js).
// 24px ızgara, 1.5px çizgi, yuvarlak uç ve birleşim. Bu dosya ÜRETİLMİŞTİR; elle düzenleme.
// İstemci ve sunucuda ortak kullanılır — sunucu importu koyma.

export interface HkIkonParca {
  t: 'path' | 'circle' | 'rect';
  a: Record<string, string | number>;
  acc?: 1; body?: 1; dot?: 1; on?: 1; bgfill?: 1; fillAcc?: 1;
  tag?: 'morph' | 'hideOnActive';
}
export interface HkIkon { tr: string; tone?: 'success' | 'warning' | 'info' | 'teal' | 'muted'; parts: HkIkonParca[] }

export const HK_TONLAR = {"success":"#2E8A5F","warning":"#C4721A","error":"#C2413A","info":"#2F6FBF","teal":"#149E9B","muted":"#8B93A1"} as const;

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
  "search": {"tr":"Ara","parts":[{"t":"circle","a":{"cx":10.5,"cy":10.5,"r":6.5},"body":1},{"t":"path","a":{"d":"M15.4 15.4 20 20"}},{"t":"path","a":{"d":"M7.7 9.3a3.2 3.2 0 0 1 2.4-2"},"acc":1}]},
  "location-pin": {"tr":"Konum","parts":[{"t":"path","a":{"d":"M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z"},"body":1},{"t":"circle","a":{"cx":12,"cy":9.8,"r":2.4},"acc":1}]},
  "nearby-map": {"tr":"Yakınımda","parts":[{"t":"path","a":{"d":"M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"},"body":1},{"t":"path","a":{"d":"M9 4.5v13M15 6.5v13"},"on":1},{"t":"circle","a":{"cx":15,"cy":11,"r":1.7},"acc":1,"dot":1}]},
  "filter": {"tr":"Filtrele","parts":[{"t":"path","a":{"d":"M4 7h16M4 12h16M4 17h16"}},{"t":"circle","a":{"cx":9,"cy":7,"r":2},"body":1,"bgfill":1},{"t":"circle","a":{"cx":15,"cy":12,"r":2},"acc":1,"body":1,"bgfill":1},{"t":"circle","a":{"cx":8,"cy":17,"r":2},"body":1,"bgfill":1}]},
  "city": {"tr":"Şehir","parts":[{"t":"path","a":{"d":"M3.5 20.5h17"}},{"t":"path","a":{"d":"M5.5 20.5V10l5-2.5v13"},"body":1},{"t":"path","a":{"d":"M10.5 20.5V4.5l8 3v13"},"body":1},{"t":"circle","a":{"cx":8,"cy":13.5,"r":0.9},"acc":1,"dot":1},{"t":"path","a":{"d":"M13.5 10.5h2"},"on":1},{"t":"path","a":{"d":"M13.5 14h2"},"on":1}]},
  "compare": {"tr":"Karşılaştır","parts":[{"t":"rect","a":{"x":3.5,"y":5,"width":6.5,"height":14,"rx":2},"body":1},{"t":"rect","a":{"x":14,"y":5,"width":6.5,"height":14,"rx":2},"body":1},{"t":"path","a":{"d":"M12 3v18"},"acc":1}]},
  "favorite": {"tr":"Favori","parts":[{"t":"path","a":{"d":"M12 19.6s-7.6-4.5-7.6-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.6 2.6c0 5.5-7.6 10-7.6 10z"},"body":1,"fillAcc":1}]},
  "share": {"tr":"Paylaş","parts":[{"t":"path","a":{"d":"M8.5 9.5H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5"}},{"t":"path","a":{"d":"M12 14V3.5"}},{"t":"path","a":{"d":"M8.5 7 12 3.5 15.5 7"},"acc":1}]},
  "family-medicine": {"tr":"Aile Hekimliği","parts":[{"t":"circle","a":{"cx":9,"cy":7,"r":2.8},"body":1},{"t":"path","a":{"d":"M3.5 19.5a5.5 5.5 0 0 1 11 0"},"body":1},{"t":"circle","a":{"cx":17.5,"cy":10.5,"r":2.1},"acc":1,"body":1},{"t":"path","a":{"d":"M14.8 19.5a2.7 2.7 0 0 1 5.4 0"},"body":1}]},
  "internal-medicine": {"tr":"Dahiliye","parts":[{"t":"path","a":{"d":"M5.5 3.5h1.4M14.1 3.5h1.4"}},{"t":"path","a":{"d":"M6.2 3.5v5a4.3 4.3 0 0 0 8.6 0v-5"}},{"t":"path","a":{"d":"M10.5 12.8v2.7a4 4 0 0 0 8 0v-2"}},{"t":"circle","a":{"cx":18.5,"cy":11.5,"r":2},"acc":1,"body":1}]},
  "cardiology": {"tr":"Kardiyoloji","parts":[{"t":"path","a":{"d":"M12 19.6s-7.6-4.5-7.6-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.6 2.6c0 5.5-7.6 10-7.6 10z"},"body":1},{"t":"path","a":{"d":"M5 12h3.2l1.6-2.8 2.4 5.2 1.9-4 1.2 1.6H19"},"acc":1,"on":1}]},
  "neurology": {"tr":"Nöroloji","parts":[{"t":"path","a":{"d":"M12 5.6A3.4 3.4 0 0 0 5.8 7.3 3.4 3.4 0 0 0 4.6 13a3.4 3.4 0 0 0 3 5.6A3 3 0 0 0 12 19.5z"},"body":1},{"t":"path","a":{"d":"M12 5.6A3.4 3.4 0 0 1 18.2 7.3 3.4 3.4 0 0 1 19.4 13a3.4 3.4 0 0 1-3 5.6A3 3 0 0 1 12 19.5z"},"body":1},{"t":"path","a":{"d":"M8 11.5h1.8M14.2 13.5H16"},"on":1},{"t":"path","a":{"d":"M12 6v13"},"acc":1,"on":1}]},
  "pediatrics": {"tr":"Çocuk Sağlığı","parts":[{"t":"circle","a":{"cx":12,"cy":13,"r":7.5},"body":1},{"t":"path","a":{"d":"M12 5.5c0-1.6 1.6-2.4 2.8-1.6"}},{"t":"circle","a":{"cx":9.3,"cy":12,"r":0.9},"dot":1,"on":1},{"t":"circle","a":{"cx":14.7,"cy":12,"r":0.9},"dot":1,"on":1},{"t":"path","a":{"d":"M9.6 15.4a3 3 0 0 0 4.8 0"},"acc":1}]},
  "gynecology-obstetrics": {"tr":"Kadın Hastalıkları ve Doğum","parts":[{"t":"circle","a":{"cx":12,"cy":9,"r":5.5},"body":1},{"t":"path","a":{"d":"M12 14.5V21M9 18h6"}},{"t":"circle","a":{"cx":12,"cy":9,"r":1.8},"acc":1,"dot":1}]},
  "orthopedics": {"tr":"Ortopedi","parts":[{"t":"path","a":{"d":"M8.43 10.8H15.57A2 2 0 1 1 17.4 12 2 2 0 1 1 15.57 13.2H8.43A2 2 0 1 1 6.6 12 2 2 0 1 1 8.43 10.8Z","transform":"rotate(-45 12 12)"},"body":1},{"t":"path","a":{"d":"M10.5 12h3","transform":"rotate(-45 12 12)"},"acc":1,"on":1}]},
  "ophthalmology": {"tr":"Göz Hastalıkları","parts":[{"t":"path","a":{"d":"M2.5 12C4.5 8 8 5.5 12 5.5s7.5 2.5 9.5 6.5c-2 4-5.5 6.5-9.5 6.5S4.5 16 2.5 12z"},"body":1},{"t":"circle","a":{"cx":12,"cy":12,"r":3},"on":1},{"t":"circle","a":{"cx":12,"cy":12,"r":1.1},"acc":1,"dot":1}]},
  "ent": {"tr":"Kulak Burun Boğaz","parts":[{"t":"path","a":{"d":"M8 9a5 5 0 0 1 10 0c0 2.6-1.5 3.7-2.7 4.8-1 .9-1.3 1.8-1.3 3.2a3 3 0 0 1-5.6 1.5"}},{"t":"path","a":{"d":"M10.8 9.3a2.2 2.2 0 0 1 4.4 0c0 1.2-1 1.6-1.6 2.4"}},{"t":"path","a":{"d":"M5 7.5a7 7 0 0 0 0 6"},"acc":1}]},
  "dermatology": {"tr":"Dermatoloji","parts":[{"t":"path","a":{"d":"M3.5 8c2.1-1.6 3.6-1.6 5.7 0s3.6 1.6 5.7 0 3.6-1.6 5.6 0"}},{"t":"path","a":{"d":"M3.5 13h17"}},{"t":"path","a":{"d":"M3.5 18h17"}},{"t":"circle","a":{"cx":8,"cy":15.5,"r":1},"acc":1,"dot":1},{"t":"circle","a":{"cx":15.5,"cy":10.5,"r":1},"dot":1}]},
  "urology": {"tr":"Üroloji","parts":[{"t":"path","a":{"d":"M14 5.2c-3.9-1.6-8.5 1-8.5 6.8s4.6 8.4 8.5 6.8c1.8-.8 2.1-2.9 1-4.4-.8-1.1-.8-2.3 0-3.4 1.1-1.5.8-3.9-1-5.8z"},"body":1},{"t":"path","a":{"d":"M15.5 12h1.5a2 2 0 0 1 2 2v6.5"},"acc":1}]},
  "general-surgery": {"tr":"Genel Cerrahi","parts":[{"t":"path","a":{"d":"M4.5 19.5l8-8"}},{"t":"path","a":{"d":"M12.5 11.5l6.1-6.1a1.6 1.6 0 0 1 2.3 2.2c-1.6 3.8-4.3 6.3-7 6.9z"},"acc":1,"body":1}]},
  "oncology": {"tr":"Onkoloji","parts":[{"t":"path","a":{"d":"M9 21l6.3-9c1.6-2.3 2-4 1.3-5.6A3.3 3.3 0 0 0 12 4.6a3.3 3.3 0 0 0-4.6 1.8c-.7 1.6-.3 3.3 1.3 5.6L15 21"}},{"t":"circle","a":{"cx":12,"cy":8,"r":0.9},"acc":1,"dot":1}]},
  "endocrinology": {"tr":"Endokrinoloji","parts":[{"t":"path","a":{"d":"M11 7.5c-3 0-5 3-5 7 0 2.5 1.2 4.5 3 4.5 1.5 0 2-1.5 2-3.5z"},"body":1},{"t":"path","a":{"d":"M13 7.5c3 0 5 3 5 7 0 2.5-1.2 4.5-3 4.5-1.5 0-2-1.5-2-3.5z"},"body":1},{"t":"path","a":{"d":"M11 13.5h2"}},{"t":"circle","a":{"cx":12,"cy":4.2,"r":1.2},"acc":1,"dot":1}]},
  "pulmonology": {"tr":"Göğüs Hastalıkları","parts":[{"t":"path","a":{"d":"M12 3.5v8"}},{"t":"path","a":{"d":"M12 11.5l-2.5 2M12 11.5l2.5 2"},"acc":1},{"t":"path","a":{"d":"M9.5 7.5C6.3 7.5 3.5 12 3.5 17c0 2 1 3 2.5 3 2 0 4-1.2 4-3.5V8.5a1 1 0 0 0-.5-1z"},"body":1},{"t":"path","a":{"d":"M14.5 7.5c3.2 0 6 4.5 6 9.5 0 2-1 3-2.5 3-2 0-4-1.2-4-3.5V8.5a1 1 0 0 1 .5-1z"},"body":1}]},
  "gastroenterology": {"tr":"Gastroenteroloji","parts":[{"t":"path","a":{"d":"M10 3.5V7a3 3 0 0 1-1.5 2.6C6 11 4.5 12.8 4.5 15.5a5 5 0 0 0 9 3c1.3-1.7 2.5-2.5 4.5-2.5a2.5 2.5 0 0 0 2.5-2.5V11a4.5 4.5 0 0 0-8-2.8"}},{"t":"path","a":{"d":"M18 16v4.5"},"acc":1}]},
  "physical-medicine-rehabilitation": {"tr":"Fiziksel Tıp ve Rehabilitasyon","parts":[{"t":"circle","a":{"cx":10.5,"cy":4.6,"r":1.9},"body":1},{"t":"path","a":{"d":"M10.5 7.5V13H16l2.2 5.5"}},{"t":"path","a":{"d":"M7.5 11.2a5 5 0 1 0 7.3 6.3"},"acc":1}]},
  "physiotherapy": {"tr":"Fizyoterapi","parts":[{"t":"circle","a":{"cx":14.5,"cy":4.5,"r":1.9},"body":1},{"t":"path","a":{"d":"M7.5 20.5l3-5.5 3 2.2v3.8"}},{"t":"path","a":{"d":"M10.5 15l2.3-6.5 3.5 3.2 3 .3"}},{"t":"path","a":{"d":"M12.8 8.5 9 9.8l-1.8 3"}},{"t":"path","a":{"d":"M3.5 10H6"},"acc":1},{"t":"path","a":{"d":"M2.5 13.5H5"},"acc":1}]},
  "psychiatry": {"tr":"Psikiyatri","parts":[{"t":"path","a":{"d":"M14.5 20.5v-3h2a2 2 0 0 0 2-2V13l1.6-.6-1.6-3.2A7 7 0 1 0 8 15.5v5"}},{"t":"path","a":{"d":"M10 9.8a2.2 2.2 0 1 1 2.6 2.2c-.4.1-.6.4-.6.8v.9"},"acc":1}]},
  "psychology": {"tr":"Psikoloji","parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"path","a":{"d":"M12 13.8s-3.2-1.9-3.2-4.2A1.7 1.7 0 0 1 12 8.8a1.7 1.7 0 0 1 3.2.8c0 2.3-3.2 4.2-3.2 4.2z"},"acc":1,"on":1}]},
  "dentistry": {"tr":"Diş Hekimliği","parts":[{"t":"path","a":{"d":"M8 4C5.6 4 4.5 5.8 4.5 8c0 2.8 1.4 4.3 1.9 7.2.4 2.7.9 4.8 2.2 4.8 1.6 0 1.4-5 3.4-5s1.8 5 3.4 5c1.3 0 1.8-2.1 2.2-4.8.5-2.9 1.9-4.4 1.9-7.2 0-2.2-1.1-4-3.5-4-1.9 0-2.6 1-4 1S9.9 4 8 4z"},"body":1},{"t":"path","a":{"d":"M8.3 7.4c1.1.4 2.1.4 3.4-.1"},"acc":1,"on":1}]},
  "nutrition-dietetics": {"tr":"Beslenme ve Diyet","parts":[{"t":"path","a":{"d":"M12 7.5c-1.5-1-5.5-1.5-7 2-1.4 3.4.5 8.2 2.5 9.8 1.5 1.2 3 .7 4.5 0 1.5.7 3 1.2 4.5 0 2-1.6 3.9-6.4 2.5-9.8-1.5-3.5-5.5-3-7-2z"},"body":1},{"t":"path","a":{"d":"M12 7.5c0-1.5.5-3 2-4"}},{"t":"path","a":{"d":"M12.6 5.6c1.5-1.8 3.5-2 4.5-1.5-.4 1.4-2 2.8-4.5 1.5z"},"acc":1,"body":1}]},
  "hospital": {"tr":"Hastane","parts":[{"t":"path","a":{"d":"M7 20.5v-16h10v16"},"body":1},{"t":"path","a":{"d":"M3.5 20.5V11H7M20.5 20.5V11H17"}},{"t":"path","a":{"d":"M2.5 20.5h19"}},{"t":"path","a":{"d":"M12 7.5v4M10 9.5h4"},"acc":1,"on":1},{"t":"path","a":{"d":"M10.5 20.5V17h3v3.5"},"on":1}]},
  "clinic": {"tr":"Klinik","parts":[{"t":"path","a":{"d":"M4.5 20.5v-10L12 5l7.5 5.5v10"},"body":1},{"t":"path","a":{"d":"M3 20.5h18"}},{"t":"path","a":{"d":"M12 10.2v4.6M9.7 12.5h4.6"},"acc":1,"on":1}]},
  "private-practice": {"tr":"Muayenehane","parts":[{"t":"path","a":{"d":"M6 20.5v-16a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"},"body":1},{"t":"path","a":{"d":"M3.5 20.5h17"}},{"t":"path","a":{"d":"M9 7.5h6"},"on":1},{"t":"circle","a":{"cx":15,"cy":13,"r":1},"acc":1,"dot":1}]},
  "pharmacy": {"tr":"Eczane","parts":[{"t":"rect","a":{"x":4,"y":4,"width":16,"height":16,"rx":4.5},"body":1},{"t":"path","a":{"d":"M12 8.5v7M8.5 12h7"},"acc":1,"on":1}]},
  "on-duty-pharmacy": {"tr":"Nöbetçi Eczane","parts":[{"t":"path","a":{"d":"M15 6.07A8 8 0 1 0 18.73 15.07 6.5 6.5 0 0 1 15 6.07z"},"body":1},{"t":"path","a":{"d":"M18.5 3.5v4M16.5 5.5h4"},"acc":1}]},
  "laboratory": {"tr":"Laboratuvar","parts":[{"t":"path","a":{"d":"M9.5 3.5h5"}},{"t":"path","a":{"d":"M10.5 3.5v5.3L5.3 17.5a2 2 0 0 0 1.7 3h10a2 2 0 0 0 1.7-3l-5.2-8.7V3.5"},"body":1},{"t":"path","a":{"d":"M7.4 15h9.2"},"acc":1,"on":1},{"t":"circle","a":{"cx":11,"cy":12.3,"r":0.8},"dot":1,"on":1},{"t":"circle","a":{"cx":13.2,"cy":10.6,"r":0.7},"dot":1,"on":1}]},
  "emergency": {"tr":"Acil","parts":[{"t":"path","a":{"d":"M6.5 18v-5a5.5 5.5 0 0 1 11 0v5"},"body":1},{"t":"rect","a":{"x":4.5,"y":18,"width":15,"height":2.5,"rx":1.2},"body":1},{"t":"path","a":{"d":"M12 2.5v1.8"},"acc":1},{"t":"path","a":{"d":"M5.2 5.3l1.3 1.3"},"acc":1},{"t":"path","a":{"d":"M18.8 5.3l-1.3 1.3"},"acc":1},{"t":"path","a":{"d":"M12 11.5v3.5"},"on":1}]},
  "appointment": {"tr":"Randevu","parts":[{"t":"rect","a":{"x":3.5,"y":5,"width":17,"height":15.5,"rx":3},"body":1},{"t":"path","a":{"d":"M3.5 10h17"},"on":1},{"t":"path","a":{"d":"M8 3v4M16 3v4"}},{"t":"circle","a":{"cx":8.5,"cy":14.5,"r":0.9},"dot":1,"on":1,"tag":"hideOnActive"},{"t":"circle","a":{"cx":12,"cy":14.5,"r":0.9},"dot":1,"on":1,"tag":"hideOnActive"},{"t":"circle","a":{"cx":15.5,"cy":14.5,"r":0.9},"acc":1,"dot":1,"tag":"hideOnActive"},{"t":"path","a":{"d":"M9 15.2l2 2 4-4"},"acc":1,"tag":"morph"}]},
  "doctor-profile": {"tr":"Hekim Profili","parts":[{"t":"circle","a":{"cx":12,"cy":7.5,"r":3.5},"body":1},{"t":"path","a":{"d":"M5 20.5a7 7 0 0 1 14 0"},"body":1},{"t":"path","a":{"d":"M15 15.5v3M13.5 17h3"},"acc":1,"on":1}]},
  "verified": {"tr":"Onaylı Hekim","parts":[{"t":"path","a":{"d":"M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6z"},"body":1},{"t":"path","a":{"d":"M8.8 12.2l2.2 2.2 4.3-4.6"},"acc":1,"on":1}]},
  "premium": {"tr":"Pro Üyelik","parts":[{"t":"path","a":{"d":"M4.5 17 3.5 8l4.8 3.6L12 5.5l3.7 6.1L20.5 8l-1 9z"},"acc":1,"body":1},{"t":"path","a":{"d":"M5.5 20h13"},"acc":1}]},
  "star-rating": {"tr":"Puan","parts":[{"t":"path","a":{"d":"M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"},"body":1,"fillAcc":1}]},
  "review": {"tr":"Yorum","parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"path","a":{"d":"M7.5 9h9"},"on":1},{"t":"path","a":{"d":"M7.5 12.5h5.5"},"acc":1,"on":1}]},
  "phone": {"tr":"Telefon","parts":[{"t":"path","a":{"d":"M7 3.5h2.4l1.4 3.8-2 1.5a10.5 10.5 0 0 0 6.4 6.4l1.5-2 3.8 1.4V17a2 2 0 0 1-2 2.2A15.5 15.5 0 0 1 4.8 5.6 2 2 0 0 1 7 3.5z"},"body":1},{"t":"path","a":{"d":"M14.5 7a2.5 2.5 0 0 1 2.5 2.5"},"acc":1},{"t":"path","a":{"d":"M14.5 3.5a6 6 0 0 1 6 6"},"acc":1}]},
  "message": {"tr":"Mesaj","parts":[{"t":"path","a":{"d":"M6 4.5h12A2.5 2.5 0 0 1 20.5 7v7.5A2.5 2.5 0 0 1 18 17h-7l-4.5 3.5V17H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"},"body":1},{"t":"circle","a":{"cx":8.5,"cy":10.8,"r":1},"dot":1,"on":1},{"t":"circle","a":{"cx":12,"cy":10.8,"r":1},"dot":1,"on":1},{"t":"circle","a":{"cx":15.5,"cy":10.8,"r":1},"acc":1,"dot":1}]},
  "price-guide": {"tr":"Fiyat Rehberi","parts":[{"t":"path","a":{"d":"M3.5 12.4V5A1.5 1.5 0 0 1 5 3.5h7.4l8.1 8.1a1.5 1.5 0 0 1 0 2.1l-6.8 6.8a1.5 1.5 0 0 1-2.1 0z"},"body":1},{"t":"circle","a":{"cx":8,"cy":8,"r":1.6},"acc":1}]},
  "health-info": {"tr":"Sağlık Rehberi","parts":[{"t":"path","a":{"d":"M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"},"body":1},{"t":"path","a":{"d":"M12 6.5V20"},"on":1},{"t":"path","a":{"d":"M16 8.8v3.4M14.3 10.5h3.4"},"acc":1,"on":1}]},
  "blog": {"tr":"Blog","parts":[{"t":"path","a":{"d":"M4 20l1-4.5L15.5 5a2 2 0 0 1 2.9 0l.6.6a2 2 0 0 1 0 2.9L8.5 19z"},"body":1},{"t":"path","a":{"d":"M13.5 7l3.5 3.5"},"on":1},{"t":"path","a":{"d":"M13 20h7"},"acc":1}]},
  "hekimkart": {"tr":"HekimKart","parts":[{"t":"rect","a":{"x":2.5,"y":6,"width":19,"height":12.5,"rx":2.5},"body":1},{"t":"rect","a":{"x":5.5,"y":9,"width":4,"height":3,"rx":0.8},"acc":1},{"t":"path","a":{"d":"M5.5 15.3h6"},"on":1},{"t":"path","a":{"d":"M15 15.3h3.5"},"on":1}]},
  "notification": {"tr":"Bildirim","parts":[{"t":"path","a":{"d":"M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"},"body":1},{"t":"path","a":{"d":"M10 20.8a2 2 0 0 0 4 0"}},{"t":"circle","a":{"cx":18,"cy":5.5,"r":2.3},"acc":1,"dot":1}]},
  "user-account": {"tr":"Hesabım","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"circle","a":{"cx":12,"cy":10,"r":3},"on":1},{"t":"path","a":{"d":"M6.6 18.3a6.5 6.5 0 0 1 10.8 0"},"on":1}]},
  "settings": {"tr":"Ayarlar","parts":[{"t":"path","a":{"d":"M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"}},{"t":"circle","a":{"cx":12,"cy":12,"r":6},"body":1},{"t":"circle","a":{"cx":12,"cy":12,"r":2.4},"acc":1,"on":1}]},
  "success": {"tr":"Başarılı","tone":"success","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M8.5 12.2l2.4 2.4 4.6-4.8"},"on":1}]},
  "warning": {"tr":"Uyarı","tone":"warning","parts":[{"t":"path","a":{"d":"M10.3 4.5a2 2 0 0 1 3.4 0l7 12a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3z"},"body":1},{"t":"path","a":{"d":"M12 9.5v4"},"on":1},{"t":"circle","a":{"cx":12,"cy":16.6,"r":0.9},"dot":1,"on":1}]},
  "info": {"tr":"Bilgi","tone":"info","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M12 11v5.5"},"on":1},{"t":"circle","a":{"cx":12,"cy":7.8,"r":0.9},"dot":1,"on":1}]},
  "open-now": {"tr":"Şimdi Açık","tone":"teal","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":7}},{"t":"circle","a":{"cx":12,"cy":12,"r":3.2},"dot":1}]},
  "closed": {"tr":"Kapalı","tone":"muted","parts":[{"t":"circle","a":{"cx":12,"cy":12,"r":8.5},"body":1},{"t":"path","a":{"d":"M12 7.5V12l3 2"},"on":1}]},
};
