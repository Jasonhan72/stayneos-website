'use client';
// v3 - red price markers + clustering + cluster card strip + fullscreen (2026-09-07)
import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { GOOGLE_MAPS_API_KEY, hasUsableGoogleMapsKey } from '@/lib/google-maps';
import { clusterPoints } from '@/lib/map/clustering';
import { priceLabelSvg, clusterSvg, svgDataUri } from '@/lib/map/marker-icons';
import { useFullscreen } from '@/hooks/useFullscreen';
import MapClusterCards from './MapClusterCards';

interface Property {
  id: string;
  slug?: string;
  title: string;
  location?: string;
  address?: string;
  price?: number;
  priceMonthly?: number;
  images?: string[];
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface GooglePropertyMapProps {
  properties: Property[];
  selectedPropertyId: string | null;
  hoveredPropertyId?: string | null;
  onPropertySelect: (id: string) => void;
}

type GoogleMapInstance = {
  getProjection: () => {
    fromLatLngToContainerPixel: (pos: { lat: number; lng: number }) => { x: number; y: number } | null;
  };
  getDiv: () => HTMLElement;
  addListener: (event: string, handler: () => void) => void;
  getZoom: () => number;
  fitBounds: (bounds: unknown, padding?: number) => void;
};

type GoogleMarkerInstance = {
  addListener: (event: string, cb: () => void) => void;
  setIcon: (icon: Record<string, unknown>) => void;
  getPosition: () => { lat: () => number; lng: () => number };
  setZIndex: (z: number) => void;
  setMap: (map: unknown | null) => void;
};

type GoogleMapsWindow = Window & {
  gm_authFailure?: () => void;
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapInstance;
      Marker: new (opts: Record<string, unknown>) => GoogleMarkerInstance;
      LatLngBounds: new () => { extend: (pos: { lat: number; lng: number }) => void };
      Size: new (w: number, h: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      ControlPosition: {
        RIGHT_CENTER: number;
        RIGHT_BOTTOM: number;
        BOTTOM_CENTER: number;
        BOTTOM_RIGHT: number;
        TOP_RIGHT: number;
      };
      event: {
        clearInstanceListeners: (obj: unknown) => void;
        addListener: (instance: unknown, eventName: string, handler: () => void) => { remove: () => void };
        removeListener: (listener: { remove: () => void }) => void;
        trigger: (instance: unknown, eventName: string) => void;
      };
    };
  };
};

const MAPS_KEY = GOOGLE_MAPS_API_KEY;
const SCRIPT_ID = 'stayneos-google-maps-js';

const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  '1': { lat: 43.64435, lng: -79.37531 }, // 55 Cooper St
  '2': { lat: 43.65343, lng: -79.39053 }, // 238 Simcoe St
  '3': { lat: 43.66507, lng: -79.38362 }, // 22 Wellesley St E
};

