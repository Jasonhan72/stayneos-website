import { Metadata } from 'next';
import {
  HeroSection,
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
  title: 'StayNeos - 高端行政公寓出租',
  description: '专为商务人士打造的高端行政公寓平台，提供灵活的租期和优质的居住体验。精选全球主要城市优质地段，拎包入住，24小时管家服务。',
  keywords: ['行政公寓', '高端公寓', '商务公寓', '短租公寓', '灵活租期'],
  openGraph: {
    title: 'StayNeos - 高端行政公寓',
    description: '专为商务人士打造的高端行政公寓平台',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
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
