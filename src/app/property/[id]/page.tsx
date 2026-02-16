// Property Detail Page - Static Export
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import PropertyDetailClient from "./PropertyDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

// Property data
const properties = [
  {
    id: "1",
    title: "Cooper St Luxury Lakeview Apartment",
    location: "55 Cooper St, Toronto, ON M5E 0G1",
    price: 680,
    priceUnit: "night",
    rating: 4.9,
    reviewCount: 42,
    images: ["/images/cooper-55-c5e8357d.jpg"],
    maxGuests: 6,
    area: 111,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["WiFi","Air Conditioning","Washer","Kitchen","Lake View","Parking","24/7 Security"],
    description: "Located in the heart of downtown Toronto with stunning views of Lake Ontario.",
    minNights: 28,
    monthlyDiscount: 20
  },
  {
    id: "2",
    title: "Simcoe St High-rise Boutique Apartment",
    location: "238 Simcoe St, Toronto, ON M5S 1T4",
    price: 450,
    priceUnit: "night",
    rating: 4.8,
    reviewCount: 38,
    images: ["/images/simcoe-238-living.jpg"],
    maxGuests: 5,
    area: 102,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi","Air Conditioning","Washer","Kitchen","City View","24/7 Security","Bathtub"],
    description: "A high-rise apartment in downtown Toronto offering beautiful city skyline views.",
    minNights: 28,
    monthlyDiscount: 20
  }
];

// Generate static params
export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

// Generate metadata
export function generateMetadata({ params }: PageProps): Metadata {
  const property = properties.find(p => p.id === params.id);
  if (!property) return { title: 'Property Not Found' };
  
  return {
    title: `${property.title} | StayNeos`,
    description: property.description,
  };
}

export default function PropertyDetailPage({ params }: PageProps) {
  const property = properties.find(p => p.id === params.id);
  
  if (!property) {
    notFound();
  }
  
  return <PropertyDetailClient propertyId={params.id} />;
}
