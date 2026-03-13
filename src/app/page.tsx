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

export const metadata: Metadata = {
  title: 'NEOS | Premium Furnished Apartments in Downtown Toronto',
  description: "Move-in ready furnished apartments in Toronto's best neighborhoods. 30 days to 12 months. Corporate housing, relocation, and extended stays.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
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
