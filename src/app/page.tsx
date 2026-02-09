import { Metadata } from 'next';
import {
  HeroSection,
  ValuePropositionSection,
  MarketSegmentsSection,
  FeaturedPropertiesSection,
  HowItWorksSection,
  CTASection
} from '@/components/home';

export const metadata: Metadata = {
  title: 'StayNeos - 多伦多高端行政公寓出租',
  description: '专为商务人士打造的高端行政公寓平台，提供灵活的租期和优质的居住体验。精选多伦多最佳地段，拎包入住，24小时管家服务。',
  keywords: ['多伦多公寓出租', '高端公寓', '商务公寓', '短租公寓', '行政公寓'],
  openGraph: {
    title: 'StayNeos - 多伦多高端行政公寓',
    description: '专为商务人士打造的高端行政公寓平台',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedPropertiesSection />
      <ValuePropositionSection />
      <MarketSegmentsSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
