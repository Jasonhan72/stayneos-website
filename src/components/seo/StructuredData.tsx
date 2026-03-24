import Script from "next/script";
import { Property } from "@/components/property/PropertyCard";
import { toMonthlyListingPrice } from "@/lib/utils/property-transform";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "NEOS",
  url = "https://neos.rentals",
  logo = "https://neos.rentals/logo.png",
  description = "Premium furnished apartment platform for business professionals",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [
      "https://x.com/stayneos",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-647-862-6518",
      contactType: "customer service",
      availableLanguage: ["Chinese", "English", "French"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

export function WebSiteSchema({
  name = "NEOS",
  url = "https://neos.rentals",
  searchUrl = "https://neos.rentals/properties?q={search_term_string}",
}: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = "NEOS",
  description = "Premium furnished apartment rental platform",
  url = "https://neos.rentals",
  telephone = "+1-647-862-6518",
  address = {
    streetAddress: "20 Upjohn Rd",
    addressLocality: "North York",
    addressRegion: "ON",
    postalCode: "M3B 2V9",
    addressCountry: "CA",
  },
  geo = {
    latitude: 43.7503,
    longitude: -79.3456,
  },
  openingHours = ["Mo-Su 00:00-23:59"],
  priceRange = "$$$",
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name,
    description,
    url,
    telephone,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    geo: {
      "@type": "GeoCoordinates",
      ...geo,
    },
    openingHoursSpecification: openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(" ")[0].split("-"),
      opens: hours.split(" ")[1].split("-")[0],
      closes: hours.split(" ")[1].split("-")[1],
    })),
    priceRange,
    image: "https://neos.rentals/og-image.jpg",
  };

  return (
    <Script
      id="localbusiness-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface PropertySchemaProps {
  property: Property;
  baseUrl?: string;
}

export function PropertySchema({
  property,
  baseUrl = "https://neos.rentals",
}: PropertySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingReservation",
    name: property.title,
    description: `${property.title} in ${property.location}, ${property.area} sqft, up to ${property.maxGuests} guests`,
    url: `${baseUrl}/property/${property.id}`,
    image: property.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressCountry: "CA",
    },
    priceRange: `From $${toMonthlyListingPrice(property.price, property.priceUnit)}/mo`,
    amenityFeature: property.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    numberOfRooms: property.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      value: property.maxGuests,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "FTK",
    },
  };

  if (property.reviewCount > 0) {
    Object.assign(schema, {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: property.rating,
        reviewCount: property.reviewCount,
      },
    });
  }

  return (
    <Script
      id={`property-schema-${property.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: {
    name: string;
    item: string;
  }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  questions: {
    question: string;
    answer: string;
  }[];
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
