'use client';

import { useEffect, useRef } from 'react';

export interface Marker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tel?: string | null;
  href: string;
  type?: string | null;
  nobetci?: boolean;
  il?: string | null;
  ilce?: string | null;
}

interface Props {
  markers: Marker[];
  color?: string;
}

declare global {
  interface Window { L: any; }
}

function normTR(s: string): string {
  return s
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
    .replace(/Ş/g, 's').replace(/ş/g, 's')
    .replace(/Ç/g, 'c').replace(/ç/g, 'c')
    .replace(/Ö/g, 'o').replace(/ö/g, 'o')
    .replace(/Ü/g, 'u').replace(/ü/g, 'u')
    .toLowerCase().trim();
}

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function choroColor(count: number, max: number, rgb: [number,number,number]): string {
  if (count === 0) return 'rgba(240,242,245,0.85)';
  const ratio = Math.sqrt(count / Math.max(max, 1));
  const opacity = 0.12 + ratio * 0.55;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity.toFixed(2)})`;
}

function spreadCoords(markers: Marker[]): Marker[] {
  const GRID = 3;
  const bucket: Record<string, Marker[]> = {};
  markers.forEach(m => {
    const key = `${m.lat.toFixed(GRID)},${m.lng.toFixed(GRID)}`;
    if (!bucket[key]) bucket[key] = [];
    bucket[key].push(m);
  });
  return markers.map(m => {
    const key = `${m.lat.toFixed(GRID)},${m.lng.toFixed(GRID)}`;
    const group = bucket[key];
    if (group.length <= 1) return m;
    const idx = group.indexOf(m);
    if (idx === 0) return m;
    const ring = Math.floor(idx / 8);
    const pos  = idx % 8;
    const r    = 0.0003 + ring * 0.00025;
    const a    = (pos / 8) * Math.PI * 2;
    return { ...m, lat: m.lat + Math.sin(a)*r, lng: m.lng + Math.cos(a)*r };
  });
}

function getPropName(props: any): string {
  return props?.name || props?.NAME_1 || props?.il_adi || props?.province || '';
}

const PROVINCE_URL = 'https://cdn.jsdelivr.net/gh/cihadturhan/tr-geojson@master/geo/tr-cities-utf8.json';
let provinceCache: any = null;

export default function ListMap({ markers, color = '#1B3A69' }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);

  const valid = markers.filter(m =>
    m.lat && m.lng && m.lat !== 0 && m.lng !== 0 &&
    m.lat > 35 && m.lat < 43 && m.lng > 25 && m.lng < 45
  );

  useEffect(() => {
    if (!mapRef.current || valid.length === 0) return;

    async function buildMap() {
      const L = window.L;
      if (!L || !mapRef.current) return;

      if (mapObjRef.current) {
        try { mapObjRef.current.remove(); } catch (_) {}
        mapObjRef.current = null;
      }

      // İl bazlı sayım
      const ilCount: Record<string, number> = {};
      valid.forEach(m => {
        if (m.il) { const k = normTR(m.il); ilCount[k] = (ilCount[k]||0) + 1; }
      });
      const ilMax = Math.max(...Object.values(ilCount), 1);
      const rgb   = hexToRGB(color);

      const map = L.map(mapRef.current, { scrollWheelZoom: false, zoomControl: true });
      mapObjRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19, opacity: 0.55,
      }).addTo(map);

      // ── İl Choropleth Katmanı ────────────────────────────────────
      try {
        if (!provinceCache) {
          const r = await fetch(PROVINCE_URL, { cache: 'force-cache' });
          if (r.ok) provinceCache = await r.json();
        }
        if (provinceCache) {
          L.geoJSON(provinceCache, {
            style: (feature: any) => {
              const ilAdi  = getPropName(feature?.properties);
              const count  = ilCount[normTR(ilAdi)] || 0;
              const active = count > 0;
              return {
                fillColor:   choroColor(count, ilMax, rgb),
                fillOpacity: 1,
                color:  active ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)` : 'rgba(180,185,195,0.5)',
                weight: active ? 1.5 : 0.8,
                opacity: 1,
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              const ilAdi = getPropName(feature?.properties);
              const count = ilCount[normTR(ilAdi)] || 0;
              const label = count > 0
                ? `<strong style="color:#1A2744">${ilAdi}</strong><br><span style="color:#6B7A99">${count} kayıt</span><br><span style="font-size:10px;color:${color};font-weight:600">↗ Yakınlaştırmak için tıklayın</span>`
                : `<strong style="color:#9CA3AF">${ilAdi}</strong><br><span style="color:#D1D5DB;font-size:10px">kayıt yok</span>`;
              layer.bindTooltip(
                `<div style="font-family:system-ui;font-size:12px;padding:4px 8px;line-height:1.6">${label}</div>`,
                { sticky: true, opacity: 0.97 }
              );
              layer.on('mouseover', () => {
                layer.setStyle({ weight: 2.5, color: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`, fillOpacity: count>0 ? 0.85 : 0.35 });
                if (count > 0 && mapRef.current) mapRef.current.style.cursor = 'pointer';
                layer.bringToFront();
              });
              layer.on('mouseout', () => {
                const c = ilCount[normTR(ilAdi)] || 0;
                layer.setStyle({
                  weight: c>0 ? 1.5 : 0.8,
                  color: c>0 ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)` : 'rgba(180,185,195,0.5)',
                  fillOpacity: 1,
                });
                if (mapRef.current) mapRef.current.style.cursor = '';
              });
              layer.on('click', () => {
                if (count === 0) return;
                try { map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 12 }); } catch (_) {}
              });
            },
          }).addTo(map);
        }
      } catch (e) { console.warn('İl sınırları yüklenemedi:', e); }

      // ── Pin İkonu ────────────────────────────────────────────────
      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>`,
        iconSize: [22,22], iconAnchor: [11,22], popupAnchor: [0,-26],
      });

      // ── Marker Cluster ────────────────────────────────────────────
      const useCluster = !!L.markerClusterGroup;
      const group = useCluster
        ? L.markerClusterGroup({
            maxClusterRadius: 60, showCoverageOnHover: false, zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster: any) => {
              const n = cluster.getChildCount();
              const size = n > 99 ? 46 : n > 9 ? 40 : 34;
              return L.divIcon({
                className: '',
                html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.3);line-height:${size-6}px;text-align:center;font-size:${n>99?11:13}px;font-weight:800;color:white;">${n}</div>`,
                iconSize: [size,size], iconAnchor: [size/2,size/2],
              });
            },
          })
        : null;

      const spread = spreadCoords(valid);
      const bounds: [number,number][] = [];

      spread.forEach(m => {
        bounds.push([m.lat, m.lng]);
        const popup = `
          <div style="font-family:system-ui,sans-serif;min-width:190px;padding:4px 2px">
            <div style="font-weight:700;font-size:13px;color:#1A2744;margin-bottom:4px;line-height:1.3">${m.name}</div>
            ${m.type    ? `<div style="font-size:11px;color:#6B7A99;margin-bottom:5px">${m.type}</div>` : ''}
            ${m.nobetci ? `<div style="font-size:11px;color:#DC2626;font-weight:700;margin-bottom:5px">🌙 Nöbetçi</div>` : ''}
            ${m.tel     ? `<a href="tel:${m.tel}" style="display:block;font-size:12px;color:#1B3A69;font-weight:600;margin-bottom:8px">📞 ${m.tel}</a>` : ''}
            <a href="${m.href}" style="display:inline-block;padding:6px 12px;background:${color};color:white;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none">Profili Gör →</a>
          </div>`;
        const pin = L.marker([m.lat, m.lng], { icon: pinIcon }).bindPopup(popup, { maxWidth: 240 });
        if (group) group.addLayer(pin);
        else pin.addTo(map);
      });
      if (group) map.addLayer(group);

      // ── Legend ────────────────────────────────────────────────────
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div');
        div.innerHTML = `
          <div style="background:rgba(255,255,255,.93);border:1px solid #E5E5EA;border-radius:8px;padding:7px 10px;font-family:system-ui;font-size:10px;color:#6E6E73">
            <div style="font-weight:700;color:#1A2744;margin-bottom:5px;font-size:11px">Yoğunluk</div>
            <div style="display:flex;gap:3px;align-items:center">
              ${[0.15,0.28,0.42,0.56,0.70].map(o =>
                `<div style="width:18px;height:12px;border-radius:3px;background:rgba(${rgb[0]},${rgb[1]},${rgb[2]},${o});border:1px solid rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)"></div>`
              ).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:9px"><span>Az</span><span>Çok</span></div>
          </div>`;
        return div;
      };
      legend.addTo(map);

      // ── Fit — Her zaman tüm Türkiye görünümüyle aç ───────────────
      try {
        map.fitBounds([[35.8, 25.7], [42.1, 44.8]], { padding: [10, 10] });
      } catch (_) {
        map.setView([39.0, 35.0], 6);
      }
    }

    function addCSS(id: string, href: string) {
      if (document.querySelector(`#${id}`)) return;
      const l = document.createElement('link'); l.id=id; l.rel='stylesheet'; l.href=href;
      document.head.appendChild(l);
    }
    function loadScript(id: string, src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`#${id}`)) { resolve(); return; }
        const s = document.createElement('script'); s.id=id; s.src=src; s.async=true;
        s.onload=()=>resolve(); s.onerror=()=>reject();
        document.head.appendChild(s);
      });
    }

    addCSS('leaflet-css',  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    addCSS('cluster-css1', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
    addCSS('cluster-css2', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css');

    (async () => {
      try {
        if (!window.L) await loadScript('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        if (!window.L?.markerClusterGroup) {
          try { await loadScript('cluster-js', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'); }
          catch { await loadScript('cluster-js-cdn', 'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.min.js'); }
        }
        await buildMap();
      } catch (e) { if (window.L) await buildMap(); }
    })();

    return () => {
      if (mapObjRef.current) { try { mapObjRef.current.remove(); } catch (_) {} mapObjRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  if (valid.length === 0) return null;

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: '4px' }}>
      <div style={{ padding: '10px 16px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        {valid.length} konum haritada gösteriliyor
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>İl yoğunluğu görünümü</span>
      </div>
      <div ref={mapRef} style={{ height: '420px', width: '100%' }} />
    </div>
  );
}
