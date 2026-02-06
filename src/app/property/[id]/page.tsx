// Property Detail Page - Server Component for Static Export
import { mockProperties, getPropertyById } from "@/lib/data";
import PropertyDetailClient from "./PropertyDetailClient";
import BackToHomeButton from "@/components/navigation/BackToHomeButton";
import { notFound } from "next/navigation";

// Generate static params for all properties - required for static export
export function generateStaticParams() {
  return mockProperties.map((property) => ({
    id: property.id,
  }));
}

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
  
  return (
    <>
      <PropertyDetailClient propertyId={params.id} />
      <BackToHomeButton />
    </>
  );
}
