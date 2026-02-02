import { mockProperties } from "@/lib/data";

// Generate static params for all properties
export async function generateStaticParams() {
  return mockProperties.map((property) => ({
    id: property.id,
  }));
}

// Import and render the client component
import PropertyDetailClient from "./PropertyDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <PropertyDetailClient params={params} />;
}
