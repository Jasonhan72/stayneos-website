import { Property } from "@/components/property/PropertyCard";

// Real property data with multilingual support
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite",
    titleZh: "55 Cooper St（Sugar Wharf）· 高层3卧景观套房",
    titleFr: "55 Cooper St (Sugar Wharf) · Suite premium 3 chambres",
    location: "55 Cooper St, Toronto, ON M5E 0G1",
    price: 12000,
    priceUnit: "month",
    rating: 4.9,
    reviewCount: 0,
    images: [
      "/images/cooper-55-c5e8357d.jpg",
      "/images/cooper-55-e98a880d.jpg",
      "/images/cooper-55-a12c07ee.jpg",
      "/images/cooper-55-c38824ec.jpg",
      "/images/cooper-55-e62f3e96.jpg"
    ],
    maxGuests: 6,
    area: 1273,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Utilities included", "Bi-weekly housekeeping", "Smart lock self check-in", "Pool", "Gym", "24h concierge", "Visitor parking", "Party room"],
    featured: true,
    description: "Tiered pricing: Monthly $8,000-10,000 / Quarterly (3-6 months) $7,500-9,000 / Annual (12 months) $6,500-8,000. 3BR/2BA, approx. 1,200 sqft on 55+ floors. Fully inclusive: WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities. Building amenities include pool, gym, 24h concierge, visitor parking, and party room. Walk to Union Station in 8 min and Financial District in 5 min. 30-day minimum stay with smart-lock self check-in. Developed by Menkes, completed in 2024.",
    descriptionZh: "阶梯定价：月租 $8,000-10,000 / 季租(3-6月) $7,500-9,000 / 年租(12月) $6,500-8,000。3室2卫，约1,200 sqft，55层以上。全包：WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、每两周保洁及楼宇设施使用。楼宇配套：泳池、健身房、24小时礼宾、访客停车、Party Room。步行至Union Station约8分钟、金融区约5分钟。最低入住30天，智能门锁自助入住。开发商Menkes，2024年建成。",
    descriptionFr: "Tarification par paliers : Mensuel 8 000-10 000 $ / Trimestriel (3-6 mois) 7 500-9 000 $ / Annuel (12 mois) 6 500-8 000 $. 3 chambres/2 salles de bain, env. 1 200 pi², étage 55+. Tout inclus : WiFi, services publics, câble de base, cuisine équipée, draps/serviettes, ménage bimensuel, accès aux commodités. Immeuble avec piscine, gym, concierge 24h, stationnement visiteurs et salle de réception. 8 min à pied d'Union Station, 5 min du quartier financier. Séjour minimum 30 jours, arrivée autonome par serrure intelligente. Développeur Menkes, livré en 2024.",
    minNights: 30,
    monthlyDiscount: 20,
  },
  {
    id: "2",
    title: "238 Simcoe St (Grange Park) · Executive 3BR Suite",
    titleZh: "238 Simcoe St（Grange Park）· 行政3卧套房",
    titleFr: "238 Simcoe St (Grange Park) · Suite exécutive 3 chambres",
    location: "238 Simcoe St, Toronto, ON M5T 0A2",
    price: 6500,
    priceUnit: "month",
    rating: 4.8,
    reviewCount: 0,
    images: [
      "/images/simcoe-238-living.jpg",
      "/images/simcoe-238-kitchen.jpg",
      "/images/simcoe-238-1.jpg",
      "/images/simcoe-238-bath1.jpg"
    ],
    maxGuests: 5,
    area: 1100,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Utilities included", "Bi-weekly housekeeping", "Smart lock self check-in", "Gym", "Lobby concierge", "Mail room"],
    featured: true,
    description: "Tiered pricing: Monthly $6,500-8,000 / Quarterly $6,000-7,000 / Annual $5,500-6,500. 3BR/2BA with all-inclusive utilities and services: WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities. Building amenities include gym, lobby concierge, and mail room. 3-minute walk to St. Patrick/Osgoode subway stations, and walkable to Toronto General, Mount Sinai, SickKids, and UofT. Minimum stay 30 days.",
    descriptionZh: "阶梯定价：月租 $6,500-8,000 / 季租 $6,000-7,000 / 年租 $5,500-6,500。3室2卫。全包服务：WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、每两周保洁及楼宇设施。楼宇配套：健身房、大堂礼宾、邮件室。步行3分钟可达St. Patrick/Osgoode地铁站，四大医院及UofT均可步行到达。最低入住30天。",
    descriptionFr: "Tarification par paliers : Mensuel 6 500-8 000 $ / Trimestriel 6 000-7 000 $ / Annuel 5 500-6 500 $. 3 chambres/2 salles de bain. Tout inclus : WiFi, services publics, câble de base, cuisine équipée, draps/serviettes, ménage bimensuel et commodités de l'immeuble. Commodités : gym, concierge du hall et salle du courrier. À 3 min à pied du métro St. Patrick/Osgoode, proche à pied des principaux hôpitaux et de l'UofT. Séjour minimum 30 jours.",
    minNights: 30,
    monthlyDiscount: 15,
  },
];

export const getPropertyById = (id: string): Property | undefined => {
  return mockProperties.find((property) => property.id === id);
};

export const getFeaturedProperties = (): Property[] => {
  return mockProperties.filter((property) => property.featured);
};
