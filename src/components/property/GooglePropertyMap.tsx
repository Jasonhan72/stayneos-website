'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
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
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
      Marker: new (opts: Record<string, unknown>) => { addListener: (event: string, cb: () => void) => void; setIcon: (icon: Record<string, unknown>) => void };
      LatLngBounds: new () => { extend: (pos: { lat: number; lng: number }) => void };
      InfoWindow: new (opts: Record<string, unknown>) => { open: (map: unknown, marker: unknown) => void; close: () => void };
      Size: new (w: number, h: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      event: { clearInstanceListeners: (obj: unknown) => void };
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
  const bg = selected ? '#111111' : '#ffffff';
  const fg = selected ? '#ffffff' : '#111111';
  const stroke = selected ? '#111111' : '#d4d4d4';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="38" viewBox="0 0 76 38"><rect x="1" y="1" width="74" height="30" rx="15" fill="${bg}" stroke="${stroke}" stroke-width="2"/><path d="M34 30l4 6 4-6" fill="${bg}"/><text x="38" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${fg}">${label}</text></svg>`;
  const win = window as GoogleMapsWindow;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new win.google!.maps.Size(76, 38),
    anchor: new win.google!.maps.Point(38, 36),
  };
}

export default function GooglePropertyMap({ properties, selectedPropertyId, hoveredPropertyId, onPropertySelect }: GooglePropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Array<{ id: string; marker: { setIcon: (icon: Record<string, unknown>) => void } }>>([]);
  const [mapError, setMapError] = useState('');
  const [isMobileCardOpen, setIsMobileCardOpen] = useState(true);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) || properties[0],
    [properties, selectedPropertyId]
  );

  useEffect(() => {
    let disposed = false;
    let map: unknown;
    let infoWindow: { open: (map: unknown, marker: unknown) => void; close: () => void } | null = null;

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
        map = new google.Map(mapRef.current, {
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
        const bounds = new google.LatLngBounds();
        infoWindow = new google.InfoWindow({ disableAutoPan: false });

        markersRef.current = properties.map((property, index) => {
          const position = coordFor(property, index);
          bounds.extend(position);
          const marker = new google.Marker({
            position,
            map,
            title: property.title,
            icon: markerIcon(false, priceFor(property)),
            zIndex: 10,
          });
          marker.addListener('click', () => {
            onPropertySelect(property.id);
            setIsMobileCardOpen(true);
            infoWindow?.open(map, marker);
          });
          return { id: property.id, marker };
        });

        if (properties.length > 1 && 'fitBounds' in (map as Record<string, unknown>)) {
          (map as { fitBounds: (bounds: unknown, padding: number) => void }).fitBounds(bounds, 64);
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
      infoWindow?.close();
    };
  }, [properties, onPropertySelect]);

  useEffect(() => {
    markersRef.current.forEach(({ id, marker }) => {
      const isSelected = id === selectedPropertyId;
      const isHovered = id === hoveredPropertyId && !isSelected;
      if (isHovered) {
        marker.setIcon(markerIcon(true, priceFor(properties.find((p) => p.id === id) || {} as Property)));
      } else {
        marker.setIcon(markerIcon(isSelected, priceFor(properties.find((p) => p.id === id) || {} as Property)));
      }
    });
  }, [selectedPropertyId, hoveredPropertyId, properties]);

  if (properties.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
        <div className="text-neutral-500">No properties to show on map</div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100" data-testid="properties-map">
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
                onClick={() => {
                  onPropertySelect(property.id);
                  setIsMobileCardOpen(true);
                }}
                className={cn(
                  'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-sm font-bold shadow-lg transition-transform hover:scale-105',
                  selected ? 'bg-black text-white' : 'bg-white text-neutral-900 ring-1 ring-neutral-300'
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

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-30 lg:left-auto lg:right-4 lg:w-80">
          <button
            type="button"
            onClick={() => setIsMobileCardOpen((open) => !open)}
            className="mb-2 flex w-full items-center justify-between rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg lg:hidden"
          >
            Selected stay
            {isMobileCardOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <div className={cn('rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/10', !isMobileCardOpen && 'hidden lg:block')}>
            <div className="flex gap-3">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                <Image src={selectedProperty.images?.[0] || '/images/cooper-55-c5e8357d.jpg'} alt={selectedProperty.title} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{selectedProperty.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500"><MapPin size={12} />{selectedProperty.location || selectedProperty.address}</p>
                <p className="mt-2 text-sm font-bold text-neutral-900">${priceFor(selectedProperty).toLocaleString()} / month</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
