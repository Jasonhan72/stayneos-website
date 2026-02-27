// Property Detail Page - Static data mode
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import PropertyDetailClient from "./PropertyDetailClient";
import { mockProperties, getPropertyById } from "@/lib/data";

interface PageProps {
  params: {
    id: string;
  };
}

// Required for static export
export function generateStaticParams() {
  return mockProperties.map(p => ({ id: p.id }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = getPropertyById(params.id);
  
  if (!property) {
    return { title: 'Property Not Found | StayNeos' };
  }
  
  return {
    title: `${property.title} | StayNeos`,
    description: property.description?.slice(0, 160) || '',
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 160) || '',
      images: property.images?.[0] ? [property.images[0]] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }
  
  return <PropertyDetailClient propertyId={params.id} />;
}
