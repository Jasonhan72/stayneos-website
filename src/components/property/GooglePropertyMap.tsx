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

  return (
    <div className="w-full h-full relative">
      {/* Google Maps Embed - Full height, no overlays */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=-79.5%2C43.6%2C-79.3%2C43.72&layer=mapnik&marker=43.66%2C-79.4`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        className="absolute inset-0"
        title="房源地图"
      />
    </div>
  );
}
