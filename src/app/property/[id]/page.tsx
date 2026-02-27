// Property Detail Page - 使用真实 API
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import PropertyDetailClient from "./PropertyDetailClient";
import { apiClient } from "@/lib/api-client";
import { Property } from "@/types";

interface PageProps {
  params: {
    id: string;
  };
}

// Required for static export - returns empty array for dynamic routes
export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

// 获取房源数据（用于 generateMetadata）
async function getProperty(id: string): Promise<Property | null> {
  try {
    return await apiClient.get<Property>(`/api/properties/${id}`);
  } catch {
    return null;
  }
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getProperty(params.id);
  
  if (!property) {
    return { title: 'Property Not Found | StayNeos' };
  }
  
  return {
    title: `${property.title} | StayNeos`,
    description: property.shortDesc || property.description?.slice(0, 160) || '',
    openGraph: {
      title: property.title,
      description: property.shortDesc || property.description?.slice(0, 160) || '',
      images: property.images?.[0]?.url ? [property.images[0].url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getProperty(params.id);
  
  if (!property) {
    notFound();
  }
  
  return <PropertyDetailClient propertyId={params.id} initialProperty={property} />;
}
