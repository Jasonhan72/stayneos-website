// Google Maps Component for Properties Page
// Shows all properties with markers

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

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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

  const centerLocation = encodeURIComponent(properties[0]?.location || 'Downtown Toronto');
  
  return (
    <div className="w-full h-full relative">
      <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${centerLocation}&zoom=12`}
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
