'use client';

import { useTranslations } from 'next-intl';

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
  locale: string;
}

export function StructuredData({ pageType = 'homepage', propertyData, locale }: StructuredDataProps) {
  const t = useTranslations('metadata');

  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'NEOS Executive Apartments',
    description: t('description', { defaultValue: 'Premium executive apartment rentals in downtown Toronto' }),
    url: 'https://neos.rentals',
    logo: 'https://neos.rentals/logo.png',
    telephone: '+1-647-862-6518',
    email: 'hello@neos.rentals',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '20 Upjohn Rd',
      addressLocality: 'North York',
      addressRegion: 'ON',
      postalCode: 'M3B 2V9',
      addressCountry: 'CA'
    },
    sameAs: [
      'https://facebook.com/stayneos',
      'https://instagram.com/stayneos',
      'https://twitter.com/stayneos',
      'https://linkedin.com/company/stayneos'
    ],
    priceRange: '$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    ]
  };

  let pageSpecificData = {};

  switch (pageType) {
    case 'property':
      if (propertyData) {
        pageSpecificData = {
          '@type': 'SingleFamilyResidence',
          name: propertyData.name,
          description: propertyData.description,
          image: propertyData.image,
          address: {
            '@type': 'PostalAddress',
            streetAddress: propertyData.address
          },
          numberOfRooms: propertyData.numberOfRooms,
          offers: {
            '@type': 'Offer',
            price: propertyData.price,
            priceCurrency: 'CAD',
            availability: 'https://schema.org/InStock',
            url: typeof window !== 'undefined' ? window.location.href : 'https://neos.rentals'
          }
        };
      }
      break;
    case 'business':
      pageSpecificData = {
        '@type': 'Service',
        serviceType: 'Corporate Housing',
        provider: {
          '@type': 'Organization',
          name: 'NEOS Corporate Solutions'
        }
      };
      break;
    case 'about':
      pageSpecificData = {
        '@type': 'AboutPage',
        mainEntity: {
          '@type': 'Organization',
          name: 'NEOS',
          foundingDate: '2024',
          founder: {
            '@type': 'Person',
            name: 'NEOS Team'
          }
        }
      };
      break;
    default:
      // homepage
      pageSpecificData = {
        '@type': 'WebSite',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://neos.rentals/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
  }

  const structuredData = {
    ...baseData,
    ...pageSpecificData,
    inLanguage: locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-CA' : 'en-CA'
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}