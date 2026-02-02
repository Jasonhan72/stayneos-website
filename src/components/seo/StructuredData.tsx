import Script from "next/script";
import { Property } from "@/components/property/PropertyCard";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "StayNeos",
  url = "https://stayneos.com",
  logo = "https://stayneos.com/logo.png",
  description = "专为商务人士打造的高端行政公寓平台",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [
      "https://weibo.com/stayneos",
      "https://mp.weixin.qq.com/s/stayneos",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+86-400-XXX-XXXX",
      contactType: "customer service",
      availableLanguage: ["Chinese", "English"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

export function WebSiteSchema({
  name = "StayNeos",
  url = "https://stayneos.com",
  searchUrl = "https://stayneos.com/properties?q={search_term_string}",
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
      strategy="beforeInteractive"
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
  name = "StayNeos",
  description = "高端行政公寓出租平台",
  url = "https://stayneos.com",
  telephone = "+86-400-XXX-XXXX",
  address = {
    streetAddress: "南京西路1788号",
    addressLocality: "上海市静安区",
    addressRegion: "上海",
    postalCode: "200040",
    addressCountry: "CN",
  },
  geo = {
    latitude: 31.2304,
    longitude: 121.4737,
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
    image: "https://stayneos.com/og-image.jpg",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "600",
    },
  };

  return (
    <Script
      id="localbusiness-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

interface PropertySchemaProps {
  property: Property;
  baseUrl?: string;
}

export function PropertySchema({
  property,
  baseUrl = "https://stayneos.com",
}: PropertySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingReservation",
    name: property.title,
    description: `${property.title}，位于${property.location}，面积${property.area}平方米，可容纳${property.maxGuests}人`,
    url: `${baseUrl}/properties/${property.id}`,
    image: property.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressCountry: "CN",
    },
    priceRange: `¥${property.price}/${property.priceUnit}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: property.rating,
      reviewCount: property.reviewCount,
    },
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
      unitCode: "MTK",
    },
  };

  return (
    <Script
      id={`property-schema-${property.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
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
      strategy="beforeInteractive"
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
      strategy="beforeInteractive"
    />
  );
}
