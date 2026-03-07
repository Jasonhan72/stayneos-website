"use client";

import React, { useState } from "react";
import { Container, Section } from "@/components/ui";
import { 
  MapPin, 
  Train, 
  Coffee, 
  ShoppingBag, 
  TreePine,
  Building2,
  Star,
  DollarSign,
  Clock,
  Users,
  Car,
  Plane,
  type LucideIcon
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Neighborhood {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  transportation: string[];
  averagePrice: {
    studio: number;
    oneBed: number;
    twoBed: number;
  };
  highlights: {
    icon: LucideIcon;
    text: string;
  }[];
  imageUrl: string;
  popularWith: string[];
}

export default function NeighborhoodsPageContent() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const neighborhoods: Neighborhood[] = [
    {
      id: "downtown",
      name: "Downtown Core",
      tagline: "The heart of Toronto's business district",
      description: "Perfect for executives who want to be in the center of it all. Walking distance to major corporate headquarters, financial district, and world-class dining and entertainment.",
      features: [
        "Financial District proximity",
        "PATH underground network access",
        "Premium dining & nightlife",
        "Cultural attractions nearby",
        "24/7 urban energy"
      ],
      transportation: [
        "Union Station (GO, VIA, UP Express)",
        "King, Queen, St. Andrew TTC stations",
        "Multiple streetcar lines",
        "Walking distance to business core"
      ],
      averagePrice: {
        studio: 2800,
        oneBed: 3500,
        twoBed: 4800
      },
      highlights: [
        { icon: Building2, text: "Business District Core" },
        { icon: Train, text: "Transit Hub Access" },
        { icon: Coffee, text: "Premium Dining" },
        { icon: Users, text: "Corporate Networking" }
      ],
      imageUrl: "/images/neighborhoods/downtown.jpg",
      popularWith: ["Executives", "Finance Professionals", "Business Travelers"]
    },
    {
      id: "yorkville",
      name: "Yorkville",
      tagline: "Toronto's most prestigious neighborhood",
      description: "Luxury living at its finest. Home to high-end boutiques, Michelin-starred restaurants, and some of Toronto's most exclusive residential buildings. Perfect for C-suite executives.",
      features: [
        "Luxury shopping on Bloor Street",
        "Fine dining establishments", 
        "High-end galleries and museums",
        "Exclusive residential towers",
        "Royal Ontario Museum vicinity"
      ],
      transportation: [
        "Bay and Bloor-Yonge subway stations",
        "Direct downtown connectivity",
        "Premium taxi/ride-share access",
        "Walking distance to business areas"
      ],
      averagePrice: {
        studio: 3200,
        oneBed: 4200,
        twoBed: 6000
      },
      highlights: [
        { icon: Star, text: "Luxury Living" },
        { icon: ShoppingBag, text: "High-End Shopping" },
        { icon: Coffee, text: "Fine Dining" },
        { icon: Building2, text: "Prestigious Address" }
      ],
      imageUrl: "/images/neighborhoods/yorkville.jpg",
      popularWith: ["C-Suite Executives", "International Clients", "Luxury Travelers"]
    },
    {
      id: "liberty-village",
      name: "Liberty Village",
      tagline: "Modern living with urban convenience",
      description: "A vibrant, modern neighborhood popular with young professionals and creative industries. Excellent dining scene, trendy bars, and convenient transit connections to downtown.",
      features: [
        "Modern condo developments",
        "Trendy restaurants and bars",
        "Close to Exhibition Place",
        "Growing tech hub",
        "Waterfront proximity"
      ],
      transportation: [
        "Liberty Village GO Station",
        "King Street streetcar",
        "Direct downtown access",
        "Bike-friendly infrastructure"
      ],
      averagePrice: {
        studio: 2400,
        oneBed: 3000,
        twoBed: 4200
      },
      highlights: [
        { icon: Users, text: "Young Professionals" },
        { icon: Coffee, text: "Trendy Scene" },
        { icon: Train, text: "GO Station Access" },
        { icon: TreePine, text: "Parks Nearby" }
      ],
      imageUrl: "/images/neighborhoods/liberty-village.jpg",
      popularWith: ["Young Professionals", "Tech Workers", "Creative Industries"]
    },
    {
      id: "midtown",
      name: "Midtown",
      tagline: "Perfect balance of urban and residential",
      description: "Offers the perfect blend of city convenience and neighborhood charm. Great for families and professionals who want easy access to downtown while enjoying a more relaxed atmosphere.",
      features: [
        "Mix of high-rises and low-rises",
        "Excellent schools nearby",
        "Diverse dining options",
        "Parks and recreational facilities",
        "Strong community feel"
      ],
      transportation: [
        "Multiple subway lines (Yonge-Eglinton)",
        "Excellent bus connectivity",
        "15-20 minutes to downtown",
        "Bike lanes and paths"
      ],
      averagePrice: {
        studio: 2200,
        oneBed: 2800,
        twoBed: 3800
      },
      highlights: [
        { icon: Users, text: "Family Friendly" },
        { icon: TreePine, text: "Green Spaces" },
        { icon: Train, text: "Subway Access" },
        { icon: Building2, text: "Mixed Housing" }
      ],
      imageUrl: "/images/neighborhoods/midtown.jpg",
      popularWith: ["Families", "Mid-Level Professionals", "Relocating Employees"]
    },
    {
      id: "north-york",
      name: "North York",
      tagline: "Suburban feel with urban amenities",
      description: "Toronto's secondary business district offering modern amenities, excellent shopping, and a more suburban feel while maintaining excellent connectivity to downtown Toronto.",
      features: [
        "Major office complexes",
        "Large shopping centers",
        "Spacious apartments",
        "Good parking availability",
        "Cultural centers and recreation"
      ],
      transportation: [
        "North York Centre subway hub",
        "Express bus routes",
        "25-30 minutes to downtown",
        "Ample parking spaces"
      ],
      averagePrice: {
        studio: 1900,
        oneBed: 2400,
        twoBed: 3200
      },
      highlights: [
        { icon: Car, text: "Parking Available" },
        { icon: ShoppingBag, text: "Major Shopping" },
        { icon: Building2, text: "Office District" },
        { icon: DollarSign, text: "Value Pricing" }
      ],
      imageUrl: "/images/neighborhoods/north-york.jpg",
      popularWith: ["Corporate Teams", "Budget-Conscious Travelers", "Suburban Preference"]
    },
    {
      id: "waterfront",
      name: "Waterfront",
      tagline: "Luxury living with stunning lake views",
      description: "Toronto's newest and most exciting neighborhood featuring ultra-modern condos with breathtaking lake views. Perfect for executives who appreciate luxury and scenic beauty.",
      features: [
        "Stunning lake and city views",
        "Ultra-modern buildings",
        "Waterfront trails and parks",
        "High-end amenities",
        "Growing dining scene"
      ],
      transportation: [
        "Union Station proximity",
        "Harbourfront streetcar",
        "Water taxi services",
        "Downtown walking distance"
      ],
      averagePrice: {
        studio: 2900,
        oneBed: 3800,
        twoBed: 5200
      },
      highlights: [
        { icon: Star, text: "Lake Views" },
        { icon: Building2, text: "Modern Living" },
        { icon: TreePine, text: "Waterfront Parks" },
        { icon: Plane, text: "Airport Access" }
      ],
      imageUrl: "/images/neighborhoods/waterfront.jpg",
      popularWith: ["Luxury Travelers", "International Executives", "View Seekers"]
    }
  ];

  const categories = [
    { id: "all", name: "All Neighborhoods", icon: MapPin },
    { id: "business", name: "Business Districts", icon: Building2 },
    { id: "luxury", name: "Luxury Living", icon: Star },
    { id: "value", name: "Value Options", icon: DollarSign }
  ];

  const getFilteredNeighborhoods = () => {
    if (selectedCategory === "all") return neighborhoods;
    if (selectedCategory === "business") return neighborhoods.filter(n => ["downtown", "north-york"].includes(n.id));
    if (selectedCategory === "luxury") return neighborhoods.filter(n => ["yorkville", "waterfront"].includes(n.id));
    if (selectedCategory === "value") return neighborhoods.filter(n => ["midtown", "north-york", "liberty-village"].includes(n.id));
    return neighborhoods;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("neighborhoods.hero.title", "Toronto Neighborhoods Guide")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("neighborhoods.hero.subtitle", "Discover the perfect neighborhood for your Toronto stay. From the bustling Financial District to trendy Liberty Village, find your ideal location with insider insights on transit, amenities, and pricing.")}
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Downtown Core</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Yorkville</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Liberty Village</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Midtown</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Waterfront</span>
            </div>
          </div>
        </Container>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </Section>

      {/* Filter Section */}
      <Section className="py-12 bg-white border-b border-gray-200">
        <Container>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <category.icon size={18} />
                {category.name}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Neighborhoods Grid */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {getFilteredNeighborhoods().map((neighborhood) => (
              <div key={neighborhood.id} className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                {/* Neighborhood Image */}
                <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{neighborhood.name}</h3>
                    <p className="text-blue-100">{neighborhood.tagline}</p>
                  </div>
                  {/* Placeholder for actual image */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    <MapPin size={16} className="inline mr-1" />
                    Toronto
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {neighborhood.description}
                  </p>

                  {/* Popular With */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Popular with:</h4>
                    <div className="flex flex-wrap gap-2">
                      {neighborhood.popularWith.map((group, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Highlights:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {neighborhood.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600">
                          <highlight.icon size={16} className="text-blue-600" />
                          <span className="text-sm">{highlight.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {neighborhood.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Transportation */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Train size={16} className="text-blue-600" />
                      Transportation:
                    </h4>
                    <ul className="space-y-1">
                      {neighborhood.transportation.slice(0, 2).map((transport, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {transport}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      Average Monthly Pricing:
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${neighborhood.averagePrice.studio.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Studio</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${neighborhood.averagePrice.oneBed.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">1 Bedroom</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${neighborhood.averagePrice.twoBed.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">2 Bedroom</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 pt-6 border-t">
                    <button className="w-full bg-blue-600 text-white py-3 px-6 font-semibold hover:bg-blue-700 transition-colors duration-200">
                      {t("neighborhoods.cta", "View Properties in")} {neighborhood.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Quick Facts Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("neighborhoods.facts.title", "Toronto Quick Facts")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("neighborhoods.facts.subtitle", "Essential information for executive travelers and business professionals.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600">Most offices operate 9 AM - 5 PM EST</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Plane size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Airport Access</h3>
              <p className="text-gray-600">45-60 min to Pearson via UP Express</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Train size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Public Transit</h3>
              <p className="text-gray-600">Extensive subway, streetcar & bus network</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Coffee size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business Culture</h3>
              <p className="text-gray-600">Professional, multicultural environment</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("neighborhoods.cta.title", "Ready to Find Your Perfect Toronto Home?")}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t("neighborhoods.cta.subtitle", "Browse our curated selection of executive apartments in these premium Toronto neighborhoods.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200">
                {t("neighborhoods.cta.browse", "Browse All Properties")}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                {t("neighborhoods.cta.contact", "Contact Our Team")}
              </button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}