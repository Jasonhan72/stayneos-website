'use client';
// v2 - brand markers + hover cards (2026-05-18)
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { GOOGLE_MAPS_API_KEY, hasUsableGoogleMapsKey } from '@/lib/google-maps';

interface Property {
  id: string;
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

type GoogleMapsWindow = Window & {
  gm_authFailure?: () => void;
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => {
        getProjection: () => { fromLatLngToContainerPixel: (pos: { lat: number; lng: number }) => { x: number; y: number } };
        getDiv: () => HTMLElement;
      };
      Marker: new (opts: Record<string, unknown>) => {
        addListener: (event: string, cb: () => void) => void;
        setIcon: (icon: Record<string, unknown>) => void;
        getPosition: () => { lat: () => number; lng: () => number };
        setZIndex: (z: number) => void;
      };
      LatLngBounds: new () => { extend: (pos: { lat: number; lng: number }) => void };
      Size: new (w: number, h: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      event: {
        clearInstanceListeners: (obj: unknown) => void;
        addListener: (instance: unknown, eventName: string, handler: () => void) => { remove: () => void };
        removeListener: (listener: { remove: () => void }) => void;
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

function markerIcon(selected: boolean, price: number) {
  const label = price ? `$${Math.round(price / 1000)}k` : 'NEOS';
  const PRIMARY = '#003B5C';
  const ACCENT = '#C9A962';
  const bg = selected ? PRIMARY : '#ffffff';
  const fg = selected ? '#ffffff' : PRIMARY;
  const stroke = selected ? PRIMARY : ACCENT;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="38" viewBox="0 0 76 38"><rect x="1" y="1" width="74" height="30" rx="15" fill="${bg}" stroke="${stroke}" stroke-width="2"/><path d="M34 30l4 6 4-6" fill="${bg}"/><text x="38" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${fg}">${label}</text></svg>`;
  const win = window as GoogleMapsWindow;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new win.google!.maps.Size(76, 38),
    anchor: new win.google!.maps.Point(38, 36),
  };
}

function propertyCardHTML(property: Property): string {
  const imageUrl = property.images?.[0] || '/images/cooper-55-c5e8357d.jpg';
  const location = property.location || property.address || '';
  const price = priceFor(property);
  return `
    <div style="display:flex;gap:12px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="width:72px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#e5e5e5;">
        <img src="${imageUrl}" alt="${property.title}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
      <div style="min-width:0;flex:1;">
        <p style="margin:0;font-size:13px;font-weight:600;line-height:1.3;color:#171717;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${property.title}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#737373;display:flex;align-items:center;gap:4px;">📍 ${location}</p>
        <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#171717;">$${price.toLocaleString()} / month</p>
      </div>
    </div>`;
}

export default function GooglePropertyMap({ properties, selectedPropertyId, hoveredPropertyId, onPropertySelect }: GooglePropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<Array<{
    id: string;
    marker: {
      setIcon: (icon: Record<string, unknown>) => void;
      getPosition: () => { lat: () => number; lng: () => number };
      setZIndex: (z: number) => void;
    };
  }>>([]);
  const [mapError, setMapError] = useState('');
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);

  const activeCardId = internalHoveredId || hoveredPropertyId || selectedPropertyId;
  const activeCardProperty = useMemo(
    () => (activeCardId ? properties.find((p) => p.id === activeCardId) : null),
    [properties, activeCardId]
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
        const bounds = new google.LatLngBounds();

        markersRef.current = properties.map((property, index) => {
          const position = coordFor(property, index);
          bounds.extend(position);
          const marker = new google.Marker({
            position,
            map,
            title: property.title,
            icon: markerIcon(false, priceFor(property)),
            // optimized:false prevents Google Maps from compositing the
            // icon into a shared canvas sprite-sheet. Without this,
            // setIcon() calls with a different SVG data URI are silently
            // ignored because the API reuses the cached canvas bitmap.
            optimized: false,
            zIndex: 10,
          });
          marker.addListener('click', () => { setInternalHoveredId(null); onPropertySelect(property.id); });
          marker.addListener('mouseover', () => setInternalHoveredId(property.id));
          marker.addListener('mouseout', () => setInternalHoveredId(null));
          return { id: property.id, marker };
        });

        if (properties.length > 1 && typeof (map as Record<string, unknown>).fitBounds === 'function') {
          (map as unknown as { fitBounds: (bounds: unknown, padding: number) => void }).fitBounds(bounds, 64);
        }
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
      markersRef.current.forEach(({ marker }) => win.google?.maps.event.clearInstanceListeners(marker));
      markersRef.current = [];
    };
  }, [properties, onPropertySelect]);

