import { getPropertyById } from "@/lib/data";

export interface PropertySnapshot {
  id: string;
  title: string;
  address: string;
  city: string;
  description: string | undefined;
  images: { url: string; alt: string | null }[];
  amenities: { amenity: { name: string; icon: string | null } }[];
}

export function getPropertySnapshot(propertyId: string): PropertySnapshot | null {
  const property = getPropertyById(propertyId);

  if (!property) {
    // Return a minimal fallback so the booking detail page doesn't crash
    return {
      id: propertyId,
      title: "StayNeos home",
      address: "Toronto",
      city: "Toronto",
      description: undefined,
      images: [],
      amenities: [],
    };
  }

  return {
    id: property.id,
    title: property.title,
    address: property.location,
    city: "Toronto",
    description: property.description,
    images: property.images.map((url, index) => ({
      url,
      alt: `${property.title} image ${index + 1}`,
    })),
    amenities: property.amenities.map((name) => ({
      amenity: {
        name,
        icon: null,
      },
    })),
  };
}

