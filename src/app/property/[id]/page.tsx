// Property Detail Page - Dynamic Server Component
import { getPropertyById } from "@/lib/data";
import PropertyDetailClient from "./PropertyDetailClient";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';
import { getLocalizedTitle, getLocalizedDescription } from "@/components/property/PropertyCard";

// Force dynamic rendering to support i18n based on user locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailPage({ params }: PageProps) {
  const property = getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }
  
  // Get locale from middleware header (detects from cookie or browser Accept-Language)
  const headersList = headers();
  const locale = (headersList.get('x-locale') as 'en' | 'fr' | 'zh') || 'en';
  
  // Pre-localize property data for SSR to ensure hydration consistency
  const localizedProperty = {
    ...property,
    title: getLocalizedTitle(property, locale),
    description: getLocalizedDescription(property, locale),
  };
  
  return (
    <PropertyDetailClient 
      propertyId={params.id} 
      initialProperty={localizedProperty}
      initialLocale={locale}
    />
  );
}