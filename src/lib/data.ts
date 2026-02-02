import { Property } from "@/components/property/PropertyCard";

// 真实房源数据
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Cooper St 豪华湖景公寓",
    location: "5811-55 Cooper St, Toronto, ON M5E 0G1",
    price: 680,
    priceUnit: "晚",
    rating: 4.9,
    reviewCount: 42,
    images: [
      "/images/cooper-55-dining.jpg",
      "/images/cooper-55-c5e8357d.jpg",
      "/images/cooper-55-e98a880d.jpg",
      "/images/cooper-55-a12c07ee.jpg",
      "/images/cooper-55-c38824ec.jpg",
      "/images/cooper-55-e62f3e96.jpg",
      "/images/cooper-55-b16f7ae9.jpg",
      "/images/cooper-55-b734cd4b.jpg",
      "/images/cooper-55-cff56997.jpg",
      "/images/cooper-55-15c489d2.jpg",
      "/images/cooper-55-7a4fc63b.jpg",
      "/images/toronto-apt-1.jpg",
    ],
    maxGuests: 4,
    area: 95,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "空调", "洗衣机", "厨房", "湖景", "停车位", "24小时安保"],
    featured: true,
    description: "位于多伦多市中心核心地段，享有安大略湖壮丽景色。现代化设计的豪华公寓，距离Distillery District仅几步之遥，步行可达湖滨步道。配备高端家具和设施，主卧和次卧均可欣赏湖景。",
    minNights: 28,
    monthlyDiscount: 20,
  },
  {
    id: "2",
    title: "Simcoe St 高层精品公寓",
    location: "3709-238 Simcoe St, Toronto, ON M5S 1T4",
    price: 450,
    priceUnit: "晚",
    rating: 4.8,
    reviewCount: 38,
    images: [
      "/images/simcoe-238-living.jpg",
      "/images/simcoe-238-kitchen.jpg",
      "/images/simcoe-238-1.jpg",
      "/images/simcoe-238-bath1.jpg",
      "/images/simcoe-238-bath2.jpg",
    ],
    maxGuests: 2,
    area: 75,
    bedrooms: 1,
    bathrooms: 2,
    amenities: ["WiFi", "空调", "洗衣机", "厨房", "高层景观", "24小时安保", "双卫生间", "浴缸"],
    featured: true,
    description: "位于多伦多市中心的高层公寓，享有城市天际线美景。现代化装修，步行可达多伦多大学、皇家博物馆和各大商业区。配备双卫生间，主卧带独立卫浴。",
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
