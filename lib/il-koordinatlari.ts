/**
 * Türkiye 81 il merkezi koordinatları.
 * Koordinatsız işletmeler için fallback olarak kullanılır.
 */
export const IL_KONUM: Record<string, { lat: number; lng: number }> = {
  'Adana':           { lat: 37.000, lng: 35.321 },
  'Adıyaman':        { lat: 37.764, lng: 38.276 },
  'Afyonkarahisar':  { lat: 38.757, lng: 30.540 },
  'Ağrı':            { lat: 39.719, lng: 43.051 },
  'Aksaray':         { lat: 38.374, lng: 34.036 },
  'Amasya':          { lat: 40.649, lng: 35.833 },
  'Ankara':          { lat: 39.920, lng: 32.854 },
  'Antalya':         { lat: 36.897, lng: 30.713 },
  'Ardahan':         { lat: 41.111, lng: 42.702 },
  'Artvin':          { lat: 41.182, lng: 41.818 },
  'Aydın':           { lat: 37.856, lng: 27.845 },
  'Balıkesir':       { lat: 39.649, lng: 27.887 },
  'Bartın':          { lat: 41.635, lng: 32.337 },
  'Batman':          { lat: 37.883, lng: 41.132 },
  'Bayburt':         { lat: 40.255, lng: 40.224 },
  'Bilecik':         { lat: 40.151, lng: 29.979 },
  'Bingöl':          { lat: 38.885, lng: 40.498 },
  'Bitlis':          { lat: 38.401, lng: 42.124 },
  'Bolu':            { lat: 40.739, lng: 31.606 },
  'Burdur':          { lat: 37.720, lng: 30.290 },
  'Bursa':           { lat: 40.182, lng: 29.061 },
  'Çanakkale':       { lat: 40.155, lng: 26.414 },
  'Çankırı':         { lat: 40.600, lng: 33.616 },
  'Çorum':           { lat: 40.550, lng: 34.955 },
  'Denizli':         { lat: 37.774, lng: 29.086 },
  'Diyarbakır':      { lat: 37.925, lng: 40.218 },
  'Düzce':           { lat: 40.844, lng: 31.157 },
  'Edirne':          { lat: 41.677, lng: 26.556 },
  'Elazığ':          { lat: 38.681, lng: 39.226 },
  'Erzincan':        { lat: 39.750, lng: 39.496 },
  'Erzurum':         { lat: 39.905, lng: 41.270 },
  'Eskişehir':       { lat: 39.776, lng: 30.520 },
  'Gaziantep':       { lat: 37.066, lng: 37.383 },
  'Giresun':         { lat: 40.912, lng: 38.389 },
  'Gümüşhane':       { lat: 40.460, lng: 39.481 },
  'Hakkari':         { lat: 37.574, lng: 43.741 },
  'Hatay':           { lat: 36.402, lng: 36.349 },
  'Iğdır':           { lat: 39.919, lng: 44.045 },
  'Isparta':         { lat: 37.764, lng: 30.556 },
  'İstanbul':        { lat: 41.015, lng: 28.980 },
  'İzmir':           { lat: 38.423, lng: 27.143 },
  'Kahramanmaraş':   { lat: 37.585, lng: 36.937 },
  'Karabük':         { lat: 41.200, lng: 32.627 },
  'Karaman':         { lat: 37.181, lng: 33.215 },
  'Kars':            { lat: 40.608, lng: 43.095 },
  'Kastamonu':       { lat: 41.376, lng: 33.776 },
  'Kayseri':         { lat: 38.732, lng: 35.487 },
  'Kırıkkale':       { lat: 39.847, lng: 33.515 },
  'Kırklareli':      { lat: 41.735, lng: 27.225 },
  'Kırşehir':        { lat: 39.145, lng: 34.170 },
  'Kilis':           { lat: 36.718, lng: 37.120 },
  'Kocaeli':         { lat: 40.855, lng: 29.881 },
  'Konya':           { lat: 37.874, lng: 32.493 },
  'Kütahya':         { lat: 39.424, lng: 29.984 },
  'Malatya':         { lat: 38.356, lng: 38.309 },
  'Manisa':          { lat: 38.614, lng: 27.426 },
  'Mardin':          { lat: 37.313, lng: 40.743 },
  'Mersin':          { lat: 36.812, lng: 34.641 },
  'Muğla':           { lat: 37.215, lng: 28.363 },
  'Muş':             { lat: 38.744, lng: 41.507 },
  'Nevşehir':        { lat: 38.625, lng: 34.714 },
  'Niğde':           { lat: 37.966, lng: 34.679 },
  'Ordu':            { lat: 40.984, lng: 37.878 },
  'Osmaniye':        { lat: 37.074, lng: 36.246 },
  'Rize':            { lat: 41.021, lng: 40.523 },
  'Sakarya':         { lat: 40.782, lng: 30.404 },
  'Samsun':          { lat: 41.286, lng: 36.330 },
  'Şanlıurfa':       { lat: 37.159, lng: 38.796 },
  'Şırnak':          { lat: 37.518, lng: 42.462 },
  'Siirt':           { lat: 37.927, lng: 41.946 },
  'Sinop':           { lat: 42.023, lng: 35.153 },
  'Sivas':           { lat: 39.748, lng: 37.016 },
  'Tekirdağ':        { lat: 40.978, lng: 27.515 },
  'Tokat':           { lat: 40.314, lng: 36.554 },
  'Trabzon':         { lat: 41.003, lng: 39.716 },
  'Tunceli':         { lat: 39.108, lng: 39.548 },
  'Uşak':            { lat: 38.682, lng: 29.408 },
  'Van':             { lat: 38.494, lng: 43.383 },
  'Yalova':          { lat: 40.655, lng: 29.266 },
  'Yozgat':          { lat: 39.818, lng: 34.808 },
  'Zonguldak':       { lat: 41.456, lng: 31.798 },
};

/**
 * Verilen lat/lng geçerliyse döndürür,
 * yoksa il merkezini ± küçük deterministik offset ile döndürür.
 * (Aynı şehirdeki işletmelerin haritada üst üste gelmesini önler)
 */
export function resolveKonum(
  lat: number | null | undefined,
  lng: number | null | undefined,
  il: string | null | undefined,
  id: string,
): { lat: number; lng: number } | null {
  const hasReal = lat && lng && Math.abs(lat) > 0.1 && Math.abs(lng) > 0.1;
  if (hasReal) return { lat: lat!, lng: lng! };

  const fallback = IL_KONUM[il || ''];
  if (!fallback) return null;

  // Deterministik jitter — ID'den türetilir, her yüklemede sabit kalır
  const h = id.split('').reduce((a, c) => (Math.imul(31, a) + c.charCodeAt(0)) | 0, 0);
  const jLat = ((Math.abs(h)         % 200) - 100) / 5000; // ±0.02°  ≈ ±2 km
  const jLng = ((Math.abs(h >> 8)    % 200) - 100) / 5000;

  return { lat: fallback.lat + jLat, lng: fallback.lng + jLng };
}
