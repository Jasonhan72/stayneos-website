import { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'About Us | NEOS',
  description: 'Learn about NEOS mission, story, and commitment to providing premium executive apartments in major cities worldwide.',
  keywords: ['About NEOS', 'Company', 'Mission', 'Premium Apartments'],
  openGraph: {
    title: 'About NEOS - Premium Executive Apartments',
    description: 'Learn about NEOS mission, story, and commitment',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
