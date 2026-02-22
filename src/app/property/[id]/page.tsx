// Property Detail Page - Static Export
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import PropertyDetailClient from "./PropertyDetailClient";
import { mockProperties } from "@/lib/data";

interface PageProps {
  params: {
    id: string;
  };
}

// Generate static params
export function generateStaticParams() {
  return mockProperties.map((p) => ({ id: p.id }));
}

// Generate metadata
export function generateMetadata({ params }: PageProps): Metadata {
  const property = mockProperties.find(p => p.id === params.id);
  if (!property) return { title: 'Property Not Found' };
  
  return {
    title: `${property.title} | StayNeos`,
    description: property.description || '',
  };
}

export default function PropertyDetailPage({ params }: PageProps) {
  const property = mockProperties.find(p => p.id === params.id);
  
  if (!property) {
    notFound();
  }
  
  return <PropertyDetailClient propertyId={params.id} />;
}
