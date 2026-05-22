-- Seed remote D1 with 3 properties

INSERT INTO Property (id, title, titleZh, titleFr, slug, status, createdBy, address, neighborhood, city, propertyType, bedrooms, bathrooms, sqft, description, descriptionZh, descriptionFr, priceMonthly, priceQuarterly, priceAnnual, currency, includedAmenities, buildingAmenities, minStayDays, checkInTime, checkOutTime, selfCheckIn, images, heroImage, metaTitle, metaDescription, createdAt, updatedAt)
VALUES (
  '1',
  'Luxury 3BR Lakeview Suite at 55 Cooper St',
  '55 Cooper St 豪华湖景三居套房',
  'Suite Luxueuse 3 Chambres Vue Lac au 55 Cooper St',
  'luxury-3br-lakeview-suite-55-cooper-st',
  'PUBLISHED', '44ae7a78-a4f8-4b26-9816-07d62d17b243',
  '55 Cooper St, Toronto',
  'CityPlace',
  'Toronto',
  'APARTMENT',
  3, 2, 1273,
  '3BR/2BA, approx. 1,200 sqft on 55+ floors. Fully inclusive: WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities. Building amenities include pool, gym, 24h concierge, visitor parking, and party room. Walk to Union Station in 8 min and Financial District in 5 min. 30-day minimum stay with smart-lock self check-in. Developed by Menkes, completed in 2024.',
  '3室2卫，约1,200 sqft，55层以上。全包：WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、每两周保洁及楼宇设施使用。楼宇配套：泳池、健身房、24小时礼宾、访客停车、Party Room。步行至Union Station约8分钟、金融区约5分钟。最低入住30天，智能门锁自助入住。开发商Menkes，2024年建成。',
  '3 chambres/2 salles de bain, env. 1 200 pi², étage 55+. Tout inclus : WiFi, services publics, câble de base, cuisine équipée, draps/serviettes, ménage bimensuel, accès aux commodités. Immeuble avec piscine, gym, concierge 24h, stationnement visiteurs et salle de réception. 8 min à pied d''Union Station, 5 min du quartier financier. Séjour minimum 30 jours, arrivée autonome par serrure intelligente. Développeur Menkes, livré en 2024.',
  12000, 10800, 9600, 'CAD',
  '["WiFi","Utilities included","Bi-weekly housekeeping","Smart lock self check-in","Full kitchenware","Linens and towels","Basic cable"]',
  '["Swimming pool","Fitness center","24h concierge","Visitor parking","Party room"]',
  30, '15:00', '11:00', 1,
  '[{"url":"/images/cooper-55-c5e8357d.jpg","alt":"55 Cooper Living Room","order":0},{"url":"/images/cooper-55-dining.jpg","alt":"55 Cooper Dining","order":1},{"url":"/images/cooper-55-e98a880d.jpg","alt":"55 Cooper View","order":2},{"url":"/images/cooper-55-a12c07ee.jpg","alt":"55 Cooper Bedroom","order":3}]',
  '/images/cooper-55-c5e8357d.jpg',
  'Luxury 3BR Lakeview Suite at 55 Cooper St | NEOS',
  '3BR/2BA luxury suite on 55+ floors at 55 Cooper St, Toronto. Lake views, pool, gym, 24h concierge. All-inclusive monthly rental.',
  datetime('now'), datetime('now')
) ON CONFLICT(id) DO UPDATE SET title=excluded.title, status='PUBLISHED', createdBy=COALESCE(NULLIF(trim(Property.createdBy),''), excluded.createdBy), updatedAt=datetime('now');

