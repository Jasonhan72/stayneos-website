'use client';

import { useI18n } from '@/lib/i18n';

interface StructuredDataProps {
  pageType?: 'homepage' | 'property' | 'business' | 'about';
  propertyData?: {
    name: string;
    description: string;
    image: string;
    price: string;
    address: string;
    numberOfRooms: number;
  };
}

export function StructuredData({ pageType = 'homepage', propertyData }: StructuredDataProps) {
  const { t } = useI18n();

  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'NEOS Executive Apartments',
    description: t('metadata.description', 'Premium executive apartment rentals in downtown Toronto'),
    url: 'https://neos.rentals',
    logo: 'https://neos.rentals/logo.png',
    telephone: '+1-647-446-7987',
    email: 'hello@neos.rentals',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '55 Cooper St',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      postalCode: 'M5V 3K8',
      addressCountry: 'CA'
    },
    sameAs: [
      'https://twitter.com/stayneos',
      'https://instagram.com/stayneos'
    ],
    priceRange: '$3,500 - $12,000/month',
    openingHours: 'Mo-Su 00:00-24:00',
    areaServed: {
      '@type': 'City',
      name: 'Toronto'
    }
  };

  let pageSpecificData = {};
  
  if (pageType === 'homepage') {
    pageSpecificData = {
      '@type': 'WebSite',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://neos.rentals/properties?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };
  } else if (pageType === 'property' && propertyData) {
    pageSpecificData = {
      '@type': 'Product',
      name: propertyData.name,
      description: propertyData.description,
      image: propertyData.image,
      offers: {
        '@type': 'Offer',
        price: propertyData.price,
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString().split('T')[0]
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: propertyData.address
      },
      numberOfRooms: propertyData.numberOfRooms
    };
  } else if (pageType === 'business') {
    pageSpecificData = {
      '@type': 'Service',
      serviceType: 'Corporate Housing',
      provider: baseData,
      areaServed: 'Greater Toronto Area',
      description: 'Premium furnished apartments for business professionals and corporate relocations'
    };
  }

  const structuredData = {
    ...baseData,
    ...pageSpecificData
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}