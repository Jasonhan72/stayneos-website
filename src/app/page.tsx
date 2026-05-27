import { Metadata } from 'next';
import {
  HeroSection,
  DualPathCTASection,
  TrustBadgesSection,
  FeaturedPropertiesSection,
  CitiesSection,
  ValuePropositionSection,
  TestimonialsSection,
  MarketSegmentsSection,
  HowItWorksSection,
  CTASection
} from '@/components/home';
import { StructuredData } from '@/components/seo/StructuredData';
import { getOgLocale, resolveRequestLocale } from '@/lib/i18n-server';

const homeMetadata = {
  en: {
    title: 'NEOS | Premium Furnished Apartments in Downtown Toronto',
    description: "Move-in ready furnished apartments in Toronto's best neighborhoods. 30 days to 12 months. Corporate housing, relocation, and extended stays.",
  },
  zh: {
    title: 'NEOS | 多伦多高端精装公寓',
    description: '探索多伦多核心社区可立即入住的精装公寓。租期灵活，适合企业住房、搬迁安置与中长期入住。',
  },
  fr: {
    title: 'NEOS | Appartements meubles haut de gamme a Toronto',
    description: 'Decouvrez des appartements meubles prets a emmenager dans les meilleurs quartiers de Toronto. Sejours de 30 jours a 12 mois pour mobilite, affaires et relocalisation.',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const current = homeMetadata[locale];

  return {
    title: current.title,
    description: current.description,
    alternates: {
      canonical: '/',
      languages: {
        'en-CA': '/',
        'fr-CA': '/',
        'zh-CN': '/',
        'x-default': '/',
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: '/',
      locale: getOgLocale(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: current.title,
      description: current.description,
    },
  };
}

export const revalidate = 3600;

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <StructuredData pageType="homepage" />
      <HeroSection />
      <DualPathCTASection />
      <TrustBadgesSection />
      <FeaturedPropertiesSection />
      <CitiesSection />
      <ValuePropositionSection />
      <TestimonialsSection />
      <MarketSegmentsSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
