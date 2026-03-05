import { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'About Us | StayNeos',
  description: 'Learn about StayNeos mission, story, and commitment to providing premium executive apartments in major cities worldwide.',
  keywords: ['About StayNeos', 'Company', 'Mission', 'Premium Apartments'],
  openGraph: {
    title: 'About StayNeos - Premium Executive Apartments',
    description: 'Learn about StayNeos mission, story, and commitment',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
