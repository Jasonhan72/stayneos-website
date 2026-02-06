// Property Map Component - Mapbox Integration
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Star, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area: number;
  featured?: boolean;
  // Map coordinates (mock data - should come from real geocoding)
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (id: string) => void;
}

// Mock coordinates for Toronto area properties
// In production, these should come from geocoding the actual addresses
const getMockCoordinates = (propertyId: string): { lat: number; lng: number } => {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    '1': { lat: 43.6532, lng: -79.3832 }, // Downtown Toronto
    '2': { lat: 43.6487, lng: -79.3790 }, // Financial District
  };
  
  // Generate pseudo-random coordinates for properties without specific coords
  if (!coordinates[propertyId]) {
    const baseLat = 43.65;
    const baseLng = -79.38;
    const idNum = parseInt(propertyId) || 0;
    return {
      lat: baseLat + (idNum * 0.01) + (Math.random() * 0.02 - 0.01),
      lng: baseLng + (idNum * 0.01) + (Math.random() * 0.02 - 0.01),
    };
  }
  
  return coordinates[propertyId];
};

export default function PropertyMap({ 
  properties, 
  selectedPropertyId,
  onPropertySelect 
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [popupProperty, setPopupProperty] = useState<Property | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import mapboxgl to avoid SSR issues
    const initMap = async () => {
      const mapboxgl = await import('mapbox-gl');
      
      // Import CSS dynamically
      // @ts-expect-error CSS imports don't have types
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      if (!mapContainer.current || map.current) return;

      // Use a demo token - in production, use environment variable
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2w5Z3J6Y3N4MDZydjN1b2VqdnR1a3Q4ZyJ9.demo';
      
      mapboxgl.default.accessToken = mapboxToken;

      // Calculate center from properties or use default
      const center = properties.length > 0 
        ? getMockCoordinates(properties[0].id)
        : { lat: 43.6532, lng: -79.3832 };

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [center.lng, center.lat],
        zoom: 12,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/update markers when properties change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!map.current || !mapLoaded) return;
      
      const mapboxgl = await import('mapbox-gl');
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      properties.forEach((property) => {
        const coords = getMockCoordinates(property.id);
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.innerHTML = `
          <div class="marker-content ${selectedPropertyId === property.id ? 'selected' : ''}"
               style="
                 background: ${selectedPropertyId === property.id ? '#003B5C' : '#C9A962'};
                 color: white;
                 padding: 6px 12px;
                 border-radius: 0;
                 font-weight: 600;
                 font-size: 13px;
                 box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                 cursor: pointer;
                 transition: all 0.2s;
                 white-space: nowrap;
                 border: 2px solid white;
               "
               onmouseover="this.style.transform='scale(1.05)';this.style.zIndex='10'"
               onmouseout="this.style.transform='scale(1)';this.style.zIndex='1'"
          >
            $${property.price}
          </div>
        `;

        if (!map.current) return;
        
        const marker = new mapboxgl.default.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map.current);

        // Add click handler
        el.addEventListener('click', () => {
          onPropertySelect?.(property.id);
          setPopupProperty(property);
          map.current?.flyTo({
            center: [coords.lng, coords.lat],
            zoom: 14,
          });
        });

        markersRef.current.push(marker);
      });

      // Fit bounds if multiple properties
      if (properties.length > 1) {
        const bounds = new mapboxgl.default.LngLatBounds();
        properties.forEach((property) => {
          const coords = getMockCoordinates(property.id);
          bounds.extend([coords.lng, coords.lat]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 13,
        });
      }
    };

    updateMarkers();
  }, [properties, mapLoaded, selectedPropertyId, onPropertySelect]);

  // Fly to selected property
  useEffect(() => {
    if (!map.current || !selectedPropertyId) return;
    
    const property = properties.find(p => p.id === selectedPropertyId);
    if (property) {
      const coords = getMockCoordinates(property.id);
      map.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 15,
      });
      setPopupProperty(property);
    }
  }, [selectedPropertyId, properties]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <div className="text-neutral-400">地图加载中...⏳</div>
        </div>
      )}

      {/* Property Popup */}
      {popupProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
          <div className="bg-white shadow-xl border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setPopupProperty(null)}
              className="absolute top-2 right-2 z-10 p-1 bg-white/90 hover:bg-white transition-colors"
            >
              <X size={16} />
            </button>
            
            <Link href={`/property/${popupProperty.id}`}>
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={popupProperty.images[0]}
                  alt={popupProperty.title}
                  fill
                  className="object-cover"
                />
                {popupProperty.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-xs font-medium">
                    精选
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-neutral-900 line-clamp-1">
                    {popupProperty.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-sm">{popupProperty.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-neutral-500 text-sm mb-3">
                  <MapPin size={12} />
                  <span className="truncate">{popupProperty.location}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-neutral-600 mb-3">
                  <span>{popupProperty.bedrooms}室</span>
                  <span>·</span>
                  <span>{popupProperty.area}m²</span>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-neutral-900">
                    ${popupProperty.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-500">/{popupProperty.priceUnit}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 shadow-lg border border-neutral-200 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-accent border-2 border-white shadow"></div>
          <span>可预订</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary border-2 border-white shadow"></div>
          <span>已选中</span>
        </div>
      </div>
    </div>
  );
}
