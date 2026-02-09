import { Property } from "@/components/property/PropertyCard";

// Real property data with multilingual support
export const mockProperties: Property[] = [
  {
    id: "1",
    // English (default)
    title: "Cooper St Luxury Lakeview Apartment",
    // Chinese
    titleZh: "Cooper St 豪华湖景公寓",
    // French
    titleFr: "Appartement de luxe avec vue sur le lac Cooper St",
    
    location: "55 Cooper St, Toronto, ON M5E 0G1",
    price: 680,
    priceUnit: "晚",
    rating: 4.9,
    reviewCount: 42,
    images: [
      "/images/cooper-55-c5e8357d.jpg",
      "/images/cooper-55-e98a880d.jpg",
      "/images/cooper-55-a12c07ee.jpg",
      "/images/cooper-55-c38824ec.jpg",
      "/images/cooper-55-e62f3e96.jpg",
    ],
    maxGuests: 6,
    area: 111,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["WiFi", "空调", "洗衣机", "厨房", "湖景", "停车位", "24小时安保"],
    featured: true,
    // English description (default)
    description: "Located in the heart of downtown Toronto with stunning views of Lake Ontario. This modern luxury apartment features 3 bedrooms and 3 bathrooms in a spacious 1,200 sq ft space. Just steps from the Distillery District and walking distance to the waterfront trail. Equipped with high-end furniture and amenities.",
    // Chinese description
    descriptionZh: "位于多伦多市中心核心地段，享有安大略湖壮丽景色。现代化设计的豪华公寓，3室3卫，1200平方英尺宽敞空间，距离Distillery District仅几步之遥，步行可达湖滨步道。配备高端家具和设施。",
    // French description
    descriptionFr: "Situé au cœur du centre-ville de Toronto avec une vue imprenable sur le lac Ontario. Cet appartement de luxe moderne comprend 3 chambres et 3 salles de bains dans un espace spacieux de 1 200 pieds carrés. À quelques pas du Distillery District et à distance de marche de la promenade en bord de mer. Équipé de meubles et d'équipements haut de gamme.",
    minNights: 28,
    monthlyDiscount: 20,
  },
  {
    id: "2",
    // English (default)
    title: "Simcoe St High-rise Boutique Apartment",
    // Chinese
    titleZh: "Simcoe St 高层精品公寓",
    // French
    titleFr: "Appartement boutique en haute altitude Simcoe St",

    location: "238 Simcoe St, Toronto, ON M5S 1T4",
    price: 450,
    priceUnit: "晚",
    rating: 4.8,
    reviewCount: 38,
    images: [
      "/images/simcoe-238-living.jpg",
      "/images/simcoe-238-kitchen.jpg",
      "/images/simcoe-238-1.jpg",
      "/images/simcoe-238-bath1.jpg",
    ],
    maxGuests: 5,
    area: 102,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "空调", "洗衣机", "厨房", "高层景观", "24小时安保", "浴缸"],
    featured: true,
    // English description (default)
    description: "A high-rise apartment in downtown Toronto offering beautiful city skyline views. Modern decor with 3 bedrooms and 2 bathrooms in a spacious 1,100 sq ft space. Walking distance to University of Toronto, Royal Ontario Museum, and major business districts.",
    // Chinese description
    descriptionZh: "位于多伦多市中心的高层公寓，享有城市天际线美景。现代化装修，3室2卫，1100平方英尺宽敞空间，步行可达多伦多大学、皇家博物馆和各大商业区。",
    // French description
    descriptionFr: "Un appartement en haute altitude au centre-ville de Toronto offrant une belle vue sur la ligne d'horizon de la ville. Décor moderne avec 3 chambres et 2 salles de bains dans un espace spacieux de 1 100 pieds carrés. À distance de marche de l'Université de Toronto, du Musée royal de l'Ontario et des principaux quartiers d'affaires.",
    minNights: 28,
    monthlyDiscount: 20,
  },
];

export const getPropertyById = (id: string): Property | undefined => {
  return mockProperties.find((property) => property.id === id);
};

export const getFeaturedProperties = (): Property[] => {
  return mockProperties.filter((property) => property.featured);
};