  // Keep marker icons in sync with selection / hover state.
  useEffect(() => {
    try {
      markersRef.current.forEach(({ id, marker }) => {
        const isSelected = id === selectedPropertyId;
        const isHovered = id === internalHoveredId || id === hoveredPropertyId && !isSelected;
        if (isHovered || isSelected) {
          marker.setIcon(markerIcon(true, priceFor(properties.find((p) => p.id === id) || {} as Property)));
          marker.setZIndex(20);
        } else {
          marker.setIcon(markerIcon(false, priceFor(properties.find((p) => p.id === id) || {} as Property)));
          marker.setZIndex(10);
        }
      });
    } catch {
      // Ignore icon update errors
    }
  }, [selectedPropertyId, hoveredPropertyId, internalHoveredId, properties]);

  // Show a floating card above the active marker (selected, hovered from sidebar, or hovered directly on map).
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const existing = document.getElementById('stayneos-map-infowindow');
    if (existing) existing.remove();

    if (!activeCardId || !activeCardProperty) return;

    const markerEntry = markersRef.current.find((m) => m.id === activeCardId);
    if (!markerEntry) return;

    try {
      const map = mapInstanceRef.current as {
        getProjection: () => { fromLatLngToContainerPixel: (pos: { lat: number; lng: number }) => { x: number; y: number } | null };
        getDiv: () => HTMLElement;
      };
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
      // Append to outer container (not map div) so the card isn't clipped by overflow-hidden
      if (containerRef.current) {
        containerRef.current.appendChild(card);
      } else {
        map.getDiv().appendChild(card);
      }

      // Re-position on map pan / zoom.
      const reposition = () => {
        try {
          const proj = map.getProjection();
          if (!proj) return;
          const p = proj.fromLatLngToContainerPixel({ lat: markerPos.lat(), lng: markerPos.lng() });
          if (!p) return;
          card.style.left = `${p.x}px`;
          card.style.top = `${p.y - 100}px`;
        } catch {
          // Ignore reposition errors during map transitions
        }
      };
      const google = (window as GoogleMapsWindow).google!;
      const idleListener = google.maps.event.addListener(
        map as unknown as Parameters<typeof google.maps.event.addListener>[0],
        'idle',
        reposition
      );
      const resizeObserver = new ResizeObserver(reposition);
      resizeObserver.observe(map.getDiv());

      return () => {
        card.remove();
        google.maps.event.removeListener(idleListener);
        resizeObserver.disconnect();
      };
    } catch {
      // Silently fail — avoids crashing the page if map projection isn't ready
    }
  }, [activeCardId, activeCardProperty]);

  if (properties.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
        <div className="text-neutral-500">No properties to show on map</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-[420px] overflow-visible rounded-2xl border border-neutral-200 bg-neutral-100" data-testid="properties-map">
      {/* Inner wrapper clips map corners while allowing the floating card to overflow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute left-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
          Map · {properties.length} furnished stays
        </div>

        <div ref={mapRef} className={cn("absolute inset-0", mapError && "hidden")} aria-label="Properties map" />

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
                    selected ? 'bg-[#003B5C] text-white' : 'bg-white text-[#003B5C] ring-1 ring-[#003B5C]'
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
      </div>
    </div>
  );
}