function loadGoogleMaps(): Promise<void> {
  if (!hasUsableGoogleMapsKey(MAPS_KEY)) return Promise.reject(new Error('Google Maps API key is not configured'));
  const win = window as GoogleMapsWindow;
  if (win.google?.maps) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

function priceFor(property: Property) {
  return Number(property.priceMonthly || property.price || 0);
}

function coordFor(property: Property, index: number) {
  return FALLBACK_COORDS[property.id] || { lat: 43.6532 + index * 0.006, lng: -79.3832 - index * 0.006 };
}

function iconObject(
  win: GoogleMapsWindow,
  svg: string,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number
): Record<string, unknown> {
  if (!win.google?.maps) {
    return { url: svgDataUri(svg) };
  }
  return {
    url: svgDataUri(svg),
    scaledSize: new win.google.maps.Size(width, height),
    anchor: new win.google.maps.Point(anchorX, anchorY),
  };
}

function priceLabelIcon(win: GoogleMapsWindow, selected: boolean, price: number): Record<string, unknown> {
  return iconObject(win, priceLabelSvg(selected, price), 76, 38, 38, 36);
}

function clusterMarkerIcon(win: GoogleMapsWindow, count: number): Record<string, unknown> {
  return iconObject(win, clusterSvg(count), 56, 56, 28, 28);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function propertyCardHTML(property: Property): string {
  const imageUrl = property.images?.[0] || '/images/cooper-55-c5e8357d.jpg';
  const location = escapeHtml(property.location || property.address || '');
  const title = escapeHtml(property.title || '');
  const price = priceFor(property);
  return `
    <div style="display:flex;gap:12px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="width:72px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#e5e5e5;">
        <img src="${escapeHtml(imageUrl)}" alt="${title}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
      <div style="min-width:0;flex:1;">
        <p style="margin:0;font-size:13px;font-weight:600;line-height:1.3;color:#171717;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${title}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#737373;display:flex;align-items:center;gap:4px;">📍 ${location}</p>
        <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#171717;">$${price.toLocaleString()} / month</p>
      </div>
    </div>`;
}

export default function GooglePropertyMap({ properties, selectedPropertyId, hoveredPropertyId, onPropertySelect }: GooglePropertyMapProps) {
  const { t } = useI18n();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<Array<{ id: string; marker: GoogleMarkerInstance }>>([]);
  const clusterMarkersRef = useRef<GoogleMarkerInstance[]>([]);
  const renderMarkersRef = useRef<() => void>(() => {});
  const activeStateRef = useRef<Record<string, boolean>>({});
  const [mapError, setMapError] = useState('');
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const [activeClusterIds, setActiveClusterIds] = useState<string[] | null>(null);

  // Keep a ref mirroring selection/hover state so the zoom listener can read
  // the latest values without re-registering listeners on every change.
  const selectionRef = useRef({ selectedPropertyId, hoveredPropertyId, internalHoveredId });
  selectionRef.current = { selectedPropertyId, hoveredPropertyId, internalHoveredId };

  // Floating in-map card only follows hover; clicks open the bottom card
  // strip instead (which is always fully visible inside the map viewport).
  const activeCardId = internalHoveredId || hoveredPropertyId;
  const activeCardProperty = useMemo(
    () => (activeCardId ? (properties.find((p) => p?.id === activeCardId) ?? null) : null),
    [properties, activeCardId]
  );
  const activeClusterProperties = useMemo(
    () => (activeClusterIds ? properties.filter((p) => activeClusterIds.includes(p.id)) : []),
    [properties, activeClusterIds]
  );

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!mapRef.current || properties.length === 0) return;
      const winWithAuthFailure = window as GoogleMapsWindow;
      winWithAuthFailure.gm_authFailure = () => {
        if (!disposed) setMapError('Google Maps API authentication failed');
      };

      try {
        await loadGoogleMaps();
        if (disposed || !mapRef.current) return;
        const win = window as GoogleMapsWindow;
        const google = win.google!.maps;
        const center = coordFor(properties[0], 0);
        const map = new google.Map(mapRef.current, {
          center,
          zoom: 13,
          disableDefaultUI: false,
          // Explicitly enable the zoom control (classic +/- buttons). Without
          // this the weekly renderer folds zoom into the camera-control popup
          // and leaves it visually collapsed.
          zoomControl: true,
          zoomControlOptions: { position: google.ControlPosition.RIGHT_BOTTOM },
          // Capture scroll/touch gestures so wheel & two-finger zoom always work
          // instead of scrolling the surrounding page.
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          ],
        });
        mapInstanceRef.current = map;

        const renderMarkers = () => {
          const mapInstance = mapInstanceRef.current;
          if (!mapInstance || !win.google?.maps) return;
          const { selectedPropertyId: sel, hoveredPropertyId: hov, internalHoveredId: hovInternal } = selectionRef.current;

          // Rebuild: reset the active-state cache so the icon-sync effect
          // below only touches markers whose state actually changes.
          activeStateRef.current = {};
          markersRef.current.forEach(({ marker }) => {
            try { marker.setMap(null); } catch { /* ignore */ }
          });
          markersRef.current = [];
          clusterMarkersRef.current.forEach((marker) => {
            try { marker.setMap(null); } catch { /* ignore */ }
          });
          clusterMarkersRef.current = [];

          const zoom = typeof mapInstance.getZoom === 'function' ? mapInstance.getZoom() : 13;
          const points = properties.map((property, index) => {
            const c = coordFor(property, index);
            return { id: property.id, lat: c.lat, lng: c.lng };
          });
          const clusters = clusterPoints(points, zoom);

          clusters.forEach((cluster) => {
            if (cluster.count > 1) {
              const marker = new google.Marker({
                position: { lat: cluster.lat, lng: cluster.lng },
                map: mapInstance,
                title: `${cluster.count} stays`,
                icon: clusterMarkerIcon(win, cluster.count),
                optimized: false,
                zIndex: 1000 + cluster.count,
              });
              marker.addListener('click', () => {
                setInternalHoveredId(null);
                setActiveClusterIds(cluster.pointIds);
              });
              clusterMarkersRef.current.push(marker);
              return;
            }

            const propertyId = cluster.pointIds[0];
            const property = properties.find((p) => p.id === propertyId);
            if (!property) return;
            const isSelected = propertyId === sel;
            const isHovered = propertyId === hovInternal || (propertyId === hov && !isSelected);
            activeStateRef.current[propertyId] = isSelected || isHovered;
            const marker = new google.Marker({
              position: { lat: cluster.lat, lng: cluster.lng },
              map: mapInstance,
              title: property.title,
              icon: priceLabelIcon(win, isSelected || isHovered, priceFor(property)),
              optimized: false,
              zIndex: isSelected || isHovered ? 20 : 10,
            });
            marker.addListener('click', () => {
              setInternalHoveredId(null);
              // Single marker click also opens the bottom card strip (Jason:
              // clicking a red price label should show the mini property card
              // at the bottom of the map, fully visible within the page).
              setActiveClusterIds([propertyId]);
              onPropertySelect(propertyId);
            });
            marker.addListener('mouseover', () => setInternalHoveredId(propertyId));
            marker.addListener('mouseout', () => setInternalHoveredId(null));
            markersRef.current.push({ id: propertyId, marker });
          });
        };
        renderMarkersRef.current = renderMarkers;

        // Close the cluster card strip when the user clicks empty map space.
        map.addListener('click', () => setActiveClusterIds(null));
        // Re-cluster whenever the map settles (zoom / pan).
        map.addListener('idle', renderMarkers);

        const bounds = new google.LatLngBounds();
        properties.forEach((property, index) => bounds.extend(coordFor(property, index)));
        if (properties.length > 1) {
          map.fitBounds(bounds, 64);
        }
        renderMarkers();
        setMapError('');
      } catch (error) {
        setMapError(error instanceof Error ? error.message : 'Map unavailable');
      }
    }

    initMap();
    return () => {
      disposed = true;
      const win = window as GoogleMapsWindow;
      if (win.gm_authFailure) win.gm_authFailure = undefined;
      markersRef.current.forEach(({ marker }) => {
        try { win.google?.maps.event.clearInstanceListeners(marker); } catch { /* ignore */ }
      });
      clusterMarkersRef.current.forEach((marker) => {
        try { win.google?.maps.event.clearInstanceListeners(marker); } catch { /* ignore */ }
      });
      markersRef.current = [];
      clusterMarkersRef.current = [];
    };
  }, [properties, onPropertySelect]);

  // Keep marker icons in sync with selection / hover state (no rebuild → no flicker on hover).
  useEffect(() => {
    try {
      const win = window as GoogleMapsWindow;
      if (!win.google?.maps) return;
      markersRef.current.forEach(({ id, marker }) => {
        const isSelected = id === selectedPropertyId;
        const isHovered = id === internalHoveredId || (id === hoveredPropertyId && !isSelected);
        const active = isSelected || isHovered;
        // Only touch markers whose active state actually changed. Calling
        // setIcon on an unchanged marker rebuilds its DOM node (optimized:false)
        // and produces the visible hover flicker.
        if (activeStateRef.current[id] === active) return;
        activeStateRef.current[id] = active;
        const property = properties.find((p) => p?.id === id);
        marker.setIcon(priceLabelIcon(win, active, priceFor(property || ({} as Property))));
        marker.setZIndex(active ? 20 : 10);
      });
    } catch {
      // Ignore icon update errors
    }
  }, [selectedPropertyId, hoveredPropertyId, internalHoveredId, properties]);

  // Close any open cluster card strip when the property list changes (filter/search).
  useEffect(() => {
    setActiveClusterIds(null);
  }, [properties]);

  // Trigger a map resize when entering/leaving fullscreen (container size changes).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const win = window as GoogleMapsWindow;
      if (win.google?.maps && mapInstanceRef.current) {
        try {
          win.google.maps.event.trigger(mapInstanceRef.current, 'resize');
          renderMarkersRef.current();
        } catch {
          // Ignore resize errors
        }
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [isFullscreen]);

  // Fullscreen: lift the map above the site chrome and lock background scroll.
  // The map is rendered inside a `position: sticky` panel (a stacking context),
  // so a plain z-index on our fixed container can't beat the header's z-50.
  // Raise the sticky panel's z-index while fullscreen and hide body overflow.
  useEffect(() => {
    const panel = containerRef.current?.parentElement;
    if (!panel) return;

    if (isFullscreen) {
      if (!('stayneosPrevZ' in panel.dataset)) {
        panel.dataset.stayneosPrevZ = panel.style.zIndex;
      }
      panel.style.zIndex = '10000';
      document.body.classList.add('stayneos-map-fullscreen');
    } else {
      panel.style.zIndex = panel.dataset.stayneosPrevZ || '';
      delete panel.dataset.stayneosPrevZ;
      document.body.classList.remove('stayneos-map-fullscreen');
    }

    return () => {
      document.body.classList.remove('stayneos-map-fullscreen');
      if (panel.dataset.stayneosPrevZ !== undefined) {
        panel.style.zIndex = panel.dataset.stayneosPrevZ;
        delete panel.dataset.stayneosPrevZ;
      }
    };
  }, [isFullscreen]);

  // Show a floating card above the active single marker (selected/hovered).
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const existing = document.getElementById('stayneos-map-infowindow');
    if (existing) existing.remove();

    if (!activeCardId || !activeCardProperty) return;

    const markerEntry = markersRef.current.find((m) => m.id === activeCardId);
    if (!markerEntry) return;

    try {
      const map = mapInstanceRef.current;
      const projection = map.getProjection();
      if (!projection) return;

      const markerPos = markerEntry.marker.getPosition();
      if (!markerPos) return;

      const pixel = projection.fromLatLngToContainerPixel({ lat: markerPos.lat(), lng: markerPos.lng() });
      if (!pixel) return;

      const card = document.createElement('div');
      card.id = 'stayneos-map-infowindow';
      card.style.cssText = `
        position: absolute;
        left: ${pixel.x}px;
        top: ${pixel.y - 100}px;
        transform: translate(-50%, -100%);
        z-index: 30;
        background: white;
        border-radius: 14px;
        padding: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.08);
        pointer-events: auto;
      `;
      card.innerHTML = propertyCardHTML(activeCardProperty);
      const host = containerRef.current || map.getDiv();
      host.appendChild(card);

      // Clamp the card inside the map viewport so it is always fully visible
      // (markers near the top/left/right edges used to push it off-screen).
      const place = (x: number, y: number) => {
        const hostRect = host.getBoundingClientRect();
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        const margin = 8;
        // Anchor uses translate(-50%, -100%): left is the card's center X,
        // top is the card's bottom Y.
        const minLeft = margin + w / 2;
        const maxLeft = Math.max(minLeft, hostRect.width - margin - w / 2);
        const minTop = margin + h;
        const maxTop = Math.max(minTop, hostRect.height - margin);
        card.style.left = `${Math.min(Math.max(x, minLeft), maxLeft)}px`;
        card.style.top = `${Math.min(Math.max(y - 100, minTop), maxTop)}px`;
      };
      place(pixel.x, pixel.y);

      const reposition = () => {
        try {
          const proj = map.getProjection();
          if (!proj) return;
          const p = proj.fromLatLngToContainerPixel({ lat: markerPos.lat(), lng: markerPos.lng() });
          if (!p) return;
          place(p.x, p.y);
        } catch {
          // Ignore reposition errors during map transitions
        }
      };
      const winG = (window as GoogleMapsWindow).google;
      if (!winG) return;
      const idleListener = winG.maps.event.addListener(
        map as unknown as Parameters<typeof winG.maps.event.addListener>[0],
        'idle',
        reposition
      );
      const resizeObserver = new ResizeObserver(reposition);
      resizeObserver.observe(map.getDiv());

      return () => {
        card.remove();
        try { winG.maps.event.removeListener(idleListener); } catch { /* ignore */ }
        resizeObserver.disconnect();
      };
    } catch {
      // Silently fail — avoids crashing the page if map projection isn't ready
    }
  }, [activeCardId, activeCardProperty]);

  if (properties.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
        <div className="text-neutral-500">{t("property.mapNoProperties", "No properties to show on map")}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full min-h-[420px] overflow-visible rounded-2xl border border-neutral-200 bg-neutral-100',
        isFullscreen && 'fixed inset-0 z-[999] h-screen w-screen rounded-none border-0'
      )}
      data-testid="properties-map"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
          Map · {properties.length} furnished stays
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t('property.mapExitFullscreen', 'Exit fullscreen') : t('property.mapFullscreen', 'Fullscreen')}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition hover:bg-neutral-100"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <div ref={mapRef} className={cn('absolute inset-0', mapError && 'hidden')} aria-label={t('property.mapTitle', 'Properties map')} />

        {mapError && (
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,#e5e7eb_0,#e5e7eb_2px,transparent_3px),linear-gradient(135deg,#f5f5f4,#e7e5e4)]">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,#d4d4d4_1px,transparent_1px),linear-gradient(#d4d4d4_1px,transparent_1px)] [background-size:48px_48px]" />
            {properties.map((property, index) => {
              const selected = property.id === selectedPropertyId;
              const top = 28 + (index % 3) * 20;
              const left = 28 + (index % 4) * 18;
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => onPropertySelect(property.id)}
                  className={cn(
                    'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-sm font-bold shadow-lg transition-transform hover:scale-105',
                    selected ? 'bg-[#991B1B] text-white' : 'bg-[#DC2626] text-white'
                  )}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  aria-label={`Select ${property.title} on map`}
                >
                  ${Math.round(priceFor(property) / 1000)}k
                </button>
              );
            })}
            <div className="absolute left-4 right-4 top-16 rounded-xl bg-white/90 p-3 text-sm text-neutral-600 shadow">
              Google Maps could not load ({mapError}); showing fallback property pins.
            </div>
          </div>
        )}

        <MapClusterCards
          properties={activeClusterProperties}
          count={activeClusterIds?.length}
          onSelect={(id) => onPropertySelect(id)}
          onClose={() => setActiveClusterIds(null)}
        />
      </div>
    </div>
  );
}
