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
    rating: 0,
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
    rating: 0,
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
  {
    id: "3",
    title: "22 Wellesley St E (Wellesley on the Park) · Modern 1BR City View",
    titleZh: "22 Wellesley St E（Wellesley on the Park）· 现代1卧城市景观",
    titleFr: "22 Wellesley St E (Wellesley on the Park) · Moderne 1 chambre vue sur la ville",
    location: "22 Wellesley St E, Unit 1607, Toronto, ON",
    price: 3500,
    priceUnit: "month",
    rating: 0,
    reviewCount: 0,
    images: [
      "/images/wellesley-1607-living.jpg",
      "/images/wellesley-1607-bedroom.jpg",
      "/images/wellesley-1607-kitchen.jpg",
      "/images/wellesley-1607-bath.jpg",
      "/images/wellesley-1607-3.jpg",
      "/images/wellesley-1607-4.jpg",
      "/images/wellesley-1607-5.jpg"
    ],
    maxGuests: 2,
    area: 550,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Utilities included", "Full kitchen", "Smart lock self check-in", "Pool", "Gym", "Party room"],
    featured: true,
    description: "Tiered pricing: Monthly $3,500 / Quarterly $3,200 / Annual $2,800. 1BR/1BA on 16th floor with stunning city views. Fully furnished with designer decor including signature slat wall feature, crystal dining chandelier, and modern black/white/grey palette. Full kitchen with granite countertops, stainless steel appliances, and mosaic backsplash. Floor-to-ceiling windows, queen bed, mirrored closet doors. All-inclusive: WiFi, hydro/water/gas/heating, full kitchenware, linens/towels. Building amenities: pool, gym, party room. Walk to Wellesley subway station (Line 1). Near TMU/Ryerson University and Allan Gardens. Minimum stay 30 days.",
    descriptionZh: "阶梯定价：月租 $3,500 / 季租 $3,200 / 年租 $2,800。1室1卫，16层城市景观。全屋精装家具：标志性木栅格背景墙、水晶餐厅吊灯、现代黑白灰色调。花岗岩台面开放式厨房、不锈钢电器、马赛克后挡板。落地窗采光极佳，Queen大床，镜面衣柜门。全包：WiFi、水电气暖、全套厨具、床品毛巾。楼宇配套：泳池、健身房、Party Room。步行可达Wellesley地铁站(1号线)。毗邻TMU/瑞尔森大学和Allan Gardens。最低入住30天。",
    descriptionFr: "Tarification par paliers : Mensuel 3 500 $ / Trimestriel 3 200 $ / Annuel 2 800 $. 1 chambre/1 salle de bain au 16e étage avec vue panoramique sur la ville. Entièrement meublé avec décor design incluant mur à lattes signature, lustre en cristal et palette moderne noir/blanc/gris. Cuisine complète avec comptoirs en granit, électroménagers inox et dosseret en mosaïque. Fenêtres du sol au plafond, lit queen, portes de placard miroir. Tout inclus : WiFi, services publics, cuisine équipée, draps/serviettes. Commodités : piscine, gym, salle de réception. À pied du métro Wellesley (ligne 1). Proche de TMU/Ryerson et Allan Gardens. Séjour minimum 30 jours.",
    minNights: 30,
    monthlyDiscount: 10,
  },
];

export const getPropertyById = (id: string): Property | undefined => {
  return mockProperties.find((property) => property.id === id);
};

export const getFeaturedProperties = (): Property[] => {
  return mockProperties.filter((property) => property.featured);
};
