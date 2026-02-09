// Google Maps Component for Properties Page
// Shows all properties with red markers

import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  rating: number;
  bedrooms: number;
  bathrooms: number;
}

interface GooglePropertyMapProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onPropertySelect: (id: string) => void;
}

export default function GooglePropertyMap({ 
  properties, 
  selectedPropertyId,
  onPropertySelect 
}: GooglePropertyMapProps) {
  
  // Alternative: Use Google Maps Embed API with multiple markers
  // Since static markers don't work well with embed, we'll show a single map
  // and list properties below
  
  if (properties.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-400">暂无房源数据</div>
      </div>
    );
  }

  // Calculate map center based on all properties (using first one for now)
  const centerLocation = encodeURIComponent(properties[0]?.location || 'Toronto, ON');
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Google Maps Embed */}
      <div className="flex-1 relative">
        <iframe
          src={`https://maps.google.com/maps?q=${centerLocation}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
          title="房源地图"
        />
        
        {/* Custom Property Markers Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 shadow-lg rounded-lg max-h-[200px] overflow-y-auto">
          <h4 className="font-semibold text-neutral-900 mb-3">
            该区域的 {properties.length} 个房源
          </h4>
          <div className="space-y-2">
            {properties.slice(0, 5).map((property, index) => (
              <div 
                key={property.id}
                onClick={() => onPropertySelect(property.id)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedPropertyId === property.id 
                    ? 'bg-primary-50 border border-primary' 
                    : 'hover:bg-neutral-50'
                }`}
              >
                {/* Marker Number */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedPropertyId === property.id 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </div>
                
                {/* Property Thumbnail */}
                <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Property Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {property.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    ${property.price}/晚 · {property.bedrooms}室{property.bathrooms}卫
                  </p>
                </div>
              </div>
            ))}
            {properties.length > 5 && (
              <p className="text-xs text-neutral-400 text-center pt-2">
                还有 {properties.length - 5} 个房源...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