INSERT INTO Property (id, title, titleZh, titleFr, slug, status, createdBy, address, neighborhood, city, propertyType, bedrooms, bathrooms, sqft, description, descriptionZh, descriptionFr, priceMonthly, priceQuarterly, priceAnnual, currency, includedAmenities, buildingAmenities, minStayDays, checkInTime, checkOutTime, selfCheckIn, images, heroImage, metaTitle, metaDescription, createdAt, updatedAt)
VALUES (
  '2',
  'Modern 3BR at 238 Simcoe St',
  '238 Simcoe St 现代三居公寓',
  'Appartement Moderne 3 Chambres au 238 Simcoe St',
  'modern-3br-238-simcoe-st',
  'PUBLISHED', '44ae7a78-a4f8-4b26-9816-07d62d17b243',
  '238 Simcoe St, Toronto',
  'Entertainment District',
  'Toronto',
  'APARTMENT',
  3, 2, 1100,
  '3BR/2BA with all-inclusive utilities and services: WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities. Building amenities include gym, lobby concierge, and mail room. 3-minute walk to St. Patrick/Osgoode subway stations, and walkable to Toronto General, Mount Sinai, SickKids, and UofT. Minimum stay 30 days.',
  '3室2卫。全包服务：WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、每两周保洁及楼宇设施。楼宇配套：健身房、大堂礼宾、邮件室。步行3分钟可达St. Patrick/Osgoode地铁站，四大医院及UofT均可步行到达。最低入住30天。',
  '3 chambres/2 salles de bain. Tout inclus : WiFi, services publics, câble de base, cuisine équipée, draps/serviettes, ménage bimensuel et commodités de l''immeuble. Commodités : gym, concierge du hall et salle du courrier. À 3 min à pied du métro St. Patrick/Osgoode, proche à pied des principaux hôpitaux et de l''UofT. Séjour minimum 30 jours.',
  6500, 5850, 5200, 'CAD',
  '["WiFi","Utilities included","Bi-weekly housekeeping","Smart lock self check-in","Full kitchenware","Linens and towels","Basic cable"]',
  '["Fitness center","Lobby concierge","Mail room"]',
  30, '15:00', '11:00', 1,
  '[{"url":"/images/simcoe-238-kitchen.jpg","alt":"238 Simcoe Kitchen","order":0},{"url":"/images/simcoe-238-living.jpg","alt":"238 Simcoe Living Room","order":1},{"url":"/images/simcoe-238-1.jpg","alt":"238 Simcoe Bedroom","order":2},{"url":"/images/simcoe-238-bath1.jpg","alt":"238 Simcoe Bathroom","order":3}]',
  '/images/simcoe-238-kitchen.jpg',
  'Modern 3BR at 238 Simcoe St | NEOS',
  '3BR/2BA modern apartment at 238 Simcoe St, Toronto. Near hospitals and UofT. All-inclusive monthly rental.',
  datetime('now'), datetime('now')
) ON CONFLICT(id) DO UPDATE SET title=excluded.title, status='PUBLISHED', createdBy=COALESCE(NULLIF(trim(Property.createdBy),''), excluded.createdBy), updatedAt=datetime('now');

INSERT INTO Property (id, title, titleZh, titleFr, slug, status, createdBy, address, neighborhood, city, propertyType, bedrooms, bathrooms, sqft, description, descriptionZh, descriptionFr, priceMonthly, priceQuarterly, priceAnnual, currency, includedAmenities, buildingAmenities, minStayDays, checkInTime, checkOutTime, selfCheckIn, images, heroImage, metaTitle, metaDescription, createdAt, updatedAt)
VALUES (
  '3',
  'Cozy 1BR at 22 Wellesley St E',
  '22 Wellesley St E 温馨一居公寓',
  'Appartement Confortable 1 Chambre au 22 Wellesley St E',
  'cozy-1br-22-wellesley-st-e',
  'PUBLISHED', '44ae7a78-a4f8-4b26-9816-07d62d17b243',
  '22 Wellesley St E, Toronto',
  'Church-Wellesley',
  'Toronto',
  'APARTMENT',
  1, 1, 550,
  '1BR/1BA with all-inclusive utilities and services: WiFi, hydro/water/gas/heating, full kitchenware, linens/towels, and building amenities. Steps to Wellesley subway station. Walking distance to UofT, hospitals, and Yonge Street shops. Minimum stay 30 days.',
  '1室1卫。全包服务：WiFi、水电气暖、全套厨具、床品毛巾及楼宇设施。步行可达Wellesley地铁站，近UofT、医院及Yonge街商圈。最低入住30天。',
  '1 chambre/1 salle de bain. Tout inclus : WiFi, services publics, cuisine équipée, draps/serviettes et commodités. À quelques pas du métro Wellesley. Proche de l''UofT et des commerces de Yonge Street. Séjour minimum 30 jours.',
  3500, 3150, 2800, 'CAD',
  '["WiFi","Utilities included","Full kitchenware","Linens and towels","In-unit laundry"]',
  '["Fitness center","Lobby concierge"]',
  30, '15:00', '11:00', 1,
  '[{"url":"/images/wellesley-1607-living.jpg","alt":"Wellesley Living Room","order":0},{"url":"/images/wellesley-1607-kitchen.jpg","alt":"Wellesley Kitchen","order":1},{"url":"/images/wellesley-1607-bedroom.jpg","alt":"Wellesley Bedroom","order":2},{"url":"/images/wellesley-1607-bath.jpg","alt":"Wellesley Bathroom","order":3}]',
  '/images/wellesley-1607-living.jpg',
  'Cozy 1BR at 22 Wellesley St E | NEOS',
  '1BR/1BA cozy apartment at 22 Wellesley St E, Toronto. Near Wellesley subway and UofT. All-inclusive monthly rental.',
  datetime('now'), datetime('now')
) ON CONFLICT(id) DO UPDATE SET title=excluded.title, status='PUBLISHED', createdBy=COALESCE(NULLIF(trim(Property.createdBy),''), excluded.createdBy), updatedAt=datetime('now');
