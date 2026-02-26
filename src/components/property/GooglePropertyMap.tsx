// Google Maps Component for Properties Page
// Shows all properties with red markers

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
  properties 
}: GooglePropertyMapProps) {
  
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
    <div className="w-full h-full relative">
      {/* Google Maps Embed - Full height, no overlays */}
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
    </div>
  );
}
