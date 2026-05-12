import type { Metadata } from 'next';
import PropertiesPageClient from '@/components/pages/PropertiesPageClient';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse fully furnished premium rentals from NEOS.',
  alternates: { canonical: '/properties' },
  openGraph: { title: 'NEOS Properties', description: 'Browse fully furnished premium rentals from NEOS.', url: '/properties' },
  twitter: { card: 'summary_large_image', title: 'NEOS Properties', description: 'Browse fully furnished premium rentals from NEOS.' },
};

export const revalidate = 3600;

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
